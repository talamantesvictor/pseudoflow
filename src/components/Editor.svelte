<script lang="ts">
   import Commands from "./Commands.svelte";
   import {
      insertTab,
      indentLines,
      outdentLines,
      insertTemplate,
      insertLineBreak,
      unselectText,
      getActiveRowNumber,
      getApproxLine,
      getSelectedLines,
   } from "../lib/editor";
   import type { SelectedRange } from "../lib/editor";
   import { beautifier } from "../lib/code/beautifier";
    import { codeWordStore, canUndoStore, canRedoStore } from "../lib/stores";
    import { onMount } from "svelte";
    import { EditorUndo } from "../lib/undo";

     export let editorText: string = "";
     let editorDynamicArea: HTMLElement;
     let editorElement: HTMLElement;
     let coloredElement: HTMLElement;
     let activeRowNumber: number;
     let lastRowNumber: number;
     let commandToInsert: any;
     let lastInsertedCommand: any;

    const undoer = new EditorUndo();

    $: {
       if (commandToInsert?.template && lastInsertedCommand !== commandToInsert) {
          lastInsertedCommand = commandToInsert;
          if (editorElement && editorElement !== document.activeElement) {
             focusOnEditableArea();
             window.getSelection().removeAllRanges();
             let newRange = document.createRange();
             newRange.selectNodeContents(editorElement);
             newRange.collapse(false);
             window.getSelection().addRange(newRange);
          }
          undoer.pushManual(editorElement.innerText, getCurrentRow());
          syncUndoState();
          undoer.beginBatch();
          insertTemplate(commandToInsert.template);
          undoer.endBatch(editorElement.innerText);
          setTimeout(() => beautifyCode());
       }
    }

   $: {
       if (editorElement && editorText !== undefined && editorElement.innerText !== editorText) {
          editorElement.innerText = editorText;
          undoer.setLastSnapshot(editorElement.innerText);
          setTimeout(() => {
            const sel = window.getSelection();
            if (sel && sel.rangeCount) {
               sel.removeAllRanges();
               const range = document.createRange();
               range.selectNodeContents(editorElement);
               range.collapse(false);
               sel.addRange(range);
            }
            beautifyCode();
         });
      }
   }

    function getCurrentRow(): number {
        const sel = window.getSelection();
        const row = sel && sel.isCollapsed ? getActiveRowNumber(sel, editorElement) : 1;
        return Math.max(1, row);
    }

    function getCursorOffset(): number {
        const sel = window.getSelection();
        if (!sel || !sel.rangeCount || !sel.isCollapsed) return -1;
        const selRange = sel.getRangeAt(0);
        const body = editorElement.closest('[contenteditable]') || editorElement;
        const range = document.createRange();
        try {
            range.selectNodeContents(body);
            range.setEnd(selRange.startContainer, selRange.startOffset);
            return range.toString().length;
        } catch { return -1; }
    }

    function handleInput() {
        undoer.snapshot(editorElement.innerText, getCurrentRow(), getCursorOffset());
        syncUndoState();
        beautifyCode();
    }

    function beautifyCode() {
      const currentText = editorElement.innerText;
      if (currentText !== editorText) editorText = currentText;
      lastRowNumber = activeRowNumber;
      const sel = window.getSelection();
      activeRowNumber = sel && sel.isCollapsed ? getActiveRowNumber(sel, editorElement) : 0;
      const displayText = currentText.replace(/\n$/, '');
      const displayLines = displayText.split('\n');
      activeRowNumber = Math.min(activeRowNumber, displayLines.length);
      const highlighted = beautifier(displayText, $codeWordStore, activeRowNumber, null);
      let lineNum = 1;
      const newHTML = highlighted.replace(
         /(<div class="line[^"]*">)/g,
         (match) => match + '<span class="line-num">' + (lineNum++) + '</span>'
      );
      if (coloredElement.innerHTML !== newHTML) coloredElement.innerHTML = newHTML;
   }

   function updateSelectionIndicator() {
      if (!coloredElement || !editorElement) return;
      coloredElement.querySelectorAll('.line-selected').forEach(el => el.classList.remove('line-selected'));
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) return;
      const selectedLines = getSelectedLines(editorElement);
      if (!selectedLines) return;
      if (selectedLines.startLine === 1 && activeRowNumber >= selectedLines.endLine) return;
      const lines = coloredElement.querySelectorAll('.line');
      for (let i = 0; i < lines.length; i++) {
         const n = i + 1;
         if (n < selectedLines.startLine || n > selectedLines.endLine) continue;
         const partial = (n === selectedLines.startLine && selectedLines.partialStart) ||
                         (n === selectedLines.endLine && selectedLines.partialEnd);
         if (!partial) lines[i].classList.add('line-selected');
      }
   }

   function restoreSelectionAfterEdit(newText: string, savedLine: number, savedLines: SelectedRange | null) {
      const tn = editorElement.firstChild;
      if (!tn || tn.nodeType !== Node.TEXT_NODE || !tn.textContent) return;
      const nlines = newText.split('\n');
      const range = document.createRange();
      if (savedLines && savedLines.startLine !== savedLines.endLine) {
         let so = 0, eo = 0;
         const sl = Math.min(savedLines.startLine, nlines.length);
         const el = Math.min(savedLines.endLine, nlines.length);
         for (let i = 0; i < sl - 1; i++) so += nlines[i].length + 1;
         eo = so;
         for (let i = sl - 1; i < el - 1; i++) eo += nlines[i].length + 1;
         eo += nlines[el - 1].length;
         range.setStart(tn, Math.min(so, tn.textContent.length));
         range.setEnd(tn, Math.min(eo, tn.textContent.length));
      } else {
         const line = Math.min(savedLine, nlines.length);
         let offset = 0;
         for (let i = 0; i < line - 1; i++) offset += nlines[i].length + 1;
         offset = Math.min(offset, tn.textContent.length);
         range.setStart(tn, offset);
         range.collapse(true);
      }
      const wsel = window.getSelection();
      wsel?.removeAllRanges();
      wsel?.addRange(range);
   }

   function keyDownController(e: KeyboardEvent) {
       switch (e.key) {
          case "Tab": {
             e.preventDefault();
             const newText = e.shiftKey ? outdentLines(editorElement) : indentLines(editorElement);
             if (newText !== null) {
                const sel = window.getSelection();
                const savedLines = getSelectedLines(editorElement);
                undoer.pushManual(
                    editorElement.innerText,
                    getCurrentRow(),
                    savedLines?.startLine,
                    savedLines?.endLine
                );
                syncUndoState();
                const savedLine = sel ? getApproxLine(sel, editorElement) : 1;
                editorText = newText;
                editorElement.textContent = newText;
                undoer.setLastSnapshot(newText);
                requestAnimationFrame(() => {
                   restoreSelectionAfterEdit(newText, savedLine, savedLines);
                   beautifyCode();
                   updateSelectionIndicator();
                });
             } else if (!e.shiftKey) {
                undoer.pushManual(editorElement.innerText, getCurrentRow());
                syncUndoState();
                insertTab();
                undoer.setLastSnapshot(editorElement.innerText);
                beautifyCode();
             }
             break;
          }
          case "z":
             if (e.ctrlKey && !e.shiftKey && undoer.canUndo) { e.preventDefault(); applyUndoRedo(true); }
             break;
          case "Z":
             if (e.ctrlKey && e.shiftKey && undoer.canRedo) { e.preventDefault(); applyUndoRedo(false); }
             break;
          case "y":
          case "Y":
             if (e.ctrlKey && !e.shiftKey && undoer.canRedo) { e.preventDefault(); applyUndoRedo(false); }
             break;
         case "Enter":
            e.preventDefault();
            insertLineBreak(window.getSelection());
            var isChromium = !!window.CSS && window.CSS.supports && window.CSS.supports("(-webkit-appearance:none)");
            if (isChromium) { editorDynamicArea.scrollTop += 22; editorDynamicArea.scrollLeft = 0; }
            break;
         case "Escape":
            unselectText(window.getSelection());
            break;
         case "Backspace": {
            const sel = window.getSelection();
            if (sel && sel.rangeCount && sel.isCollapsed) {
               const range = sel.getRangeAt(0);
               const text = editorElement.innerText;
               const lines = text.split('\n');
                const currentLine = getActiveRowNumber(sel, editorElement);
                if (currentLine === lines.length && currentLine > 1 && range.startOffset === 1 && lines[currentLine - 1].length === 1) {
                   const parent = range.startContainer.parentElement;
                   if (parent && parent !== editorElement) {
                      e.preventDefault();
                      undoer.pushManual(editorElement.innerText, getCurrentRow());
                      syncUndoState();
                      parent.innerHTML = '&nbsp;';
                      undoer.setLastSnapshot(editorElement.innerText);
                     const child = parent.firstChild;
                     if (child) {
                        const r = document.createRange();
                        r.setStartAfter(child);
                        r.collapse(true);
                        sel.removeAllRanges();
                        sel.addRange(r);
                     }
                     beautifyCode();
                  }
               }
            }
            break;
         }
           case "ArrowUp":
          case "ArrowDown": {
             const sel = window.getSelection();
             if (!sel || sel.isCollapsed || e.shiftKey) break;
             const range = getSelectedLines(editorElement);
             if (!range) break;
             e.preventDefault();
             const lines = editorElement.innerText.split('\n');
             const isUp = e.key === "ArrowUp";
             let targetLine = isUp ? range.startLine - 1 : range.endLine + 1;
             const targetCol = isUp ? range.startCol : range.endCol;
             if (targetLine < 1) targetLine = range.startLine;
             if (targetLine > lines.length) targetLine = range.endLine;
             const lineText = lines[targetLine - 1] || '';
             const col = Math.min(targetCol, lineText.length);
             let offset = 0;
             for (let i = 0; i < targetLine - 1; i++) offset += lines[i].length + 1;
             offset += col;
             editorElement.textContent = editorElement.innerText;
             undoer.setLastSnapshot(editorElement.innerText);
             restoreCursorAt(offset);
             beautifyCode();
             updateSelectionIndicator();
             break;
          }
          default: break;
      }
   }

   function onPaste(e: ClipboardEvent) {
      e.preventDefault();
      const text = e.clipboardData?.getData('text/plain');
      if (!text) return;
      document.execCommand('insertHTML', false, text.replace(/\n/g, '<br>'));
      beautifyCode();
   }

   function keyUpController(e: KeyboardEvent) {
      if (e.key === "Escape" || e.key === "Enter" || e.key.startsWith("Arrow") || (e.ctrlKey && e.key === "a")) {
         beautifyCode();
         updateSelectionIndicator();
      }
   }

   function mouseEvent() {
      const row = getActiveRowNumber(window.getSelection(), editorElement);
      if (row >= 0 && row !== lastRowNumber) { activeRowNumber = row; beautifyCode(); }
   }

    function focusOnEditableArea() { editorElement.focus(); beautifyCode(); updateSelectionIndicator(); }

    function applyUndoRedo(isUndo: boolean) {
        const savedLines = getSelectedLines(editorElement);
        const currentText = editorElement.innerText;
        const currentRow = getCurrentRow();
        const cursorOff = getCursorOffset();
        const entry = isUndo
            ? undoer.undo(currentText, currentRow, savedLines?.startLine, savedLines?.endLine, cursorOff)
            : undoer.redo(currentText, currentRow, savedLines?.startLine, savedLines?.endLine, cursorOff);
        if (!entry) return;
        syncUndoState();
        editorText = entry.text;
        editorElement.textContent = entry.text;
        requestAnimationFrame(() => {
            if (entry.selStartLine && entry.selEndLine && entry.selStartLine !== entry.selEndLine) {
                restoreSelectionAfterEdit(entry.text, entry.activeRow, {
                    startLine: entry.selStartLine,
                    endLine: entry.selEndLine,
                    partialStart: false,
                    partialEnd: false,
                });
            } else if (entry.cursorOffset !== undefined && entry.cursorOffset >= 0) {
                restoreCursorAt(entry.cursorOffset);
            } else {
                restoreCursorAtLine(entry.activeRow);
            }
            beautifyCode();
        });
    }

    function syncUndoState() {
        canUndoStore.set(undoer.canUndo);
        canRedoStore.set(undoer.canRedo);
    }

    export function undoAction() { applyUndoRedo(true); }
    export function redoAction() { applyUndoRedo(false); }

    function restoreCursorAtLine(line: number) {
        const lines = editorElement.innerText.split('\n');
        const targetLine = Math.min(line, lines.length);
        let offset = 0;
        for (let i = 0; i < targetLine - 1; i++) offset += lines[i].length + 1;
        restoreCursorAt(offset);
    }

    function restoreCursorAt(offset: number) {
        const tn = editorElement.firstChild;
        if (!tn || tn.nodeType !== Node.TEXT_NODE || !tn.textContent) return;
        const clamped = Math.min(offset, tn.textContent.length);
        const range = document.createRange();
        range.setStart(tn, clamped);
        range.collapse(true);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
    }

    onMount(() => {
      editorDynamicArea = document.querySelector("#editor-dynamic-area")!;
      editorElement = document.querySelector("#editor-editable-area")!;
      coloredElement = document.querySelector("#editor-colored-area")!;
      focusOnEditableArea();
   });
