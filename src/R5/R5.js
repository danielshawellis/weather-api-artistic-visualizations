/* eslint-disable require-yield, eqeqeq */

import {
  Sprite,
  Trigger,
  Watcher,
  Costume,
  Color,
  Sound
} from "../driver-script";

export default class R5 extends Sprite {
  constructor(...args) {
    super(...args);

    this.costumes = [
      new Costume("costume2", "./R5/costumes/costume2.svg", {
        x: 3.0625,
        y: 3.0625
      }),
      new Costume("costume3", "./R5/costumes/costume3.svg", {
        x: 3.0625,
        y: 5.0625
      }),
      new Costume("costume4", "./R5/costumes/costume4.svg", {
        x: 5.0619768613218525,
        y: 3.0623995335819814
      }),
      new Costume("costume5", "./R5/costumes/costume5.svg", {
        x: 5.639364632365812,
        y: 3.0116760513651855
      })
    ];

    this.sounds = [new Sound("pop", "./R5/sounds/pop.wav")];

    this.triggers = [
      new Trigger(Trigger.GREEN_FLAG, this.whenGreenFlagClicked),
      new Trigger(Trigger.CLONE_START, this.startAsClone)
    ];
  }

  *whenGreenFlagClicked() {
    this.effects.clear();
    this.direction = 90;
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
    this.size = 225;
    this.moveBehind(4);
    for (let i = 0; i < 50; i++) {
      this.move(this.stage.vars.move1 + 1);
      this.direction += this.stage.vars.rotation1 + 1;
      this.effects.color =
        (this.x + this.y) * this.stage.vars.color + this.stage.vars.colorChange;
      yield;
    }
    for (let i = 0; i < 10; i++) {
      this.effects.ghost += 10;
      this.move(this.stage.vars.move1 + 1);
      this.direction += this.stage.vars.rotation1 + 1;
      this.effects.color =
        (this.x + this.y) * this.stage.vars.color + this.stage.vars.colorChange;
      yield;
    }
    this.deleteThisClone();
  }
}
