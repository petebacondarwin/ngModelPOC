function ModelAdaptor(scope, ngModelController) {

  scope.$watch(ngModelController.$ngModelGet, function(value) {
    ngModelController.$setModelValue(value);
  });

  ngModelController.$modelValueChanged.addHandler(function(value, oldValue) {
    ngModelController.$ngModelSet(scope, value);
  });
}


function ViewAdaptor(ngModelController, inputController) {

  inputController.$change.addHandler(function(value, oldValue) {
    ngModelController.$validity.validate(value).then(function(validationResults) {
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