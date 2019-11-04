/**@type {Number}*/
const version = 15;

/**@type {Array<TileMap>}*/
let maps = [];
/**@type {Point}*/
let pos;
/**@type {TileMap}*/
let map;
/**@type {Number}*/
let grid_size = 60;
/**@type {Number}*/
let grid_x = 13;
/**@type {Number}*/
let grid_y = 23;
/**@type {Number}*/
let width;
/**@type {Number}*/
let height;
/**@type {Number}*/
let mid_x;
/**@type {Number}*/
let mid_y;
/**@type {HTMLCanvasElement}*/
const canvas = document.getElementById('board');
/**@type {HTMLInputElement}*/
const showLines = document.getElementById('lines');
/**@type {HTMLInputElement}*/
const heightField = document.getElementById('height');
/**@type {HTMLInputElement}*/
const widthField = document.getElementById('width');
/**@type {HTMLInputElement}*/
const gridField = document.getElementById('gridsize');
/**@type {HTMLElement}*/
const lumberLabel = document.getElementById('lumber');
/**@type {HTMLElement}*/
const rocksLabel = document.getElementById('rocks');
/**@type {HTMLButtonElement}*/
const setButton = document.getElementById('set');
/**@type {HTMLButtonElement}*/
const saveButton = document.getElementById('save');
/**@type {HTMLElement}*/
const woodHouseHolder = document.getElementById('woodhouseholder');
/**@type {HTMLButtonElement}*/
let woodHouseButton;
//const saveCookieButton = document.getElementById('savecookie');
//const deleteCookieButton = document.getElementById('deletecookie');
/**@type {HTMLInputElement}*/
const saveUrl = document.getElementById('saveurl');
/**@type {HTMLButtonElement}*/
const copyButton = document.getElementById('copy');
/**@type {HTMLElement}*/
const logField = document.getElementById('log');
/**@type {Number}*/
let lumber = 0;
/**@type {Number}*/
let rocks = 0;
/**@type {Boolean}*/
let lines = false;
/**@type {String}*/
let direction = 'u';
/**@type {CanvasRenderingContext2D}*/
let ctx;
/**@type {Boolean}*/
let moving = false;

setButton.addEventListener("click", function () {
  grid_x = parseInt(heightField.value);
  grid_y = parseInt(widthField.value);
  grid_size = parseInt(gridField.value);
  lines = showLines.checked;
  calculate();
  draw();
});



/**@returns {String}*/
function game_str(){
  /**@type {String}*/
  let s = '';
  s += int12_to_b64(Math.round(grid_x));
  s += int12_to_b64(Math.round(grid_y));
  s += lines? "B": "A";
  s += int12_to_b64(maps[0].tiles.length);
  s += int12_to_b64(maps[0].tiles[0].length);
  /**@type {Array<Warp>}*/
  let warps = [];
  for(let i = 0; i < maps[0].tiles.length; i++){
    for(let j = 0; j < maps[0].tiles[0].length; j++){
      s += int6_to_b64(maps[0].tiles[i][j].mutating.int_id);
      if(maps[0].tiles[i][j].warp.enabled){
        warps.push(maps[0].tiles[i][j].warp);
      }
    }
  }
  s += int12_to_b64(Math.round(maps[0].start.x));
  s += int12_to_b64(Math.round(maps[0].start.y));
  s += int12_to_b64(Math.round(pos.x));
  s += int12_to_b64(Math.round(pos.y));
  s += direction;
  s += int12_to_b64(Math.round(lumber));
  s += int12_to_b64(Math.round(maps[0].time));
  s += int12_to_b64(Math.round(rocks));
  s += int12_to_b64(Math.round(grid_size));
  s += int12_to_b64(Math.round(maps.length - 1));
  /**@type {Number}*/
  let curmap = 0;
  for(let k = 1; k < maps.length; k++){
    if(map == maps[k]){
      curmap = k;
    }
    s += int12_to_b64(maps[k].tiles.length);
    s += int12_to_b64(maps[k].tiles[0].length);
    for(let i = 0; i < maps[k].tiles.length; i++){
      for(let j = 0; j < maps[k].tiles[0].length; j++){
        s += int6_to_b64(maps[k].tiles[i][j].mutating.int_id);
        if(maps[k].tiles[i][j].warp.enabled){
          warps.push(maps[k].tiles[i][j].warp);
        }
      }
    }
    s += int12_to_b64(Math.round(maps[k].start.x));
    s += int12_to_b64(Math.round(maps[k].start.y));
    s += int12_to_b64(Math.round(maps[k].time));
  }
  for(let i = 0; i < warps.length; i++){
    s += int12_to_b64(Math.round(warps[i].map));
    s += warps[i].direction;
    s += int12_to_b64(Math.round(warps[i].target.x));
    s += int12_to_b64(Math.round(warps[i].target.y));
  }
  s += int12_to_b64(Math.round(curmap));
  return compress_string(s);
}


