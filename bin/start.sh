#!/usr/bin/env bash

pushd `dirname $0`/.. > /dev/null
nodemon --ignore . plowderye.js
popd > /dev/null
