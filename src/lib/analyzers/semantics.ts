import type * as atype from './atypes'
import type { AnalysisError } from './atypes'

type ValueType = 'number' | 'string' | 'boolean' | 'array'

const ARITHMETIC_OPS = ['+', '-', '*', '/', '%']
const COMPARISON_OPS = ['==', '!=', '<', '>', '<=', '>=']
const BOOLEAN_OPS = ['&&', '||']

export function semanticAnalyzer(program: { body: atype.SentencesNode[] }): AnalysisError[] {
   const errors: AnalysisError[] = []
   const symbols: { name: string, type?: ValueType }[] = []

   function walkNode(node: atype.SentencesNode) {
      switch (node.name) {
         case 'DeclarationNode': {
            checkRedeclared(node.identifier)
            let type: ValueType | undefined
            if (!node.autoInitialized && (node.value && node.value.name !== 'StringNode' || node.value?.value !== undefined)) {
               type = inferType(node.value)
            }
            symbols.push({ name: node.identifier, type })
            if (node.value) checkTypeInValue(node.value, type)
            break
         }

         case 'AssignmentNode': {
            const valueType = inferType(node.value)
            if (node.identifier.name === 'IdentifierNode' && node.identifier.value) {
               const sym = findSymbol(node.identifier.value)
               if (sym) checkTypeConsistency(node.identifier.value, valueType, sym.type)
               if (!sym) {
                  errors.push({
                     type: 'semantic',
                     message: `Variable '${node.identifier.value}' is not declared`
                  })
               }
            }
            if (node.identifier.name === 'ArrayIndexNode') {
               checkDeclared(node.identifier.array.value!)
               const sym = findSymbol(node.identifier.array.value!)
               if (sym && sym.type && sym.type !== 'array') {
                  errors.push({
                     type: 'semantic',
                     message: `Variable '${sym.name}' is not an array`
                  })
               }
            }
            checkTypeInValue(node.value, valueType)
            break
         }

          case 'ReadNode':
             if (!findSymbol(node.identifier.value!)) {
                symbols.push({ name: node.identifier.value! })
             }
             break

         case 'PrintNode':
            checkTypeInValue(node.value)
            break

         case 'IfNode':
            checkTypeInValue(node.argument)
            node.body.forEach(walkNode)
            node.alternative.forEach(walkNode)
            break

         case 'SwitchNode':
            checkTypeInValue(node.argument)
            node.cases.forEach(c => c.body.forEach(walkNode))
            break

         case 'RepeatNode': {
            checkRedeclared(node.declaration.identifier)
            const declType = inferType(node.declaration.value)
            if (declType && declType !== 'number') {
               errors.push({
                  type: 'semantic',
                  message: `Loop variable '${node.declaration.identifier}' should be numeric`
               })
            }
            symbols.push({ name: node.declaration.identifier, type: 'number' })
            checkTypeInValue(node.declaration.value)
            checkTypeInValue(node.to, 'number')
            checkTypeInValue(node.steps, 'number')
            node.body.forEach(walkNode)
            break
         }

         case 'WhileNode':
            checkTypeInValue(node.argument)
            node.body.forEach(walkNode)
            break

         case 'DowhileNode':
            checkTypeInValue(node.argument)
            node.body.forEach(walkNode)
            break
      }
   }

   function inferType(node: atype.Node | undefined): ValueType | undefined {
      if (!node) return undefined
      switch (node.name) {
         case 'NumericNode':
            return 'number'
         case 'StringNode':
            return 'string'
         case 'ArrayNode':
            return 'array'
         case 'IdentifierNode': {
            const sym = findSymbol(node.value!)
            return sym?.type
         }
         case 'ArrayIndexNode':
            return undefined
         case 'PropertyAccessNode':
            return 'number'
         case 'ExpressionNode': {
            const leftType = inferType(node.left)
            const rightType = inferType(node.right)
            const op = node.operator.value
            if (ARITHMETIC_OPS.includes(op)) {
               if (op === '+') {
                  if (leftType === 'string' || rightType === 'string') return 'string'
                  return 'number'
               }
               return 'number'
            }
            if (COMPARISON_OPS.includes(op)) return 'boolean'
            if (BOOLEAN_OPS.includes(op)) return 'boolean'
            return undefined
         }
         case 'GroupNode':
            return inferType(node.body)
         default:
            return undefined
      }
   }

   function checkTypeInValue(node: atype.Node | undefined, expectedType?: ValueType) {
      if (!node) return
      switch (node.name) {
         case 'ExpressionNode': {
            const leftType = inferType(node.left)
            const rightType = inferType(node.right)
            const op = node.operator.value
            if (['/', '%'].includes(op)) {
               if (node.right.name === 'NumericNode' && node.right.value === '0') {
                  errors.push({ type: 'semantic', message: `Division by zero` })
               }
            }
            if (ARITHMETIC_OPS.includes(op) && op !== '+') {
               if (leftType && leftType !== 'number') {
                  errors.push({ type: 'semantic', message: `Operator '${op}' requires numeric operands, but left side is ${leftType}` })
               }
               if (rightType && rightType !== 'number') {
                  errors.push({ type: 'semantic', message: `Operator '${op}' requires numeric operands, but right side is ${rightType}` })
               }
            }
            if (BOOLEAN_OPS.includes(op)) {
               if (leftType && leftType !== 'boolean') {
                  errors.push({ type: 'semantic', message: `Operator '${op}' requires boolean operands, but left side is ${leftType}` })
               }
               if (rightType && rightType !== 'boolean') {
                  errors.push({ type: 'semantic', message: `Operator '${op}' requires boolean operands, but right side is ${rightType}` })
               }
            }
            checkArrayInScalarContext(node.left)
            checkArrayInScalarContext(node.right)
            checkTypeInValue(node.left)
            checkTypeInValue(node.right)
            break
         }
         case 'GroupNode':
            checkTypeInValue(node.body)
            break
         case 'ArrayNode':
            node.elements.forEach(e => checkTypeInValue(e))
            break
         case 'ArrayIndexNode':
            checkDeclared(node.array.value!)
            checkTypeInValue(node.index)
            break
         case 'IdentifierNode':
            checkDeclared(node.value!)
            break
         case 'PropertyAccessNode':
            checkTypeInValue(node.object)
            break
      }
   }

   function findSymbol(name: string) {
      return symbols.find(s => s.name === name)
   }

   function checkDeclared(name: string) {
      if (!symbols.some(s => s.name === name)) {
         errors.push({ type: 'semantic', message: `Variable '${name}' is not declared` })
      }
   }

   function checkRedeclared(name: string) {
      if (symbols.some(s => s.name === name)) {
         errors.push({ type: 'semantic', message: `Variable '${name}' is already declared` })
      }
   }

   function checkTypeConsistency(name: string, valueType: ValueType | undefined, declaredType: ValueType | undefined) {
      if (declaredType && valueType && valueType !== declaredType) {
         errors.push({ type: 'semantic', message: `Cannot assign ${valueType} value to variable '${name}' of type ${declaredType}` })
      }
   }

   function checkArrayInScalarContext(node: atype.Node | undefined) {
      if (!node || node.name !== 'IdentifierNode') return
      const sym = findSymbol(node.value!)
      if (sym?.type === 'array') {
         errors.push({ type: 'semantic', message: `Array variable '${sym.name}' used without index` })
      }
   }

   program.body.forEach(walkNode)
   return errors
}