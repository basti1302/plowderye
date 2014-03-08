#!/usr/bin/env bash
pushd `dirname $0`/..
find data/messages/ -type f -not -name .gitignore -delete
find data/rooms/ -type f -not -name .gitignore -delete
popd
