from minio import Minio
from ultralytics import YOLO
import onnxruntime as ort
import torch
import json
import cv2
import numpy as np
import os
import subprocess
from dotenv import load_dotenv
from falldetect import FallDetection
from auth_utils import make_request
from threading import Event, Thread
from collections import deque
from datetime import datetime, timedelta
from utils import is_running_on_raspberry_pi
from lost_objects import LostObjectManager
import uuid

load_dotenv()
lost_trigger_str=os.getenv('WARNING_TRIGGER_LOST')
lost_timmer_filter= os.getenv('TIME_FILTER_THRESHOLD')

MINIO_ACCESS_KEY = os.getenv('MINIO_ACCESS_KEY')
MINIO_SECRET_KEY = os.getenv('MINIO_SECRET_KEY')
MINIO_URL = os.getenv('MINIO_URL')
MINIO_SECURE = os.getenv('MINIO_SECURE')
NOTIFICATION_URL = os.getenv('NOTIFICATION_URL')
VIDEO_STREAMS_URL = os.getenv('VIDEO_STREAMS_URL')
MINIO_BUCKET_MODELS = os.getenv('MINIO_BUCKET_MODELS')
MINIO_BUCKET_NOTIFICATIONS = os.getenv('MINIO_BUCKET_NOTIFICATIONS')
LOWER_DETECTION_CONF = float(os.getenv('LOWER_DETECTION_CONF'))
HIGH_DETECTION_CONF_TRIGGER = float(os.getenv('HIGH_DETECTION_CONF_TRIGGER'))
NUMBER_OF_DETECTION_MATCHES = int(os.getenv('NUMBER_OF_DETECTION_MATCHES'))
WARNING_TRIGGER_CLASSES = [item.strip() for item in os.getenv('WARNING_TRIGGER_CLASSES', "").split(",")]
DISTANCE_SHOWING_CLASSES = [item.strip() for item in os.getenv('DISTANCE_SHOWING_CLASSES', "").split(",")]
LOST_OBJECT_CLASSES = [item.strip() for item in os.getenv('LOST_OBJECT_CLASSES', "").split(",")]
WARNING_TRIGGER_DISTANCE = float(os.getenv('WARNING_TRIGGER_DISTANCE', 0.6))
WARNING_TRIGGER_LOST = timedelta(hours=int(lost_trigger_str.split(":")[0]), minutes=int(lost_trigger_str.split(":")[1]), seconds=int(lost_trigger_str.split(":")[2]))
KNOWN_WIDTH = float(os.getenv('KNOWN_WIDTH'))
FOCAL_LENGTH = float(os.getenv('FOCAL_LENGTH'))
TIME_FILTER_THRESHOLD=timedelta(hours=int(lost_timmer_filter.split(":")[0]), minutes=int(lost_timmer_filter.split(":")[1]), seconds=int(lost_timmer_filter.split(":")[2]))
WIDTH_LOST_DEVIATION = float(os.getenv('WIDTH_LOST_DEVIATION'))
FRAME_BUFFER_SIZE = 150 # Number of frames to capture pre and post notification
MODEL_DIR = "models"

video_url_ready = Event()

