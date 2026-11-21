## Description

<!-- Describe what this pull request changes and why. -->

Fixes #

## Pull Request Title Convention

This repository uses **Conventional Commits** and **Squash Merging** to automate releases and versioning. Please ensure your **Pull Request Title** follows the format `<type>(<optional-scope>): <lowercase description>`:

* `feat: ...` — New feature (triggers a **minor** version bump)
* `fix: ...` — Bug fix (triggers a **patch** version bump)
* `feat!: ...` or `fix!: ...` — Breaking change (triggers a **major** version bump)
* `docs:`, `chore:`, `refactor:`, `test:`, `ci:`, `build:` — Non-release maintenance changes

**Examples:**
* `feat(webui): add comic cover grid zoom slider`
* `fix(batch): prevent duplicate page hash imports`
* `docs: update docker volume configuration guide`

## Type of Change

- [ ] Bug fix (`fix:`)
- [ ] New feature (`feat:`)
- [ ] Breaking change (`feat!:` / `fix!:`)
- [ ] Documentation or maintenance (`docs:`, `chore:`, `refactor:`, `test:`)

## Checklist

- [ ] My PR title follows the Conventional Commits format above
- [ ] I have run `./mvnw test` locally and all tests pass
- [ ] I have updated documentation (`README.md`, `CONFIGURATION.md`, etc.) where applicable
