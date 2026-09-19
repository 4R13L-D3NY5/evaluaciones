# Gentle AI™ & Antigravity — Agent Skills Index

When working on this project (**Sistema de Evaluaciones SEA / SISA**), load the relevant skill(s) BEFORE writing any code.

## How to Use

1. Check the trigger column to find skills that match your current task.
2. Load the skill by reading the `SKILL.md` file at the listed path.
3. Follow ALL patterns and rules from the loaded skill and [.agents/rules/gentle-ai-conventions.md](.agents/rules/gentle-ai-conventions.md).
4. Multiple skills can apply simultaneously.

## SDD & ODD Workflow Skills

| Skill | Trigger | Path |
|-------|---------|------|
| `sdd-init` | Initialize SDD context, testing capabilities, and registry. | [`.agents/skills/sdd-init/SKILL.md`](.agents/skills/sdd-init/SKILL.md) |
| `sdd-explore` | Explore codebase context, dependencies, and architecture before proposing changes. | [`.agents/skills/sdd-explore/SKILL.md`](.agents/skills/sdd-explore/SKILL.md) |
| `sdd-propose` | Draft change proposals, motivation, and scope boundaries. | [`.agents/skills/sdd-propose/SKILL.md`](.agents/skills/sdd-propose/SKILL.md) |
| `sdd-spec` | Specify requirements, contracts, invariants, and edge cases. | [`.agents/skills/sdd-spec/SKILL.md`](.agents/skills/sdd-spec/SKILL.md) |
| `sdd-design` | Create detailed technical design, database changes, and component architecture. | [`.agents/skills/sdd-design/SKILL.md`](.agents/skills/sdd-design/SKILL.md) |
| `sdd-tasks` | Decompose implementation into atomic, executable, test-backed work units. | [`.agents/skills/sdd-tasks/SKILL.md`](.agents/skills/sdd-tasks/SKILL.md) |
| `sdd-apply` | Implement tasks with test-driven discipline, keeping tests and docs alongside code. | [`.agents/skills/sdd-apply/SKILL.md`](.agents/skills/sdd-apply/SKILL.md) |
| `sdd-verify` | Validate implementation with automated tests, docker health, and integration checks. | [`.agents/skills/sdd-verify/SKILL.md`](.agents/skills/sdd-verify/SKILL.md) |
| `sdd-archive` | Consolidate deliverables, update change logs, and close the work unit. | [`.agents/skills/sdd-archive/SKILL.md`](.agents/skills/sdd-archive/SKILL.md) |

## Work-Unit & Code Craft Skills

| Skill | Trigger | Path |
|-------|---------|------|
| `work-unit-commits` | Plan commits as reviewable work units (max ~400 lines/slice, tests with code). | [`.agents/skills/work-unit-commits/SKILL.md`](.agents/skills/work-unit-commits/SKILL.md) |
| `cognitive-doc-design` | Write docs, specs, and READMEs that minimize reader/reviewer cognitive load. | [`.agents/skills/cognitive-doc-design/SKILL.md`](.agents/skills/cognitive-doc-design/SKILL.md) |
| `comment-writer` | Draft PR comments, issue replies, and async collaboration notes. | [`.agents/skills/comment-writer/SKILL.md`](.agents/skills/comment-writer/SKILL.md) |
| `branch-pr` | Prepare branches and single PRs for review. | [`.agents/skills/branch-pr/SKILL.md`](.agents/skills/branch-pr/SKILL.md) |
| `chained-pr` | Split large features into chained or stacked PRs below review budgets. | [`.agents/skills/chained-pr/SKILL.md`](.agents/skills/chained-pr/SKILL.md) |
| `systemic-issue-triage` | Triage complex bugs, root causes, and blocked flows across the stack. | [`.agents/skills/systemic-issue-triage/SKILL.md`](.agents/skills/systemic-issue-triage/SKILL.md) |
| `judgment-day` | Run final sanity and risk assessments on deliverables. | [`.agents/skills/judgment-day/SKILL.md`](.agents/skills/judgment-day/SKILL.md) |

## Repository Architecture References

- **Backend**: Spring Boot 3.3.2, Java 21, Flyway migrations (`db/migration/`), Hexagonal/DDD architecture.
- **Frontend**: Angular 18, PrimeNG, Tailwind CSS, standalone components.
- **Workers**: Python 3.10/3.12, RabbitMQ AMQP, Typst, OpenCV OMR, Restic backups.
- **Security**: HashiCorp Vault Transit KMS (`sea-banco-kek`) for envelope encryption.
