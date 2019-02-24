# Developing For ComiXed

## Adding To The Web Frontend

As with the backend, all code contributions should come with sufficient unit test
code to demostrate 1) how to use the feature and 2) ensure that it works in an
automated fashion.

### Running The Unit Tests

To run the existing unit tests, you can use the command line:

```yarn test```

This will run the full suite of unit tests in a headless Firefox browser and
report any tests that fail.

If you would like to see a browser, you can run it instead with this command:

```yarn test --browsers Firefox```
