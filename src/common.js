function isString(value) { return typeof value === 'string'; }
function isUndefined(value) { return typeof value === 'undefined'; }
function isBoolean(value) { return typeof value === 'boolean'; }
function identity(value) { return value; }

function EventList() {
  this.handlers = [];
}
EventList.prototype.addHandler = function(handler) {
  var handlers = this.handlers;
  handlers.push(handler);
  return function remove() {
    var index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index,1);
    }
  };
};
EventList.prototype.trigger = function() {
  var args = Array.prototype.splice.call(arguments,0);
  this.handlers.forEach(function(handler) {
    handler.apply(null, args);
  });
};