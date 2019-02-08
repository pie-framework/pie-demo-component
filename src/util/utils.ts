import parseNpm from 'parse-package-name';

export const getPackageWithoutVersion = (packages) => {
  const packagesArray = packages.split('+');
  const newPackageArray = [];

  packagesArray.forEach(p => newPackageArray.push(parseNpm(p).name));

  return newPackageArray.join('+');
};