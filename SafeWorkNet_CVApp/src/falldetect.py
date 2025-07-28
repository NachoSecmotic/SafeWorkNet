import cv2
from ultralytics import YOLO

# Parámetros de detección
BASE_HEIGHT_CHANGE_THRESHOLD = 0.1  # Cambio relativo en altura (40%) para personas cercanas
MIN_BOX_HEIGHT_RATIO = 0.5  # Altura mínima del bounding box en proporción al frame
FALL_CONFIRMATION_FRAMES = 3  # Frames consecutivos necesarios para confirmar caída

class FallDetection:
    def __init__(self, model_path):
        self.model = YOLO(model_path)
        self.person_data = {}

    def process_frame(self, frame, frame_height):
        fall_detections = []

        results = self.model(frame, classes=[0])

        for result in results:
            boxes = result.boxes
            for idx, box in enumerate(boxes):
                x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                conf = box.conf[0]
                h = y2 - y1
                
                if h / frame_height < BASE_HEIGHT_CHANGE_THRESHOLD:
                    continue

                is_falling = self._detect_fall(idx, h)
                color = (0, 0, 255) if is_falling else (0, 255, 0)

                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                cv2.putText(frame, f"Person: {conf:.2f}", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

                if is_falling:
                    fall_detections.append({"label": "fall", "box": [x1, y1, x2, y2], "confidence": conf})

        return frame, fall_detections

    def _detect_fall(self, idx, height):
        if idx not in self.person_data:
            self.person_data[idx] = {"height": height, "counter": 0}

        height_change = height / self.person_data[idx]["height"]

        if height_change < MIN_BOX_HEIGHT_RATIO:  # Umbral de caída
            self.person_data[idx]["counter"] += 1
            if self.person_data[idx]["counter"] > FALL_CONFIRMATION_FRAMES:
                return True
        else:
            self.person_data[idx]["counter"] = 0

        return False


