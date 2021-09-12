import React, { useEffect, useMemo, useRef, useState } from "react";
import Cell from "./Cell";

const App: React.FC = () => {
  const [isChecked, setIsChecked] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let sizeFromLS = localStorage.getItem("sizes");
  const COLS = sizeFromLS !== null ? parseInt(sizeFromLS) : 15;
  const ROWS = sizeFromLS !== null ? parseInt(sizeFromLS) : 15;
  const FPS = 1000 / 30;
  const CANVAS_WIDTH = 640;
  const CANVAS_HEIGHT = 640;
  let grid: Cell[][] = useMemo(() => new Array(COLS), [COLS]);
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
      grid[i][j] = new Cell(i, j, isChecked);
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

  const heuristic = (a: Cell, b: Cell): number => {
    let d = Math.abs(a.i - b.i) + Math.abs(a.j - b.j);
    return d;
  };

  const findPath = () => {
    isStarted = true;
  };

  let tempSize: number;

  const handleSquareSize = (e: React.ChangeEvent<HTMLInputElement>) => {
    tempSize = parseInt(e.target.value);
  };

  const handleSaveSizes = (): false | void => {
    if (isNaN(tempSize)) {
      alert("Invalid Size");
      return false;
    }
    localStorage.setItem("sizes", tempSize.toString());
    window.location.reload();
  };

  const handleRandomObstacles = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    let newEnd = endRef.current as Cell;
    let newStart = startRef.current as Cell;
    let path: Cell[] = [];
    let isStartNodeCount = 0;
    let gameInt: NodeJS.Timer;

    if (canvas) {
      let TILE_WIDTH = Math.floor(CANVAS_WIDTH / COLS);
      let TILE_HEIGHT = Math.floor(CANVAS_HEIGHT / ROWS);

      const context = canvas.getContext("2d");
      canvas.addEventListener("click", function detectStartNode(e) {
        if (
          !grid[Math.floor(e.offsetX / TILE_WIDTH)][
            Math.floor(e.offsetY / TILE_WIDTH)
          ].wall
        ) {
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
          } else {
            grid[Math.floor(e.offsetX / TILE_WIDTH)][
              Math.floor(e.offsetY / TILE_WIDTH)
            ].wall = true;
          }
        }
      });

      gameInt = setInterval(() => {
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

              if (!closedList.includes(neighbor) && !neighbor.wall) {
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
            clearInterval(gameInt);
            alert("No solution");
            return;
          }
        }

        // grid cizim
        for (let i = 0; i < COLS; i++) {
          for (let j = 0; j < ROWS; j++) {
            grid[i][j].draw(context, "#fff", TILE_WIDTH, TILE_HEIGHT);
          }
        }

        for (let i = 0; i < closedList.length; i++) {
          closedList[i].draw(context, "purple", TILE_WIDTH, TILE_HEIGHT);
        }
      }, FPS);
    }
  }, [FPS, grid, openList, closedList, isStarted, COLS, ROWS, isChecked]);

  return (
    <div className="App">
      <div id="control">
        <div id="setSquare">
          <label htmlFor="square">Set Rows and Cols</label>
          <input
            onChange={handleSquareSize}
            type="text"
            placeholder="e.g 20"
            name="square"
            id="square"
          />
          <button type="submit" id="saveBtn" onClick={handleSaveSizes}>
            Save
          </button>
        </div>
        <div
          id="setRandomObstacles"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <input
            onChange={handleRandomObstacles}
            type="checkbox"
            name="obstacle"
            id="obstacle"
          />
          <p style={{ margin: 0, color: "white" }}>random obstacles</p>
        </div>
        <button id="startGame" onClick={findPath}>
          Start
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
      ></canvas>
    </div>
  );
};

export default App;
