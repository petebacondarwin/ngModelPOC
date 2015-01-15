describe('Validity', function() {
  beforeEach(function() {
    mockPromises.install(Q.makePromise);
    mockPromises.reset();
  })
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
        v.addValidator('test2', validateFn2);

        var isValidPromise = v.validate('xxx');

        mockPromises.executeForPromise(isValidPromise);

        expect(validateFn1).toHaveBeenCalledWith('xxx', undefined, undefined);
        expect(validateFn2).toHaveBeenCalledWith('xxx', undefined, undefined);
      });
    });


    describe('collection', function() {

    });
  });
});