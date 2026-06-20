import type * as atype from './atypes'
import { codeWordStore } from "../stores";

let reservedWords;
codeWordStore.subscribe(value => {
   reservedWords = value;
});

let parserIndex: number;
let parserTokens: Array<atype.Token>;

const STATEMENT_START_TOKENS = [
   'DeclarationToken', 'PrintToken', 'ReadToken', 'IdentifierToken',
   'OpenIfToken', 'OpenSwitchToken', 'OpenRepeatToken',
   'OpenWhileToken', 'OpenDowhileToken'
];

export const parser = (tokens: Array<atype.Token>): { body: atype.SentencesNode[], errors: atype.AnalysisError[] } => {
   let program = { type: 'program' as const, body: new Array<atype.SentencesNode>() }
   const errors: atype.AnalysisError[] = []
   parserTokens = tokens;
   parserIndex = 0;

    while (parserIndex + 1 < parserTokens.length) {
       const outerLine = parserTokens[parserIndex]?.line
       try {
           program.body.push(...parse());
          if (parserTokens[parserIndex + 1])
             parserIndex++;
       } catch (e) {
          if (e instanceof SyntaxError) {
             const errorLine = parserTokens[parserIndex]?.line ?? outerLine;
             errors.push({
                type: 'syntax',
                message: e.message,
                line: errorLine
             });
            while (parserIndex < parserTokens.length - 1) {
                parserIndex++;
                const token = parserTokens[parserIndex];
                if (token.name === 'IdentifierToken') {
                    const next = parserTokens[parserIndex + 1];
                    if (next && (next.name === 'AssignmentToken' || next.name === 'OpenBracketToken')) break;
                    continue;
                }
                if (STATEMENT_START_TOKENS.includes(token.name)) break;
             }
         } else {
            throw e
         }
      }
   }

   return { body: program.body, errors }
};

function parse() : atype.SentencesNode[] {
   const token = parserTokens[parserIndex];

   if (token.name === 'DeclarationToken') {
      return declarationParser();
   }
   else if (token.name === 'IdentifierToken') {
      return [assignmentParser()];
   }
   else if (token.name === 'PrintToken') {
      return [printParser()];
   }
   else if (token.name === 'ReadToken') {
      return readParser();
   }
   else if (token.name === 'OpenIfToken') {
      return [ifParser()];
   }
   else if (token.name === 'OpenSwitchToken') {
      return [switchParser()];
   }
   else if (token.name === 'OpenRepeatToken') {
      return [repeatParser()];
   }
   else if (token.name === 'OpenWhileToken') {
      return [whileParser()];
   }
   else if (token.name === 'OpenDowhileToken') {
      return [dowhileParser()];
   }

   throw new SyntaxError(`Unexpected '${token.value || token.name}'. A statement like declare, if, while, or an identifier was expected here.`);
}

function nextIndex() {
    if (!parserTokens[parserIndex + 1])
        throw new SyntaxError('Unexpected end of code. The statement appears incomplete.');
    parserIndex++;
}

function expectOpenParen(keyword: string) {
    const token = parserTokens[parserIndex];
    const got = token.value !== undefined ? `'${token.value}'` : token.name;
    throw new SyntaxError(`Expected '(' after '${keyword}' but found ${got}.`);
}

function expectCloseParen(context: string) {
    const token = parserTokens[parserIndex];
    if (token.name === 'AssignmentToken') {
        throw new SyntaxError(`Unexpected '=' in ${context} condition. Use '==' to compare values, not '=' (assignment).`);
    }
    const got = token.value !== undefined ? `'${token.value}'` : token.name;
    throw new SyntaxError(`Missing ')' after ${context} condition, found ${got} instead.`);
}

function tokenToNode(token: atype.Token) : atype.Node {
   return {
      name: token.name.replace('Token', 'Node') as 'NumericNode' | 'StringNode' | 'IdentifierNode',
      value: token.value
   }
}

function precedenceOf(token: atype.Token): number {
   switch (token.name) {
      case 'BooleanToken':    return 1;
      case 'RelationalToken':  return 2;
      case 'AdditionToken':
      case 'SubstractionToken':
      case 'MultiplicationToken':
      case 'DivisionToken':
      case 'ModuleToken':     return 3;
      default:                 return 0;
   }
}

function atomParser(): atype.Node {
   const token = parserTokens[parserIndex];

   if (token.name === 'SubstractionToken') {
      nextIndex();
      const operand = atomParser();
      return {
         name: 'ExpressionNode',
         left: { name: 'NumericNode', value: '0' } as atype.NumericNode,
         right: operand,
         operator: token as atype.SubstractionToken
      };
   }

   const validStartTokens = ['NumericToken', 'StringToken', 'IdentifierToken', 'OpenParenToken', 'OpenBracketToken'];
   if (!validStartTokens.includes(token.name)) {
      throw new SyntaxError('Expected a value');
   }

   if (token.name === 'OpenParenToken') {
      nextIndex();
      const inner = expressionParser(0);
      nextIndex();
      if (parserTokens[parserIndex].name !== 'CloseParenToken') {
         throw new SyntaxError("Missing ')' after expression.");
      }
      return { name: 'GroupNode', body: inner };
   }
   else if (token.name === 'OpenBracketToken') {
      return arrayParser();
   }
   else if (
      token.name === 'IdentifierToken' &&
      parserTokens[parserIndex + 1]?.name === 'OpenBracketToken'
   ) {
      return arrayIndexParser();
   }

   return tokenToNode(token);
}

