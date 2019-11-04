const tiles_version = 14;



function drawLeaves(/*Number*/ x, /*Number*/ y, /*DecoPart*/ obj){
  x *= grid_size;
  y *= grid_size;
  for(let i = obj.width; i > 0; i = (10 * i - 1) / 10) {
    let s = color_to_string(new Color(Math.round(obj.color.r * (1 - i)), Math.round(obj.color.g * (1 - i)), Math.round(obj.color.b * (1 - i)), 1.1 - i));
    ctx.fillStyle = 'white';
    ctx.fillStyle = s;
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

function drawTrunk(/*Number*/ x, /*Number*/ y, /*DecoPart*/ obj){
  x *= grid_size;
  y *= grid_size;
  ctx.fillStyle = 'rgba(' + obj.color.r + ',' + obj.color.g + ',' + obj.color.b + ',' + obj.color.a + ')';
  ctx.fillRect(y + (1 - obj.width) / 2 * grid_size, x + (1 - obj.height) * grid_size, obj.width * grid_size, obj.height * grid_size);
}

/**@returns {Color}*/
function color_grad(/*Color*/ c1, /*Color*/ c2, /*Number*/ i){
  return new Color(
    c1.r + i * (c2.r - c1.r),
    c1.g + i * (c2.g - c1.g),
    c1.b + i * (c2.b - c1.b),
    c1.a + i * (c2.a - c1.a)
  );
}

/**@returns {DecoPart}*/
function deco_part_grad(/*DecoPart*/ t1, /*DecoPart*/ t2, /*Number*/ i){
  return new DecoPart(
    t1.drawFun,
    1,
    t1.width  + i * (t2.width  - t1.width ),
    t1.height + i * (t2.height - t1.height),
    color_grad(t1.color, t2.color, i),
  );
}

/**@returns {Decoration}*/
function rock_wash(i, dir) {
  return new Decoration(
    (x, y) => {
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
    -1
  );
}




/**@type {DecoPart}*/
const leaves = new DecoPart(
  drawLeaves,
  2,
  0.6,
  0.85,
  new Color('#00FF00')
);

/**@type {DecoPart}*/
const trunk = new DecoPart(
  drawTrunk,
  1,
  0.35,
  0.85,
  new Color('brown'),
);

/**@type {DecoPart}*/
const big_leaves = new DecoPart(
  leaves.drawFun,
  3,
  0.9,
  1.2,
  leaves.color
);

/**@type {DecoPart}*/
const big_trunk = new DecoPart(
  trunk.drawFun,
  1,
  0.6,
  1.2,
  trunk.color
);

/**@type {DecoPart}*/
const null_leaves = new DecoPart(
  leaves.drawFun,
  -1,
  0,
  0,
  leaves.color
);

/**@type {DecoPart}*/
const null_trunk = new DecoPart(
  trunk.drawFun,
  -1,
  0,
  0,
  trunk.color
);


/**@type {Decoration}*/
const rock = rock_wash(1, {
  x: 0,
  y: 1
});

/**@type {Decoration}*/
const wood_house_base = new Decoration(
  (x, y) => {
    x *= grid_size;
    y *= grid_size;
    let color1 = '#CCAA77';
    let color2 = 'brown';
    let color3 = '#442200';
    ctx.fillStyle = color2;
    ctx.fillRect(y - grid_size, x - 3 * grid_size / 5, 3 * grid_size, 8 * grid_size / 5);
    ctx.fillStyle = color1;
    for(let i = 1; i < 5; i++){
      ctx.fillRect(y - grid_size, x + (2 * i - 5) * grid_size / 5, 3 * grid_size, grid_size / 5);
    }
    ctx.fillStyle = color3;
    ctx.fillRect(y - grid_size, x - 3 * grid_size / 5, grid_size / 5, 8 * grid_size / 5);
    ctx.fillRect(y + 9 / 5 * grid_size, x - 3 * grid_size / 5, grid_size / 5, 8 * grid_size / 5);
    ctx.fillRect(y + grid_size / 5, x + grid_size / 10, 3 * grid_size / 5, 9 * grid_size / 10);
  },
  1
);

/**@type {Decoration}*/
const wood_house_roof = new Decoration(
  (x, y) => {
    x *= grid_size;
    y *= grid_size;
    let color1 = '#CCAA77';
    let color2 = 'brown';
    let color3 = '#442200';
    ctx.fillStyle = color2;
    let a = 17 / 6 / 5;
    ctx.fillRect(y + (-6 / 5 + a) * grid_size, x - 4 * grid_size / 5, (17 / 5 - 2 * a) * grid_size, grid_size / 5);
    ctx.fillStyle = color1;
    a = 17 / 3 / 5;
    ctx.fillRect(y + (-6 / 5 + a) * grid_size, x - 5 * grid_size / 5, (17 / 5 - 2 * a) * grid_size, grid_size / 5);
    ctx.beginPath();
    ctx.fillStyle = color3;
    ctx.moveTo(y + grid_size / 2, x - 6 * grid_size / 5);
    ctx.lineTo(y + 11 * grid_size / 5, x - 3 * grid_size / 5);
    ctx.lineTo(y + 11 * grid_size / 5, x - 2 * grid_size / 5);
    ctx.lineTo(y + grid_size / 2, x - 5 * grid_size / 5);
    ctx.lineTo(y - 6 * grid_size / 5, x - 2 * grid_size / 5);
    ctx.lineTo(y - 6 * grid_size / 5, x - 3 * grid_size / 5);
    ctx.fill();
  },
  2
);
/**@type {Decoration}*/
const exit_arrow = new Decoration(
  (x, y) => {
    x *= grid_size;
    y *= grid_size;
    let red = '#FF0000';
    ctx.fillStyle = red;
    ctx.fillRect(y + 2 * grid_size / 5, x + grid_size / 10, grid_size / 5, 3 * grid_size / 5);
    ctx.beginPath();
    ctx.moveTo(y + grid_size / 5, x + 7 * grid_size / 10);
    ctx.lineTo(y + 4 * grid_size / 5, x + 7 * grid_size / 10);
    ctx.lineTo(y + grid_size / 2, x + 9 * grid_size / 10);
    ctx.fill();
  },
  -1
);



/**@type {Tile}*/
const blank = new Tile(
  new Color('black'),
  false,
  'blank',
  []
);

/**@type {Tile}*/
const grass = new Tile(
  new Color('#40FF50'),
  true,
  'grass',
  []
);

/**@type {Tile}*/
const water = new Tile(
  new Color('#4050FF'),
  false,
  'water',
  []
);

/**@type {Tile}*/
const sand = new Tile(
  new Color('#EAEA70'),
  true,
  'sand',
  []
);

/**@type {Tile}*/
const bridge = new Tile(
  new Color('brown'),
  true,
  'bridge',
  []
);

/**@type {Tile}*/
const grass_tree = new Tile(
  grass.color,
  false,
  'grass_tree',
  [trunk, leaves]
);

/**@type {Tile}*/
const grass_big_tree = new Tile(
  grass.color,
  false,
  'grass_big_tree',
  [big_trunk, big_leaves]
);

/**@type {Tile}*/
const grass_rock = new Tile(
  grass.color,
  false,
  'grass_rock',
  [rock]
);

/**@type {Tile}*/
const sand_rock = new Tile(
  sand.color,
  false,
  'sand_rock',
  [rock]
);

/**@type {Tile}*/
const wood_house_warp = new Tile(
  blank.color,
  false,
  'wood_house_warp',
  [wood_house_base, wood_house_roof],
  new Warp(true)
);

/**@type {Tile}*/
const exit_warp = new Tile(
  blank.color,
  false,
  'exit_warp',
  [exit_arrow],
  new Warp(true)
);

/**@type {Tile}*/
const wood_floor = new Tile(
  new Color('brown'),
  true,
  'wood_floor',
  []
);

/**@type {Tile}*/
const wood_floor_rock = new Tile(
  wood_floor.color,
  false,
  'wood_floor_rock',
  [rock]
);

const tile_ref = [
  blank,
  grass,
  water,
  sand,
  bridge,
  grass_tree,
  grass_big_tree,
  sand_rock,
  grass_rock,
  wood_floor,
  exit_warp,
  wood_house_warp,
  wood_floor_rock
];
for(let i = 0; i < tile_ref.length; i++){
  tile_ref[i].add_int_id(i);
}

