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

  var pendingValidations = [];

  ngModelController.$modelValueChanged.addHandler(function(value, oldValue) {

    // We are about to validate store a pending validation
    var pendingValidation = Q.defer();
    pendingValidations.push(pendingValidation);

    ngModelController.$validity.validate(value).then(function(validationResults) {

      // Lookup the pending validation, if it is not there then it was out of date
      var index = pendingValidations.indexOf(pendingValidation);
      if (index !== -1) {

        if (validationResults.isValid) {
          ngModelController.$modelValue = value;
          ngModelController.$ngModelSet(value);
        } else {
          // This is the current convention...
          ngModelController.$modelValue = null;
          ngModelController.$ngModelSet(null);
        }

        // Clear this pendingValidation and any previous, out of date, ones
        pendingValidations.splice(0, index+1);
        pendingValidation.resolve(value);
      }
    });

    return pendingValidation.promise;
  });
}