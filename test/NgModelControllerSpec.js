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
      expect(spy).toHaveBeenCalled();
    });


    it('should call Transforms#formatValue', function() {
      var ctrl = new NgModelController();
      spyOn(ctrl.$transforms, 'formatValue');
      ctrl.$setModelValue('xxx');
      expect(ctrl.$transforms.formatValue).toHaveBeenCalled();
    });


    it('should assign the result of Transforms#formatValue to the $viewValue', function() {
      var ctrl = new NgModelController();
      spyOn(ctrl.$transforms, 'formatValue').andReturn('yyy');
      ctrl.$setModelValue('xxx');
      expect(ctrl.$viewValue).toEqual('yyy');
    });


    it('should trigger formatError event; reset values if there is a format error', function() {
      var ctrl = new NgModelController();
      ctrl.$viewValue = 'view before';
      ctrl.$modelValue = 'model before';
      spyOn(ctrl.$transforms, 'formatValue').andCallFake(function() { throw 'formatter failure'; });

      var spy = jasmine.createSpy('formatError');
      ctrl.$onFormatError(spy);
      ctrl.$setModelValue('model after');
      expect(ctrl.$modelValue).toEqual('model before');
      expect(ctrl.$viewValue).toEqual('view before');
      expect(spy).toHaveBeenCalledWith('formatter failure');
    });
  });


  describe('$setViewValue', function() {

    it('should set the $viewValue to the provided value', function() {
      var ctrl = new NgModelController();
      expect(ctrl.$viewValue).toBeUndefined();
      ctrl.$setViewValue('xxx');
      expect(ctrl.$viewValue).toEqual('xxx');
    });


    it('should trigger the ModelValueChanged event', function() {
      var ctrl = new NgModelController();
      var spy = jasmine.createSpy('ModelValueChanged');
      ctrl.$onModelValueChanged(spy);
      ctrl.$setViewValue('xxx');
      expect(spy).toHaveBeenCalled();
    });


    it('should call Transforms#parseValue', function() {
      var ctrl = new NgModelController();
      spyOn(ctrl.$transforms, 'parseValue');
      ctrl.$setViewValue('xxx');
      expect(ctrl.$transforms.parseValue).toHaveBeenCalled();
    });


    it('should assign the result of Transforms#parseValue to the $modelValue', function() {
      var ctrl = new NgModelController();
      spyOn(ctrl.$transforms, 'parseValue').andReturn('yyy');
      ctrl.$setViewValue('xxx');
      expect(ctrl.$modelValue).toEqual('yyy');
    });


    it('should trigger parseError event; reset values if there is a parse error', function() {
      var ctrl = new NgModelController();
      ctrl.$viewValue = 'view before';
      ctrl.$modelValue = 'model before';
      spyOn(ctrl.$transforms, 'parseValue').andCallFake(function() { throw 'parse failure'; });

      var spy = jasmine.createSpy('formatError');
      ctrl.$onParseError(spy);
      ctrl.$setViewValue('view after');
      expect(ctrl.$modelValue).toEqual('model before');
      expect(ctrl.$viewValue).toEqual('view before');
      expect(spy).toHaveBeenCalledWith('parse failure');
    });

  });


  describe('$onModelValueChanged', function() {

  });


  describe('$onViewValueChanged', function() {

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