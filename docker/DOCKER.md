# Notes on Building

## Dockerfile

Update the dockerfile to have the .jar file path.

## Test
```
docker build -t mcpierce/comixed .
docker run -it -p 7171:7171/tcp mcpierce/comixed
```
## Tag Push
```
docker tag mcpierce/comixed mcpierce/comixed:3.3.0.1
docker push mcpierce/comixed
```

## Upload to dockerhub as latest and/or release
```
docker tag mcpierce/comixed mcpierce/comixed:latest
docker push mcpierce/comixed

docker tag mcpierce/comixed mcpierce/comixed:release
docker push mcpierce/comixed
```
