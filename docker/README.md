# Running ComiXed in a Docker Container
## by pidockmedia
#### Concept by jakanapes

## To run this image from the repository simply do:

```docker run -it -p 7171:7171/tcp -v /PATH/TO/COMICS:/comic_dir -v /PATH/TO/COMIXDB:/root/.comixed comixed/comixed:latest```

The latest version may be a development build. Use this to get the latest release:

```docker run -it -p 7171:7171/tcp -v /PATH/TO/COMICS:/comic_dir -v /PATH/TO/COMIXDB:/root/.comixed comixed/comixed:release```

You could also pull a specific version:

```docker run -it -p 7171:7171/tcp -v /PATH/TO/COMICS:/comic_dir -v /PATH/TO/COMIXDB:/root/.comixed comixed/comixed:0.6.0-0.rc4```
