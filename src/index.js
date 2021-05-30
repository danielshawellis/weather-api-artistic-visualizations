import { Project } from "./driver-script";

import Stage from "./Stage/Stage.js";
import L5 from "./L5/L5.js";
import R5 from "./R5/R5.js";
import L4 from "./L4/L4.js";
import R4 from "./R4/R4.js";
import L3 from "./L3/L3.js";
import R3 from "./R3/R3.js";
import L2 from "./L2/L2.js";
import R2 from "./R2/R2.js";
import R1 from "./R1/R1.js";
import L1 from "./L1/L1.js";

const stage = new Stage({ costumeNumber: 1 });

const sprites = {
  L5: new L5({
    x: 0,
    y: 0,
    direction: 30,
    costumeNumber: 4,
    size: 225,
    visible: true,
    layerOrder: 3
  }),
  R5: new R5({
    x: 0,
    y: 0,
    direction: -150,
    costumeNumber: 4,
    size: 225,
    visible: true,
    layerOrder: 2
  }),
  L4: new L4({
    x: 0,
    y: 0,
    direction: 30,
    costumeNumber: 4,
    size: 200,
    visible: true,
    layerOrder: 5
  }),
  R4: new R4({
    x: 0,
    y: 0,
    direction: -150,
    costumeNumber: 4,
    size: 200,
    visible: true,
    layerOrder: 1
  }),
  L3: new L3({
    x: 0,
    y: 0,
    direction: 30,
    costumeNumber: 4,
    size: 175,
    visible: true,
    layerOrder: 4
  }),
  R3: new R3({
    x: 0,
    y: 0,
    direction: -150,
    costumeNumber: 4,
    size: 130,
    visible: true,
    layerOrder: 6
  }),
  L2: new L2({
    x: 0,
    y: 0,
    direction: 30,
    costumeNumber: 4,
    size: 150,
    visible: true,
    layerOrder: 8
  }),
  R2: new R2({
    x: 0,
    y: 0,
    direction: -150,
    costumeNumber: 3,
    size: 150,
    visible: true,
    layerOrder: 7
  }),
  R1: new R1({
    x: 0,
    y: 0,
    direction: -150,
    costumeNumber: 4,
    size: 100,
    visible: true,
    layerOrder: 10
  }),
  L1: new L1({
    x: 0,
    y: 0,
    direction: 30,
    costumeNumber: 4,
    size: 125,
    visible: true,
    layerOrder: 9
  })
};

const project = new Project(stage, sprites, {
  frameRate: 30 // Set to 60 to make your project run faster
});

/*
BEGIN DOM SCRIPTING
*/
project.attach("#project");

document.querySelector("#greenFlag").addEventListener("click", () => {
  project.greenFlag();
});

// Autoplay
project.greenFlag();
/*
END DOM SCRIPTING
*/

export default project;
