let button1, button2;
let latInput, longInput;
let textContent = '';
// let lScale = 4;
let minLongitude;
let maxLongitude;
let minLatitude;
let maxLatitude;
let url = '';
let flightArr = [];
let checkFlightArr = [];
let planeArr = [];
let CtoP = [];
let PtoC = [];
var easyCam;
let interReg, interSB;
let ceiling = 500;
let sceneNum = 0;
let errorM = false;

function preload() {
  interReg = loadFont('Inter-Regular.ttf');
  interSB = loadFont('Inter-SemiBold.ttf');
}

function setup() {
  createCanvas(600, 600, WEBGL);
  angleMode(DEGREES);
  setAttributes('antialias', true);
  background(250);
  push();
  translate(-width / 2, -height / 2);
  textFont(interSB);
  fill(0);
  textSize(30);
  text("Sky Globe", 100, 100);
  textSize(14);
  text("See what's happening in the skies above you!", 100, 130);
  textFont(interReg)
  textSize(14);
  text("Sky Globe visualises the often hidden and unseen activity in the skies above you. It uses data from opensky-network.org to show aircraft positions and metadata.", 100, 150, 400, 300);
  text("Once the map loads, drag your mouse to pan around, and scroll to zoom in or out. Data is refreshed every 5.5 seconds.", 100, 230, 400, 300);
  text("Each aircraft is tagged with it's callsign and the country of origin.", 100, 295, 400, 300);
  textSize(12);
  text("The more accurate method, no location data is stored, and is only used once to get an initial fix on your coordinates.", width / 2 + 100, 385, 170, 300);
  text("Lat: ", 100, 405);
  text("Long: ", 100, 435);
  fill(70, 0, 0);
  text("If nothing happens within a few seconds, either no aircraft are in your selected location, or the data is unavailable. Try using your current location for more accurate results!", 100, 540, 340, 200);
  pop();


  latInput = createInput("46.8389");
  latInput.position(134, 390);
  longInput = createInput("71.5264");
  longInput.position(134, 420);
  // https://editor.p5js.org/burnedsap/present/dwKiou8RD

  button1 = createButton('Use my location');
  button1.position(width / 2 + 100, 470);
  button1.mousePressed(function() {
    easyCam = createEasyCam();
    easyCam.setCenter([width / 2, height / 2, 100], 100);

    geoFindMe();
    setInterval(submit, 5500);
  });

  button2 = createButton('Use these coordinates');
  button2.position(100, 470);
  button2.mousePressed(function() {
    easyCam = createEasyCam();
    easyCam.setCenter([width / 2, height / 2, 100], 100);


    setLoc2(latInput.value(), longInput.value());

    setTimeout(submit, 1000);
    setInterval(submit, 5500);

  });
}

function draw() {
  switch (sceneNum) {

    case 0:
      break;

    case 1:
      background(230);
      push();
      translate(width / 2, height / 2, -2);
      fill(200);
      plane(650, 650);
      pop();
      push();
      textAlign(CENTER);
      fill(0);
      textFont(interSB);
      textSize(30);
      text("▲", width / 2, 50);
      text("N", width / 2, 80);
      pop();
      noStroke();
      fill(230, 0, 0);
      ellipse(width / 2, height / 2, 50, 50);

      for (var x = 0; x < planeArr.length; x++) {
        planeArr[x].display();
        planeArr[x].hover();
      }
      break;
  }
}

function submit() {
  checkFlightArr.splice(0, checkFlightArr.length);
  url = 'https://opensky-network.org/api/states/all?lamin=' + minLatitude + '&lomin=' + minLongitude + '&lamax=' + maxLatitude + '&lomax=' + maxLongitude;

  loadJSON(url, gotData);
}

function gotData(data) {
  if (data.states != null) {
    sceneNum = 1;
    hideUI();
  } 
  for (var i = 0; i < data.states.length; i++) {
    if (!data.states[i][8]) {
      checkFlightArr.push(data.states[i]);
    }
  }

  matchArray();
  cDiff();
}



function matchArray() {
  //initally populate planeArr

  if (planeArr.length < 1) {
    for (var x = 0; x < checkFlightArr.length; x++) {
      let xL = map(checkFlightArr[x][5], minLongitude, maxLongitude, 0, width);
      let yL = map(checkFlightArr[x][6], minLatitude, maxLatitude, 0, height);
      let zL = map(checkFlightArr[x][7], 0, 15000, 0, ceiling);
      if (checkFlightArr[x][7] != null) {
        planeArr.push(new Plane(xL, yL, zL, checkFlightArr[x][0], checkFlightArr[x][10], checkFlightArr[x][9], checkFlightArr[x][1], checkFlightArr[x][2]));
      }
    }
  }

  //update positions
  for (var i = 0; i < checkFlightArr.length; i++) {
    for (var j = 0; j < planeArr.length; j++) {
      if (planeArr[j].ident == checkFlightArr[i][0]) {
        let xL = map(checkFlightArr[i][5], minLongitude, maxLongitude, 0, width);
        let yL = map(checkFlightArr[i][6], minLatitude, maxLatitude, 0, height);
        let zL = map(checkFlightArr[i][7], 0, 15000, 0, ceiling);
        planeArr[j].update(xL, yL, zL, checkFlightArr[i][8], checkFlightArr[i][10], checkFlightArr[i][9]);
      }
    }
  }

}

