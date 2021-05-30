/* eslint-disable require-yield, eqeqeq */

import {
  Stage as StageBase,
  Trigger,
  Watcher,
  Costume,
  Color,
  Sound
} from "../driver-script";

export default class Stage extends StageBase {
  constructor(...args) {
    super(...args);

    this.costumes = [
      new Costume("backdrop1", "./Stage/costumes/backdrop1.svg", {
        x: 240,
        y: 180
      })
    ];

    this.sounds = [new Sound("pop", "./Stage/sounds/pop.wav")];

    this.triggers = [];

    this.vars.rotation1 = 8;
    this.vars.move1 = 8;
    this.vars.color = 0.2;
    this.vars.colorChange = 40.80000000000031;
    this.vars.change = 3.697999999999939;
    this.vars.baseRotation = 10;

    this.watchers.rotation1 = new Watcher({
      label: "rotation_1",
      style: "normal",
      visible: true,
      value: () => this.vars.rotation1,
      x: 244,
      y: 150
    });
    this.watchers.move1 = new Watcher({
      label: "move_1",
      style: "normal",
      visible: true,
      value: () => this.vars.move1,
      x: 244,
      y: 99
    });
    this.watchers.change = new Watcher({
      label: "change",
      style: "normal",
      visible: true,
      value: () => this.vars.change,
      x: 243,
      y: 176
    });
    this.watchers.baseRotation = new Watcher({
      label: "base rotation",
      style: "normal",
      visible: true,
      value: () => this.vars.baseRotation,
      x: 244,
      y: 124
    });
  }
}
