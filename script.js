var board;
var gameState;

function main() {
  class GameState {
    constructor() {
      this.paused = true;
      this.speed = 1;
    }
    setSpeed(speed) {
      if (!speed <= 0) {
        this.speed = speed;
      }
      return this.speed;
    }
    start(speed = this.speed) {
      //optional speed parameter
      this.speed = speed;
      //console.log("starting");
      //console.log(this.speed);
      //console.log(this.paused)
      this.paused = false;
      this.gameClock();
      return true;
    }

    stop() {
      //console.log("stopping");
      this.paused = true;
      return true;
    }

    gameClock = async (speed = this.speed) => {
      //optional speed parameter

      while (this.paused == false) {
        board.updateCells();
        board.updateDisplay();
        await new Promise((r) => setTimeout(r, 1000 / speed));
        //console.log("ping");
      }
    }
  }

  function initHTML(rows, columns) {
    var container = document.querySelector(".container");
    var pauseButton = document.querySelector(".pause-button");
    pauseButton.addEventListener("click", (e) => {
     // var btn = e.target;
      //console.log(btn.classList)
      if (pauseButton.classList.contains("toggled")) {
        pauseButton.textContent = "▐▐";
        pauseButton.classList.toggle("toggled");
        gameState.start();
      } else {
        pauseButton.textContent = "▶";
        pauseButton.classList.toggle("toggled");
        gameState.stop();
      }
    });

    container.style["grid-template-rows"] = `repeat(${rows}, 50px)`;
    container.style["grid-template-columns"] = `repeat(${columns}, 50px)`;

    for (var i = 0; i < columns; i++) {
      for (var o = 0; o < rows; o++) {
        var cell = document.createElement("div");
        cell.classList.add("cell");
        cell.id = `${i};${o}`;
        cell.addEventListener("click", (e) => {
          var cell = e.target;
          var position = cell.id.split(";");
          board.data[position[0]][position[1]].changeState();

          board.updateDisplay();
        });

        container.appendChild(cell);
      }
    }
  }
  class Cell {
    constructor(row, col) {
      this.position = [row, col];
      this.alive = false;
    }
    changeState() {
      //console.log("alive before: ", this.alive)
      this.alive = !this.alive;
      // console.log("alive after: ", this.alive)
      if (this.alive) {
        board.checkCells.push(this.position);
      }
      return true;
    }
    returnNearbyCells() {
      var cells = [];
      var maxWidth = board.rows - 1;
      var maxHeight = board.columns - 1;
      for (var row = -1; row < 2; row++)
        for (var col = -1; col < 2; col++) {
          var cell = [row + this.position[0], col + this.position[1]];

          if (cell[0] < 0) {
            cell[0] = maxWidth;
          }
          if (cell[1] < 0) {
            cell[1] = maxHeight;
          }
          if (cell[0] > board.rows - 1) {
            cell[0] = 0;
          }

          if (cell[1] > board.columns - 1) {
            cell[1] = 0;
          }
          if (
            !(this.position[0] == cell[0] && this.position[1] == cell[1]) &&
            !cells.includes(board.data[cell[0]][cell[1]])
          ) {
            cells.push(board.data[cell[0]][cell[1]]);
          }
        }
      //console.log(cells)
      return cells;
    }
  }

  class Board {
    constructor(rows = 25, columns = 25) {
      this.columns = columns;
      this.rows = rows;
      this.checkCells = [];
      this.data = [];
      for (var i = 0; i < this.rows; i++) {
        this.data[i] = {};
        for (var o = 0; o < this.columns; o++) {
          this.data[i][o] = new Cell(i, o);
        }
      }
    }
    checkRules(cell) {
      var aliveNeighbors = 0;
      var nearbyCells = cell.returnNearbyCells();
      for (var i = 0; i < nearbyCells.length; i++) {
        //console.log(cell);
        //console.log(nearbyCells)

        if (nearbyCells[i].alive) {
          aliveNeighbors++;
        }
      }
      if (cell.alive) {
        if (aliveNeighbors < 2 || aliveNeighbors > 3) {
          return [false, cell];
        } else {
          return [true, cell];
        }
      } else if (!cell.alive) {
        if (aliveNeighbors == 3) {
          return [true, cell];
        } else {
          return [false, cell];
        }
      }
      return "fail";
    }

    updateCells() {
      var cells = this.checkCells;
      var actions = []; // [false, [position]], [true, position] false kill true revive
      var checkedCells = [];

      for (var i = 0; i < cells.length; i++) {
        // for cell
        var cell = this.data[cells[i][0]][cells[i][1]];
        var nearbyCells = cell.returnNearbyCells();
        for (var o = 0; o < nearbyCells.length; o++) {
          //for nearby cell
          if (!checkedCells.includes(nearbyCells[o])) {
            actions.push(this.checkRules(nearbyCells[o]));

            checkedCells.push(nearbyCells[o]);
          }
        }
        if (!checkedCells.includes(cell)) {
          actions.push(this.checkRules(cell));
          checkedCells.push(cell);
        }
      }
      //console.log(actions);
      // console.log(this.checkCells);
      for (var action of actions) {
        var [actionType, cell] = action;
        if (cell.alive != actionType) {
          cell.changeState();
        }
      }
    }

    updateDisplay() {
      var cellsToCheck = this.checkCells.slice();
      for (var i = 0; i < cellsToCheck.length; i++) {
        var cell = document.getElementById(
          `${cellsToCheck[i][0]};${cellsToCheck[i][1]}`
        );
        // console.log(cellsToCheck)
        //console.log(this.checkCells);
        // console.log(i)
        // console.log(cell)
        if (this.data[cellsToCheck[i][0]][cellsToCheck[i][1]].alive) {
          cell.classList.add("alive");
        } else {
          cell.classList.remove("alive");
          //console.log(this.checkCells)
          this.checkCells.splice(this.checkCells.indexOf(cellsToCheck[i]), 1);
        }
      }
    }
  }
  
document.querySelector(".container").innerHTML="";

let speed=Number(document.getElementById("speed").value) || 1;
  let size=Number(document.getElementById("size").value) || 25
  var board = new Board(size,size);
  var gameState = new GameState();
  initHTML(board.rows, board.columns);
  gameState.setSpeed(speed);
  
}
main();
