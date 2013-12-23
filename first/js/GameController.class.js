?/// <reference path="prototype.js" />
/// <reference path="Comet.class.js" />
/// <reference path="Player.class.js" />
/// <reference path="Snake.class.js" />


/*

I get about the game:

1. I created a game controller, specifying the nickname I want
2. The seveur meets with my id
3. I get a message with newplayer my real nickname
4. My snake began moving alone
5. I started receiving messages from other players broadcastMyPosition
6. I create these joeuurs
7. if I get a message NewPlayer, I create and I broadcast my position
*/


/*
TODO

SetDirection
Pommes
Score

*/

var GameController = Class.create({

  id: null,
  comet: null,
  timer: null,
  players: new Hash(),

  initialize: function(gameboard, playerlistDiv, nickname) {

    this.gameboard = gameboard;
    this.playerlistDiv = playerlistDiv;

    //initialize la connection comet avec le serveur, et observe les nouveaux messages
    this.comet = new Comet("./gamecontroller.php");


    this.comet.sendMessage({ action: "messagetoserver", message: "getnewid" },
                                                                 (function(transport) {
                                                                   this.id = parseInt(transport.responseText);
                                                                   this.comet.setConnectionParams({ action: "waitformessages", from: this.id });

                                                                   document.observe("comet:newmessage", this.handleNewMessage.bindAsEventListener(this));

                                                                   //s'enregistre en tant que nouveau joueur auprès du serveur
                                                                   var color = Snake.prototype.colors[Math.floor(Math.random() * Snake.prototype.colors.length)];
                                                                   this.sendMessage("messagetoserver", "registernewplayer", { "nickname": nickname, "color":color });

                                                                   Event.observe(document, "keydown", this.handleKeyboard.bindAsEventListener(this));
                    Event.observe(window, "beforeunload", this.handleUnload.bindAsEventListener(this));

                                                                 }).bind(this));

  },

  sendMessage: function(action, message, params) {

    var request = { action: action,
      message: message,
      params: $H(params).toJSON(),
      from: this.id
    };

    this.comet.sendMessage(request);

  },

  handleUnload: function(e) {
    this.sendMessage("messagetoserver", "quit", {});
  },
  
  handleKeyboard: function(e) {

    switch (parseInt(e.keyCode)) {

      case Event.KEY_UP:
        this.sendMessage("messagetoplayers", "changedirection", { "direction": "up" });
        Event.stop(e);
        break;

      case Event.KEY_DOWN:
        this.sendMessage("messagetoplayers", "changedirection", { "direction": "down" });
        Event.stop(e);
        break;

      case Event.KEY_LEFT:
        this.sendMessage("messagetoplayers", "changedirection", { "direction": "left" });
        Event.stop(e);
        break;

      case Event.KEY_RIGHT:
        this.sendMessage("messagetoplayers", "changedirection", { "direction": "right" });
        Event.stop(e);
        break;

      case Event.KEY_RETURN:
        this.sendMessage("messagetoplayers", "grow", { "amount": "3" });
        Event.stop(e);
        break;

    }
  },

  handleNewMessage: function(event) {

    var msg = event.memo;

    if(typeof msg.params != undefined)
      var params = msg.params;

    switch (msg.message) {

      case "newid":
        this.setMyId(params.id);
        break;

      case "newplayer":
        this.addPlayer(params.id, params.nickname, params.x, params.y, params.color);
        if (params.id != this.id)
          this.broadcastMyPosition();
        break;

      case "positionbroadcast":
        if(msg.from != this.id)
          this.updatePlayer(msg.from, params.playerdata);
        break;

      case "changedirection":
        var p = this.players.get(msg.from);
        if(!p)
          break;
        var snake = this.players.get(msg.from).getSnake();
        var direction = params.direction;
        if (snake && direction)
          snake.setDirection(direction);
        break;

      case "grow":
        var p = this.players.get(msg.from);
        if(!p)
          break;
        var snake = this.players.get(msg.from).getSnake();
        var amount = params.amount;
        if (snake && amount)
          snake.grow(amount);
        break;
        
      case "quit":
          
          if($("p" + id))
            $("p" + id).remove();
                    
          var p = this.players.unset(msg.from);
          if(p)
            p.remove();
        break;

    }
  },

  addPlayer: function(id, nickname, x, y, color) {
    var s = new Snake(this.gameboard, x, y, color);
    s.setDirection('right');
    s.start();
    var p = new Player(nickname, 0, s);
    this.players.set(id, p);
    
    if($("p" + id))
      $("p" + id).remove();
    this.playerlistDiv.insert((new Element("div", {id: "p" + id})).update(nickname));
  },

  updatePlayer: function(id, serializedPlayer) {
    var p = Player.unserialize(serializedPlayer, this.gameboard);
    this.players.set(id, p);
    p.getSnake().start();
    
    if($("p" + id))
      $("p" + id).remove();
    this.playerlistDiv.insert((new Element("div", {id: "p" + id})).update(p.nickname));

  },

  setMyId: function(id) {
    this.id = id;
    this.comet.from = id;
  },

  broadcastMyPosition: function() {
    var data = this.players.get(this.id).serialize();
    this.sendMessage("messagetoplayers", "positionbroadcast", {"playerdata":data});
  }

});