module.exports = {
  changelogCommand:
    "./node_modules/.bin/conventional-changelog -p angular | tail -n +3",
  safeBump: false,
  github: {
    release: true,
    tokenRef: "GITHUB_TOKEN"
  },
  plugins: {
    "@release-it/conventional-changelog": {
      preset: "angular"
    }
  }
};
