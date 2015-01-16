describe('NgModelController', function() {

  describe('$setModelValue', function() {

    it('should set the $modelValue to the provided value', function() {
      var ctrl = new NgModelController();
      expect(ctrl.$modelValue).toBeUndefined();
      ctrl.$setModelValue('xxx');
      expect(ctrl.$modelValue).toEqual('xxx');
    });


    it('should trigger the formatModel event', function() {
      var ctrl = new NgModelController();
      var spy = jasmine.createSpy('formatModel');
      ctrl.$formatModel.addHandler(spy);
      ctrl.$setModelValue('xxx');
      expect(spy).toHaveBeenCalledWith('xxx', undefined);
    });


    it('should call Transforms#format', function() {
      var ctrl = new NgModelController();
      spyOn(ctrl.$transforms, 'format');
      ctrl.$setModelValue('xxx');
      expect(ctrl.$transforms.format).toHaveBeenCalledWith('xxx', false);

      ctrl.$transforms.format.calls.reset();
      ctrl.$isCollection = true;
      ctrl.$setModelValue('xxx');
      expect(ctrl.$transforms.format).toHaveBeenCalledWith('xxx', true);
    });


    it('should assign the result of Transforms#format to the $viewValue', function() {
      var ctrl = new NgModelController();
      spyOn(ctrl.$transforms, 'format').and.returnValue('yyy');
      ctrl.$setModelValue('xxx');
      expect(ctrl.$viewValue).toEqual('yyy');
    });


    it('should trigger formatError event; reset values if there is a format error', function() {
      var ctrl = new NgModelController();
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
      var ctrl = new NgModelController();
      var spy = jasmine.createSpy('ViewValueChanged');
      ctrl.$viewValueChanged.addHandler(spy);
      spyOn(ctrl.$transforms, 'format').and.returnValue('yyy');
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


    it('should trigger the parseView event', function() {
      var ctrl = new NgModelController();
      var spy = jasmine.createSpy('parseView');
      ctrl.$parseView.addHandler(spy);
      ctrl.$setViewValue('xxx');
      expect(spy).toHaveBeenCalledWith('xxx', undefined);
    });


    it('should call Transforms#parse', function() {
      var ctrl = new NgModelController();
      spyOn(ctrl.$transforms, 'parse').and.returnValue('yyy');
      ctrl.$setViewValue('xxx');
      expect(ctrl.$transforms.parse).toHaveBeenCalledWith('xxx', false);

      ctrl.$transforms.parse.calls.reset();
      ctrl.$isCollection = true;
      ctrl.$setViewValue('xxx');
      expect(ctrl.$transforms.parse).toHaveBeenCalledWith('xxx', true);
    });


    it('should assign the result of Transforms#parse to the $modelValue', function() {
      var ctrl = new NgModelController();
      spyOn(ctrl.$transforms, 'parse').and.returnValue('yyy');
      ctrl.$setViewValue('xxx');
      expect(ctrl.$modelValue).toEqual('yyy');
    });


    it('should trigger parseError event; reset values if there is a parse error', function() {
      var ctrl = new NgModelController();
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
      var ctrl = new NgModelController();
      var spy = jasmine.createSpy('ModelValueChanged');
      ctrl.$modelValueChanged.addHandler(spy);
      spyOn(ctrl.$transforms, 'parse').and.returnValue('yyy');
      ctrl.$setViewValue('xxx');
      expect(spy).toHaveBeenCalledWith('yyy', undefined);
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