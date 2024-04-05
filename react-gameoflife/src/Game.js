import React from 'react'; 
import './Game.css';

const CELL_SIZE = 20;
const WIDTH = 800;
const HEIGHT = 600;

class Game extends React.Component {  
    constructor(){
        super();

        this.rows = HEIGHT / CELL_SIZE;
        this.cols = WIDTH / CELL_SIZE;
        this.board = this.makeEmptyBoard();
    }
    state = {
        cells: [], 
        interval: 100,
        isRunning: false,
    }

    runGame = () => {
        this.setState({isRunning: true});
        this.runIteration();
    }

    stopGame = () => {
        this.setState({isRunning: false});
        if (this.timeoutHandler) {      
            window.clearTimeout(this.timeoutHandler);      
            this.timeoutHandler = null;    
        }
    }

    handleIntervalChange = (event) => {
        this.setState({interval: event.target.value});
    }

    calculateNextState(currentBoard) {
        const newBoard = this.makeEmptyBoard();
    
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const neighbors = this.countNeighbors(currentBoard, x, y);
                const isAlive = currentBoard[y][x];
    
                if (isAlive && (neighbors < 2 || neighbors > 3)) {
                    newBoard[y][x] = false; // Any live cell with fewer than two live neighbors dies, or more than three live neighbors dies
                } else if (!isAlive && neighbors === 3) {
                    newBoard[y][x] = true; // Any dead cell with exactly three live neighbors becomes a live cell
                } else {
                    newBoard[y][x] = currentBoard[y][x]; // Any live cell with two or three live neighbors lives on to the next generation
                }
            }
        }
    
        return newBoard;
    }
    
    countNeighbors(board, x, y) {
        let count = 0;
        const neighbors = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
    
        for (const [dx, dy] of neighbors) {
            const nx = x + dx;
            const ny = y + dy;
    
            if (nx >= 0 && nx < this.cols && ny >= 0 && ny < this.rows) {
                count += board[ny][nx] ? 1 : 0;
            }
        }
    
        return count;
    }
    

    runIteration() {    
        console.log('running iteration');            
        const newBoard = this.calculateNextState(this.board); 

        this.board = newBoard;    
        this.setState({ 
            cells: this.makeCells() 
        });

        this.timeoutHandler = window.setTimeout(() => 
            { this.runIteration();}, 
            this.state.interval
            );  
    }
        

    makeEmptyBoard(){
        let board = [];

        for(let y = 0; y < this.rows; y++){
            board[y] = []
            for(let x = 0; x < this.cols; x++){
                board[y][x] = false;
            }

        }

        return board;
    }
    
    makeCells(){
        let cells = [];

        for(let y = 0; y < this.rows; y++){
            for(let x = 0; x < this.cols; x++){
                if(this.board[y][x]){
                    cells.push({x,y});
                }
            }

        }

        return cells;
    }

    getElementOffset() {    
        const rect = this.boardRef.getBoundingClientRect();    
        const doc = document.documentElement;

        return {      
            x: (rect.left + window.pageXOffset) - doc.clientLeft,      
            y: (rect.top + window.pageYOffset) - doc.clientTop,    
        };
    }

    handleClick = (event) => {    
        const elemOffset = this.getElementOffset();    
        const offsetX = event.clientX - elemOffset.x;    
        const offsetY = event.clientY - elemOffset.y;  

        const x = Math.floor(offsetX / CELL_SIZE);    
        const y = Math.floor(offsetY / CELL_SIZE);

        if (x >= 0 && x <= this.cols && y >= 0 && y <= this.rows) {      
            this.board[y][x] = !this.board[y][x];    
        }
        
        this.setState({ 
            cells: this.makeCells() 
        });
    
    }

    render() {
        const cells = this.makeCells();
        return (
          <div>
            <div className="Board"
              style={{
                width: WIDTH, height: HEIGHT,
                backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`
              }}
              onClick={this.handleClick}
              ref={(n) => { this.boardRef = n; }}>
              {cells.map(cell => (
                <Cell
                  x={cell.x} y={cell.y}
                  key={`${cell.x},${cell.y}`}
                />
              ))}
            </div>
            <div className="controls">
              Update every <input
                value={this.state.interval}
                onChange={this.handleIntervalChange}
              /> msec 
              {this.state.isRunning ? (
                <button className="button" onClick={this.stopGame}>Stop</button>
              ) : (
                <button className="button" onClick={this.runGame}>Run</button>
              )}
            </div>
          </div>
        );
      }      
    
}

class Cell extends React.Component {  
    render() {    
        const { x, y } = this.props;    
        return (      
            <div className="Cell" 
                style={{        
                    left: `${CELL_SIZE * x + 1}px`,        
                    top: `${CELL_SIZE * y + 1}px`,        
                    width: `${CELL_SIZE - 1}px`,        
                    height: `${CELL_SIZE - 1}px`,      
                }} />    
                );  
            }
        }

export default Game;