/**@returns {void}*/
function page_log(/*String*/ s){
  logField.innerHTML =  logField.innerHTML + s;
}

/**@returns {void}*/
function page_log_clear(){
  logField.innerHTML =  '';
}

saveButton.addEventListener("click", function() {
  /**@type {String}*/
  let gs = game_str();
  saveUrl.value = `coledecarlo.github.io/webgame/#${gs}`;
  window.location = `#${gs}`;
});

/*
saveCookieButton.addEventListener("click", function () {
  setCookie('game', game_str(), 99999);
  if(getCookie('game') == ''){
    console.log("failed to set cookie");
  }
});
 */

copyButton.addEventListener("click", function() {
  saveUrl.select();
  document.execCommand('copy');
});




/**@returns {void}*/
function calculate(){
  width = grid_size * (grid_y + 0.1);
  height = grid_size * (grid_x + 0.1);
  mid_x = Math.floor(grid_x / 2);
  mid_y = Math.floor(grid_y / 2);
  canvas.width = width;
  canvas.height = height;
}




/**@returns {Promise}*/
function sleep(/*Number*/ ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**@returns {Tile}*/
function mutated_tile(/*Tile*/ tile) {
  return new Tile(
    tile.color,
    tile.land,
    `mutated_${tile.id}`,
    tile.deco.slice(),
    new Warp(),
    tile.mutating
  );
}

/**@type {Map<string, boolean>}*/
let keydown = new Map();


document.addEventListener("keyup", onKeyup);
/**@returns {void}*/
async function onKeyup(/*KeyboardEvent*/ event){
  switch (event.key) {
    case "ArrowDown":
    case "s":
      keydown.set('d', false);
      break;
    case "ArrowRight":
    case "d":
      keydown.set('r', false);
      break;
    case "ArrowUp":
    case "w":
      keydown.set('u', false);
      break;
    case "ArrowLeft":
    case "a":
      keydown.set('l', false);
      break;
  }
};

document.addEventListener("keydown", onKeydown);
/**@returns {void}*/
async function onKeydown(/*KeyboardEvent*/ event) {
  switch (event.key) {
    case "ArrowDown":
    case "s":
      direction = 'd';
      break;
    case "ArrowRight":
    case "d":
      direction = 'r';
      break;
    case "ArrowUp":
    case "w":
      direction = 'u';
      break;
    case "ArrowLeft":
    case "a":
      direction = 'l';
      break;
    case " ":
      if(!moving){
        action();
      }
      return;
    default:
      console.log(event.key);
      return;
  }
  keydown.set(direction, true);
  await sleep(80);
  if(!keydown.get(direction)){
    draw();
    return;
  }
  if(moving){
    return;
  }
  moving = true;
  do {
    /**@type {Point}*/
    let newPos = new Point(pos);
    switch (direction) {
      case "u":
        newPos.x--;
        break;
      case "d":
        newPos.x++;
        break;
      case "l":
        newPos.y--;
        break;
      case "r":
        newPos.y++;
        break;
    }
    if (validatePos(newPos) == true) {
      /**@type {Array<Point>}*/
      let newTrees = [];
      /**@type {Array<Object>}*/
      let newRocks = [];
      /**@type {Array<Point>}*/
      let growTrees = [];
      /**@type {Number}*/
      let prox = 10;
      for (let i = Math.round(Math.max(0, pos.x - prox)); i < Math.min(map.tiles.length, pos.x + prox); i++) {
        for (let j = Math.round(Math.max(0, pos.y - prox)); j < Math.min(map.tiles[0].length, pos.y + prox); j++) {
          /**@type {Number}*/
          let adjacent = 0;
          if (map.tiles[i][j].id == 'grass' && !(i == pos.x && j == pos.y) && !(i == newPos.x && j == newPos.y)) {
            for (let x = i - 1; x <= i + 1; x++) {
              for (let y = j - 1; y <= j + 1; y++) {
                if(x >= 0 && x < map.tiles.length && y >= 0 && y < map.tiles[0].length) {
                  if (map.tiles[x][y].id == 'grass_tree') {
                    adjacent++;
                  }
                  if (map.tiles[x][y].id == 'grass_big_tree') {
                    adjacent += 5;
                  }
                }
              }
            }
          }
          if (Math.random() < (adjacent * 0.0005)) {
            newTrees.push(new Point(i, j));
          }
          adjacent = 0;
          /**@type {Point}*/
          let dir = new Point();
          if (map.tiles[i][j].id == 'sand' && !(i == pos.x && j == pos.y) && !(i == newPos.x && j == newPos.y)) {
            for (let x = i - 1; x <= i + 1; x++) {
              for (let y = j - 1; y <= j + 1; y++) {
                if(x >= 0 && x < map.tiles.length && y >= 0 && y < map.tiles[0].length) {
                  if (map.tiles[x][y].id == 'water') {
                    if ((x - i + y - j) % 2 != 0) {
                      adjacent++;
                      dir.x = x - i;
                      dir.y = y - j;
                    }
                  }
                }
              }
            }
          }
          if (Math.random() < (adjacent * 0.001)) {
            newRocks.push({
              pos: new Point(i, j),
              dir: dir
            });
          }
          if (map.tiles[i][j].id == 'grass_tree' && Math.random() < 0.0001) {
            growTrees.push(new Point(i, j));
          }
        }
      }
      /**@type {Point}*/
      let d = new Point(
        newPos.x - pos.x,
        newPos.y - pos.y
      );
      /**@type {Number}*/
      let steps = 10;
      for (let i = 0; i < 1; i = Math.round(steps * i + 1) / steps) {
        await sleep(20);
        map.time += 1 / 10;
        pos.x += d.x / steps;
        pos.y += d.y / steps;
        /**@type {Tile}*/
        let newTree = mutated_tile(grass_tree);
        newTree.deco[0] = deco_part_grad(null_trunk, trunk, i);
        newTree.deco[1] = deco_part_grad(null_leaves, leaves, i);
        /**@type {Tile}*/
        let growTree = mutated_tile(grass_tree);
        growTree.deco[0] = deco_part_grad(trunk, big_trunk, i);
        growTree.deco[1] = deco_part_grad(leaves, big_leaves, i);
        for (let j = 0; j < newTrees.length; j++) {
          /**@type {Point}*/
          let ind = newTrees[j];
          map.tiles[ind.x][ind.y] = newTree;
        }
        for (let j = 0; j < growTrees.length; j++) {
          /**@type {Point}*/
          let ind = growTrees[j];
          map.tiles[ind.x][ind.y] = growTree;
        }
        for (let j = 0; j < newRocks.length; j++) {
          /**@type {Object}*/
          let ind = newRocks[j];
          map.tiles[ind.pos.x][ind.pos.y] = mutated_tile(sand);
          map.tiles[ind.pos.x][ind.pos.y].deco[0] = rock_wash(i, ind.dir);
        }
        draw();
      }
      for (let j = 0; j < newTrees.length; j++) {
        /**@type {Point}*/
        let ind = newTrees[j];
        map.tiles[ind.x][ind.y] = grass_tree;
      }
      for (let j = 0; j < newRocks.length; j++) {
        /**@type {Object}*/
        let ind = newRocks[j];
        map.tiles[ind.pos.x][ind.pos.y] = sand_rock;
      }
      for (let j = 0; j < growTrees.length; j++) {
        /**@type {Point}*/
        let ind = growTrees[j];
        map.tiles[ind.x][ind.y] = grass_big_tree;
      }
      pos.x = Math.round(pos.x);
      pos.y = Math.round(pos.y);
      map.time = Math.round(map.time) % 4096;
    }
    else{
      draw();
      break;
    }
    draw();
  }
  while(keydown.get(direction));
  moving = false;
};


/**@returns {void}*/
function fillTileColor(/*Number*/ x, /*Number*/ y, /*Color*/ color) {
  ctx.fillStyle = color.to_string();
  if(lines) {
    ctx.fillRect(
      y * grid_size + 1,
      x * grid_size + 1,
      grid_size - 1,
      grid_size - 1
    );
  }
  else{
    ctx.fillRect(
      y * grid_size,
      x * grid_size,
      grid_size + (0.5),
      grid_size + (0.5),
    );
  }
}
/**@returns {void}*/
function fillTile(/*Number*/ x, /*Number*/ y, /*Tile*/ tile) {
  fillTileColor(x, y, tile.color);
}

/**@returns {Boolean}*/
function validatePos(/*Point*/ newPos){
  if(newPos.x < 0
  || newPos.y < 0
  || newPos.x >= map.tiles.length
  || newPos.y >= map.tiles[0].length
  ){
    return false;
  }
  if(!map.tiles[Math.round(newPos.x)][Math.round(newPos.y)].land){
    return false;
  }
  return true;
}

/**@returns {void}*/
function board() {
  document.querySelectorAll("button").forEach( function(item) {
    item.addEventListener('focus', function() {
      this.blur();
    });
  });
  /**@type {HTMLElement}*/
  let htmlversion = document.getElementById('version');
  if(parseInt(htmlversion.innerText) != version || classes_version != version || tiles_version != version){
    htmlversion.innerText = 'Version error! Clear browser cache.';
  }
  /**@type {Boolean}*/
  let init = false;
  /**@type {String}*/
  let url = window.location.href;
  /**@type {Number}*/
  let poss = url.indexOf('#') + 1;
  /**@type {String}*/
  let s = '';
  if(poss > 0){
    init = true;
    s = decompress_string(url.substr(poss));
  }
  else{
    /**@type {String}*/
    let cookie = getCookie('game');
    if(cookie != ''){
      init = true;
      s = decompress_string(cookie);
    }
  }
  if(init){
    /**@type {Array<Object>>}*/
    let warppts = [];
    /**@type {Number}*/
    let k = 0;
    grid_x = b642_to_int12(s.substr(k, k + 2));
    k += 2;
    grid_y = b642_to_int12(s.substr(k, k + 2));
    k += 2;
    lines = s[k] == 'B';
    k += 1;
    /**@type {Number}*/
    let x = b642_to_int12(s.substr(k, k + 2));
    k += 2;
    /**@type {Number}*/
    let y = b642_to_int12(s.substr(k, k + 2));
    k += 2;
    /**@type {Array<Array<Tile>>}*/
    let tiles = [];
    for(let i = 0; i < x; i++){
      tiles[i] = [];
      for(let j = 0; j < y; j++){
        tiles[i][j] = tile_ref[b641_to_int6(s[k + i * y + j])];
        if(tiles[i][j].warp.enabled) {
          warppts.push({
            map: 0,
            pos: new Point(i, j)
          });
        }
      }
    }
    k += x * y;
    maps.push(new TileMap(
      tiles,
      new Point(
        b642_to_int12(s.substr(k, k + 2)),
        b642_to_int12(s.substr(k + 2, k + 4))
      )
    ));
    k += 4;
    pos = new Point(
      b642_to_int12(s.substr(k, k + 2)),
      b642_to_int12(s.substr(k + 2, k + 4))
    );
    k += 4;
    direction = s[k];
    k += 1;
    lumber = b642_to_int12(s.substr(k, k + 2));
    k += 2;
    if(k < s.length){
      maps[0].time = b642_to_int12(s.substr(k, k + 2));
      k += 2;
      rocks = b642_to_int12(s.substr(k, k + 2));
      k += 2;
    }
    else{
      maps[0].time = 0;
      rocks = 0;
    }
    if(k < s.length){
      grid_size = b642_to_int12(s.substr(k, k + 2));
      k += 2;
    }
    else{
      grid_size = 60;
    }
    if(k < s.length){
      /**@type {Number}*/
      let n = b642_to_int12(s.substr(k, k + 2));
      k += 2;
      for(let l = 0; l < n; l++) {
        x = b642_to_int12(s.substr(k, k + 2));
        k += 2;
        y = b642_to_int12(s.substr(k, k + 2));
        k += 2;
        tiles = [];
        for (let i = 0; i < x; i++) {
          tiles[i] = [];
          for (let j = 0; j < y; j++) {
            tiles[i][j] = tile_ref[b641_to_int6(s[k + i * y + j])];
            if (tiles[i][j].warp.enabled) {
              warppts.push({
                map: l + 1,
                pos: new Point(i, j)
              });
            }
          }
        }
        k += x * y;
        maps.push(new TileMap(
          tiles,
          new Point(
            b642_to_int12(s.substr(k, k + 2)),
            b642_to_int12(s.substr(k + 2, k + 4))
          ),
          b642_to_int12(s.substr(k + 4, k + 6)),
        ));
        k += 6;
      }
      for(let i = 0; i < warppts.length; i++){
        maps[warppts[i].map].tiles[warppts[i].pos.x][warppts[i].pos.y] = mutated_tile(maps[warppts[i].map].tiles[warppts[i].pos.x][warppts[i].pos.y]);
        maps[warppts[i].map].tiles[warppts[i].pos.x][warppts[i].pos.y].warp = new Warp(
          true,
          b642_to_int12(s.substr(k, k + 2)),
          s[k + 2],
          new Point(
            b642_to_int12(s.substr(k + 3, k + 5)),
            b642_to_int12(s.substr(k + 5, k + 7))
          )
        );
        k += 7
      }
      map = maps[b642_to_int12(s.substr(k, k + 2))];
      k += 2;
    }
    else{
      map = maps[0];
    }
  }
  if(detectmob()){
    grid_x = 19;
    grid_y = 11;
    grid_size = 30;
    document.getElementById('desktoponly').remove();
    document.getElementById('dofoot').remove();
    canvas.setAttribute('style', 'right: 0%; position: relative; touch-action: none !important;');
    grid_size = Math.ceil(window.innerWidth / grid_y);
    grid_x = Math.floor((window.innerHeight - 128) / grid_size);
  }
  calculate();
  heightField.value = grid_x;
  widthField.value = grid_y;
  gridField.value = grid_size;
  if (canvas.getContext) {
    ctx = canvas.getContext('2d');
    if(!init) {
      maps.push(generateMap(100, 100));
      pos = new Point(maps[0].start);
      map = maps[0];
    }
    draw();
  }
}

/**@returns {void}*/
function drawLines(){
  for (let i = -(pos.y % 1) * grid_size; i < width; i += grid_size) {
    ctx.moveTo(i + 0.5, 0.5);
    ctx.lineTo(i + 0.5, height - grid_size * 0.1 + 0.5);
    ctx.stroke();
  }
  for (let i = -(pos.x % 1) * grid_size; i < height; i += grid_size) {
    ctx.moveTo(0.5, i + 0.5);
    ctx.lineTo(width - grid_size * 0.1 + 0.5, i + 0.5);
    ctx.stroke();
  }
}

/**@type {Map<Tile, TileMap>}*/
let interior = new Map();

/**@type {Map<Tile, Point>}*/
let exterior = new Map();



interior.set(wood_house_warp, wood_house_map);
exterior.set(wood_house_warp, new Point(1, 3));

/**@returns {void}*/
function build(/*Tile*/ tile) {
  if(map != maps[0]){
    return;
  }
  pos.round();
  /**@type {Point}*/
  let p = facing();
  /**@type {Boolean}*/
  let clear = true;
  /**@type {TileMap}*/
  let newMap;
  /**@type {Point}*/
  let dim = exterior.get(tile);
  switch(direction){
    case "u":
      for(let i = pos.x - dim.x; i < pos.x; i++){
        for(let j  = pos.y - Math.floor(dim.y / 2); j < pos.y + Math.ceil(dim.y / 2); j++){
          if(!(i >= 0 && i < map.tiles.length && j >= 0 && j < map.tiles[0].length && map.tiles[i][j].land)){
            clear = false;
            break;
          }
        }
      }
      if(!clear){
        return;
      }
      for(let i = pos.x - dim.x; i < pos.x; i++){
        for(let j  = pos.y - Math.floor(dim.y / 2); j < pos.y + Math.ceil(dim.y / 2); j++){
          map.tiles[i][j] = blank;
        }
      }
      maps.push(new TileMap(interior.get(tile)));
      map.tiles[pos.x - 1][pos.y] = mutated_tile(tile);
      map.tiles[pos.x - 1][pos.y].warp = new Warp(true, maps.length - 1, 'u');
      newMap = maps[maps.length - 1];
      newMap.tiles[newMap.start.x + 1][newMap.start.y] = mutated_tile(exit_warp);
      newMap.tiles[newMap.start.x + 1][newMap.start.y].warp = new Warp(true, 0, 'd', new Point(pos));
      lumber -= 10;
      break;
    case "d":
      for(let i = pos.x + 1; i < pos.x + dim.x + 1; i++){
        for(let j  = pos.y - Math.floor(dim.y / 2); j < pos.y + Math.ceil(dim.y / 2); j++){
          if(!(i >= 0 && i < map.tiles.length && j >= 0 && j < map.tiles[0].length && map.tiles[i][j].land)){
            clear = false;
            break;
          }
        }
      }
      if(!clear){
        return;
      }
      for(let i = pos.x + 1; i < pos.x + dim.x + 1; i++){
        for(let j  = pos.y - Math.floor(dim.y / 2); j < pos.y + Math.ceil(dim.y / 2); j++){
          map.tiles[i][j] = blank;
        }
      }
      maps.push(new TileMap(interior.get(tile)));
      map.tiles[pos.x + dim.x][pos.y] = mutated_tile(tile);
      map.tiles[pos.x + dim.x][pos.y].warp = new Warp(true, maps.length - 1, 'u');
      newMap = maps[maps.length - 1];
      newMap.tiles[newMap.start.x + 1][newMap.start.y] = mutated_tile(exit_warp);
      newMap.tiles[newMap.start.x + 1][newMap.start.y].warp = new Warp(true, 0, 'd', new Point(pos.x + dim.x + 1, pos.y));
      lumber -= 10;
      break;
    case "l":
      for(let i = pos.x - dim.x + 1; i < pos.x + 1; i++){
        for(let j  = pos.y - dim.y; j < pos.y; j++){
          if(!(i >= 0 && i < map.tiles.length && j >= 0 && j < map.tiles[0].length && map.tiles[i][j].land)){
            clear = false;
            break;
          }
        }
      }
      if(!clear){
        return;
      }
      for(let i = pos.x - dim.x + 1; i < pos.x + 1; i++){
        for(let j  = pos.y - dim.y; j < pos.y; j++){
          map.tiles[i][j] = blank;
        }
      }
      maps.push(new TileMap(interior.get(tile)));
      map.tiles[pos.x][pos.y - Math.ceil(dim.y / 2)] = mutated_tile(tile);
      map.tiles[pos.x][pos.y - Math.ceil(dim.y / 2)].warp = new Warp(true, maps.length - 1, 'u');
      newMap = maps[maps.length - 1];
      newMap.tiles[newMap.start.x + 1][newMap.start.y] = mutated_tile(exit_warp);
      newMap.tiles[newMap.start.x + 1][newMap.start.y].warp = new Warp(true, 0, 'd', new Point(pos.x + 1, pos.y - Math.ceil(dim.y / 2)));
      lumber -= 10;
      break;
    case "r":
      for(let i = pos.x - dim.x + 1; i < pos.x + 1; i++){
        for(let j  = pos.y + 1; j < pos.y + dim.y + 1; j++){
          if(!(i >= 0 && i < map.tiles.length && j >= 0 && j < map.tiles[0].length && map.tiles[i][j].land)){
            clear = false;
            break;
          }
        }
      }
      if(!clear){
        return;
      }
      for(let i = pos.x - dim.x + 1; i < pos.x + 1; i++){
        for(let j  = pos.y + 1; j < pos.y + dim.y + 1; j++){
          map.tiles[i][j] = blank;
        }
      }
      maps.push(new TileMap(interior.get(tile)));
      map.tiles[pos.x][pos.y + Math.ceil(dim.y / 2)] = mutated_tile(tile);
      map.tiles[pos.x][pos.y + Math.ceil(dim.y / 2)].warp = new Warp(true, maps.length - 1, 'u');
      newMap = maps[maps.length - 1];
      newMap.tiles[newMap.start.x + 1][newMap.start.y] = mutated_tile(exit_warp);
      newMap.tiles[newMap.start.x + 1][newMap.start.y].warp = new Warp(true, 0, 'd', new Point(pos.x + 1, pos.y + Math.ceil(dim.y / 2)));
      lumber -= 10;
      break;
  }
  draw();
}

/**@returns {void}*/
function draw() {
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);
  if(lines) {
    drawLines();
  }
  for(let i = -(pos.x % 1); i < grid_x; i++){
    for(let j = -(pos.y % 1); j < grid_y; j++){
      /**@type {Number}*/
      let x = Math.round(i - mid_x + pos.x);
      /**@type {Number}*/
      let y = Math.round(j - mid_y + pos.y);
      /**@type {Tile}*/
      let tile;
      if(x >= 0 && x < map.tiles.length && y >= 0 && y < map.tiles[0].length){
        tile = map.tiles[x][y];
      }
      if(tile == undefined){
        tile = blank;
      }
      fillTile(i, j, tile);
    }
  }
  for(let i = -(pos.x % 1) - 1; i < grid_x + 1; i++){
    for(let j = -(pos.y % 1) - 1; j < grid_y + 1; j++){
      /**@type {Number}*/
      let x = Math.round(i - mid_x + pos.x);
      /**@type {Number}*/
      let y = Math.round(j - mid_y + pos.y);
      /**@type {Tile}*/
      let tile;
      if(x >= 0 && x < map.tiles.length && y >= 0 && y < map.tiles[0].length){
        tile = map.tiles[x][y];
      }
      if(tile == undefined){
        tile = blank;
      }
      for(let k = 0; k < tile.deco.length; k++){
        if(tile.deco[k].priority == -1) {
          tile.deco[k].draw(i, j);
        }
      }
    }
  }
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(
    (mid_y + 0.5) * grid_size,
    (mid_x + 0.5) * grid_size,
    grid_size * 0.3,
    0,
    2 * Math.PI
  );
  ctx.fill();
  ctx.fillStyle = '#FF0000';
  ctx.beginPath();
  /**@type {Point}*/
  let d = new Point();
  switch(direction){
    case 'u':
      d.x = -0.3;
      break;
    case 'd':
      d.x = 0.3;
      break;
    case 'l':
      d.y = -0.3;
      break;
    case 'r':
      d.y = 0.3;
      break;
  }
  ctx.arc(
    (mid_y + 0.5 + d.y) * grid_size,
    (mid_x + 0.5 + d.x) * grid_size,
    grid_size * 0.05,
    0,
    2 * Math.PI
  );
  ctx.fill();
  for(let p = 1; p <= 3; p++) {
    for (let i = -(pos.x % 1) - 2; i < grid_x + 2; i++) {
      for (let j = -(pos.y % 1) - 2; j < grid_y + 2; j++) {
        let x = Math.round(i - mid_x + pos.x);
        let y = Math.round(j - mid_y + pos.y);
        let tile;
        if (x >= 0 && x < map.tiles.length && y >= 0 && y < map.tiles[0].length) {
          tile = map.tiles[x][y];
        }
        if (tile == undefined) {
          tile = blank;
        }
        for (let k = 0; k < tile.deco.length; k++) {
          if (tile.deco[k].priority == p) {
            tile.deco[k].draw(i, j);
          }
        }
      }
    }
  }
  ctx.fillStyle = 'white';
  ctx.fillRect(grid_y * grid_size, 0, grid_size, height);
  ctx.fillRect(0, grid_x * grid_size, width, grid_size);
  if(!detectmob()) {
    ctx.strokeRect(0.5, 0.5, grid_y * grid_size, grid_x * grid_size);
  }
  lumberLabel.innerText = lumber;
  rocksLabel.innerText = rocks;
  if(lumber >= 10){
    if(woodHouseHolder.innerHTML == '') {
      woodHouseHolder.innerHTML = `<button id="woodhouse">Wood Building</button>`;
      woodHouseButton = document.getElementById('woodhouse');
      woodHouseButton.addEventListener('click', function(e){
        build(wood_house_warp);
      });
      woodHouseButton.addEventListener('focus', function(e){
        woodHouseButton.blur();
      });

    }
  }
  else{
    if(woodHouseHolder.innerHTML != '') {
      woodHouseButton.remove();
    }
  }
}

