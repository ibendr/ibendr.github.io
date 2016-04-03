function Tile( position , value , label ) {
  this.x                = position.x;
  this.y                = position.y;
  this.value            = value || "";
  this.label		= label ? ( "" + label ) : ""

  this.previousPosition = null;
  this.mergedFrom       = null; 	// Tracks tiles that merged together
  this.mergedAs		= this.value;	// mulitplier value of merging (not in 2048)
}

Tile.prototype.savePosition = function () {
  this.previousPosition = { x: this.x , y: this.y };
};

Tile.prototype.updatePosition = function ( position ) {
  this.x = position.x;
  this.y = position.y;
};

Tile.prototype.serialize = function () {
  return {
    position: {
      x: this.x,
      y: this.y
    },
    value: this.value,
    label: this.label
  };
};
