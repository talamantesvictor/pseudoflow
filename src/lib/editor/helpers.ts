// Set numbers and line breaks to be
// inserted in the specified element
export const getLineNumbers = (rows: number) : string => {
   let rowsHtml: string = "";
   if (rows > 0) {
      for (let index = 0; index < rows; index++) {
         rowsHtml += index + 1 + "<br>";
      }
   }
   return rowsHtml;
}

// Highlight the code by injecting spans
// with the corresponding classes and
// take care of spaces and tabs
export const getCodeHighlights = (code: string, reservedWords: object) : string => {
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
      code = code.replace(new RegExp(`\\b${value}\\b`, "g"), '<span class="hl-'+value+'">'+value+'</span>');
   };

   return code;
}

// Insert tab character
export const insertTab = () => {
   document.execCommand("InsertText", false, '\t');
}

// Insert line break keeping 
// trail tab characters
export const insertLineBreak = (selection: Selection) => {
   const nodeString = selection.anchorNode?.nodeValue;
   document.execCommand('InsertLineBreak');

   if (nodeString) {
      let tabsToInsert = '';
      for (let i = 0; i < nodeString.length; i++) {
         if (nodeString[i] === '\t') {
            tabsToInsert += '\t'
         }
         else break;
      }
      if (tabsToInsert.length) {
         document.execCommand("InsertHTML", false, tabsToInsert);
      }
   }
}

// Unselect text and set caret
// to the right
export const unselectText = (selection: Selection) => {
   const range = selection.getRangeAt(0);
   range.setStart( range.endContainer, range.endOffset );
}