/**@returns {TypeMap}*/
function generateMap(/*Number*/ h, /*Number*/ w){
  /**@type {TileMap}*/
  let newMap = new TileMap();
  /**@type {Number}*/
  let area = Math.sqrt(w * h);
  for(let i = 0; i < h; i++){
    newMap.tiles[i] = [];
    for(let j = 0; j < w; j++){
      newMap.tiles[i][j] = water;
    }
  }
  for(let i = 0; i < h; i++){
    for(let j = 0; j < w; j++){
      if(Math.random() < 0.3 / area){
        newMap.insertMapElement(seed, i - 1, j - 1);
      }
    }
  }
  for(let k = 0; k < Math.floor(area / 2); k++){
    for(let i = 0; i < h; i++){
      for(let j = 0; j < w; j++){
        /**@type {Number}*/
        let adjacent = 0;
        if(newMap.tiles[i][j].id == 'water'){
          for(let x = i - 1; x <= i + 1; x++){
            for(let y = j - 1; y <= j + 1; y++){
              if(x >= 0 && x < newMap.tiles.length && y >= 0 && y < newMap.tiles[0].length){
                if(newMap.tiles[x][y].id == 'sand'){
                  adjacent++;
                }
              }
            }
          }
        }
        if(adjacent > 0 && Math.random() < (adjacent - 1) * 0.08){
          newMap.tiles[i][j] = sand;
        }
      }
    }
  }
  for(let k = 0; k < Math.floor(area / 2); k++){
    for(let i = 0; i < h; i++){
      for(let j = 0; j < w; j++){
        /**@type {Number}*/
        let adjacent = 0;
        if(newMap.tiles[i][j].id == 'sand'){
          for(let x = i - 1; x <= i + 1; x++){
            for(let y = j - 1; y <= j + 1; y++){
              if(x >= 0 && x < newMap.tiles.length && y >= 0 && y < newMap.tiles[0].length){
                if(newMap.tiles[x][y].id == 'grass'){
                  adjacent++;
                }
                if(newMap.tiles[x][y].id == 'water'){
                  adjacent -= 3;
                }
              }
            }
          }
        }
        if(adjacent > 0 && Math.random() < (adjacent + 1) * 0.08){
          newMap.tiles[i][j] = grass;
        }
      }
    }
  }
  /**@type {Array<Point>}*/
  let grasses = [];
  for(let i = 0; i < h; i++){
    for(let j = 0; j < w; j++){
      if(newMap.tiles[i][j].id == 'grass'){
        if(Math.random() < 0.1){
          if(Math.random() < 0.01){
            newMap.tiles[i][j] = grass_big_tree;
          }
          else{
            newMap.tiles[i][j] = grass_tree;
          }
        }
        else{
          grasses.push(new Point(i, j));
        }

      }
    }
  }
  newMap.start = grasses[Math.floor(Math.random() * grasses.length)];
  newMap.time = 0;
  return newMap;
}

