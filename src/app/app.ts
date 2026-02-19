import { Component, signal, ViewChild } from '@angular/core';
import { Board } from './components-board/board';

@Component({
  selector: 'app-root',
  imports: [Board],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  protected readonly title = signal('Sudokulous');

  @ViewChild(Board)
  boardComponent!: Board;

  newGame() {
    this.boardComponent.loadPuzzle();
  }
}

