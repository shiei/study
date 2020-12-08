import {Component, createElement} from "./framework.js"
import {Carousel} from "./carousel.js"
import {Timeline, Animation} from "./animation.js"

let d = [
  "./img/touki_1.jpg",
  "./img/touki_2.jpg",
  "./img/touki_3.jpg",
  "./img/touki_4.jpg"
]

let a = <Carousel src={d} />;
a.mountTo(document.body);
//a.mountTo();

let tl = new Timeline();

window.tl = tl;
window.animation = new Animation({set b(v){console.log(v)}}, "b", 0, 100, 1000, null);

//tl.add(new Animation({set b(v){console.log(v)}}, "b", 0, 100, 1000, null))
//tl.add(new Animation({}, "a", 0, 100, 1000, null))
tl.start();
