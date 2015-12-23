var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

var player;
var platforms;
var walking = false;
var jumping = false;
var throwing = false;

function preload() {
  game.load.spritesheet('guy', 'assets/sprites/pablo.png', 42, 58);
  game.load.image('sky', 'assets/sky1.png');
  game.load.image('ground', 'assets/ground.png');
}

function create() {

  // Enable the Arcade Physics system
  game.physics.startSystem(Phaser.Physics.ARCADE);

  game.add.sprite(0, 0, 'sky');

  platforms = game.add.group();
  platforms.enableBody = true;
  var ground = platforms.create(0, game.world.height - 64, 'ground');

  // Scale ground to fit the width of the game
  ground.scale.setTo(2, 2);

  // This stops it from falling away when you jump on it
  ground.body.immovable = true;

  // Create two ledges
  var ledge = platforms.create(375, 500, 'ground');
  ledge.body.immovable = true;
  ledge = platforms.create(-150, 250, 'ground');
  ledge.body.immovable = true;

  player = game.add.sprite(0, 300, 'guy'); 
  game.physics.arcade.enable(player);
  player.body.gravity.y = 1000;

  player.animations.add('walk', [0, 1, 2, 3, 4], 20, true);
  player.animations.add('jump', [12, 13, 14, 15, 16], 10, true);
  player.animations.add('idle', [24, 25], 1, true);
  
  var throwAnimHandler = player.animations.add('throw', [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46], 10, false);
  throwAnimHandler.onComplete.add(function() {
    // console.log("throw finished");
    throwing = false;
    player.animations.play('idle');
  }, player);

  player.animations.play('idle');
}

function update() {
  game.physics.arcade.collide(platforms, player);		  
    
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
    if (!jumping && walking) {
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

  if (game.input.keyboard.isDown(Phaser.Keyboard.UP) && player.body.touching.down){
    walking = false;
    player.body.velocity.y = -500;
    
    if (!throwing) 
      player.animations.play('jump');
    
    jumping = true;

  }

  else if (player.body.touching.down) {
    if (jumping) {
      jumping = false;

      if (!throwing)
	player.animations.play('idle');
      
     // console.log('landed?');
    }

  }

 }
