describe('USE CASE: date input', function() {

  var element, attrs, ngModelCtrl, inputController, scope, log;
  var WEEKMAP = {
    0: 'Monday', 1: 'Tuesday', 2: 'Wednesday', 3: 'Thursday', 4: 'Friday', 5: 'Saturday', 6: 'Sunday',
    'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4, 'Saturday': 5, 'Sunday': 6
  };
  var dayNumberFn = function(value) { return isDefined(WEEKMAP[value]) ? WEEKMAP[value] : null; };


  function logNgModelControllerEvent(eventName) {
    ngModelCtrl[eventName].addHandler(function(newVal, oldVal) {
      log.push(eventName + ': from "' + oldVal + '" to "' + newVal + '"');
    });
  }

  function setup(initialScopeDate, initialInputValue) {

    mockPromises.install(Q.makePromise);
    mockPromises.reset();

    spyOn($animate, 'setClass');

    log = [];


    // Provide a default ngModelOptions object containing adaptors
    // This would be an Angular service, that can be modified in a config block
    var defaultNgModelOptions = new NgModelOptions({
      // The adaptors for this setup
      adaptors: ['defaultAdaptor'],
      updateOn: 'keydown'
    }, null, null, $ngModelAdaptors);



    // Create a "scope"
    scope = new Scope({ dayNumber: initialScopeDate });



    // Create an "element" that would hold the ngModel, input, validation and transform directives
    element = new Element(initialInputValue);
    attrs = new Attributes({ ngModel: 'dayNumber' });


    // Simulate an ngModel directive
    ngModelDirective = NgModelDirective(defaultNgModelOptions);
    ngModelCtrl = new NgModelController(scope, element, attrs, $parse);
    // Run the ngModel prelink function
    ngModelDirective.link.pre(scope, element, attrs, [ngModelCtrl, null, null]);



    // We are assuming that the input directive is legacy and doesn't provide its own inputController
    // In this case the NgModelController provides a default InputController
    inputController = ngModelCtrl.$inputController;



    // Simulate a transform directive adding a transform
    // TODO: work out how to accommodate legacy directives that specify $parsers and $formatters
    ngModelCtrl.$transforms.append('dayNumber', dayNumberFn, dayNumberFn);



    // Add some logging for tests
    logNgModelControllerEvent('$modelValueChanged');
    logNgModelControllerEvent('$parseView');
    logNgModelControllerEvent('$parseError');
    logNgModelControllerEvent('$formatModel');
    logNgModelControllerEvent('$formatError');
    logNgModelControllerEvent('$viewValueChanged');
  }


  function selectDate(dateValue) {
    // Simulate a date selection
    element.val(dateValue);
    element.trigger('keydown');
    $timeout.flush();
  }

  function changeScope(dayNumber) {
    scope.dayNumber = dayNumber;
    scope.$digest();
  }


  function addAsyncValidator(ngModelCtrl) {

    var validations = {};

    ngModelCtrl.$validity.addValidator('day', function(viewValue) {

      // We are going to defer the validation adding it to the validations object
      // so that we can resolve it later in the test
      var validation = Q.defer();
      validations[viewValue] = validation;
      return validation.promise;
    });

    return validations;
  }



  it('should update the scope when the input changes', function() {

    setup();

    log = [];
    selectDate('Sunday');
    expect(log).toEqual([
      '$parseView: from "undefined" to "Sunday"',
      '$modelValueChanged: from "undefined" to "6"'
    ]);
    expect(scope.dayNumber).toEqual(6);


    log = [];
    selectDate('Monday');
    expect(log).toEqual([
      '$parseView: from "Sunday" to "Monday"',
      '$modelValueChanged: from "6" to "0"'
    ]);
    expect(scope.dayNumber).toEqual(0);
  });


  it('should update the input element when the scope changes', function() {

    setup();

    log = [];
    changeScope(5);
    expect(log).toEqual([
      '$formatModel: from "undefined" to "5"',
      '$viewValueChanged: from "undefined" to "Saturday"'
    ]);
    expect(element.val()).toEqual('Saturday');


    log = [];
    changeScope(2);
    expect(log).toEqual([
      '$formatModel: from "5" to "2"',
      '$viewValueChanged: from "Saturday" to "Wednesday"'
    ]);
    expect(element.val()).toEqual('Wednesday');

  });


  it('should set the model to null if the view is invalid', function() {

    setup();

    // Add a validator
    ngModelCtrl.$validity.addValidator('day', function(viewValue) {
      return !isUndefined(WEEKMAP[viewValue]);
    });


    log = [];
    selectDate('Monday');
    expect(log).toEqual([
      '$parseView: from "undefined" to "Monday"',
      '$modelValueChanged: from "undefined" to "0"'
    ]);
    expect(scope.dayNumber).toEqual(0);


    // Simulate an invalid date selection
    log = [];
    selectDate('Badday');
    expect(log).toEqual([
      '$parseView: from "Monday" to "Badday"',
      '$modelValueChanged: from "0" to "null"'
    ]);
    expect(scope.dayNumber).toEqual(null);
  });


  it('should ignore out of date validations', function() {

    setup();

    var validations = addAsyncValidator(ngModelCtrl);

    log = [];

    // Provide a couple of view changes that will trigger unresolved validations
    selectDate('Monday');
    expect(log).toEqual([
      '$parseView: from "undefined" to "Monday"',
      '$modelValueChanged: from "undefined" to "0"'
    ]);
    expect(validations).toEqual({ '0': jasmine.any(Object) });
    expect(scope.dayNumber).toBeUndefined();

    selectDate('Tuesday');
    expect(log).toEqual([
      '$parseView: from "undefined" to "Monday"',
      '$modelValueChanged: from "undefined" to "0"',
      '$parseView: from "Monday" to "Tuesday"',
      '$modelValueChanged: from "0" to "1"'
    ]);
    expect(validations).toEqual({
      '0': jasmine.any(Object),
      '1': jasmine.any(Object)
    });
    expect(scope.dayNumber).toBeUndefined();


    // Now resolve the second validation
    validations['1'].resolve(true);
    resolveAllPromises();
    expect(scope.dayNumber).toEqual(1);


    // Now resolve the first (out of date) validation
    validations['0'].resolve(true);
    resolveAllPromises();
    expect(scope.dayNumber).toEqual(1);

  });


  it('should set $pending state while waiting for async validators', function() {

    setup();
    var validations = addAsyncValidator(ngModelCtrl);

    // Select a date to trigger an async validation to begin
    selectDate('Monday');
    scope.$digest(); // trigger asyncApply

    expect(ngModelCtrl.$pending).toBe(true);
    expect($animate.setClass).toHaveBeenCalledWith(element, 'ng-pending', []);

    $animate.setClass.calls.reset();

    // Now resolve the async validation
    validations['0'].resolve(true);
    resolveAllPromises();
    scope.$digest(); // trigger promise resolutions and asyncApply

    expect(ngModelCtrl.$pending).toBe(false);
    expect($animate.setClass).toHaveBeenCalledWith(element, [], 'ng-pending');
  });


  it('should change $invalid state while when validation resolves', function() {

    setup();
    var validations = addAsyncValidator(ngModelCtrl);

    // Select a date to trigger an async validation to begin
    selectDate('Monday');
    scope.$digest(); // trigger asyncApply

    // Resolve the async validation to valid
    validations['0'].resolve(true);
    resolveAllPromises();
    scope.$digest(); // trigger promise resolutions and asyncApply

    expect(ngModelCtrl.$valid).toBe(true);
    expect(ngModelCtrl.$invalid).toBe(false);
    expect($animate.setClass).toHaveBeenCalledWith(element, 'ng-valid', 'ng-invalid');


    // Select a date to trigger an async validation to begin
    selectDate('Tuesday');
    scope.$digest(); // trigger asyncApply

    // Resolve the async validation to invalid
    validations['1'].resolve(false);
    resolveAllPromises();
    scope.$digest(); // trigger promise resolutions and asyncApply

    expect(ngModelCtrl.$valid).toBe(false);
    expect(ngModelCtrl.$invalid).toBe(true);
    expect($animate.setClass).toHaveBeenCalledWith(element, 'ng-invalid', 'ng-valid');
  });


  it('should update dirty state when input changes', function() {

    setup();

    logNgModelControllerEvent('$dirtyChanged');
    logNgModelControllerEvent('$pristineChanged');

    expect(ngModelCtrl.$dirty).toBe(false);
    expect(ngModelCtrl.$pristine).toBe(true);

    selectDate('Thursday');

    // trigger async apply
    scope.$digest();

    expect(ngModelCtrl.$dirty).toBe(true);
    expect(ngModelCtrl.$pristine).toBe(false);

    expect(log).toEqual([
      '$parseView: from "undefined" to "Thursday"',
      '$modelValueChanged: from "undefined" to "3"',
      '$dirtyChanged: from "false" to "true"',
      '$pristineChanged: from "true" to "false"'
    ]);
  });
});