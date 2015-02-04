

function NgModelController($scope, $element, $attrs, $parse, $interpolate) {

  // Injected helpers
  this.$scope = $scope;
  this.$element = $element;
  this.$attrs = $attrs;


  // Legacy properties
  this.$viewValue = Number.NaN;
  this.$modelValue = Number.NaN;

  this.$validators = {};
  this.$asyncValidators = {};
  this.$parsers = [];
  this.$formatters = [];
  this.$viewChangeListeners = [];

  this.$name = $interpolate($attrs.name || '', false)($scope);

  this.$error = {}; // keep invalid keys here
  this.$$success = {}; // keep valid keys here



  this.$ngModelExp = ngModelExp = $parse($attrs.ngModel);
  this.$ngModelGet = function() { return ngModelExp($scope); };
  this.$ngModelSet = ngModelExp.assign ? function(value) { return ngModelExp.assign($scope, value); } : noop;

  this.$inputController = new InputController(this.$element);

  this.$modelValue = undefined;
  this.$viewValue = undefined;

  this.$isCollection = false;

  this.$parsers = [];
  this.$formatters = [];


  this.$validity = new Validity();
  this.$states = new StateManager($scope, $animate, this);

  this.$parseView = new EventList();
  this.$parseError = new EventList();
  this.$modelValueChanged = new EventList();
  this.$formatModel = new EventList();
  this.$formatError = new EventList();
  this.$viewValueChanged = new EventList();
}



//////////  Initialisation and Configuration  ///////////

NgModelController.prototype.$setFormController = function(formController) {

  var ngModelCtrl = this;

  this.$formController = formController;

  // Connect to the formController
  formController.$addControl(ngModelCtrl);
  ngModelCtrl.$attrs.$observe('name', function(newValue) {
    if (ngModelCtrl.$name !== newValue) {
      formController.$$renameControl(ngModelCtrl, newValue);
    }
  });
  this.$scope.$on('$destroy', function() {
    formController.$removeControl(ngModelCtrl);
  });
};


NgModelController.prototype.$setInputController = function(inputController) {
  this.$inputController = inputController;
};


NgModelController.prototype.$applyOptions = function(ngModelOptions) {
  var ngModelCtrl = this;

  this.$ngModelOptions = ngModelOptions;

  // Run each of the adaptors to install them on this instance of NgModelController
  ngModelOptions.$applyAdaptors(ngModelCtrl, ngModelCtrl.$inputController);

  // Set up the event mappings
  ngModelOptions.$mapEvents(ngModelCtrl.$inputController);
};


NgModelController.prototype.$initalizeTransforms = function() {

  // Ensure that all the transforms are instances of the Transform class

  this.$parsers = this.$parsers.map(function(parser) {
    return (parser instanceof Transform) ? parser : Transform.fromLegacyFn(parser);
  });

  this.$formatters = this.$formatters.map(function(formatter) {
    return (formatter instanceof Transform) ? formatter : Transform.fromLegacyFn(formatter);
  });
};



//////////  Model <-> View Transformations  ////////


NgModelController.prototype.$parse = function(value) {
  this.$parseView.trigger(this.$viewValue);
  this.$parsers.forEach(function(parser) {
    value = parser.doTransform(value);
  });
  return value;
};


NgModelController.prototype.$format = function(value) {
  this.$formatModel.trigger(this.$modelValue);
  this.$formatters.forEach(function(formatter) {
    value = formatter.doTransform(value);
  });
  return value;
};


NgModelController.prototype.$setModelValue = function(value) {

  var oldModelValue = this.$modelValue;
  var oldViewValue = this.$viewValue;

  try {
    this.$modelValue = value;
    this.$viewValue = this.$format(value);
    this.$viewValueChanged.trigger(this.$viewValue, oldViewValue);
  } catch(x) {
    // Something went wrong in the formatting - reset model value
    this.$modelValue = oldModelValue;
    this.$formatError.trigger(x);
    throw x;
  }
};


NgModelController.prototype.$setViewValue = function(value) {

  var oldModelValue = this.$modelValue;
  var oldViewValue = this.$viewValue;

  try {
    this.$viewValue = value;
    this.$modelValue = this.$parse(value);
    this.$modelValueChanged.trigger(this.$modelValue, oldModelValue);
  } catch(x) {
    // Something went wrong in the parsing - reset view value
    this.$viewValue = oldViewValue;
    this.$parseError.trigger(x);
    throw x;
  }
};
