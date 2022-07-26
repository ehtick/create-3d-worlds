export class AnimationProxy {
  constructor(animations) {
    this.animations_ = animations
  }

  get animations() {
    return this.animations_
  }
};
