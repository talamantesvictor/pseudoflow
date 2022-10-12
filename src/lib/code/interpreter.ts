import type * as atype from "../analyzers/atypes"

let programVariables = new Array<Object>;

export function intepretTreeNode(node: atype.SentencesNode) {
   if (node.name === 'DeclarationNode') {
      const value = eval(valueBuilder(node.value));
      programVariables.push({
         identifier: node.identifier,
         value: isNaN(value) ? '"' + value + '"' : value
      });

      return { print: '' };
   }
   else if (node.name === 'AssignmentNode') {
      for (let index = 0; index < programVariables.length; index++) {
         if (programVariables[index]['identifier'] === node.identifier) {
            const value = valueBuilder(node.value);
            programVariables[index]['value'] = isNaN(value) ? '"' + value + '"' : value;
         }
      }

      return { print: '' };
   }
   else if (node.name === 'PrintNode') {
      return { 
         print: eval(valueBuilder(node.value)) + '<br>' 
      };
   }
}

function groupBuilder(groupNode: atype.GroupNode) {
   let groupExpression = '(';

   if (groupNode.body.name === 'ExpressionNode') {
      groupExpression += expressionBuilder(groupNode.body);
   }
   else {
      groupExpression += valueBuilder(groupNode.body);
   }

   return groupExpression += ')';
}

function expressionBuilder(node: atype.ExpressionNode) {
   let expression: string;

   if (node.left.name === 'GroupNode') {
      expression = groupBuilder(node.left);
   }
   else {
      expression = valueBuilder(node.left);
   }

   expression += node.operator.value;

   if (node.right.name === 'GroupNode') {
      expression += groupBuilder(node.right);
   }
   else if (node.right['name'] === 'ExpressionNode') {
      expression += expressionBuilder(node.right);
   }
   else {
      expression += valueBuilder(node.right);
   }

   return expression;
}

function valueBuilder(node) {
   let value: any;

   if (node.name === 'IdentifierNode') {
      programVariables.forEach(storedVariable => {
         if (storedVariable['identifier'] === node.value) {
            value = storedVariable['value'];
         }
      });
   }
   else if (node.name === 'ExpressionNode') {
      value = expressionBuilder(node);
   }
   else if (node.name === 'GroupNode') {
      value = groupBuilder(node);
   }
   else {
      value = node.value;
   }

   return value;
}