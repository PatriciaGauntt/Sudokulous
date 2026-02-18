import { Component } from '@angular/core';

@Component({
  selector: 'app-board',
  imports: [],
  templateUrl: './board.html',
  styleUrl: './board.css',
})
export class Board {
  grid: number[][] = [];

  constructor() {
    this.initializeGrid();
  }

  initializeGrid() {
    this.grid = Array.from({ length: 9 }, () =>
      Array.from({ length: 9 }, () => 0)
    );
  }
}
