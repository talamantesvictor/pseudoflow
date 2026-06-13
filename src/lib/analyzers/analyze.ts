import { lexer } from './lexer'
import { parser } from './parser'
import type { AnalysisResult } from './atypes'

export function analyze(code: string): AnalysisResult {
   const tokens = lexer(code)
   const errors: AnalysisResult['errors'] = []

   let program
   try {
      program = parser(tokens)
   } catch (e) {
      if (e instanceof SyntaxError) {
         errors.push({ type: 'syntax', message: e.message })
         return { program: null, errors }
      }
      throw e
   }

   return { program, errors }
}
