#!/usr/bin/env bash

pushd `dirname $0`/..
nodemon --watch lib --watch node_modules plowderye.js --logging:console:enabled true --logging:console:level debug --logging:file:enabled false --logging:exceptions:console:enabled false --logging:exceptions:file:enabled false
popd
