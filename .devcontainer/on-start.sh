#!/bin/bash
set -e

# Ensure Claude Code and GitHub MCP server are installed on every startup
if ! command -v claude &> /dev/null; then
  echo "[on-start] Installing Claude Code..."
  npm install -g @anthropic-ai/claude-code @modelcontextprotocol/server-github
fi

# Pull latest changes from the current branch (safe, fast-forward only)
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
if [ -n "$BRANCH" ] && [ "$BRANCH" != "HEAD" ]; then
  echo "[on-start] Pulling latest changes from origin/$BRANCH..."
  git fetch origin "$BRANCH" 2>/dev/null && \
    git merge --ff-only "origin/$BRANCH" 2>/dev/null && \
    echo "[on-start] Synced with remote." || \
    echo "[on-start] Could not fast-forward (local changes present). Skipping pull."
fi

# Install npm deps if package.json changed
cd /workspaces/Test/admin
npm install --silent

echo "[on-start] Ready."
