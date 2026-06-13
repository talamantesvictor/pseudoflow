import { lexer } from './lexer'
import { parser } from './parser'
import type { AnalysisResult } from './atypes'

export function analyze(code: string): AnalysisResult {
   const tokens = lexer(code)
   const { body, errors } = parser(tokens)
   return { program: { body }, errors }
}
