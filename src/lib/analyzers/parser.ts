import type * as atype from './atypes'
import { codeWordStore } from "../stores";

let reservedWords;
codeWordStore.subscribe(value => {
   reservedWords = value;
});

let parserIndex: number;
let parserTokens: Array<atype.Token>;

export const parser = (tokens: Array<atype.Token>) => {
   let program = { type: 'program', body: new Array<atype.SentencesNode> }
   parserTokens = tokens;
   parserIndex = 0;

   while (parserIndex + 1 < parserTokens.length) {
      program.body.push(parse());
      if (parserTokens[parserIndex + 1])
         parserIndex++;
   }

   // console.log(program);

   return program;
};

function parse() : atype.SentencesNode {
   const token = parserTokens[parserIndex];

   if (token.name === 'DeclarationToken') {
      return declarationParser();
   }
   else if (token.name === 'IdentifierToken') {
      return assignmentParser();
   }
   else if (token.name === 'PrintToken') {
      return printParser();
   }
   else if (token.name === 'ReadToken') {
      return readParser();
   }
   else if (token.name === 'OpenIfToken') {
      return ifParser();
   }
   else if (token.name === 'OpenSwitchToken') {
      return switchParser();
   }
   else if (token.name === 'OpenRepeatToken') {
      return repeatParser();
   }
   else if (token.name === 'OpenWhileToken') {
      return whileParser();
   }
   else if (token.name === 'OpenDowhileToken') {
      return dowhileParser();
   }

   throw new SyntaxError('Wrong syntax');
}

function nextIndex() {
   if (!parserTokens[parserIndex + 1])
      throw new SyntaxError('Missing syntax');
   parserIndex++;
}

function tokenToNode(token: atype.Token) : atype.Node {
   return {
      name: token.name.replace('Token', 'Node') as 'NumericNode' | 'StringNode' | 'IdentifierNode',
      value: token.value
   }
}

function expressionParser() : atype.Node {

   let value = tokenToNode(parserTokens[parserIndex]);

   if (parserTokens[parserIndex].name == 'OpenParenToken') {
      nextIndex();
      value = {
         name: 'GroupNode',
         body: expressionParser()
      }
      nextIndex();
   }

   let nextToken = parserTokens[parserIndex + 1];
   if (nextToken) {
      const validTokens = [
         'AdditionToken', 
         'SubstractionToken', 
         'MultiplicationToken',
         'DivisionToken',
         'ModuleToken',
         'RelationalToken',
         'BooleanToken'
      ];
      if (  validTokens.includes(nextToken.name)) {
         nextIndex();
         let operator = parserTokens[parserIndex] as atype.OperatorToken;
         nextIndex();
         let right = expressionParser();
         value = {name: 'ExpressionNode',  left: value, right: right, operator: operator}
      }
   }

   return value;
}

function declarationParser() : atype.DeclarationNode {
   nextIndex();
   const identifier = parserTokens[parserIndex];
   let value: any;
   if (parserTokens[parserIndex+1] && parserTokens[parserIndex+1].name === 'AssignmentToken') {
      nextIndex();
      nextIndex();
      value = expressionParser();
   }
   else {
      value = { name: 'StringNode', value: undefined };
   }

   return { 
      name: 'DeclarationNode',
      identifier: identifier.value!,
      value: value
   };
}

function assignmentParser() : atype.AssignmentNode {
   const identifier = parserTokens[parserIndex];
   nextIndex();
   if (parserTokens[parserIndex].name !== 'AssignmentToken') {
      throw new SyntaxError('Identifier must be followed by assignment operator.');
   }
   nextIndex();
   let value = expressionParser();

   return { 
      name: 'AssignmentNode',
      identifier: identifier.value!,
      value: value
   };
}

function printParser() : atype.PrintNode {
   nextIndex();
   let value = expressionParser();

   return {
      name: 'PrintNode',
      value: value
   }
}

function readParser() : atype.ReadNode {
   nextIndex();
   let identifier = parserTokens[parserIndex] as atype.IdentifierToken

   return {
      name: 'ReadNode',
      identifier: identifier
   }
}

function ifParser() : atype.IfNode {
   nextIndex();
   if (parserTokens[parserIndex].name !== 'OpenParenToken') {
      throw new SyntaxError('Opening parenthesis is missing.');
   }
   nextIndex();
   let expression = expressionParser();
   nextIndex();
   if (parserTokens[parserIndex].name !== 'CloseParenToken') {
      throw new SyntaxError('Closing parenthesis is missing.');
   }
   nextIndex();
   let body = new Array<atype.SentencesNode>;
   let alternative = new Array<atype.SentencesNode>;
   let storeSentencesInBody = true;
   while (parserTokens[parserIndex].name !== 'CloseIfToken') {

      if (parserTokens[parserIndex].name === 'OpenIfElseToken') {
         storeSentencesInBody = false;
      }
      else {
         if (storeSentencesInBody) {
            body.push(parse());
         }
         else {
            alternative.push(parse());
         }
      }

      nextIndex();
   }

   return {
      name: 'IfNode',
      argument: expression,
      body: body,
      alternative: alternative
   }
}

