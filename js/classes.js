const classes_version = 14;


class Tile{
  constructor(/*Color*/ color, /*Boolean*/ land, /*String*/ id, /*Array?*/ deco, /*Warp?*/ warp, /*Tile?*/ mutating){
    /**@type {Color}*/
    this.color = color;
    /**@type {Boolean}*/
    this.land = land;
    /**@type {String}*/
    this.id = id;
    /**@type {Array}*/
    this.deco = deco || new Array();
    /**@type {Warp}*/
    this.warp = warp || new Warp();
    /**@type {Tile}*/
    this.mutating = mutating || this;
  }
  add_int_id(/*Number*/ int_id){
    /**@type {Number}*/
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
    /**@type {Number}*/
    this.r = r;
    /**@type {Number}*/
    this.g = g;
    /**@type {Number}*/
    this.b = b;
    /**@type {Number}*/
    this.a = a;
  }
};
class Point{
  constructor(/*Number | Point?*/ x, /*Number?*/ y){
    if(arguments.length == 1){
      /**@type {Number}*/
      this.x = x.x;
      /**@type {Number}*/
      this.y = x.y;
    }
    else {
      this.x = x || 0;
      this.y = y || 0;
    }
  }
  round(){
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
  }
};
class TileMap{
  constructor(/*Array | TileMap?*/ tiles, /*Point?*/ start, /*Number?*/ time){
    if(arguments.length == 1){
      this.start = new Point(tiles.start);
      this.time = tiles.time;
      this.tiles = [];
      for(let i = 0; i < tiles.tiles.length; i++){
        this.tiles[i] = tiles.tiles[i].slice();
      }
    }
    else {
      /**@type {Array<Array<Tile>>}*/
      this.tiles = tiles || new Array();
      /**@type {Point}*/
      this.start = start || new Point();
      /**@type {Number}*/
      this.time = time || 0;
    }
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
    /**@type {Function}*/
    this.drawFun = drawFun;
    /**@type {Number}*/
    this.priority = priority;
  }
  draw(/*Number*/ x, /*Number*/ y){
    this.drawFun(x, y);
  }
};
class DecoPart extends Decoration{
  constructor(/*Function*/ drawFun, /*Number*/ priority, /*Number*/ width, /*Number*/ height, /*Color*/ color){
    super(drawFun, priority);
    /**@type {Number}*/
    this.width = width;
    /**@type {Number}*/
    this.height = height;
    /**@type {Color}*/
    this.color = color;
  }
  draw(/*Number*/ x, /*Number*/ y) {
    this.drawFun(x, y, this);
  }
};
class Warp{
  constructor(/*Boolean?*/ enabled, /*Number?*/ map, /*String?*/ direction, /*Point?*/ target){
    /**@type {Boolean}*/
    this.enabled = enabled || false;
    /**@type {TileMap}*/
    this.map = map || 0;
    /**@type {String}*/
    this.direction = direction || '';
    /**@type {Point}*/
    this.target = (arguments.length == 2 || arguments.length == 3)? maps[map].start: (target || null);
  }
}
