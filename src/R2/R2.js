/* eslint-disable require-yield, eqeqeq */

import {
  Sprite,
  Trigger,
  Watcher,
  Costume,
  Color,
  Sound
} from "../driver-script";

export default class R2 extends Sprite {
  constructor(...args) {
    super(...args);

    this.costumes = [
      new Costume("costume2", "./R2/costumes/costume2.svg", {
        x: 3.0625,
        y: 3.0625
      }),
      new Costume("costume3", "./R2/costumes/costume3.svg", {
        x: 3.0625,
        y: 5.0625
      }),
      new Costume("costume5", "./R2/costumes/costume5.svg", {
        x: 5.639354449718098,
        y: 3.011686163593623
      })
    ];

    this.sounds = [new Sound("pop", "./R2/sounds/pop.wav")];

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
    this.size = 150;
    this.moveBehind(1);
    for (let i = 0; i < 50; i++) {
      this.move(this.stage.vars.move1 + 0.25);
      this.direction += this.stage.vars.rotation1 + 0.25;
      this.effects.color =
        (this.x + this.y) * this.stage.vars.color + this.stage.vars.colorChange;
      yield;
    }
    for (let i = 0; i < 10; i++) {
      this.effects.ghost += 10;
      this.move(this.stage.vars.move1 + 0.25);
      this.direction += this.stage.vars.rotation1 + 0.25;
      this.effects.color =
        (this.x + this.y) * this.stage.vars.color + this.stage.vars.colorChange;
      yield;
    }
    this.deleteThisClone();
  }
}
