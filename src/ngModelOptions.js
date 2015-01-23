function ngModelOptionsDirective() {
  return {
    restrict: 'A',
    require: ['ngModelOptions', '?^^ngModelOptions'],
    controller: function() {},
    priority: 1,
    link: {
      pre: function(scope, element, attrs, ctrls) {
        var ngModelOptionsCtrl = ctrls[0];
        var parentOptionsCtrl = ctrls[1];
        ngModelOptionsCtrl.$options = new NgModelOptions(
                                              scope.$eval($attrs.ngModelOptions),
                                              parentOptionsCtrl && parentOptionsCtrl.$options,
                                              $defaultNgOptions,
                                              $ngModelAdaptors);
      }
    }
  };
}



function NgModelOptions(localOptions, parentOptions, defaultOptions, ngModelAdaptors) {

  extend(this, parentOptions || defaultOptions, localOptions);

  this.$applyAdaptors = ngModelAdaptors.composeAdaptors(this.adaptors);

  this.$mapEvents = function(inputCtrl) {
    var options = this;
    if (isString(options.updateOn)) {
      options.updateOn.split().forEach(function(domEvent) {
        var debounce = isObject(options.debounce) ? options.debounce[domEvent] : options.debounce;
        inputCtrl.$mapEvent(domEvent, 'change', debounce);
      });
    }
  };
};
