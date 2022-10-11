import type * as atype from "../analyzers/atypes"

let programVariables = new Array<Object>;

export function interpreter(sentences: Array<atype.SentencesNode>) {
   let text = '';

   for (const sentence of sentences) {
      const newNode = intepretTreeNode(sentence);
      text += newNode!.print;
   }

   return text;
}

export function intepretTreeNode(node: atype.SentencesNode) {
   
   if (node.name === 'DeclarationNode') {
      if (node.value.name === 'ExpressionNode') {
         programVariables.push({
            identifier: node.identifier,
            value: eval(expressionBuilder(node.value))
         });
      }
      else if (node.value.name === 'GroupNode') {
         programVariables.push({
            identifier: node.identifier,
            value: eval(groupBuilder(node.value))
         });
      }
      else {
         programVariables.push({
            identifier: node.identifier,
            value: node.value['value']
         });
      }

      return { print: '' };
   }
   else if (node.name === 'AssignmentNode') {
      for (let index = 0; index < programVariables.length; index++) {
         if (programVariables[index]['identifier'] === node.identifier) {
            if (node.value.name === 'ExpressionNode') {
               programVariables[index]['value'] = eval(expressionBuilder(node.value));
            }
            else if (node.value.name === 'GroupNode') {
               programVariables[index]['value'] = eval(groupBuilder(node.value));
            }
            else {
               programVariables[index]['value'] = node.value['value'];
            }
         }
      }

      return { print: '' };
   }
   else if (node.name === 'PrintNode') {
      if (node.value.name === 'ExpressionNode') {
         return { print: eval(expressionBuilder(node.value)) + '<br>' };
      }
      else if (node.value.name === 'GroupNode') {
         return { print: eval(groupBuilder(node.value)) + '<br>' };
      }

      return { print: valueBuilder(node.value) + '<br>' };
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
   else {
      value = node.value;
   }

   return value;
}