# PatchPup

```text
      / \__
     (    @\___
     /         O
    /   (_____/
   /_____/   U
```

PatchPup is an open-source educational example of a Git-driven coding-agent workflow. An authorized GitHub issue labeled `patchpup` can produce a focused branch and a pull request after deterministic checks pass. A human reviews and merges; PatchPup never merges or deploys. The project is available under the Apache License 2.0; see [LICENSE](LICENSE).

> ⚠️ **Risk notice:** PatchPup invokes a remote LLM and executes the code it generates in a CI environment. Authorization, scope limits, and deterministic checks reduce risk, but they cannot guarantee that generated code is safe, correct, or free of vulnerabilities. Always review generated pull requests manually before merging. Test only in a disposable repository.

## Included

- A tiny TypeScript HTTP API with `GET /api/status` and a Node test suite.
- OpenCode implementation and read-only review agents, plus one narrow failure-triage skill.
- An issue-label GitHub Actions workflow with a separate authorization job, task-specific branch, per-issue concurrency, bounded repairs, and post-check PR publication.
- Structured JSONL run telemetry and a short, reviewed `LEARNINGS.md`.

## Trust boundaries and workflow

1. Label an issue `patchpup`. The authorization job reads only GitHub event metadata and a configured allowlist. It has no checkout, secrets, or token permissions. Both the triggering account and issue author must appear in `PATCHPUP_AUTHORIZED_ACTORS`; missing or malformed configuration fails closed.
2. Only an authorized result unlocks the second job, whose permissions are limited to `contents: write` and `pull-requests: write`. The runtime repeats the actor and author checks before model invocation.
3. The task branch is `patchpup/issue-<number>`. GitHub Actions serializes same-issue runs. If a pull request already exists for that branch, a duplicate trigger is a clear no-model-call no-op.
4. OpenCode receives a compact issue title/body (body capped at 8,000 characters), repository guidance, and app/test files under `src/**` and `test/**`. Its implementation agent cannot use shell and can edit only those directories. The harness independently rejects out-of-scope diffs.
5. The model call uses the documented non-interactive `opencode2 run --standalone --model … --agent … --format json`. The pinned `@opencode/cli` package installs both `opencode` and `opencode2`; PatchPup selects `opencode2` so the V2 `permissions` configuration is active. Its version is pinned to `2.3.0` in `package.json` and the lockfile. The OpenCode process gets an isolated temporary home and only the OpenRouter API key; the GitHub token is removed from that process. Verification commands also run without credentials. The harness retains the token for authenticated Git operations and PR API calls.
6. The harness runs `npm run typecheck` and `npm test`; actual exit statuses decide pass/fail. It allows at most two repairs after the initial attempt, with current diff and compact failure evidence on each retry. Persistent failure stops without a PR and leaves a summary, diagnostics, and JSONL artifact.
7. Only after checks pass does the harness commit and push the task branch and create a PR. A human owns review, merge, and deployment.

Issue text is untrusted input. The workflow reads it as event data, JSON-encodes it into the model request, and passes it as an argument without a shell. It is never interpolated into workflow expressions or shell commands. OpenCode's shell tool is denied. These layered safeguards do not guarantee model output is safe.

The `patchpup-verify` agent is an optional, read-only review aid for a human reviewer. The automated workflow does not treat model review as a gate; only the actual type-check and test exit statuses determine whether it may publish.

## OpenCode references and version

The sample follows the official [CLI command documentation](https://opencode.ai/docs/cli/commands/) for non-interactive `run`, `--standalone`, model/agent selection, and JSON output; [configuration](https://opencode.ai/docs/config/), [agents](https://opencode.ai/docs/agents/), and [skills](https://opencode.ai/docs/skills/) docs for project config, Markdown agents, permissions, and skill layout. The `@opencode/cli` package provides a V1-compatible `opencode` alias and the current V2 CLI as `opencode2`; this project uses `opencode2`, whose pinned `run --help` documents `--standalone`. The checked-in npm dependency and lockfile control version `2.3.0` rather than installing `latest` in Actions.

## Clone and reuse

To use PatchPup as a starting point for your own team, fork this repository into your organization's GitHub account, then clone that fork:

```sh
git clone https://github.com/<YOUR-ORG>/<YOUR-REPO>.git patchpup
cd patchpup
npm ci
npm test
npm run typecheck
```

Replace `<YOUR-ORG>/<YOUR-REPO>` with the owner and repository name of your fork. To work from a local copy instead, clone the repository URL provided by its owner. Keep the lockfile and use `npm ci` for reproducible installs. The package is a runnable application, not a published npm library; `private: true` prevents accidental npm publication.

Before enabling the workflow in a team repository:

1. Review the workflow, OpenCode agent permissions, `AGENTS.md`, and this README against your repository's code and risk tolerance. The included agent is deliberately limited to `src/**` and `test/**`; update the allowed paths, prompt guidance, harness validation, and checks together if your project differs.
2. Use a disposable repository for the first workflow run. Enable GitHub Actions and allow Actions to create pull requests. Protect the default branch and require human review before merging.
3. Add a repository Actions variable named `PATCHPUP_AUTHORIZED_ACTORS` containing a JSON array of exact GitHub login names approved to trigger model runs. Both the person applying the label and the issue author must be in the allowlist.
4. Add `OPENROUTER_API_KEY` as a repository Actions secret. Do not store it in a variable, source file, issue, or log.
5. Create the `patchpup` issue label and test only with issues authored and labeled by allowlisted users. Review every generated diff and PR before merging.

Changes to `.github/workflows/**`, `.opencode/**`, `scripts/**`, package scripts, dependency lockfiles, and verification gates affect trust boundaries. Require maintainer review for those changes. See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md).

## Set up an authorized test repository

