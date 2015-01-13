describe('Transforms', function() {
  describe('append', function() {
    it('should create a Transform and add it to the end of the $transforms array', function() {
      var parser = function() {};
      var formatter = function() {};
      var t = new Transforms();
      expect(t.$transforms.length).toEqual(0);

      t.append('test', parser, formatter, false);
      expect(t.$transforms.length).toEqual(1);
      expect(t.$transforms[0]).toEqual(new Transform('test', parser, formatter, false));

      t.append('test2', parser, formatter, true);
      expect(t.$transforms.length).toEqual(2);
      expect(t.$transforms[0]).toEqual(new Transform('test', parser, formatter, false));
      expect(t.$transforms[1]).toEqual(new Transform('test2', parser, formatter, true));

    });
  });


  describe('insert', function() {
    it('should create a Transform and add it to the beginning of the $transforms array', function() {
      var parser = function() {};
      var formatter = function() {};
      var t = new Transforms();
      expect(t.$transforms.length).toEqual(0);

      t.insert('test', parser, formatter, false);
      expect(t.$transforms.length).toEqual(1);
      expect(t.$transforms[0]).toEqual(new Transform('test', parser, formatter, false));

      t.insert('test2', parser, formatter, true);
      expect(t.$transforms.length).toEqual(2);
      expect(t.$transforms[0]).toEqual(new Transform('test2', parser, formatter, true));
      expect(t.$transforms[1]).toEqual(new Transform('test', parser, formatter, false));
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
  });
});