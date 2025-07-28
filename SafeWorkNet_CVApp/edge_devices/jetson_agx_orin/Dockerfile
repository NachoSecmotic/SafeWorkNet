FROM ultralytics/ultralytics:latest-jetson-jetpack5

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