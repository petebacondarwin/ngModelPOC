

function NgModelController() {
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
  }};


NgModelController.prototype.$isEmpty = function(value) {
  return isUndefined(value) || value === '' || value === null || value !== value;
};
