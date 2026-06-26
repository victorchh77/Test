---
description: Show the current state of the branch — uncommitted changes, commits ahead of main, open PR (if any), and CI check status on that PR.
---

# /gh-status — Branch & PR Status

Give the user a concise status report of the current branch. Run these in parallel:

1. `git status --short` — uncommitted changes
2. `git log main..HEAD --oneline` — commits ahead of main
3. `gh pr list --head $(git branch --show-current) --json number,title,state,url` — open PR for this branch
4. If a PR exists, `gh pr checks <number>` — CI status

Format the report as:

**Branch:** `<branch-name>`
**Commits ahead of main:** N
**Uncommitted changes:** (list files or "none")
**PR:** #N — <title> — <state> — <url>
**CI:** (pass/fail/pending per check, or "no PR")

Keep it under 20 lines. Flag anything that needs attention.
