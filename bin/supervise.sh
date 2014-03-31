#!/usr/bin/env bash
pushd `dirname $0`/.. > /dev/null
supervisor --watch lib,node_modules -- plowderye.js
popd > /dev/null
