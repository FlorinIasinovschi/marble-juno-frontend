export const checkRegularExp = (data: string) => {
  const regexp = /^[A-Za-z0-9_-]*$/;
  return regexp.test(data);
};
