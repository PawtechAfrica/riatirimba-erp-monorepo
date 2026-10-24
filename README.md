# RIATIRIMBA TVC ERP

Welcome to the RIATIRIMBA TVC ERP monorepo. This document defines project guidelines, workspace organization, and developer rules.

---

## The 10 Pawmandments (Core Developer Rules)

Keep these rules close to your terminal:

1. **Git pull before writing code.** Avoid awakening the ancient beast known as *Merge Conflict*.
2. **Test locally before pushing.** Production is sacred ground—"it works on my machine" is not recognized.
3. **Never push directly to `main`.** Create feature branches and submit pull requests. The CI pipeline has enough trust issues already.
4. **Write conventional commit messages.** `fix`, `fixed`, and `final-final-v2` are not historical records. Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).
5. **Update environment configs.** Production cannot read your mind when you introduce new environment variables.
6. **Use `workflow_dispatch` for deployments.** Automatic workflows consume minutes and developer patience.
7. **Back up the database before migrations.** *"Surely nothing will happen"* are famous last words.
8. **Communicate breaking changes.** Notify the team before modifying shared schemas or API contracts.
9. **Own your code.** Explain any logic upon request. *"The AI wrote it"* is not a valid defense.
10. **Never debug in Production.** Users are not your QA team.

> *"Whosoever holds the production credentials, if worthy, shall deploy."*

---

## Workspace Structure

### 1. `frontends/`
Contains frontend client applications (Admin Portal, Admission Portal, Student Portal).
- **Code Criteria**: UI dashboards, client-side routing, and web portals built with React and Vite.

### 2. `services/`
Contains backend microservices built with Node.js (Express or NestJS).
- **Code Criteria**: Independent domain services and database operations.
- **Service Standards**:
  - Always expose a `/health` endpoint.
  - Validate required environment variables on startup.
  - Scope all endpoints with explicit permissions by default.
  - Use standardized SDK helpers for response and error handling.

### 3. `erp-sdk/`
Contains shared, capability-oriented libraries (`@erp/sdk/shared/*`, `@erp/sdk/server/*`, `@erp/sdk/frontend/*`).
- **Code Criteria**: Reusable schemas, formatters, HTTP client bases, and logger helpers shared across multiple projects.
- **Do Not Include**:
  - Private database models or single-service utilities.
  - Environment variables intended strictly for specific microservices.

![We don't do that here](https://media1.tenor.com/m/fBvQV_5Lp6UAAAAC/we-dont-do-that-here-black-panther.gif)

---

## Dependency & Maintenance Policy

- **Keep dependencies current.** Audit and update packages regularly to avoid technical debt.
- **Avoid code duplication.** Reuse `@erp/sdk` capabilities instead of duplicating shared logic.
- **Offload domain logic.** If your service owns a domain, handle domain tasks internally to minimize cross-service roundtrips.
