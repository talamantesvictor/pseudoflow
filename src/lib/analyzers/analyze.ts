import { lexer } from './lexer'
import { parser } from './parser'
import { semanticAnalyzer } from './semantics'
import type { AnalysisResult } from './atypes'

export function analyze(code: string): AnalysisResult {
   const tokens = lexer(code)
   const { body, errors } = parser(tokens)
   errors.push(...semanticAnalyzer({ body }))

   return { program: { body }, errors }
}
