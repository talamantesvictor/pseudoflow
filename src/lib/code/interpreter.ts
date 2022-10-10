import type * as atype from "../analyzers/atypes"

let programVariables : Array<Object>;

export function interpreter(sentences: Array<atype.SentencesNode>) {
   let text = '';
   for (const sentence of sentences) {
      const newNode = intepretTreeNode(sentence);
      text += newNode!.print;
   }

   return text;
}

export function intepretTreeNode(node: atype.SentencesNode) {
   
   if (node.name === 'PrintNode') {
      if (node.value.name === 'ExpressionNode') {
         let value = expressionBuilder(node.value);
         return { print: eval(value) + '<br>' };
      }

      return { print: node.value['value'] + '<br>' };
   }
}

function groupBuilder(groupNode: atype.GroupNode) {
   let groupExpression = '(';

   if (groupNode.body.name === 'ExpressionNode') {
      groupExpression += expressionBuilder(groupNode.body);
   }
   else {
      groupExpression += groupNode.body['value'];
   }

   return groupExpression += ')';
}

function expressionBuilder(node: atype.ExpressionNode) {
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
   else if (node.right['name'] === 'ExpressionNode') {
      expression += expressionBuilder(node.right);
   }
   else {
      expression += node.right['value'];
   }

   return expression;
}