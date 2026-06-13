import type * as atype from './atypes'
import type { AnalysisError } from './atypes'

export function semanticAnalyzer(program: { body: atype.SentencesNode[] }): AnalysisError[] {
   const errors: AnalysisError[] = []
   const declared: string[] = []

   function walkNode(node: atype.SentencesNode) {
      switch (node.name) {
         case 'DeclarationNode':
            declared.push(node.identifier)
            walkValue(node.value)
            break

         case 'AssignmentNode':
            if (node.identifier.name === 'IdentifierNode' && node.identifier.value) {
               if (!declared.includes(node.identifier.value)) {
                  errors.push({
                     type: 'semantic',
                     message: `Variable '${node.identifier.value}' is not declared`
                  })
               }
            }
            if (node.identifier.name === 'ArrayIndexNode') {
               checkDeclared(node.identifier.array.value!)
            }
            walkValue(node.value)
            break

         case 'ReadNode':
            checkDeclared(node.identifier.value!)
            break

         case 'PrintNode':
            walkValue(node.value)
            break

         case 'IfNode':
            walkValue(node.argument)
            node.body.forEach(walkNode)
            node.alternative.forEach(walkNode)
            break

         case 'SwitchNode':
            walkValue(node.argument)
            node.cases.forEach(c => c.body.forEach(walkNode))
            break

         case 'RepeatNode':
            declared.push(node.declaration.identifier)
            walkValue(node.declaration.value)
            walkValue(node.to)
            walkValue(node.steps)
            node.body.forEach(walkNode)
            break

         case 'WhileNode':
            walkValue(node.argument)
            node.body.forEach(walkNode)
            break

         case 'DowhileNode':
            walkValue(node.argument)
            node.body.forEach(walkNode)
            break
      }
   }

   function walkValue(node: atype.Node | undefined) {
      if (!node) return
      switch (node.name) {
         case 'IdentifierNode':
            checkDeclared(node.value!)
            break
         case 'ArrayIndexNode':
            checkDeclared(node.array.value!)
            walkValue(node.index)
            break
         case 'PropertyAccessNode':
            walkValue(node.object)
            break
         case 'ExpressionNode':
            walkValue(node.left)
            walkValue(node.right)
            break
         case 'GroupNode':
            walkValue(node.body)
            break
         case 'ArrayNode':
            node.elements.forEach(walkValue)
            break
      }
   }

   function checkDeclared(name: string) {
      if (!declared.includes(name)) {
         errors.push({
            type: 'semantic',
            message: `Variable '${name}' is not declared`
         })
      }
   }

   program.body.forEach(walkNode)
   return errors
}