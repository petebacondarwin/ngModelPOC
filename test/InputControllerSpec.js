describe('InputController', function() {

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

    it('should add an event list object to the $inputEventMap and the $domEventMap', function() {

      var ctrl = new InputController();
      ctrl.$mapEvent('click', 'change', 250);

      var inputEventMapping = ctrl.$inputEventMap['change']['click'];
      var domEventMapping = ctrl.$domEventMap['click']['change'];

      expect(inputEventMapping).toEqual(jasmine.objectContaining({
        $debounceDelay: 250
      }));

      expect(domEventMapping).toEqual(jasmine.objectContaining({
        $debounceDelay: 250
      }));

      expect(inputEventMapping).toBe(domEventMapping);
    });


    it('should update an existing mapping', function() {

      var ctrl = new InputController();
      ctrl.$mapEvent('click', 'change', 250);


      var inputEventMapping = ctrl.$inputEventMap['change']['click'];
      var domEventMapping = ctrl.$domEventMap['click']['change'];

      expect(inputEventMapping).toEqual(jasmine.objectContaining({
        $debounceDelay: 250
      }));


      ctrl.$mapEvent('click', 'change', 10);

      expect(inputEventMapping).toEqual(jasmine.objectContaining({
        $debounceDelay: 10
      }));
    });
  });


  describe('$unmapEvent', function() {

    it('should remove any matching event list object from the $inputEventMap and the $domEventMap', function() {

      var ctrl = new InputController();
      ctrl.$mapEvent('click', 'change', 0);
      ctrl.$mapEvent('keydown', 'change', 250);

      expect(Object.keys(ctrl.$inputEventMap['change'])).toEqual(['click', 'keydown']);
      expect(Object.keys(ctrl.$domEventMap)).toEqual(['click', 'keydown']);


      expect(ctrl.$inputEventMap['change']['click']).toBeDefined();
      expect(ctrl.$domEventMap['click']['change']).toBeDefined();

      ctrl.$unmapEvent('click', 'change');

      expect(ctrl.$inputEventMap['change']['click']).toBeUndefined();
      expect(ctrl.$domEventMap['click']['change']).toBeUndefined();
    });
  });


  describe('$triggerInputEvent', function() {

  });
});