</script>

<Commands bind:command={commandToInsert} />
<div class="editor-area" on:mouseup={focusOnEditableArea}>
   <div id="editor-dynamic-area">
      <div id="editor-colored-area" />
      <div
         id="editor-editable-area"
          contenteditable="true"
          spellcheck="false"
          on:input={handleInput}
          on:keydown={keyDownController}
         on:keyup={keyUpController}
         on:paste={onPaste}
         on:mousemove={mouseEvent}
         on:mouseup={updateSelectionIndicator}
         on:blur={beautifyCode}
      />
   </div>
</div>

<style lang="scss">
   @use "../styles/variables.scss" as *;

   .editor-area {
      position: relative;
      display: flex;
      flex-grow: 1;
      font-size: 16px;
      tab-size: 4;
      overflow: hidden;

      &::selection, ::-moz-selection { background: $editor-selection; color: $flowchart-background; }

      #editor-dynamic-area { width: 100%; height: 100%; position: relative; left: 0; overflow: auto; }

      #editor-colored-area {
         min-width: 100%; min-height: 22px; position: absolute; top: 0;
         pointer-events: none; white-space: pre; color: white;
      }

      #editor-editable-area {
         position: absolute; top: 0; left: 76px; right: 0;
         outline: 0px solid transparent; pointer-events: all; white-space: pre;
         line-height: 22px; color: transparent; caret-color: white;
      }
   }

   .line-num {
      display: inline-block; min-width: 36px; text-align: right;
      padding-right: 20px; color: $linenumbers-foreground; user-select: none;
   }
</style>
