# Makefile for installing Python project requirements and running the application

# Define the Python interpreter
PYTHON := python3

# Define the requirements file
REQUIREMENTS := requirements.txt

# Define the main application file
MAIN := src/main.py

# Define the directory containing Docker files
DOCKER := Docker

# Define the image name
IMAGE := gitlab.secmotic.com:5050/secureye/ai-models/ai-models_dev

# Define the name of the video capturing device
CAMERA_DEVICE := video0


# Default target: install requirements and run the application
all: install run

# Target to install requirements
install:
	$(PYTHON) -m pip install -r $(REQUIREMENTS)

# Target to run the application
run:
	$(PYTHON) $(MAIN)

# Clean target to remove __pycache__ and other Python-generated files
clean:
	find . -type d -name "__pycache__" -exec rm -r {} +

docker-build:
	docker build -f ${DOCKER}/Dockerfile -t ${IMAGE}:latest . --no-cache

docker-build-cpu:
	docker build -f ${DOCKER}/Dockerfile.cpu -t ${IMAGE}:latest-cpu . --no-cache

docker-run-edge:
	docker run --env DEVICE_TYPE=edge -it --device=/dev/${CAMERA_DEVICE}:/dev/${CAMERA_DEVICE} ${IMAGE}:latest

docker-run-no-edge:
	docker run --env DEVICE_TYPE=no-edge -it --device=/dev/${CAMERA_DEVICE}:/dev/${CAMERA_DEVICE} ${IMAGE}:latest

docker-run-cpu-edge:
	docker run --env DEVICE_TYPE=edge -it --device=/dev/${CAMERA_DEVICE}:/dev/${CAMERA_DEVICE} ${IMAGE}:latest-cpu

docker-run-cpu-no-edge:
	docker run --env DEVICE_TYPE=no-edge -it --device=/dev/${CAMERA_DEVICE}:/dev/${CAMERA_DEVICE} ${IMAGE}:latest-cpu