/**@returns {Point}*/
function facing() {
  /**@type {Point}*/
  let d = new Point();
  switch(direction){
    case 'u':
      d.x = -1;
      break;
    case 'd':
      d.x = 1;
      break;
    case 'l':
      d.y = -1;
      break;
    case 'r':
      d.y = 1;
  }
  return new Point(
    pos.x + d.x,
    pos.y + d.y
  );
}

/**@returns {void}*/
function action(){
  /**@type {Point}*/
  let targetPos = facing();
  switch(map.tiles[targetPos.x][targetPos.y].id){
    case 'grass_tree':
      map.tiles[targetPos.x][targetPos.y] = grass;
      lumber++;
      break;
    case 'grass_big_tree':
      map.tiles[targetPos.x][targetPos.y] = grass;
      lumber += 5;
      break;
    case 'water':
      if(lumber >= 2) {
        map.tiles[targetPos.x][targetPos.y] = bridge;
        lumber -= 2;
      }
      break;
    case 'grass_rock':
      map.tiles[targetPos.x][targetPos.y] = grass;
      rocks++;
      break;
    case 'sand_rock':
      map.tiles[targetPos.x][targetPos.y] = sand;
      rocks++;
      break;
    case 'grass':
      if(rocks > 0) {
        map.tiles[targetPos.x][targetPos.y] = grass_rock;
        rocks--;
      }
      break;
    case 'sand':
      if(rocks > 0) {
        map.tiles[targetPos.x][targetPos.y] = sand_rock;
        rocks--;
      }
      break;
    case 'wood_floor':
      if(rocks > 0) {
        map.tiles[targetPos.x][targetPos.y] = wood_floor_rock;
        rocks--;
      }
      break;
    case 'wood_floor_rock':
      map.tiles[targetPos.x][targetPos.y] = wood_floor;
      rocks++;
      break;
    case 'bridge':
      map.tiles[targetPos.x][targetPos.y] = water;
      lumber++;
      break;
    default:
      if(map.tiles[targetPos.x][targetPos.y].warp.enabled && map.tiles[targetPos.x][targetPos.y].warp.direction.includes(direction)){
        pos = new Point(map.tiles[targetPos.x][targetPos.y].warp.target);
        map = maps[map.tiles[targetPos.x][targetPos.y].warp.map];
      }
      break;
  }
  draw();
}



