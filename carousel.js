import {Component, createElement} from "./framework.js"

export class Carousel extends Component {
  constructor(){
    //this.root = document.createElement("div");
    super();
    this.attributes = Object.create(null);
  }

  setAttribute(name, value){
    this.attributes[name] = value;
  }

  render(){
    this.root = document.createElement("div");
    this.root.classList.add("carousel");
    for(let record of this.attributes.src){
      //let child = document.createElement("img");
      //child.src = record;
      let child = document.createElement("div");
      child.style.backgroundImage = `url('${record}')`;
      this.root.appendChild(child);
    }

//手动播放
  this.root.addEventListener("mousedown", event=>{
    console.log("mousedown");
    let children = this.root.children;
    let startX = event.clientX;
    let position = 0;

    let move = event=>{
      let x = event.clientX - startX;

      let current = position - ((x-x%200)/200);

      for(let offset of [-1, 0, 1]){
        let pos = current + offset;
        pos = (pos + children.length) % children.length;//
        children[pos].style.transition = "none";
        children[pos].style.transform = `translateX(${-pos * 200 + offset * 200 + x % 500}px)`;
      } 
 
      for(let child of children){
        child.style.transition = "none";
        child.style.transform = `translateX(${-position * 200 + x}px)`;
      } 
    }

    let up = event => {
      let x = event.clientX - startX;
      position = position - Math.round(x/ 200);//画像の横幅
      for(let child of children){
        child.style.transition = "";
        child.style.transform = `translateX(${-position * 200}px)`;
      } 
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    }
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  })

//自动播放
/*
    let currentIndex = 0; 
    setInterval(() => {
      let children = this.root.children;
      let nextIndex = (currentIndex + 1) % children.length;

      let current = children[currentIndex];
      let next = children[nextIndex];

      next.style.transition = "none";
      next.style.transform = `translateX(${100 - nextIndex * 100}%)`

      console.log(currentIndex, nextIndex);
      setTimeout(()=>{
	next.style.transition = "";
        current.style.transform = `translateX(${-100 - currentIndex * 100}%)`;
        next.style.transform = `translateX(${- nextIndex * 100}%)`
        currentIndex = nextIndex;
      },16)
    }, 3000);
*/

    console.log(this.attributes.src);
    return this.root;
    //return document.createElement("div");
  }

  mountTo(parent){
    parent.appendChild(this.render());
    //Document.body.appendChild(this.root);
  }

}

