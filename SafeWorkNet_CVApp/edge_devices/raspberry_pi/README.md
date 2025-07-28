### Run CV app in Raspberry Pi :rocket:

#### :exclamation: Prerequisites
  - Ensure docker/docker-compose is installed on Raspberry Pi.
  
  - If building from PC, enable **docker buildx** extension to support ARM64 architecture builds in your machine. You can follow [this](https://www.docker.com/blog/multi-arch-images/) guide.

  - Login to private container registry if necessary.

#### :whale: Generate the Docker image (from PC)
> Build the Docker image from the provided [Dockerfile](Dockerfile) and push to registry:
```bash
  docker buildx build --platform linux/arm64 --provenance false -f edge_devices/raspberry_pi/Dockerfile -t gitlab.secmotic.com:5050/secureye/ai-models/ai-models_dev:latest-arm64 . --push
```

#### :arrow_forward: Run the app container in the Raspberry Pi devices:


**Set the necessary environment variables in a .env file in the device**

- Using Docker:

```bash
sudo docker run --env DEVICE_TYPE=edge -d --ipc=host --network=host --privileged -v /run/udev:/run/udev:ro --env-file .env --name cv_app gitlab.secmotic.com:5050/secureye/ai-models/ai-models_dev:latest-arm64
```

- Using [docker-compose](docker-compose.yml):

```bash
sudo docker-compose up -d
```
