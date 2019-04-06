module.exports.deepsearch = function deepsearch(needle, haystack, found = []) {
  if (haystack === null) {
    return found
  }

  Object.keys(haystack).forEach((key) => {
    if (key === needle) {
      found.push(haystack[key]);
      return found;
    }
    if (typeof haystack[key] === 'object') {
      deepsearch(needle, haystack[key], found);
    }
  });
  return found;
};
