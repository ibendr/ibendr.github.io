function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");

  this.score = 0;
}

HTMLActuator.prototype.actuate = function ( grid , metadata , cursorCell , cursorSpot , otherSpots , cells2 ) {
  var self = this;

  window.requestAnimationFrame(function () {
    // remove all the (actual html) tiles from the container
    self.clearContainer(self.tileContainer);

    // draw all the current tiles with their transitions
    grid.cells.forEach(function (column) {
      column.forEach(function ( tile ) {
        if ( tile ) {
	  var cell = cells2[ tile.y ][ tile.x ];
	  if ( cell ) {
	    var extraClasses = [];
	    if ( cursorCell ) {
	      // check for need to highlight
	      if ( cell == cursorCell )
		extraClasses.push( "tile-cursor" );
	      if ( cursorSpot && cell.inSpots( [ cursorSpot ] ) )
		extraClasses.push( "tile-highlight" );
	      else { /* if ( otherSpots) alert( otherSpots );*/
		if ( cell.inSpots( otherSpots || [] ) )
		  extraClasses.push( "tile-highlight1" );
	      }
	    }	  
 	    self.addTile( tile , extraClasses );
	  }
	  else {
	    self.addTile( tile );
	  }
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);
    self.updateCurrentClue(metadata.currentClue);

    if (metadata.terminated) {
      if (metadata.over) {
        self.message(false); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }

  });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continueGame = function () {
  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

nameSafeChars = "ABCDEFGHIJKLMNOPQRSTUBWXYZabcdefghijklmnopqrstuvwxyz0123456789-"
nameSafeSwaps = { '*' : "block" , ' ' : "space" }
function nameSafe( str ) {
  str = "" + str;	// make sure we have a string
  outStr = "";
  for ( var i=0 ; i<str.length ; i++ ) {
    c = str[ i ];
    if ( nameSafeChars.indexOf( c ) != -1 ) {
      outStr += c;
    }
    else {
      outStr += nameSafeSwaps[ c ] || "-";
    }
  }
  return outStr;
}

HTMLActuator.prototype.addTile = function ( tile , extraClasses ) {
  var self = this;

  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");
  var label	= document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + nameSafe( tile.value ), positionClass];
  
  if ( extraClasses ) {
    classes = classes.concat( extraClasses );
  }
  
  var target = 96;	// shouldn't be hard-wired here of course
  
  if (tile.value > target && (tile.value % target == 0)) classes.push("tile-super");

  this.applyClasses(wrapper, classes);
  wrapper.style.left = ( position.x * 40 ) + "px";
  wrapper.style.top  = ( position.y * 40 ) + "px";

  inner.classList.add("tile-inner");
  inner.textContent = tile.value;
  
  label.classList.add("tile-label");
  label.textContent = "" + tile.label;

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      wrapper.style.left = ( tile.x * 40 ) + "px";
      wrapper.style.top  = ( tile.y * 40 ) + "px";
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);
  wrapper.appendChild(label);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + ( position.x < 10 ? '0' : '' ) + position.x + 
		      "-" + ( position.y < 10 ? '0' : '' ) + position.y ;
};
HTMLActuator.prototype.updateCurrentClue = function ( clue ) { 
  document.getElementById( "clue-container" ).textContent = clue;
};
HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.message = function (won) {
  var type    = won ? "game-won" : "game-over";
  var message = won ? "You win!" : "Game over!";

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};
