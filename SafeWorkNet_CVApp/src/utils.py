from urllib.parse import urlparse
from dotenv import load_dotenv
from auth_utils import make_request
import os

load_dotenv()

VIDEO_STREAMS_URL = os.getenv('VIDEO_STREAMS_URL')
SMARTPHONE_VIDEOCAMERA_URL = os.getenv('SMARTPHONE_VIDEOCAMERA_URL')
SUFFIX_VIDEOSTREAM_PROCESSED = os.getenv('SUFFIX_VIDEOSTREAM_PROCESSED')
DEVICE_TYPE = os.getenv('DEVICE_TYPE')

def get_videostreams():
    params = {}
    params['isEdge'] = DEVICE_TYPE == 'edge'

    video_streams = make_request(VIDEO_STREAMS_URL, params=params)

    if isinstance(video_streams, list):
        return video_streams
    else:
        print("Failed to get video streams.")
        return None

def transform_url(url_stream):
    parsed_url = urlparse(url_stream)
    base_url = SMARTPHONE_VIDEOCAMERA_URL.rstrip('/')
    new_path = parsed_url.path.rsplit(SUFFIX_VIDEOSTREAM_PROCESSED, 1)[0]
    new_url = f"{base_url}{new_path}"
    return new_url

def generate_output_url(url_stream):
    parsed_url = urlparse(url_stream)
    base_url = SMARTPHONE_VIDEOCAMERA_URL.rstrip('/')
    new_path = parsed_url.path.rsplit(SUFFIX_VIDEOSTREAM_PROCESSED, 1)[0] + SUFFIX_VIDEOSTREAM_PROCESSED
    output_url = f"{base_url}{new_path}"
    print  (output_url)
    return output_url

def is_running_on_raspberry_pi():
    try:
        with open("/proc/cpuinfo", "r") as cpuinfo:
            return "Raspberry Pi" in cpuinfo.read()
    except FileNotFoundError:
        return False
