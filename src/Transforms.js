
function Transform(name, transformFn, expectArray) {
  this.name = name;
  this.transformFn = transformFn;
  this.expectArray = !!expectArray;
}

Transform.prototype.wrappedTransform = function(value, index, array) {
  try {
    return this.transformFn(value, index, array);
  } catch(e) {
    throw new TransformError(this, e, value, index, array);
  }
};


// Do the transform, accounting for whether the value is a collection or not
Transform.prototype.doTransform = function(value) {
  if (Array.isArray(value) === this.expectArray) {
    value = this.wrappedTransform(value);
  } else if (this.expectArray) {
    value = this.wrappedTransform([value]);
  } else {
    value = value.map(function(item, index) { return this.wrappedTransform(item, index, value); }, this);
  }
  return value;
};


// Create a Transform from a legacy parser or formatter
Transform.fromLegacyFn = function(transformFn) {
  var name = transformFn.$$name || transformFn.name;
  var transform = new Transform(name, function(value) {
    value = transformFn(value);
    if (isUndefined(value)) {
      throw 'Invalid value in legacy transform';
    }
    return value;
  });
  return transform;
};



function TransformError(transform, error, value, index, array) {
  this.transform = transform;
  this.error = error;
  this.value = value;
  this.index = index;
  this.array = array;
}
