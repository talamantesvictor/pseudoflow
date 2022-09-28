export type Token = {name: string, rule: RegExp, value?: string };

const tokenStringMap: Array<Token> = [
   { name: 'DeclarationToken',      rule: /^var$/g },
   { name: 'ReadToken',             rule: /^read$/g },
   { name: 'PrintToken',            rule: /^print$/g },
   { name: 'AssignmentToken',       rule: /^\=$/g },
   { name: 'OpenParenToken',        rule: /^\($/g },
   { name: 'CloseParenToken',       rule: /^\)$/g },
   { name: 'OpenIfToken',           rule: /^if$/g },
   { name: 'CloseIfToken',          rule: /^endif$/g },
   { name: 'OpenSwitchToken',       rule: /^switch$/g },
   { name: 'CloseSwitchToken',      rule: /^endswitch$/g },
   { name: 'OpenCaseToken',         rule: /^case$/g },
   { name: 'CloseCaseToken',        rule: /^endcase$/g },
   { name: 'OpenForToken',          rule: /^for$/g },
   { name: 'CloseForToken',         rule: /^endfor$/g },
   { name: 'OpenWhileToken',        rule: /^while$/g },
   { name: 'CloseWhileToken',       rule: /^endwhile$/g },
   { name: 'OpenDowhileToken',      rule: /^dowhile$/g },
   { name: 'CloseDowhileToken',     rule: /^enddowhile$/g },
   { name: 'ArithmeticToken',       rule: /[\/\+\-\*\%]=?/g },
   { name: 'RelationalToken',       rule: /[\>\<]=?|[\=\!]\=/g },
   { name: 'BooleanToken',          rule: /^and$|^or$/g },
   { name: 'StringToken',           rule: /(["'])(?:(?=(\\?))\2.)*?\1/g },
   { name: 'NumericToken',          rule: /^(\d?)+\.?\d+$/g },
   { name: 'LiteralToken',          rule: /\w+/g },
   { name: 'UnknownToken',          rule: /./g }
];

export const tokenize = (code: string) => {
   // remove comments
   code = code.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g,'');
   // separate values to tokenize
   const regex = /(["'])(?:(?=(\\?))\2.)*?\1|(?:[\\(){}[\]=&|^+<>/*%;\:?!~-]{1,2}|(\d?)+\.?\d+|(?:\w+))|[^\s]/g;
   
   let tokens : any = [];
   code.match(regex)?.forEach((value) => {
      for (const { name, rule } of tokenStringMap) {
         if (value.match(rule)) {
            tokens.push({name: name, value: value});
            break;
         }
      }
   });

   return tokens;
}