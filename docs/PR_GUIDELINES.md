# 📋 Pull Request Review Guidelines & Checklist

This document outlines the standard operating procedures for reviewing and merging Pull Requests (PRs) in the YuvaHub repository. These guidelines ensure a consistently high bar for code quality, security, and maintainability.

## 🛑 Hard Rules for Merging
- **CI/CD Checks:** Under absolutely no circumstances can a PR be merged if the continuous integration (CI) pipelines are failing. All tests, linters, and type-checks must pass.
- **Approvals:** A minimum of one approval from a core maintainer is required.
- **No Self-Merging:** Contributors cannot merge their own PRs.

---

## ✅ Reviewer Checklist

Maintainers should use the following checklist when evaluating a PR. (This can be copy-pasted into PR review comments).

- [ ] **Architecture:** Does this change follow the established patterns (e.g., separating routes, controllers, and services)?
- [ ] **Performance:** Are there any obvious N+1 query problems, memory leaks, or heavy synchronous operations blocking the event loop?
- [ ] **Security:** Is user input validated/sanitized? Are proper authorization checks in place?
- [ ] **Tests:** Are there unit or integration tests for new business logic? Do existing tests still pass?
- [ ] **Documentation:** Are new features, environment variables, or complex logic properly documented?

---

## 💅 Stylistic Rules & Code Quality

To prevent messy Git histories and maintain a clean codebase, all code must adhere to the following stylistic rules:

1. **Strict TypeScript:** The use of `any` is strictly prohibited. All variables, parameters, and return types must have explicit or properly inferred types.
2. **Conventional Commits:** PR titles and commit messages must follow the Conventional Commits specification (e.g., `feat:`, `fix:`, `docs:`, `refactor:`).
3. **Tailwind CSS Ordering:** Utility classes should be organized logically (e.g., layout first, then spacing, typography, and colors). Automated formatting via Prettier is strongly encouraged.

---

## 🔀 Merge Strategy

To keep the repository's Git history linear and readable, follow these merge strategies:
- **Squash and Merge:** Use this for 95% of PRs. It condenses all of a contributor's messy "wip" and "fix typo" commits into a single, clean commit on the main branch.
- **Rebase and Merge:** Use this *only* for large, epic-level branches where preserving the individual commit history adds significant value for future debugging.

---

## 💬 Communication Guidelines

Code reviews can be subjective, but our communication must always be objective and polite.
- **Be Actionable:** Instead of saying *"This is wrong"*, say *"Consider extracting this logic into a separate utility function to improve reusability."*
- **Ask Questions:** Use questions to guide the contributor rather than dictating solutions (e.g., *"What happens if `user.id` is undefined here?"*).
- **Praise Good Work:** If a contributor wrote an elegant solution or excellent tests, call it out! A simple *"Great job on this implementation!"* goes a long way.
