import type * as atype from "../analyzers/atypes";

let interpreterPrints: string;
let interpreterVariables: Array<Object>;
let shouldReadInput: boolean;
let runningSentences: atype.SentencesNode[];
let lastNode: atype.SentencesNode;

export function interpreter(sentences: atype.SentencesNode[] = runningSentences) {
   interpreterPrints = '';
   shouldReadInput = false;
   runningSentences = [...sentences];

   while (runningSentences.length) {
      const node = runningSentences.shift()!;
      lastNode = node;
      if (node.name === 'ReadNode') {
         interpreterVariables.push({
            identifier: node.identifier.value,
            value: undefined
         });
         shouldReadInput = true;
         break;
      }

      const newNode = intepretTreeNode(node);
      interpreterPrints += newNode!.print;
   }

   return {
      prints: interpreterPrints, 
      interruptedForInput: shouldReadInput,
      pendingSentences: runningSentences,
      lastNode: lastNode
   };
}

export function interpreterReset() {
   interpreterPrints = '';
   shouldReadInput = false;
   interpreterVariables = [];
   runningSentences = [];
}

export function addSentence(sentence: atype.SentencesNode, index: number) {
   runningSentences.splice(index, 0, sentence);
}

function intepretTreeNode(node: atype.SentencesNode) {
   if (node.name === 'DeclarationNode') {
      const value = safeEval(valueBuilder(node.value));
      interpreterVariables.push({
         identifier: node.identifier,
         value: isNaN(value) ? '"' + value + '"' : value
      });

      return { print: '' };
   }
   else if (node.name === 'AssignmentNode') {
      for (let index = 0; index < interpreterVariables.length; index++) {
         if (interpreterVariables[index]['identifier'] === node.identifier) {
            let value = valueBuilder(node.value); 
            value = isNaN(value)? '"' + value + '"' : safeEval(value);
            interpreterVariables[index]['value'] = value;
         }
      }

      return { print: '' };
   }
   else if (node.name === 'PrintNode') {
      return { 
         print: safeEval(valueBuilder(node.value)) + '<br>' 
      };
   }
   else if (node.name === 'IfNode') {
      const isTrueStatement = safeEval(valueBuilder(node.argument));

      if (isTrueStatement) {
         [...node.body].reverse().forEach(bodyNode => {
            addSentence(bodyNode, 0);
         });
      }
      else {
         [...node.alternative].reverse().forEach(bodyNode => {
            addSentence(bodyNode, 0);
         });
      }
      
      return { print: '' };
   }
   else if (node.name === 'SwitchNode') {
      const switchValue = safeEval(valueBuilder(node.argument));

      node.cases.forEach(caseElement => {
         const caseValue = safeEval(valueBuilder(caseElement.argument));

         if (switchValue === caseValue) {
            [...caseElement.body].reverse().forEach(bodyNode => {
               addSentence(bodyNode, 0);
            });
         }
      });

      return { print: '' };
   }
   else if (node.name === 'RepeatNode') {
      const declarationValue = safeEval(valueBuilder(node.declaration.value));
      const toValue = safeEval(valueBuilder(node.to));
      let stepsValue = safeEval(valueBuilder(node.steps));
      stepsValue = Math.abs(stepsValue);
      
      let newUntilValue = Math.abs(toValue - declarationValue);

      let operator = '+';
      if (declarationValue > toValue) {
         operator = '-'
      }

      if (newUntilValue > 0) {
         addSentence({
            body: node.body,
            declaration: {
               name: 'DeclarationNode',
               identifier: node.declaration.identifier,
               value: {
                  name: 'NumericNode',
                  value: safeEval(declarationValue + operator + '(' + stepsValue + ')')
               } as any
            },
            name: node.name,
            steps: node.steps,
            to: node.to
         } as atype.RepeatNode, 0);
      }
       
      [...node.body].reverse().forEach(bodyNode => {
         addSentence(bodyNode, 0);
      });

      addSentence({
         name: 'DeclarationNode',
         identifier: node.declaration.identifier,
         value: {
            name: 'NumericNode',
            value: declarationValue
         }
      } as atype.DeclarationNode, 0);

      return { print: '' };
   }
   else if (node.name === 'WhileNode') {
      const argumentValue = safeEval(valueBuilder(node.argument));

      if (argumentValue) {
         addSentence({
            argument: node.argument,
            body: node.body,
            name: node.name
         } as atype.WhileNode, 0);
   
         [...node.body].reverse().forEach(bodyNode => {
            addSentence(bodyNode, 0);
         });
      }

      return { print: '' };
   }
   else if (node.name === 'DowhileNode') {
      const argumentValue = safeEval(valueBuilder(node.argument));

      if (argumentValue || node.do) {
         addSentence({
            argument: node.argument,
            body: node.body,
            name: node.name,
            do: false
         } as atype.DowhileNode, 0);
   
         [...node.body].reverse().forEach(bodyNode => {
            addSentence(bodyNode, 0);
         });
      }

      return { print: '' };
   }
}

function groupBuilder(groupNode: atype.GroupNode, enableVariables = true) {
   let groupExpression = '(';

   if (groupNode.body.name === 'ExpressionNode') {
      groupExpression += expressionBuilder(groupNode.body, enableVariables);
   }
   else {
      groupExpression += valueBuilder(groupNode.body, enableVariables);
   }

   return groupExpression += ')';
}

function expressionBuilder(node: atype.ExpressionNode, enableVariables = true) {
   let expression: string;

   if (node.left.name === 'GroupNode') {
      expression = groupBuilder(node.left, enableVariables);
   }
   else {
      expression = valueBuilder(node.left, enableVariables);
   }

   expression += node.operator.value;

   if (node.right.name === 'GroupNode') {
      expression += groupBuilder(node.right, enableVariables);
   }
   else if (node.right['name'] === 'ExpressionNode') {
      expression += expressionBuilder(node.right, enableVariables);
   }
   else {
      expression += valueBuilder(node.right, enableVariables);
   }

   return expression;
}

function safeEval(expression: any) {
   return Function('"use strict";return (' + expression + ')')();
}

export function valueBuilder(node, enableVariables = true) {
   let value: any;

   if (node.name === 'IdentifierNode' && enableVariables && interpreterVariables) {
      interpreterVariables.forEach(storedVariable => {
         if (storedVariable['identifier'] === node.value) {
            value = storedVariable['value'];
         }
      });
   }
   else if (node.name === 'ExpressionNode') {
      value = expressionBuilder(node, enableVariables);
   }
   else if (node.name === 'GroupNode') {
      value = groupBuilder(node, enableVariables);
   }
   else {
      value = node.value;
   }

   return value;
}