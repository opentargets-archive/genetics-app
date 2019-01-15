// see https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript

const stringHash = str => {
  var hash = 0,
    i,
    chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return '' + (Number.MAX_SAFE_INTEGER - hash);
};

export default stringHash;
