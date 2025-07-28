### Run CV app in Jetson AGX Orin (Jetpack 5.1) :rocket:

#### :exclamation: Prerequisites
  - Enable **docker buildx** extension to support ARM64 architecture builds in your machine. You can follow [this](https://www.docker.com/blog/multi-arch-images/) guide.

  - Login to private container registry if necessary.

#### :whale: Generate the Docker image (from PC)
> Build the Docker image from the provided [Dockerfile](Dockerfile) and push to registry:
```bash
  docker buildx build --platform linux/arm64 --provenance false -f edge_devices/jetson_agx_orin/Dockerfile -t gitlab.secmotic.com:5050/secureye/ai-models/ai-models_dev:latest-jetson-jetpack5 --push .
```

#### :arrow_forward: Run the app container in the Jetson AGX Orin device:

```bash
sudo docker run --env DEVICE_TYPE=no-edge -d --runtime nvidia --ipc=host --network=host --privileged gitlab.secmotic.com:5050/secureye/ai-models/ai-models_dev:latest-jetson-jetpack5
```