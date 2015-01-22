

function NgModelController($scope, $element, $attrs, $parse, $defaultNgModelOptions) {
  this.$scope = $scope;
  this.$element = $element;
  this.$attrs = $attrs;
  this.$defaultNgModelOptions = $defaultNgModelOptions;

  this.$ngModelExp = ngModelExp = $parse($attrs.ngModel);
  this.$ngModelGet = function() { return ngModelExp($scope); };
  this.$ngModelSet = ngModelExp.assign ? function(value) { return ngModelExp.assign($scope, value); } : noop;


  this.$modelValue = undefined;
  this.$viewValue = undefined;

  this.$isCollection = false;

  this.$transforms =  new Transforms();
  this.$validity = new Validity();

  this.$parseView = new EventList();
  this.$parseError = new EventList();
  this.$modelValueChanged = new EventList();
  this.$formatModel = new EventList();
  this.$formatError = new EventList();
  this.$viewValueChanged = new EventList();
}



//////////  Initialisation and Configuration  ///////////

NgModelController.prototype.$$setNgModelOptionsController = function(ngModelOptionsController) {
  this.$ngModelOptions = ngModelOptionsController || ngModelOptionsController.$options;
};


NgModelController.prototype.$$setFormController = function(formController) {

  var ngModelCtrl = this;

  this.$formController = formController;

  // Connect to the formController
  formController.$addControl(ngModelCtrl);
  this.$attrs.$observe('name', function(newValue) {
    if (ngModelCtrl.$name !== newValue) {
      formController.$$renameControl(ngModelCtrl, newValue);
    }
  });
  scope.$on('$destroy', function() {
    formController.$removeControl(ngModelCtrl);
  });
};


NgModelController.prototype.$$setInputController = function(inputController) {
  this.$inputController = inputController;
};


NgModelController.prototype.$$installAdaptors = function() {
  var ngModelCtrl = this;

  // Initialize the ngModelOptions if it was not set by a directive
  if (!this.$ngModelOptions) {
    this.$ngModelOptions = this.$defaultNgModelOptions;
  }

  // Initialize the inputController if it was not set by a directive
  if (!this.$inputController) {
    this.$inputController = this.$defaultNgModelOptions.$createInputController(this.$element);
  }

  // Run each of the adaptors to install them on this instance of NgModelController
  this.$ngModelOptions.$ngModelAdaptors.forEach(function(adaptor) {
    adaptor(ngModelCtrl, ngModelCtrl.$inputController);
  });
}



//////////  Model <-> View Transformations  ////////


NgModelController.prototype.$setModelValue = function(value) {
  var oldModelValue = this.$modelValue;
  var oldViewValue = this.$viewValue;

  try {

    // Update the model value
    this.$modelValue = value;
    this.$formatModel.trigger(this.$modelValue, oldModelValue);

    // Transform the value and update the view value
    this.$viewValue = this.$transforms.format(value, this.$isCollection);
    this.$viewValueChanged.trigger(this.$viewValue, oldViewValue);

  } catch(x) {
    // Something went wrong in the formatting - reset model value
    this.$formatError.trigger(x);
    this.$modelValue = oldModelValue;
    this.$modelValueChanged.trigger(value, this.$modelValue);
  }
};


NgModelController.prototype.$setViewValue = function(value) {
  var oldModelValue = this.$modelValue;
  var oldViewValue = this.$viewValue;

  try {

    // Update the view value
    this.$viewValue = value;
    this.$parseView.trigger(this.$viewValue, oldViewValue);

    // Transform the value and update the model value
    this.$modelValue = this.$transforms.parse(value, this.$isCollection);
    this.$modelValueChanged.trigger(this.$modelValue, oldModelValue);

  } catch(x) {
    // Something went wrong in the parsing - reset view value
    this.$parseError.trigger(x);
    this.$viewValue = oldViewValue;
    this.$viewValueChanged.trigger(value, this.$viewValue);
  }
};



/////// State Management //////////

NgModelController.prototype.$initState = function(state) {
  this[state.on] = false;
  if (state.off) this[state.off] = true;
  $animate.setClass(this.$element, state.offClass || [], state.onClass || []);
  this[state.on + 'Changed'] = new EventList();
  if (state.off) this[state.off + 'Changed'] = new EventList();
};

NgModelController.prototype.$setState = function(state) {
  if (this[state.on] === true) return;

  var ngModelCtrl = this;

  this.$scope.$applyAsync(function() {
    ngModelCtrl[state.on] = true;
    if (state.off) ngModelCtrl[state.off] = false;
    $animate.setClass(ngModelCtrl.$element, state.onClass || [], state.offClass || []);
    ngModelCtrl[state.on + 'Changed'].trigger(true, false);
    if (state.off) ngModelCtrl[state.off + 'Changed'].trigger(false, true);
  });
};


NgModelController.prototype.$clearState = function(state) {
  if (this[state.on] === false) return;

  var ngModelCtrl = this;

  this.$scope.$applyAsync(function() {
    ngModelCtrl[state.on] = false;
    if (state.off) ngModelCtrl[state.off] = true;
  $animate.setClass(ngModelCtrl.$element, state.offClass || [], state.onClass || []);
    ngModelCtrl[state.on + 'Changed'].trigger(false, true);
    if (state.off) ngModelCtrl[state.off + 'Changed'].trigger(true, false);
  });
};



////////////  Helpers  /////////////


NgModelController.prototype.$isEmpty = function(value) {
  return isUndefined(value) || value === '' || value === null || value !== value;
};
