# PatchPup learnings

This file is for short, human-reviewed operational lessons that remain useful across runs.
It is not a transcript, model scratchpad, or place to append unverified agent claims.

- Gate both the person who applies the trigger label and the issue author before starting a job with model secrets or write permissions.
- Keep model edits on a task branch, validate changed paths, then let executable project checks—not model narration—decide whether publishing is allowed.
- Serialize by issue number and make an already-open pull request a clear no-op on duplicate triggers.
- Keep credentials out of the model child process except for the provider key required to invoke the model; never give it the GitHub write token.
