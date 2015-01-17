function resolveValidatePromises() {
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