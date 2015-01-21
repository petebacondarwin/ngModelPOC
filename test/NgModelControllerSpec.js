describe('NgModelController', function() {

  var scope, element, ngModelExp;

  beforeEach(function() {

    scope = new Scope();
    element = new Element();

    ngModelExp = jasmine.createSpy('ngModelExp');
    ngModelExp.assign = jasmine.createSpy('ngModelExp.assign');

  });

  describe('$setModelValue', function() {

    it('should set the $modelValue to the provided value', function() {
      var ctrl = new NgModelController(scope, element, ngModelExp);
      expect(ctrl.$modelValue).toBeUndefined();
      ctrl.$setModelValue('xxx');
      expect(ctrl.$modelValue).toEqual('xxx');
    });


    it('should trigger the formatModel event', function() {
      var ctrl = new NgModelController(scope, element, ngModelExp);
      var spy = jasmine.createSpy('formatModel');
      ctrl.$formatModel.addHandler(spy);
      ctrl.$setModelValue('xxx');
      expect(spy).toHaveBeenCalledWith('xxx', undefined);
    });


    it('should call Transforms#format', function() {
      var ctrl = new NgModelController(scope, element, ngModelExp);
      spyOn(ctrl.$transforms, 'format');
      ctrl.$setModelValue('xxx');
      expect(ctrl.$transforms.format).toHaveBeenCalledWith('xxx', false);

      ctrl.$transforms.format.calls.reset();
      ctrl.$isCollection = true;
      ctrl.$setModelValue('xxx');
      expect(ctrl.$transforms.format).toHaveBeenCalledWith('xxx', true);
    });


    it('should assign the result of Transforms#format to the $viewValue', function() {
      var ctrl = new NgModelController(scope, element, ngModelExp);
      spyOn(ctrl.$transforms, 'format').and.returnValue('yyy');
      ctrl.$setModelValue('xxx');
      expect(ctrl.$viewValue).toEqual('yyy');
    });


    it('should trigger formatError event; reset values if there is a format error', function() {
      var ctrl = new NgModelController(scope, element, ngModelExp);
      ctrl.$viewValue = 'view before';
      ctrl.$modelValue = 'model before';
      spyOn(ctrl.$transforms, 'format').and.callFake(function() { throw 'formatter failure'; });

      var spy = jasmine.createSpy('formatError');
      ctrl.$formatError.addHandler(spy);
      ctrl.$setModelValue('model after');
      expect(ctrl.$modelValue).toEqual('model before');
      expect(ctrl.$viewValue).toEqual('view before');
      expect(spy).toHaveBeenCalledWith('formatter failure');
    });


    it('should trigger the ViewValueChanged event if the format succeeded', function() {
      var ctrl = new NgModelController(scope, element, ngModelExp);
      var spy = jasmine.createSpy('ViewValueChanged');
      ctrl.$viewValueChanged.addHandler(spy);
      spyOn(ctrl.$transforms, 'format').and.returnValue('yyy');
      ctrl.$setModelValue('xxx');
      expect(spy).toHaveBeenCalledWith('yyy', undefined);
    });
  });


  describe('$setViewValue', function() {

    it('should set the $viewValue to the provided value', function() {
      var ctrl = new NgModelController(scope, element, ngModelExp);
      expect(ctrl.$viewValue).toBeUndefined();
      ctrl.$setViewValue('xxx');
      expect(ctrl.$viewValue).toEqual('xxx');
    });


    it('should trigger the parseView event', function() {
      var ctrl = new NgModelController(scope, element, ngModelExp);
      var spy = jasmine.createSpy('parseView');
      ctrl.$parseView.addHandler(spy);
      ctrl.$setViewValue('xxx');
      expect(spy).toHaveBeenCalledWith('xxx', undefined);
    });


    it('should call Transforms#parse', function() {
      var ctrl = new NgModelController(scope, element, ngModelExp);
      spyOn(ctrl.$transforms, 'parse').and.returnValue('yyy');
      ctrl.$setViewValue('xxx');
      expect(ctrl.$transforms.parse).toHaveBeenCalledWith('xxx', false);

      ctrl.$transforms.parse.calls.reset();
      ctrl.$isCollection = true;
      ctrl.$setViewValue('xxx');
      expect(ctrl.$transforms.parse).toHaveBeenCalledWith('xxx', true);
    });


    it('should assign the result of Transforms#parse to the $modelValue', function() {
      var ctrl = new NgModelController(scope, element, ngModelExp);
      spyOn(ctrl.$transforms, 'parse').and.returnValue('yyy');
      ctrl.$setViewValue('xxx');
      expect(ctrl.$modelValue).toEqual('yyy');
    });


    it('should trigger parseError event; reset values if there is a parse error', function() {
      var ctrl = new NgModelController(scope, element, ngModelExp);
      ctrl.$viewValue = 'view before';
      ctrl.$modelValue = 'model before';
      spyOn(ctrl.$transforms, 'parse').and.callFake(function() { throw 'parse failure'; });

      var spy = jasmine.createSpy('parseError');
      ctrl.$parseError.addHandler(spy);
      ctrl.$setViewValue('view after');
      expect(ctrl.$modelValue).toEqual('model before');
      expect(ctrl.$viewValue).toEqual('view before');
      expect(spy).toHaveBeenCalledWith('parse failure');
    });


    it('should trigger the ModelValueChanged event if the format succeeded', function() {
      var ctrl = new NgModelController(scope, element, ngModelExp);
      var spy = jasmine.createSpy('ModelValueChanged');
      ctrl.$modelValueChanged.addHandler(spy);
      spyOn(ctrl.$transforms, 'parse').and.returnValue('yyy');
      ctrl.$setViewValue('xxx');
      expect(spy).toHaveBeenCalledWith('yyy', undefined);
    });
  });


  describe('$initState', function() {

    it('should set up the related properties on the controller', function() {
      var ctrl = new NgModelController(scope, element, ngModelExp);
      var state = { on: '$stateOn', off: '$stateOff', onClass: 'state-on', offClass: 'state-off' };
      ctrl.$initState(state);
      expect(ctrl.$stateOn).toBe(false);
      expect(ctrl.$stateOff).toBe(true);
    });


    it('should add event lists for on and off state changes', function() {
      var ctrl = new NgModelController(scope, element, ngModelExp);
      var state = { on: '$stateOn', off: '$stateOff', onClass: 'state-on', offClass: 'state-off' };
      ctrl.$initState(state);
      expect(ctrl.$stateOnChanged).toEqual(jasmine.any(EventList));
      expect(ctrl.$stateOffChanged).toEqual(jasmine.any(EventList));
    });
  });


  describe('$setState', function() {

    it('should set the on state to true and the off state to false', function() {
      var ctrl = new NgModelController(scope, element, ngModelExp);
      var state = { on: '$stateOn', off: '$stateOff', onClass: 'state-on', offClass: 'state-off' };
      ctrl.$initState(state);

      ctrl.$setState(state);

      scope.$digest(); // trigger async apply

      expect(ctrl.$stateOn).toBe(true);
      expect(ctrl.$stateOff).toBe(false);
    });


    it('should trigger the relevant event', function() {
      var onSpy = jasmine.createSpy('onSpy');
      var offSpy = jasmine.createSpy('offSpy');
      var ctrl = new NgModelController(scope, element, ngModelExp);
      var state = { on: '$stateOn', off: '$stateOff', onClass: 'state-on', offClass: 'state-off' };
      ctrl.$initState(state);
      ctrl.$stateOnChanged.addHandler(onSpy);
      ctrl.$stateOffChanged.addHandler(offSpy);

      ctrl.$setState(state);

      scope.$digest(); // trigger async apply

      expect(onSpy).toHaveBeenCalledWith(true, false);
      expect(offSpy).toHaveBeenCalledWith(false, true);
    });


    it('should update the relevant CSS classes', function() {
      var ctrl = new NgModelController(scope, element, ngModelExp);
      var state = { on: '$stateOn', off: '$stateOff', onClass: 'state-on', offClass: 'state-off' };

      $animate.setClass.calls.reset();

      ctrl.$initState(state);
      ctrl.$setState(state);
      scope.$digest(); // trigger async apply

      expect($animate.setClass).toHaveBeenCalledWith(element, 'state-on', 'state-off');
    });
  });


  describe('$clearState', function() {

    it('should set the off state to true and the on state to false', function() {
      var ctrl = new NgModelController(scope, element, ngModelExp);
      var state = { on: '$stateOn', off: '$stateOff', onClass: 'state-on', offClass: 'state-off' };
      ctrl.$initState(state);
      ctrl.$setState(state);
      scope.$digest(); // trigger async apply

      ctrl.$clearState(state);
      scope.$digest(); // trigger async apply

      expect(ctrl.$stateOff).toBe(true);
      expect(ctrl.$stateOn).toBe(false);
    });


    it('should trigger the relevant event', function() {
      var onSpy = jasmine.createSpy('onSpy');
      var offSpy = jasmine.createSpy('offSpy');
      var ctrl = new NgModelController(scope, element, ngModelExp);
      var state = { on: '$stateOn', off: '$stateOff', onClass: 'state-on', offClass: 'state-off' };
      ctrl.$initState(state);
      ctrl.$setState(state);
      scope.$digest(); // trigger async apply

      ctrl.$stateOnChanged.addHandler(onSpy);
      ctrl.$stateOffChanged.addHandler(offSpy);

      ctrl.$clearState(state);
      scope.$digest(); // trigger async apply

      expect(onSpy).toHaveBeenCalledWith(false, true);
      expect(offSpy).toHaveBeenCalledWith(true, false);
    });


    it('should update the relevant CSS classes', function() {
      var ctrl = new NgModelController(scope, element, ngModelExp);
      var state = { on: '$stateOn', off: '$stateOff', onClass: 'state-on', offClass: 'state-off' };

      ctrl.$initState(state);
      ctrl.$setState(state);
      scope.$digest(); // trigger async apply
      $animate.setClass.calls.reset();
      ctrl.$clearState(state);
      scope.$digest(); // trigger async apply

      expect($animate.setClass).toHaveBeenCalledWith(element, 'state-off', 'state-on');
    });
  });


  describe('default $isEmpty', function() {
    it('should return true if the value is undefined', function() {
      var ctrl = new NgModelController(scope, element, ngModelExp);
      expect(ctrl.$isEmpty()).toEqual(true);
      expect(ctrl.$isEmpty(undefined)).toEqual(true);
    });


    it('should return true if the value is null', function() {
      var ctrl = new NgModelController(scope, element, ngModelExp);
      expect(ctrl.$isEmpty(null)).toEqual(true);
    });


    it('should return true if the value is empty string', function() {
      var ctrl = new NgModelController(scope, element, ngModelExp);
      expect(ctrl.$isEmpty('')).toEqual(true);
    });


    it('should return true if the value is NaN', function() {
      var ctrl = new NgModelController(scope, element, ngModelExp);
      expect(ctrl.$isEmpty(NaN)).toEqual(true);
    });


    it('should return false if the value is non-empty string', function() {
      var ctrl = new NgModelController(scope, element, ngModelExp);
      expect(ctrl.$isEmpty('x')).toEqual(false);
    });


    it('should return false if the value is a number', function() {
      var ctrl = new NgModelController(scope, element, ngModelExp);
      expect(ctrl.$isEmpty(0)).toEqual(false);
      expect(ctrl.$isEmpty(-100)).toEqual(false);
      expect(ctrl.$isEmpty(100)).toEqual(false);
    });


    it('should return false if the value is an object', function() {
      var ctrl = new NgModelController(scope, element, ngModelExp);
      expect(ctrl.$isEmpty([])).toEqual(false);
      expect(ctrl.$isEmpty({})).toEqual(false);
      expect(ctrl.$isEmpty(new Date())).toEqual(false);
      expect(ctrl.$isEmpty(/ /)).toEqual(false);
    });
  });
});