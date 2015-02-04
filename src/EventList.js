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


EventList.prototype.triggerOnDOMEvent = function(element, event, debounceDelay) {
  var eventList = this;

  function handler(event) {
    eventList.debounce(debounceDelay);
  }

  element.on(event, handler);

  return function() {
    element.off(event, handler);
  };
};


EventList.prototype.trigger = function() {
  var args = Array.prototype.splice.call(arguments,0);
  this.handlers.forEach(function(handler) {
    handler.apply(null, args);
  });
};


EventList.prototype.debounce = function(debounceDelay) {
  var args = Array.prototype.splice.call(arguments,1);
  var eventList = this;
  $timeout.cancel(this.pendingDebounce);
  this.pendingDebounce = $timeout(function() {
    eventList.trigger.apply(eventList, args);
  }, debounceDelay);
};
