import type { SelectedRange } from "../editor";

// Highlight the code by injecting spans
// with the corresponding classes and
// takes care of spaces and tabs
export const beautifier = (code: string, reservedWords: Record<string, string>, highlightedRow: number, selectedLines: SelectedRange | null = null): string => {
   // Calculate needed spaces to replace all tabs 
   // and maintain columns aligned   
   let tabsArray: number[] = [];
   for (let index = 0; index < code.length; index++) {
      if (code[index] === '\t') {
         const sub = code.substring(0, index);
         const indexLastLineBreak = sub.lastIndexOf('\n');
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

   // Iterate through the needed spaces for each tab
   // and replace them with HTML space entities
   tabsArray.forEach(spaces => {
      const spacesString = '&nbsp;'.repeat(spaces);
      code = code.replace(/\t/, spacesString);
   });

   let lines = code.split('\n');
   let inMultilineComment = false;
   for (let index = 0; index < lines.length; index++) {
      // Actual spaces should be replaced with HTML too
      lines[index] = lines[index].replace(/ /g, "&nbsp;");

      // Temporary replace strings to avoid
      // issues with styling of reserved words
      // (must come before comment detection so /* or // inside strings aren't mistaken)
      let strings = lines[index].match(/(["'])(?:(?=(\\?))\2.)*?\1/g);
      if (strings) {
         for (let stringsIndex = 0; stringsIndex < strings.length; stringsIndex++) {
            lines[index] = lines[index].replace(strings[stringsIndex],'<##pf-string$!>');
         }
      }

      // Temporary replace multi-line comments to avoid
      // issues with styling of reserved words
      let multilineCommentText = '';
      if (inMultilineComment) {
         const endIdx = lines[index].indexOf('*/');
         if (endIdx !== -1) {
            inMultilineComment = false;
            multilineCommentText = lines[index].substring(0, endIdx + 2);
            lines[index] = lines[index].replace(multilineCommentText, '<##pf-multicomment$!>');
         } else {
            multilineCommentText = lines[index];
            lines[index] = '<##pf-multicomment$!>';
         }
      } else {
         const startIdx = lines[index].indexOf('/*');
         if (startIdx !== -1) {
            const endIdx = lines[index].indexOf('*/', startIdx + 2);
            if (endIdx !== -1) {
               multilineCommentText = lines[index].substring(startIdx, endIdx + 2);
               lines[index] = lines[index].replace(multilineCommentText, '<##pf-multicomment$!>');
            } else {
               inMultilineComment = true;
               multilineCommentText = lines[index].substring(startIdx);
               lines[index] = lines[index].replace(multilineCommentText, '<##pf-multicomment$!>');
            }
         }
      }

      // Temporary replace single-line comments to avoid
      // issues with styling of reserved words
      let comments = lines[index].match(/\/\/.*/g);
      if (comments) {
         lines[index] = lines[index].replace(comments[0],'<##pf-comment$!>');
      }

      // Highlight reserved words
      for (const [key, value] of Object.entries(reservedWords)) {
         const className = key.split("_")[1].toLowerCase();
         lines[index] = lines[index].replace(
            new RegExp('\\b' + value + '\\b', 'g'), 
            '<span class="hl-'+className+'">'+value+'</span>'
         );
      };

      // Replace back the multi-line comments
      if (multilineCommentText) {
         lines[index] = lines[index].replace(
            '<##pf-multicomment$!>',
            '<span class="hl-comments">' + multilineCommentText + '</span>'
         );
      }

      // Replace back the comments
      if (comments) {
         lines[index] = lines[index].replace(
            '<##pf-comment$!>', 
            '<span class="hl-comments">' + comments[0] + '</span>'
         );
      }

      // Replace back the strings
      if (strings) {
         for (let stringsIndex = 0; stringsIndex < strings.length; stringsIndex++) {
            lines[index] = lines[index].replace(
               '<##pf-string$!>', 
               '<span class="hl-string" atindex="stringsIndex">' + strings[stringsIndex] + '</span>'
            );
         }
      }
      
       // Rows styling
       const lineNum = index + 1;
       let showSelection = false;
       if (selectedLines && lineNum >= selectedLines.startLine && lineNum <= selectedLines.endLine) {
          if (lineNum === selectedLines.startLine && selectedLines.partialStart) {
             showSelection = false;
          } else if (lineNum === selectedLines.endLine && selectedLines.partialEnd) {
             showSelection = false;
          } else {
             showSelection = true;
          }
       }
        let lineClass = 'line';
        if (index == highlightedRow - 1) lineClass += ' hl-activerow';
        if (showSelection) lineClass += ' line-selected';
        lines[index] = '<div class="' + lineClass + '">' + lines[index] + '</div>';
   }

   return lines.join('');
}
