from datetime import datetime
from threading import Thread
import uuid

class LostObjectManager:
    def __init__(self, width_deviation, time_filter_threshold, warning_trigger_lost, lost_object_classes):
        self.lost_object_buffer = {}
        self.width_deviation = width_deviation
        self.time_filter_threshold = time_filter_threshold
        self.warning_trigger_lost = warning_trigger_lost
        self.lost_object_classes = lost_object_classes

    def id_assigner_by_position(self, newObject, offset):
        position_x = newObject.get('position_x')
        position_y = newObject.get('position_y')
        label = newObject.get('label')
        now = datetime.now()

        # Buscamos en el buffer si ya existe un objeto cercano (con el offset)
        for existing_obj in self.lost_object_buffer.values():
            # Comprobamos si el objeto ya existe en el buffer, con el offset permitido
            if (abs(existing_obj['position_x'] - position_x) <= offset and 
                abs(existing_obj['position_y'] - position_y) <= offset and 
                existing_obj['label'] == label):
                existing_obj["last_detection"] = now
                return () # Si existe, actualizamos el datetime de la última detección

        # Si no se encuentra un objeto similar, creamos un nuevo objeto
        new_detection_obj = {
            'id': str(uuid.uuid4()),
            'label': label, # Genera un identificador único
            'position_x': position_x,
            'position_y': position_y,
            'first_detection': now,
            'last_detection': now,
            'alarmCreated': False
        }
        # Asignamos el nuevo objeto al buffer
        self.lost_object_buffer[new_detection_obj['id']] = new_detection_obj
        return ()

    def notify_filter_and_remove_old_lost_objects(self, streamId, final_frame, start_recording_callback, notify_callback):
        now = datetime.now()
        time_threshold = self.time_filter_threshold
        notification_time_threshold = self.warning_trigger_lost

        # Identificadores de los objetos que serán eliminados y los id de los que si estan identificados

        for obj_id, obj in list(self.lost_object_buffer.items()):
            # Filtrar y eliminar objetos antiguos (Filtro por timmer de detect)
            if now - obj['last_detection'] > time_threshold:
                del self.lost_object_buffer[obj_id]

            # Verificar objetos perdidos (timmer) y que no hayan hecho trigger de alarma
            elif obj['last_detection'] - obj['first_detection'] > notification_time_threshold and not obj['alarmCreated']:
                recording_id = start_recording_callback(final_frame)
                # Llamamos a notify_callback en un thread para evitar bloqueo
                Thread(
                    target=notify_callback,
                    args=(obj['label'], streamId, recording_id),
                    kwargs={'is_distance_alert': False, 'is_lost_object': True}
                ).start()
                obj['alarmCreated'] = True
        return ()

    def handle_lost_object(self, element, x1, y1, x2, y2, streamId, final_frame, start_recording_callback, notify_callback):
        # Se calcula la posición central del objeto perdido; 
        # llamaremos a "handle_lost_object" desde el bloque if correspondiente en apply_inference
        lostObjectTracker = {
            'label': element["name"],
            "position_x": (x2 - x1) / 2 + x1,
            "position_y": (y2 - y1) / 2 + y1
        }
        self.id_assigner_by_position(lostObjectTracker, self.width_deviation)
        self.notify_filter_and_remove_old_lost_objects(streamId, final_frame, start_recording_callback, notify_callback)
