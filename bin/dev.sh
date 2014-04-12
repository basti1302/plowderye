#!/usr/bin/env bash

pushd `dirname $0`/.. > /dev/null
nodemon --watch plowderye.js --watch lib --watch node_modules plowderye.js --dev true --logging:console:enabled true --logging:console:level debug --logging:file:enabled false --logging:exceptions:console:enabled false --logging:exceptions:file:enabled false
popd > /dev/null
