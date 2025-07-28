import cv2
import subprocess
import time
import os
from model_handler import ModelHandler
from utils import is_running_on_raspberry_pi
from dotenv import load_dotenv

if is_running_on_raspberry_pi():
    from picamera2 import Picamera2

model_handler = ModelHandler()
load_dotenv()

ENABLE_GSTREAMER = os.getenv('ENABLE_GSTREAMER')

def gstreamer_pipeline(
    capture_width=1280,
    capture_height=720,
    display_width=1280,
    display_height=720,
    framerate=30,
    flip_method=0
):
    return (
        "nvarguscamerasrc ! "
        "video/x-raw(memory:NVMM), "
        "width=(int)%d, height=(int)%d, "
        "format=(string)NV12, framerate=(fraction)%d/1 ! "
        "nvvidconv flip-method=%d ! "
        "video/x-raw, width=(int)%d, height=(int)%d, format=(string)BGRx ! "
        "videoconvert ! "
        "video/x-raw, format=(string)BGR ! appsink drop=True "
        % (
            capture_width,
            capture_height,
            framerate,
            flip_method,
            display_width,
            display_height
        )
    )

def start_rtmp_stream(url_stream, rtmp_url, model_handler, resolution, stream_id, stop_event):

    command = [
        'ffmpeg',
        '-re',  # Read the input in real-time, mimicking the speed of a stream.
        '-y',  # Overwrite existing output files without asking.
        '-f', 'rawvideo',  # Specify that the input format is raw video.
        '-vcodec', 'rawvideo',  # Define the input video codec as rawvideo.
        '-pix_fmt', 'bgr24',  # Set the pixel format of the input.
        '-s', f"{resolution['width']}x{resolution['height']}",  # Define the resolution of the output video.
        '-i', '-',  # Indicate that the input will be read from stdin (standard input).
        '-fflags', 'nobuffer',  # Disable buffering to reduce latency.
        '-g', '20',  # Set the group of pictures (GOP) size to 20; affects compression and latency.
        '-fps_mode', 'cfr',
        '-r', '10',  # Set the fps for the output.
        '-f', 'flv',  # Specify the output format as FLV (Flash Video).
        '-c:v', 'libx264',  # Set the output video codec to libx264 (H.264).
        '-pix_fmt', 'yuv420p',  # Define the pixel format of the output.
        '-b:v', '500k',  # Set the video bitrate.
        '-maxrate', '500k',  # Set the maximum bitrate.
        '-bufsize', '1000k',  # Define the buffer size.
        '-preset', 'superfast',  # Encoding speed.
        '-flvflags','no_duration_filesize',
        '-tune', 'zerolatency',  # Tune the encoder to minimize latency.
        '-an',  # Disable audio encoding.
        rtmp_url
    ]

    if is_running_on_raspberry_pi():
        print("Raspberry Pi detected. Using Picamera2 with NCNN model.")
        picam2 = Picamera2()
        picam2.configure(picam2.create_video_configuration(main={"size": (resolution['width'], resolution['height']),"format":"RGB888"}))
        picam2.start()

        process = subprocess.Popen(command, stdin=subprocess.PIPE)

        while not stop_event.is_set():
            try:
                frame = picam2.capture_array()

                if frame is None or frame.size == 0:
                    print("Frame not received from camera. Restarting...")
                    break

                processed_frame, _ = model_handler.apply_inference(frame, url_stream, videoResolution=resolution, streamId=stream_id)
                processed_frame = cv2.resize(processed_frame, (resolution['width'], resolution['height']))
                process.stdin.write(processed_frame.tobytes())
                process.stdin.flush()

            except BrokenPipeError:
                print("Broken pipe error. Restarting FFmpeg process...")
                process.kill()
                process = subprocess.Popen(command, stdin=subprocess.PIPE)
            except Exception as e:
                print(f"An unexpected error occurred: {e}")
                break

        if process.stdin:
            process.stdin.close()
        process.wait()
    else:
        print("Non-Raspberry Pi detected. Using standard OpenCV for streaming.")
        
        params = []

        if os.getenv('ENABLE_GSTREAMER', 'false').lower() == 'true':
            params.append(gstreamer_pipeline(capture_width=resolution['width'], capture_height=resolution['height'], flip_method=2))
            params.append(cv2.CAP_GSTREAMER)
        else:
            params.append(url_stream)

        while not stop_event.is_set():
            cap = cv2.VideoCapture(*params)
            cap.set(cv2.CAP_PROP_BUFFERSIZE, 0) # Controls the number of frames stored in the buffer

            if not cap.isOpened():
                print(f"Unable to open stream from URL: {url_stream}, raw streaming not available. Retrying in 10 seconds...")
                time.sleep(3)
                continue
            
            process_output = subprocess.Popen(command, stdin=subprocess.PIPE)

            while not stop_event.is_set():
                try:
                    cap.grab()  # Skips old frames in the buffer
                    ret, frame = cap.read()
                    if not ret:
                        print("Failed to read frame from the stream. Retrying...")
                        break
                    
                    processed_frame, _ = model_handler.apply_inference(frame, url_stream, videoResolution=resolution, streamId=stream_id)
                    processed_frame = cv2.resize(processed_frame, (resolution['width'], resolution['height']))
                    process_output.stdin.write(processed_frame.tobytes())
                    process_output.stdin.flush()

                except BrokenPipeError:
                    print("Broken pipe error. Restarting the GStreamer process...")
                    break
                except Exception as e:
                    print(f"An unexpected error occurred: {e}")
                    break

            cap.release()
            if process_output.stdin:
                process_output.stdin.close()
            process_output.wait()
           
            time.sleep(1)