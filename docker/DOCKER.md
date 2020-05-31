# Notes on Building

## Dockerfile

Update the dockerfile to have the .jar file path.

## Test
```
docker build -t comixed/comixed .
docker run -it -p 7171:7171/tcp comixed/comixed
```
## Tag Push
```
docker tag comixed/comixed comixed/comixed:0.6.0-0.rc1
docker push comixed/comixed
```

## Upload to dockerhub as latest and/or release
```
docker tag comixed/comixed comixed/comixed:latest
docker push comixed/comixed

docker tag comixed/comixed comixed/comixed:release
docker push comixed/comixed
```
