# Contributing to Magnet CMS

Thank you for your interest in contributing to Magnet CMS! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

1. **Check existing issues**: Make sure the bug hasn't already been reported
2. **Create a new issue**: Use the bug report template
3. **Provide details**:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node.js/Bun version, etc.)
   - Relevant code snippets or error messages

### Suggesting Features

1. **Check existing issues**: Search for similar feature requests
2. **Create a new issue**: Use the feature request template
3. **Provide context**:
   - Clear description of the feature
   - Use case and motivation
   - Potential implementation approach (if you have ideas)

### Pull Requests

1. **Fork the repository**
2. **Create a branch**: Use a descriptive branch name
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```
3. **Make your changes**: Follow the coding standards below
4. **Test your changes**: Ensure all tests pass
5. **Commit your changes**: Follow the commit message conventions
6. **Push to your fork**: `git push origin your-branch-name`
7. **Create a Pull Request**: Fill out the PR template

## Development Setup

### Prerequisites

- **Bun** 1.2.2+ (recommended) or Node.js 18+
- **MongoDB** 6.0+ (for running examples and tests)
- Git

### Getting Started

```bash
# Clone your fork
git clone https://github.com/your-username/magnet.git
cd magnet

# Install dependencies
bun install

# Start development
bun run dev
```

### Running Tests

```bash
# Run all tests
bun run test:e2e

# Run specific test suite
cd apps/e2e
bun run test
```

### Building Packages

```bash
# Build all packages
bun run build

# Build specific package
cd packages/core
bun run build
```

## Coding Standards

### TypeScript

- **No `any` types**: Always use proper TypeScript types
- **Strict typing**: Use explicit types for function parameters and return values
- **Interfaces over types**: Prefer interfaces for object shapes
- **Use type guards**: Implement proper type narrowing

### Code Style

- **Formatter**: Biome is used for formatting (automatically applied)
- **Linting**: Run `bun run lint` before committing
- **Naming conventions**:
  - `camelCase` for variables and functions
  - `PascalCase` for classes and types
  - `UPPER_SNAKE_CASE` for constants

### Code Organization

- **Keep functions small**: Single responsibility principle
- **Use meaningful names**: Code should be self-documenting
- **Add comments**: Explain "why" not "what"
- **JSDoc comments**: Document all public APIs, decorators, and types

### Example Code Structure

```typescript
/**
 * Brief description of the function
 * @param param1 Description of param1
 * @param param2 Description of param2
 * @returns Description of return value
 */
export function exampleFunction(param1: string, param2: number): boolean {
  // Implementation
}
```

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Examples

```
feat(auth): add OAuth2 strategy support

fix(core): resolve schema validation issue

docs(readme): update installation instructions
```

## Project Structure

```
magnet/
├── apps/
│   ├── cats-example/      # Example application
│   ├── docs/              # Documentation site
│   └── e2e/               # E2E tests
├── packages/
│   ├── adapters/          # Database adapters
│   ├── client/            # Frontend packages
│   ├── common/            # Shared types and utilities
│   ├── core/              # Core framework
│   ├── plugins/           # Plugin packages
│   └── utils/             # Utility functions
└── scripts/               # Build and tooling scripts
```

### Package Guidelines

- Each package should have its own `package.json` with proper metadata
- Use workspace protocol for internal dependencies: `"@magnet/core": "workspace:*"`
- Export types and interfaces from `index.ts`
- Include proper TypeScript declarations

## Testing Guidelines

- **Write tests**: New features should include tests
- **Update tests**: Fix tests when modifying existing features
- **Test coverage**: Aim for good test coverage
- **E2E tests**: Add E2E tests for user-facing features in `apps/e2e`

### Running Linters and Type Checkers

```bash
# Lint all packages
bun run lint

# Type check all packages
bun run check-types
```

## Documentation

### Code Documentation

- **JSDoc comments**: Add to all exported functions, classes, and interfaces
- **Type documentation**: Document complex types and interfaces
- **Example usage**: Include code examples in JSDoc when helpful

### User Documentation

- **MDX files**: Update documentation in `apps/docs/content/docs/en/`
- **Readme updates**: Update relevant README files if needed
- **Examples**: Add examples to example apps when applicable

### Documentation Format

```typescript
/**
 * Creates a new schema instance with the provided options.
 *
 * @example
 * ```typescript
 * @Schema({ timestamps: true })
 * export class User {
 *   @Prop()
 *   name: string;
 * }
 * ```
 */
```

## Pull Request Process

1. **Update documentation**: Ensure all changes are documented
2. **Add tests**: Include tests for new features
3. **Run checks**: Ensure all linting and type checks pass
4. **Keep PRs focused**: One feature or fix per PR
5. **Write descriptive PRs**: Explain what and why, not just what
6. **Link issues**: Reference related issues in your PR description

### PR Checklist

- [ ] Code follows the project's coding standards
- [ ] All tests pass locally
- [ ] Documentation has been updated
- [ ] Changes have been tested
- [ ] Commit messages follow the convention
- [ ] No new linting errors
- [ ] TypeScript types are properly defined (no `any`)

## Review Process

- All PRs require review before merging
- Address review feedback promptly
- Be respectful and constructive in reviews
- Ask questions if something is unclear

## Questions?

- **Open an issue**: For bug reports or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check `apps/docs` for detailed documentation

## License

By contributing to Magnet CMS, you agree that your contributions will be licensed under the same license as the project (MIT License).