function expressionParser(minPrecedence: number = 0): atype.Node {
   let left = atomParser();

   if (parserTokens[parserIndex + 1]?.name === 'DotToken') {
      nextIndex();
      nextIndex();
      const property = parserTokens[parserIndex] as atype.IdentifierToken;
      let propertyName = property.value!;
      if (reservedWords.CODE_LENGTH && propertyName === reservedWords.CODE_LENGTH) {
         propertyName = 'length';
      }
      left = { name: 'PropertyAccessNode', object: left, property: propertyName };
   }

   while (true) {
      const nextToken = parserTokens[parserIndex + 1];
      if (!nextToken) break;
      const prec = precedenceOf(nextToken);
      if (prec === 0 || prec <= minPrecedence) break;
      nextIndex();
      const operator = parserTokens[parserIndex] as atype.OperatorToken;
      nextIndex();
      const right = expressionParser(prec);
      left = { name: 'ExpressionNode', left, right, operator };
   }

   return left;
}


function declarationParser() : atype.DeclarationNode[] {
   const declarations: atype.DeclarationNode[] = [];

   while (true) {
      nextIndex();
      const identifier = parserTokens[parserIndex];
      let value: any;
      if (parserTokens[parserIndex+1] && parserTokens[parserIndex+1].name === 'AssignmentToken') {
         nextIndex();
         nextIndex();
         value = expressionParser();
      }
      else if (parserTokens[parserIndex+1] && parserTokens[parserIndex+1].name === 'RelationalToken' && parserTokens[parserIndex+1].value === '==') {
         throw new SyntaxError(`Expected '=' after '${identifier.value}' but found '=='. Use '=' for assignment, '==' only for comparison.`);
      }
      else {
         value = { name: 'StringNode', value: undefined };
      }

      declarations.push({
         name: 'DeclarationNode',
         identifier: identifier.value!,
         value: value
      });

      if (parserTokens[parserIndex + 1]?.name === 'CommaToken') {
         nextIndex();
         if (parserTokens[parserIndex + 1]?.name !== 'IdentifierToken') {
            throw new SyntaxError('Expected an identifier after comma in declaration.');
         }
         continue;
      }
      break;
   }

   return declarations;
}

