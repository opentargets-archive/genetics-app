export const tissueComparator = t => (a, b) => {
  if (a[t] && b[t]) {
    return a[t].log2h4h3 > b[t].log2h4h3
      ? 1
      : a[t].log2h4h3 === b[t].log2h4h3
      ? 0
      : -1;
  } else if (a[t] && !b[t]) {
    return 1;
  } else if (!a[t] && b[t]) {
    return -1;
  } else {
    return 0;
  }
};
