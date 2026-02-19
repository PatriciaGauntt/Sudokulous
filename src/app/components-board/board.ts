import { Component } from '@angular/core';

@Component({
  selector: 'app-board',
  imports: [],
  templateUrl: './board.html',
  styleUrl: './board.css',
})
export class Board {

  // 🔹 All available puzzles
  puzzles: number[][][] = [
    [
      [5,3,0,0,7,0,0,0,0],
      [6,0,0,1,9,5,0,0,0],
      [0,9,8,0,0,0,0,6,0],
      [8,0,0,0,6,0,0,0,3],
      [4,0,0,8,0,3,0,0,1],
      [7,0,0,0,2,0,0,0,6],
      [0,6,0,0,0,0,2,8,0],
      [0,0,0,4,1,9,0,0,5],
      [0,0,0,0,8,0,0,7,9]
    ],
    [
      [0,0,0,2,6,0,7,0,1],
      [6,8,0,0,7,0,0,9,0],
      [1,9,0,0,0,4,5,0,0],
      [8,2,0,1,0,0,0,4,0],
      [0,0,4,6,0,2,9,0,0],
      [0,5,0,0,0,3,0,2,8],
      [0,0,9,3,0,0,0,7,4],
      [0,4,0,0,5,0,0,3,6],
      [7,0,3,0,1,8,0,0,0]
    ]
  ];

  // 🔹 Currently selected puzzle
  puzzle: number[][] = [];

  // 🔹 Player grid (mutable copy)
  grid: number[][] = [];

  selectedRow = 0;
  selectedCol = 0;

  private lastIndex = -1;
  isComplete = false;
  invalidCells: Set<string> = new Set();
  initialPuzzle: number[][] = [];


  constructor() {
    this.loadPuzzle();
  }

  generateFullBoard(): number[][] {
    const board = Array.from({ length: 9 }, () => Array(9).fill(0));

    this.fillBoard(board);

    return board;
  }

  private fillBoard(board: number[][]): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {

          const numbers = this.shuffle([1,2,3,4,5,6,7,8,9]);

          for (let num of numbers) {
            if (this.isSafe(board, row, col, num)) {
              board[row][col] = num;

              if (this.fillBoard(board)) {
                return true;
              }

              board[row][col] = 0;
            }
          }

          return false;
        }
      }
    }

    return true;
  }

  private isSafe(board: number[][], row: number, col: number, num: number): boolean {

    // Row
    for (let c = 0; c < 9; c++) {
      if (board[row][c] === num) return false;
    }

    // Column
    for (let r = 0; r < 9; r++) {
      if (board[r][col] === num) return false;
    }

    // 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;

    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if (board[r][c] === num) return false;
      }
    }

    return true;
  }
  private shuffle(array: number[]): number[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // 🔹 Load random puzzle
  loadPuzzle() {
    const fullBoard = this.generateFullBoard();

    // Keep full solution
    this.puzzle = fullBoard.map(row => [...row]);

    // Create playable board by removing numbers
    this.initialPuzzle = this.removeNumbers(fullBoard, 45); // 45 removals = medium difficulty
                                                            // 35 removals = easy difficulty
                                                            // 55 removals = hard difficulty
                                                            // 60+ removals = evil difficulty
    this.grid = this.initialPuzzle.map(row => [...row]);

    this.invalidCells.clear();
    this.isComplete = false;
  }

  private removeNumbers(board: number[][], removals: number): number[][] {
    const puzzle = board.map(row => [...row]);

    let count = 0;

    while (count < removals) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);

      if (puzzle[row][col] !== 0) {
        puzzle[row][col] = 0;
        count++;
      }
    }

    return puzzle;
  }

  handleNumberInput(event: KeyboardEvent) {
    const key = event.key;

    // Allow digits 1–9
    if (/[1-9]/.test(key)) return;

    // Allow Backspace (handled in keydown)
    if (key === 'Backspace') return;

    // Block everything else
    event.preventDefault();
  }

  isEditable(row: number, col: number): boolean {
    return this.initialPuzzle[row][col] === 0;
  }


  selectCell(row: number, col: number) {
    this.selectedRow = row;
    this.selectedCol = col;
  }

  updateCell(row: number, col: number, value: string) {
    if (!this.isEditable(row, col)) return;

    // Allow empty OR 1–9
    if (!/^[1-9]?$/.test(value)) {
      return;
    }

    const key = `${row}-${col}`;

    if (value === '') {
      this.grid[row][col] = 0;
      this.invalidCells.delete(key);
    } else {
      const num = Number(value);
      this.grid[row][col] = num;

      if (!this.isValid(row, col, num)) {
        this.invalidCells.add(key);
      } else {
        this.invalidCells.delete(key);
      }
    }

    this.isComplete = this.isPuzzleComplete();
  }


  handleKey(event: KeyboardEvent) {
    const key = event.key;

    // Block invalid characters
    if (
      !/[1-9]/.test(key) &&
      key !== 'Backspace' &&
      key !== 'Delete' &&
      !key.startsWith('Arrow') &&
      key !== 'Tab'
    ) {
      event.preventDefault();
      return;
    }

    // Arrow navigation
    if (key.startsWith('Arrow')) {
      event.preventDefault();

      switch (key) {
        case 'ArrowUp': this.moveSelection(-1, 0); break;
        case 'ArrowDown': this.moveSelection(1, 0); break;
        case 'ArrowLeft': this.moveSelection(0, -1); break;
        case 'ArrowRight': this.moveSelection(0, 1); break;
      }

      this.focusSelectedCell();
    }
  }



  moveSelection(rowOffset: number, colOffset: number) {
    this.selectedRow = (this.selectedRow + rowOffset + 9) % 9;
    this.selectedCol = (this.selectedCol + colOffset + 9) % 9;
  }

  focusSelectedCell() {
    const id = `cell-${this.selectedRow}-${this.selectedCol}`;
    const element = document.getElementById(id) as HTMLInputElement;
    element?.focus();
  }

  isValid(row: number, col: number, value: number): boolean {
    if (value === 0) return true;

    // Check row
    for (let c = 0; c < 9; c++) {
      if (c !== col && this.grid[row][c] === value) {
        return false;
      }
    }

    // Check column
    for (let r = 0; r < 9; r++) {
      if (r !== row && this.grid[r][col] === value) {
        return false;
      }
    }

    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;

    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if ((r !== row || c !== col) && this.grid[r][c] === value) {
          return false;
        }
      }
    }

    return true;
  }

  isPuzzleComplete(): boolean {
    for (let row of this.grid) {
      if (row.includes(0)) {
        return false;
      }
    }

    if (this.invalidCells.size > 0) {
      return false;
    }

    return true;
  }
}
