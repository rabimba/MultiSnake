?/// <reference path="prototype.js" />

/*
    The GameBoard is basically an array of cells
    Each non-empty cell is a div with a certain css class applied to it
 */


var GameBoard = Class.create({
    
    initialize  : function(boardDiv, cols, rows, cellSize) {
        this.board = $(boardDiv);
        this.rows = rows;
        this.cols = cols;
        this.cellSize = cellSize;
        this.cells = new Array();
        
        for(var y = 0; y < rows; y++) {
            for(var x = 0; x < cols; x++) {
                var cell = new Element('div');

                cell.setStyle({
                    position    : "absolute",
                    width       : this.cellSize + "px",
                    height      : this.cellSize + "px",
                    left        : (x * this.cellSize) + "px",
                    top         : (y * this.cellSize) + "px"
                });
                
                this.board.insert(cell);
                this.cells.push(cell);
            }
        }

        this.board.setStyle({
            height: (rows * cellSize) + "px",
                width: (cols * cellSize) + "px"
        });

        this.board.makePositioned();
    },
    
    setCell : function(x, y, className) {
        this.cells[this.getIndex(x, y)].className = className;
    },
    
    clearCell : function(x , y) {
        this.cells[this.getIndex(x, y)].className = "";
    },
    
    getCell : function(x, y) {
        return this.cells[this.getIndex(x, y)].className;
    },
    
   //private
    getIndex : function(x, y) {
        x = x % this.cols;
        if(x < 0)
            x += this.cols;

        y = y % this.rows;
        if(y < 0)
            y += this.rows;
    
        return y * this.cols + x;
    }
    
});