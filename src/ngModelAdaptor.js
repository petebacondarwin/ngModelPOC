function ModelAdaptor(scope, ngModelController) {

  scope.$watch(ngModelController.$ngModelGet, function(value) {
    ngModelController.$setModelValue(value);
  });

  ngModelController.$modelValueChanged.addHandler(function(value, oldValue) {
    ngModelController.$ngModelSet(scope, value);
  });
}


function ViewAdaptor(ngModelController, inputController) {

  //TODO: handle the case where validation1 takes longer than validation2 and
  //      so resolves after it.

  inputController.$handleInputEvent('change', function() {
    var oldValue = ngModelController.$viewValue;
    var value = inputController.$readValue();

    return ngModelController.$validity.validate(value).then(function(validationResults) {
      if (validationResults.isValid) {
        ngModelController.$setViewValue(value);
      } else {
        // This is the current convention...
        ngModelController.$setViewValue(null);
      }
    });
  });

  ngModelController.$viewValueChanged.addHandler(function(value, oldValue) {
    inputController.$writeValue(value);
  });
}