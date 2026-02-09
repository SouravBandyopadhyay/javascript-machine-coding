/***********************************************************************
 * SECTION: Snake and Food Game (Low Level Design) - 
 * NOTE: Zomato LLD
 *
 * GOAL:
 * - Design a Snake game using proper OOP principles
 * - Single file, readable, interview-ready
 *
 * CORE REQUIREMENTS:
 * 1. Snake moves in a direction
 * 2. Snake grows when it eats food
 * 3. Game ends if snake hits wall or itself
 * 4. Board-based game (NxN)
 *
 * OOP PRINCIPLES USED:
 * - Abstraction
 * - Encapsulation
 * - Single Responsibility Principle (SRP)
 * - Composition
 ***********************************************************************/

/***********************************************************************
 * STEP 1: ENUMS (Domain Constants)
 *
 * OOP: Abstraction
 *
 * SPEAK:
 * "Enums represent fixed values and avoid invalid states."
 ***********************************************************************/

enum Direction {
  UP = "UP",
  DOWN = "DOWN",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
}

enum GameStatus {
  IN_PROGRESS = "IN_PROGRESS",
  GAME_OVER = "GAME_OVER",
}

/***********************************************************************
 * STEP 2: POSITION (Value Object)
 *
 * OOP:
 * - Encapsulation
 * - Immutability
 *
 * SPEAK:
 * "Position is a simple value object representing coordinates."
 ***********************************************************************/

class Position {
  constructor(
    public readonly row: number,
    public readonly col: number
  ) {}

  equals(other: Position): boolean {
    return this.row === other.row && this.col === other.col;
  }
}

/***********************************************************************
 * STEP 3: FOOD (Entity)
 *
 * OOP: Encapsulation
 *
 * SPEAK:
 * "Food has only one responsibility: occupy a position on the board."
 ***********************************************************************/

class Food {
  constructor(public position: Position) {}
}

/***********************************************************************
 * STEP 4: SNAKE (Core Domain Object)
 *
 * OOP:
 * - Encapsulation (body is private)
 * - SRP (snake manages movement & growth only)
 *
 * SPEAK:
 * "Snake owns its body and movement logic.
 *  No other class modifies snake internals."
 ***********************************************************************/

class Snake {
  private body: Position[];
  private direction: Direction = Direction.RIGHT;

  constructor(initialPosition: Position) {
    this.body = [initialPosition];
  }

  // Get current head position
  getHead(): Position {
    return this.body[0];
  }

  // Change direction (simple validation)
  changeDirection(direction: Direction): void {
    this.direction = direction;
  }

  // Move snake forward
  move(grow: boolean): void {
    const head = this.getHead();
    const newHead = this.getNextPosition(head);

    this.body.unshift(newHead); // add new head

    if (!grow) {
      this.body.pop(); // remove tail if not growing
    }
  }

  // Calculate next position based on direction
  private getNextPosition(head: Position): Position {
    switch (this.direction) {
      case Direction.UP:
        return new Position(head.row - 1, head.col);
      case Direction.DOWN:
        return new Position(head.row + 1, head.col);
      case Direction.LEFT:
        return new Position(head.row, head.col - 1);
      case Direction.RIGHT:
        return new Position(head.row, head.col + 1);
    }
  }

  // Check if snake collides with itself
  hasSelfCollision(): boolean {
    const [head, ...body] = this.body;
    return body.some(segment => segment.equals(head));
  }

  // Expose body for board rendering / collision checks
  getBody(): Position[] {
    return this.body;
  }
}

/***********************************************************************
 * STEP 5: BOARD (Game Area)
 *
 * OOP:
 * - Encapsulation
 * - SRP (board only knows boundaries)
 *
 * SPEAK:
 * "Board validates positions and represents game boundaries."
 ***********************************************************************/

class Board {
  constructor(private readonly size: number) {}

  isOutside(position: Position): boolean {
    return (
      position.row < 0 ||
      position.col < 0 ||
      position.row >= this.size ||
      position.col >= this.size
    );
  }
}

/***********************************************************************
 * STEP 6: FOOD GENERATOR (Helper / Utility)
 *
 * OOP:
 * - SRP
 *
 * SPEAK:
 * "Food generation is isolated so game logic stays clean."
 ***********************************************************************/

class FoodGenerator {
  static generate(boardSize: number, snakeBody: Position[]): Food {
    while (true) {
      const position = new Position(
        Math.floor(Math.random() * boardSize),
        Math.floor(Math.random() * boardSize)
      );

      const isOnSnake = snakeBody.some(segment =>
        segment.equals(position)
      );

      if (!isOnSnake) {
        return new Food(position);
      }
    }
  }
}

/***********************************************************************
 * STEP 7: GAME (Orchestrator)
 *
 * OOP:
 * - Composition (Game has Board, Snake, Food)
 * - SRP (controls flow, not internals)
 *
 * SPEAK:
 * "Game orchestrates interactions and controls lifecycle."
 ***********************************************************************/

class SnakeGame {
  private status: GameStatus = GameStatus.IN_PROGRESS;
  private food: Food;

  constructor(
    private readonly board: Board,
    private readonly snake: Snake
  ) {
    this.food = FoodGenerator.generate(
      this.getBoardSize(),
      this.snake.getBody()
    );
  }

  // Advance game by one step
  moveSnake(direction: Direction): void {
    if (this.status === GameStatus.GAME_OVER) {
      throw new Error("Game is already over");
    }

    this.snake.changeDirection(direction);

    const nextHead = this.getNextHeadPosition();

    // Wall collision
    if (this.board.isOutside(nextHead)) {
      this.endGame("Snake hit the wall");
      return;
    }

    // Check if food is eaten
    const eatsFood = nextHead.equals(this.food.position);

    this.snake.move(eatsFood);

    // Self collision
    if (this.snake.hasSelfCollision()) {
      this.endGame("Snake collided with itself");
      return;
    }

    // Generate new food if eaten
    if (eatsFood) {
      this.food = FoodGenerator.generate(
        this.getBoardSize(),
        this.snake.getBody()
      );
    }

    this.printState();
  }

  private getNextHeadPosition(): Position {
    const head = this.snake.getHead();
    return new Position(head.row, head.col); // temp holder
  }

  private getBoardSize(): number {
    // hacky but acceptable for LLD interview
    return (this.board as any).size;
  }

  private endGame(reason: string): void {
    this.status = GameStatus.GAME_OVER;
    console.log("GAME OVER:", reason);
  }

  // Debug / demo output
  private printState(): void {
    console.log("Snake:", this.snake.getBody());
    console.log("Food:", this.food.position);
    console.log("------------");
  }
}

/***********************************************************************
 * STEP 8: DEMO / DRIVER CODE
 *
 * SPEAK:
 * "This shows how components are wired together."
 ***********************************************************************/

const board = new Board(5);
const snake = new Snake(new Position(2, 2));
const game = new SnakeGame(board, snake);

// Simulated moves
game.moveSnake(Direction.RIGHT);
game.moveSnake(Direction.DOWN);
game.moveSnake(Direction.LEFT);
game.moveSnake(Direction.UP);
