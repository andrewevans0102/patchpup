# Security policy

## Supported version

Security fixes are developed against the latest version on the default branch. This is an educational sample, not a managed service; teams should review and maintain their own fork.

## Reporting a vulnerability

Please report suspected vulnerabilities privately through GitHub's **Report a vulnerability** feature on the repository's Security tab. If private vulnerability reporting is unavailable, contact a repository maintainer privately through GitHub. Do not include credentials or sensitive repository data in a public issue.

Include the affected version or commit, impact, and a concise description of the conditions needed to observe the issue. A maintainer will acknowledge the report and coordinate a fix and disclosure with the reporter.

## Security assumptions

PatchPup runs third-party model-generated code in a GitHub Actions runner. It is designed for authorized maintainers and disposable test repositories, not as a sandbox for hostile repositories. Keep the actor allowlist small, protect workflow and agent-policy files with review, limit Actions permissions, protect the default branch, and require a human to review generated pull requests. See the trust-boundary and workflow sections in [README.md](README.md).