/**@type {String}*/
const b64Str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
/**@type {Map<String, Number>}*/
let reverseb64 = new Map();
for(let i = 0; i < 64; i++){
  reverseb64.set(b64Str[i], i);
}

/**@returns {String}*/
function int12_to_b64(/*Number*/ int){
  return b64Str[Math.floor(int / 64)] + b64Str[int % 64]
}
/**@returns {Number}*/
function b642_to_int12(/*String*/ b64){
  return reverseb64.get(b64[0]) * 64 + reverseb64.get(b64[1]);
}
/**@returns {String}*/
function int6_to_b64(/*Number*/ int){
  return b64Str[int]
}
/**@returns {Number}*/
function b641_to_int6(/*String*/ b64){
  return reverseb64.get(b64[0]);
}

/**@returns {String}*/
function compress_string(/*String*/ s){
  if(s[s.length - 1] == s[s.length - 2]){
    s += '=';
  }
  /**@type {String}*/
  let lc = s[0];
  /**@type {Number}*/
  let li = 0;
  /**@type {Boolean}*/
  let inPar = false;
  for(let i = 1; i < s.length; i++){
    if(inPar){
      if(s[i] == ')'){
        lc = s[i + 1];
        li = i + 1;
        inPar = false;
      }
      continue;
    }
    if(s[i] == lc){
      continue;
    }
    if(s[i] == '('){
      inPar = true;
      continue;
    }
    if(i - li > 4){
      return compress_string(`${s.substr(0, li + 1)}(${i - li})${s.substr(i)}`);
    }
    li = i;
    lc = s[i];
  }
  return s;
}
/**@returns {String}*/
function decompress_string(/*String*/ s){
  if(s[s.length - 1] == '='){
    s = s.substr(0, s.length - 1);
  }
  /**@type {Boolean}*/
  let inPar = false;
  /**@type {String}*/
  let num = '';
  /**@type {Number}*/
  let li = 0;
  for(let i = 0; i < s.length; i++){
    if(inPar){
      if(s[i] == ')'){
        return decompress_string(`${s.substr(0, li - 1)}${s[li - 1].repeat(parseInt(num))}${s.substr(i + 1)}`);
      }
      else{
        num += s[i]
      }
      continue;
    }
    if(s[i] == '('){
      inPar = true;
      num = '';
      li = i;
      continue;
    }
  }
  return s;
}

