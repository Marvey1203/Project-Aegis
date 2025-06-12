// .pnpmfile.cjs
function readPackage(pkg) {
  // Override the version of 'openai' for all dependencies.
  // This ensures that our package and the @openai/agents package
  // both resolve to the exact same instance of the openai library.
  if (pkg.dependencies && pkg.dependencies.openai) {
    pkg.dependencies.openai = '5.1.1'; // Use the version you have installed
  }
  if (pkg.devDependencies && pkg.devDependencies.openai) {
    pkg.devDependencies.openai = '5.1.1'; // Also check devDependencies
  }
  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  },
};