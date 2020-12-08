//let element = document.documentElement;//HTML?!document究竟是啥 查明
//console.log(element);

export class Dispatcher {
  
  constructor(element){
    this.element = element;
  }

  dispatch(type, properties){

    let event = new Event(type);
    //console.log("properties:", properties);

    for(let name in properties){// for in 和 for of的区别
      event[name] = properties[name];
      //console.log("event name:", event.name, event[name]);
    }

    this.element.dispatchEvent(event);
  }

}


//listen=>recognize=>dispatch

//new Listener(new Recognizer(dispatch)) 回调 
//或new Listener(new Recognizer(new Dispatcher)) 进行解耦

export class Listener {

  constructor(element, recognizer){

    //鼠标上两个键一起按时，mouseup也被多次触发？！
    let isListeningMouse = false;
    let contexts = new Map();

    element.addEventListener("mousedown", event=>{

      //console.log(event.button, event.buttons,  "1<<:", 1 << event.button);
      let context = Object.create(null);
      //初始设置为null是为了避免object原始的属性跳出来裹乱
      contexts.set("mouse" + (1 << event.button), context);//可是这并不是一次点击呀？！
      recognizer.start(event, context);

      let mousemove = event=>{
        let button = 1;
        //console.log("event.buttons:", event.buttons);
        while(button <= event.buttons){
          if(button & event.buttons){
            //注:event.button和event.buttons中的，表示鼠标左键和中键的位置不一致，所以需要以下处理
            //order of buttons & button property is not same
            let key;
            if(button === 2)
              key = 4;//魔术数字是不是定义一下
            else if(button === 4)
              key = 2;
            else
              key = button;
            let context = contexts.get("mouse" + key);//"mouse"+event.button这个运算是不是可以提出来只做一次
            recognizer.move(event, context);
          } 
          button = button << 1;
        }
        //console.log("mousemove:", event.clientX, event.clientY);
      }

      let mouseup = event=>{
        //console.log("end", event.button);
        let context = contexts.get("mouse" + (1 << event.button));
        recognizer.end(event, context);
        contexts.delete("mouse" + (1 << event.button));//移位运算是不是也可以挑出来，只执行一次
        //if(event.buttons === 0){//这个对吗？！ 
        //element.removeEventListener("mousemove", mousemove);
        //element.removeEventListener("mouseup", mouseup);
          document.removeEventListener("mousemove", mousemove);
          document.removeEventListener("mouseup", mouseup);
        //isListeningMouse = true;
        //}
        //addEventListener的时候第三个参数options里可以加三个，是否启用capture模式，是否启用once只触发一次就自动remove掉，
        //是否是passive，就是里面能不能preventDefault（同步出发异步出发的关系？！）
      }

      //if(!isListeningMouse) {
      document.addEventListener("mousemove", mousemove);
      document.addEventListener("mouseup", mouseup);
      //isListeningMouse = true;
      //}

    })// end mouse down
      
    /*以下为触屏操作*/
    //很多设备支持多点触发，所以这个event里边并不是一个触电（event为啥会传进去，要查明）
    element.addEventListener("touchstart", event=>{
      for(let touch of event.changedTouches){
        //console.log("start", touch.clientX, touch.clientY);
        let context = Object.create(null);
        contexts.set(touch.identifier, context);
        recognizer.start(touch, context);
      }
    })

    element.addEventListener("touchmove", event=>{
      for(let touch of event.changedTouches){
        //console.log("move", touch.clientX, touch.clientY);
        let context = contexts.get(touch.identifier);
        recognizer.move(touch, context)
      }
    })

    element.addEventListener("touchend", event=>{
      for(let touch of event.changedTouches){
        //console.log("end", touch.clientX, touch.clientY);
        let context = contexts.get(touch.identifier);
        recognizer.end(touch, context);
        contexts.delete(touch.identifier)
      }
    })

    element.addEventListener("touchcancel", event=>{
      //例如三秒出现一个alert等 系统操作都会打断触屏事件
      //setTimeout(()=>alert("!!"), 3000)
      for(let touch of event.changedTouches){
        //console.log("cancel", touch.clientX, touch.clientY);
        let context = contexts.get(touch.indentifier);
        recognizer.cancel(touch, context);
        contexts.delete(touch.identifier);
      }
    })

  }//end consructor of Listener
}//end class Listener

