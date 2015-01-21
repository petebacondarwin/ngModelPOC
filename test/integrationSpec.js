describe('USE CASE: date input', function() {

  var element, inputCtrl, ngModel, scope, log;
  var WEEKMAP = {
    0: 'Monday', 1: 'Tuesday', 2: 'Wednesday', 3: 'Thursday', 4: 'Friday', 5: 'Saturday', 6: 'Sunday',
    'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4, 'Saturday': 5, 'Sunday': 6
  };
  var dayNumberFn = function(value) { return isDefined(WEEKMAP[value]) ? WEEKMAP[value] : null; };


  function setup(initialScopeDate, initialInputValue) {

    log = [];


    // Initialize a "scope"
    scope = new Scope();
    scope.dayNumber = initialScopeDate;


    // Create our ngModel "expression"
    var ngModelGet = function(scope) {
      return scope.dayNumber;
    };
    ngModelGet.assign = function(scope, value) {
      scope.dayNumber = value;
    };


    // Initialize an input control
    element = new Element(initialInputValue);
    inputCtrl = new InputController(element);
    inputCtrl.$mapEvent('keydown', 'change', 100);

    // Initialize the ngModelController that converts numbers to and from week days
    ngModel = new NgModelController(scope, element, ngModelGet);


    // Simulate a transform directive
    ngModel.$transforms.append('dayNumber', dayNumberFn, dayNumberFn);


    // Initialize adaptors for this setup
    watchScope(ngModel);
    writeToElement(ngModel, inputCtrl);
    readFromElementOnChange(ngModel, inputCtrl);
    writeToScopeIfValid(ngModel);
    setTouchedOnBlur(ngModel, inputCtrl);
    setDirtyOnChange(ngModel, inputCtrl);

    // Add some logging for tests
    ngModel.$modelValueChanged.addHandler(function(newVal, oldVal) {
      log.push('modelValueChanged: from "' + oldVal + '" to "' + newVal + '"');
    });
    ngModel.$parseView.addHandler(function(newVal, oldVal) {
      log.push('parseView: from "' + oldVal + '" to "' + newVal + '"');
    });
    ngModel.$parseError.addHandler(function(error) {
      log.push('parseError: from "' + error + '"');
    });
    ngModel.$formatModel.addHandler(function(newVal, oldVal) {
      log.push('formatModel: from "' + oldVal + '" to "' + newVal + '"');
    });
    ngModel.$formatError.addHandler(function(error) {
      log.push('formatError: from "' + error + '"');
    });
    ngModel.$viewValueChanged.addHandler(function(newVal, oldVal) {
      log.push('viewValueChanged: from "' + oldVal + '" to "' + newVal + '"');
    });
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


  function addAsyncValidator(ngModel) {
    var validations = {};

    // Add an async validator
    ngModel.$validity.addValidator('day', function(viewValue) {

      // We are going to defer the validation
      // adding it to the validations object so that we can resolve it
      // later in the test
      var validation = Q.defer();
      validations[viewValue] = validation;

      // We return a promise for the validation
      return validation.promise;
    });

    return validations;
  }


  beforeEach(function() {
    mockPromises.install(Q.makePromise);
    mockPromises.reset();

    spyOn($animate, 'setClass');
  });


  it('should update the scope when the input changes', function() {

    setup();

    log = [];
    selectDate('Sunday');
    expect(log).toEqual([
      'parseView: from "undefined" to "Sunday"',
      'modelValueChanged: from "undefined" to "6"'
    ]);
    expect(scope.dayNumber).toEqual(6);


    log = [];
    selectDate('Monday');
    expect(log).toEqual([
      'parseView: from "Sunday" to "Monday"',
      'modelValueChanged: from "6" to "0"'
    ]);
    expect(scope.dayNumber).toEqual(0);
  });


  it('should update the input element when the scope changes', function() {

    setup();

    log = [];
    changeScope(5);
    expect(log).toEqual([
      'formatModel: from "undefined" to "5"',
      'viewValueChanged: from "undefined" to "Saturday"'
    ]);
    expect(element.val()).toEqual('Saturday');


    log = [];
    changeScope(2);
    expect(log).toEqual([
      'formatModel: from "5" to "2"',
      'viewValueChanged: from "Saturday" to "Wednesday"'
    ]);
    expect(element.val()).toEqual('Wednesday');

  });


  it('should set the model to null if the view is invalid', function() {

    setup();

    // Add a validator
    ngModel.$validity.addValidator('day', function(viewValue) {
      return !isUndefined(WEEKMAP[viewValue]);
    });


    log = [];
    selectDate('Monday');
    expect(log).toEqual([
      'parseView: from "undefined" to "Monday"',
      'modelValueChanged: from "undefined" to "0"'
    ]);
    expect(scope.dayNumber).toEqual(0);


    // Simulate an invalid date selection
    log = [];
    selectDate('Badday');
    expect(log).toEqual([
      'parseView: from "Monday" to "Badday"',
      'modelValueChanged: from "0" to "null"'
    ]);
    expect(scope.dayNumber).toEqual(null);
  });


  it('should ignore out of date validations', function() {

    setup();

    var validations = addAsyncValidator(ngModel);

    log = [];

    // Provide a couple of view changes that will trigger unresolved validations
    selectDate('Monday');
    expect(log).toEqual([
      'parseView: from "undefined" to "Monday"',
      'modelValueChanged: from "undefined" to "0"'
    ]);
    expect(validations).toEqual({ '0': jasmine.any(Object) });
    expect(scope.dayNumber).toBeUndefined();

    selectDate('Tuesday');
    expect(log).toEqual([
      'parseView: from "undefined" to "Monday"',
      'modelValueChanged: from "undefined" to "0"',
      'parseView: from "Monday" to "Tuesday"',
      'modelValueChanged: from "0" to "1"'
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
    var validations = addAsyncValidator(ngModel);

    // Select a date to trigger an async validation to begin
    selectDate('Monday');
    scope.$digest(); // trigger asyncApply

    expect(ngModel.$pending).toBe(true);
    expect($animate.setClass).toHaveBeenCalledWith(element, 'ng-pending', []);

    $animate.setClass.calls.reset();

    // Now resolve the async validation
    validations['0'].resolve(true);
    resolveAllPromises();
    scope.$digest(); // trigger promise resolutions and asyncApply

    expect(ngModel.$pending).toBe(false);
    expect($animate.setClass).toHaveBeenCalledWith(element, [], 'ng-pending');
  });


  it('should update dirty state when input changes', function() {

    setup();

    ngModel.$dirtyChanged.addHandler(function(newVal, oldVal) {
      log.push('$dirtyChanged: from "' + oldVal + '" to "' + newVal + '"');
    });
    ngModel.$pristineChanged.addHandler(function(newVal, oldVal) {
      log.push('$pristineChanged: from "' + oldVal + '" to "' + newVal + '"');
    });

    expect(ngModel.$dirty).toBe(false);
    expect(ngModel.$pristine).toBe(true);

    selectDate('Thursday');

    // trigger async apply
    scope.$digest();

    expect(ngModel.$dirty).toBe(true);
    expect(ngModel.$pristine).toBe(false);

    expect(log).toEqual([
      'parseView: from "undefined" to "Thursday"',
      'modelValueChanged: from "undefined" to "3"',
      '$dirtyChanged: from "false" to "true"',
      '$pristineChanged: from "true" to "false"'
    ]);
  });
});