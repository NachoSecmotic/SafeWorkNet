FROM ultralytics/ultralytics:latest-jetson-jetpack4

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONPATH=/usr/local/lib/python3.8/site-packages

RUN apt-get update && apt-get upgrade -y --autoremove

# Install tzdata
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive TZ=Etc/UTC apt-get -y install tzdata && apt-get clean

# Install dependencies
RUN apt-get update && apt-get upgrade -y\
    && apt-get remove -y python3-numpy python3-matplotlib \
    && apt-get install -y  \
    ffmpeg \
    libatlas3-base \
    libtesseract4 \
    python3-pip \
    python3.8 \
    python3.8-dev \
    && apt-get clean

RUN python3.8 -m pip install pybind11 \
    && python3.8 -m pip install Cython==0.29.36 \
    && python3.8 -m pip install setuptools==49.6.0

WORKDIR /tmp

RUN wget https://raw.github.com/lanzani/jetson-libraries/main/libraries/opencv/l4t32.7.1/py3.8.0/ocv4.8.0/OpenCV-4.8.0-aarch64.sh \
    && chmod 777 OpenCV-4.8.0-aarch64.sh \
    && ./OpenCV-4.8.0-aarch64.sh --prefix=/usr/local --skip-license --exclude-subdir

WORKDIR /app

COPY requirements.txt .

RUN python3 -m pip install --upgrade pip

RUN python3 -m pip install --no-cache-dir -r requirements.txt

COPY  src/ .

CMD ["python3", "main.py"]