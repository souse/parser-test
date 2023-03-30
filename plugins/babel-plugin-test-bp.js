const { addDefault } = require('@babel/helper-module-imports')

// const matchBracketsReg = /\((.+?)\)/g // 带括号
const matchBracketsReg = /(?<=\()(.+?)(?=\))/g // 不带括号
const TRACK_MARK = '@auto-track'
const TRACK_IMPORT_NAME = 'trackeeee'
const TRACK_IMPORT_PATH = './lib/track' // 这个参数可以作为入参

module.exports = function ({ template }) {
  // 根据注释添加自动埋点
  function handleAutoTrackComments(path) {
    const leadingComments = path.node.leadingComments

    if (leadingComments && leadingComments.length) {
      for (let i = 0; i < leadingComments.length; i++) {
        const comment = leadingComments[i]
        const { type, value } = comment

        if (type === 'CommentLine' && value && value.indexOf(TRACK_MARK) > -1) {
          console.log(`CommentLine  Value => ${value}`)

          const trackParam = value && value.match(matchBracketsReg)
          const _trackFnStr = trackParam
            ? `_${TRACK_IMPORT_NAME}(${trackParam[0]})`
            : `_${TRACK_IMPORT_NAME}()`

          const pointAST = template.statement(_trackFnStr)()

          path.insertBefore(pointAST)
          leadingComments.splice(i, 1) // 移除当前注释
        }
      }
    }
  }

  return {
    name: 'babel-plugin-test-bp',
    visitor: {
      Program: {
        enter(path) {
          // 这里可以增加埋点引用 import
          const isHasTrackerComments = !!path.container.comments.find((item) =>
            item.value.includes(TRACK_MARK)
          )
          let isAddImoortTrackFile = false

          if (isHasTrackerComments) {
            path.traverse({
              ImportDeclaration(cpath) {
                var rpath = cpath.get('source').node.value

                if (rpath === TRACK_IMPORT_PATH) isAddImoortTrackFile = true
              },
            })
          }

          // 如果
          if (isHasTrackerComments && !isAddImoortTrackFile) {
            // 引入埋点依赖
            addDefault(path, TRACK_IMPORT_PATH, { nameHint: TRACK_IMPORT_NAME })
          }
        },
      },
      ImportDeclaration(path) {},
      'FunctionDeclaration|ClassDeclaration|ArrowFunctionExpression|VariableDeclaration|ExpressionStatement|ReturnStatement'(
        path
      ) {
        handleAutoTrackComments(path)
      },

      Identifier(path, state) {},
    },
  }
}
