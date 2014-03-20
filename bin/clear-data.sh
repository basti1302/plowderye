#!/usr/bin/env bash
pushd `dirname $0`/../data
find . -mindepth 1 -not -name .gitignore -delete
popd