Use a **disposable GitHub repository** owned by you or your team. A private repository is a good choice for testing; do not trial the workflow first against production.

1. Push your fork and its committed `package-lock.json` to the test repository. Enable Actions and permit Actions to create pull requests in repository settings if required by repository policy.
2. In **Settings → Secrets and variables → Actions → Variables**, add `PATCHPUP_AUTHORIZED_ACTORS` as a JSON array of exact GitHub login names for approved maintainers, e.g. `["User1", "User2"]`. Only list people approved to trigger model runs. This revision uses `openrouter/recursive/flint-v1.0:free`.
3. Under **Secrets**, add `OPENROUTER_API_KEY` from your OpenRouter account. The selected model is free, but OpenRouter still requires an API key for account access and rate limits. Never put credentials in a variable, issue, file, or log.
4. The `authorize` job has no token permissions. `build-pr` gets only `contents: write` and `pull-requests: write`, and only after authorization. Repository policy must permit branch pushes and PR creation. This workflow does not use `pull_request_target`.
5. Create a test issue as an allowlisted user asking for a focused change such as “Add `GET /api/greeting` returning `{"message": "Hello, PatchPup!"}` and cover it with an API test.” Then an allowlisted user applies the `patchpup` label.

### Safe manual test outcomes

- **Success:** an authorized labeler and issue author produce `patchpup/issue-N`; both project checks pass; a PR appears with the issue reference and human-review reminder.
- **Duplicate:** label the same issue again after a PR exists; the run reports the existing PR without another model call or PR.
- **Unauthorized actor or author:** the authorization job reports rejection; the write-capable job is skipped, with no model key or write token supplied to it.
- **Bad generated patch:** force a check failure in the disposable repo. PatchPup makes no more than two repairs, then reports evidence and creates no PR.
- **Out-of-scope edit:** a changed path outside `src/**` and `test/**` causes failure before checks and publishing.

## Local development and checks

Requires Node.js 22 or newer and npm.

```sh
npm ci
npm run dev
```

The API listens at `http://localhost:3000` (`PORT` overrides the port). In another terminal:

```sh
curl http://localhost:3000/api/status
npm test
npm run typecheck
```

Expected response: `{"status":"ok"}`. The local API binds to loopback and is intended for local development. A local agent run requires an actual authorized GitHub `issues.labeled` event payload, `OPENROUTER_API_KEY`, an optional `PATCHPUP_MODEL`, and a GitHub token with the workflow's two permissions. It can publish to GitHub after checks, so use the disposable test repository. Never commit real credentials in `.env`.

The project does not automatically load `.env`; `.env.example` documents the variables. Export them in your shell or use your team's secret manager when running the local agent.

## Telemetry and durable learning

Each JSONL event includes an ISO timestamp, `run_id`, `issue_ref`, nullable `pr_ref`, and event name. Additional fields record stage/attempt, actor and issue-author login, branch and changed paths, model/agent/duration/exit status, verification command/exit status/duration and compact failure summary, retry count, PR URL/state, or redacted failure message. No full prompt, environment values, or credentials are logged. Events and diagnostics are uploaded as a 14-day workflow artifact.

Example:

```json
{"timestamp":"2026-11-17T12:00:00.000Z","run_id":"123456-1","issue_ref":"#7","pr_ref":null,"event":"verification","command":"npm test","exit_code":0,"duration_ms":842}
```

Run telemetry explains an individual run and is temporary. `LEARNINGS.md` contains only concise, reviewed lessons for future operation; it is not automatically populated from model output.

## Known limitations

- This revision uses OpenRouter's free `openrouter/recursive/flint-v1.0:free` model, which is designed for coding-agent tasks and supports tool calls. Recursive says it does not train on prompts, but may retain them; free model availability and rate limits can change. It uses OpenRouter's standard global routing, which does not guarantee US/EU processing; enforced regional routing requires an OpenRouter Business or Enterprise plan. The OpenCode Gemini conversation-format fix is tracked in [upstream PR #64641](https://github.com/anomalyco/opencode/pull/64641); a future revision could adopt it or support more providers and regional routing options.
- Authorization depends on maintainers protecting `PATCHPUP_AUTHORIZED_ACTORS` and workflow changes. GitHub has no universal exact “maintainer” expression, so this sample uses an explicit login allowlist for both actor and author.
- Actions concurrency prevents same-issue runs from racing inside this workflow group; administrators can still change settings or bypass repository protections. This is not a sandbox for hostile repositories.
- OpenCode permissions are not a security boundary by themselves. The sample denies shell, restricts edit paths, checks the diff, withholds the GitHub token from the model process, and verifies outputs; generated code can still be wrong or insecure.
- This example expects OpenRouter free models, a GitHub-hosted runner, a GitHub issue event, and permission to create branches and PRs. Free model availability and quotas depend on OpenRouter. It does not treat fork-origin issues as trusted, support follow-up PR comments, deploy, auto-merge, or arbitrary project test commands.
- A human must inspect the diff, re-run checks as appropriate, and decide whether to merge.

## Learning references

- Inspiration: [Building a Git-Driven Agentic Workflow](https://andrewevans.dev/blog/2026-10-22-building-a-git-driven-agentic-workflow/).
- OpenCode docs: [CLI commands](https://opencode.ai/docs/cli/commands/), [configuration](https://opencode.ai/docs/config/), [agents](https://opencode.ai/docs/agents/), [skills](https://opencode.ai/docs/skills/), [providers](https://opencode.ai/docs/providers/), and [models](https://opencode.ai/docs/models/). OpenRouter docs: [free model variants](https://openrouter.ai/docs/guides/routing/model-variants/free) and [in-region routing](https://openrouter.ai/docs/guides/features/in-region-routing).
