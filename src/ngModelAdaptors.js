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


function NgModelAdaptors() {
  this.adaptors = {};
}


// Register a new adaptor by name
NgModelAdaptors.prototype.register = function(name, adaptor) {
  this.adaptors[name] = adaptor;
};


NgModelAdaptors.prototype.composeAdaptors = function(adaptorNames) {
  var adaptorMap = this.adaptors;
  var adaptors = adaptorNames.map(function(adaptorName) {
    var adaptor = adaptorMap[adaptorName];
    if (!adaptor) throw new Error('Requested Model Adaptor, "' + adaptorName + '" has not been registered.');
    return adaptorMap[adaptorName];
  });

  // Return a new function that will call all these adaptors
  return function(ngModelController, inputController) {
    adaptors.forEach(function(adaptor) {
      adaptor.call(null, ngModelController, inputController);
    });
  }
};


// The instance of the service used by the NgModelOptionsController
$ngModelAdaptors = new NgModelAdaptors();

$ngModelAdaptors.register('watchScope', watchScope);
$ngModelAdaptors.register('writeToElement', writeToElement);
$ngModelAdaptors.register('readFromElementOnChange', readFromElementOnChange);
$ngModelAdaptors.register('writeToScopeIfValid', writeToScopeIfValid);
$ngModelAdaptors.register('setTouchedOnBlur', setTouchedOnBlur);
$ngModelAdaptors.register('setDirtyOnChange', setDirtyOnChange);
$ngModelAdaptors.register('delegateIsEmptyToInputController', delegateIsEmptyToInputController);
$ngModelAdaptors.register('defaultAdaptor', $ngModelAdaptors.composeAdaptors([
    'watchScope',
    'writeToElement',
    'readFromElementOnChange',
    'writeToScopeIfValid',
    'setTouchedOnBlur',
    'setDirtyOnChange',
    'delegateIsEmptyToInputController'
]));


function watchScope(ngModelController) {

  ngModelController.$scope.$watch(ngModelController.$ngModelExp, function(value) {
    if (value !== ngModelController.$modelValue) {
      ngModelController.$setModelValue(value);
    }
  });
}


function delegateIsEmptyToInputController(ngModelController, inputController) {

  ngModelController.$isEmpty = function() { inputController.isEmpty(); };
};


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

  var invalidState = {
    on: '$invalid',
    off: '$valid',
    onClass: 'ng-invalid',
    offClass: 'ng-valid'
  };

  ngModelController.$states.$initState(pendingState);
  ngModelController.$states.$initState(invalidState);

  ngModelController.$modelValueChanged.addHandler(function(value) {

    ngModelController.$states.$setState(pendingState);

    return ngModelController.$validity.validate(value).then(function(validationResults) {

      ngModelController.$states.$clearState(pendingState);

      if (validationResults.isValid) {
        ngModelController.$states.$clearState(invalidState);
        ngModelController.$modelValue = value;
        ngModelController.$ngModelSet(value);
      } else {
        ngModelController.$states.$setState(invalidState);
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
    ngModelController.$states.$setState(touchedState);
  });

  ngModelController.$states.$initState(touchedState);
}


function setDirtyOnChange(ngModelController, inputController) {
  var dirtyState = {
    on: '$dirty',
    off: '$pristine',
    onClass: 'ng-dirty',
    offClass: 'ng-pristine'
  };

  inputController.$handleInputEvent('change', function() {
    ngModelController.$states.$setState(dirtyState);
  });

  ngModelController.$states.$initState(dirtyState);
}
