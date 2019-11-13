/**@type {Number}*/ const tiles_version = 16;


/**@returns {void}*/ function drawLeaves(/*Number*/ x, /*Number*/ y, /*DecoPart*/ obj){
  for(let i = obj.width; i > 0; i = (10 * i - 1) / 10) {
    ctx.fillStyle = new Color(Math.round(obj.color.r * (1 - i)), Math.round(obj.color.g * (1 - i)), Math.round(obj.color.b * (1 - i)), 1.1 - i).toString();
    ctx.beginPath();
    ctx.arc(
      y + 0.5 * grid_size,
      x + (1 - obj.height) * grid_size,
      grid_size * i,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }
}
/**@returns {void}*/ function drawTrunk(/*Number*/ x, /*Number*/ y, /*DecoPart*/ obj){
  ctx.fillStyle = obj.color.toString();
  ctx.fillRect(y + (1 - obj.width) / 2 * grid_size, x + (1 - obj.height) * grid_size, obj.width * grid_size, obj.height * grid_size);
}
/**@returns {Color}*/ function color_grad(/*Color*/ c1, /*Color*/ c2, /*Number*/ i){
  return new Color(
    c1.r + i * (c2.r - c1.r),
    c1.g + i * (c2.g - c1.g),
    c1.b + i * (c2.b - c1.b),
    c1.a + i * (c2.a - c1.a)
  );
}
/**@returns {DecoPart}*/ function deco_part_grad(/*DecoPart*/ t1, /*DecoPart*/ t2, /*Number*/ i){
  return new DecoPart(
    t1.drawFun,
    1,
    t1.width  + i * (t2.width  - t1.width ),
    t1.height + i * (t2.height - t1.height),
    color_grad(t1.color, t2.color, i),
  );
}
/**@returns {Decoration}*/ function rock_wash(/*Number*/ i, /*Point*/ dir) {
  return new Decoration(
    (x, y) => {
      /**@type {Array<Number>}*/ let j = [];
      if(i < 1 / 3){
        j = [3 * i    , 0, 0];
      }
      else if(i < 2 / 3){
        j = [1, 3 * i - 1, 0];
      }
      else{
        j = [1, 1, 3 * i - 2];
      }
      ctx.fillStyle = stone_color_light.toString();
      ctx.fillRect(y + (1 / 10 + (1 - j[0]) * dir.y) * grid_size, x + (1 / 10 + (1 - j[0]) * dir.x) * grid_size, 3 * grid_size /  5, 3 * grid_size /  5);
      ctx.fillStyle = stone_color_dark.toString();
      ctx.fillRect(y + (2 /  5 + (1 - j[1]) * dir.y) * grid_size, x + (3 / 10 + (1 - j[1]) * dir.x) * grid_size,     grid_size /  2,     grid_size /  2);
      ctx.fillStyle = stone_color.toString();
      ctx.fillRect(y + (3 / 10 + (1 - j[2]) * dir.y) * grid_size, x + (3 /  5 + (1 - j[2]) * dir.x) * grid_size, 3 * grid_size / 10, 3 * grid_size / 10);
    },
    -1
  );
}
/**@returns {Decoration}*/ function pearl_wash(/*Number*/ i, /*Point*/ dir) {
  return new Decoration(
    (x, y) => {
      ctx.fillStyle = pearl_color.toString();
      //TODO
      ctx.fillRect(y + (1 / 10 + (1 - i) * dir.y) * grid_size, x + (1 / 10 + (1 - i) * dir.x) * grid_size, 3 * grid_size /  5, 3 * grid_size /  5);
    },
    -1
  );
}

/**@type {Color}*/ const leaf_color        = new Color('#00FF00'); //== 'lime'
/**@type {Color}*/ const grass_color       = new Color('#40FF50');
/**@type {Color}*/ const wood_color_light  = new Color('#CCAA77');
/**@type {Color}*/ const wood_color        = new Color('#A52A2A'); //== 'brown'
/**@type {Color}*/ const wood_color_dark   = new Color('#442200');
/**@type {Color}*/ const blank_color       = new Color('#000000'); //== 'black'
/**@type {Color}*/ const sand_color        = new Color('#EAEA70');
/**@type {Color}*/ const water_color       = new Color('#4050FF');
/**@type {Color}*/ const exit_arrow_color  = new Color('#FF0000'); //== 'red'
/**@type {Color}*/ const pearl_color       = new Color('#FFC0CB'); //== 'pink'
/**@type {Color}*/ const stone_color_light = new Color('#C0C0C0');
/**@type {Color}*/ const stone_color       = new Color('#909090');
/**@type {Color}*/ const stone_color_dark  = new Color('#707070');

/**@type {DecoPart}*/ const leaves      = new DecoPart(drawLeaves    , +2, 0.60, 0.85, leaf_color);
/**@type {DecoPart}*/ const trunk       = new DecoPart(drawTrunk     , +1, 0.35, 0.85, wood_color);
/**@type {DecoPart}*/ const big_leaves  = new DecoPart(leaves.drawFun, +3, 0.90, 1.20, leaf_color);
/**@type {DecoPart}*/ const big_trunk   = new DecoPart(trunk .drawFun, +1, 0.60, 1.20, wood_color);
/**@type {DecoPart}*/ const null_leaves = new DecoPart(leaves.drawFun, -1, 0.00, 0.00, leaf_color);
/**@type {DecoPart}*/ const null_trunk  = new DecoPart(trunk .drawFun, -1, 0.00, 0.00, wood_color);

/**@type {Decoration}*/ const rock              = rock_wash(1, new Point(0, 1));
/**@type {Decoration}*/ const pearl             = pearl_wash(1, new Point(0, 1));
/**@type {Decoration}*/ const wood_house_base   = new Decoration((x, y) => {
    ctx.fillStyle = wood_color.toString();
    ctx.fillRect(y - grid_size, x - 3 * grid_size / 5, 3 * grid_size, 8 * grid_size / 5);
    ctx.fillStyle = wood_color_light.toString();
    for(let i = 1; i < 5; i++){
      ctx.fillRect(y - grid_size, x + (2 * i - 5) * grid_size / 5, 3 * grid_size, grid_size / 5);
    }
    ctx.fillStyle = wood_color_dark.toString();
    ctx.fillRect(y -     grid_size    , x - 3 * grid_size / 5 ,     grid_size / 5, 8 * grid_size / 5 );
    ctx.fillRect(y + 9 * grid_size / 5, x - 3 * grid_size / 5 ,     grid_size / 5, 8 * grid_size / 5 );
    ctx.fillRect(y +     grid_size / 5, x +     grid_size / 10, 3 * grid_size / 5, 9 * grid_size / 10);
  }, +1);
/**@type {Decoration}*/ const wood_house_roof   = new Decoration((x, y) => {
    ctx.fillStyle = wood_color.toString();
    /**@type {Number}*/
    let a = 17 / 6 / 5;
    ctx.fillRect(y + (-6 / 5 + a) * grid_size, x - 4 * grid_size / 5, (17 / 5 - 2 * a) * grid_size, grid_size / 5);
    ctx.fillStyle = wood_color_light.toString();
    a = 17 / 3 / 5;
    ctx.fillRect(y + (-6 / 5 + a) * grid_size, x - 5 * grid_size / 5, (17 / 5 - 2 * a) * grid_size, grid_size / 5);
    ctx.beginPath();
    ctx.fillStyle = wood_color_dark.toString();
    ctx.moveTo(y +      grid_size / 2, x - 6 * grid_size / 5);
    ctx.lineTo(y + 11 * grid_size / 5, x - 3 * grid_size / 5);
    ctx.lineTo(y + 11 * grid_size / 5, x - 2 * grid_size / 5);
    ctx.lineTo(y +      grid_size / 2, x - 5 * grid_size / 5);
    ctx.lineTo(y -  6 * grid_size / 5, x - 2 * grid_size / 5);
    ctx.lineTo(y -  6 * grid_size / 5, x - 3 * grid_size / 5);
    ctx.fill();
    ctx.closePath();
  }, +2);
/**@type {Decoration}*/ const exit_arrow        = new Decoration((x, y) => {
    ctx.fillStyle = exit_arrow_color.toString();
    ctx.fillRect(y + 2 * grid_size / 5, x + grid_size / 10, grid_size / 5, 7 * grid_size / 10);
    ctx.beginPath();
    ctx.moveTo(y +     grid_size / 5, x + 7 * grid_size / 10);
    ctx.lineTo(y + 4 * grid_size / 5, x + 7 * grid_size / 10);
    ctx.lineTo(y +     grid_size / 2, x + 9 * grid_size / 10);
    ctx.fill();
    ctx.closePath();
  }, -1);
/**@type {Decoration}*/ const bridge_rail_up    = new Decoration((x, y) => {
  ctx.lineWidth = 3;
  ctx.strokeStyle = wood_color_dark.toString();
  ctx.beginPath();
  ctx.moveTo(y, x);
  ctx.lineTo(y + grid_size, x);
  ctx.stroke();
  ctx.closePath();
}, -1);
/**@type {Decoration}*/ const bridge_rail_down  = new Decoration((x, y) => {
  ctx.lineWidth = 3;
  ctx.strokeStyle = wood_color_dark.toString();
  ctx.beginPath();
  ctx.moveTo(y, x + grid_size);
  ctx.lineTo(y + grid_size, x + grid_size);
  ctx.stroke();
  ctx.closePath();
}, -1);
/**@type {Decoration}*/ const bridge_rail_left  = new Decoration((x, y) => {
  ctx.lineWidth = 3;
  ctx.strokeStyle = wood_color_dark.toString();
  ctx.beginPath();
  ctx.moveTo(y, x);
  ctx.lineTo(y, x + grid_size);
  ctx.stroke();
  ctx.closePath();
}, -1);
/**@type {Decoration}*/ const bridge_rail_right = new Decoration((x, y) => {
  ctx.lineWidth = 3;
  ctx.strokeStyle = wood_color_dark.toString();
  ctx.beginPath();
  ctx.moveTo(y + grid_size, x);
  ctx.lineTo(y + grid_size, x + grid_size);
  ctx.stroke();
  ctx.closePath();
}, -1);

alert("TILES");
/**@type {Tile}*/ const blank           = new Tile(blank_color, false, 'blank'          , [                                ], false);
/**@type {Tile}*/ const grass           = new Tile(grass_color, true , 'grass'          , [                                ], false);
/**@type {Tile}*/ const water           = new Tile(water_color, false, 'water'          , [                                ], false);
/**@type {Tile}*/ const sand            = new Tile(sand_color , true , 'sand'           , [                                ], false);
/**@type {Tile}*/ const bridge          = new Tile(wood_color , true , 'bridge'         , [                                ], false);
/**@type {Tile}*/ const wood_floor      = new Tile(wood_color , true , 'wood_floor'     , [                                ], false);
/**@type {Tile}*/ const grass_tree      = new Tile(grass_color, false, 'grass_tree'     , [trunk, leaves                   ], false);
/**@type {Tile}*/ const grass_big_tree  = new Tile(grass_color, false, 'grass_big_tree' , [big_trunk, big_leaves           ], false);
/**@type {Tile}*/ const grass_rock      = new Tile(grass_color, false, 'grass_rock'     , [rock                            ], false);
/**@type {Tile}*/ const sand_rock       = new Tile(sand_color , false, 'sand_rock'      , [rock                            ], false);
/**@type {Tile}*/ const wood_house_warp = new Tile(blank_color, false, 'wood_house_warp', [wood_house_base, wood_house_roof], true );
/**@type {Tile}*/ const exit_warp       = new Tile(blank_color, false, 'exit_warp'      , [exit_arrow                      ], true );
/**@type {Tile}*/ const wood_floor_rock = new Tile(wood_color , false, 'wood_floor_rock', [rock                            ], false);

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



/**@type {TileMap}*/
const seed = new TileMap(
  [
    [sand, sand , sand],
    [sand, grass, sand],
    [sand, sand , sand]
  ],
  new Point()
);

/**@type {TileMap}*/
const wood_house_map = new TileMap(
  [
    [wood_floor, wood_floor, wood_floor, wood_floor, wood_floor],
    [wood_floor, wood_floor, wood_floor, wood_floor, wood_floor],
    [wood_floor, wood_floor, wood_floor, wood_floor, wood_floor],
    [wood_floor, wood_floor, wood_floor, wood_floor, wood_floor],
    [wood_floor, wood_floor, wood_floor, wood_floor, wood_floor],
    [blank     , blank     , exit_warp , blank     , blank     ]
  ],
  new Point(4, 2)
);

