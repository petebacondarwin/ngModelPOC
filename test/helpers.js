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


var deferredFns = [];
var deferredNextId = 0;
var now = 0;

function $timeout(fn, delay) {
  delay = delay || 0;
  var deferred = {time:(now + delay), fn:fn, id: deferredNextId}
  deferredFns.push(deferred);
  deferredFns.sort(function(a, b) { return a.time - b.time;});
  return deferred;
};

$timeout.cancel = function(deferred) {
  var fnIndex = deferredFns.indexOf(deferred);

  if (fnIndex !== -1) {
    deferredFns.splice(fnIndex, 1);
    return true;
  }

  return false;
};

$timeout.flush = function(delay) {
  if (isDefined(delay)) {
    now += delay;
  } else {
    if (deferredFns.length) {
      now = deferredFns[deferredFns.length - 1].time;
    } else {
      throw new Error('No deferred tasks to be flushed');
    }
  }

  while (deferredFns.length && deferredFns[0].time <= now) {
    deferredFns.shift().fn();
  }
};
