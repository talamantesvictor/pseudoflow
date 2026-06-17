export interface UndoEntry {
    text: string;
    activeRow: number;
    selStartLine?: number;
    selEndLine?: number;
    cursorOffset?: number;
}

const MAX_UNDO = 200;

export class EditorUndo {
    private undoStack: UndoEntry[] = [];
    private redoStack: UndoEntry[] = [];
    private lastSnapshot: string = '';
    private batching: boolean = false;

    snapshot(text: string, activeRow: number, cursorOffset?: number): void {
        if (text === this.lastSnapshot) return;
        if (this.batching) {
            this.lastSnapshot = text;
            return;
        }
        this.pushEntry(this.lastSnapshot, activeRow, undefined, undefined, cursorOffset);
        this.lastSnapshot = text;
    }

    pushManual(text: string, activeRow: number, selStartLine?: number, selEndLine?: number, cursorOffset?: number): void {
        this.pushEntry(text, activeRow, selStartLine, selEndLine, cursorOffset);
    }

    setLastSnapshot(text: string): void {
        this.lastSnapshot = text;
    }

    beginBatch(): void {
        this.batching = true;
    }

    endBatch(finalText: string): void {
        this.batching = false;
        this.lastSnapshot = finalText;
    }

    undo(currentText: string, currentRow: number, selStartLine?: number, selEndLine?: number, cursorOffset?: number): UndoEntry | null {
        if (this.undoStack.length === 0) return null;
        this.redoStack.push({ text: currentText, activeRow: currentRow, selStartLine, selEndLine, cursorOffset });
        const entry = this.undoStack.pop()!;
        this.lastSnapshot = entry.text;
        return entry;
    }

    redo(currentText: string, currentRow: number, selStartLine?: number, selEndLine?: number, cursorOffset?: number): UndoEntry | null {
        if (this.redoStack.length === 0) return null;
        this.undoStack.push({ text: currentText, activeRow: currentRow, selStartLine, selEndLine, cursorOffset });
        const entry = this.redoStack.pop()!;
        this.lastSnapshot = entry.text;
        return entry;
    }

    get canUndo(): boolean { return this.undoStack.length > 0; }
    get canRedo(): boolean { return this.redoStack.length > 0; }

    reset(): void {
        this.undoStack = [];
        this.redoStack = [];
        this.lastSnapshot = '';
    }

    private pushEntry(text: string, activeRow: number, selStartLine?: number, selEndLine?: number, cursorOffset?: number): void {
        if (this.undoStack.length >= MAX_UNDO) this.undoStack.shift();
        this.undoStack.push({ text, activeRow, selStartLine, selEndLine, cursorOffset });
        this.redoStack = [];
    }
}
