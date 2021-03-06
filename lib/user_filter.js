'use strict';

exports.filter = filter;
function filter(user) {
  return {
    id: user.id,
    nick: user.nick,
    online: user.online,
  }
}

exports.filterExcept = function(excludeId, user) {
  if (user.id === excludeId) {
    return user;
  } else {
    return filter(user);
  }
}
