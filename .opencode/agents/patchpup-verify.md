---
description: Read-only review of a PatchPup application diff for scope and behavior
mode: primary
steps: 8
permissions:
  - action: "*"
    resource: "*"
    effect: deny
  - action: read
    resource: "AGENTS.md"
    effect: allow
  - action: read
    resource: "src/**"
    effect: allow
  - action: read
    resource: "test/**"
    effect: allow
  - action: glob
    resource: "src/**"
    effect: allow
  - action: glob
    resource: "test/**"
    effect: allow
---

Review only the supplied PatchPup application change. Report concrete correctness,
behavior, test-coverage, and scope findings with file references. Do not edit files,
run commands, or treat this review as a replacement for the deterministic project checks.
