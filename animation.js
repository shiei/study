//JS中比较常见的处理帧的方案(要有一个帧的概念，一帧就映像动画中，最小单位的单幅影像画面，
//相当于电影胶片上的每一个格镜头。一帧就是一幅静止的画面。连续的帧行程动画。
//通常说的帧数（严格说是帧率，而帧数则为总共有多少张画面），就是1秒钟时间里传输图片的（数量）帧数。
//也可以理解为图像处理器没秒可以刷新几次。
//单位fps（frames per second））
//虽然有些浏览器的帧率是70fps或80fps但是一般软件对齐60fps，所以播放一帧的时间刚好是16毫。（1秒是1000毫秒）
//人眼能识别动画的最高帧率是60fps？！

/*
//方案1
setInterval(() => {

//弊端就是可能会有执行内容的积压，16毫秒后不管上一次执行完与否都会触发下一次执行

}, 16);

//方案2
let tick = () => {

  setTimeout(tick, 16);

}

//方案3 比较好，因为浏览器帧率不一定就是60fos，而且如果存在给浏览器降帧降频的处理requestAnimationFrame也会跟着一起降。
let tick = () => {

  let handler = requestAnimationFrame(tick);
  cancelAnimationFrame(hander) //避免资源的浪费

}
*/

const TICK = Symbol("tick"); //私有化？！Symbol具有唯一性
const TICK_HANDLER = Symbol("tick-handler");
const ANIMATIONS = Symbol("animations");
const START_TIME = Symbol("start-time");
const PAUSE_TIME = Symbol("puase-time");
const PAUSE_START = Symbol("puase-start");

export class Timeline {

  constructor(){
    this.state = "inited";//this super用法不熟
    this[ANIMATIONS] = new Set();//Set已有类？！
    this[START_TIME] = new Map();
  }

  start(){
    if(this.state !== "inited")
      return;
    this.state = "started";
    let startTime = Date.now();
    this[PAUSE_TIME] = 0;
    this[TICK] = () => {

      let now = Date.now();
      for(let animation of this[ANIMATIONS]){
        let t;
        if(this[START_TIME].get(animation) < startTime)
          t = now - startTime - this[PAUSE_TIME] - animation.delay;
        else
          t = now - this[START_TIME].get(animation) - this[PAUSE_TIME] - animation.delay //这个t是什么要明查记录（命名过于简单容易忘）
        if(animation.duration < t){
          this[ANIMATIONS].delete(animation)
          t = animation.duration;
        }
        if(t>0)
          animation.receive(t);
      }
      //console.log("tick","this:",this);
      this[TICK_HANDLER] = requestAnimationFrame(this[TICK]);
    }
    
    this[TICK]();
  }

  pause(){
    if(this.state !== "started")
      return;
    this.state = "paused";
    this[PAUSE_START] = Date.now();//this后不跟点跟方括号，要查清
    cancelAnimationFrame(this[TICK_HANDLER]);
  }

  resume(){
    if(this.state !== "paused")
      return;
    this.state = "started";
    this[PAUSE_TIME] += Date.now() - this[PAUSE_START]; 
    this[TICK]();
  }

  //set rate(){}
  //get rate(){}

  reset(){
    this.state = "inied";
    this.pause(); 
    let startTime = Date.now();
    this[PAUSE_TIME] = 0;
    this[ANIMATIONS] = new Set();
    this[START_TIME] = new Map();
    this[TICK_HANDLER] = null;
    this[PAUSE_START] = 0;

  }

  add(animation, startTime){
    if(arguments.length < 2){
      startTime = Date.now()
    }
    this[ANIMATIONS].add(animation)
    this[START_TIME].set(animation, startTime);
  }
  
}

export class Animation {

//属性动画（起始值到终止值）
//帧动画（迪斯尼动画）

  constructor(object, property, startValue, endValue, duration, delay, timingFunction, template){
    template = template || (v=>v);
    this.object = object; 
    this.property = property; 
    this.startValue = startValue; 
    this.endValue = endValue; 
    this.duration = duration; 
    this.timingFunction = timingFunction || (v=>v);
    this.delay = delay; 
    this.template = template; 
  }

/*
  set property(v2){
    console.log("v2:", v2);//setter的执行timing是什么？！
  }
*/

  receive(time){

    console.log("time:",time);
    console.log("this.object:", this.object[this.property]);
    let range = this.endValue - this.startValue;
    let progress = this.timingFunction(time / this.duration);
    this.object[this.property] = this.template(this.startValue + range * progress);
  }
}
