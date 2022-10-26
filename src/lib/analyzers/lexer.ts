import type * as atype from "./atypes"
import { _reservedWords } from "../stores";

let reservedWords;

_reservedWords.subscribe(value => {
   reservedWords = value;
});

const tokenStringMap: Array<atype.Token> = [
   { name: 'DeclarationToken',         rule: new RegExp('^' + reservedWords.CODE_VAR + '$', 'g') },
   { name: 'PrintToken',               rule: new RegExp('^' + reservedWords.CODE_PRINT + '$', 'g') },
   { name: 'ReadToken',                rule: new RegExp('^' + reservedWords.CODE_READ + '$', 'g') },
   { name: 'AssignmentToken',          rule: /^\=$/g },
   { name: 'OpenParenToken',           rule: /^\($/g },
   { name: 'CloseParenToken',          rule: /^\)$/g },
   { name: 'OpenIfToken',              rule: new RegExp('^' + reservedWords.CODE_IF + '$', 'g') },
   { name: 'OpenIfElseToken',          rule: new RegExp('^' + reservedWords.CODE_ELSE + '$', 'g') },
   { name: 'CloseIfToken',             rule: new RegExp('^' + reservedWords.CODE_ENDIF + '$', 'g') },
   { name: 'OpenSwitchToken',          rule: new RegExp('^' + reservedWords.CODE_SWITCH + '$', 'g') },
   { name: 'CloseSwitchToken',         rule: new RegExp('^' + reservedWords.CODE_ENDSWITCH + '$', 'g') },
   { name: 'OpenCaseToken',            rule: new RegExp('^' + reservedWords.CODE_CASE + '$', 'g') },
   { name: 'CloseCaseToken',           rule: new RegExp('^' + reservedWords.CODE_ENDCASE + '$', 'g') },
   { name: 'OpenForToken',             rule: new RegExp('^' + reservedWords.CODE_FOR + '$', 'g') },
   { name: 'CloseForToken',            rule: new RegExp('^' + reservedWords.CODE_ENDFOR + '$', 'g') },
   { name: 'OpenWhileToken',           rule: new RegExp('^' + reservedWords.CODE_WHILE + '$', 'g') },
   { name: 'CloseWhileToken',          rule: new RegExp('^' + reservedWords.CODE_ENDWHILE + '$', 'g') },
   { name: 'OpenDowhileToken',         rule: new RegExp('^' + reservedWords.CODE_DOWHILE + '$', 'g') },
   { name: 'CloseDowhileToken',        rule: new RegExp('^' + reservedWords.CODE_ENDDOWHILE + '$', 'g') },
   { name: 'AdditionToken',            rule: /^\+$/g },
   { name: 'SubstractionToken',        rule: /^\-$/g },
   { name: 'MultiplicationToken',      rule: /^\*$/g },
   { name: 'DivisionToken',            rule: /^\/$/g },
   { name: 'ModuleToken',              rule: /^\%$/g },
   { name: 'RelationalToken',          rule: /[\>\<]=?|[\=\!]\=/g },
   { name: 'BooleanToken',             rule: new RegExp('^' + reservedWords.CODE_AND + '$|^' + reservedWords.CODE_OR + '$', 'g') },
   { name: 'StringToken',              rule: /(["'])(?:(?=(\\?))\2.)*?\1/g },
   { name: 'NumericToken',             rule: /^\-?(\d?)+\.?\d+$/g },
   { name: 'IdentifierToken',          rule: /\w+/g },
   { name: 'OtherToken',               rule: /./g }
];

export const lexer = (code: string) : any => {
   // remove comments
   code = code.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g,'');
   // separate values to lexer
   const regex = /(["'])(?:(?=(\\?))\2.)*?\1|(((?<=\=\s*)|(?<=\(\s*))\-)?(\d?)+\.?\d+|(?:[=&|^+<>/*%!~-]{1,2})|(?:[\\(){}[\];\:\?]|(?:\w+))|[^\s]/g;

   let tokens : Array<atype.Token> = [];
   code.match(regex)?.forEach((value) => {
      for (const { name, rule } of tokenStringMap) {
         if (value.match(rule!)) {
            tokens.push({name: name, value: value} as atype.Token);
            break;
         }
      }
   });

   return tokens;
};