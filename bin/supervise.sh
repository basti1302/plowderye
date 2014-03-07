#!/usr/bin/env bash
pushd `dirname $0`/..
supervisor --ignore public -- $d
popd
