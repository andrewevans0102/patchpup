# PatchPup repository guidance

PatchPup is an educational sample. Keep API behavior in `src/` and API tests in `test/`.
The issue agent may change only `src/**` and `test/**`. Do not edit package scripts,
workflow/security configuration, credentials, verification commands, or agent policy.
Keep changes focused on the issue and add or update tests for observable API behavior.

The workflow—not an agent's report—is authoritative for type-check and test results.
Human review and merge remain required.
