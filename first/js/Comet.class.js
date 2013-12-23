/// <reference path="prototype.js" />

/* 
=== Classe Comet ===
This class is responsible for maintaining a connection on a Comet server specified in the constructor

Comet server must at least:

- Respond to the variable action = "waitformessages" passed POST putting himself in an infinite loop
and returning only when a new message has arrived
          
All variables are passed POST, encoded in JSON
===================


Original Comet Class Credit : Stéphane Zeitoun (http://www.zeitoun.net/articles/comet_and_php/start)
*/

var Comet = Class.create({

                                initialize: function(url) {
                                                                this.url = url;
                                                                this.errors = 0;
                                },

                                setConnectionParams: function(connectParams) {
                                                                this.connectParams = connectParams;
                                                                this.connect();
                                },

                                connect: function() {

                                                                this.ajax = new Ajax.Request(this.url, {
                                                                                                method: "post",
                                                                                                parameters: this.connectParams,

                                                                                                onSuccess: (function(transport) {
                                                                                                                                // handle the server response
                                                                                                                                
                                                                                                                                if(transport.responseText.substr(0,4) == "{ok}") {
                                                                                                                                  var msg = transport.responseText.substr(4)
                                                                                                                                  try{
                                                                                                                                    msg = msg.evalJSON();
                                                                                                                                    document.fire("comet:newmessage", msg); 
                                                                                                                                    this.errors = 0;
                                                                                                                                  } catch(err) {
                                                                                                                                    this.errors++;
                                                                                                                                  }
                                                                                                                                } else {
                                  if(console) console.error("Error from Comet server : " + transport.responseText);
                                                                                                                                  this.errors++;                                                                                                                                
                                                                                                                                }
                                                                                                }).bind(this),

                                                                                                onComplete: (function(transport) {
                                                                                                                                // send a new ajax request when this request is finished
                                                                                                                                
                                                                                                                                if(this.errors == 0) {
                                                                                                                                  this.connect();
                                                                                                                          } else {
                                                                                                                            if(this.errors < 5)
                                                                                                                              // retry 3 times, waiting 2 seconds before each retry
                                                                                                                              setTimeout(this.connect.bind(this), 2000);
                                                                                                                          }
                                                                                                                                this.errors++;
                                                                                                }).bind(this)
                                                                });
                                },

                                sendMessage: function(request, onSuccess) {
                                                                new Ajax.Request(this.url, {
                                                                                                method: "post",
                                                                                                parameters: request,
                                                                                                onSuccess: onSuccess
                                                                });
                                }
});