function switchParser() : atype.SwitchNode {
   nextIndex();
   if (parserTokens[parserIndex].name !== 'OpenParenToken') {
      throw new SyntaxError('Opening parenthesis is missing.');
   }
   nextIndex();
   let expression = expressionParser();
   nextIndex();
   if (parserTokens[parserIndex].name !== 'CloseParenToken') {
      throw new SyntaxError('Closing parenthesis is missing.');
   }
   nextIndex();

   let cases = new Array<atype.CaseNode>;

   while (parserTokens[parserIndex].name !== 'CloseSwitchToken') {
      if (parserTokens[parserIndex].name !== 'OpenCaseToken') {
         throw new SyntaxError('Switch should start with a case statement.');
      }
      nextIndex();
      let caseArgument = tokenToNode(parserTokens[parserIndex]);
      nextIndex();
      if (parserTokens[parserIndex].value !== ':') {
         throw new SyntaxError(': after case argument is needed');
      }
      nextIndex();
   
      let caseSentences = new Array<atype.SentencesNode>;
      while (parserTokens[parserIndex].name !== 'CloseCaseToken') {
         caseSentences.push(parse());
         nextIndex();
      }
      nextIndex();

      cases.push({
         name: 'CaseNode',
         argument: caseArgument,
         body: caseSentences
      });
   }

   return {
      name: 'SwitchNode',
      argument: expression,
      cases: cases
   }
}

function repeatParser() : atype.RepeatNode {
   nextIndex();
   if (parserTokens[parserIndex].name !== 'OpenParenToken') {
      throw new SyntaxError('Opening parenthesis is missing.');
   }
   nextIndex();
   if (parserTokens[parserIndex].value !== reservedWords.CODE_REPEATDECLARE &&
         parserTokens[parserIndex].name !== 'DeclarationToken') {
      throw new SyntaxError('Declare a variable to keep track of the iterations');
   }
   let declaration = declarationParser();
   nextIndex();
   if (parserTokens[parserIndex].value !== reservedWords.CODE_REPEATTO) {
      throw new SyntaxError('Specify when the For loop should stop.');
   }
   nextIndex();
   let to = tokenToNode(parserTokens[parserIndex]);
   nextIndex();
   if (parserTokens[parserIndex].value !== reservedWords.CODE_REPEATSTEP) {
      throw new SyntaxError('Steps to increment on each iteration is missing.');
   }
   nextIndex();
   let steps = tokenToNode(parserTokens[parserIndex]);
   nextIndex();
   if (parserTokens[parserIndex].name !== 'CloseParenToken') {
      throw new SyntaxError('Closing parenthesis is missing.');
   }
   nextIndex();

   let forSentences = new Array<atype.SentencesNode>;
   while (parserTokens[parserIndex].name !== 'CloseRepeatToken') {
      forSentences.push(parse());
      nextIndex();
   }

   console.log({
      name: 'RepeatNode',
      declaration: declaration,
      to: to,
      steps: steps,
      body: forSentences
   });

   return {
      name: 'RepeatNode',
      declaration: declaration,
      to: to,
      steps: steps,
      body: forSentences
   }
}

function whileParser() : atype.WhileNode {
   nextIndex();
   if (parserTokens[parserIndex].name !== 'OpenParenToken') {
      throw new SyntaxError('Opening parenthesis is missing.');
   }
   nextIndex();
   let expression = expressionParser();
   nextIndex();
   if (parserTokens[parserIndex].name !== 'CloseParenToken') {
      throw new SyntaxError('Closing parenthesis is missing.');
   }
   nextIndex();

   let whileSentences = new Array<atype.SentencesNode>;
   while (parserTokens[parserIndex].name !== 'CloseWhileToken') {
      whileSentences.push(parse());
      nextIndex();
   }

   return {
      name: 'WhileNode',
      argument: expression,
      body: whileSentences
   }
}

function dowhileParser() : atype.DowhileNode {
   nextIndex();
   if (parserTokens[parserIndex].name !== 'OpenParenToken') {
      throw new SyntaxError('Opening parenthesis is missing.');
   }
   nextIndex();
   let expression = expressionParser();
   nextIndex();
   if (parserTokens[parserIndex].name !== 'CloseParenToken') {
      throw new SyntaxError('Closing parenthesis is missing.');
   }
   nextIndex();

   let dowhileSentences = new Array<atype.SentencesNode>;
   while (parserTokens[parserIndex].name !== 'CloseDowhileToken') {
      dowhileSentences.push(parse());
      nextIndex();
   }

   return {
      name: 'DowhileNode',
      argument: expression,
      body: dowhileSentences,
      do: true
   }
}