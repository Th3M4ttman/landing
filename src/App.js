
import './App.css';
import React from "react";
import * as THREE from "three";
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import tex from "./defaultMat_baseColor.jpeg"
import normal from "./defaultMat_normal.jpeg"
import space from "./skybox.jpg"
import helveticaRegular from 'three/examples/fonts/helvetiker_regular.typeface.json'
import {FontLoader} from "three/examples/jsm/loaders/FontLoader"

var clock = new THREE.Clock();

const loader = new GLTFLoader();


class ThreeScene extends React.Component {
  constructor(props){
      super(props);
      this.state = {
        test: ""
        };
  }
  render() {
    return (<div 
      style={{ width: "100%", height: "100vh" }}
      ref={mount => { this.mount = mount}}
    />)
  }
  renderScene = () =>{
    if (this.renderer) this.renderer.render(this.scene, this.camera);
  }
  componentDidMount() {
    const width = this.mount.clientWidth;
    const height = this.mount.clientHeight;
    this.scene = new THREE.Scene();
    //Add Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor("#263238");
    this.renderer.setSize(width, height);
    this.mount.appendChild(this.renderer.domElement);
    //add Camera
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 8;
    this.camera.position.y = 5;
    //Camera Controls
    this.font = new FontLoader().parse(helveticaRegular)
    console.log(this.font)

    //LIGHTS
    this.light = new THREE.DirectionalLight(0xffffff, 2);
    this.light.position.set(0,10,10)
    this.pointlight = new THREE.PointLight(0xffffff, 1, 1)
    //this.pointlight.position.set(0,0,0)
    this.backlight = new THREE.PointLight(0xffffff, 0.8, 100)
    this.backlight.position.set(5,3,-9)
    //this.pointlight.position.set(0,0,0)

    this.light.position.set(0,0,200)
    //console.log(this.pointlight)
    //this.light.castShadow = true;
    //ADD Your 3D Models here
    loader.load('./scene.gltf', (gltf) => {
      this.model = gltf.scene
      this.model.position.set(0,3,-2.5);
      this.model.castShadow = true;
      this.model.receiveShadow = true;
      this.model.traverse(function(object) { 
        object.name = "skull"
        if ( object.isMesh ) object.material = new THREE.MeshBasicMaterial({color: 0xffffff}) 
      });
      console.log("Model",this.model)
      this.scene.add(this.model);
    });

    loader.load("./Sun.glb", (gltf) => {
      this.sun = gltf.scene;
      this.scene.add(this.sun);
      this.sun.position.set(0,0, 500)
      this.sun.scale.set(.1,.1,.1)
    });
    loader.load("./Earth.glb", (gltf) => {
      this.earth = gltf.scene;
      this.scene.add(this.earth);
      this.earth.position.set(-5,100, -200)
      this.earth.scale.set(.1,.1,.1)
      this.earth.rotation.set(
        THREE.Math.degToRad(180),
        THREE.Math.degToRad(0),
        THREE.Math.degToRad(0))
    });
    loader.load("./Moon.glb", (gltf) => {
      this.moon = gltf.scene;
      this.scene.add(this.moon);
      this.moon.position.set(-400,0,0)
      this.moon.scale.set(.1,.1,.1)
    });
    loader.load('./Chest.gltf', (gltf) => {
    this.chest = gltf.scene
    this.chestAnims = gltf.animations
    this.chest.scale.set(1, 1, 1);
    this.chest.position.set(0,3,-5);
    this.chest.rotation.set(
          THREE.Math.degToRad(45),
          THREE.Math.degToRad(90),
      THREE.Math.degToRad(0));

    this.mixer = new THREE.AnimationMixer(this.chest);
    this.open = this.mixer.clipAction(this.chestAnims[3]);   
    this.open.clampWhenFinished = true;
    this.open.loop = THREE.LoopOnce;
        
    this.close = this.mixer.clipAction(this.chestAnims[1]);   
    this.close.clampWhenFinished = true;
    this.close.loop = THREE.LoopOnce;
        
    this.closedanim = this.mixer.clipAction(this.chestAnims[2]);   
    this.closedanim.clampWhenFinished = true;
    this.closedanim.loop = THREE.LoopOnce;
        
    this.opened = this.mixer.clipAction(this.chestAnims[4]);   
    this.opened.clampWhenFinished = true;
    this.opened.loop = THREE.LoopOnce;
        
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
        
    this.renderer.shadowMap.enabled = true;
    this.chest.traverse(function(object) {
      object.name = "chest"
    })
    this.skybox.traverse(function(object) {
      object.name = "sky"
    })
    
    this.LINE_COUNT = 10000;
    this.geom = new THREE.BufferGeometry();
    this.geom.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6*this.LINE_COUNT), 3));
    this.geom.setAttribute("velocity", new THREE.BufferAttribute(new Float32Array(2*this.LINE_COUNT), 1));
    this.pos = this.geom.getAttribute("position");
    this.pa = this.pos.array;
    this.vel = this.geom.getAttribute("velocity");
    this.va = this.vel.array;

    for (let line_index= 0; line_index < this.LINE_COUNT; line_index++) {
        var x = Math.random() * 400 - 200;
        var y = Math.random() * 200 - 100;
        var z = Math.random() * 500 - 100;
        var xx = x;
        var yy = y;
        var zz = z;
        //line start
        this.pa[6*line_index] = x;
        this.pa[6*line_index+1] = y;
        this.pa[6*line_index+2] = z;
        //line end
        this.pa[6*line_index+3] = xx;
        this.pa[6*line_index+4] = yy;
        this.pa[6*line_index+5] = zz;

        this.va[2*line_index] = this.va[2*line_index+1]= 0;
    }

