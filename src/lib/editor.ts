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
   const sel = window.getSelection();
   if (!sel || !sel.rangeCount) return;
   const range = sel.getRangeAt(0);
   range.deleteContents();
   const node = document.createTextNode('    ');
   range.insertNode(node);
   range.setStartAfter(node);
   range.collapse(true);
   sel.removeAllRanges();
   sel.addRange(range);
}

function findSelectedRange(element: HTMLElement): { text: string; lines: string[]; start: number; end: number } | null {
   const text = element.innerText;
   const sel = window.getSelection();
   if (!sel || !sel.rangeCount || sel.isCollapsed) return null;
   const selText = sel.toString();
   if (!selText) return null;
   const lines = text.split('\n');
   let approxIdx = 0;
   const approxLine = getApproxLine(sel, element);
   for (let i = 0; i < Math.min(approxLine - 1, lines.length); i++) approxIdx += lines[i].length + 1;
   let idx = text.indexOf(selText, approxIdx);
   if (idx === -1) idx = text.indexOf(selText);
   if (idx === -1) return null;
   return {
      text,
      lines: lines,
      start: text.slice(0, idx).split('\n').length,
      end: text.slice(0, idx + selText.length).split('\n').length,
   };
}

export const indentLines = (element: HTMLElement): string | null => {
   const range = findSelectedRange(element);
   if (!range) return null;
   for (let i = range.start - 1; i < range.end; i++) range.lines[i] = '    ' + range.lines[i];
   return range.lines.join('\n');
}

export const outdentLines = (element: HTMLElement): string | null => {
   const text = element.innerText;
   const sel = window.getSelection();
   if (!sel || !sel.rangeCount) return null;
   if (sel.isCollapsed) {
      const line = getActiveRowNumber(sel, element);
      const lines = text.split('\n');
      if (line <= 0 || line > lines.length) return null;
      const l = lines[line - 1];
      let changed = false;
      let indent = '';
      if (l.startsWith('    ')) { indent = '    '; }
      else if (l.startsWith('\t')) { indent = '\t'; }
      else if (l.startsWith('   ')) { indent = '   '; }
      else if (l.startsWith('  ')) { indent = '  '; }
      else if (l.startsWith(' ')) { indent = ' '; }
      if (indent) { lines[line - 1] = l.slice(indent.length); changed = true; }
      return changed ? lines.join('\n') : null;
   }
   const range = findSelectedRange(element);
   if (!range) return null;
   let changed = false;
   for (let i = range.start - 1; i < range.end; i++) {
      const l = range.lines[i];
      if (l.startsWith('    ')) { range.lines[i] = l.slice(4); changed = true; }
      else if (l.startsWith('\t')) { range.lines[i] = l.slice(1); changed = true; }
      else if (l.startsWith('   ')) { range.lines[i] = l.slice(3); changed = true; }
      else if (l.startsWith('  ')) { range.lines[i] = l.slice(2); changed = true; }
      else if (l.startsWith(' ')) { range.lines[i] = l.slice(1); changed = true; }
   }
   return changed ? range.lines.join('\n') : null;
}

export const insertTemplate = (template: string) => {
   const templateArray = template.split('\n');
   templateArray.forEach(element => {
      document.execCommand("InsertHTML", false, element);
      insertLineBreak(window.getSelection() as Selection);
   });
}

export const insertLineBreak = (selection: Selection) => {
   if (!selection.anchorNode) return;
   const currentLine = getActiveRowNumber(selection);
   const fullText = selection.anchorNode.parentNode?.['innerText'] || '';
   const lines = fullText.split('\n');
   let nodeString = lines[currentLine - 1];
   document.execCommand('InsertLineBreak');
   if (nodeString) {
      let tabsToInsert = '';
      for (let i = 0; i < nodeString.length; i++) {
         if (nodeString[i] === '\t') tabsToInsert += '\t';
         else break;
      }
      if (tabsToInsert.length) document.execCommand("InsertText", false, tabsToInsert);
   }
}

export const unselectText = (selection: Selection) => {
   const range = selection.getRangeAt(0);
   range.setStart(range.endContainer, range.endOffset);
}

