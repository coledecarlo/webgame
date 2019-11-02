const version = 4;
var pos;
var map;
const grid_size = 60;
var grid_x = 13;
var grid_y = 23;
var width;
var height;
var mid_x;
var mid_y;
const canvas = document.getElementById('board');
const showLines = document.getElementById('lines');
const heightField = document.getElementById('height');
const widthField = document.getElementById('width');
const lumberLabel = document.getElementById('lumber');
const rocksLabel = document.getElementById('rocks');
const setButton = document.getElementById('set');
const saveButton = document.getElementById('save');
//const saveCookieButton = document.getElementById('savecookie');
//const deleteCookieButton = document.getElementById('deletecookie');
const saveUrl = document.getElementById('saveurl');
const copyButton = document.getElementById('copy');
var lumber = 0;
var rocks = 0;
var lines = false;
var direction = 'u';
var ctx;
var moving = false;

setButton.addEventListener("click", function () {
  grid_x = parseInt(heightField.value);
  grid_y = parseInt(widthField.value);
  lines = showLines.checked;
  calculate();
  draw();
});

function  game_str(){
  let s = '';
  s += int12_to_b64(Math.round(grid_x));
  s += int12_to_b64(Math.round(grid_y));
  s += lines? "B": "A";
  s += int12_to_b64(map.tiles.length);
  s += int12_to_b64(map.tiles[0].length);
  for(let i = 0; i < map.tiles.length; i++){
    for(let j = 0; j < map.tiles[0].length; j++){
      s += int6_to_b64(map.tiles[i][j].int_id);
    }
  }
  s += int12_to_b64(Math.round(map.start.x));
  s += int12_to_b64(Math.round(map.start.y));
  s += int12_to_b64(Math.round(pos.x));
  s += int12_to_b64(Math.round(pos.y));
  s += direction;
  s += int12_to_b64(Math.round(lumber));
  s += int12_to_b64(Math.round(map.time));
  s += int12_to_b64(Math.round(rocks));
  return compress_string(s);
}

saveButton.addEventListener("click", function () {
  let gs = game_str();
  saveUrl.value = "coledecarlo.github.io/webgame#" + gs;
  window.location = "#" + gs;
});

/*
saveCookieButton.addEventListener("click", function () {
  setCookie('game', game_str(), 99999);
  if(getCookie('game') == ''){
    console.log("failed to set cookie");
  }
});
 */

copyButton.addEventListener("click", function () {
  saveUrl.select();
  document.execCommand('copy');
});

function calculate(){
  width = grid_size * (grid_y + 0.1);
  height = grid_size * (grid_x + 0.1);
  mid_x = Math.floor(grid_x / 2);
  mid_y = Math.floor(grid_y / 2);
  canvas.width = width;
  canvas.height = height;
}

function parse_color(cs){
  let can = document.createElement("canvas");
  can.height = 1;
  can.width = 1;
  let con = can.getContext('2d');
  con.fillStyle = cs;
  con.fillRect(0, 0, 1, 1);
  let img = con.getImageData(0, 0, 1, 1);
  can.remove();
  return {
    r: img.data[0],
    g: img.data[1],
    b: img.data[2],
    a: img.data[3]
  }
}