function assignmentParser(): atype.AssignmentNode {
   const identifier = parserTokens[parserIndex];
   nextIndex();

   let target: atype.IdentifierNode | atype.ArrayIndexNode = { 
      name: 'IdentifierNode', 
      value: identifier.value 
   };

   if (parserTokens[parserIndex].name === 'OpenBracketToken') {
      parserIndex--;  // Go back one position in order to `arrayIndexParser` work correctly
      target = arrayIndexParser();
      nextIndex();
   }

    if (parserTokens[parserIndex].name !== 'AssignmentToken') {
       if (parserTokens[parserIndex].name === 'RelationalToken' && parserTokens[parserIndex].value === '==') {
          throw new SyntaxError(`Expected '=' after '${identifier.value}' but found '=='. Use '=' for assignment, '==' only for comparison.`);
       }
       throw new SyntaxError(`Expected '=' after identifier but found '${parserTokens[parserIndex].value}'. Use 'identifier = value' to assign.`);
    }
   nextIndex();

   let value = expressionParser();

   return { 
      name: 'AssignmentNode',
      identifier: target,
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

function readParser() : atype.ReadNode[] {
   const reads: atype.ReadNode[] = [];

   while (true) {
      nextIndex();
      const identifier = parserTokens[parserIndex] as atype.IdentifierToken;

      reads.push({
         name: 'ReadNode',
         identifier: identifier
      });

      if (parserTokens[parserIndex + 1]?.name === 'CommaToken') {
         nextIndex();
         if (parserTokens[parserIndex + 1]?.name !== 'IdentifierToken') {
            throw new SyntaxError('Expected an identifier after comma in read statement.');
         }
         continue;
      }
      break;
   }

   return reads;
}

function ifParser() : atype.IfNode {
   nextIndex();
   if (parserTokens[parserIndex].name !== 'OpenParenToken') {
      expectOpenParen('if');
   }
   nextIndex();
   let expression = expressionParser();
   nextIndex();
   if (parserTokens[parserIndex].name !== 'CloseParenToken') {
      expectCloseParen('if');
   }
   nextIndex();
   let body = new Array<atype.SentencesNode>;
   let alternative = new Array<atype.SentencesNode>;
   let storeSentencesInBody = true;
   while (parserTokens[parserIndex].name !== 'CloseIfToken') {

       if (parserTokens[parserIndex].name === 'OpenIfElseToken') {
          if (!storeSentencesInBody) {
             throw new SyntaxError('An if statement can only have one else clause.');
          }
          storeSentencesInBody = false;
       }
      else {
            if (storeSentencesInBody) {
               body.push(...parse());
            }
            else {
               alternative.push(...parse());
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
      expectOpenParen('switch');
   }
   nextIndex();
   let expression = expressionParser();
   nextIndex();
   if (parserTokens[parserIndex].name !== 'CloseParenToken') {
      expectCloseParen('switch');
   }
   nextIndex();

    let cases = new Array<atype.CaseNode>;

    if (parserTokens[parserIndex].name === 'CloseSwitchToken') {
       throw new SyntaxError('A switch statement must have at least one case clause.');
    }

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
         caseSentences.push(...parse());
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
      expectOpenParen('repeat');
   }
   nextIndex();
   if (parserTokens[parserIndex].value !== reservedWords.CODE_REPEATDECLARE &&
         parserTokens[parserIndex].name !== 'DeclarationToken') {
      throw new SyntaxError(`Expected '${reservedWords.CODE_REPEATDECLARE}' or 'declare' after '('. A repeat loop needs a counter variable.`);
   }
   let declaration = declarationParser()[0];
   nextIndex();
   if (parserTokens[parserIndex].value !== reservedWords.CODE_REPEATTO) {
      throw new SyntaxError(`Expected '${reservedWords.CODE_REPEATTO}' to set the upper limit of the loop.`);
   }
   nextIndex();
   let to = expressionParser();
   nextIndex();
   if (parserTokens[parserIndex].value !== reservedWords.CODE_REPEATSTEP) {
      throw new SyntaxError(`Expected '${reservedWords.CODE_REPEATSTEP}' to set the increment.`);
   }
   nextIndex();
   let steps = expressionParser();
   nextIndex();
   if (parserTokens[parserIndex].name !== 'CloseParenToken') {
      expectCloseParen('repeat');
   }
   nextIndex();

   let forSentences = new Array<atype.SentencesNode>;
   while (parserTokens[parserIndex].name !== 'CloseRepeatToken') {
      forSentences.push(...parse());
      nextIndex();
   }

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
      expectOpenParen('while');
   }
   nextIndex();
   let expression = expressionParser();
   nextIndex();
   if (parserTokens[parserIndex].name !== 'CloseParenToken') {
      expectCloseParen('while');
   }
   nextIndex();

   let whileSentences = new Array<atype.SentencesNode>;
   while (parserTokens[parserIndex].name !== 'CloseWhileToken') {
      whileSentences.push(...parse());
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
      expectOpenParen('dowhile');
   }
   nextIndex();
   let expression = expressionParser();
   nextIndex();
   if (parserTokens[parserIndex].name !== 'CloseParenToken') {
      expectCloseParen('dowhile');
   }
   nextIndex();

   let dowhileSentences = new Array<atype.SentencesNode>;
   while (parserTokens[parserIndex].name !== 'CloseDowhileToken') {
      dowhileSentences.push(...parse());
      nextIndex();
   }

   return {
      name: 'DowhileNode',
      argument: expression,
      body: dowhileSentences,
      do: true
   }
}

function arrayParser(): atype.ArrayNode {
   let elements: atype.Node[] = [];

   nextIndex(); // After '['

   while (parserTokens[parserIndex].name !== 'CloseBracketToken') {
      elements.push(expressionParser());

      if (parserTokens[parserIndex + 1]?.name === 'CloseBracketToken') {
         nextIndex();
         break;
      }

      if (parserTokens[parserIndex + 1]?.name !== 'CommaToken') {
         throw new SyntaxError('A comma was expected between array values.');
      }

      nextIndex();
      nextIndex();
   }

   return { name: 'ArrayNode', elements };
}


function arrayIndexParser(): atype.ArrayIndexNode {
   const array = tokenToNode(parserTokens[parserIndex]) as atype.IdentifierNode;

   nextIndex(); // Avanzar a '['

   if (parserTokens[parserIndex].name !== 'OpenBracketToken') {
      throw new SyntaxError('"[" was expected after the identifier.');
   }
   nextIndex(); // Avanzar al índice

   if (parserTokens[parserIndex].name === 'CloseBracketToken') {
      throw new SyntaxError('Index expression was expected between brackets.');
   }

   const index = expressionParser();

   if (!parserTokens[parserIndex + 1] || parserTokens[parserIndex + 1].name !== 'CloseBracketToken') {
      throw new SyntaxError('"]" was expected after index.');
   }
   nextIndex(); // Avanzar a ']'

   return { name: 'ArrayIndexNode', array, index };
}
