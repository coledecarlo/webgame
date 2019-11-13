/**@type {Number}*/ const classes_version = 16;

class Tile{
  constructor(/*Color*/ color, /*Boolean*/ land, /*String*/ id, /*Array?*/ deco, /*Warp | Boolean?*/ warp, /*Tile?*/ mutating){
    alert("NEWTILE " + id);
    /**@type {Color}*/ this.color = color;
    /**@type {Boolean}*/ this.land = land;
    /**@type {String}*/ this.id = id;
    /**@type {Array<Decoration>}*/ this.deco = deco || [];
    if(typeof warp === 'boolean'){
      /**@type {Warp}*/ this.warp = new Warp(warp);
    }
    else{
      this.warp = warp || new Warp();
    }
    /**@type {Tile}*/ this.mutating = mutating || this;
  }
  /**@returns {void}*/ add_int_id(/*Number*/ int_id){
    /**@type {Number}*/ this.int_id = int_id;
  }
}
class Color{
  constructor(/*Number | String*/ r, /*Number?*/ g, /*Number?*/ b, /*Number?*/ a){
    if(arguments.length === 1){
      /**@type {OffscreenCanvasRenderingContext2D}*/ let con = new OffscreenCanvas(1, 1).getContext('2d');
      con.fillStyle = /**@type {String}*/ r;
      con.fillRect(0, 0, 1, 1);
      /**@type {ImageData}*/ let img = con.getImageData(0, 0, 1, 1);
      r = img.data[0];
      g = img.data[1];
      b = img.data[2];
      a = img.data[3];
    }
    /**@type {Number}*/ this.r = r;
    /**@type {Number}*/ this.g = g;
    /**@type {Number}*/ this.b = b;
    /**@type {Number}*/ this.a = a;
  }
  /**@returns {String}*/ toString(){
    return `rgba(${this.r},${this.g},${this.b},${this.a})`;
  }
}
class Point{
  constructor(/*Number | Point?*/ x, /*Number?*/ y){
    if(arguments.length === 1){
      /**@type {Number}*/ this.x = x.x;
      /**@type {Number}*/ this.y = x.y;
    }
    else {
      this.x = x || 0;
      this.y = y || 0;
    }
  }
  /**@returns {Point}*/ round(){
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
  }
}
class TileMap{
  constructor(/*Array | TileMap?*/ tiles, /*Point?*/ start, /*Number?*/ time){
    if(arguments.length === 1){
      /**@type {TileMap}*/ let map = tiles;
      this.start = new Point(map.start);
      this.time = map.time;
      this.tiles = [];
      for(let i = 0; i < map.tiles.length; i++){
        this.tiles[i] = map.tiles[i].slice();
      }
    }
    else {
      /**@type {Array<Array<Tile>>}*/ this.tiles = tiles || [];
      /**@type {Point}*/ this.start = start || new Point();
      /**@type {Number}*/ this.time = time || 0;
    }
  }
  /**@returns {void}*/ insertMapElement(/*TileMap*/ small, /*Number*/ x, /*Number*/ y){
    for(let i = 0; i < small.tiles.length; i++){
      for(let j = 0; j < small.tiles[0].length; j++){
        if(i + x >= 0 && i + x < this.tiles.length && j + y >= 0 && j + y < this.tiles[0].length) {
          if(this.tiles[i + x][j + y] !== undefined) {
            this.tiles[i + x][j + y] = small.tiles[i][j];
          }
        }
      }
    }
  }
  /**@returns {Tile}*/ getTile(/*Point*/ p){
    return this.tiles[p.x][p.y];
  }
  /**@returns {void}*/ setTile(/*Point*/ p, /*Tile*/ tile){
    this.tiles[p.x][p.y] = tile;
  }
  /**@returns {Number}*/ height(){
    return this.tiles.length
  }
  /**@returns {Number}*/ width(){
    return this.tiles[0].length
  }
}
class Decoration{
  constructor(/*Function*/ drawFun, /*Number*/ priority){
    /**@type {Function}*/ this.drawFun = drawFun;
    /**@type {Number}*/ this.priority = priority;
  }
  /**@returns {void}*/ draw(/*Number*/ x, /*Number*/ y){
    this.drawFun(x * grid_size, y * grid_size);
  }
}
class DecoPart extends Decoration{
  constructor(/*Function*/ drawFun, /*Number*/ priority, /*Number*/ width, /*Number*/ height, /*Color*/ color){
    super(drawFun, priority);
    /**@type {Number}*/ this.width = width;
    /**@type {Number}*/ this.height = height;
    /**@type {Color}*/ this.color = color;
  }
  /**@returns {void}*/ draw(/*Number*/ x, /*Number*/ y) {
    this.drawFun(x * grid_size, y * grid_size, this);
  }
}
class Warp{
  constructor(/*Boolean?*/ enabled, /*Number?*/ map, /*String?*/ direction, /*Point?*/ target){
    /**@type {Boolean}*/ this.enabled = enabled || false;
    /**@type {Number}*/ this.map = map || 0;
    /**@type {String}*/ this.direction = direction || '';
    /**@type {Point}*/ this.target = (arguments.length === 3)? maps[map].start: (target || null);
    console.assert(arguments.length !== 2);
  }
}
