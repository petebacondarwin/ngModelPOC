describe('NgModelController', function() {

  describe('$setModelValue', function() {

    it('should set the $modelValue to the provided value', function() {
      var ctrl = new NgModelController();
      expect(ctrl.$modelValue).toBeUndefined();
      ctrl.$setModelValue('xxx');
      expect(ctrl.$modelValue).toEqual('xxx');
    });


    it('should trigger the ModelValueChanged event', function() {
      var ctrl = new NgModelController();
      var spy = jasmine.createSpy('ModelValueChanged');
      ctrl.$onModelValueChanged(spy);
      ctrl.$setModelValue('xxx');
      expect(spy).toHaveBeenCalledWith('xxx', undefined);
    });


    it('should call Transforms#format', function() {
      var ctrl = new NgModelController();
      spyOn(ctrl.$transforms, 'format');
      ctrl.$setModelValue('xxx');
      expect(ctrl.$transforms.format).toHaveBeenCalledWith('xxx', false);

      ctrl.$transforms.format.reset();
      ctrl.$isCollection = true;
      ctrl.$setModelValue('xxx');
      expect(ctrl.$transforms.format).toHaveBeenCalledWith('xxx', true);
    });


    it('should assign the result of Transforms#format to the $viewValue', function() {
      var ctrl = new NgModelController();
      spyOn(ctrl.$transforms, 'format').andReturn('yyy');
      ctrl.$setModelValue('xxx');
      expect(ctrl.$viewValue).toEqual('yyy');
    });


    it('should trigger formatError event; reset values if there is a format error', function() {
      var ctrl = new NgModelController();
      ctrl.$viewValue = 'view before';
      ctrl.$modelValue = 'model before';
      spyOn(ctrl.$transforms, 'format').andCallFake(function() { throw 'formatter failure'; });

      var spy = jasmine.createSpy('formatError');
      ctrl.$onFormatError(spy);
      ctrl.$setModelValue('model after');
      expect(ctrl.$modelValue).toEqual('model before');
      expect(ctrl.$viewValue).toEqual('view before');
      expect(spy).toHaveBeenCalledWith('formatter failure');
    });


    it('should trigger the ViewValueChanged event if the format succeeded', function() {
      var ctrl = new NgModelController();
      var spy = jasmine.createSpy('ViewValueChanged');
      ctrl.$onViewValueChanged(spy);
      spyOn(ctrl.$transforms, 'format').andReturn('yyy');
      ctrl.$setModelValue('xxx');
      expect(spy).toHaveBeenCalledWith('yyy', undefined);
    });

  });


  describe('$setViewValue', function() {

    it('should set the $viewValue to the provided value', function() {
      var ctrl = new NgModelController();
      expect(ctrl.$viewValue).toBeUndefined();
      ctrl.$setViewValue('xxx');
      expect(ctrl.$viewValue).toEqual('xxx');
    });


    it('should trigger the ViewValueChanged event', function() {
      var ctrl = new NgModelController();
      var spy = jasmine.createSpy('ViewValueChanged');
      ctrl.$onViewValueChanged(spy);
      ctrl.$setViewValue('xxx');
      expect(spy).toHaveBeenCalledWith('xxx', undefined);
    });


    it('should call Transforms#parse', function() {
      var ctrl = new NgModelController();
      spyOn(ctrl.$transforms, 'parse').andReturn('yyy');
      ctrl.$setViewValue('xxx');
      expect(ctrl.$transforms.parse).toHaveBeenCalledWith('xxx', false);

      ctrl.$transforms.parse.reset();
      ctrl.$isCollection = true;
      ctrl.$setViewValue('xxx');
      expect(ctrl.$transforms.parse).toHaveBeenCalledWith('xxx', true);
    });


    it('should assign the result of Transforms#parse to the $modelValue', function() {
      var ctrl = new NgModelController();
      spyOn(ctrl.$transforms, 'parse').andReturn('yyy');
      ctrl.$setViewValue('xxx');
      expect(ctrl.$modelValue).toEqual('yyy');
    });


    it('should trigger parseError event; reset values if there is a parse error', function() {
      var ctrl = new NgModelController();
      ctrl.$viewValue = 'view before';
      ctrl.$modelValue = 'model before';
      spyOn(ctrl.$transforms, 'parse').andCallFake(function() { throw 'parse failure'; });

      var spy = jasmine.createSpy('formatError');
      ctrl.$onParseError(spy);
      ctrl.$setViewValue('view after');
      expect(ctrl.$modelValue).toEqual('model before');
      expect(ctrl.$viewValue).toEqual('view before');
      expect(spy).toHaveBeenCalledWith('parse failure');
    });

    it('should trigger the ModelValueChanged event if the format succeeded', function() {
      var ctrl = new NgModelController();
      var spy = jasmine.createSpy('ModelValueChanged');
      ctrl.$onModelValueChanged(spy);
      spyOn(ctrl.$transforms, 'parse').andReturn('yyy');
      ctrl.$setViewValue('xxx');
      expect(spy).toHaveBeenCalledWith('yyy', undefined);
    });
  });


  describe('$onModelValueChanged', function() {

    it('should add a given handler that is called when the model value has changed', function() {
      var ctrl = new NgModelController();
      var spy = jasmine.createSpy('ModelValueChanged');
      ctrl.$onModelValueChanged(spy);
      ctrl.$setModelValue('one');
      expect(spy).toHaveBeenCalledWith('one', undefined);
      spy.reset();
      ctrl.$setModelValue('two');
      expect(spy).toHaveBeenCalledWith('two', 'one');
    });


    it('should return a function that will remove the handler so that is no longer called', function() {
      var ctrl = new NgModelController();
      var spy = jasmine.createSpy('ModelValueChanged');
      var remove = ctrl.$onModelValueChanged(spy);
      ctrl.$setModelValue('one');
      expect(spy).toHaveBeenCalledWith('one', undefined);
      spy.reset();
      remove();
      ctrl.$setModelValue('two');
      expect(spy).not.toHaveBeenCalled();
    });


    it('should call all handlers that are registered', function() {
      var ctrl = new NgModelController();
      var spy1 = jasmine.createSpy('ModelValueChanged 1');
      var spy2 = jasmine.createSpy('ModelValueChanged 2');
      ctrl.$onModelValueChanged(spy1);
      ctrl.$onModelValueChanged(spy2);
      ctrl.$setModelValue('one');
      expect(spy1).toHaveBeenCalledWith('one', undefined);
      expect(spy2).toHaveBeenCalledWith('one', undefined);
    });
  });


  describe('$onViewValueChanged', function() {

    it('should add a given handler that is called when the model value has changed', function() {
      var ctrl = new NgModelController();
      var spy = jasmine.createSpy('ViewValueChanged');
      ctrl.$onViewValueChanged(spy);
      ctrl.$setViewValue('one');
      expect(spy).toHaveBeenCalledWith('one', undefined);
      spy.reset();
      ctrl.$setViewValue('two');
      expect(spy).toHaveBeenCalledWith('two', 'one');
    });


    it('should return a function that will remove the handler so that is no longer called', function() {
      var ctrl = new NgModelController();
      var spy = jasmine.createSpy('ViewValueChanged');
      var remove = ctrl.$onViewValueChanged(spy);
      ctrl.$setViewValue('one');
      expect(spy).toHaveBeenCalledWith('one', undefined);
      spy.reset();
      remove();
      ctrl.$setViewValue('two');
      expect(spy).not.toHaveBeenCalled();
    });


    it('should call all handlers that are registered', function() {
      var ctrl = new NgModelController();
      var spy1 = jasmine.createSpy('ViewValueChanged 1');
      var spy2 = jasmine.createSpy('ViewValueChanged 2');
      ctrl.$onViewValueChanged(spy1);
      ctrl.$onViewValueChanged(spy2);
      ctrl.$setViewValue('one');
      expect(spy1).toHaveBeenCalledWith('one', undefined);
      expect(spy2).toHaveBeenCalledWith('one', undefined);
    });
  });


  describe('default $isEmpty', function() {
    it('should return true if the value is undefined', function() {
      var ctrl = new NgModelController();
      expect(ctrl.$isEmpty()).toEqual(true);
      expect(ctrl.$isEmpty(undefined)).toEqual(true);
    });


    it('should return true if the value is null', function() {
      var ctrl = new NgModelController();
      expect(ctrl.$isEmpty(null)).toEqual(true);
    });


    it('should return true if the value is empty string', function() {
      var ctrl = new NgModelController();
      expect(ctrl.$isEmpty('')).toEqual(true);
    });


    it('should return true if the value is NaN', function() {
      var ctrl = new NgModelController();
      expect(ctrl.$isEmpty(NaN)).toEqual(true);
    });


    it('should return false if the value is non-empty string', function() {
      var ctrl = new NgModelController();
      expect(ctrl.$isEmpty('x')).toEqual(false);
    });


    it('should return false if the value is a number', function() {
      var ctrl = new NgModelController();
      expect(ctrl.$isEmpty(0)).toEqual(false);
      expect(ctrl.$isEmpty(-100)).toEqual(false);
      expect(ctrl.$isEmpty(100)).toEqual(false);
    });


    it('should return false if the value is an object', function() {
      var ctrl = new NgModelController();
      expect(ctrl.$isEmpty([])).toEqual(false);
      expect(ctrl.$isEmpty({})).toEqual(false);
      expect(ctrl.$isEmpty(new Date())).toEqual(false);
      expect(ctrl.$isEmpty(/ /)).toEqual(false);
    });
  });
});