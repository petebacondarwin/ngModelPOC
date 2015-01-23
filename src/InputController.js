// The InputController is the component that sits between the NgModelController
// and the DOM element.
//
// Input directives that want to interact with ngModel should create one of these
// and provide it to their associated NgModelController.
//
// A common pattern for doing this would be to specify it as the controller of the input directive
//
// The two key areas that the InputController manages are:
//
// * reading/writing/checking values on the DOM element
// * mapping DOM events to abstract "input" events
//
// Input directives should override the $readValue, $writeValue and $isEmpty methods if they don't like what
// the default behaviour
//
// Input directives specify the mappings between DOM events and input events. In particular they should
// specify what DOM events map to the "change" input event, which is the primary event that the
// NgModelController is going to listen to for changes to the input.

function InputController($element) {
  this.$element = $element;
  this.$inputEvents = {};
  this.$domEventMap = {};
}



//////////  Reading and Writing Values  ////////////

InputController.prototype.$writeValue = function(value) {
  this.$element.val(value);
};


InputController.prototype.$readValue = function() {
  return this.$element.val();
};


NgModelController.prototype.$isEmpty = function(value) {
  return isUndefined(value) || value === '' || value === null || value !== value;
};




/////////  Event Mapping  /////////////

InputController.prototype.$mapEvent = function(domEvent, inputEvent, debounceDelay) {

  var eventList = this.$inputEvents[inputEvent] = this.$inputEvents[inputEvent] || new EventList();

  // Increment a counter for tracking how many DOM events map to this event list
  eventList.$$count = eventList.$$count || 0;
  eventList.$$count += 1;

  this.$domEventMap[domEvent] = this.$domEventMap[domEvent] || {};

  var eventMapping = this.$domEventMap[domEvent][inputEvent] ||
                            new EventMapping(this.$element, domEvent, inputEvent, debounceDelay, eventList);

  // update the debounce delay in case the event mapping already exists
  eventMapping.debounceDelay =  debounceDelay;

  this.$domEventMap[domEvent][inputEvent] = eventMapping;

  return eventMapping;
};


InputController.prototype.$unmapEvent = function(domEvent, inputEvent) {

  var eventMapping = this.$domEventMap[domEvent] && this.$domEventMap[domEvent][inputEvent];

  // Perhaps we should throw?
  if (!eventMapping) return;

  eventMapping.unbind();
  delete this.$domEventMap[domEvent][inputEvent];

  // Remove the event from the $inputEvents map if there are no mappings left
  eventMapping.eventList.$$count -= 1;
  if (eventMapping.eventList.$$count === 0) {
    delete this.$inputEvents[inputEvent];
  }
};


InputController.prototype.$handleInputEvent = function(inputEvent, handler) {

  var eventList = this.$inputEvents[inputEvent] = this.$inputEvents[inputEvent] || new EventList();

  // Increment a counter for tracking how many DOM events map to this event list
  eventList.$$count = eventList.$$count || 0;
  eventList.$$count += 1;

  return eventList.addHandler(handler);
}


InputController.prototype.$triggerInputEvent = function(inputEvent, debounceDelay, event) {
  var inputEvents = this.$inputEvents[inputEvent];

  // Perhaps this should throw??
  if (!inputEvents) return;

  var domEvents = Object.keys(inputEvents);
  return Q.all(domEvents.map(function(domEvent) {
    return inputEvents.debounce(debounceDelay, event);
  }));
};




function EventMapping(element, domEvent, inputEvent, debounceDelay, eventList) {
  this.element = element;
  this.domEvent = domEvent;
  this.inputEvent = inputEvent;
  this.debounceDelay = debounceDelay;
  this.eventList = eventList;

  this.handleDOMEvent = function(event) {
    return eventList.debounce(debounceDelay, event);
  };

  // We don't need to bind handleDOMEvent to this as it doesn't use it
  this.element.on(domEvent, this.handleDOMEvent);
}

EventMapping.prototype.unbind = function() {
  this.element.off(this.domEvent, this.handleDOMEvent);
};

