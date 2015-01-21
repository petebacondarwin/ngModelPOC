describe('InputController', function() {

  var fakeElement;

  beforeEach(function() {
    fakeElement = jasmine.createSpyObj('element', ['on', 'off']);
  });

  describe('$writeValue', function() {

    it('should pass the value to element.val()', function() {
      var element = jasmine.createSpyObj('element', ['val']);
      var ctrl = new InputController(element);
      ctrl.$writeValue('xxx');
      expect(element.val).toHaveBeenCalledWith('xxx');
    });
  });


  describe('$readValue', function() {

    it('should pass the value to element.val()', function() {
      var element = jasmine.createSpyObj('element', ['val']);
      element.val.and.returnValue('xxx');
      var ctrl = new InputController(element);
      var value = ctrl.$readValue();
      expect(element.val).toHaveBeenCalledWith();
      expect(value).toEqual('xxx');
    });
  });


  describe('$mapEvent', function() {


    it('should add an EventMapping object to the $inputEvents and the $domEventMap', function() {

      var ctrl = new InputController(fakeElement);
      var eventMapping = ctrl.$mapEvent('click', 'change', 250);

      expect(ctrl.$domEventMap['click']['change']).toBe(eventMapping);
      expect(ctrl.$inputEvents['change']).toBe(eventMapping.eventList);

      expect(eventMapping.element).toEqual(fakeElement);
      expect(eventMapping.domEvent).toEqual('click');
      expect(eventMapping.inputEvent).toEqual('change');
      expect(eventMapping.debounceDelay).toEqual(250);
    });


    it('should update an existing mapping', function() {

      var ctrl = new InputController(fakeElement);
      var eventMapping1 = ctrl.$mapEvent('click', 'change', 250);
      var eventMapping2 = ctrl.$mapEvent('click', 'change', 10);

      expect(eventMapping2).toBe(eventMapping1);
      expect(eventMapping1.debounceDelay).toEqual(10);
    });


    it('should bind an event handler to the DOM element', function() {
      var ctrl = new InputController(fakeElement);
      var eventMapping = ctrl.$mapEvent('click', 'change', 250);
      expect(fakeElement.on).toHaveBeenCalledWith('click', jasmine.any(Function));
    });


    it('should share EventLists between mappings that map to the same inputEvent', function() {
      var ctrl = new InputController(fakeElement);
      var eventMapping = ctrl.$mapEvent('click', 'change', 250);

    });
  });


  describe('$unmapEvent', function() {

    it('should remove any matching event list object from the $inputEvents and the $domEventMap', function() {

      var ctrl = new InputController(fakeElement);
      var clickMapping = ctrl.$mapEvent('click', 'change', 0);
      var keydownMapping = ctrl.$mapEvent('keydown', 'change', 250);

      expect(ctrl.$inputEvents['change']).toBe(clickMapping.eventList);
      expect(ctrl.$domEventMap['click']['change']).toBe(clickMapping);

      expect(ctrl.$inputEvents['change']).toBe(keydownMapping.eventList);
      expect(ctrl.$domEventMap['keydown']['change']).toBe(keydownMapping);

      ctrl.$unmapEvent('click', 'change');

      // The "click" mapping should have been removed
      expect(ctrl.$domEventMap['click']['change']).toBeUndefined();

      // The "change" eventList should still be there
      expect(ctrl.$inputEvents['change']).toBe(keydownMapping.eventList);

      // The "keydown" mapping should still be there
      expect(ctrl.$inputEvents['change']).toBe(keydownMapping.eventList);
      expect(ctrl.$domEventMap['keydown']['change']).toBe(keydownMapping);
    });


    it('should unbind the DOM event handler', function() {
      var ctrl = new InputController(fakeElement);
      ctrl.$mapEvent('click', 'change', 250);

      ctrl.$unmapEvent('click', 'change');
      expect(fakeElement.off).toHaveBeenCalledWith('click', jasmine.any(Function));
    });
  });


  describe('$triggerInputEvent', function() {

    it('should trigger events, with given debounce on each matching mapping', function() {

      var fakeEvent = {};
      var ctrl = new InputController(fakeElement);

      var clickMapping1 = ctrl.$mapEvent('click', 'change', 0);
      var clickMapping2 = ctrl.$mapEvent('click', 'other', 200);
      var keydownMapping = ctrl.$mapEvent('keydown', 'change', 250);
      spyOn(ctrl.$inputEvents['change'], 'debounce');
      spyOn(ctrl.$inputEvents['other'], 'debounce');

      ctrl.$triggerInputEvent('change', 100, fakeEvent);

      expect(ctrl.$inputEvents['change'].debounce).toHaveBeenCalledWith(100, fakeEvent);
      expect(ctrl.$inputEvents['other'].debounce).not.toHaveBeenCalled();
    });
  });


  describe('$handleInputEvent', function() {

    it('should add a handler that is called whent the named event is triggered', function() {

      var fakeEvent = {};
      var ctrl = new InputController(fakeElement);
      var handlerSpy = jasmine.createSpy('handler');

      ctrl.$handleInputEvent('change', handlerSpy);
      ctrl.$triggerInputEvent('change', 100, fakeEvent);
      $timeout.flush();

      expect(handlerSpy).toHaveBeenCalledWith(fakeEvent);
    });


    it('should return a function to remove the handler', function() {

      var fakeEvent = {};
      var ctrl = new InputController(fakeElement);
      var handlerSpy = jasmine.createSpy('handler');

      var removeFn = ctrl.$handleInputEvent('change', handlerSpy);

      removeFn();

      ctrl.$triggerInputEvent('change', 100, fakeEvent);
      $timeout.flush();

      expect(handlerSpy).not.toHaveBeenCalled();

    });
  })


  describe('DOM event handling', function() {

    it('should trigger all handlers for the given event', function() {
      var ctrl = new InputController(fakeElement);
      var handlerFns = {};

      // Capture the handler
      fakeElement.on.and.callFake(function(eventName, fn) {
        handlerFns[eventName] = handlerFns[eventName] || [];
        handlerFns[eventName].push(fn);
      });

      var clickMapping1 = ctrl.$mapEvent('click', 'change', 0);
      var clickMapping2 = ctrl.$mapEvent('click', 'other', 100);
      var keydownMapping = ctrl.$mapEvent('keydown', 'change', 250);
      spyOn(ctrl.$inputEvents['change'], 'debounce');
      spyOn(ctrl.$inputEvents['other'], 'debounce');

      var fakeEvent = {};
      expect(handlerFns['click'].length).toEqual(2);
      expect(handlerFns['keydown'].length).toEqual(1);

      handlerFns.click[0](fakeEvent);
      expect(ctrl.$inputEvents['change'].debounce).toHaveBeenCalledWith(0, fakeEvent);
      expect(ctrl.$inputEvents['other'].debounce).not.toHaveBeenCalled();

      ctrl.$inputEvents['change'].debounce.calls.reset();
      handlerFns.click[1](fakeEvent);
      expect(ctrl.$inputEvents['change'].debounce).not.toHaveBeenCalled();
      expect(ctrl.$inputEvents['other'].debounce).toHaveBeenCalledWith(100, fakeEvent);
    });
  });
});