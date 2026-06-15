export const getLineNumbers = (rows: number) : string => {
   let rowsHtml: string = "";
   if (rows > 0) {
      for (let index = 0; index < rows; index++) {
         rowsHtml += "<div>" + (index + 1) + "</div>";
      }
   }
   return rowsHtml;
}

export const insertTab = () => {
   document.execCommand("InsertText", false, '\t');
}

export const insertTemplate = (template: string) => {
   const templateArray = template.split('\n');
   templateArray.forEach(element => {
      document.execCommand("InsertHTML", false, element);
      insertLineBreak(window.getSelection() as Selection);
   });
}

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

export const unselectText = (selection: Selection) => {
   const range = selection.getRangeAt(0);
   range.setStart( range.endContainer, range.endOffset );
}

export const getActiveRowNumber = (selection: Selection, element: any = false) : number => {
   const text = element ? element.innerText : '';
   if (!text) return 1;
   if (!(element && element === document.activeElement)) return -1;
   let offset = 0;
   try {
      const range = selection.getRangeAt(0);
      const preRange = document.createRange();
      preRange.selectNodeContents(element);
      preRange.setEnd(range.startContainer, range.startOffset);
      offset = preRange.toString().length;
   } catch {
      return text.split('\n').length;
   }
   return text.slice(0, offset).split('\n').length || 1;
}
