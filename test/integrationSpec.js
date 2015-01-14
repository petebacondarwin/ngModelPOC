describe('USE CASE: date input', function() {

  var inputCtrl, ngModel, scope, log;
  var WEEKMAP = {
    0: 'Monday', 1: 'Tuesday', 2: 'Wednesday', 3: 'Thursday', 4: 'Friday', 5: 'Saturday', 6: 'Sunday',
    'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4, 'Saturday': 5, 'Sunday': 6
  };
  var dayNumberFn = function(value) { return WEEKMAP[value]; };

  function setup(initialScopeDate, initialInputValue) {

    log = [];

    // Initialize a "scope"
    scope = {
      dayNumber : initialScopeDate
    };

    // Initialize an input control
    inputCtrl = {
      value: initialInputValue,
      $readValue: function() { return inputCtrl.value; },
      $writeValue: function(value) { inputCtrl.value = value; },
      onChange: function() {
        ngModel.$setViewValue(inputCtrl.$readValue());
      }
    };

    // Initialize the ngModelController that converts numbers to and from week days
    ngModel = new NgModelController();
    ngModel.$onModelValueChanged(function(newVal, oldVal) {
      scope.dayNumber = newVal;
      log.push('modelValueChanged: from "' + oldVal + '" to "' + newVal + '"');
    });
    ngModel.$onViewValueChanged(function(newVal, oldVal) {
      inputCtrl.value = newVal;
      log.push('viewValueChanged: from "' + oldVal + '" to "' + newVal + '"');
    });
    ngModel.$transforms.append('dayNumber', dayNumberFn, dayNumberFn);
  }

  it('should update the scope when the input changes', function() {
    setup();

    expect(scope.dayNumber).toBeUndefined();
    expect(inputCtrl.value).toBeUndefined();

    // Simulate a date selection
    inputCtrl.value = 'Sunday';
    inputCtrl.onChange();

    expect(log).toEqual([
      'viewValueChanged: from "undefined" to "Sunday"',
      'modelValueChanged: from "undefined" to "6"'
    ]);
    expect(scope.dayNumber).toEqual(6);

    // Simulate a date selection
    inputCtrl.value = 'Monday';
    inputCtrl.onChange();

    expect(log).toEqual([
      'viewValueChanged: from "undefined" to "Sunday"',
      'modelValueChanged: from "undefined" to "6"',
      'viewValueChanged: from "Sunday" to "Monday"',
      'modelValueChanged: from "6" to "0"'
    ]);

    expect(scope.dayNumber).toEqual(0);
  });
});