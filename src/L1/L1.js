/* eslint-disable require-yield, eqeqeq */

import {
  Sprite,
  Trigger,
  Watcher,
  Costume,
  Color,
  Sound
} from "../driver-script";

export default class L1 extends Sprite {
  constructor(...args) {
    super(...args);

    this.costumes = [
      new Costume("costume2", "./L1/costumes/costume2.svg", {
        x: 3.0625,
        y: 3.0625
      }),
      new Costume("costume3", "./L1/costumes/costume3.svg", {
        x: 3.0625,
        y: 5.0625
      }),
      new Costume("costume4", "./L1/costumes/costume4.svg", {
        x: 5.061975256073765,
        y: 3.0624003060881932
      }),
      new Costume("costume5", "./L1/costumes/costume5.svg", {
        x: 5.640472559441491,
        y: 3.0116734426139544
      })
    ];

    this.sounds = [new Sound("pop", "./L1/sounds/pop.wav")];

    this.triggers = [
      new Trigger(Trigger.GREEN_FLAG, this.whenGreenFlagClicked),
      new Trigger(Trigger.CLONE_START, this.startAsClone)
    ];
  }

  *whenGreenFlagClicked() {
    this.effects.clear();
    this.direction = -90;
    this.goto(0, 0);
    while (true) {
      this.createClone();
      this.direction += this.stage.vars.baseRotation;
      this.effects.color =
        (this.x + this.y) * this.stage.vars.color + this.stage.vars.colorChange;
      yield;
    }
  }

  *startAsClone() {
    this.size = 125;
    for (let i = 0; i < 50; i++) {
      this.move(this.stage.vars.move1);
      this.direction += this.stage.vars.rotation1;
      this.effects.color =
        (this.x + this.y) * this.stage.vars.color + this.stage.vars.colorChange;
      yield;
    }
    for (let i = 0; i < 10; i++) {
      this.effects.ghost += 10;
      this.move(this.stage.vars.move1);
      this.direction += this.stage.vars.rotation1;
      this.effects.color =
        (this.x + this.y) * this.stage.vars.color + this.stage.vars.colorChange;
      yield;
    }
    this.deleteThisClone();
  }
}
