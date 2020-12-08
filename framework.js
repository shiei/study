export function createElement(type, attributes, ...children){

  let element;
  if(typeof type === "string")
    element = new ElementWrapper(type);
  else
    element = new type;

  for(let name in attributes){
    element.setAttribute(name, attributes[name])
  }

  for(let child of children){
    if(typeof child === "string"){
      child = new TextWrapper(child);
    }
    element.appendChild(child);
  }

  return element;

}
export class Component{

  constructor(type){
    //this.root = this.render();
    //console.log("gogogog");
  }

  setAttribute(name, value){
    this.root.setAttribute(name, value);
  }

  appendChild(child){
    console.log('test schou2 child:', child, 'this root:', this.root);
    child.mountTo(this.root);
  }

  mountTo(parent){
    console.log('test!!! schou parent:', parent);
    parent.appendChild(this.root);
  }

}

class ElementWrapper extends Component{

  constructor(type){
    this.root = document.createElement(type);
  }

}

class TextWrapper extends Component{

  constructor(content){
    this.root = document.createTextNode(content);
  }

}