class ModelHandler:

    def __init__(self):
        self.models = []
        self.vest_notified = False
        self.no_vest_notified = False
        self.fall_detector = None
        self.minio_client = Minio(
            MINIO_URL,
            access_key=MINIO_ACCESS_KEY,
            secret_key=MINIO_SECRET_KEY,
            secure=False if MINIO_SECURE == "false" else True
        )
        self.bucket_models = MINIO_BUCKET_MODELS
        self.bucket_notifications = MINIO_BUCKET_NOTIFICATIONS
        self.recording = set()
        self.video_writers = {}
        self.video_output_paths = {}
        self.video_ready_events = {}
        self.processed_video_names = {}
        self.video_urls = {}
        self.frame_buffer_pre = deque(maxlen=FRAME_BUFFER_SIZE)
        self.frame_buffer_post = {}
        self.frame_counters = {}
        self.modelTrackerBuffer = dict()
        self.warning_classes = WARNING_TRIGGER_CLASSES
        self.distance_classes = DISTANCE_SHOWING_CLASSES
        self.lost_object_buffer=dict()
        self.lost_objects = LOST_OBJECT_CLASSES
        self.onnx_sessions = {}                                         # Store ONNX sessions
        self.frame_buffers_onnx = {}                                    # Frame buffers for ONNX 
        self.sequence_length_onnx = 16                                  # Lenght of buffers of frames for inference for ONNX
        self.onnx_model_configs = {
            "violence.onnx": {"image_height": 128, "image_width": 128, "classes_list": ["non_violence", "violence"]},
            "example.onnx": {"image_height": 128, "image_width": 128, "classes_list": ["no_trigger_action", "trigger_action"]}
        }                                   # 
        self.notification_messages = {
            "warning": {
                "no-helmet": "Se ha detectado un trabajador sin casco",
                "no-vest": "Se ha detectado un trabajador sin chaleco",
                "clock": "testing notifications",
                "person": "INTRUSION",
                "fall": "Se ha detectado una caída",
                "violence": "Se ha detectado actitud violenta",
                "Fire": "Fuego detectado",
                "Smoke": "Alerta por humo",
                "weapon": "¡Arma detectada!"
            },
            "distance": {
                "no-helmet": "Trabajador sin casco a una distancia peligrosa",
                "no-vest": "Trabajador sin chaleco a una distancia peligrosa",
                "clock": "distance testing notifications",
                "person": "INTRUSION",
                "fall": "Se ha detectado una caída",
                "violence": "Se ha detectado actitud violenta",
                "Fire": "Fuego detectado muy cerca",
                "Smoke": "Alerta por humo en las proximidades",
                "weapon": "¡Arma detectada en las inmediaciones!"
            },
            "lost":{
                "laptop": "Encontrado portatil perdido",
                "cell phone": "Encontrado movil perdido",
                "suitcase":"Encontrado maletín perdido"
            }
        }
        self.type_messages = {
            "warning": {
                "no-helmet": "Notification",
                "no-vest": "Notification",
                "clock": "Notification",
                "person": "Warning",
                "fall": "Warning",
                "violence": "Warning",
                "Fire": "Warning",
                "Smoke": "Warning",
                "weapon": "Notification"
            },
            "distance": {
                "no-helmet": "Warning",
                "no-vest": "Warning",
                "clock": "Notification",
                "person": "Warning",
                "fall": "Warning",
                "violence": "Warning",
                "Fire": "Warning",
                "Smoke": "Warning",
                "weapon": "Notification"
            },
            "lost":{
                "laptop": "Notification",
                "cell phone": "Notification",
                "suitcase":"Notification"
            }
        }
        self.lost_object_manager = LostObjectManager(
            width_deviation=WIDTH_LOST_DEVIATION,
            time_filter_threshold=TIME_FILTER_THRESHOLD,
            warning_trigger_lost=WARNING_TRIGGER_LOST,
            lost_object_classes=LOST_OBJECT_CLASSES
        )

    def trakerHandler(self, newDetect,oldDetect,streamId,final_frame):
        filteredDetection=dict()
        fifo_list= deque(NUMBER_OF_DETECTION_MATCHES*[0],maxlen=NUMBER_OF_DETECTION_MATCHES)

        for detection in newDetect: #hace parse del nuevo new Detect
                filteredDetection[detection]={
                    newDetect[detection]["id"]:{"confArray":newDetect[detection]["conf"], "distance":newDetect[detection]["distance"] ,"AlarmTriggered":False, "DistanceAlarmTriggered":False}
                    }

        if not oldDetect:   
            return(filteredDetection)
        
        elif not newDetect:
            if streamId in self.frame_counters.keys():
                if self.frame_counters[streamId] < (NUMBER_OF_DETECTION_MATCHES*20):
                    self.frame_counters[streamId] +=1
                    return(oldDetect)
                else:
                    self.frame_counters[streamId]=0
                    return({})
            else:
                self.frame_counters[streamId]=0
                return(oldDetect)  
        
        else:
            for name in filteredDetection:          
                if name in oldDetect.keys():              
                    for id in filteredDetection[name]:
                        if id in oldDetect[name].keys(): 
                                if isinstance(oldDetect[name][id]["confArray"], float):
                                    fifo_list.append(oldDetect[name][id]["confArray"])
                                    fifo_list.append(filteredDetection[name][id]["confArray"])
                                    oldDetect[name][id]["confArray"]=fifo_list
                                else:
                                    oldDetect[name][id]["confArray"].append(filteredDetection[name][id]["confArray"])
                                    confMean = np.average(np.array(oldDetect[name][id]["confArray"]))
                                    if (name in self.warning_classes and
                                        confMean > HIGH_DETECTION_CONF_TRIGGER and not oldDetect[name][id]["AlarmTriggered"]):
                                        oldDetect[name][id]["AlarmTriggered"] = True
                                        recording_id = self.start_recording(final_frame)
                                        Thread(target=self.notify, args=(name, streamId, recording_id)).start()

                                    elif (name in self.distance_classes and filteredDetection[name][id]["distance"] < WARNING_TRIGGER_DISTANCE and
                                        not oldDetect[name][id]["DistanceAlarmTriggered"]):
                                        oldDetect[name][id]["DistanceAlarmTriggered"] = True
                                        recording_id = self.start_recording(final_frame)
                                        Thread(target=self.notify, args=(name, streamId, recording_id, True)).start()

                                filteredDetection[name][id]=oldDetect[name][id]

            return(filteredDetection)

    def calculate_distance(self, known_width, focal_length, per_width):
        return (known_width * focal_length) / per_width
    
    def download_model_from_minio(self, model_names):
        local_paths = []
        for model_name in model_names:
            if torch.cuda.is_available() and model_name.endswith('.pt'):
                model_name_without_extension = model_name.split('.pt')[0]
                model_name = f"{model_name_without_extension}.engine"
            local_path = os.path.join(MODEL_DIR, model_name)
            os.makedirs(os.path.dirname(local_path), exist_ok=True)

            if not os.path.exists(local_path):

                found = False
                objects = self.minio_client.list_objects(self.bucket_models, recursive=True)
                for obj in objects:
                    if obj.object_name.endswith(model_name):
                        try:
                            self.minio_client.fget_object(self.bucket_models, obj.object_name, local_path)
                            found = True
                            break
                        except Exception as e:
                            print(f"Failed to download {model_name} from {obj.object_name}: {e}")
                if not found:

                    if model_name.endswith('.pt'):
                        model_name = model_name.replace('.pt', '.engine')
                    else:
                        model_name = model_name.replace('.engine', '.pt')

                    local_path = os.path.join(MODEL_DIR, model_name)

                    if not os.path.exists(local_path):

                        objects = self.minio_client.list_objects(self.bucket_models, recursive=True)
                        for obj in objects:
                            if obj.object_name.endswith(model_name):
                                try:
                                    self.minio_client.fget_object(self.bucket_models, obj.object_name, local_path)
                                    print(f"Model {model_name} downloaded from MinIO and saved to {local_path}")
                                    found = True
                                    break
                                except Exception as e:
                                    print(f"Failed to download {model_name} from {obj.object_name}: {e}")
                    else:
                        found = True
                        print(f"Model {model_name} already exists in the system")

                if not found:
                    raise FileNotFoundError(f"Model {model_name} not found in any path within the bucket {self.bucket_models}.")
            else:
                print(f"Model {model_name} already exists in the system")

            local_paths.append(local_path)
        return local_paths

    def check_ncnn_conversion(self, model_name):
        ncnn_model_path = os.path.join(MODEL_DIR, model_name.replace('.pt', '_ncnn.bin'))
        return os.path.exists(ncnn_model_path)

    def convert_to_ncnn(self, model_name, model_path):
        if not self.check_ncnn_conversion(model_name):
            print(f"Convirtiendo {model_name} a formato NCNN...")
            model = YOLO(model_path)
            model.export(format='ncnn',imgsz=640)
            print(f"Model {model_name} converted to NCNN and saved in {MODEL_DIR}")
        else:
            print(f"The model {model_name} has already been converted to NCNN. No need to convert again.")

    def load_models(self, models_info):
        model_names = [info['model_name'] for info in models_info]
        print(f"Downloading models from MinIO: {model_names}")
        model_paths = self.download_model_from_minio(model_names)

        device = 'cuda' if torch.cuda.is_available() else 'cpu'
        print(f'Using device: {device}')

        for model_path in model_paths:
            for info in models_info:
                if info['model_name'].split('.')[0] == model_path.split('/')[-1].split('.')[0]:
                    
                    if info['model_name'].endswith(".onnx"):
                        print(f"Loading ONNX model: {model_path}")
                        self.onnx_sessions[info['model_name']] = ort.InferenceSession(model_path)

                        # Obtener la configuración del modelo desde self.onnx_model_configs
                        model_key = info['model_name']
                        config = self.onnx_model_configs.get(model_key, 
                            {"image_height": 224, "image_width": 224, "classes_list": ["class_0", "class_1"]}
                        )

                        continue  # Skip the YOLO set up


                    if info['model_name'].startswith("fall"):
                        print(f"Loading fall detection model: {model_path}")
                        self.fall_detector = FallDetection(model_path)
                        continue

                    print(f"Loading YOLO model: {model_path}")
                    model = YOLO(model_path)

                    if is_running_on_raspberry_pi():
                        ncnn_model_path = model_path.replace(".pt", "_ncnn_model")
                        if not os.path.exists(ncnn_model_path):
                            self.convert_to_ncnn(info['model_name'], model_path)
                        info['yolo_model'] = YOLO(ncnn_model_path)
                    # If a GPU is available, export the model to TensorRT and load it
                    elif device == 'cuda' and model_path.endswith('.pt'):
                        print(f"Exporting {info['model_name']} to TensorRT format...")
                        engine_path = model.export(format="engine", imgsz=480, dynamic=True, simplify=False, int8=False, batch=16)  # Export as .engine
                        # Load the exported TensorRT model
                        print(f"Loading TensorRT model from: {engine_path}")
                        trt_model = YOLO(engine_path)
                        # Assign the TensorRT model to the model dictionary
                        info['yolo_model'] = trt_model
                    elif device == 'cuda':
                        print(f"Using TensorRT model on GPU for {info['model_name']}")
                        info['yolo_model'] = model
                    else:
                        # If no GPU, move the PyTorch model to CPU
                        print(f"Using PyTorch model on CPU for {info['model_name']}")
                        model.to(device)
                        info['yolo_model'] = model
        self.models = models_info
        print(f"Models {model_names} loaded successfully")

    def start_recording(self, frame):
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_%f')
        video_output_path = os.path.join('videos', f'recording_{timestamp}.mp4')
        os.makedirs(os.path.dirname(video_output_path), exist_ok=True)
        height, width, _ = frame.shape
        video_writer = cv2.VideoWriter(video_output_path, cv2.VideoWriter_fourcc(*'mp4v'), 30, (width, height))
        self.video_writers[timestamp] = video_writer
        self.video_output_paths[timestamp] = video_output_path
        self.video_ready_events[timestamp] = Event()
        self.recording.add(timestamp)
        self.frame_buffer_post[timestamp] = deque()
        self.frame_counters[timestamp] = 0
        
        self.write_from_buffer(self.frame_buffer_pre, video_writer)
        return timestamp

    def write_from_buffer(self, buffer, output):
        while len(buffer) > 0:
            buffered_frame = buffer.popleft()
            output.write(buffered_frame)

    def process_video(self, recording_id):
        processed_video_path = self.video_output_paths[recording_id].replace('.mp4', '_processed.mp4')
        self.processed_video_names[recording_id] = os.path.basename(processed_video_path)

        command = [
            'ffmpeg',
            '-i', self.video_output_paths[recording_id],
            '-c:v', 'libx264',
            '-preset', 'slow',
            '-crf', '22',
            '-c:a', 'copy',
            processed_video_path
        ]

        try:
            subprocess.run(command, check=True)
            print(f"Video processed and saved to {processed_video_path}")
            self.video_output_paths[recording_id] = processed_video_path
        except subprocess.CalledProcessError as e:
            print(f"Failed to process video: {e}")

    def stop_recording(self, recording_id):
        if recording_id in self.video_writers and self.video_writers[recording_id]:
            self.write_from_buffer(self.frame_buffer_post[recording_id], self.video_writers[recording_id])
            self.video_writers[recording_id].release()
            del self.video_writers[recording_id]
            self.recording.remove(recording_id)
            del self.frame_buffer_post[recording_id]
            del self.frame_counters[recording_id]

        self.process_video(recording_id)
        Thread(target=self.upload_video_to_minio, args=(recording_id,)).start()

    def upload_video_to_minio(self, recording_id):
        try:
            with open(self.video_output_paths[recording_id], 'rb') as video_file:
                video_name = os.path.basename(self.video_output_paths[recording_id])
                video_object_name = os.path.join('videos', video_name)
                self.minio_client.put_object(
                    bucket_name=self.bucket_notifications,
                    object_name=video_object_name,
                    data=video_file,
                    length=os.stat(self.video_output_paths[recording_id]).st_size,
                    content_type='video/mp4'
                )
                print(f"Video uploaded to MinIO: {video_object_name}")

                self.video_urls[recording_id] = self.minio_client.presigned_get_object(
                    self.bucket_notifications,
                    video_object_name
                )

                if self.video_urls[recording_id]:
                    try:
                        if os.path.exists(self.video_output_paths[recording_id]):
                            os.remove(self.video_output_paths[recording_id])
                            print(f"Local file deleted: {self.video_output_paths[recording_id]}")
                            video_output_path_noProcesed = self.video_output_paths[recording_id].replace("_processed", "")
                            os.remove(video_output_path_noProcesed)
                            print(f"Local file deleted: {video_output_path_noProcesed}")
                    except Exception as delete_error:
                        print(f"Error trying to delete local file: {delete_error}")
                else:
                    print(f"The file was not deleted because the upload failed.")

                if recording_id in self.video_ready_events:
                    self.video_ready_events[recording_id].set()

        except Exception as e:
            print(f"Failed to upload video to MinIO: {e}")
            self.video_urls[recording_id] = None
            if recording_id in self.video_ready_events:
                self.video_ready_events[recording_id].set()

    def scale_coordinates(self, coords, original_size, new_size):
        original_width, original_height = original_size
        new_width, new_height = new_size
        
        scale_x = new_width / original_width
        scale_y = new_height / original_height
        
        scaled_coords = []
        for coord in coords:
            x, y = coord
            scaled_x = int(x * scale_x)
            scaled_y = int(y * scale_y)
            scaled_coords.append([scaled_x, scaled_y])
        
        return np.array(scaled_coords, dtype=np.int32)


    def preprocess_frame_for_onnx(self, frame, model_key):
        """Preprocess a frame when executes an ONNX model"""
        image_height = self.onnx_model_configs[model_key]["image_height"]
        image_width = self.onnx_model_configs[model_key]["image_width"]
        resized_frame = cv2.resize(frame, (image_height, image_width))
        normalized_frame = resized_frame / 255.0
        return normalized_frame

    def apply_inference(self, frame, url_stream=None, videoResolution=None, streamId=None):
        height = videoResolution['height']
        width = videoResolution['width']
        
        self.frame_buffer_pre.append(frame)
        
        if hasattr(self, 'fall_detector') and self.fall_detector:
            processed_frame, fall_detections = self.fall_detector.process_frame(
                frame, frame_height=height
            )

            for detection in fall_detections:
                label = detection["label"]
                if label == "fall":
                    if not self.recording:
                        recording_id = self.start_recording(processed_frame)
                        self.recording.add(recording_id)
                        Thread(target=self.notify, args=(label, streamId, recording_id)).start()
                    else:
                        print("Fall already recorded for this stream.")

            if self.recording:
                active_recordings = list(self.recording)
                for recording_id in active_recordings:
                    self.frame_buffer_post[recording_id].append(processed_frame)
                    self.frame_counters[recording_id] += 1

                    if self.frame_counters[recording_id] >= FRAME_BUFFER_SIZE:
                        self.stop_recording(recording_id)

            return processed_frame, fall_detections

        results_list = []
        modelTrackerSearch=dict()
        
        if not self.models:
            print("No models loaded for inference.")
            return frame, results_list
        
        # print(f"Video Resolution: {width}x{height}")
        original_canvas_size = ((width * 480) / height, 480)
        new_frame_size = (width, height)
        final_frame = frame.copy()

        for model in self.models:
            #print(f"Processing model: {model['model_name']}")
            
            if model['model_name'].endswith('.onnx'):
                model_key = model['model_name']
    
                if streamId not in self.frame_buffers_onnx:
                    self.frame_buffers_onnx[streamId] = deque(maxlen=self.sequence_length_onnx)

                preprocessed_frame = self.preprocess_frame_for_onnx(frame, model_key)
                self.frame_buffers_onnx[streamId].append(preprocessed_frame)

                if len(self.frame_buffers_onnx[streamId]) == self.sequence_length_onnx:
                    input_name = self.onnx_sessions[model['model_name']].get_inputs()[0].name
                    input_data = np.expand_dims(np.array(self.frame_buffers_onnx[streamId]), axis=0).astype(np.float32)
                    output = self.onnx_sessions[model['model_name']].run(None, {input_name: input_data})
                    
                    predicted_probs = output[0][0]
                    predicted_label = np.argmax(predicted_probs)
                    confidence_score = predicted_probs[predicted_label] * 100
                    
                    classes_list = self.onnx_model_configs[model_key]["classes_list"]
                    predicted_class_name = f"{classes_list[predicted_label]} ({confidence_score:.2f}%)"
                    
                    first_class = classes_list[0]
                    color = (0, 255, 0) if first_class in predicted_class_name else (0, 0, 255)
                    cv2.putText(final_frame, predicted_class_name, (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.2, color, 2)

                    if predicted_label == 1: 
                        if not self.recording:
                            recording_id = self.start_recording(final_frame)
                            self.recording.add(recording_id)
                            Thread(target=self.notify, args=(classes_list[1], streamId, recording_id)).start()
                        else:
                            print("Warning ya registrado para este stream.")

                    if self.recording:
                        active_recordings = list(self.recording)
                        for recording_id in active_recordings:
                            self.frame_buffer_post[recording_id].append(final_frame)
                            self.frame_counters[recording_id] += 1

                            if self.frame_counters[recording_id] >= FRAME_BUFFER_SIZE:
                                self.stop_recording(recording_id)

            elif 'yolo_model' in model:
                for section in model['sections']:
                    scale_x = 1.0
                    scale_y = 1.0
                    x = 0
                    y = 0
                    w = frame.shape[1]
                    h = frame.shape[0]
                    # print(f"Processing section: {section}")

                    if section == [[0, 0], [0, width], [height, width], [height, 0]]:
                        # print(f"Running inference on the entire frame for stream URL: {url_stream}")
                        results = model['yolo_model'].track(frame, conf=LOWER_DETECTION_CONF, persist=True, verbose = False)
                        if len(self.models) > 1 :
                            frame_result = results[0].plot()
                            final_frame_weight = 0.5 
                            frame_result_weight = 0.5
                            final_frame = cv2.addWeighted(final_frame, final_frame_weight, frame_result, frame_result_weight, 0)
                        else:
                            final_frame = results[0].plot()
                            results_list.append(results)
                    else:
                        section_coords = np.array(section, dtype=np.int32)
                        # print(f"Original section coordinates: {section_coords}")

                        scaled_section_coords = self.scale_coordinates(section_coords, original_canvas_size, new_frame_size)
                        # print(f"Scaled section coordinates: {scaled_section_coords}")

                        reduced_section_coords = scaled_section_coords.astype(np.int32)
                        if len(reduced_section_coords) < 3:
                            # print(f"Sección reducida inválida con puntos insuficientes: {len(reduced_section_coords)}.")
                            continue

                        mask = np.zeros(frame.shape[:2], dtype=np.uint8)
                        cv2.fillPoly(mask, [reduced_section_coords], 255)
                        mask = (mask * 0.05).astype(np.uint8)
                        masked_frame = cv2.bitwise_and(frame, frame, mask=mask)
                        x, y, w, h = cv2.boundingRect(reduced_section_coords)
                        x_adjust = int(section_coords[:, 0].min() * 0.3)
                        y_adjust = int(section_coords[:, 1].min() * 0.3)
                        x = max(x - x_adjust, 0)
                        y = max(y - y_adjust, 0)
                        w = min(w + x_adjust, frame.shape[1] - x)
                        h = min(h + y_adjust, frame.shape[0] - y)
                        roi = masked_frame[y:y+h, x:x+w]

                        if roi.shape[0] == 0 or roi.shape[1] == 0:
                            # print(f"ROI inválida con forma: {roi.shape}. Saltando inferencia para esta ROI.")
                            continue

                        # print(f"Running inference on stream URL: {url_stream}")
                        results = model['yolo_model'].track(roi,conf=LOWER_DETECTION_CONF,persist=True, verbose=False)
                        roi_result = results[0].plot()
                        scale_x = w / final_frame[y:y+h, x:x+w].shape[1]
                        scale_y = h / final_frame[y:y+h, x:x+w].shape[0]

                        if section:
                            result_mask = np.zeros_like(frame)
                            result_mask[y:y+h, x:x+w] = cv2.resize(roi_result, (w, h))
                            final_frame = cv2.add(final_frame, cv2.bitwise_and(result_mask, result_mask, mask=mask))

                        else:
                            final_frame = roi_result

                        results_list.append(results)

                    summary = results[0].summary()

                    for element in summary:
                        box = element.get("box")
                        conf = element.get("confidence")
                        label = element["name"]

                        x1 = int(box['x1'])
                        y1 = int(box['y1'])
                        x2 = int(box['x2'])
                        y2 = int(box['y2'])
                        per_width = x2 - x1

                        if section:
                            x1 = int(x1 * scale_x + x)
                            y1 = int(y1 * scale_y + y)
                            x2 = int(x2 * scale_x + x)
                            y2 = int(y2 * scale_y + y)

                        distance = self.calculate_distance(KNOWN_WIDTH, FOCAL_LENGTH, per_width)

                        if "track_id" in element.keys():
                            track_id = element["track_id"]

                        if element["name"] in WARNING_TRIGGER_CLASSES and "track_id" in element.keys():
                            color = (0, 0, 255)
                            
                            modelTrackerSearch[element["name"]] = {
                                "id": element["track_id"],
                                "conf": element["confidence"],
                                "distance": distance
                            }
                        else: 
                            color = (0, 255, 0)

                        if distance <= WARNING_TRIGGER_DISTANCE and "track_id" in element.keys():
                            color = (0, 140, 255)
                            modelTrackerSearch[element["name"]] = {
                                "id": element["track_id"],
                                "conf": element["confidence"],
                                "distance": distance
                            }
                        if element["name"] in self.lost_objects:
                            self.lost_object_manager.handle_lost_object(
                                element, x1, y1, x2, y2, streamId, final_frame,
                                start_recording_callback=self.start_recording,
                                notify_callback=self.notify
                            )
                            # print("Buffer de objetos" , self.lost_object_manager.lost_object_buffer , "\n")

                        if element["name"] in DISTANCE_SHOWING_CLASSES:
                            if "track_id" not in element.keys():
                                text = f'{label}: {conf:.2f}, {distance:.2f}m'
                            else:
                                text = f'ID: {track_id}, {label}: {conf:.2f}, {distance:.2f}m'
                            text_size = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)[0]
                            text_x = x1
                            text_y = y1 - 3
                            extra_height = 3
                            cv2.rectangle(final_frame, (text_x, text_y - text_size[1] - extra_height), (text_x + text_size[0], text_y), color, -1)                        
                            cv2.putText(final_frame, text, (text_x, text_y), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
    
                    self.frame_buffer_pre.append(final_frame)
                    self.modelTrackerBuffer= self.trakerHandler(modelTrackerSearch,self.modelTrackerBuffer,streamId, final_frame)

                    if self.recording:
                        active_recordings = list(self.recording)
                        for recording_id in active_recordings:
                            self.frame_buffer_post[recording_id].append(final_frame)
                            self.frame_counters[recording_id] += 1
                            
                            if self.frame_counters[recording_id] >= FRAME_BUFFER_SIZE:
                                self.stop_recording(recording_id)

        return final_frame, results_list

    def notify(self, detected_object, streamId, recording_id, is_distance_alert=False, is_lost_object=False):
        if is_distance_alert:
            alert_type =  "distance"
        elif is_lost_object:
            alert_type =  "lost"
        else:
            alert_type =  "warning"

        name_message = self.notification_messages[alert_type].get(detected_object)
        type_message = self.type_messages[alert_type].get(detected_object)
        
        if recording_id in self.video_ready_events:
            self.video_ready_events[recording_id].wait()
            del self.video_ready_events[recording_id]

        payload = {
            "name": name_message,
            "triggerLabel": detected_object,
            "status": "Unattended",
            "type": type_message,
            "assignedTo": "Pending to assign",
            "lastUpdateBy": "Pendiente de asignación",
            "fileName": self.processed_video_names[recording_id],
            "videoStreamId": streamId,
        }

        response = make_request(NOTIFICATION_URL, method='POST', data=json.dumps(payload))

        if response:
            print(f"Notification sent successfully for {detected_object}")
            print(f"Payload sent: {payload}")
        else:
            print(f"Failed to send notification for {detected_object}")
            print(f"Failed payload: {payload}")