export function getApproxLine(sel: Selection, element: HTMLElement): number {
   if (!sel.rangeCount) return 1;
   const range = sel.getRangeAt(0);
   if (sel.isCollapsed) {
      const active = getActiveRowNumber(sel, element);
      return active > 0 ? active : 1;
   }
   const start = getNodeLineNumber(range.startContainer, range.startOffset);
   return start.line > 0 ? start.line : 1;
}

export interface SelectedRange {
   startLine: number;
   endLine: number;
   partialStart: boolean;
   partialEnd: boolean;
}

function getNodeLineNumber(container: Node, offset: number): { line: number; column: number } {
   try {
      const el = container.nodeType === Node.TEXT_NODE ? container.parentElement : container as HTMLElement;
      const body = el?.closest('[contenteditable]') || (container.ownerDocument?.body);
      if (!body) return { line: 1, column: 0 };
      const range = document.createRange();
      range.selectNodeContents(body);
      if (container.nodeType === Node.TEXT_NODE) {
         range.setEnd(container, Math.min(offset, (container.textContent || '').length));
      } else {
         range.setEnd(container, Math.min(offset, container.childNodes.length));
      }
      const text = range.toString();
      const textLines = text.split('\n');
      return { line: textLines.length || 1, column: (textLines[textLines.length - 1] || '').length };
   } catch { return { line: 1, column: 0 }; }
}

export const getSelectedLines = (element: HTMLElement): SelectedRange | null => {
   try {
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount || sel.isCollapsed) return null;
      const range = sel.getRangeAt(0);
      if (range.startContainer === element || range.endContainer === element) return null;
      const start = getNodeLineNumber(range.startContainer, range.startOffset);
      const end = getNodeLineNumber(range.endContainer, range.endOffset);
      if (start.line <= 0 || end.line <= 0) return null;
      const text = element.innerText;
      const lines = text.split('\n');
      const startLine = Math.min(start.line, end.line);
      const endLine = Math.max(start.line, end.line);
      const startCol = start.line <= end.line ? start.column : end.column;
      const endCol = start.line <= end.line ? end.column : start.column;
       const partialStart = startCol > 0;
      const partialEnd = endCol > 0 && endCol < (lines[endLine - 1] || '').length;
      if (startLine === endLine && partialStart && partialEnd) return null;
      return { startLine, endLine, partialStart, partialEnd };
   } catch { return null; }
}

export const getActiveRowNumber = (selection: Selection, element: any = false) : number => {
   if (element) {
      if (element !== document.activeElement) return -1;
      try {
         const body = element.closest('[contenteditable]') || element;
         const selRange = selection.getRangeAt(0);
         if (selRange.startContainer !== selRange.endContainer || selRange.startOffset !== selRange.endOffset) return -1;
         const range = document.createRange();
         range.selectNodeContents(body);
         range.setEnd(selRange.startContainer, selRange.startOffset);
         return range.toString().split('\n').length || 1;
      } catch { return -1; }
   }
   let calculatedRow = -1;
   try {
      let shouldCalculate = selection.getRangeAt(0).startContainer === selection.getRangeAt(0).endContainer &&
            selection.getRangeAt(0).startOffset === selection.getRangeAt(0).endOffset;
      if (shouldCalculate) {
         if (selection.getRangeAt(0).startContainer) {
            if (!(selection.getRangeAt(0).startContainer as any)['innerHTML']) {
               const allNodes = selection.getRangeAt(0).startContainer.parentElement!.childNodes;
               let previousText = '';
               for (let i = 0; i < allNodes.length; i++) {
                  if (allNodes[i] == selection.getRangeAt(0).startContainer) break;
                  previousText += (allNodes[i] as any)['tagName'] === 'BR'? '\n' : (allNodes[i] as any).textContent;
               }
               calculatedRow = previousText.split('\n').length;
            } else {
               calculatedRow = 1;
               for (let index = 0; index < selection.getRangeAt(0).startOffset; index++) {
                  if ((selection.anchorNode as any).childNodes[index].nodeName == 'BR') calculatedRow++;
               }
            }
         }
      }
   } catch(e) {}
   return calculatedRow;
}
