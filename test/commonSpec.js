describe('common', function() {

  describe('EventList', function() {

    it('should add a given handler that is called when the event is triggered', function() {
      var eventList = new EventList();
      var spy = jasmine.createSpy('handler');
      eventList.addHandler(spy);
      eventList.trigger('x', 'y');
      expect(spy).toHaveBeenCalledWith('x', 'y');
    });


    it('should return a function that will remove the handler so that it is no longer called', function() {
      var eventList = new EventList();
      var spy = jasmine.createSpy('handler');
      var remove = eventList.addHandler(spy);
      eventList.trigger('x', 'y');
      expect(spy).toHaveBeenCalledWith('x', 'y');
      spy.calls.reset();
      remove();
      eventList.trigger('x', 'y');
      expect(spy).not.toHaveBeenCalled();
    });


    it('should call all handlers that are registered', function() {
      var eventList = new EventList();
      var spy1 = jasmine.createSpy('handler1');
      var spy2 = jasmine.createSpy('handler2');
      eventList.addHandler(spy1);
      eventList.addHandler(spy2);
      eventList.trigger('x', 'y');
      expect(spy1).toHaveBeenCalledWith('x', 'y');
      expect(spy2).toHaveBeenCalledWith('x', 'y');
    });


    it('should delay triggering the event by the given debounceDelay', function() {
      var eventList = new EventList();
      var spy1 = jasmine.createSpy('handler1');
      eventList.addHandler(spy1);
      eventList.debounce(200, 'x', 'y');
      expect(spy1).not.toHaveBeenCalled();
      $timeout.flush(100);
      expect(spy1).not.toHaveBeenCalled();
      $timeout.flush(100);
      expect(spy1).toHaveBeenCalledWith('x', 'y');
    });


    it('should trigger only once for multiple calls within the debounceDelay period', function() {
      var eventList = new EventList();
      var spy1 = jasmine.createSpy('handler1');
      eventList.addHandler(spy1);
      eventList.debounce(200, 'x', 'y');
      expect(spy1).not.toHaveBeenCalled();
      $timeout.flush(100);
      expect(spy1).not.toHaveBeenCalled();
      eventList.debounce(200, 'x', 'y');
      eventList.debounce(200, 'x', 'y');
      $timeout.flush(100);
      expect(spy1).not.toHaveBeenCalled();
      $timeout.flush(100);
      expect(spy1).toHaveBeenCalledWith('x', 'y');
    });
  });
});