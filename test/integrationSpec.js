describe('USE CASE: date input', function() {

  var element, inputCtrl, ngModel, scope, log;
  var WEEKMAP = {
    0: 'Monday', 1: 'Tuesday', 2: 'Wednesday', 3: 'Thursday', 4: 'Friday', 5: 'Saturday', 6: 'Sunday',
    'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4, 'Saturday': 5, 'Sunday': 6
  };
  var dayNumberFn = function(value) { return value !== null ? WEEKMAP[value] : null; };


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
    ngModel = new NgModelController(ngModelGet);
    ngModel.$transforms.append('dayNumber', dayNumberFn, dayNumberFn);


    // Initialize adaptors for this setup
    var modelAdaptor = new ModelAdaptor(scope, ngModel);
    var viewAdaptor = new ViewAdaptor(ngModel, inputCtrl);


    // Add some logging for tests
    ngModel.$modelValueChanged.addHandler(function(newVal, oldVal) {
      log.push('modelValueChanged: from "' + oldVal + '" to "' + newVal + '"');
    });
    ngModel.$parseView.addHandler(function(newVal, oldVal) {
      log.push('parseView: from "' + oldVal + '" to "' + newVal + '"');
    });
    ngModel.$formatModel.addHandler(function(newVal, oldVal) {
      log.push('formatModel: from "' + oldVal + '" to "' + newVal + '"');
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
    resolveAllPromises();
  }

  function changeScope(dayNumber) {
    scope.dayNumber = dayNumber;
    scope.$digest();
    resolveAllPromises();
  }


  beforeEach(function() {
    mockPromises.install(Q.makePromise);
    mockPromises.reset();
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


  it("should set the model to null if the view is invalid", function() {

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
      'parseView: from "Monday" to "null"',
      'modelValueChanged: from "0" to "null"'
    ]);
    expect(scope.dayNumber).toEqual(null);
  });
});