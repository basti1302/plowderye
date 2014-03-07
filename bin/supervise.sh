#!/usr/bin/env bash
pushd `dirname $0`/..
supervisor --watch lib,node_modules -- plowderye.js
popd
