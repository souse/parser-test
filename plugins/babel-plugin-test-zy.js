module.exports = ({ types: t }) => {
  return {
    visitor: {
      ImportDeclaration(path, state) {
        const { libraryName, libraryDirectory = 'lib' } = state.opts
        const { source, specifiers } = path.node

        if (source.value === libraryName && !t.isImportDefaultSpecifier(specifiers[0])) {
          const declarations = specifiers.map((sp) => {
            return t.importDeclaration(
              [t.importDefaultSpecifier(sp.local)],
              t.stringLiteral(
                libraryDirectory
                  ? `${libraryName}/${libraryDirectory}/${sp.imported.name}`
                  : `${libraryName}/${sp.imported.name}`
              )
            )
          })
          path.replaceWithMultiple(declarations)
        }
      },
    },
  }
}
