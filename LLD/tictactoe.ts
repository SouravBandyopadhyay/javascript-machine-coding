/***********************************************************************
 * SECTION: Tic Tac Toe Game (Low Level Design)
 *
 * GOAL:
 * - Design a clean, object-oriented Tic Tac Toe game
 * - Single file
 * - Easy to explain while coding
 *
 * CORE REQUIREMENTS:
 * 1. 2 players
 * 2. NxN board (default 3x3)
 * 3. Players take turns
 * 4. Detect win or draw
 * 5. Stop game after win/draw
 *
 * DESIGN PRINCIPLES USED:
 * - Abstraction
 * - Encapsulation
 * - Single Responsibility Principle (SRP)
 * - Composition
 ***********************************************************************/

/***********************************************************************
 * STEP 1: ENUMS (Fixed Domain Values)
 *
 * OOP: Abstraction
 *
 * SPEAK:
 * "Enums help restrict the system to valid values only
 *  and avoid magic strings."
 ***********************************************************************/

enum GameSymbol {
  X = "X",
  O = "O",
  EMPTY = "_",
}

enum GameStatus {
  IN_PROGRESS = "IN_PROGRESS",
  WON = "WON",
  DRAW = "DRAW",
}

/***********************************************************************
 * STEP 2: PLAYER (Entity)
 *
 * OOP: Encapsulation
 *
 * SPEAK:
 * "Player represents a participant in the game.
 *  It holds identity and symbol only."
 ***********************************************************************/

class Player {
  constructor(
    public readonly name: string,
    public readonly symbol: GameSymbol
  ) {}
}

/***********************************************************************
 * STEP 3: BOARD (Core Domain Object)
 *
 * OOP:
 * - Encapsulation (grid hidden)
 * - SRP (board manages board state only)
 *
 * SPEAK:
 * "Board owns the grid and all board-related operations.
 *  External classes cannot manipulate grid directly."
 ***********************************************************************/

class Board {
  private grid: GameSymbol[][];

  constructor(private readonly size: number = 3) {
    this.grid = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => GameSymbol.EMPTY)
    );
  }

  // Place a symbol at given position
  placeGameSymbol(row: number, col: number, symbol: GameSymbol): boolean {
    if (!this.isValidMove(row, col)) return false;

    this.grid[row][col] = symbol;
    return true;
  }

  // Validate move boundaries and emptiness
  private isValidMove(row: number, col: number): boolean {
    return (
      row >= 0 &&
      row < this.size &&
      col >= 0 &&
      col < this.size &&
      this.grid[row][col] === GameSymbol.EMPTY
    );
  }

  // Check if board is completely filled
  isFull(): boolean {
    return this.grid.every(row =>
      row.every(cell => cell !== GameSymbol.EMPTY)
    );
  }

  // Expose read-only grid for evaluation
  getGrid(): GameSymbol[][] {
    return this.grid;
  }

  // Display board (for demo / debugging)
  printBoard(): void {
    for (const row of this.grid) {
      console.log(row.join(" | "));
    }
    console.log("-------------");
  }
}

/***********************************************************************
 * STEP 4: WINNING STRATEGY
 *
 * OOP:
 * - Abstraction
 * - Open-Closed Principle (OCP)
 *
 * SPEAK:
 * "Winning logic is abstracted so that
 *  rules can evolve without touching game logic."
 ***********************************************************************/

interface WinningStrategy {
  checkWinner(board: Board, symbol: GameSymbol): boolean;
}

/***********************************************************************
 * STEP 5: STANDARD WINNING STRATEGY (3x3)
 *
 * OOP:
 * - Polymorphism
 * - Strategy Pattern
 ***********************************************************************/

class StandardWinningStrategy implements WinningStrategy {
  checkWinner(board: Board, symbol: GameSymbol): boolean {
    const grid = board.getGrid();
    const size = grid.length;

    // Check rows
    for (let i = 0; i < size; i++) {
      if (grid[i].every(cell => cell === symbol)) return true;
    }

    // Check columns
    for (let j = 0; j < size; j++) {
      let win = true;
      for (let i = 0; i < size; i++) {
        if (grid[i][j] !== symbol) {
          win = false;
          break;
        }
      }
      if (win) return true;
    }

    // Check main diagonal
    if (grid.every((row, i) => row[i] === symbol)) return true;

    // Check anti-diagonal
    if (grid.every((row, i) => row[size - i - 1] === symbol)) return true;

    return false;
  }
}

/***********************************************************************
 * STEP 6: GAME (Orchestrator)
 *
 * OOP:
 * - Composition (Game has Board, Players, Strategy)
 * - SRP (Game controls flow, not rules)
 *
 * SPEAK:
 * "Game is the orchestrator.
 *  It controls turn order and delegates logic."
 ***********************************************************************/

class TicTacToeGame {
  private currentPlayerIndex = 0;
  private status: GameStatus = GameStatus.IN_PROGRESS;

  constructor(
    private readonly players: Player[],
    private readonly board: Board,
    private readonly winningStrategy: WinningStrategy
  ) {}

  // Make a move for current player
  makeMove(row: number, col: number): void {
    if (this.status !== GameStatus.IN_PROGRESS) {
      throw new Error("Game has already ended");
    }

    const currentPlayer = this.players[this.currentPlayerIndex];

    const success = this.board.placeGameSymbol(
      row,
      col,
      currentPlayer.symbol
    );

    if (!success) {
      throw new Error("Invalid move");
    }

    this.board.printBoard();

    // Check win
    if (this.winningStrategy.checkWinner(this.board, currentPlayer.symbol)) {
      this.status = GameStatus.WON;
      console.log(`Winner: ${currentPlayer.name}`);
      return;
    }

    // Check draw
    if (this.board.isFull()) {
      this.status = GameStatus.DRAW;
      console.log("Game ended in a draw");
      return;
    }

    // Switch turn
    this.currentPlayerIndex =
      (this.currentPlayerIndex + 1) % this.players.length;
  }
}

/***********************************************************************
 * STEP 7: DEMO / DRIVER CODE
 *
 * SPEAK:
 * "This shows how all components work together."
 ***********************************************************************/

// Create players
const player1 = new Player("Alice", GameSymbol.X);
const player2 = new Player("Bob", GameSymbol.O);

// Create board and strategy
const board = new Board(3);
const winningStrategy = new StandardWinningStrategy();

// Create game
const game = new TicTacToeGame(
  [player1, player2],
  board,
  winningStrategy
);

// Simulate moves
game.makeMove(0, 0); // Alice
game.makeMove(1, 1); // Bob
game.makeMove(0, 1); // Alice
game.makeMove(2, 2); // Bob
game.makeMove(0, 2); // Alice wins
