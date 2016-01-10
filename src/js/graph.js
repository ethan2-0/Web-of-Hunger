//handy data structures
var Node = function(name, id, label) {
  this.name = name;
  this.id = id;
  this.label = label;
};

var Edge = function(name, frm, to) {
  this.name = name;
  this.from = frm;
  this.to = to;
  this.arrows = "to";
};
