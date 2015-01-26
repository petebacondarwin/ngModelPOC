describe('StateManager', function() {

  var owner, scope, state;

  beforeEach(function() {
    state = {
      on: '$stateOn', off: '$stateOff',
      onClass: 'state-on', offClass: 'state-off',
      set: '$turnOn', clear: '$turnOff'
    };
    scope = new Scope();
    owner = {
      $element: {}
    };
    owner.states = new StateManager(scope, $animate, owner);
    spyOn($animate, 'setClass');
  });

  describe('$initState', function() {

    it('should set up the related properties on the controller', function() {
      owner.states.$initState(state);
      expect(owner.$stateOn).toBe(false);
      expect(owner.$stateOff).toBe(true);
    });


    it('should add event lists for on and off state changes', function() {

      owner.states.$initState(state);
      expect(owner.$stateOnChanged).toEqual(jasmine.any(EventList));
      expect(owner.$stateOffChanged).toEqual(jasmine.any(EventList));
    });

    it('should provide setters for the on and off states', function() {
      owner.states.$initState(state);

      owner.$turnOn();
      scope.$digest(); // trigger async apply
      expect(owner.$stateOn).toBe(true);
      expect(owner.$stateOff).toBe(false);

      owner.$turnOff();
      scope.$digest(); // trigger async apply
      expect(owner.$stateOn).toBe(false);
      expect(owner.$stateOff).toBe(true);
    });
  });


  describe('$setState', function() {

    it('should set the on state to true and the off state to false', function() {

      owner.states.$initState(state);

      owner.states.$setState(state);

      scope.$digest(); // trigger async apply

      expect(owner.$stateOn).toBe(true);
      expect(owner.$stateOff).toBe(false);
    });


    it('should trigger the relevant event', function() {
      var onSpy = jasmine.createSpy('onSpy');
      var offSpy = jasmine.createSpy('offSpy');

      owner.states.$initState(state);
      owner.$stateOnChanged.addHandler(onSpy);
      owner.$stateOffChanged.addHandler(offSpy);

      owner.states.$setState(state);

      scope.$digest(); // trigger async apply

      expect(onSpy).toHaveBeenCalledWith(true, false);
      expect(offSpy).toHaveBeenCalledWith(false, true);
    });


    it('should update the relevant CSS classes', function() {

      $animate.setClass.calls.reset();

      owner.states.$initState(state);
      owner.states.$setState(state);
      scope.$digest(); // trigger async apply

      expect($animate.setClass).toHaveBeenCalledWith(owner.$element, 'state-on', 'state-off');
    });
  });


  describe('$clearState', function() {

    it('should set the off state to true and the on state to false', function() {

      owner.states.$initState(state);
      owner.states.$setState(state);
      scope.$digest(); // trigger async apply

      owner.states.$clearState(state);
      scope.$digest(); // trigger async apply

      expect(owner.$stateOff).toBe(true);
      expect(owner.$stateOn).toBe(false);
    });


    it('should trigger the relevant event', function() {
      var onSpy = jasmine.createSpy('onSpy');
      var offSpy = jasmine.createSpy('offSpy');

      owner.states.$initState(state);
      owner.states.$setState(state);
      scope.$digest(); // trigger async apply

      owner.$stateOnChanged.addHandler(onSpy);
      owner.$stateOffChanged.addHandler(offSpy);

      owner.states.$clearState(state);
      scope.$digest(); // trigger async apply

      expect(onSpy).toHaveBeenCalledWith(false, true);
      expect(offSpy).toHaveBeenCalledWith(true, false);
    });


    it('should update the relevant CSS classes', function() {


      owner.states.$initState(state);
      owner.states.$setState(state);
      scope.$digest(); // trigger async apply
      $animate.setClass.calls.reset();
      owner.states.$clearState(state);
      scope.$digest(); // trigger async apply

      expect($animate.setClass).toHaveBeenCalledWith(owner.$element, 'state-off', 'state-on');
    });
  });
});