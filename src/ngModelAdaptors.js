function watchScope(ngModelController) {

  ngModelController.$scope.$watch(ngModelController.$ngModelExp, function(value) {
    if (value !== ngModelController.$modelValue) {
      ngModelController.$setModelValue(value);
    }
  });
}


function writeToElement(ngModelController, inputController) {

  ngModelController.$viewValueChanged.addHandler(function(value) {
    inputController.$writeValue(value);
  });
}


function readFromElementOnChange(ngModelController, inputController) {

  inputController.$handleInputEvent('change', function() {
    var value = inputController.$readValue();
    if (value !== ngModelController.$viewValue) {
      ngModelController.$setViewValue(value);
    }
  });
}


function writeToScopeIfValid(ngModelController) {

  var pendingState = {
    on: '$pending',
    onClass: 'ng-pending'
  };
  ngModelController.$initState(pendingState);

  ngModelController.$modelValueChanged.addHandler(function(value) {

    ngModelController.$setState(pendingState);

    return ngModelController.$validity.validate(value).then(function(validationResults) {

      ngModelController.$clearState(pendingState);

      if (validationResults.isValid) {
        ngModelController.$modelValue = value;
        ngModelController.$ngModelSet(value);
      } else {
        // This is the current convention...
        ngModelController.$modelValue = null;
        ngModelController.$ngModelSet(null);
      }
    });
  });
}


function setTouchedOnBlur(ngModelController, inputController) {
  var touchedState = {
    on: '$touched',
    off: '$untouched',
    onClass: 'ng-touched',
    offClass: 'ng-untouched'
  };

  inputController.$mapEvent('blur', 'touched');

  inputController.$handleInputEvent('touched', function() {
    ngModelController.$setState(touchedState);
  });

  ngModelController.$initState(touchedState);
}


function setDirtyOnChange(ngModelController, inputController) {
  var dirtyState = {
    on: '$dirty',
    off: '$pristine',
    onClass: 'ng-dirty',
    offClass: 'ng-pristine'
  };

  inputController.$handleInputEvent('change', function() {
    ngModelController.$setState(dirtyState);
  });

  ngModelController.$initState(dirtyState);
}
