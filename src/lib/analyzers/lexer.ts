import type * as atype from "./atypes"
import { codeWordStore } from "../stores";

let tokenStringMap: Array<atype.Token>;

codeWordStore.subscribe(word => {
   tokenStringMap = [
      { name: 'DeclarationToken',         rule: new RegExp('^' + word.CODE_VAR + '$', 'g') },
      { name: 'PrintToken',               rule: new RegExp('^' + word.CODE_PRINT + '$', 'g') },
      { name: 'ReadToken',                rule: new RegExp('^' + word.CODE_READ + '$', 'g') },
      { name: 'AssignmentToken',          rule: /^\=$/g },
      { name: 'OpenParenToken',           rule: /^\($/g },
      { name: 'CloseParenToken',          rule: /^\)$/g },
      { name: 'OpenIfToken',              rule: new RegExp('^' + word.CODE_IF + '$', 'g') },
      { name: 'OpenIfElseToken',          rule: new RegExp('^' + word.CODE_ELSE + '$', 'g') },
      { name: 'CloseIfToken',             rule: new RegExp('^' + word.CODE_ENDIF + '$', 'g') },
      { name: 'OpenSwitchToken',          rule: new RegExp('^' + word.CODE_SWITCH + '$', 'g') },
      { name: 'CloseSwitchToken',         rule: new RegExp('^' + word.CODE_ENDSWITCH + '$', 'g') },
      { name: 'OpenCaseToken',            rule: new RegExp('^' + word.CODE_CASE + '$', 'g') },
      { name: 'CloseCaseToken',           rule: new RegExp('^' + word.CODE_ENDCASE + '$', 'g') },
      { name: 'OpenRepeatToken',             rule: new RegExp('^' + word.CODE_REPEAT + '$', 'g') },
      { name: 'CloseRepeatToken',            rule: new RegExp('^' + word.CODE_ENDREPEAT + '$', 'g') },
      { name: 'OpenWhileToken',           rule: new RegExp('^' + word.CODE_WHILE + '$', 'g') },
      { name: 'CloseWhileToken',          rule: new RegExp('^' + word.CODE_ENDWHILE + '$', 'g') },
      { name: 'OpenDowhileToken',         rule: new RegExp('^' + word.CODE_DOWHILE + '$', 'g') },
      { name: 'CloseDowhileToken',        rule: new RegExp('^' + word.CODE_ENDDOWHILE + '$', 'g') },
      { name: 'AdditionToken',            rule: /^\+$/g },
      { name: 'SubstractionToken',        rule: /^\-$/g },
      { name: 'MultiplicationToken',      rule: /^\*$/g },
      { name: 'DivisionToken',            rule: /^\/$/g },
      { name: 'ModuleToken',              rule: /^\%$/g },
      { name: 'RelationalToken',          rule: /[\>\<]=?|[\=\!]\=/g },
      { name: 'BooleanToken',             rule: new RegExp('^' + word.CODE_AND + '$|^' + word.CODE_OR + '$', 'g') },
      { name: 'StringToken',              rule: /(["'])(?:(?=(\\?))\2.)*?\1/g },
      { name: 'NumericToken',             rule: /^\-?(\d?)+\.?\d+$/g },
      { name: 'IdentifierToken',          rule: /\w+/g },
      { name: 'OtherToken',               rule: /./g }
   ];
});

export const lexer = (code: string) : any => {
   // remove comments
   code = code.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g,'');
   // separate words to lexer
   const regex = /(["'])(?:(?=(\\?))\2.)*?\1|(\-?\d?)+\.?\d+|(?:[=&|^+<>/*%!~-]{1,2})|(?:[\\(){}[\];\:\?]|(?:\w+))|[^\s]/g;

   let tokens : Array<atype.Token> = [];
   code.match(regex)?.forEach((word) => {
      for (const { name, rule } of tokenStringMap) {
         if (word.match(rule!)) {
            tokens.push({name: name, value: word} as atype.Token);
            break;
         }
      }
   });
   return tokens;
};