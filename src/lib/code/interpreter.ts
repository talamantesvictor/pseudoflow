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
      const builtValue = valueBuilder(node.value);
      const value = safeEval(builtValue);
      interpreterVariables.push({
         identifier: node.identifier,
         value: Array.isArray(value) ? value : (isNaN(value) ? '"' + value + '"' : value)
      });

      return { print: '' };
   }
   else if (node.name === 'AssignmentNode') {
      if (node.identifier.name === 'ArrayIndexNode') {
         const arrayName = node.identifier.array.value;
          const index = safeEval(valueBuilder(node.identifier.index));
          const builtValue = valueBuilder(node.value);
          const value = safeEval(builtValue);
          const storedValue = Array.isArray(value) ? value : (isNaN(value) ? '"' + value + '"' : value);

         for (let i = 0; i < interpreterVariables.length; i++) {
            if (interpreterVariables[i]['identifier'] === arrayName) {
               let arr = interpreterVariables[i]['value'];
               if (!Array.isArray(arr)) {
                  interpreterVariables[i]['value'] = [];
                  arr = interpreterVariables[i]['value'];
               }
               arr[index] = storedValue;
            }
         }
      } else {
         for (let index = 0; index < interpreterVariables.length; index++) {
            if (interpreterVariables[index]['identifier'] === node.identifier.value) {
               const builtValue = valueBuilder(node.value);
               const value = safeEval(builtValue);
               interpreterVariables[index]['value'] = Array.isArray(value) ? value : (isNaN(value) ? '"' + value + '"' : value);
            }
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

      const ascending = declarationValue <= toValue;
      const nextValue = ascending ? declarationValue + stepsValue : declarationValue - stepsValue;

      if (ascending ? nextValue <= toValue : nextValue >= toValue) {
         addSentence({
            body: node.body,
            declaration: {
               name: 'DeclarationNode',
               identifier: node.declaration.identifier,
               value: {
                  name: 'NumericNode',
                  value: nextValue
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

   if (node.operator.name === 'BooleanToken') {
      const isAnd = node.operator.value === 'and' || node.operator.value === 'y';
      expression += isAnd ? ' && ' : ' || ';
   } else {
      expression += node.operator.value;
   }

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

function safeEval(expression: any): any {
   if (typeof expression !== 'string') return expression;
   const trimmed = expression.trim();
   if (trimmed === '') return '';
   const tokens = tokenize(trimmed);
   let pos = 0;
   return parseExpression();
   function peek() { return tokens[pos]; }
   function consume() { return tokens[pos++]; }
   function expect(type: string, value?: string) {
      const t = peek();
      if (!t || t.type !== type || (value !== undefined && t.value !== value)) {
         throw new Error(`Expected ${value || type} but got ${t?.type}:${t?.value}`);
      }
      return consume();
   }
   function parseExpression(): any {
      let left = parseOr();
      return left;
   }
   function parseOr(): any {
      let left = parseAnd();
      while (peek()?.type === 'operator' && peek()?.value === '||') {
         consume();
         let right = parseAnd();
         left = left || right;
      }
      return left;
   }
   function parseAnd(): any {
      let left = parseComparison();
      while (peek()?.type === 'operator' && peek()?.value === '&&') {
         consume();
         let right = parseComparison();
         left = left && right;
      }
      return left;
   }
   function parseComparison(): any {
      let left = parseAdditive();
      if (peek()?.type === 'operator' && ['==', '!=', '>', '>=', '<', '<='].includes(peek().value)) {
         let op = consume().value;
         let right = parseAdditive();
         switch (op) {
            case '==': return left == right;
            case '!=': return left != right;
            case '>':  return left > right;
            case '>=': return left >= right;
            case '<':  return left < right;
            case '<=': return left <= right;
         }
      }
      return left;
   }
   function parseAdditive(): any {
      let left = parseMultiplicative();
      while (peek()?.type === 'operator' && (peek()?.value === '+' || peek()?.value === '-')) {
         let op = consume().value;
         let right = parseMultiplicative();
         if (op === '+') left = left + right;
         else left = left - right;
      }
      return left;
   }
   function parseMultiplicative(): any {
      let left = parseUnary();
      while (peek()?.type === 'operator' && ['*', '/', '%'].includes(peek()?.value)) {
         let op = consume().value;
         let right = parseUnary();
         switch (op) {
            case '*': left = left * right; break;
            case '/': left = left / right; break;
            case '%': left = left % right; break;
         }
      }
      return left;
   }
   function parseUnary(): any {
      if (peek()?.type === 'operator' && peek()?.value === '-') {
         consume();
         return -parseUnary();
      }
      if (peek()?.type === 'operator' && peek()?.value === '+') {
         consume();
         return parseUnary();
      }
      return parsePostfix();
   }
   function parsePostfix(): any {
      let value = parsePrimary();
      while (peek()?.type === 'dot' || peek()?.type === 'bracketOpen') {
         if (peek()?.type === 'dot') {
            consume();
            let prop = expect('identifier').value;
            if (Array.isArray(value)) {
               if (prop === 'length') value = value.length;
               else value = undefined;
            } else if (typeof value === 'string') {
               if (prop === 'length') value = value.length;
               else value = undefined;
            } else if (value && typeof value === 'object') {
               value = (value as any)[prop];
            } else {
               value = undefined;
            }
         } else if (peek()?.type === 'bracketOpen') {
            consume();
            let index = parseExpression();
            expect('bracketClose');
            if (Array.isArray(value)) {
               value = value[index];
            } else if (typeof value === 'string') {
               value = value[index];
            } else {
               value = undefined;
            }
         }
      }
      return value;
   }
   function parsePrimary(): any {
      let t = peek();
      if (!t) throw new Error('Unexpected end of expression');
      if (t.type === 'number') {
         consume();
         return parseFloat(t.value);
      }
      if (t.type === 'string') {
         consume();
         return t.value;
      }
      if (t.type === 'identifier') {
         consume();
         if (t.value === 'true') return true;
         if (t.value === 'false') return false;
         if (t.value === 'undefined') return undefined;
         if (t.value === 'null') return null;
         throw new Error(`Unexpected identifier: ${t.value}`);
      }
      if (t.type === 'parenOpen') {
         consume();
         let value = parseExpression();
         expect('parenClose');
         return value;
      }
      if (t.type === 'bracketOpen') {
         return parseArray();
      }
      if (t.type === 'braceOpen') {
         return parseObject();
      }
      throw new Error(`Unexpected token: ${t.type}:${t.value}`);
   }
   function parseArray(): any[] {
      consume(); // '['
      let arr: any[] = [];
      if (peek()?.type === 'bracketClose') {
         consume();
         return arr;
      }
      arr.push(parseExpression());
      while (peek()?.type === 'comma') {
         consume();
         arr.push(parseExpression());
      }
      expect('bracketClose');
      return arr;
   }
   function parseObject(): any {
      consume(); // '{'
      let obj: any = {};
      if (peek()?.type === 'braceClose') {
         consume();
         return obj;
      }
      while (true) {
         let key: string;
         if (peek()?.type === 'string') {
            key = consume().value;
         } else if (peek()?.type === 'identifier') {
            key = consume().value;
         } else {
            throw new Error('Expected object key');
         }
         expect('colon');
         obj[key] = parseExpression();
         if (peek()?.type === 'comma') {
            consume();
            continue;
         }
         break;
      }
      expect('braceClose');
      return obj;
   }
}

function tokenize(expr: string): { type: string; value: string }[] {
   const tokens: { type: string; value: string }[] = [];
   let i = 0;
   while (i < expr.length) {
      if (expr[i] === ' ' || expr[i] === '\t' || expr[i] === '\n') { i++; continue; }
      if (expr[i] === '(') { tokens.push({ type: 'parenOpen', value: '(' }); i++; continue; }
      if (expr[i] === ')') { tokens.push({ type: 'parenClose', value: ')' }); i++; continue; }
      if (expr[i] === '[') { tokens.push({ type: 'bracketOpen', value: '[' }); i++; continue; }
      if (expr[i] === ']') { tokens.push({ type: 'bracketClose', value: ']' }); i++; continue; }
      if (expr[i] === '{') { tokens.push({ type: 'braceOpen', value: '{' }); i++; continue; }
      if (expr[i] === '}') { tokens.push({ type: 'braceClose', value: '}' }); i++; continue; }
      if (expr[i] === ',') { tokens.push({ type: 'comma', value: ',' }); i++; continue; }
      if (expr[i] === ':') { tokens.push({ type: 'colon', value: ':' }); i++; continue; }
      if (expr[i] === '.') { tokens.push({ type: 'dot', value: '.' }); i++; continue; }
      if (expr[i] === '"' || expr[i] === "'") {
         let quote = expr[i];
         let j = i + 1;
         while (j < expr.length && expr[j] !== quote) {
            if (expr[j] === '\\') j++;
            j++;
         }
         if (j >= expr.length) throw new Error('Unterminated string');
         tokens.push({ type: 'string', value: expr.slice(i + 1, j) });
         i = j + 1;
         continue;
      }
      if (expr[i] === '&' && expr[i + 1] === '&') {
         tokens.push({ type: 'operator', value: '&&' }); i += 2; continue;
      }
      if (expr[i] === '|' && expr[i + 1] === '|') {
         tokens.push({ type: 'operator', value: '||' }); i += 2; continue;
      }
      if (expr[i] === '=' && expr[i + 1] === '=') {
         tokens.push({ type: 'operator', value: '==' }); i += 2; continue;
      }
      if (expr[i] === '!' && expr[i + 1] === '=') {
         tokens.push({ type: 'operator', value: '!=' }); i += 2; continue;
      }
      if (expr[i] === '>' && expr[i + 1] === '=') {
         tokens.push({ type: 'operator', value: '>=' }); i += 2; continue;
      }
      if (expr[i] === '<' && expr[i + 1] === '=') {
         tokens.push({ type: 'operator', value: '<=' }); i += 2; continue;
      }
      if ('+-*/%><='.includes(expr[i])) {
         tokens.push({ type: 'operator', value: expr[i] }); i++; continue;
      }
      let m2 = expr.slice(i).match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/);
      if (m2) {
          tokens.push({ type: 'identifier', value: m2[0] }); i += m2[0].length; continue;
      }
      if (/[0-9]/.test(expr[i])) {
         let m = expr.slice(i).match(/^[0-9]+(\.[0-9]+)?/);
         tokens.push({ type: 'number', value: m![0] }); i += m![0].length; continue;
      }
      throw new Error(`Unexpected character: ${expr[i]}`);
   }
   return tokens;
}

export function valueBuilder(node, enableVariables = true) {
   let value: any;

   if (node.name === 'IdentifierNode' && enableVariables && interpreterVariables) {
      interpreterVariables.forEach(storedVariable => {
         if (storedVariable['identifier'] === node.value) {
            value = storedVariable['value'];
            if (Array.isArray(value)) {
               value = JSON.stringify(value);
            }
         }
      });
   }
   else if (node.name === 'ArrayIndexNode' && enableVariables) {
      const arrayName = node.array.value;
      const index = safeEval(valueBuilder(node.index));
      interpreterVariables.forEach(storedVariable => {
         if (storedVariable['identifier'] === arrayName) {
            const arr = storedVariable['value'];
            if (Array.isArray(arr)) {
               value = arr[index];
            }
         }
      });
   }
   else if (node.name === 'ArrayIndexNode' && !enableVariables) {
      value = node.array.value + '[' + node.index.value + ']';
   }
   else if (node.name === 'PropertyAccessNode' && !enableVariables) {
      value = valueBuilder(node.object, false) + '.' + node.property;
   }
   else if (node.name === 'PropertyAccessNode') {
      value = safeEval(valueBuilder(node.object, true) + '.' + node.property);
   }
   else if (node.name === 'ArrayNode') {
      value = '[' + node.elements.map(el => valueBuilder(el, enableVariables)).join(',') + ']';
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