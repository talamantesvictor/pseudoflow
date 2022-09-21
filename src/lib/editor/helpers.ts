// Set numbers and line breaks to be
// inserted in the specified element
export const getLineNumbers = (rows: number) : string => {
   let rowsHtml: string = "";
   if (rows > 0) {
      for (let index = 0; index < rows; index++) {
         rowsHtml += "<div>" + (index + 1) + "</div>";
      }
   }
   return rowsHtml;
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
      if (index == highlightedRow - 1) {
         lines[index] = '<div class="line hl-activerow">' + lines[index] + '</div>';
      }
      else {
         lines[index] = '<div class="line">' + lines[index] + '</div>';
      }
   }

   return lines.join('');
}

// Insert tab character
export const insertTab = () => {
   document.execCommand("InsertText", false, '\t');
}

// Insert specific text
export const insertTemplate = (template: string) => {
   const templateArray = template.split('\n');
   templateArray.forEach(element => {
      document.execCommand("InsertHTML", false, element);
      insertLineBreak(window.getSelection());
   });
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

// Based in the current caret position
// determine which row is active
export const getCurrentLineNumber = (selection: Selection, element: Element) : number => {
   let calculatedRow = 0;

   if (selection.getRangeAt(0).startContainer === selection.getRangeAt(0).endContainer && 
         selection.getRangeAt(0).startOffset === selection.getRangeAt(0).endOffset &&
            element === document.activeElement) {
               
      if (selection.anchorNode === element) {
         calculatedRow = selection.anchorOffset;
         if (calculatedRow && element.childNodes[calculatedRow-1].nodeName === '#text') {
            calculatedRow -= 1;
         }
      }
      else {
         for (let index = 0; index < element.childNodes.length - 1; index++) {
            if (element.childNodes[index].isSameNode(selection.anchorNode)) {
               break;
            }
            calculatedRow++;
         }
      }
      
      let lineBreaksToDiscount = 0;
      for (let index = 0; index < calculatedRow; index++) {
         if (index && element.childNodes[index].nodeName === 'BR') {
            if (element.childNodes[index-1].nodeName === '#text') {
               lineBreaksToDiscount++;
            }
         }
      }
   
      if (calculatedRow === element.childNodes.length) {
         calculatedRow -= 1; // calculatedRow > rowLimit? rowLimit : calculatedRow;
      }
      calculatedRow += 1 - lineBreaksToDiscount;
   }
   
   return calculatedRow;
}