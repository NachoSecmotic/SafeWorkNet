FROM ultralytics/ultralytics:latest-arm64

RUN apt update && apt install -y --no-install-recommends gnupg

RUN echo "deb http://archive.raspberrypi.org/debian/ bookworm main" > /etc/apt/sources.list.d/raspi.list \
  && apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 82B129927FA3303E

RUN apt update && apt -y upgrade

RUN apt update && apt install -y --no-install-recommends \
		python3-pip \
		python3-picamera2 \
		&& apt-get clean \
		&& apt-get autoremove \
		&& rm -rf /var/cache/apt/archives/* \
		&& rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

RUN apt-get update && apt-get install -y \
	ffmpeg \
	&& apt-get clean \
	&& rm -rf /var/lib/apt/lists/*

RUN python3 -m pip install --upgrade pip

RUN pip3 install --no-cache-dir -r requirements.txt

COPY  src/ .

COPY .env .env

CMD ["python3", "main.py"]