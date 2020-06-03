# Contributing

When contributing to this repository, please first discuss the change you wish to make via issue,
email, or any other method with the owners of this repository before making a change. 

Please note we have a code of conduct, please follow it in all your interactions with the project.

## Commit Message Rules

The goal of the following rules is to make the output for the follow command line easier to read:

```git log --pretty=oneline```

as well as making it easier to generate releases, perform interactive rebasing, and any number of other project
related tasks.

Please adhere to the following rules for each commit. This will help make generating the RELEASE.md file
easier, and will help to make your contributions easier to understand.

 * Separate subject from body with a blank line
 * Limit the subject line to 50 characters
 * Capitalize the subject line
 * Do not end the subject line with a period
 * Use the imperative mood in the subject line
 * Wrap the body at 72 characters
 * Use the body to explain what and why vs. how

 Source: http://chris.beams.io/posts/git-commit/#seven-rules
 
### Do
 * Write the summary line and description of what you have done in the imperative mood, that is as if you were commanding someone. Start the line with "Fix", "Add", "Change" instead of "Fixed", "Added", "Changed".
 * Always leave the second line blank.
 * Line break the commit message (to make the commit message readable without having to scroll horizontally in gitk).

### Do Not
 * Don't end the summary line with a period - it's a title and titles don't end with a period.

### Tips
* If it seems difficult to summarize what your commit does, it may be because it includes several logical changes or bug fixes, and are better split up into several commits using git add -p.

## Commit Template

When working on code, please use the following template for your commits:

    Short (50 chars or less) summary of changes [#xxx]
    
    More detailed explanatory text, if necessary.  Wrap it to about 72
    characters or so.  In some contexts, the first line is treated as the
    subject of an email and the rest of the text as the body.  The blank
    line separating the summary from the body is critical (unless you omit
    the body entirely); tools like rebase can get confused if you run the
    two together.
    
    Further paragraphs come after blank lines.
    
      - Bullet points are okay, too
    
      - Typically a hyphen or asterisk is used for the bullet, preceded by a
        single space, with blank lines in between, but conventions vary here


where **xxx** is the issue number being addressed by the commit. Using this template, your changes are then
visible on the ticket's page. This lets everybody know what changes were made for any issue.

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

## Unit Tests

To help keep the code as thoroughly tested and understandable as possible, all features and bug fixes must come with some
set of unit tests to demonstrate and validate them. Contributions should never reduce the unit test coverage for the project.

Please also be sure that the contribution does not break any existing unit tests. So be sure to run the full suite of unit
tests for the entire project before submitting your pull request.

## Pull Requests

Ensure your branch builds without errors or warnings locally. Any PR that does not pass the automated build process 
will be automatically declined.

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
