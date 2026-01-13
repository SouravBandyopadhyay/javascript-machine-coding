if (!Array.prototype.reduce) {
  Array.prototype.reduce = function (callback, initialValue) {
    if (typeof callback != "function") {
      throw new Error(callback + `is not a function`);
    }

    const arr = this;
    let accumulator;
    let startIndex = 0;
    if (arguments.length > 1) {
      accumulator = initialValue;
    } else {
      if (arr.length == 0) {
        throw new Error(`Reduce of empty array with no initial Value`);
      }
      accumulator = arr[0];
      startIndex = 1;
    }
    for (let i = startIndex; i < arr.length; i++) {
      accumulator = callback(accumulator, arr[i], i, arr);
    }
    return accumulator;
  };
}
