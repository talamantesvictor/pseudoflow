import type * as atype from "../analyzers/atypes"

export function treeNodeInterpreter(node: atype.SentencesNode) {
   if (node.name === "PrintNode") {
      if (node.value.name === 'GenericExpressionNode') {
         let value = expressionBuilder(node.value);
         return { print: eval(value) + '<br>' };
      }

      return { print: node.value['value'] + '<br>' };
   }
}

function groupBuilder(groupNode: atype.GroupNode) {
   let groupExpression = '(';

   if (groupNode.body.name === 'GenericExpressionNode') {
      groupExpression += expressionBuilder(groupNode.body);
   }
   else {
      groupExpression += groupNode.body['value'];
   }

   return groupExpression += ')';
}

function expressionBuilder(node: atype.GenericExpressionNode) {
   let expression: string;

   if (node.left.name === 'GroupNode') {
      expression = groupBuilder(node.left);
   }
   else {
      expression = node.left['value'];
   }

   expression += node.operator.value;

   if (node.right.name === 'GroupNode') {
      expression += groupBuilder(node.right);
   }
   else if (node.right['name'] === 'GenericExpressionNode') {
      expression += expressionBuilder(node.right);
   }
   else {
      expression += node.right['value'];
   }

   return expression;
}