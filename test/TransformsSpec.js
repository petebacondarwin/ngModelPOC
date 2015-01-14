describe('Transforms', function() {

  describe('append', function() {
    it('should create a Transform and add it to the end of the $transforms array', function() {
      var parser = function() {};
      var formatter = function() {};
      var t = new Transforms();
      expect(t.$transforms.length).toEqual(0);

      var test1 = t.append('test1', parser, formatter, false);
      expect(t.$transforms.length).toEqual(1);
      expect(t.$transforms[0]).toBe(test1);
      expect(t.$transforms[0]).toEqual(new Transform('test1', parser, formatter, false));

      var test2 = t.append('test2', parser, formatter, true);
      expect(t.$transforms.length).toEqual(2);
      expect(t.$transforms[0]).toBe(test1);
      expect(t.$transforms[0]).toEqual(new Transform('test1', parser, formatter, false));
      expect(t.$transforms[1]).toBe(test2);
      expect(t.$transforms[1]).toEqual(new Transform('test2', parser, formatter, true));
    });

    it('should default parse and format to the identity function if not provided', function() {
      var parser = function() {};
      var formatter = function() {};
      var t = new Transforms();

      t.append('test1', parser, undefined, false);
      t.append('test2', undefined, formatter, false);
      t.append('test3', undefined, undefined, false);

      expect(t.$transforms.length).toEqual(3);
      expect(t.$transforms[0]).toEqual(new Transform('test1', parser, identity, false));
      expect(t.$transforms[1]).toEqual(new Transform('test2', identity, formatter, false));
      expect(t.$transforms[2]).toEqual(new Transform('test3', identity, identity, false));
    });
  });


  describe('insert', function() {
    it('should create a Transform and add it to the beginning of the $transforms array', function() {
      var parser = function() {};
      var formatter = function() {};
      var t = new Transforms();
      expect(t.$transforms.length).toEqual(0);

      var test1 = t.insert('test1', parser, formatter, false);
      expect(t.$transforms.length).toEqual(1);
      expect(t.$transforms[0]).toBe(test1);
      expect(t.$transforms[0]).toEqual(new Transform('test1', parser, formatter, false));

      var test2 = t.insert('test2', parser, formatter, true);
      expect(t.$transforms.length).toEqual(2);
      expect(t.$transforms[0]).toBe(test2);
      expect(t.$transforms[0]).toEqual(new Transform('test2', parser, formatter, true));
      expect(t.$transforms[1]).toBe(test1);
      expect(t.$transforms[1]).toEqual(new Transform('test1', parser, formatter, false));
    });


    it('should default parse and format to the identity function if not provided', function() {
      var parser = function() {};
      var formatter = function() {};
      var t = new Transforms();

      t.insert('test1', parser, undefined, false);
      t.insert('test2', undefined, formatter, false);
      t.insert('test3', undefined, undefined, false);

      expect(t.$transforms.length).toEqual(3);
      expect(t.$transforms[0]).toEqual(new Transform('test3', identity, identity, false));
      expect(t.$transforms[1]).toEqual(new Transform('test2', identity, formatter, false));
      expect(t.$transforms[2]).toEqual(new Transform('test1', parser, identity, false));
    });
  });


  describe('remove', function() {
    it('should remove the named transform', function() {
      var t = new Transforms();
      var test1 = t.append('test1');
      var test2 = t.append('test2');
      var test3 = t.append('test3');

      expect(t.$transforms).toEqual([test1, test2, test3]);

      t.remove('test2');
      expect(t.$transforms).toEqual([test1, test3]);

      t.remove('test2');
      expect(t.$transforms).toEqual([test1, test3]);

      t.remove('test1');
      expect(t.$transforms).toEqual([test3]);

      t.remove('test3');
      expect(t.$transforms).toEqual([]);
    });


    it('should remove the given transform', function() {
      var t = new Transforms();
      var test1 = t.append('test1');
      var test2 = t.append('test2');
      var test3 = t.append('test3');

      expect(t.$transforms).toEqual([test1, test2, test3]);

      t.remove(test2);
      expect(t.$transforms).toEqual([test1, test3]);

      t.remove(test2);
      expect(t.$transforms).toEqual([test1, test3]);

      t.remove(test1);
      expect(t.$transforms).toEqual([test3]);

      t.remove(test3);
      expect(t.$transforms).toEqual([]);
    });
  });


  describe('parse', function() {
    describe('non-collection and not handle collection', function() {
      it('should call the parse function of each of the transforms in ascending order', function() {
        var t = new Transforms();
        t.append('add-a', function(value) { return value + 'a'; }, function() {}, false);
        t.append('add-b', function(value) { return value + 'b'; }, function() {}, false);
        var parsedValue = t.parse('x');
        expect(parsedValue).toEqual('xab');
      });
    });


    describe('collection and handle collection', function() {
      it('should call the parse function of each the transforms in ascending order', function() {
        var t = new Transforms();
        t.append('add-a', function(value) { return value.map(function(value) { return value + 'a'; }); }, function() {}, true);
        t.append('add-b', function(value) { return value.map(function(value) { return value + 'b'; }); }, function() {}, true);
        var parsedValue = t.parse(['x', 'y'], true);
        expect(parsedValue).toEqual(['xab','yab']);
      });
    });


    describe('collection and not handle collection', function() {
      it('should call the parse function of each the transforms in ascending order', function() {
        var t = new Transforms();
        t.append('add-a', function(value) { return value + 'a'; }, function() {}, false);
        t.append('add-b', function(value) { return value + 'b'; }, function() {}, false);
        var parsedValue = t.parse(['x'], true);
        expect(parsedValue).toEqual(['xab']);
      });
    });


    describe('non-collection and handle collection', function() {
      it('should call the parse function of each of the transforms in ascending order', function() {
        var t = new Transforms();
        t.append('add-a', function(value) { return value.map(function(value) { return value + 'a'; }); }, function() {}, true);
        t.append('add-b', function(value) { return value.map(function(value) { return value + 'b'; }); }, function() {}, true);
        var parsedValue = t.parse('x');
        expect(parsedValue).toEqual('xab');
      });
    });


    describe('error handling', function() {
      it('should wrap and rethrow errors thrown in an parse function', function() {
        var t = new Transforms(), error;
        t.append('throw-error', function(value) { throw 'error-message'; }, function() {}, false);
        try {
          t.parse(['x'], true);
        } catch(e) {
          error = e;
        }
        expect(error).toEqual(new TransformError(t.$transforms[0], 'error-message', 'x', 0, ['x']));
      });
    });
  });


  describe('format', function() {
    describe('non-collection and not handle collection', function() {
      it('should call the format function of each of the transforms in descending order', function() {
        var t = new Transforms();
        t.append('add-a', function() {}, function(value) { return value + 'a'; }, false);
        t.append('add-b', function() {}, function(value) { return value + 'b'; }, false);
        var formattedValue = t.format('x');
        expect(formattedValue).toEqual('xba');
      });
    });


    describe('collection and handle collection', function() {
      it('should call the format function of each the transforms in descending order', function() {
        var t = new Transforms();
        t.append('add-a', function() {}, function(value) { return value.map(function(value) { return value + 'a'; }); }, true);
        t.append('add-b', function() {}, function(value) { return value.map(function(value) { return value + 'b'; }); }, true);
        var formattedValue = t.format(['x', 'y'], true);
        expect(formattedValue).toEqual(['xba','yba']);
      });
    });


    describe('collection and not handle collection', function() {
      it('should call the format function of each the transforms in descending order', function() {
        var t = new Transforms();
        t.append('add-a', function() {}, function(value) { return value + 'a'; }, false);
        t.append('add-b', function() {}, function(value) { return value + 'b'; }, false);
        var formattedValue = t.format(['x'], true);
        expect(formattedValue).toEqual(['xba']);
      });
    });


    describe('non-collection and handle collection', function() {
      it('should call the parse function of each of the transforms in descending order', function() {
        var t = new Transforms();
        t.append('add-a', function() {}, function(value) { return value.map(function(value) { return value + 'a'; }); }, true);
        t.append('add-b', function() {}, function(value) { return value.map(function(value) { return value + 'b'; }); }, true);
        var formattedValue = t.format('x');
        expect(formattedValue).toEqual('xba');
      });
    });


    describe('error handling', function() {
      it('should wrap and rethrow errors thrown in an format function', function() {
        var t = new Transforms(), error;
        t.append('throw-error', function() {}, function(value) { throw 'error-message'; }, false);
        try {
          t.format('x');
        } catch(e) {
          error = e;
        }
        expect(error).toEqual(new TransformError(t.$transforms[0], 'error-message', 'x'));
      });
    });
  });
});