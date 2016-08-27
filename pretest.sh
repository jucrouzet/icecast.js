#!/usr/bin/env bash

set -e
set -o pipefail

if [ ! -d coverage ]; then
  echo "* Creating coverage directory";
  mkdir coverage;
else
  echo "* Coverage directory exists";
fi

NEWTS=0;

if [ ! -f test/main.js ]; then
  NEWTS=1;
  echo "* test/main.js is not present, regenerating it";
else
  for tsSource in `find test -type f -name '*.ts'`; do
    if [ "$tsSource" -nt test/main.js ]; then
      echo "* $tsSource is newer than test/main.js, regenerating it";
      NEWTS=1;
      break;
    fi;
  done;
fi;
if [ $NEWTS -eq 0 ]; then
  echo "* test/main.js is up to date";
else
  browserify test/main.ts --debug -p tsify -o test/main.js;
fi;


if [ ! -f coverage/instrumented.js ] || [ test/main.js -nt ./coverage/instrumented.js ]; then
  echo "* Generating Istanbul instruments";
  ./node_modules/.bin/istanbul instrument -x \"node_modules/**\"  -i test/main.js -o ./coverage/instrumented.js;
else
  echo "* Istanbul instruments are up to date";
fi;
