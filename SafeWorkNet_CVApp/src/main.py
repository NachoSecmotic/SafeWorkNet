import multiprocessing
import time
import sys
from model_handler import ModelHandler
from auth_utils import validate_api_key
from streaming import start_rtmp_stream
from utils import get_videostreams, transform_url, generate_output_url
from dotenv import load_dotenv
import os

load_dotenv()
DEVICE_TYPE = os.getenv('DEVICE_TYPE')
EDGE_RTMP_URL = os.getenv('EDGE_RTMP_URL')

def start_stream_process(stream_id, stream, edge, stop_event):
    # Function to start a streaming process for each stream
    resolution = stream['device']['resolution']
    
    # Initialize the model handler within the process
    model_handler = ModelHandler()
    
    # Load models in this process (this ensures that each process handles its own ModelHandler)
    ai_models = stream['aiModels']
    screen_sections = stream['screenSections']
    model_info = []
    
    if screen_sections:
        for model_name in ai_models:
            sections = []
            for value in screen_sections:
                if model_name in value['aiModels']:
                    sections.append(value['coordinates'])
            model_info.append({'model_name': model_name.split('/')[-1], 'sections': sections, 'stream_id': stream_id})
    else:
        for model_name in ai_models:
            sections = [[[0, 0], [0, resolution['width']], [resolution['height'], resolution['width']], [resolution['height'], 0]]]
            model_info.append({'model_name': model_name.split('/')[-1], 'sections': sections, 'stream_id': stream_id})
    
    model_handler.load_models(model_info)
    
    if edge:
        rtmp_url = EDGE_RTMP_URL
        start_rtmp_stream(0, rtmp_url, model_handler, resolution, stream_id, stop_event)
    else:
        stream_url = stream['url']
        transformed_url = transform_url(stream_url)
        output_url = generate_output_url(stream_url)
        start_rtmp_stream(transformed_url, output_url, model_handler, resolution, stream_id, stop_event)

def periodic_update(edge):
    manager = multiprocessing.Manager()
    stop_events = manager.dict()
    video_streams = []
    streams_processes = {}

    while True:
        try:
            requested_video_streams = get_videostreams()
            
            print(f"Active videostreams obtained: {len(requested_video_streams)}")
            video_streams_dict = {stream['id']: stream for stream in video_streams}
            new_video_streams = []

            # Add new active videostreams or update the ones that are already broadcasting
            for stream in requested_video_streams:
                if stream['id'] not in video_streams_dict:
                    new_video_streams.append(stream)
                else:
                    # Compare properties of the existing and the new stream
                    properties_to_compare = ['aiModels', 'deviceId', 'url', 'screenSections']
                    existing_stream = video_streams_dict[stream['id']]
                    are_equal = all(stream[prop] == existing_stream[prop] for prop in properties_to_compare)

                    if not are_equal:
                        print(f"Properties changed for videostream with id {stream['id']}. Updating...")
                        stop_events[stream['id']].set()
                        streams_processes[stream['id']].join()
                        new_video_streams.append(stream)
            
            requested_video_streams_dict = {stream['id']: stream for stream in requested_video_streams}

            for index, stream in enumerate(video_streams):
                if stream['id'] not in requested_video_streams_dict:
                    print(f"Closing process for deleted/inactive stream with id {stream['id']}...")
                    stop_events[stream['id']].set()
                    streams_processes[stream['id']].join()
                    del video_streams[index]

            video_streams += new_video_streams

            if new_video_streams:
                for stream in new_video_streams:
                    stream_id = stream['id']
                    stop_events[stream_id] = manager.Event()
                    process = multiprocessing.Process(target=start_stream_process, args=(stream_id, stream, edge, stop_events[stream_id]))
                    streams_processes[stream_id] = process
                    process.start()
            print("Waiting for active streams...")
            time.sleep(15)
        except Exception as e:    
            print(f"Error in periodic update ({'edge' if edge else 'no-edge'}): {str(e)}")

if __name__ == '__main__':
    try:
        if not validate_api_key():
            print("Invalid API key. Exiting.")
            sys.exit(1)

        update_process = multiprocessing.Process(target=periodic_update, args=(DEVICE_TYPE == 'edge',))
        update_process.start()

        update_process.join()


    except KeyboardInterrupt:
        print("Turning off the server.")