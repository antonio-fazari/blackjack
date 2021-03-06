(function(){
  'use strict';

  angular
    .module('blackjack.game')
    .controller('GameController', GameController);

  GameController.$inject = ['PlayerService', 'CardService', 'GameService', 'DealerService'];

  function GameController(PlayerService, CardService, GameService, DealerService){
    var game = this;

    /**
     * Initialize our controller data
     */
    game.init = function() {
      game.maxValue = GameService.maxValue();
      game.canDeal = false;
      game.started = false;
      game.showResults = false;
      game.deck = CardService.newDeck();
      game.dealer = DealerService.newDealer(game.deck);
      game.betValue = 100;
      game.handValue = 0;
      game.noPlayers = 2;
      game.activePlayer = 0;
    };

    /**
     * Starts a game by creating a new player
     */
    game.start = function() {
      var tempPlayerNames = ['Ray Charles', 'Frank Sinatra', 'James Brown'];
      game.players = [];

      for (var i = 0; i < game.noPlayers; i++) {
        game.players.push(PlayerService.newPlayer(tempPlayerNames[i], 100, i));
      }

      game.started = true;
      game.canDeal = true;
      game.showResults = false;
    };

    game.resetPlayersState = function() {
      // Remove all cards from each player.
      game.players.forEach(function(player) {
        game.players[player.seatNo].cards = [];
        game.players[player.seatNo].handValue = 0;
        game.players[player.seatNo].busted = false;
        game.players[player.seatNo].won = false;
      });
    }

    /**
     * Deals a new hand by 'paying' from the score,
     * shuffles the deck, and deals two cards to the
     * player.
     */
    game.deal = function() {
      // Initialize values each game
      game.busted = false;
      game.started = true;
      game.canDeal = false;
      game.showResults = false;
      game.activePlayer = 0;

      // Reset each players state.
      game.resetPlayersState();

      // Shuffle before dealing.
      game.deck.shuffle();

      // Our bet defaults to 100.
      game.players.forEach(function(player) {
        // Deduct points from each player.
        game.players[player.seatNo].changeScore(game.betValue * -1);

        // Deal the cards.
        game.hit(player.seatNo);
        game.hit(player.seatNo);
      });

      // Deal to the dealer.
      game.dealer.deal();
      game.players[game.activePlayer].active = true;
      console.log(game.players);
    };

    /**
     * Adds a card to our hand and calculates value.
     */
    game.hit = function(seatNo) {
      // Hand out cards to each player.
      game.players[seatNo].cards.push(game.deck.deal());
      game.getHandValue(seatNo);
    };

    game.stay = function() {
      game.players[game.activePlayer].active = false;
      game.activePlayer++;

      if (game.activePlayer === game.noPlayers) {
        game.end();
      } else {
        game.canHit = true;
        game.busted = false;
        game.players[game.activePlayer].active = true;
        game.getHandValue(game.activePlayer);
      }
    }

    /**
     * Ends the game for the current hand. Checks for wins
     * and 'pays' to player score
     */
    game.end = function() {
      // Tell the dealer to finish his hand
      game.dealer.finish();
      // TODO: rewrite to handle evaluating multiple players hands.
      game.players.forEach(function(player) {

        var wonGame = false;
        var tiedGame = false;
        var seatNo = player.seatNo;

        // Check against dealer's hand
        if (game.dealer.busted) {
          // Auto Win if dealer busts
          wonGame = true;
        }
        else {
          if (game.dealer.handValue === player.handValue) {
            tiedGame = true;
          }
          else {
            wonGame = (player.handValue > game.dealer.handValue);
          }
        }

        if (wonGame && !player.busted) {
          // Winning pays double the bet
          game.players[seatNo].changeScore(game.betValue * 2);
          game.players[seatNo].won = true;
          game.players[seatNo].results = "Congratulations, You Won!";
        }
        else if (tiedGame) {
          // A 'PUSH' gives the player back their bet
          game.players[seatNo].changeScore(game.betValue);
          game.players[seatNo].results = "Push with the dealer!";
        }
        else {
          game.results = "DEALER WON";
          game.players[seatNo].results = "Dealer beat you!";
        }
      });

      game.canHit = false;
      game.canDeal = true;
      game.showResults = true;
    };

    /**
     * Resets our player's score and re-inits
     */
    game.reset = function() {
      game.players = [];
      game.init();
    };

    /**
     * Calculates value of player's hand via GameService
     * Determines if player can still hit or if busted.
     */
    game.getHandValue = function(seatNo) {
      // var seatNo = game.activePlayer;
      var handValue = GameService.handValue(game.players[seatNo].cards);
      game.players[seatNo].handValue = handValue;

      game.canHit = handValue < game.maxValue;
      game.busted = handValue > game.maxValue;

      if (game.busted) {
        game.players[seatNo].busted = true;
        game.players[seatNo].won = false;
      }

      if (handValue >= game.maxValue) {
        game.stay();
      }
    };

    game.init();
  }
})();
