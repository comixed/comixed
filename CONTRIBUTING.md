# Contributing to ComiXed

Thank you for contributing to ComiXed! Please follow these guidelines when setting up your development environment and submitting pull requests.

## Prerequisites

* **Java 25** (Eclipse Temurin recommended)
* **Maven** (use the included `./mvnw` wrapper)
* **Node.js & pnpm** (automatically managed by `frontend-maven-plugin` during Maven builds, or install `pnpm` locally for standalone Angular development in `comixed-webui/`)

## Building Locally

To build the entire multi-module project (backend + Angular frontend):

```bash
./mvnw clean package
```

To run only frontend development tasks inside `comixed-webui/`:

```bash
cd comixed-webui
pnpm install
pnpm test
```

## Commit & Pull Request Guidelines

ComiXed uses **semantic-release** to automatically calculate version numbers, generate `CHANGELOG.md`, and publish GitHub Releases and Docker images.

### Conventional Commits
All pull requests are **squash-merged** into `main`, using the **Pull Request Title** as the final commit message. Your PR title **must** follow the [Conventional Commits](https://conventionalcommits.org) specification:

```text
<type>(<optional-scope>): <description starting with lowercase>
```

| Prefix | Release Impact | Example |
| :--- | :--- | :--- |
| `fix:` | Patch release (`4.1.0` → `4.1.1`) | `fix(rest): handle missing comic metadata gracefully` |
| `feat:` | Minor release (`4.1.0` → `4.2.0`) | `feat(opds): add reading list feed support` |
| `feat!:` / `fix!:` | Major release (`4.1.0` → `5.0.0`) | `feat(api)!: remove deprecated v1 comic endpoints` |
| `docs:`, `chore:`, `refactor:`, `test:`, `ci:` | No release triggered | `chore(deps): bump spring boot version` |

### Branch & Release Model
* **`main` (Development Prereleases):** Every PR merged to `main` automatically triggers a prerelease build tagged as `vX.Y.Z-dev.N` (e.g., `v4.1.0-dev.1`) and pushes a matching `:4.1.0-dev.1` Docker image.
* **`release/vX.Y` (Production Releases):** Stable releases are cut from `release/vX.Y` branches (e.g., `release/v4.1`), which publish `v4.1.0`, update `CHANGELOG.md`, and tag the `:latest` Docker image.
* **Do Not Manually Edit Versions:** Never manually modify `<revision>` in `pom.xml` or `"version"` in `comixed-webui/package.json` inside a pull request—CI updates both automatically during release builds.
