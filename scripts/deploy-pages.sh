#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT=$(git rev-parse --show-toplevel)

# If you have local (uncommitted) changes, we stash them so we can freely checkout/merge,
# then restore them before building/copying into build/.
NEED_STASH=0
if ! git -C "$REPO_ROOT" diff --quiet \
  || ! git -C "$REPO_ROOT" diff --cached --quiet \
  || [ -n "$(git -C "$REPO_ROOT" ls-files --others --exclude-standard)" ]; then
  git -C "$REPO_ROOT" stash push -u -m "deploy-pages $(date -Iseconds)"
  NEED_STASH=1
fi

# Work on the staging branch that contains build/
git -C "$REPO_ROOT" checkout gh-pages
git -C "$REPO_ROOT" merge main --no-edit

if [ "$NEED_STASH" -eq 1 ]; then
  git -C "$REPO_ROOT" stash pop
fi

# Build webpack projects (configured to emit into build/<project>/)
npm --prefix "$REPO_ROOT/js-fullstack/javascript/restaurant-page" run build
npm --prefix "$REPO_ROOT/js-fullstack/javascript/todo-list" run build

# Build Vite projects (emit to dist/, then copy into build/<project>/)
npm --prefix "$REPO_ROOT/js-fullstack/javascript/weather-appleish" run build

# Copy static projects into build/<project>/
mkdir -p "$REPO_ROOT/build"

rsync -a --delete --exclude ".DS_Store" \
  "$REPO_ROOT/js-fullstack/javascript/library/" \
  "$REPO_ROOT/build/library/"

rsync -a --delete --exclude ".DS_Store" \
  "$REPO_ROOT/js-fullstack/javascript/tic-tac-toe/" \
  "$REPO_ROOT/build/tic-tac-toe/"

rsync -a --delete --exclude ".DS_Store" \
  "$REPO_ROOT/js-fullstack/intermediate-html-css/admin-dashboard/" \
  "$REPO_ROOT/build/admin-dashboard/"

rsync -a --delete --exclude ".DS_Store" \
  "$REPO_ROOT/js-fullstack/intermediate-html-css/sign-up-form/" \
  "$REPO_ROOT/build/sign-up-form/"

mkdir -p "$REPO_ROOT/build/weather-appleish"
rsync -a --delete --exclude ".DS_Store" \
  "$REPO_ROOT/js-fullstack/javascript/weather-appleish/dist/" \
  "$REPO_ROOT/build/weather-appleish/"

# Commit only the build/ output (source changes stay uncommitted unless you commit them yourself)
git -C "$REPO_ROOT" add build/
if ! git -C "$REPO_ROOT" diff --cached --quiet; then
  git -C "$REPO_ROOT" commit -m "Deploy: pages"
fi

# Push build/ subtree to the real gh-pages branch
(git -C "$REPO_ROOT" branch -D gh-pages-temp >/dev/null 2>&1) || true
git -C "$REPO_ROOT" subtree split --prefix build -b gh-pages-temp
git -C "$REPO_ROOT" push origin gh-pages-temp:gh-pages

# Return to main + cleanup
git -C "$REPO_ROOT" checkout main
(git -C "$REPO_ROOT" branch -D gh-pages-temp >/dev/null 2>&1) || true