function drawLeaves(x, y, obj){
  x *= grid_size;
  y *= grid_size;
  for(let i = obj.width; i > 0; i -= 0.1) {
    ctx.fillStyle = 'rgba(' + (obj.color.r * (1 - i)) + ',' + (obj.color.g * (1 - i)) + ',' + (obj.color.b * (1 - i)) + ',' + (1.1 - i) + ')';
    ctx.beginPath();
    ctx.arc(y + 0.5 * grid_size,
      x + (1 - obj.height) * grid_size,
      grid_size * i,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }
}
function drawTrunk(x, y, obj){
  x *= grid_size;
  y *= grid_size;
  ctx.fillStyle = 'rgba(' + obj.color.r + ',' + obj.color.g + ',' + obj.color.b + ',' + obj.color.a + ')';
  ctx.fillRect(y + (1 - obj.width) / 2 * grid_size, x + (1 - obj.height) * grid_size, obj.width * grid_size, obj.height * grid_size);
}

function color_grad(c1, c2, i){
  return {
    r: c1.r + i * (c2.r - c1.r),
    g: c1.g + i * (c2.g - c1.g),
    b: c1.b + i * (c2.b - c1.b),
    a: c1.a + i * (c2.a - c1.a)
  };
}

function trunk_grad(t1, t2, i){
  let ret = {
    width:  t1.width  + i * (t2.width  - t1.width ),
    height: t1.height + i * (t2.height - t1.height),
    color:  color_grad(t1.color, t2.color, i),
    draw: (x, y) => {
      drawTrunk(x, y, ret);
    },
    priority: 1
  };
  return ret;
}
function leaves_grad(t1, t2, i){
  let ret = {
    width:  t1.width  + i * (t2.width  - t1.width ),
    height: t1.height + i * (t2.height - t1.height),
    color:  color_grad(t1.color, t2.color, i),
    draw: (x, y) => {
      drawLeaves(x, y, ret);
    },
    priority: 2
  };
  return ret;
}


const leaves = {
  width:   0.6,
  height:  0.85,
  color: {
    r: 0,
    g: 255,
    b: 0,
    a: 255
  },
  draw: (x, y) => {
    drawLeaves(x, y, leaves);
  },
  priority: 2
};
const trunk = {
  width:  0.35,
  height: 0.85,
  color:  parse_color('brown'),
  draw: (x, y) => {
    drawTrunk(x, y, trunk);
  },
  priority: 1
};
const big_leaves = {
  width:   0.9,
  height:  1.2,
  color: {
    r: 0,
    g: 255,
    b: 0,
    a: 255
  },
  draw: (x, y) => {
    drawLeaves(x, y, big_leaves);
  },
  priority: 3
};
const big_trunk = {
  width:  0.6,
  height: 1.2,
  color:  parse_color('brown'),
  draw: (x, y) => {
    drawTrunk(x, y, big_trunk);
  },
  priority: 1
};
const null_leaves = {
  width:   0,
  height:  0,
  color: {
    r: 0,
    g: 255,
    b: 0,
    a: 255
  },
  draw: (x, y) => {
    drawLeaves(x, y, null_leaves);
  },
  priority: -1
};
const null_trunk = {
  width:  0,
  height: 0,
  color:  parse_color('brown'),
  draw: (x, y) => {
    drawTrunk(x, y, null_trunk);
  },
  priority: -1
};
const rock = rock_wash(1, {
  x: 0,
  y: 1
});

const blank = {
  color: '#000000',
  land: false,
  id: 'blank',
  deco: []
};
const grass = {
  color: '#40FF50',
  land: true,
  id: 'grass',
  deco: []
};
const water = {
  color: '#4050FF',
  land: false,
  id: 'water',
  deco: []
};
const sand = {
  color: '#EAEA70',
  land: true,
  id: 'sand',
  deco: []
};
const bridge = {
  color: 'brown',
  land: true,
  id: 'bridge',
  deco: []
};
const grass_tree = {
  color: grass.color,
  land: false,
  id: 'grass_tree',
  deco: [trunk, leaves]
};
const grass_big_tree = {
  color: grass.color,
  land: false,
  id: 'grass_big_tree',
  deco: [big_trunk, big_leaves]
};
const grass_rock = {
  color: grass.color,
  land: false,
  id: 'grass_rock',
  deco: [rock]
};
const sand_rock = {
  color: sand.color,
  land: false,
  id: 'sand_rock',
  deco: [rock]
}
const tile_ref = [
  blank,
  grass,
  water,
  sand,
  bridge,
  grass_tree,
  grass_big_tree,
  sand_rock,
  grass_rock
];
for(let i = 0; i < tile_ref.length; i++){
  tile_ref[i].int_id = i;
}
const g = grass;
const s = sand;
const w = water;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function mutated_tile(tile) {
  return {
    color: tile.color,
    land: tile.land,
    id: 'mutated_' + tile.id,
    deco: []
  };
}

function rock_wash(i, dir) {
  return {
    draw: (x, y) => {
      let j = [];
      if(i < 1 / 3){
        j = [3 * i, 0, 0];
      }
      else if(i < 2 / 3){
        j = [1, 3 * i - 1, 0];
      }
      else{
        j = [1, 1, 3 * i - 2];
      }
      x *= grid_size;
      y *= grid_size;
      ctx.fillStyle = '#C0C0C0';
      ctx.fillRect(y + (0.1 + (1 - j[0]) * dir.y) * grid_size, x + (0.1 + (1 - j[0]) * dir.x) * grid_size, 0.6 * grid_size, 0.6 * grid_size);
      ctx.fillStyle = '#707070';
      ctx.fillRect(y + (0.4 + (1 - j[1]) * dir.y) * grid_size, x + (0.3 + (1 - j[1]) * dir.x) * grid_size, 0.5 * grid_size, 0.5 * grid_size);
      ctx.fillStyle = '#909090';
      ctx.fillRect(y + (0.3 + (1 - j[2]) * dir.y) * grid_size, x + (0.6 + (1 - j[2]) * dir.x) * grid_size, 0.3 * grid_size, 0.3 * grid_size);
    },
    priority: -1
  };
}

var keydown = new Map();

document.addEventListener("keyup", async function onEvent(event){
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
});

document.addEventListener("keydown", async function onEvent(event) {


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
    let newPos = {
      x: pos.x,
      y: pos.y
    };
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
      let newTrees = [];
      let newRocks = [];
      let growTrees = [];
      let prox = 10;
      for (let i = Math.round(Math.max(0, pos.x - prox)); i < Math.min(map.tiles.length, pos.x + prox); i++) {
        for (let j = Math.round(Math.max(0, pos.y - prox)); j < Math.min(map.tiles[0].length, pos.y + prox); j++) {
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
            newTrees[newTrees.length] = {
              i: i,
              j: j
            }
          }
          adjacent = 0;
          let dir = {
            x: 0,
            y: 0
          };
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
            newRocks[newRocks.length] = {
              i: i,
              j: j,
              dir: dir
            }
          }
          if (map.tiles[i][j].id == 'grass_tree' && Math.random() < 0.0001) {
            growTrees[growTrees.length] = {
              i: i,
              j: j
            }
          }
        }
      }
      let d = {
        x: newPos.x - pos.x,
        y: newPos.y - pos.y,
      }
      let steps = 10;
      for (let i = 0; i < 1; i = Math.round(steps * i + 1) / steps) {
        await sleep(20);
        map.time += 1 / 10;
        pos.x += d.x / steps;
        pos.y += d.y / steps;
        let newTree = mutated_tile(grass_tree);
        newTree.deco[0] = trunk_grad(null_trunk, trunk, i);
        newTree.deco[1] = leaves_grad(null_leaves, leaves, i);
        let growTree = mutated_tile(grass_tree);
        growTree.deco[0] = trunk_grad(trunk, big_trunk, i);
        growTree.deco[1] = leaves_grad(leaves, big_leaves, i);
        for (let j = 0; j < newTrees.length; j++) {
          let ind = newTrees[j];
          map.tiles[ind.i][ind.j] = newTree;
        }
        for (let j = 0; j < growTrees.length; j++) {
          let ind = growTrees[j];
          map.tiles[ind.i][ind.j] = growTree;
        }
        for (let j = 0; j < newRocks.length; j++) {
          let ind = newRocks[j];
          map.tiles[ind.i][ind.j] = mutated_tile(sand);
          map.tiles[ind.i][ind.j].deco[0] = rock_wash(i, ind.dir);
        }
        draw();
      }
      for (let j = 0; j < newTrees.length; j++) {
        let ind = newTrees[j];
        map.tiles[ind.i][ind.j] = grass_tree;
      }
      for (let j = 0; j < newRocks.length; j++) {
        let ind = newRocks[j];
        map.tiles[ind.i][ind.j] = sand_rock;
      }
      for (let j = 0; j < growTrees.length; j++) {
        let ind = growTrees[j];
        map.tiles[ind.i][ind.j] = grass_big_tree;
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
});

