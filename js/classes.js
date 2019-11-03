const classes_version = 13;


class Tile{
  constructor(/*Color*/ color, /*Boolean*/ land, /*String*/ id, /*Array?*/ deco){
    this.color = color;
    this.land = land;
    this.id = id;
    this.deco = deco || new Array();
  }
  add_int_id(/*Number*/ int_id){
    this.int_id = int_id;
  }
};
class Color{
  constructor(/*Number | String*/ r, /*Number?*/ g, /*Number?*/ b, /*Number?*/ a){
    if(arguments.length == 1){
      let can = document.createElement("canvas");
      can.height = 1;
      can.width = 1;
      let con = can.getContext('2d');
      con.fillStyle = r;
      con.fillRect(0, 0, 1, 1);
      let img = con.getImageData(0, 0, 1, 1);
      can.remove();
      r = img.data[0];
      g = img.data[1];
      b = img.data[2];
      a = img.data[3];
    }
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
};
class Point{
  constructor(/*Number?*/ x, /*Number?*/ y){
    this.x = x || 0;
    this.y = y || 0;
  }
};
class TileMap{
  constructor(/*Array?*/ tiles, /*Point?*/ start, /*Number?*/ time){
    this.tiles = tiles || new Array();
    this.start = start || new Point();
    this.time = time || 0;
  }
  insertMapElement(/*TileMap*/ small, /*Number*/ x, /*Number*/ y){
    for(let i = 0; i < small.tiles.length; i++){
      for(let j = 0; j < small.tiles[0].length; j++){
        if(i + x >= 0 && i + x < this.tiles.length && j + y >= 0 && j + y < this.tiles[0].length) {
          if(this.tiles[i + x][j + y] != undefined) {
            this.tiles[i + x][j + y] = small.tiles[i][j];
          }
        }
      }
    }
  }
};
class Decoration{
  constructor(/*Function*/ drawFun, /*Number*/ priority){
    this.drawFun = drawFun;
    this.priority = priority;
  }
  draw(/*Number*/ x, /*Number*/ y){
    this.drawFun(x, y);
  }
};
class DecoPart extends Decoration{
  constructor(/*Function*/ drawFun, /*Number*/ priority, /*Number*/ width, /*Number*/ height, /*Color*/ color){
    super(drawFun, priority);
    this.width = width;
    this.height = height;
    this.color = color;
  }
  draw(/*Number*/ x, /*Number*/ y) {
    this.drawFun(x, y, this);
  }
};
