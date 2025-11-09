# Contributing to Yokan

First off, thank you for considering contributing to Yokan! We welcome contributions to make this project better. Whether it's reporting a bug, discussing improvements, or submitting a pull request, your help is greatly appreciated.

Please take a moment to review this document in order to make the contribution process easy and effective for everyone involved.

## Code of Conduct

By participating in this project, you are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing to ensure a welcoming and friendly environment.

## How You Can Contribute

There are many ways to contribute to Yokan:

-   **Reporting Bugs**: If you find a bug, please open an issue and provide as much detail as possible.
-   **Suggesting Enhancements**: Have an idea for a new feature or an improvement to an existing one? Open an issue to start a discussion.
-   **Pull Requests**: If you're ready to contribute code, you can open a pull request.

## Reporting Bugs

A great bug report is clear and provides enough information for us to reproduce the issue. When opening an issue, please include:

-   A clear and descriptive title.
-   A step-by-step description of how to reproduce the bug.
-   The expected behavior and what actually happened.
-   Your environment details (e.g., browser, OS, Yokan version).
-   Screenshots or screen recordings, if helpful.

## Suggesting Enhancements

We're always open to ideas for improving Yokan. When suggesting an enhancement, please:

-   Use a clear and descriptive title for the issue.
-   Provide a detailed description of the proposed enhancement and why it would be valuable.
-   Explain the workflow or use case it would support.

## Your First Code Contribution

Unsure where to begin? You can start by looking for issues tagged `good first issue` or `help wanted`. These are issues that we've identified as good starting points for new contributors.

## Pull Request Process

1.  **Fork the repository** and create your branch from `main`.
    ```bash
    git checkout -b feature/your-amazing-feature
    ```
2.  **Make your changes**. Please follow the existing code style. The project uses Prettier and ESLint to maintain code quality.
3.  **Add or update tests** as appropriate. All new features should have corresponding tests, and bug fixes should include a test that catches the bug.
    -   Server tests: `cd server && npm test`
    -   Client tests: `cd client && npm test`
4.  **Ensure all tests pass** before submitting your pull request.
5.  **Commit your changes** with a clear and concise commit message.
    ```bash
    git commit -m 'feat: Add some amazing feature'
    ```
    We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.
6.  **Push to your branch** and **open a Pull Request**.
    ```bash
    git push origin feature/your-amazing-feature
    ```
7.  In the body of your pull request, please provide a clear description of the problem and solution. Include the relevant issue number if applicable.

Thank you for your contribution!
