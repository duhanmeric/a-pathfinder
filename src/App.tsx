import React, { useEffect, useMemo, useRef } from "react";

class Cell {
  i: number;
  j: number;
  f: number;
  g: number;
  h: number;
  neighbors: Cell[];
  previous: Cell | undefined;
  isStartNode: boolean;
  isEndNode: boolean;

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
      this.neighbors.push(grid[i - 1][j - 1]); // up left
    }

    if (i < COLS - 1 && j > 0) {
      this.neighbors.push(grid[i + 1][j - 1]); // down right
    }

    if (i > 0 && j < ROWS - 1) {
      this.neighbors.push(grid[i - 1][j + 1]); // up right
    }

    if (i < COLS - 1 && j < ROWS - 1) {
      this.neighbors.push(grid[i + 1][j + 1]); // up right
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

const App: React.FC = () => {
  const COLS = 25;
  const ROWS = 25;
  const FPS = 1000 / 60;
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 400;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let gameInt = useRef<number | null>(null);
  let grid: Cell[][] = useMemo(() => new Array(COLS), []);
  let openList: Cell[] = useMemo(() => [], []);
  let closedList: Cell[] = useMemo(() => [], []);
  let endRef = useRef<Cell>();
  let startRef = useRef<Cell>();
  let isStarted = false;

  for (let i = 0; i < COLS; i++) {
    grid[i] = new Array<Cell>(ROWS);
  }

  for (let i = 0; i < COLS; i++) {
    for (let j = 0; j < ROWS; j++) {
      grid[i][j] = new Cell(i, j);
    }
  }

  for (let i = 0; i < COLS; i++) {
    for (let j = 0; j < ROWS; j++) {
      grid[i][j].addneighbors(grid, COLS, ROWS);
    }
  }

  const removeFromArray = (arr: Cell[], el: Cell) => {
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i] === el) {
        arr.splice(i, 1);
      }
    }
  };

  const heuristic = (a: Cell, b: Cell) => {
    let d = Math.abs(a.i - b.i) + Math.abs(a.j - b.j);
    return d;
  };

  const findPath = () => {
    isStarted = true;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    let newEnd = endRef.current as Cell;
    let newStart = startRef.current as Cell;
    let path: Cell[] = [];
    let isStartNodeCount = 0;

    if (canvas) {
      let TILE_WIDTH = Math.floor(CANVAS_WIDTH / COLS);
      let TILE_HEIGHT = Math.floor(CANVAS_HEIGHT / ROWS);

      const context = canvas.getContext("2d");
      canvas.addEventListener("click", function detectStartNode(e) {
        isStartNodeCount++;
        if (isStartNodeCount === 1) {
          grid[Math.floor(e.offsetX / TILE_WIDTH)][
            Math.floor(e.offsetY / TILE_WIDTH)
          ].isStartNode = true;
          newStart =
            grid[Math.floor(e.offsetX / TILE_WIDTH)][
              Math.floor(e.offsetY / TILE_WIDTH)
            ];
          openList.push(newStart);
        } else if (isStartNodeCount === 2) {
          grid[Math.floor(e.offsetX / TILE_WIDTH)][
            Math.floor(e.offsetY / TILE_WIDTH)
          ].isEndNode = true;
          newEnd =
            grid[Math.floor(e.offsetX / TILE_WIDTH)][
              Math.floor(e.offsetY / TILE_WIDTH)
            ];
        }
      });
      gameInt.current = window.setInterval(() => {
        if (isStarted && newStart && newEnd) {
          if (openList.length > 0) {
            let winner = 0;

            for (let i = 0; i < openList.length; i++) {
              if (openList[i].f < openList[winner].f) {
                winner = i;
              }
            }

            let current = openList[winner];

            if (openList[winner] === newEnd) {
              let temp = current;
              path.push(temp);
              while (temp.previous) {
                path.push(temp.previous);
                temp = temp.previous;
              }
            } else {
              removeFromArray(openList, current);
              closedList.push(current);
            }

            let neighbors = current.neighbors;

            for (let i = 0; i < neighbors.length; i++) {
              let neighbor = neighbors[i];

              if (!closedList.includes(neighbor)) {
                let tempG = current.g + 1;

                if (openList.includes(neighbor)) {
                  if (tempG < neighbor.g) {
                    neighbor.g = tempG;
                  }
                } else {
                  neighbor.g = tempG;
                  openList.push(neighbor);
                }

                neighbor.h = heuristic(neighbor, newEnd);
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.previous = current;
              }
            }
          } else {
            // no solution
            console.log("no solution");
          }
        }

        // grid cizim
        for (let i = 0; i < COLS; i++) {
          for (let j = 0; j < ROWS; j++) {
            grid[i][j].draw(context, "#fff", TILE_WIDTH, TILE_HEIGHT);
          }
        }

        if (isStarted) {
          for (let i = 0; i < path.length; i++) {
            path[i].draw(context, "#0000FF", TILE_WIDTH, TILE_HEIGHT);
          }
        }
        for (let i = 0; i < openList.length; i++) {
          openList[i].draw(context, "#00FF00", TILE_WIDTH, TILE_HEIGHT);
        }

        for (let i = 0; i < closedList.length; i++) {
          closedList[i].draw(context, "#FF0000", TILE_WIDTH, TILE_HEIGHT);
        }
      }, FPS);
    }
  }, [FPS, grid, openList, closedList, isStarted]);

  return (
    <div className="App">
      <button onClick={findPath}>Start</button>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
      ></canvas>
    </div>
  );
};

export default App;
