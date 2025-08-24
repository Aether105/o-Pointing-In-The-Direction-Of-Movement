let mover;

function  setup() {
  pos = createCanvas(640, 240);
  pos.center();
  mover = new Mover();
}

function draw() {
  background(230, 230, 230);
  mover.update();
  mover.checkEdges();
  mover.display();
}