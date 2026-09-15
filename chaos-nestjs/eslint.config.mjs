import eslint from '@eslint/js'
import tsEslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

// Nest 11 起不再单独发布 @nestjs/eslint-plugin，直接用 typescript-eslint 即可。
// prettier 放在最后以关闭所有与格式化冲突的规则。
export default tsEslint.config(
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  eslint.configs.recommended,
  ...tsEslint.configs.recommended,
  prettier,
)
