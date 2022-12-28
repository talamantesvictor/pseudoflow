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
   const currentLine = getActiveRowNumber(selection);
   const fullText = selection.anchorNode!.parentNode!['innerText'];
   const lines = fullText.split('\n');
   let nodeString = lines[currentLine - 1];
   
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
         document.execCommand("InsertText", false, tabsToInsert);
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
export const getActiveRowNumber = (selection: Selection, element: any = false) : number => {
   let calculatedRow = -1;
   let shouldCalculate = selection.getRangeAt(0).startContainer === selection.getRangeAt(0).endContainer && 
         selection.getRangeAt(0).startOffset === selection.getRangeAt(0).endOffset && 
            ( (element && element === document.activeElement) || (!element) );

   if (shouldCalculate) {
      if (selection.getRangeAt(0).startContainer) {
         if (!selection.getRangeAt(0).startContainer['innerHTML']) {
            const allNodes = selection.getRangeAt(0).startContainer.parentElement!.childNodes;
            let previousText = '';
            for (let i = 0; i < allNodes.length; i++) {
               if (allNodes[i] == selection.getRangeAt(0).startContainer) {
                  break;
               }
               previousText += allNodes[i]['tagName'] === 'BR'? '\n' : allNodes[i].textContent;
            }
            calculatedRow = previousText.split('\n').length;
         }
         else {
            // Firefox fix
            // Use case: caret is in an empty position
            calculatedRow = 1;
            for (let index = 0; index < selection.getRangeAt(0).startOffset; index++) {
               if (selection.anchorNode!.childNodes[index].nodeName == 'BR')
                  calculatedRow++
            }
         }
      }
   }
   
   return calculatedRow;
}