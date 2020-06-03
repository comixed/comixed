# Contributing

When contributing to this repository, please first discuss the change you wish to make via issue,
email, or any other method with the owners of this repository before making a change. 

Please note we have a code of conduct, please follow it in all your interactions with the project.

## Commit Template

When working on code, please use the following template for your commits:

    [Issue #xxx] One line description of this commit
    
     * this commit adds/removes/fixes something

where **xxx** is the issue being addressed.

Using this template, your changes are then visible on the ticket's page. This lets everybody know
what changes were made for any issue.

### How To Describe The Change

See [Keep A Changelog](https://keepachangelog.com/en/1.0.0/) for a description for how to make a good changelog entry.
Each commit's summary should start with one of the following verbs:

 * **Added** for a new feature,
 * **Changed** for changes to existing functionality,
 * **Deprecated** for soon-to-be removed features,
 * **Removed** for now removed features,
 * **Fixed** for any bug fixes, or
 * **Security** in cases of vulnerabilities.

## Coding Conventions And Formatting

### Java

The Java code for the project is formatted using the [Google Java Formatter](https://github.com/google/google-java-format) tool. Code is automatically formatted for you when you commit locally.

To manually format the code, use the following command line:

```
$ mvn git-code-format:format-code
```

### Typescript

The frontend code uses [Prettier](https://prettier.io/) for code formatting, and the build process will fail code that does not meet this standard.

Most editors and IDEs support formatting Typescript code. Please check the documentation for the one you use for how to apply the convention when coding.

#### Lint Checks

To ensure your Angular code meets project requirements, please run the lint checks in the **comixed-frontend** module:

```
$ cd comixed-frontend
$ yarn lint
```

There should be no errors reported.

## Pull Requests

Ensure your branch builds without errors or warnings locally. Any PR that does not pass the automated build process on [Travis](https://travis-ci.org/mcpierce/comixed) will be automatically declined.
 

## Code of Conduct

### Our Pledge

In the interest of fostering an open and welcoming environment, we as
contributors and maintainers pledge to making participation in our project and
our community a harassment-free experience for everyone, regardless of age, body
size, disability, ethnicity, gender identity and expression, level of experience,
nationality, personal appearance, race, religion, or sexual identity and
orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment
include:

* Using welcoming and inclusive language
* Being respectful of differing viewpoints and experiences
* Gracefully accepting constructive criticism
* Focusing on what is best for the community
* Showing empathy towards other community members

Examples of unacceptable behavior by participants include:

* The use of sexualized language or imagery and unwelcome sexual attention or
advances
* Trolling, insulting/derogatory comments, and personal or political attacks
* Public or private harassment
* Publishing others' private information, such as a physical or electronic
  address, without explicit permission
* Other conduct which could reasonably be considered inappropriate in a
  professional setting

### Our Responsibilities

Project maintainers are responsible for clarifying the standards of acceptable
behavior and are expected to take appropriate and fair corrective action in
response to any instances of unacceptable behavior.

Project maintainers have the right and responsibility to remove, edit, or
reject comments, commits, code, wiki edits, issues, and other contributions
that are not aligned to this Code of Conduct, or to ban temporarily or
permanently any contributor for other behaviors that they deem inappropriate,
threatening, offensive, or harmful.

### Scope

This Code of Conduct applies both within project spaces and in public spaces
when an individual is representing the project or its community. Examples of
representing a project or community include using an official project e-mail
address, posting via an official social media account, or acting as an appointed
representative at an online or offline event. Representation of a project may be
further defined and clarified by project maintainers.

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be
reported by contacting the project team at [INSERT EMAIL ADDRESS]. All
complaints will be reviewed and investigated and will result in a response that
is deemed necessary and appropriate to the circumstances. The project team is
obligated to maintain confidentiality with regard to the reporter of an incident.
Further details of specific enforcement policies may be posted separately.

Project maintainers who do not follow or enforce the Code of Conduct in good
faith may face temporary or permanent repercussions as determined by other
members of the project's leadership.

### Attribution

This Code of Conduct is adapted from the [Contributor Covenant][homepage], version 1.4,
available at [http://contributor-covenant.org/version/1/4][version]
