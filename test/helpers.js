function resolveAllPromises() {
  // Keep resolving until we stablize

  function countResolved() {
    return mockPromises.contracts.filter(function(contract) {
      return contract.promise.isFulfilled() || contract.promise.isRejected();
    }).length + mockPromises.contracts.all().length;
  }

  var previousCount, currentCount = NaN, count = 0;
  do {
    previousCount = currentCount;
    mockPromises.executeForResolvedPromises();
    currentCount = countResolved();
    count++;
  } while(previousCount !== currentCount && count < 100);

  if(count === 100) {
    throw 'Unstable promise resolution';
  }
}



function $timeout(fn, delay) {
  delay = delay || 0;
  var deferred = {time:($timeout.now + delay), fn:fn, id: $timeout.deferredNextId}
  $timeout.deferredFns.push(deferred);
  $timeout.deferredFns.sort(function(a, b) { return a.time - b.time;});
  return deferred;
};

$timeout.deferredFns = [];
$timeout.deferredNextId = 0;
$timeout.now = 0;

$timeout.cancel = function(deferred) {
  var fnIndex = $timeout.deferredFns.indexOf(deferred);

  if (fnIndex !== -1) {
    $timeout.deferredFns.splice(fnIndex, 1);
    return true;
  }

  return false;
};

$timeout.flush = function(delay) {
  if (isDefined(delay)) {
    $timeout.now += delay;
  } else {
    if ($timeout.deferredFns.length) {
      $timeout.now = $timeout.deferredFns[$timeout.deferredFns.length - 1].time;
    } else {
      throw new Error('No deferred tasks to be flushed');
    }
  }

  while ($timeout.deferredFns.length && $timeout.deferredFns[0].time <= $timeout.now) {
    $timeout.deferredFns.shift().fn();
  }
};




function Element(initialValue) {
  this.value = initialValue;
  this.handlers = {};
}

Element.prototype.val = function(value) {
  if (isDefined(value)) {
    this.value = value;
  }
  return this.value;
};

Element.prototype.on = function(eventName, handler) {
  this.handlers[eventName] = this.handlers[eventName] || [];
  this.handlers[eventName].push(handler);
};

Element.prototype.off = function(eventName, handler) {
  var handlers = this.handlers[eventName];
  if (!handlers) return;
  var index = handlers.indexOf(handler);
  if (index !== -1) {
    handlers.splice(index, 1);
  }
};

Element.prototype.trigger = function(eventName) {
  var handlers = this.handlers[eventName];
  if (!handlers) return;
  handlers.forEach(function(handler) {
    handler({ type: eventName});
  });
};




function Scope() {
  this.$$watches = [];
}

Scope.prototype.$watch = function(watch, handler) {
  this.$$watches.push({ watch: watch, handler: handler, previousValue: NaN });
};

Scope.prototype.$digest = function() {
  var scope = this;
  var isDirty = true;
  while(isDirty) {
    isDirty = false;
    this.$$watches.forEach(function(watchObj) {
      var nextValue = watchObj.watch(scope);
      if (nextValue != watchObj.previousValue) {
        isDirty = true;
        watchObj.handler(nextValue, watchObj.previousValue);
        watchObj.previousValue = nextValue;
      }
    })
  }
}