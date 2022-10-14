import type * as atype from "../analyzers/atypes"

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
      const node = runningSentences.shift();
      lastNode = node;
      if (node.name === 'ReadNode') {
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
      const value = eval(valueBuilder(node.value));
      interpreterVariables.push({
         identifier: node.identifier,
         value: isNaN(value) ? '"' + value + '"' : value
      });

      return { print: '' };
   }
   else if (node.name === 'AssignmentNode') {
      for (let index = 0; index < interpreterVariables.length; index++) {
         if (interpreterVariables[index]['identifier'] === node.identifier) {
            const value = valueBuilder(node.value);
            interpreterVariables[index]['value'] = isNaN(value) ? '"' + value + '"' : value;
         }
      }

      return { print: '' };
   }
   else if (node.name === 'PrintNode') {
      return { 
         print: eval(valueBuilder(node.value)) + '<br>' 
      };
   }
   else if (node.name === 'IfNode') {
      const isTrueStatement = eval(valueBuilder(node.argument));

      if (isTrueStatement) {
         [...node.body].reverse().forEach(bodyNode => {
            addSentence(bodyNode, 0);
         });
      }
      
      return { print: '' };
   }
   else if (node.name === 'SwitchNode') {
      const switchValue = eval(valueBuilder(node.argument));

      node.cases.forEach(caseElement => {
         const caseValue = eval(valueBuilder(caseElement.argument));

         if (switchValue === caseValue) {
            [...caseElement.body].reverse().forEach(bodyNode => {
               addSentence(bodyNode, 0);
            });
         }
      });

      return { print: '' };
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
      interpreterVariables.forEach(storedVariable => {
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