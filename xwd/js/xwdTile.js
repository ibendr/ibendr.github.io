function Tile( position , value , label ) {
  this.x                = position.x;
  this.y                = position.y;
  this.value            = value || "";
  this.label		= label ? ( "" + label ) : ""
}

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
