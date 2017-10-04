const sort = (a, b) => {
  const av = a.__FILENAME__.toLowerCase();
  const bv = b.__FILENAME__.toLowerCase();
  if (av < bv) return -1;
  if (av > bv) return 1;
  return 0;
};

export default sort;
