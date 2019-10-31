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
const setButton = document.getElementById('set');
const saveButton = document.getElementById('save');
const saveUrl = document.getElementById('saveurl');
const copyButton = document.getElementById('copy');
var lumber = 0;
var lines = false;
var direction = 'u';
var ctx;

setButton.addEventListener("click", function () {
  grid_x = parseInt(heightField.value);
  grid_y = parseInt(widthField.value);
  lines = showLines.checked;
  calculate();
  draw();
});

saveButton.addEventListener("click", function () {
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
  let cs = compress_string(s);
  saveUrl.value = "coledecarlo.github.io/webgame#" + cs;
});

copyButton.addEventListener("click", function () {
  saveUrl.select();
  document.execCommand('copy');
});

function calculate(){
  width = grid_size * (grid_y + 0.1);
  height = grid_size * (grid_x + 0.1);
  mid_x = Math.floor(height / grid_size / 2) - 1;
  mid_y = Math.floor(width / grid_size / 2) - 1;
  canvas.width = width;
  canvas.height = height;
}

const tree = {
  draw: (x, y) => {
    ctx.fillStyle = 'brown';

    x *= grid_size;
    y *= grid_size;
    ctx.fillRect(y + 0.3 * grid_size, x + 0.3 * grid_size, 0.35 * grid_size, 0.7 * grid_size);
    for(let i = 0.6; i > 0; i -= 0.1) {
      ctx.fillStyle = 'rgba(0, ' + 255 * (1 - i) + ', 0, ' + (1.1 - i) + ')';
      ctx.beginPath();
      ctx.arc(y + 0.5 * grid_size,
        x + 0.15 * grid_size,
        grid_size * i,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }


  }
}

const big_tree = {
  draw: (x, y) => {
    ctx.fillStyle = 'brown';

    x *= grid_size;
    y *= grid_size;
    ctx.fillRect(y + 0.2 * grid_size, x - 0.2 * grid_size, 0.6 * grid_size, 1.2 * grid_size);
    for(let i = 0.9; i > 0; i -= 0.1) {
      ctx.fillStyle = 'rgba(0, ' + 255 * (1 - i) + ', 0, ' + (1.1 - i) + ')';
      ctx.beginPath();
      ctx.arc(y + 0.5 * grid_size,
        x - 0.2 * grid_size,
        grid_size * i,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }


  }
}

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
  deco: [tree]
}
const grass_big_tree = {
  color: grass.color,
  land: false,
  id: 'grass_big_tree',
  deco: [big_tree]
}
const tile_ref = [
  blank,
  grass,
  water,
  sand,
  bridge,
  grass_tree,
  grass_big_tree
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

document.addEventListener("keydown", async function onEvent(event) {
  let newPos = {
    x: pos.x,
    y: pos.y
  };
  switch (event.key) {
    case "ArrowDown":
    case "s":
      newPos.x++;
      direction = 'd';
      break;
    case "ArrowRight":
    case "d":
      newPos.y++;
      direction = 'r';
      break;
    case "ArrowUp":
    case "w":
      newPos.x--;
      direction = 'u';
      break;
    case "ArrowLeft":
    case "a":
      newPos.y--;
      direction = 'l';
      break;
    case " ":
      action();
      return;
    default:
      console.log(event.key);
  }
  if(validatePos(newPos) == true){
    let d = {
      x: newPos.x - pos.x,
      y: newPos.y - pos.y,
      z: 0.1
    }
    for(let i = 0; i < 0.9; i += d.z){
      pos.x += d.x * d.z;
      pos.y += d.y * d.z;
      draw();
      await sleep(20);
    }
    pos = newPos;
  }
  draw();
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
  if(!map.tiles[newPos.x][newPos.y].land){
    return false;
  }
  return true;
}


function board() {
  let init = false;
  let url = window.location.href;
  let poss = url.indexOf('#') + 1;
  if(poss > 0){
    init = true;
    let s = decompress_string(url.substr(poss));
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

  }

  calculate()
  console.assert((width / grid_size) % 2 == 0);
  console.assert((height / grid_size) % 2 == 0);
  heightField.value = grid_x;
  widthField.value = grid_y;

  if (canvas.getContext) {
    ctx = canvas.getContext('2d');



    const map1 = {
      tiles: [
        [g, g, g, s, w, w, w, w],
        [g, g, g, s, w, w, w, w],
        [g, g, g, s, s, w, w, w],
        [g, g, g, s, w, s, w, w],
        [g, g, g, s, s, s, w, w],
        [g, g, g, s, s, s, w, w],
        [g, g, g, g, g, s, s, w],
        [g, g, g, g, g, w, s, w],
      ],
      start: {
        x: 1,
        y: 1
      }
    };
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
    ctx.lineTo(i + 0.5, height - grid_size + 0.5);
    ctx.stroke();
  }
  for (let i = -(pos.x % 1) * grid_size; i < height; i += grid_size) {
    ctx.moveTo(0.5, i + 0.5);
    ctx.lineTo(width - grid_size + 0.5, i + 0.5);
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
      let x = i - mid_x + pos.x;
      let y = j - mid_y + pos.y;
      let tile;
      try{
        tile = map.tiles[x][y];
      }
      catch (e) {}
      if(tile == undefined){
        tile = blank;
      }
      fillTile(i, j, tile);
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
  for(let i = -(pos.x % 1) - 1; i < grid_x + 1; i++){
    for(let j = -(pos.y % 1) - 1; j < grid_y + 1; j++){
      let x = i - mid_x + pos.x;
      let y = j - mid_y + pos.y;
      let tile;
      try{
        tile = map.tiles[x][y];
      }
      catch (e) {}
      if(tile == undefined){
        tile = blank;
      }
      for(let k = 0; k < tile.deco.length; k++){
        tile.deco[k].draw(i, j);
      }
    }
  }
  ctx.fillStyle = 'white';
  ctx.fillRect(grid_y * grid_size, 0, grid_size, height);
  ctx.fillRect(0, grid_x * grid_size, width, grid_size);
  ctx.strokeRect(0.5, 0.5, grid_y * grid_size, grid_x * grid_size);
  lumberLabel.innerText = lumber;
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
  }
  lumberLabel.innerText = lumber;
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


