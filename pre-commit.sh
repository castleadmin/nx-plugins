#!/bin/bash
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACMR | sed 's| |\\ |g')

nx format && \
npx nx affected --target=lint && \
npx nx affected --target=test --code-coverage && \
npx nx affected --target=build --exclude="apps/*"

exitCode="$?"
if [ "$exitCode" -ne 0 ]
then
  exit "$exitCode"
fi

[ -z "$STAGED_FILES" ] && exit 0
 # Add the modified files to git
echo "$STAGED_FILES" | xargs git add

exit 0
