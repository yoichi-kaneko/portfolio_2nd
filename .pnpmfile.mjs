export const hooks = {
  readPackage(pkg) {
    // TypeScript 7 provides tsc for Next.js, but has no JavaScript compiler API.
    // Keep typescript-eslint 8 on Microsoft's pinned compatibility package.
    const needsCompilerApi =
      ((pkg.name === "typescript-eslint" ||
        pkg.name.startsWith("@typescript-eslint/")) &&
        pkg.version.startsWith("8.")) ||
      (pkg.name === "ts-api-utils" && pkg.version.startsWith("2."));

    if (needsCompilerApi && pkg.peerDependencies?.typescript) {
      delete pkg.peerDependencies.typescript;
      pkg.dependencies = {
        ...pkg.dependencies,
        typescript: "npm:@typescript/typescript6@6.0.2",
      };
    }
    return pkg;
  },
};
