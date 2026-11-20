# Contributing to PatchPup

Thanks for helping improve PatchPup. Contributions should keep the example understandable and preserve the separation between generated application changes and workflow/security policy.

## Development setup

Use Node.js 22 or newer and npm:

```sh
npm ci
npm test
npm run typecheck
```

For the sample API, keep implementation in `src/` and tests in `test/`. Add or update tests for observable behavior. Keep changes focused and document any behavior that affects reuse or the GitHub Actions setup.

## Pull requests

- Explain the problem and the intended behavior.
- Include test results for `npm test` and `npm run typecheck`.
- Do not include credentials, tokens, private issue content, or generated run artifacts.
- Expect human review; passing tests do not replace review.

Changes to `.github/workflows/**`, `.opencode/**`, `scripts/**`, package scripts, dependency versions/lockfiles, authorization logic, or verification gates change the trust model. Call them out explicitly and request maintainer review. Keep the implementation agent's default edit scope limited to `src/**` and `test/**` unless the harness, path checks, and tests are deliberately updated together.

## Security reports

Please do not open a public issue for a suspected vulnerability. Follow the private reporting instructions in [SECURITY.md](SECURITY.md).
