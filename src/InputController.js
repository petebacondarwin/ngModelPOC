function InputController(element) {
  this.$element = element;
  this.$inputEventMap = {};
  this.$domEventMap = {};
}


InputController.prototype.$writeValue = function(value) {
  this.$element.val(value);
};


InputController.prototype.$readValue = function() {
  return this.$element.val();
};


InputController.prototype.$mapEvent = function(domEvent, inputEvent, debounceDelay) {

  this.$inputEventMap[inputEvent] = this.$inputEventMap[inputEvent] || {};
  this.$domEventMap[domEvent] = this.$domEventMap[domEvent] || {};

  var eventList = this.$inputEventMap[inputEvent][domEvent] || new EventList();
  eventList.$debounceDelay = debounceDelay;

  this.$inputEventMap[inputEvent][domEvent] = eventList;
  this.$domEventMap[domEvent][inputEvent] = eventList;

  return eventList;
};


InputController.prototype.$unmapEvent = function(domEvent, inputEvent) {

  if (this.$inputEventMap[inputEvent]) {
    delete this.$inputEventMap[inputEvent][domEvent];
  }
  if (this.$domEventMap[domEvent]) {
    delete this.$domEventMap[domEvent][inputEvent];
  }

};


InputController.prototype.$triggerInputEvent = function(eventName, debounceDelay, data) {

};
