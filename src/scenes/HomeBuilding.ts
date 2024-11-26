/* eslint-disable @typescript-eslint/no-explicit-any */
import { Scene } from "phaser";
import { ESCENE_KEYS } from "../shared/scene-keys";

export class HomeBuilding extends Scene {
  constructor() {
    super(ESCENE_KEYS.HOME_HOUSE);
  }

  init() {
    console.log("HOME HOUSE");
  }

  preload() {}

  create() {}
}
