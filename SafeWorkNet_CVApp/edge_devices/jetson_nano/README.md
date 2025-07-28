### Run CV app in Jetson Nano (Jetpack 4.6) :rocket:

#### :exclamation: Prerequisites
  - Ensure docker/docker-compose is installed on Jetson Nano.

  - If building from PC, enable **docker buildx** extension to support ARM64 architecture builds in your machine. You can follow [this](https://www.docker.com/blog/multi-arch-images/) guide.

  - Login to private container registry if necessary.

#### :whale: Generate the Docker image (from PC)
> Build the Docker image from the provided [Dockerfile](Dockerfile) and push to registry:
```bash
  docker buildx build --platform linux/arm64 --provenance false -f edge_devices/jetson_nano/Dockerfile -t gitlab.secmotic.com:5050/secureye/ai-models/ai-models_dev:latest-jetson-jetpack4 . --push
```

#### :arrow_forward: Run the app container in the Jetson Nano device:

**Set the necessary environment variables in a .env file in the device**

- Using Docker:

```bash
sudo docker run -d --runtime nvidia --ipc=host --network=host --privileged -v /tmp/.X11-unix/:/tmp/.X11-unix/ -v /tmp/argus_socket:/tmp/argus_socket -v /root/.Xauthority:/root/.Xauthority --env-file .env -e DISPLAY=$DISPLAY -e XAUTHORITY=/tmp/.docker.xauth --name cv_app gitlab.secmotic.com:5050/secureye/ai-models/ai-models_dev:latest-jetson-jetpack4
```

- Using [docker-compose](docker-compose.yml):

```bash
sudo docker-compose up -d
```