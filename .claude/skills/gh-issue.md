---
description: Create a GitHub issue, or list/view existing ones. Pass a title to create, or no args to list open issues.
---

# /gh-issue — GitHub Issues

**If the user provided a title or description:** Create a new issue.
- Use `gh issue create --title "<title>" --body "<body>"` with a clear description of the problem or feature.
- Return the issue URL.

**If no args or the user says "ver issues" / "listar":** List open issues.
- Run `gh issue list --limit 20` and present them in a clean table: number, title, labels, author, date.

**If the user references an issue number (e.g. "#42"):** Show its details.
- Run `gh issue view 42` and summarize: title, status, description, comments.

Keep all output concise. If creating an issue, ask the user if they want to link it to the current branch's PR afterward.
