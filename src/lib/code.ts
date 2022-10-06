import * as atype from "./analyzers/atypes"
import { tokenize } from "./analyzers/lexer";
import { parser } from "./analyzers/parser";

export function getTokens(code: string) {
   return tokenize(code);
}

export function getAST(tokens: Array<atype.Token>) {
   return parser(tokens);
}

export function analyze(code: string) {
   let tokens = tokenize(code);
   let syntaxTree = parser(tokens);
   console.log(syntaxTree);
}

// Highlight the code by injecting spans
// with the corresponding classes and
// take care of spaces and tabs
export const getBeautifiedCode = (code: string, reservedWords: object, highlightedRow: number) : string => {
   let tabsArray: number[] = [];

   for (let index = 0; index < code.length; index++) {
      if (code[index] === '\t') {
         const sub = code.substring(0, index);
         const indexLastLineBreak = sub.lastIndexOf('<br>');
         const rowStart = indexLastLineBreak >= 0? indexLastLineBreak + 4 : 0;
         const rowString = sub.substring(rowStart);
         let calculatedPosition = 0;

         for (let rowCharIndex = 0; rowCharIndex < rowString.length; rowCharIndex++) {
            if (rowString[rowCharIndex] == '\t') {
               calculatedPosition += 4 - (calculatedPosition % 4);
            }
            else {
               calculatedPosition++;
            }
         }
         tabsArray.push(4 - (calculatedPosition % 4));
      }
   }

   tabsArray.forEach(spaces => {
      const spacesString = '&nbsp;'.repeat(spaces);
      code = code.replace(/\t/, spacesString);
   });

   code = code.replace(/\s/g, "&nbsp;");

   for (const [key, value] of Object.entries(reservedWords)) {
      const className = key.split("_")[1].toLowerCase();
      code = code.replace(new RegExp(`\\b${value}\\b`, "g"), '<span class="hl-'+className+'">'+value+'</span>');
   };
   
   let lines = code.split('<br>');
   for (let index = 0; index < lines.length; index++) {
      let comments = lines[index].match(/\/\/.*/g);

      if (comments?.length) {
         console.log('comment found');
         lines[index] = lines[index].replace(comments[0], '<span class="hl-comments">' + comments[0] + '</span>');
      }
      
      if (index == highlightedRow - 1) {
         lines[index] = '<div class="line hl-activerow">' + lines[index] + '</div>';
      }
      else {
         lines[index] = '<div class="line">' + lines[index] + '</div>';
      }
   }

   return lines.join('');
}