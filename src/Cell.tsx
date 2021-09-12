export default class Cell {
  i: number;
  j: number;
  f: number;
  g: number;
  h: number;
  neighbors: Cell[];
  previous: Cell | undefined;
  isStartNode: boolean;
  isEndNode: boolean;
  wall: boolean;

  constructor(i: number, j: number) {
    this.i = i;
    this.j = j;
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.neighbors = [];
    this.previous = undefined;
    this.isStartNode = false;
    this.isEndNode = false;
    this.wall = false;

    let randomwall = Math.random();
    if (randomwall < 0.4) {
      this.wall = true;
    }
  }

  addneighbors(grid: Cell[][], COLS: number, ROWS: number) {
    let i = this.i;
    let j = this.j;
    if (i < COLS - 1) {
      this.neighbors.push(grid[i + 1][j]);
    }
    if (i > 0) {
      this.neighbors.push(grid[i - 1][j]);
    }
    if (j < ROWS - 1) {
      this.neighbors.push(grid[i][j + 1]);
    }
    if (j > 0) {
      this.neighbors.push(grid[i][j - 1]);
    }

    // DIAGONAL

    if (i > 0 && j > 0) {
      this.neighbors.push(grid[i - 1][j - 1]); // down left
    }

    if (i < COLS - 1 && j > 0) {
      this.neighbors.push(grid[i + 1][j - 1]); // up right
    }

    if (i > 0 && j < ROWS - 1) {
      this.neighbors.push(grid[i - 1][j + 1]); // up left
    }

    if (i < COLS - 1 && j < ROWS - 1) {
      this.neighbors.push(grid[i + 1][j + 1]); // down right
    }
  }

  draw(
    ctx: CanvasRenderingContext2D | null,
    color: string,
    tile_width: number,
    tile_height: number
  ) {
    if (ctx) {
      if (this.isStartNode) {
        ctx.fillStyle = "green";
      } else if (this.isEndNode) {
        ctx.fillStyle = "red";
      } else if (this.wall) {
        ctx.fillStyle = "black";
      } else {
        ctx.fillStyle = color;
      }
      ctx.fillRect(
        this.i * tile_width,
        this.j * tile_height,
        tile_width - 1,
        tile_height - 1
      );
    }
  }
}
