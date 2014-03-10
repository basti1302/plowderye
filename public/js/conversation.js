function Conversation(name, active) {
  this.name = name;
  this.active = !!active;
}

Conversation.prototype.getCssClasses = function() {
  if (this.active) {
    return ['list-group-item', 'active'];
  } else {
    return ['list-group-item'];
  }
};
