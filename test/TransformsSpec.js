describe('Transforms', function() {

  function doTransforms(transforms, value) {
    transforms.forEach(function(transform) {
      value = transform.doTransform(value);
    });
    return value;
  }

  describe('doTransform', function() {
    describe('non-collection and not expect collection', function() {
      it('should call the parse function of each of the transforms in ascending order', function() {
        var addA = new Transform('add-a', function(value) { return value + 'a'; }, false);
        var addB = new Transform('add-b', function(value) { return value + 'b'; }, false);
        var parsedValue = doTransforms([addA, addB], 'x');
        expect(parsedValue).toEqual('xab');
      });
    });


    describe('collection and expect collection', function() {
      it('should call the parse function of each the transforms in ascending order', function() {
        var addA = new Transform('add-a', function(value) { return value.map(function(value) { return value + 'a'; }); }, true);
        var addB = new Transform('add-b', function(value) { return value.map(function(value) { return value + 'b'; }); }, true);
        var parsedValue = doTransforms([addA, addB], ['x', 'y']);
        expect(parsedValue).toEqual(['xab','yab']);
      });
    });


    describe('collection and not expect collection', function() {
      it('should call the parse function of each the transforms in ascending order', function() {
        var addA = new Transform('add-a', function(value) { return value + 'a'; }, false);
        var addB = new Transform('add-b', function(value) { return value + 'b'; }, false);
        var parsedValue = doTransforms([addA, addB], ['x']);
        expect(parsedValue).toEqual(['xab']);
      });
    });


    describe('non-collection and expect collection', function() {
      it('should call the parse function of each of the transforms in ascending order', function() {
        var addA = new Transform('add-a', function(value) { return value.map(function(value) { return value + 'a'; }); }, true);
        var addB = new Transform('add-b', function(value) { return value.map(function(value) { return value + 'b'; }); }, true);
        var parsedValue = doTransforms([addA, addB], 'x');
        expect(parsedValue).toEqual(['xab']);
      });
    });


    describe('error handling', function() {
      it('should wrap and rethrow errors thrown in an parse function', function() {
        var error;
        var bad = new Transform('throw-error', function(value) { throw 'error-message'; }, false);
        try {
          doTransforms([bad], ['x']);
        } catch(e) {
          error = e;
        }
        expect(error).toEqual(new TransformError(bad, 'error-message', 'x', 0, ['x']));
      });
    });
  });
});