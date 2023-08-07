#!/bin/sh
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACMR | sed 's| |\\ |g')
[ -z "$STAGED_FILES" ] && exit 0

nx format && \
npx nx affected --target=lint && \
npx nx affected --target=test --code-coverage && \
npx nx affected --target=build --exclude="apps/*" && \
echo "$STAGED_FILES" | xargs git add # Add the modified files to git

exit 0
