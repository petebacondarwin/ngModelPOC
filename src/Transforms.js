function Transform(name, parse, format, handleCollection) {
  this.name = name;
  this.parse = parse;
  this.format = format;
  this.handleCollection = !!handleCollection;
}

function Transforms() {
  this.$transforms = [];
}

Transforms.prototype.append = function(name, parse, format, handleCollection) {
  this.$transforms.push(new Transform(name, parse, format, handleCollection));
};


Transforms.prototype.insert = function(name, parse, format, handleCollection) {
  this.$transforms.unshift(new Transform(name, parse, format, handleCollection));
};


Transforms.prototype.parse = function(value, isCollection) {
  var transform, i, ii;
  isCollection = !!isCollection;
  for(i=0, ii=this.$transforms.length; i<ii; ++i) {
    transform = this.$transforms[i];
    if (isCollection === transform.handleCollection) {
        value = transform.parse(value);
    } else {
      if (transform.handleCollection) {
        value = transform.parse([value])[0];
      } else {
        value = value.map(function(value) {
          return transform.parse(value);
        });
      }
    }
  }
  return value;
};


Transforms.prototype.format = function(value, isCollection) {
  var transform, i, ii;
  isCollection = !!isCollection;
  for(i=this.$transforms.length-1; i>=0; --i) {
    transform = this.$transforms[i];
    if (isCollection === transform.handleCollection) {
        value = transform.format(value);
    } else {
      if (transform.handleCollection) {
        value = transform.format([value])[0];
      } else {
        value = value.map(function(value) {
          return transform.format(value);
        });
      }
    }
  }
  return value;
};

