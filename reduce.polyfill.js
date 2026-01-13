if (!Array.prototype.reduce) {
  Array.prototype.reduce = function (callback, initialValue) {
    if (this == null) {
      throw new TypeError("Array.prototype.reduce called on null or undefined");
    }

    if (typeof callback !== "function") {
      throw new TypeError(callback + " is not a function");
    }

    const array = Object(this);
    const length = array.length >>> 0;

    let accumulator;
    let startIndex = 0;

    if (arguments.length >= 2) {
      accumulator = initialValue;
    } else {
      if (length === 0) {
        throw new TypeError("Reduce of empty array with no initial value");
      }
      accumulator = array[0];
      startIndex = 1;
    }

    for (let i = startIndex; i < length; i++) {
      if (i in array) {
        accumulator = callback(accumulator, array[i], i, array);
      }
    }

    return accumulator;
  };
}
