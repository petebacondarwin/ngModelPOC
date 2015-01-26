function Validity() {
  this.$validators = {};


  // We track all the pending validations and throw away out of date ones
  // so that old async validation results do not overwrite more recent ones
  this.$pendingValidations = [];
}

Validity.prototype.addValidator = function(name, validatorFn, expectCollection) {
  var validator = new Validator(name, validatorFn, expectCollection);
  this.$validators[name] = validator;
  return validator;
};


Validity.prototype.removeValidator = function(nameOrValidator) {
  var name = isString(nameOrValidator) ? nameOrValidator : nameOrValidator.name;
  delete this.$validators[name];
};


// Validate the given value/collection against all the registered validators
// Returns a promise that resolves to a ValidationResults object containing the
// information about the validity state.
// If the validation becomes out of date - because a more recent call to validate()
// resolved sooner - then the promise for this validation will be rejected.
Validity.prototype.validate = function(value, isCollection) {
  var validity = this;
  var validations = {};
  var validationResults;
  var isCompletePromise;


  // We are about to validate so store the pending validation
  var pendingValidation = Q.defer();
  this.$pendingValidations.push(pendingValidation);


  // Ensure that isCollection is strictly a boolean
  isCollection = !!isCollection;

  // Get an array of the validators to execute
  var validators = Object.keys(validity.$validators).map(function(key) { return validity.$validators[key]; }, this);

  // Run each validator and collect the promise to each of their validations in the `validationPromises` collection
  var validationPromises = validators.map(function(validator) {

    return validator.$$doValidate(value, isCollection).then(function(validation) {

      // Store this particular validation for use in the validationResults
      validations[validator.name] = validation;

      // If any of these validations fail then immediately resolve to invalid
      if (!validation.isValid && !validationResults) {
        validationResults = new ValidationResults(false, validations, isCompletePromise);
        validity.$$resolveIfPending(pendingValidation, validationResults);
      }

      return validation;
    });
  });

  // When all the validations are have resolved then we resolve the isCompletePromise
  isCompletePromise = Q.all(validationPromises).then(function(values) {
    // If the validation has not already resolved to invalid then it must now be valid
    validationResults = validationResults || new ValidationResults(true, validations, isCompletePromise);
    validity.$$resolveIfPending(pendingValidation, validationResults);
    return validationResults;
  }, function(error) {
    reject(error);
  });

  return pendingValidation.promise;
};


// We are tracking pendingValidations. When a validation resolves, we check to see if it is
// out of date. If it is not then we resolve it and remove previous (now out of date) validations
// from the pendingValidations list. If it is out of date then we simply reject it.
Validity.prototype.$$resolveIfPending = function(pendingValidation, validationResults) {
  // Lookup the pending validation, if it is not there then it was out of date
  var index = this.$pendingValidations.indexOf(pendingValidation);
  if (index !== -1) {
    // Clear this pendingValidation and any previous, out of date, ones
    this.$pendingValidations.splice(0, index+1);
    pendingValidation.resolve(validationResults);
  } else {
    validationResults.$stale = true;
    pendingValidation.reject(validationResults);
  }
}



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

Validator.prototype.$$wrappedValidate = function(value, index, collection) {
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

Validator.prototype.$$doValidate = function(value, isCollection) {
  if (isCollection === this.expectCollection) {
      return this.$$wrappedValidate(value);
  } else {
    if (this.expectCollection) {
      return this.$$wrappedValidate([value]).then(function(value) {
        return value[0];
      });
    } else {
      return Q.all(value.map(function(item, index) {
        return this.$$wrappedValidate(item, index, value);
      }, this));
    }
  }
};


function ValidationResults(isValid, validations, isCompletePromise) {
  this.isValid = isValid;
  this.validations = validations;
  this.isCompletePromise = isCompletePromise;
}