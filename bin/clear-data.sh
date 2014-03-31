#!/usr/bin/env bash
pushd `dirname $0`/../data > /dev/null && find . -mindepth 1 -not -name .gitignore -delete
popd > /dev/null
