var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

var sprite;

function preload() {
  game.load.spritesheet('guy', 'assets/sprites/pablo.png', 41, 58);
}

function create() {
  sprite = game.add.sprite(0, 0, 'guy');
}

function update() {

}
