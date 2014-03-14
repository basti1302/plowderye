pushd `dirname $0`/..
nodemon --watch lib --watch node_modules plowderye.js
popd
