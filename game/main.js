var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

var player;
var platforms;
var fireballPool;
var walking = false;
var jumping = false;
var throwing = false;

// map
var level1;
var layerForeground;
var layerBackground;

function preload() {
  game.load.spritesheet('guy', 'assets/sprites/pablo.png', 42, 58);
  game.load.image('sky', 'assets/sky1.png');
  game.load.spritesheet('fireball', 'assets/sprites/fireball.png', 64, 60);
  game.load.tilemap('level1', 'assets/maps/level1.json', null, Phaser.Tilemap.TILED_JSON); 
  game.load.image('tiles_Green', 'assets/tilesets/tiles_Green.png');
  game.load.image('tiles_dark', 'assets/tilesets/tiles_dark.png');
  game.load.image('tiles_brown', 'assets/tilesets/tiles_brown.png');
}

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE); 
  game.physics.arcade.gravity.y = 1200;

  var bgImage = game.add.sprite(0, 0, 'sky');
  bgImage.fixedToCamera = true;

  level1 = game.add.tilemap('level1');
  level1.addTilesetImage('tiles_Green');
  level1.addTilesetImage('tiles_brown');
  level1.addTilesetImage('tiles_dark');

  // Order matters
  layerBackground = level1.createLayer('layer background');
  layerForeground = level1.createLayer('layer foreground');

  // not necessary?
  layerForeground.resizeWorld();

  level1.setCollisionByExclusion([0],true, 'layer foreground'); //relevant?

  // Initialize pool of fireball projectiles
  var N_FIREBALLS = 4;
  fireballPool = game.add.group();

  for (var i = 0; i < N_FIREBALLS; ++i) {
    var fireball = game.add.sprite(0, 0, 'fireball');
    fireballPool.add(fireball);

    fireball.anchor.setTo(0.5, 0.5);
    fireball.scale.y = 0.5;	//x scale is reset in throw function
    game.physics.arcade.enable(fireball);
   // fireball.body.gravity.y = 300;
    fireball.animations.add('sparkle', [0, 1, 2, 3], 10, true);
    fireball.kill();	//set as dead initially
  }

  // Initialize player
  player = game.add.sprite(30, 0, 'guy'); 
  player.anchor.setTo(0.5, 0.5);
  game.physics.arcade.enable(player);
  //player.body.gravity.y = 1000;

  player.animations.add('walk', [0, 1, 2, 3, 4], 20, true);
  player.animations.add('jump', [12, 13, 14, 15, 16], 10, true);
  player.animations.add('idle', [24, 25], 1, true);
  
  var throwAnimHandler = player.animations.add('throw', [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46], 10, false);
  throwAnimHandler.onComplete.add(function() {
    throwProjectile();
    throwing = false;
    player.animations.play('idle');
  }, player);

  player.animations.play('idle');

  game.camera.follow(player);
}

function update() {
  game.physics.arcade.collide(player, layerForeground);

  if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
    player.scale.x = 1;
    
    if (!throwing && !jumping && !walking) {
        player.animations.play('walk');
        walking = true;
    }

    player.body.velocity.x = 150;
  }

  else if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)){
    player.scale.x = -1;
    
    if (!throwing && !jumping && !walking) {
      player.animations.play('walk');
      walking = true;
    }

    player.body.velocity.x = -150;
  }


  else {
    if (!throwing && !jumping && walking) {
       player.animations.play('idle');
       walking = false;
    }

    player.body.velocity.x = 0;
  }

  if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
    if (!throwing) {
      player.animations.play('throw');
      throwing = true;
    }
  }

  if (game.input.keyboard.isDown(Phaser.Keyboard.UP) && player.body.blocked.down){
    walking = false;
    player.body.velocity.y = -500;
    
    if (!throwing) 
      player.animations.play('jump');
    
    jumping = true;

  }

  else if (player.body.blocked.down) {
    if (jumping) {
      jumping = false;

      if (!throwing)
	player.animations.play('idle');
    }

  }

  // Check if fireballs have collided
  game.physics.arcade.collide(fireballPool, layerForeground, function(fireball, layer) {
    fireball.kill();
  }, null, this);
}

function throwProjectile() {
  // Get first dead ball
  var fireball = fireballPool.getFirstDead();

  // Do nothing if no balls
  if (fireball === null || fireball === undefined)
    return;

  // Revive and go
  fireball.revive();
  fireball.checkWorldBounds = true;
  fireball.outOfBoundsKill = true;

  fireball.scale.x = 0.5 * player.scale.x;	//set to 0.5 and sign equaling player direction
  fireball.reset(player.x + 30 * player.scale.x, player.y - 10);

  fireball.animations.play('sparkle');
  fireball.body.velocity.x = 400;
  fireball.body.velocity.x *= player.scale.x;
  fireball.body.velocity.y = -70;
}
