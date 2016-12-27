#!/usr/bin/env bash

set -e
set -o pipefail

if [ ! -d coverage ]; then
  echo "* Creating coverage directory";
  mkdir coverage;
else
  echo "Coverage directory exists !";
  exit 1;
fi

echo "* Checking specs sources presence/freshness";
# (Re)compile spec sources
for specSource in `find test/specs -type f -name '*.spec.ts'`; do
  if [ ! -f `dirname $specSource`/`basename $specSource .ts`.js ] || [ "$specSource" -nt `dirname $specSource`/`basename $specSource .ts`.js ] ; then
    echo "  - Compiling $specSource";
    ./node_modules/.bin/browserify $specSource -p tsify -o `dirname $specSource`/`basename $specSource .ts`.js;
  fi;
done;

echo "* Checking browser sources presence/freshness";
# (Re)compile browser sources
for specSource in `find test/specs -type f -name '*.browser.ts'`; do
  if [ ! -f `dirname $specSource`/`basename $specSource .ts`.js ] || [ "$specSource" -nt `dirname $specSource`/`basename $specSource .ts`.js ] ; then
    echo "  - Compiling $specSource";
    RAW=`dirname $specSource`/`basename $specSource .ts`.raw.js;
    INSTRUMENTED=`dirname $specSource`/`basename $specSource .ts`.js;
    ./node_modules/.bin/browserify $specSource -p tsify --debug -o $RAW;
    ./node_modules/.bin/istanbul instrument -x \"node_modules/**\" -i $RAW -o $INSTRUMENTED;
  fi;
done;
