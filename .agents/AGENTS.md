# Project Customization Rules

## Conventional Commits (v1.0.0)

All commit messages, branch name specifications, and pull requests in this repository must strictly adhere to the [Conventional Commits v1.0.0 Specification](https://www.conventionalcommits.org/en/v1.0.0/).

### 1. Structure

Commit messages must follow this structure:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 2. Allowed Types

- `feat`: A new user-facing feature.
- `fix`: A bug fix or user-facing correction.
- `docs`: Documentation edits.
- `style`: Visual style updates, code formatting, linting fixes (no code logic changes).
- `refactor`: Restructuring code files or logic without changing public behavior or adding features.
- `perf`: Logic optimizations focused on performance improvements.
- `test`: Adding or correcting unit/integration tests.
- `build`: Changes impacting build tools, scripts, or package dependencies (e.g. package.json, vite.config.ts).
- `ci`: CI pipeline updates.
- `chore`: Maintenance modifications (e.g. updating .gitignore, configs).

### 3. Guidelines

- **Imperative Tone**: Use the imperative, present tense in the description (e.g., "add auth context" instead of "added auth context").
- **No Period**: Do not end the commit title/description with a period.
- **Lowercase Title**: Keep the commit title description lowercase.
