function bindToScope(scope, ngModelController) {

  scope.$watch(ngModelController.$ngModelGet, function(value) {
    ngModelController.$setModelValue(value);
  });

  ngModelController.$modelValueChanged.addHandler(function(value, oldValue) {
    ngModelController.$ngModelSet(scope, value);
  });
}


function writeToElement(ngModelController, inputController) {

  ngModelController.$viewValueChanged.addHandler(function(value, oldValue) {
    inputController.$writeValue(value);
  });
}

function readFromElementWithValidation(ngModelController, inputController) {

  var pendingValidations = [];

  inputController.$handleInputEvent('change', function() {
    var oldValue = ngModelController.$viewValue;
    var value = inputController.$readValue();

    // We are about to validate store a pending validation
    var pendingValidation = Q.defer();
    pendingValidations.push(pendingValidation);

    ngModelController.$validity.validate(value).then(function(validationResults) {

      // Lookup the pending validation, if it is not there then it was out of date
      var index = pendingValidations.indexOf(pendingValidation);
      if (index !== -1) {

        if (validationResults.isValid) {
          ngModelController.$setViewValue(value);
        } else {
          // This is the current convention...
          ngModelController.$setViewValue(null);
        }

        // Clear this pendingValidation and any previous, out of date, ones
        pendingValidations.splice(0, index+1);
        pendingValidation.resolve(value);
      }
    });

    return pendingValidation.promise;
  });
}