function fillTileColor(x, y, color) {
  ctx.fillStyle = color;
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
      grid_size,
      grid_size
    );
  }
}
function fillTile(x, y, tile) {
  fillTileColor(x, y, tile.color);
}

function validatePos(newPos){
  if (
    newPos.x < 0 ||
    newPos.y < 0 ||
    newPos.x >= map.tiles.length ||
    newPos.y >= map.tiles[0].length
  ) {
    return false;
  }
  if(!map.tiles[Math.round(newPos.x)][Math.round(newPos.y)].land){
    return false;
  }
  return true;
}


function board() {
  let htmlversion = document.getElementById('version');
  if(parseInt(htmlversion.innerText) != version){
    htmlversion.innerText = 'Version error! Clear browser cache.';
  }
  else{
    htmlversion.remove();
  }
  let init = false;
  let url = window.location.href;
  let poss = url.indexOf('#') + 1;
  let s = '';
  if(poss > 0){
    init = true;
    s = decompress_string(url.substr(poss));
  }
  else{
    let cookie = getCookie('game');
    if(cookie != ''){
      init = true;
      s = decompress_string(cookie);
    }
  }
  if(init){
    let k = 0;
    grid_x = b642_to_int12(s.substr(k, k + 2));
    k += 2;
    grid_y = b642_to_int12(s.substr(k, k + 2));
    k += 2;
    lines = s[k] == 'B';
    k += 1;
    let x = b642_to_int12(s.substr(k, k + 2));
    k += 2;
    let y = b642_to_int12(s.substr(k, k + 2));
    k += 2;
    let tiles = [];
    for(let i = 0; i < x; i++){
      tiles[i] = [];
      for(let j = 0; j < y; j++){
        tiles[i][j] = tile_ref[b641_to_int6(s[k + i * y + j])];
      }
    }
    k += x * y;
    map = {
      tiles: tiles,
      start: {
        x: b642_to_int12(s.substr(k, k + 2)),
        y: b642_to_int12(s.substr(k + 2, k + 4))
      }
    }
    k += 4;
    pos = {
      x: b642_to_int12(s.substr(k, k + 2)),
      y: b642_to_int12(s.substr(k + 2, k + 4))
    }
    k += 4;
    direction = s[k];
    k += 1;
    lumber = b642_to_int12(s.substr(k, k + 2));
    k += 2;
    if(k < s.length){
      map.time = b642_to_int12(s.substr(k, k + 2));
      k += 2;
      rocks = b642_to_int12(s.substr(k, k + 2));
    }
    else{
      map.time = 0;
      rocks = 0;
    }
  }

  calculate();
  //console.assert((width / grid_size) % 2 == 0);
  //console.assert((height / grid_size) % 2 == 0);
  heightField.value = grid_x;
  widthField.value = grid_y;

  if (canvas.getContext) {
    ctx = canvas.getContext('2d');

    if(!init) {
      map = generateMap(100, 100);
      pos = map.start;
    }




    draw();


  }
}

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

