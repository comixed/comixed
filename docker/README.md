# Running ComiXed from Docker - by pidockmedia
#### Concept by jakanapes

## To run this image from the repository simply do:
####Note: This location may be temporary as comiXed really needs an official dockerhub location. Will update if/when that is available.

```docker run -it -p 7171:7171/tcp -v /PATH/TO/COMICS:/comic_dir -v /PATH/TO/COMIXDB:/root/.comixed pidockmedia/comixed:latest```

The latest version may be a development build. Use this to get the latest release:

```docker run -it -p 7171:7171/tcp -v /PATH/TO/COMICS:/comic_dir -v /PATH/TO/COMIXDB:/root/.comixed pidockmedia/comixed:release```

Yopu could also pull a specific version:

```docker run -it -p 7171:7171/tcp -v /PATH/TO/COMICS:/comic_dir -v /PATH/TO/COMIXDB:/root/.comixed pidockmedia/comixed:0.4.9-SNAPSHOT```