/**@returns {void}*/
function setCookie(/*string*/ cname, /*String*/ cvalue, /*Number*/ exdays) {
  /**@type {Date}*/
  let d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  /**@type {String}*/
  let expires = `expires=${d.toUTCString()}`;
  document.cookie = `${cname}=${cvalue};${expires};path=/`;
}
/**@returns {String}*/
function getCookie(/*String*/ cname) {
  /**@type {String}*/
  let name = `${cname}=`;
  /**@type {String}*/
  let decodedCookie = decodeURIComponent(document.cookie);
  /**@type {Array<String>}*/
  let ca = decodedCookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    /**@type {String}*/
    let c = ca[i];
    while(c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if(c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}




/**@returns {void}*/
async function simulateKeypress(a){
  onKeydown({
    key: a
  });
  await sleep(90);
  onKeyup({
    key: a
  });
}

canvas.addEventListener('click', function(event){
  simulateKeypress(' ');
});

/**@returns {Boolean}*/
function detectmob() {
  if(window.innerWidth <= 600) {
    return true;
  } else {
    return false;
  }
}

$(document).on('touchmove', function(e) {
  e.preventDefault();
});

$(document).on('touchstart', function(e) {
  if (e.target.nodeName !== 'INPUT') {
    e.preventDefault();
  }
});


//https://stackoverflow.com/questions/2264072/detect-a-finger-swipe-through-javascript-on-the-iphone-and-android

document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);

let xDown = null;
let yDown = null;

function getTouches(evt) {
  return evt.touches ||             // browser API
    evt.originalEvent.touches; // jQuery
}

function handleTouchStart(evt) {
  const firstTouch = getTouches(evt)[0];
  xDown = firstTouch.clientX;
  yDown = firstTouch.clientY;
};

function handleTouchMove(evt) {
  if ( ! xDown || ! yDown ) {
    return;
  }

  let xUp = evt.touches[0].clientX;
  let yUp = evt.touches[0].clientY;

  let xDiff = xDown - xUp;
  let yDiff = yDown - yUp;

  if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {//most significant
    if ( xDiff > 0 ) {
      simulateKeypress('a');
    } else {
      simulateKeypress('d');
    }
  } else {
    if ( yDiff > 0 ) {
      simulateKeypress('w');
    } else {
      simulateKeypress('s');
    }
  }
  // reset values
  xDown = null;
  yDown = null;
};

