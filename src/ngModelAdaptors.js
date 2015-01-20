function watchScope(ngModelController) {

  ngModelController.$scope.$watch(ngModelController.$ngModelExp, function(value) {
    ngModelController.$setModelValue(value);
  });
}


function writeToElement(ngModelController, inputController) {

  ngModelController.$viewValueChanged.addHandler(function(value, oldValue) {
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

  ngModelController.$modelValueChanged.addHandler(function(value, oldValue) {

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