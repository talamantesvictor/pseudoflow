import { lexer } from './lexer'
import { parser } from './parser'
import { semanticAnalyzer } from './semantics'
import type { AnalysisResult } from './atypes'

export function analyze(code: string): AnalysisResult {
   const tokens = lexer(code)
   const { body, errors } = parser(tokens)

   if (errors.length === 0) {
      const semanticErrors = semanticAnalyzer({ body })
      errors.push(...semanticErrors)
   }

   return { program: { body }, errors }
}
