#!/usr/bin/env bash

pushd `dirname $0`/..
nodemon --ignore . plowderye.js
popd
