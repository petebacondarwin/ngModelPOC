describe('Validity', function() {

  beforeEach(function() {
    mockPromises.install(Q.makePromise);
    mockPromises.reset();
  });


  describe('addValidator', function() {

    it('should add new Validator objects to the $validators map', function() {
      var v = new Validity();

      function validate() {}

      v.addValidator('test', validate, false);
      expect(v.$validators['test']).toEqual(new Validator('test', validate, false));

      v.addValidator('test2', validate, true);
      expect(v.$validators['test2']).toEqual(new Validator('test2', validate, true));
    });


    it('should update previously added validators with the same name', function() {
      var v = new Validity();

      function validate1() {}
      function validate2() {}

      v.addValidator('test', validate1, false);
      expect(v.$validators['test'].validatorFn).toBe(validate1);

      v.addValidator('test', validate2, false);
      expect(v.$validators['test'].validatorFn).toBe(validate2);
    });


    it('should return the new validator', function() {
      var v = new Validity();

      function validate() {}

      var test = v.addValidator('test', validate, false);
      expect(test.name).toEqual('test');
      expect(test.validatorFn).toBe(validate);
      expect(test.expectCollection).toBe(false);
      expect(v.$validators['test']).toBe(test);
    });
  });


  describe('removeValidator', function() {

    it('should only remove the validator with the given name', function() {
      var v = new Validity();

      function validate() {}

      v.addValidator('test', validate, false);
      v.addValidator('test2', validate, true);

      v.removeValidator('test1');
      expect(v.$validators['test1']).toBeUndefined();
      expect(v.$validators['test2']).toEqual(new Validator('test2', validate, true));
    });

    it('should remove the given validator', function() {
      var v = new Validity();

      function validate() {}

      var test1 = v.addValidator('test', validate, false);
      var test2 = v.addValidator('test2', validate, true);

      v.removeValidator(test1);
      expect(v.$validators['test1']).toBeUndefined();
      expect(v.$validators['test2']).toBe(test2);
    });
  });


  describe('validate', function() {

    describe('non-collection', function() {

      it('should call the validateFn on each validator, passing in the value', function() {
        var v = new Validity();

        var validateFn1 = jasmine.createSpy('validateFn1').and.returnValue(Q(true));
        var validateFn2 = jasmine.createSpy('validateFn2').and.returnValue(Q(false));

        v.addValidator('test1', validateFn1);
        v.addValidator('test2', validateFn2, true); // test2 expects a collection

        var isValidPromise = v.validate('xxx');

        expect(validateFn1).toHaveBeenCalledWith('xxx', undefined, undefined);
        expect(validateFn2).toHaveBeenCalledWith(['xxx'], undefined, undefined);
      });
    });


    describe('collection', function() {

      it('should call the validateFn on each validator, passing in the value', function() {
        var v = new Validity();

        var validateFn1 = jasmine.createSpy('validateFn1').and.returnValue(Q(true));
        var validateFn2 = jasmine.createSpy('validateFn2').and.returnValue(Q(false));

        v.addValidator('test1', validateFn1);
        v.addValidator('test2', validateFn2, true); // test2 expects a collection

        var value = ['xxx', 'yyy'];

        var isValidPromise = v.validate(value, true);

        expect(validateFn1).toHaveBeenCalledWith('xxx', 0, value);
        expect(validateFn1).toHaveBeenCalledWith('yyy', 1, value);
        expect(validateFn2).toHaveBeenCalledWith(value, undefined, undefined);
      });
    });


    describe('return value', function() {

      it('should be a promise that is resolved to true when all the validators resolve to valid', function() {
        var v = new Validity();

        var validation1 = Q.defer();
        var validation2 = Q.defer();

        var validateFn1 = jasmine.createSpy('validateFn1').and.returnValue(validation1.promise);
        var validateFn2 = jasmine.createSpy('validateFn2').and.returnValue(validation2.promise);

        v.addValidator('test1', validateFn1);
        v.addValidator('test2', validateFn2);

        var isValidPromise = v.validate('xxx');

        validation1.resolve(true);
        mockPromises.executeForPromise(validation1.promise);
        resolveAllPromises();

        // There is still a validation pending so this is still undefined
        expect(mockPromises.valueForPromise(isValidPromise)).toBeUndefined();

        validation2.resolve(true);
        mockPromises.executeForPromise(validation2.promise);
        resolveAllPromises();

        // We only have one validation so this is still undefined
        expect(mockPromises.valueForPromise(isValidPromise).isValid).toBe(true);
      });


      it('should be a promise that is resolved to false as soon as any validator resolves to invalid', function() {
        var v = new Validity();

        var validation1 = Q.defer();
        var validation2 = Q.defer();
        var validation3 = Q.defer();

        var validateFn1 = jasmine.createSpy('validateFn1').and.returnValue(validation1.promise);
        var validateFn2 = jasmine.createSpy('validateFn2').and.returnValue(validation2.promise);
        var validateFn3 = jasmine.createSpy('validateFn3').and.returnValue(validation3.promise);

        v.addValidator('test1', validateFn1);
        v.addValidator('test2', validateFn2);
        v.addValidator('test3', validateFn3);

        var isValidPromise = v.validate('xxx');

        validation1.resolve(true);
        resolveAllPromises();

        // There are still two validations pending so this is still undefined
        expect(mockPromises.valueForPromise(isValidPromise)).toBeUndefined();

        validation2.resolve(false);
        resolveAllPromises();

        // A validator has resolved to invalid so we resolve immediately to invalid
        expect(mockPromises.valueForPromise(isValidPromise).isValid).toBe(false);
      });


      it('should update the validations map as each validation is resolved', function() {
        var v = new Validity();

        var validation1 = Q.defer();
        var validation2 = Q.defer();

        var validateFn1 = jasmine.createSpy('validateFn1').and.returnValue(validation1.promise);
        var validateFn2 = jasmine.createSpy('validateFn2').and.returnValue(validation2.promise);

        var validator1 = v.addValidator('test1', validateFn1);
        var validator2 = v.addValidator('test2', validateFn2);

        var isValidPromise = v.validate('xxx');

        // A validation has resolved as invalid so the promise resolves immediately
        validation2.resolve(false);
        resolveAllPromises();

        var validations = mockPromises.valueForPromise(isValidPromise).validations;
        expect(validations).toEqual({
          'test2': jasmine.objectContaining({ isValid: false, validator: validator2 })
        });

        // Now an additional async validation resolves after the fact, it gets added to the collection
        validation1.resolve(true);
        resolveAllPromises();
        expect(validations).toEqual({
          'test1': jasmine.objectContaining({ isValid: true, validator: validator1 }),
          'test2': jasmine.objectContaining({ isValid: false, validator: validator2 })
        });
      });


      it('should resolve the isComplete promise when all the validators have resolved', function() {
        var v = new Validity();

        var validation1 = Q.defer();
        var validation2 = Q.defer();

        var validateFn1 = function() { return validation1.promise};
        var validateFn2 = function() { return validation2.promise};

        var validator1 = v.addValidator('test1', validateFn1);
        var validator2 = v.addValidator('test2', validateFn2);

        var isValidPromise = v.validate('xxx');

        // A validation has resolved as invalid so the promise resolves immediately
        validation2.resolve(false);
        resolveAllPromises();

        var isCompletePromise = mockPromises.valueForPromise(isValidPromise).isCompletePromise;
        var isComplete = false;
        isCompletePromise.then(function() {
          isComplete = true;
        });
        expect(isComplete).toBe(false);

        // Now an additional async validation resolves after the fact, it completes all the validators
        validation1.resolve(true);
        resolveAllPromises();
        expect(isComplete).toBe(true);
      });
    });
  });
});