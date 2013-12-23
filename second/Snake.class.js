/// <reference path="prototype.js" />
/// <reference path="GameBoard.class.js" />

var Snake = Class.create({

    directions: { up: { dx: 0, dy: -1 },
        down: { dx: 0, dy: 1 },
        left: { dx: -1, dy: 0 },
        right: { dx: 1, dy: 0 }
    },

    colors : ["white", "aqua", "blue", "fuchsia", "gray", "green", "lime", "maroon", "navy", "olive", "purple", "red", "silver", "teal", "yellow"],

    initialize: function(gameboard, x, y, color) {
        this.gameboard = gameboard;
        this.color = color;
        this.cells = new Array();
        this.cellsToGrow = 0;
        this.dx = 0;
        this.dy = 0;

        if (x && y) {
            this.cells.push({ x: x, y: y });
            this.setCell(x, y);
        }
    },

    //unserialize: function

    //sets the direction of the snake
    // d = "up", "right", "down", or "left"
    // return true if direction has changed, false otherwise
    setDirection: function(d) {

        //check that the new direction is valid 
        //(ex: if we were going to right, changing to left or to right wouldn't be valid)
        if ((this.dx == 0 && this.dy == 0) || ((this.dx + this.directions[d].dx != 0) && (this.dy + this.directions[d].dy) != 0)) {
            this.dx = this.directions[d].dx;
            this.dy = this.directions[d].dy;
            return true;
        }
        else
            return false;
    },

    grow: function(length) {
        this.cellsToGrow += length;
    },

    start: function() {
        if(!this.dx && !this.dy) {
            if(console) console.error("Snake.class.js : Can't start the snake without previously setting a direction");
            return;
        }
        
        this.timer = setInterval(this.move.bind(this), 50);
    },

    stop: function() {
        clearInterval(this.timer);
    },

    move: function() {

        var head = Object.clone(this.cells.last());
        head.x += this.dx;
        head.y += this.dy;

        var newcell = this.gameboard.getCell(head.x, head.y);
        if (newcell != "") {
            this.stop();
            alert("You lost !");
            return;
        }

        this.cells.push(head);
        this.setCell(head.x, head.y);

        if (this.cellsToGrow > 0) {
            this.cellsToGrow--;
        }
        else {
            var tail = this.cells.shift();

            if (tail)
                this.gameboard.clearCell(tail.x, tail.y);
        }
    },

    setCell: function(x, y) {
      this.gameboard.setCell(x, y, "snake-cell " + this.color)
    },
    
    remove : function() {
            this.stop();
            this.cells.each(function(c) { 
              this.gameboard.clearCell(c.x, c.y); 
            }, this);
            
    },
    
    toJSON: function() {
        var varsToSave = ["cells", "cellsToGrow", "dx", "dy", "color"];

        var h = new Hash();
        varsToSave.each(function(v) { h.set(v, eval("this." + v)) }, this)

        return h.toJSON();
    }
    


});

//static method
Snake.unserialize = function(data, gameboard) {
    var s = new Snake();
    s.gameboard = gameboard;
    s.cellsToGrow = data.cellsToGrow;
    s.dx = data.dx;
    s.dy = data.dy;
    s.color = data.color;

    s.cells = data.cells.clone();

    s.cells.each(function(c) { 
        this.setCell(c.x, c.y); 
        }, s);
    return s;
}