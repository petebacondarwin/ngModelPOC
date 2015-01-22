// # ngModelAdaptors
//
// Adaptors are the glue that join together the main components (NgModelController and
// InputController). In so doing they define the macro behaviour you expect from the
// ngModel system.
//
// Adaptors are functions that accept up to two parameters:
//
// function someAdaptor(ngModelController, inputController)
//
// The functions are called each time an ngModel directive is instantiated to define how
// that particular ngModel is setup.
//
// We register adaptors with the $modelAdaptorsProvider during the Angular
// configuration phase.
//
// The ngModel directive works out what adaptors it needs from the nearest ancestor ngModelOptions
// directive in the DOM.
//
// Adaptors can be composed (by calling each other). For an example see the `defaultAdaptor` below.


function defaultAdaptor(ngModelController, inputController) {
  watchScope(ngModelController);
  writeToElement(ngModelController, inputController);
  readFromElementOnChange(ngModelController, inputController);
  writeToScopeIfValid(ngModelController);
  setTouchedOnBlur(ngModelController, inputController);
  setDirtyOnChange(ngModelController, inputController);
}


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
