---
description: Read the project's Cursor rules to ensure compliance with the established development constraints and MVP phases.
---

When starting work on this project or when directed by the user, you must always read and internalize the project's Cursor rules to align with the development workflow.

1. Read the main cursor rules file to understand high-level workflows and requirements:
   - Use `view_file` on `.cursorrules` located in the root directory.

2. Read all the specific rule files in the `.cursor/rules/` directory:
   - Use `list_dir` on `.cursor/rules` to find all `.mdc` files.
   - Use `view_file` to read the contents of each `.mdc` file (e.g. `browser-for-ui-review.mdc`, `design-optimization-phase.mdc`, `zero-cost-constraint.mdc`, etc.).

3. Review the current status and roadmap:
   - Use `view_file` on `DEVELOPMENT_STATUS.md`
   - Use `view_file` on `MVP_ROADMAP.md`

By following this workflow, you will ensure that all your development actions remain strictly within the current MVP phase, use the correct test users, and follow the exact instructions as if you were Cursor.
