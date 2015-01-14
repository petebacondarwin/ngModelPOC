function TransformError(transform, error, value, index, collection) {
  this.transform = transform;
  this.error = error;
  this.value = value;
  this.index = index;
  this.collection = collection;
}



function Transform(name, parse, format, expectCollection) {
  this.name = name;
  this.parse = parse || identity;
  this.format = format || identity;
  this.expectCollection = !!expectCollection;
}

Transform.prototype.wrappedTransform = function(method, value, index, collection) {
  try {
    return this[method](value, index, collection);
  } catch(e) {
    throw new TransformError(this, e, value, index, collection);
  }
};

Transform.prototype.doTransform = function(method, value, isCollection) {
  if (isCollection === this.expectCollection) {
      return this.wrappedTransform(method, value);
  } else {
    if (this.expectCollection) {
      return this.wrappedTransform(method, [value])[0];
    } else {
      return value.map(function(item, index) {
        return this.wrappedTransform(method, item, index, value);
      }, this);
    }
  }
};




function Transforms() {
  this.$transforms = [];
}

Transforms.prototype.append = function(name, parse, format, expectCollection) {
  var transform = new Transform(name, parse, format, expectCollection);
  this.$transforms.push(transform);
  return transform;
};


Transforms.prototype.insert = function(name, parse, format, expectCollection) {
  var transform = new Transform(name, parse, format, expectCollection);
  this.$transforms.unshift(transform);
  return transform;
};

Transforms.prototype.remove = function(nameOrTransform) {
  var i, ii, testFn = isString(nameOrTransform) ?
    function(transform) {
      return transform.name === nameOrTransform;
    } :
    function(transform) {
      return transform === nameOrTransform;
    };

  for(i=0, ii=this.$transforms.length; i < ii; ++i) {
    if (testFn(this.$transforms[i])) {
      this.$transforms.splice(i, 1);
      break;
    }
  }
};


Transforms.prototype.parse = function(value, isCollection) {
  var i, ii;

  // ensure that isCollection is strictly a boolean
  isCollection = !!isCollection;


  // iterate forwards over the transforms
  for(i=0, ii=this.$transforms.length; i<ii; ++i) {
    value = this.$transforms[i].doTransform('parse', value, isCollection);
  }
  return value;
};


Transforms.prototype.format = function(value, isCollection) {
  var i, ii;

  // ensure that isCollection is strictly a boolean
  isCollection = !!isCollection;

  // iterate backwards over the transforms
  for(i=this.$transforms.length-1; i>=0; --i) {
    value = this.$transforms[i].doTransform('format', value, isCollection);
  }
  return value;
};

