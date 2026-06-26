---
description: Fetch and address review comments on the current PR. For each open comment, understand what the reviewer wants, apply the fix, and reply explaining what was done (or why it wasn't done).
---

# /gh-review — Address PR Review Comments

You are helping the user respond to code review on their open PR.

1. Find the PR for the current branch: `gh pr list --head $(git branch --show-current) --json number,title`.
2. Fetch open review comments: `gh pr view <number> --json reviews,comments`.
3. For each unresolved comment:
   a. Read the relevant file and understand the context.
   b. If the fix is clear and small, apply it directly, then reply to the comment explaining the change.
   c. If the comment is ambiguous or requires a large refactor, surface it to the user with your recommended interpretation and ask before acting.
4. After all comments are addressed, commit the changes with a message like "Address review comments from PR #N".
5. Push and report which comments were fixed vs. which need user input.

Never mark a comment as resolved without actually making the change or explaining why not.
