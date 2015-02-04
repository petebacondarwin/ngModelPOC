describe('NgModelController', function() {

  var scope, element, attrs, ngModelExp, ctrl;

  beforeEach(function() {

    ngModelExp = jasmine.createSpy('ngModelExp');
    ngModelExp.assign = jasmine.createSpy('ngModelExp.assign');

    scope = new Scope();
    element = new Element();
    attrs = new Attributes({ ngModel: ngModelExp });
    ctrl = new NgModelController(scope, element, attrs, $parse, $interpolate);

    spyOn($animate, 'setClass');
  });

  describe('$setModelValue', function() {

    it('should set the $modelValue to the provided value', function() {
      expect(ctrl.$modelValue).toBeUndefined();
      ctrl.$setModelValue('xxx');
      expect(ctrl.$modelValue).toEqual('xxx');
    });


    it('should trigger the formatModel event', function() {
      var formatModelSpy = jasmine.createSpy('formatModel');
      ctrl.$formatModel.addHandler(formatModelSpy);
      ctrl.$setModelValue('xxx');
      expect(formatModelSpy).toHaveBeenCalledWith('xxx');
    });


    it('should $format', function() {
      spyOn(ctrl, '$format');
      ctrl.$setModelValue('xxx');
      expect(ctrl.$format).toHaveBeenCalledWith('xxx');
    });


    it('should assign the result of Transforms#format to the $viewValue', function() {
      spyOn(ctrl, '$format').and.returnValue('yyy');
      ctrl.$setModelValue('xxx');
      expect(ctrl.$viewValue).toEqual('yyy');
    });


    it('should trigger formatError event; reset values if there is a format error', function() {
      ctrl.$viewValue = 'view before';
      ctrl.$modelValue = 'model before';
      spyOn(ctrl, '$format').and.callFake(function() { throw 'formatter failure'; });

      var formatErrorSpy = jasmine.createSpy('formatError');
      ctrl.$formatError.addHandler(formatErrorSpy);
      expect(function() {
        ctrl.$setModelValue('model after');
      }).toThrow();
      expect(ctrl.$modelValue).toEqual('model before');
      expect(ctrl.$viewValue).toEqual('view before');
      expect(formatErrorSpy).toHaveBeenCalledWith('formatter failure');
    });


    it('should trigger the ViewValueChanged event if the format succeeded', function() {
      var viewValueChangedSpy = jasmine.createSpy('ViewValueChanged');
      ctrl.$viewValueChanged.addHandler(viewValueChangedSpy);
      spyOn(ctrl, '$format').and.returnValue('yyy');
      ctrl.$setModelValue('xxx');
      expect(viewValueChangedSpy).toHaveBeenCalledWith('yyy', undefined);
    });
  });


  describe('$setViewValue', function() {

    it('should set the $viewValue to the provided value', function() {
      expect(ctrl.$viewValue).toBeUndefined();
      ctrl.$setViewValue('xxx');
      expect(ctrl.$viewValue).toEqual('xxx');
    });


    it('should trigger the parseView event', function() {
      var parseViewSpy = jasmine.createSpy('parseView');
      ctrl.$parseView.addHandler(parseViewSpy);
      ctrl.$setViewValue('xxx');
      expect(parseViewSpy).toHaveBeenCalledWith('xxx');
    });


    it('should call Transforms#parse', function() {
      spyOn(ctrl, '$parse').and.returnValue('yyy');
      ctrl.$setViewValue('xxx');
      expect(ctrl.$parse).toHaveBeenCalledWith('xxx');
    });


    it('should assign the result of Transforms#parse to the $modelValue', function() {
      spyOn(ctrl, '$parse').and.returnValue('yyy');
      ctrl.$setViewValue('xxx');
      expect(ctrl.$modelValue).toEqual('yyy');
    });


    it('should trigger parseError event; reset values if there is a parse error', function() {
      ctrl.$viewValue = 'view before';
      ctrl.$modelValue = 'model before';
      spyOn(ctrl, '$parse').and.callFake(function() { throw 'parse failure'; });

      var parserErrorSpy = jasmine.createSpy('parseError');
      ctrl.$parseError.addHandler(parserErrorSpy);
      expect(function() {
        ctrl.$setViewValue('view after');
      }).toThrow();
      expect(ctrl.$modelValue).toEqual('model before');
      expect(ctrl.$viewValue).toEqual('view before');
      expect(parserErrorSpy).toHaveBeenCalledWith('parse failure');
    });


    it('should trigger the ModelValueChanged event if the format succeeded', function() {
      var spy = jasmine.createSpy('ModelValueChanged');
      ctrl.$modelValueChanged.addHandler(spy);
      spyOn(ctrl, '$parse').and.returnValue('yyy');
      ctrl.$setViewValue('xxx');
      expect(spy).toHaveBeenCalledWith('yyy', undefined);
    });
  });


  describe('default $isEmpty', function() {
    it('should return true if the value is undefined', function() {
      expect(ctrl.$isEmpty()).toEqual(true);
      expect(ctrl.$isEmpty(undefined)).toEqual(true);
    });


    it('should return true if the value is null', function() {
      expect(ctrl.$isEmpty(null)).toEqual(true);
    });


    it('should return true if the value is empty string', function() {
      expect(ctrl.$isEmpty('')).toEqual(true);
    });


    it('should return true if the value is NaN', function() {
      expect(ctrl.$isEmpty(NaN)).toEqual(true);
    });


    it('should return false if the value is non-empty string', function() {
      expect(ctrl.$isEmpty('x')).toEqual(false);
    });


    it('should return false if the value is a number', function() {
      expect(ctrl.$isEmpty(0)).toEqual(false);
      expect(ctrl.$isEmpty(-100)).toEqual(false);
      expect(ctrl.$isEmpty(100)).toEqual(false);
    });


    it('should return false if the value is an object', function() {
      expect(ctrl.$isEmpty([])).toEqual(false);
      expect(ctrl.$isEmpty({})).toEqual(false);
      expect(ctrl.$isEmpty(new Date())).toEqual(false);
      expect(ctrl.$isEmpty(/ /)).toEqual(false);
    });
  });
});