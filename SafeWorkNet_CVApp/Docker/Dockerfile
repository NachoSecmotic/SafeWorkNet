FROM ultralytics/ultralytics:latest

WORKDIR /app

COPY requirements.txt .

RUN python3 -m pip install --upgrade pip

RUN pip3 install --no-cache-dir -r requirements.txt

RUN conda install -c conda-forge ffmpeg

COPY  src/ .

COPY .env .env

CMD ["python3", "main.py"]