function cDiff() {
  //create temporary arrays
  let cArr = [];
  let pArr = [];
  cArr.splice(0, cArr.length);
  pArr.splice(0, pArr.length);

  //check if there are any new planes added
  for (var a = 0; a < checkFlightArr.length; a++) {
    cArr.push(checkFlightArr[a][0]);
  }
  for (var b = 0; b < planeArr.length; b++) {
    pArr.push(planeArr[b].ident);
  }
  CtoP.splice(0, CtoP.length);
  let intersection1 = cArr.filter(x => !pArr.includes(x));
  for (var i = 0; i < intersection1.length; i++) {
    CtoP.push(intersection1[i]);
  }
  for (var y = 0; y < CtoP.length; y++) {
    for (let x = 0; x < checkFlightArr.length; x++) {
      if (CtoP[y] == checkFlightArr[x][0]) {
        let xL = map(checkFlightArr[x][5], minLongitude, maxLongitude, 0, width);
        let yL = map(checkFlightArr[x][6], minLatitude, maxLatitude, 0, height);
        let zL = map(checkFlightArr[x][7], 0, 15000, 0, ceiling);
        if (checkFlightArr[x][7] != null) {
          planeArr.push(new Plane(xL, yL, zL, checkFlightArr[x][0], checkFlightArr[x][10], checkFlightArr[x][9], checkFlightArr[x][1], checkFlightArr[x][2]));
        }
      }

    }
  }
  PtoC.splice(0, PtoC.length);
  let intersection2 = pArr.filter(w => !cArr.includes(w));

  for (var k = 0; k < intersection2.length; k++) {
    PtoC.push(intersection2[k]);
  }

  for (var v = 0; v < PtoC.length; v++) {
    for (let z = 0; z < planeArr.length; z++) {
      if (PtoC[v] == planeArr[z].ident) {
        planeArr.splice(z, 1);
      }
    }
  }

}



class Plane {
  constructor(tX, tY, tZ, tIdent, tHeading, tSpeed, tCall, tOrigin) {
    this.loc = {
      x: tX,
      y: tY,
      z: tZ
    }
    this.arrList = [];
    this.ident = tIdent;
    this.land = false;
    this.heading = tHeading;
    this.speed = tSpeed;
    this.call = tCall;
    this.origin = tOrigin;
    this.v1 = 0;
    this.v2 = 0;
    this.rX = 0;
    this.rY = 0;
    this.rZ = 0;
    this.lX = 0;
    this.lY = 0;
    this.lZ = 0;
  }

  update(Nx, Ny, Nz, tLand, tHeading, tSpeed) {
    this.land = tLand;
    this.heading = tHeading;
    this.speed = tSpeed;

    this.newX = Nx;
    this.newY = Ny;
    this.newZ = Nz;

    push();
    translate(this.newX, this.newY);
    this.v1 = p5.Vector.fromAngle(radians(-this.heading + 180), 20);
    this.v2 = p5.Vector.fromAngle(radians(-this.heading), 20);
    pop();
    this.rX = this.v1.x + this.newX;
    this.rY = this.v1.y + this.newY;
    this.rZ = this.v1.z + this.newZ;
    this.lX = this.v2.x + this.newX;
    this.lY = this.v2.y + this.newY;
    this.lZ = this.v2.z + this.newZ;

    this.newPos = {
      x: this.newX,
      y: this.newY,
      z: this.newZ
    }

    this.randPos = {
      x1: this.rX,
      y1: this.rY,
      z1: this.rZ,
      x2: this.lX,
      y2: this.lY,
      z2: this.lZ
    }
    this.arr = this.arrList;
    this.arr.push(this.randPos)
    this.arrList = this.arr;
    this.loc = this.newPos;
  }

  hover() {
    push();
    translate(this.loc.x + 20, this.loc.y, this.loc.z);
    rotateX((-90));
    fill(0, 230);
    noStroke();
    textFont(interSB);
    text(this.call, 0, 0);

    textFont(interReg);
    text(this.origin, 0, 0 + 12);
    pop();
  }

  display() {
    push();
    fill(2);
    noStroke();
    translate(this.loc.x, this.loc.y, this.loc.z);
    sphere(8);
    // ellipse(0, 0, 10, 10);
    pop();
    push();
    translate(this.rX, this.rY, this.rZ);
    stroke(0, 255, 0);
    sphere(2);
    pop();
    push();
    translate(this.lX, this.lY, this.lZ);
    stroke(255, 0, 0)
    sphere(2);
    pop();

    // strokeWeight(2);
    // noFill();
    // beginShape(QUAD_STRIP);
    beginShape();
    fill(240);
    noStroke();
    // stroke(200);
    for (let i = 0; i < this.arrList.length; i++) {
      if (i > 1) {
        vertex(this.arrList[i].x1, this.arrList[i].y1, this.arrList[i].z1);
        vertex(this.arrList[i - 1].x1, this.arrList[i - 1].y1, this.arrList[i - 1].z1);
        vertex(this.arrList[i - 1].x2, this.arrList[i - 1].y2, this.arrList[i - 1].z2);
        vertex(this.arrList[i].x2, this.arrList[i].y2, this.arrList[i].z2);
      }
    }
    endShape(CLOSE);
  }
}

function hideUI() {
  button1.hide();
  button2.hide();
  latInput.hide();
  longInput.hide();
}