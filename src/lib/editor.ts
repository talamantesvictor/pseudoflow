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

// Insert tab character
export const insertTab = () => {
   document.execCommand("InsertText", false, '\t');
}

// Insert specific text
export const insertTemplate = (template: string) => {
   const templateArray = template.split('\n');
   templateArray.forEach(element => {
      document.execCommand("InsertHTML", false, element);
      insertLineBreak(window.getSelection() as Selection);
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
   let calculatedRow = -1;
   
   let shouldCalculate = selection.getRangeAt(0).startContainer === selection.getRangeAt(0).endContainer && 
         selection.getRangeAt(0).startOffset === selection.getRangeAt(0).endOffset &&
            element === document.activeElement;

   if (shouldCalculate) {
      calculatedRow = 1;
      if (selection.anchorNode.previousSibling !== null) {
         calculatedRow = calculateRowBySiblings(selection.anchorNode, calculatedRow);
      }
      // Firefox fix when caret is in last row and is empty
      else if (selection.anchorNode['innerText']) {
         let lineBreaks = selection.anchorNode['innerText'].split('\n');
         calculatedRow = lineBreaks.length - 1;
      }
      // Chromium fix for tabs
      else if (selection.anchorNode.parentNode.previousSibling !== null) {
         calculatedRow = calculateRowBySiblings(selection.anchorNode.parentNode, calculatedRow);
      }
   }
   
   return calculatedRow;
}

function calculateRowBySiblings(currentNode, currentIndex) {
   let index = currentIndex;
   if (currentNode.previousSibling) {
      if (currentNode.previousSibling.nodeValue === '\n' || currentNode.previousSibling.nodeName === 'BR') {
         index += 1;
      }
      index = calculateRowBySiblings(currentNode.previousSibling, index);
   }
   return index;
}