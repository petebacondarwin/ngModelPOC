function isObject(value) { return value !== null && typeof value === 'object'; }
function isString(value) { return typeof value === 'string'; }
function isDefined(value) {return typeof value !== 'undefined';}
function isUndefined(value) { return typeof value === 'undefined'; }
function isBoolean(value) { return typeof value === 'boolean'; }
function identity(value) { return value; }
function noop() {}

function extend(dst) {
  var h = dst.$$hashKey;

  for (var i = 1, ii = arguments.length; i < ii; i++) {
    var obj = arguments[i];
    if (obj) {
      var keys = Object.keys(obj);
      for (var j = 0, jj = keys.length; j < jj; j++) {
        var key = keys[j];
        dst[key] = obj[key];
      }
    }
  }

  dst.$$hashKey = h;
  return dst;
}