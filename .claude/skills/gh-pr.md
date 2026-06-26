---
description: Create a pull request from the current branch to main. Stages uncommitted changes, writes a descriptive PR title and body based on the diff, pushes, and opens the PR.
---

# /gh-pr — Create Pull Request

You are helping the user create a pull request. Follow these steps:

1. Run `git status` and `git log main..HEAD --oneline` to understand what's on this branch.
2. Run `git diff main...HEAD` to read all changes.
3. If there are uncommitted changes, ask the user if they should be committed first. If yes, stage and commit them with a descriptive message.
4. Push the branch: `git push -u origin <current-branch>`.
5. Create the PR with `gh pr create` using a clear title (under 70 chars) and a body with:
   - ## Summary (2-4 bullet points of what changed and why)
   - ## Test plan (what to verify)
6. Return the PR URL.

Keep the PR title and body in the same language the user has been using in this session.
