function Validation(isValid) {
  this.isValid = isValid;
}

function ValidatorError(validator, error, value, index, collection) {
  this.validator = validator;
  this.error = error;
  this.value = value;
  this.index = index;
  this.collection = collection;
}

function Validator(name, validatorFn, expectCollection) {
  this.name = name;
  this.validatorFn = validatorFn;
  this.expectCollection = !!expectCollection;
}

Validator.prototype.wrappedValidate = function(value, index, collection) {
  var validator = this;
  return Q(this.validatorFn(value, index, collection)).then(function(validation) {
    // Convert boolean to a validation if necessary
    if(isBoolean(validation)) {
      validation = new Validation(validation);
    }
    validation.validator = validator;
    return validation;
  },function(e) {
    throw new ValidatorError(validator, e, index, collection);
  });
};

Validator.prototype.doValidate = function(value, isCollection) {
  if (isCollection === this.expectCollection) {
      return this.wrappedValidate(value);
  } else {
    if (this.expectCollection) {
      return this.wrappedValidate([value]).then(function(value) {
        return value[0];
      });
    } else {
      return Q.all(value.map(function(item, index) {
        return this.wrappedValidate(item, index, value);
      }, this));
    }
  }
};


function Validity() {
  this.validators = {};
  this.validations = {};
  this.isValid = undefined;
}

Validity.prototype.addValidator = function(name, validatorFn, expectCollection) {
  var validator = new Validator(name, validatorFn, expectCollection);
  this.validators[name] = validator;
  return validator;
};


Validity.prototype.removeValidator = function(nameOrValidator) {
  var name = isString(nameOrValidator) ? nameOrValidator : nameOrValidator.name;
  delete this.validators[name];
};


Validity.prototype.validate = function(value, isCollection) {
  var validity = this;

  // ensure that isCollection is strictly a boolean
  isCollection = !!isCollection;

  // Set the validity state to undefined to indicate that we are pending validation
  validity.isValid = undefined;

  var validators = Object.keys(this.validators).map(function(key) { return this.validators[key]; }, this);
  return Q.Promise(function(resolve, reject) {

    var promises = validators.map(function(validator) {

      // Run each validator and collect up the promises
      return validator.doValidate(value, isCollection).then(function(validation) {

        validity.validations[validator.name] = validation;

        // If any of these validations fail then immediately resolve to invalid
        if (!validation.isValid) {
          // validity.isValid = false;
          resolve(false);
        }

        return validation;
      });
    });

    // When all the validations are complete and valid then resolve to valid
    Q.all(promises).then(function(values) {
      // validity.isValid = true;
      resolve(true);
    }, function(error) {
      reject(error);
    });

  }).then(function(value) {
    validity.isValid = value;
    return value;
  });
};

