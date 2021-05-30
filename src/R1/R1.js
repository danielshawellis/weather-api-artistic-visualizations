/* eslint-disable require-yield, eqeqeq */

import {
  Sprite,
  Trigger,
  Watcher,
  Costume,
  Color,
  Sound
} from "../driver-script";

export default class R1 extends Sprite {
  constructor(...args) {
    super(...args);

    this.costumes = [
      new Costume("costume2", "./R1/costumes/costume2.svg", {
        x: 3.0625,
        y: 3.0625
      }),
      new Costume("costume3", "./R1/costumes/costume3.svg", {
        x: 3.0625,
        y: 5.0625
      }),
      new Costume("costume4", "./R1/costumes/costume4.svg", {
        x: 5.061976093100611,
        y: 3.062398615317477
      }),
      new Costume("costume5", "./R1/costumes/costume5.svg", {
        x: 5.639355182647705,
        y: 3.0116798877716064
      })
    ];

    this.sounds = [new Sound("pop", "./R1/sounds/pop.wav")];

    this.triggers = [
      new Trigger(Trigger.GREEN_FLAG, this.whenGreenFlagClicked),
      new Trigger(Trigger.CLONE_START, this.startAsClone),
      new Trigger(Trigger.GREEN_FLAG, this.whenGreenFlagClicked2),
      new Trigger(Trigger.GREEN_FLAG, this.whenGreenFlagClicked3),
      new Trigger(
        Trigger.KEY_PRESSED,
        { key: "space" },
        this.whenKeySpacePressed
      )
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

  *whenGreenFlagClicked2() {
    this.stage.vars.baseRotation = 10;
    this.stage.vars.colorChange = 0;
    this.stage.vars.color = 0.2;
    this.stage.vars.move1 = 0;
    this.stage.vars.rotation1 = 0;
    while (true) {
      this.stage.vars.move1 += Math.round(
        this.random(this.stage.vars.change * -1, this.stage.vars.change)
      );
      this.stage.vars.rotation1 += Math.round(
        this.random(this.stage.vars.change * -1, this.stage.vars.change)
      );
      if (this.stage.vars.move1 > 8) {
        this.stage.vars.move1 += -2;
      }
      if (-8 > this.stage.vars.move1) {
        this.stage.vars.move1 += 2;
      }
      if (this.stage.vars.rotation1 > 25) {
        this.stage.vars.rotation1 += -2;
      }
      if (-25 > this.stage.vars.rotation1) {
        this.stage.vars.rotation1 += 2;
      }
      this.stage.vars.colorChange += 0.1;
      yield;
    }
  }

  *whenGreenFlagClicked3() {
    this.stage.vars.change = 1.25;
    while (true) {
      while (!(this.stage.vars.change > 5)) {
        this.stage.vars.change += 0.006;
        yield;
      }
      while (!(this.stage.vars.change < 1)) {
        this.stage.vars.change += -0.006;
        yield;
      }
      yield;
    }
  }

  *whenKeySpacePressed() {
    while (true) {
      this.stage.vars.baseRotation += Math.round(
        this.random(this.stage.vars.change * -1, this.stage.vars.change)
      );
      if (this.stage.vars.baseRotation > 25) {
        this.stage.vars.baseRotation += -2;
      }
      if (-25 > this.stage.vars.baseRotation) {
        this.stage.vars.baseRotation += 2;
      }
      yield;
    }
  }
}
