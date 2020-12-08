import {Timeline, Animation} from "../animation.js"
import {ease} from "../ease.js"

let tl = new Timeline();

tl.start();

//tl.add(new Animation(document.querySelector("#target").style, "transform", 0, 100, 1000, 0, null, v=>{return `translateX(${v}px)`}))
tl.add(new Animation(document.querySelector("#target").style, "transform", 0, 500, 2000, 0, ease, v=>`translateX(${v}px)`))
tl.add(new Animation(document.querySelector("#target2").style, "transform", 0, 500, 2000, 0, null, v=>`translateX(${v}px)`))
//document.querySelector("#target3").style.transition = "transform ease-in 2s";
document.querySelector("#target3").style.transition = "transform ease 2s";
document.querySelector("#target3").style.transform = "translateX(500px)";

//是时候明白一下document和window的区别了
document.querySelector("#pause-btn").addEventListener("click", ()=>tl.pause());
document.querySelector("#resume-btn").addEventListener("click", ()=>tl.resume());
