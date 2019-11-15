# Notes on Building

## Dockerfile

Update the dockerfile to have the .jar file path.

## Test
```
docker build -t pidockmedia/comixed .
docker run -it -p 7171:7171/tcp pidockmedia/comixed
```
## Tag Push
```
docker tag pidockmedia/comixed pidockmedia/comixed:3.3.0.1
docker push pidockmedia/comixed
```

## Upload to dockerhub as latest and/or release
```
docker tag pidockmedia/comixed pidockmedia/comixed:latest
docker push pidockmedia/comixed

docker tag pidockmedia/comixed pidockmedia/comixed:release
docker push pidockmedia/comixed
```