function draw() {
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);
  if(lines) {
    drawLines();
  }
  for(let i = -(pos.x % 1); i < grid_x; i++){
    for(let j = -(pos.y % 1); j < grid_y; j++){
      let x = Math.round(i - mid_x + pos.x);
      let y = Math.round(j - mid_y + pos.y);
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
      let x = Math.round(i - mid_x + pos.x);
      let y = Math.round(j - mid_y + pos.y);
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
  ctx.fillStyle = 'rgba(0, 0, 0, 1)';
  ctx.beginPath();
  ctx.arc((mid_y + 0.5) * grid_size,
    (mid_x + 0.5) * grid_size,
    grid_size * 0.3,
    0,
    2 * Math.PI
  );
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 0, 0, 1)';
  ctx.beginPath();
  var d = {
    x: 0,
    y: 0
  };
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
  }
  ctx.arc((mid_y + 0.5 + d.y) * grid_size,
    (mid_x + 0.5 + d.x) * grid_size,
    grid_size * 0.05,
    0,
    2 * Math.PI
  );
  ctx.fill();
  for(let p = 1; p <= 3; p++) {
    for (let i = -(pos.x % 1) - 1; i < grid_x + 1; i++) {
      for (let j = -(pos.y % 1) - 1; j < grid_y + 1; j++) {
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
  ctx.strokeRect(0.5, 0.5, grid_y * grid_size, grid_x * grid_size);
  lumberLabel.innerText = lumber;
  rocksLabel.innerText = rocks;
}

const seed = {
  tiles: [
    [s, s, s],
    [s, g, s],
    [s, s, s]
  ]
}

function generateMap(h, w){
  let newMap = {
    tiles: [],
    start: {
      x: 0,
      y: 0
    }
  };
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
        newMap = insertMapElement(newMap, seed, i - 1, j - 1);
      }
    }
  }
  for(let k = 0; k < Math.floor(area / 2); k++){
    for(let i = 0; i < h; i++){
      for(let j = 0; j < w; j++){
        let adjacent = 0;
        if(newMap.tiles[i][j].id == 'water'){
          for(let x = i - 1; x <= i + 1; x++){
            for(let y = j - 1; y <= j + 1; y++){
              try{
                if(newMap.tiles[x][y].id == 'sand'){
                  adjacent++;
                }
              }catch (e) {}
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
        let adjacent = 0;
        if(newMap.tiles[i][j].id == 'sand'){
          for(let x = i - 1; x <= i + 1; x++){
            for(let y = j - 1; y <= j + 1; y++){
              try{
                if(newMap.tiles[x][y].id == 'grass'){
                  adjacent++;
                }
                if(newMap.tiles[x][y].id == 'water'){
                  adjacent -= 3;
                }
              }catch (e) {}
            }
          }
        }
        if(adjacent > 0 && Math.random() < (adjacent + 1) * 0.08){
          newMap.tiles[i][j] = grass;
        }
      }
    }
  }
  let grasses = []
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
          grasses[grasses.length] = {
            x: i,
            y: j
          }
        }

      }
    }
  }
  newMap.start = grasses[Math.floor(Math.random() * grasses.length)];
  newMap.time = 0;
  return newMap;
}

