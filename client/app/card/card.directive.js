(function(){
  'use strict';

  angular
    .module('blackjack.game')
    .directive('blackjackCard', blackjackCard);

  function blackjackCard() {
    return {
      restrict: 'E',
      templateUrl: 'app/card/card.directive.html',
      scope: {
        cardName: '@',
        cardState: '@',
        cardRank: '@',
        cardSuit: '@'
      },
      link: function(scope, element, attributes) {

        attributes.$observe('cardState', function (value) {
          var card = element[0].querySelector('.card');
          var cardClasses = card.className;

          if (value === 'backfacing') {
            card.className = cardClasses + ' card--flipped';
          }
        });
      }
    }
  }
})();