export class Recognizer {

  constructor(dispatcher){
    this.dispatcher = dispatcher;
  }
  
  start(point, context){
    //console.log("start", point.clientX, point.clientY);
    context.startX = point.clientX, context.startY = point.clientY;
    context.points = [{
      t: Date.now(),
      x: point.clientX,
      y: point.clientY
    }];

    context.isTap = true;
    context.isPan = false;
    context.isPress = false;

    context.handler = setTimeout(()=>{
      console.log("press");
      context.isTap = false;
      context.isPan = false;
      context.isPress = true;
      context.handler = null;//注销时clearTimeout一个null是没有关系的。置为null是为了避免多次clear？！
      this.dispatcher.dispatch("press", {})
    }, 500)
  }

  move(point, context){

    //console.log("move event:", point);
    let dx = point.clientX - context.startX, dy = point.clientY - context.startY;
    //100px吧？！单位已经是px了？！
    if(!context.isPan && dx ** 2 + dy ** 2 > 100){
      //retina屏幕怎么判断 
      context.isPan = true;
      context.isTap = false;
      context.isPress = false;
      context.isVertical = Math.abs(dx) < Math.abs(dy);
      console.log("panstart");
      clearTimeout(context.handler);
      this.dispatcher.dispatch("panstart", {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical //判断是上下划还是左右划
      });
    }
    //两点（x1,y1）(x2,y2)的距离=（x1-x2）平方+（y1-y2）
    //console.log("move", point.clientX, point.clientY);

    if(context.isPan){

      this.dispatcher.dispatch("pan", {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical //判断是上下划还是左右划
      });

      //console.log(dx, dy);
      //console.log("pan");
    }

    //只存取半秒内的点击动作 filter是数组的方法
    context.points = context.points.filter(point => Date.now() - point.t < 500)

    context.points.push({
      t: Date.now(),
      x: point.clientX,
      y: point.clientY
    });

  }// end move

  end(point, context){

    //console.log("context:", context);
    //console.log("end", point.clientX, point.clientY);
    if(context.isTap){
      //console.log("tap");
      this.dispatcher.dispatch("tap", {});
      clearTimeout(context.handler);
    }

    if(context.isPress){
      //console.log("press end");
      this.dispatcher.dispatch("tap", {});//不需要过多的参数信息是因为，长按这种东西，你只要知道他按的是谁即可
    }

    let d,v;
    context.points = context.points.filter(point => Date.now() - point.t < 500)
    //考虑points里为空的情况，在我的环境不再现，所以先注释掉
    //if(!context.points/length){
    //  v = 0;
    //} else {//下述逻辑}
    d = Math.sqrt((point.clientX - context.points[0].x) ** 2 + 
        (point.clientY - context.points[0].y) ** 2);
    v = d / (Date.now() - context.points[0].t); //开根号等的计算时间误差可忽略？！

    //通过一些测试和分析，可以认为速度大于1.5就是比较快的了（轻弹级别）
    //速度单位是像素每毫秒
    if(v > 1.5){
      //console.log("flick")
      context.isFlick = true;
      this.dispatcher.dispatch("panend", {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical, //判断是上下划还是左右划
        isFlick: context.isFlick,
        velocity: v //有时候是单独监听flick事件的 
      });
    } else {
      context.isFlick = false;//尚未初始化，以及状态管理
    }
    console.log(v);

    if(context.isPan){
      //console.log("pan end");
      this.dispatcher.dispatch("panend", {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical, //判断是上下划还是左右划
        isFlick: context.isFlick 
      });
    }

  }//end end

  cancel(point, context){
    clearTimeout(context.handler);
    this.dispatcher.dispatch("cancel", {});
    //console.log("cancel", point.clientX, point.clientY);
  }
  
}//end class Recognizer

export function enableGesture(element) {
  new Listener(element, new Recognizer(new Dispatcher(element)));
}