function insertMapElement(big, small, x, y){
  for(let i = 0; i < small.tiles.length; i++){
    for(let j = 0; j < small.tiles[0].length; j++){
      try{
        if(big.tiles[i + x][j + y] != undefined) {
          big.tiles[i + x][j + y] = small.tiles[i][j];
        }
      }
      catch(e){}
    }
  }
  return big;
}

function action(){
  var d = {
    x: 0,
    y: 0
  };
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
  let targetPos = {
    x: pos.x + d.x,
    y: pos.y + d.y
  }
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
      if(lumber > 0) {
        map.tiles[targetPos.x][targetPos.y] = bridge;
        lumber--;
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
  }
  draw();
}

function serialize_map(){
  newMap = {
    tiles: [],
    start: {
      x: Math.round(map.start.x),
      y: Math.round(map.start.y)
    }
  }
  for(let i = 0; i < map.tiles.length; i++){
    newMap.tiles[i] = [];
    for(let j = 0; j < map.tiles[0].length; j++){
      newMap.tiles[i][j] = map.tiles[i][j].int_id;
    }
  }
  return newMap;
}

function deserialize_map(newMap){
  map = {
    tiles: [],
    start: newMap.start
  }
  for(let i = 0; i < newMap.tiles.length; i++){
    map.tiles[i] = [];
    for(let j = 0; j < newMap.tiles[0].length; j++){
      map.tiles[i][j] = tile_ref[newMap.tiles[i][j]];
    }
  }
  return newMap;
}


const b64Str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
var reverseb64 = new Map();
for(let i = 0; i < 64; i++){
  reverseb64.set(b64Str[i], i);
}

function int12_to_b64(int){
  return b64Str[Math.floor(int / 64)] + b64Str[int % 64]
}

function b642_to_int12(b64){
  return reverseb64.get(b64[0]) * 64 + reverseb64.get(b64[1]);
}

function int6_to_b64(int){
  return b64Str[int]
}

function b641_to_int6(b64){
  return reverseb64.get(b64[0]);
}

function compress_string(s){
  if(s[s.length - 1] == s[s.length - 2]){
    s += '=';
  }
  let lc = s[0];
  let li = 0;
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
      return compress_string(s.substr(0, li + 1) + "(" + (i - li) + ")" + s.substr(i));
    }
    li = i;
    lc = s[i];
  }
  return s;
}

function decompress_string(s){
  if(s[s.length - 1] == '='){
    s = s.substr(0, s.length - 1);
  }
  let inPar = false;
  let num = '';
  let li = 0;
  for(let i = 0; i < s.length; i++){
    if(inPar){
      if(s[i] == ')'){
        return decompress_string(s.substr(0, li - 1) + s[li - 1].repeat(parseInt(num)) + s.substr(i + 1));
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

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}




