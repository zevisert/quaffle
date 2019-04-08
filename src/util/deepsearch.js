/*
 * A simple recursive approach to finding deeply nested values of keys
 */
function deepsearch(needle, haystack, found=[]) {
  if (haystack === null) {
    return found
  }

  for (const key of Object.keys(haystack)) {
    if (key === needle) {
      found.push(haystack[key]);
      return found;
    }
    if (typeof haystack[key] === 'object') {
      deepsearch(needle, haystack[key], found);
    }
  }
  return found;
}

module.exports.deepsearch = deepsearch
