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


function ValidationResults(isValid, validations, isComplete) {
  this.isValid = isValid;
  this.validations = validations;
  this.isComplete = isComplete;
}


function Validity() {
  this.validators = {};
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
  var validations = {};
  var validationResults;
  var isComplete;

  // ensure that isCollection is strictly a boolean
  isCollection = !!isCollection;

  var validators = Object.keys(validity.validators).map(function(key) { return validity.validators[key]; }, this);

  return Q.Promise(function(resolve, reject) {

    var promises = validators.map(function(validator) {

      // Run each validator and collect up the promises
      return validator.doValidate(value, isCollection).then(function(validation) {

        validations[validator.name] = validation;

        // If any of these validations fail then immediately resolve to invalid
        if (!validation.isValid && !validationResults) {
          validationResults = new ValidationResults(false, validations, isComplete);
          resolve(validationResults);
        }

        return validation;
      });
    });

    // When all the validations are complete and valid then resolve to valid
    isComplete = Q.all(promises).then(function(values) {
      validationResults = validationResults || new ValidationResults(true, validations, isComplete);
      resolve(validationResults);
    }, function(error) {
      reject(error);
    });

  });
};

