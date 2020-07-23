'use strict';

import parseNpm from 'parse-package-name';

export const getPackageWithoutVersion = (packages) => {
  const packagesArray = packages.split('+');
  const newPackageArray = [];

  packagesArray.forEach(p => newPackageArray.push(parseNpm(p).name));

  return newPackageArray.join('+');
};

const RE_SCOPED = /^(@[^/]+\/[^/@]+)(?:\/([^@]+))?(?:@([\s\S]+))?/;
const RE_NORMAL = /^([^/@]+)(?:\/([^@]+))?(?:@([\s\S]+))?/;

export const parsePackageName = function (input) {
  if (typeof input !== 'string') {
    throw new TypeError('Expected a string')
  }

  const matched = input.charAt(0) === '@' ? input.match(RE_SCOPED) : input.match(RE_NORMAL);

  if (!matched) {
    throw new Error(`[parse-package-name] "${input}" is not a valid string`)
  }

  return {
    name: matched[1],
    path: matched[2] || '',
    version: matched[3] || ''
  }
};

export const packageToElementName = (npmPackage) => {
  const parsed = parsePackageName(npmPackage);

  if (parsed) {
    let tag = parsed.name.replace(/\/|\./g, '-');
    tag = tag.replace('@', '');
    return tag;
  }
};
