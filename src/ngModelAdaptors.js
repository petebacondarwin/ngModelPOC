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


function readFromElementOnEvent(ngModelController, inputController, eventName) {

  inputController.$handleInputEvent(eventName, function() {
    var value = inputController.$readValue();
    ngModelController.$setViewValue(value);
  });
}


function writeToScopeIfValid(ngModelController) {

  ngModelController.$modelValueChanged.addHandler(function(value) {

    return ngModelController.$validity.validate(value).then(function(validationResults) {

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
