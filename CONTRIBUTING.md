# Contributing to Enterprise Sales Copilot

How this project is governed, and what we ask of contributors. Thanks for helping.

# Governance model

## Salesforce sponsored

Open sourcing this project is meant to grow the contributor and user base.
Only Salesforce employees get `admin` rights, and they decide which contributions land.

# Getting started

See [README.md](README.md) for setup and basic usage. For questions or discussion, open a GitHub Issue or contact the maintainers.

# Issues, requests, and ideas

Use GitHub Issues for bugs, feature requests, and ideas.

### Bug reports and fixes
- If you find a bug, search the [Issues](https://github.com/SalesforceAIResearch/enterprise-sales-copilot/issues). If it is not tracked yet, [create a new issue](https://github.com/SalesforceAIResearch/enterprise-sales-copilot/issues/new) and fill out the Bug Report section. You can still comment on closed issues. They get reviewed.
- Reproducible bugs get the `bug` label.
- To submit a fix, [send a Pull Request](#creating-a-pull-request) and mention the issue number.
  - Include tests that isolate the bug and show it is fixed.

### New features
- To add functionality, describe the problem in a [new Issue](https://github.com/SalesforceAIResearch/enterprise-sales-copilot/issues/new).
- Feature requests get the `enhancement` label.
- Wait for maintainer feedback before writing a lot of code. Some enhancements do not fit the project's goals right now.

### Tests, documentation, miscellaneous
- Improvements to tests, clearer docs, alternative implementations, or other changes are welcome.
  - For a small change, [send a Pull Request](#creating-a-pull-request).
  - Otherwise, [open an Issue](https://github.com/SalesforceAIResearch/enterprise-sales-copilot/issues/new) first.

New to the project? Look for Issues labelled `good first contribution`.

# Contribution checklist

- [x] Clean, simple, well styled code
- [x] Atomic commits with descriptive messages. Mention related issues by number.
- [x] Comments
  - Module-level and function-level comments.
  - Comments on complex blocks or algorithms, with references when useful.
- [x] Tests
  - The test suite, if provided, must be complete and pass.
  - Increase code coverage.
- [x] Dependencies
  - Keep the dependency count low.
  - Prefer Apache 2.0, BSD3, MIT, ISC, and MPL licenses.
- [x] Reviews
  - Changes need peer code review approval.

# Creating a pull request

1. **Search existing issues** before filing a new one. If nothing matches, create an issue so others can track the work and chime in.
2. **Clone** your fork.
3. **Create** a branch for the work (for example `git br fix-issue-11`).
4. **Commit** on that branch.
5. **Push** to your fork (for example `git push fix-issue-11`).
6. **Open** a Pull Request against `main` and reference the issue(s). Keep the diff focused.
7. **Sign** the Salesforce CLA when prompted.

> **NOTE**: [Sync your fork](https://help.github.com/articles/syncing-a-fork/) before opening a pull request.

# Contributor License Agreement ("CLA")

To accept your pull request, we need a CLA. You only need to do this once for any Salesforce open source project.

Sign here: <https://cla.salesforce.com/sign-cla>

# Issues

We use GitHub issues for public bugs. Make the description clear enough that someone else can reproduce the problem.

# Code of conduct

Follow our [Code of Conduct](CODE_OF_CONDUCT.md).

# License

By contributing, you agree to license your contribution under the project [LICENSE](LICENSE.txt) and to sign the [Salesforce CLA](https://cla.salesforce.com/sign-cla).
