/// This represents the ngModel directive

function NgModelDirective($defaultNgModelOptions) {

  return {
    restrict: 'A',
    require: ['ngModel', '^?form', '^?ngModelOptions'],
    controller: NgModelController,
    priority: 1,
    link: {
      pre: function ngModelPreLink(scope, element, attrs, ctrls) {
        var ngModelCtrl = ctrls[0];

        if (!ngModelCtrl) return;

        var formController = ctrls[1] || nullFormController;
        ngModelCtrl.$setFormController(formController);

        var ngModelOptions = (ctrls[2] && ctrls[2].$options) || $defaultNgModelOptions;
        ngModelCtrl.$applyOptions(ngModelOptions);
      },
      post: function ngModelPostLink(scope, element, attrs, ctrls) {
        var ngModelCtrl = ctrls[0];

        if (!ngModelCtrl) return;

        ngModelCtrl.$initalizeTransforms();
      }
    }
  };
};


function nullFormRenameControl(control, name) {
  control.$name = name;
}

var nullFormController = {
  $addControl: noop,
  $$renameControl: nullFormRenameControl,
  $removeControl: noop,
  $setValidity: noop,
  $setDirty: noop,
  $setPristine: noop,
  $setSubmitted: noop
};