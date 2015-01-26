function StateManager($scope, $animate, $owner) {
  this.$scope = $scope;
  this.$animate = $animate;
  this.$owner = $owner;
}

StateManager.prototype.$initState = function(state) {

  var mgr = this;

  this.$owner[state.on] = false;
  if (state.off) this.$owner[state.off] = true;

  this.$animate.setClass(this.$owner.$element, state.offClass || [], state.onClass || []);

  this.$owner[state.on + 'Changed'] = new EventList();
  if (state.off) this.$owner[state.off + 'Changed'] = new EventList();

  if (state.set) this.$owner[state.set] = function() { mgr.$setState(state); };
  if (state.clear) this.$owner[state.clear] = function() { mgr.$clearState(state); };
};

StateManager.prototype.$setState = function(state) {
  var $owner = this.$owner;
  if ($owner[state.on] === true) return;

  this.$scope.$applyAsync(function() {
    $owner[state.on] = true;
    if (state.off) $owner[state.off] = false;
    $animate.setClass($owner.$element, state.onClass || [], state.offClass || []);
    $owner[state.on + 'Changed'].trigger(true, false);
    if (state.off) $owner[state.off + 'Changed'].trigger(false, true);
  });
};


StateManager.prototype.$clearState = function(state) {
  var $owner = this.$owner;
  if (this.$owner[state.on] === false) return;

  this.$scope.$applyAsync(function() {
    $owner[state.on] = false;
    if (state.off) $owner[state.off] = true;
  $animate.setClass($owner.$element, state.offClass || [], state.onClass || []);
    $owner[state.on + 'Changed'].trigger(false, true);
    if (state.off) $owner[state.off + 'Changed'].trigger(true, false);
  });
};