    this.linemat = new THREE.LineBasicMaterial({color: 0xff0000});
    this.lines = new THREE.LineSegments(this.geom, this.linemat);
    
    console.log(this.lines)
      
    this.camerastick = new THREE.Object3D();
    this.camerastick.position.set(0, 0, -2.5)
    this.scene.add(this.skybox);
    this.scene.add(this.pointlight);
    this.scene.add(this.backlight);
    this.scene.add(this.light);
    this.scene.add(this.chest);
    
    this.scene.add(this.skulltext)
        
    this.scene.add(this.lines);
    this.camerastick.add(this.camera)
    this.camera.position.set(0,3,15)
    this.scene.add(this.camerastick)
            
    this.setState({
      mouse: this.mouse,
      isopen: false,
      mixer: this.mixer,
      open: this.open,
      opened: this.opened,
      close: this.close,
      closed: this.closedanim,
      chest: this.chest,
      skull: this.model,
      renderer: this.renderer,
      scene: this.scene,
      camera: this.camera,
      light: this.light,
      PointLight: this.pointlight,
      lines: this.lines,
      starcolour: 0xeeeeff,
      visiblestars: false
    })
    //console.log("State", this.state)
    this.state.closed.play();
        
        

    });
    window.addEventListener('click', (event) => {
          this.onDocumentMouseDown(event);
    })

    this.geometry = new THREE.SphereGeometry( -500, 500, 500 );
    this.geometry.scale( 1, 1, 1 );
    this.skymaterial = new THREE.MeshBasicMaterial( {
            map: new THREE.TextureLoader().load(space)
    });
    this.skybox = new THREE.Mesh( this.geometry, this.skymaterial );
    this.skybox.position.set(0,0,0)

    this.start();
  }
  start = () => {
    if (!this.frameId) {
    this.frameId = requestAnimationFrame(this.animate);}
  }
  stop = () => {
  cancelAnimationFrame(this.frameId);
  }
  animate = () => {
    if (this.lines) {
      this.lines.material = new THREE.LineBasicMaterial({color: this.state.starcolour});
      this.lines.visible = this.state.visiblestars;
    for (let line_index= 0; line_index < this.LINE_COUNT; line_index++) {

      this.va[2*line_index] += 0.03; //bump up the velocity by the acceleration amount
      this.va[2*line_index+1] += 0.025;
      this.pa[6*line_index+2] += this.va[2*line_index];     //z
      this.pa[6*line_index+5] += this.va[2*line_index+1];   //z

      if(this.pa[6*line_index+5] > 200) {
          var z= Math.random() * 200 - 100;
          this.pa[6*line_index+2] = z;
          this.pa[6*line_index+5] = z;
          this.va[2*line_index] = 0;
          this.va[2*line_index+1] = 0;
          }
        }
      this.pos.needsUpdate = true;
    }
  //Animate Models Here
  //ReDraw Scene with Camera and Scene Object
  if (this.state.visiblestars){
    this.earth.position.set(
      this.earth.position.x,
      this.earth.position.y,
      this.earth.position.z + 5);
  }
  if (this.model) {
    this.model.rotation.y += 0.01;
  }
  if (this.camerastick) {
    if (this.state.isopen) {
      this.camerastick.rotation.set(0,0,0)
    } else {
    this.camerastick.rotation.y += 0.01;
    }
  }
    
    var delta = clock.getDelta();
    
    if ( this.mixer ) this.mixer.update( delta )

  this.frameId = window.requestAnimationFrame(this.animate);
  this.renderScene()
  }
  onDocumentMouseDown = ( event ) => {

  //console.log("event: ", event, "renderer", this.renderer, "camera", this.camera, "scene", this.scene, "raycaster", this.raycaster, "mouse", this.mouse)
  this.mouse.x = ( event.pageX / this.renderer.domElement.clientWidth ) * 2 - 1;
  this.mouse.y = - ( event.pageY / this.renderer.domElement.clientHeight ) * 2 + 1;
  this.raycaster.setFromCamera( this.mouse, this.camera );
  this.intersects = this.raycaster.intersectObjects( this.scene.children );
  //console.log(this.intersects, event)
  if ( this.intersects.length > 0 ) {
      //console.log("picked", this.intersects[0])
      if (this.intersects[0].object.name === "skull") {
        this.setState({visiblestars: true})
        console.log("Skull");
        this.scene.remove(this.model);
        this.scene.remove(this.chest);
        setTimeout(function() {
          window.location.href = 'https://matt-harris-portfolio.herokuapp.com';
        }, 5000);
      }
      else if (this.intersects[0].object.name === "chest") {
        if (!this.state.isopen){
          this.state.close.stop();
          this.state.open.play()
          console.log("Opened chest")
        } else {
          this.state.open.stop();
          this.state.close.play();
        }
        this.setState({isopen: !this.state.isopen})
      } else if (this.intersects[0].object.name === "sky"){
        console.log("sky")
      }else {
        console.log("Nothing")
        
      }
    }
  }
  }



function App() {
  return (
    <div className="App">
      <header className="App-header">
          <ThreeScene />
      </header>
    </div>
  );
}

export default App;