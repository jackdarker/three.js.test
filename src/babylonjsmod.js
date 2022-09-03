"use strict";
// import { FreeCamera } from '../node_modules/@babylonjs/core/Cameras/freeCamera.js'; //this all doesnt work because this is for webpack?
// import { Engine } from '../node_modules/@babylonjs/core/Engines/engine.js';
// import { HemisphericLight } from '../node_modules/@babylonjs/core/Lights/hemisphericLight.js';
// import { Vector3 } from '../node_modules/@babylonjs/core/Maths/math.vector.js';
// import { CreateGround } from '../node_modules/@babylonjs/core/Meshes/Builders/groundBuilder.js';
// import { CreateSphere } from '../node_modules/@babylonjs/core/Meshes/Builders/sphereBuilder.js';
// import { Scene } from '../node_modules/@babylonjs/core/scene.js';
// import { GridMaterial } from '../node_modules/@babylonjs/materials/grid/gridMaterial.js';
//import * as BABYLON from 'babylonjs';//requires importmap; doesnt work:"BABYLON.Engine is not a constructor";
//import { Engine, Scene, FreeCamera, HemisphericLight, Vector3, MeshBuilder, Mesh } from "babylonjs";
//you have to <script src="./babylon.js"></script> in your html !
const width=300, height=400;
;(function(){

  window.babylon = window.babylon || {views:null,models:null,activeViews:null,clock:null}; 
  window.babylon.init=function() {
    if(window.babylon.views) return;
    //those are some objects for caching instances
		window.babylon.views={};window.babylon.models={},window.babylon.activeViews={};
    //no clock?
  };
  window.babylon.addModel=function(view,modelid){};
  window.babylon.enterPage=function(){ //call this when leaving/entering a passage to flush out scenes to render 
		window.babylon.activeViews={};
	}
  window.babylon.setupScene=function(id,canvasid){ //Warning ! you may only setup 8 or so renderers in a browser ! A workaround: https://threejs.org/manual/#en/multiple-scenes
		window.babylon.init();
    const canvas = document.getElementById(canvasid)
		if(window.babylon.views[id]){
			window.babylon.activeViews[id]=window.babylon.views[id];
		}else{
      const engine = new BABYLON.Engine(canvas,true,{ preserveDrawingBuffer: true, stencil: true,  disableWebGL2Support: false});
      var scene = new  BABYLON.Scene(engine);
      var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 10, new BABYLON.Vector3(0, 0, 0), scene);//new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0,2, -10), scene);
      // Enable mouse wheel inputs.
      camera.inputs.addMouseWheel();
      // This targets the camera to scene origin
      camera.setTarget( BABYLON.Vector3.Zero());
      camera.setPosition(new BABYLON.Vector3(0, 5, -10));
      // This attaches the camera to the canvas
      camera.attachControl(canvas, true);
      // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
      var light = new  BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
      // Default intensity is 1. Let's dim the light a small amount
      light.intensity = 0.7;

      const cube = BABYLON.MeshBuilder.CreateBox("sphere1", { size: 1 }, scene);
      cube.position.x=0,cube.position.y=1,cube.position.z=0;
      var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 6, height: 6}, scene);

			let bgcolor=0xe0e0e0;
			//   camera.position.z = 1,camera.position.y = 0.5;
			//adjustments for different setups  todo load from file
			if(id==="TestA") {
				bgcolor=0xbd8989;
				// camera.position.x = -0.45;//camera.lookAt(0.0,camera.position.y,0);
			}else if (id==="TestB"){
				//  camera.position.z = 5;camera.position.y=3;//camera.lookAt(0.0,camera.position.y,0);
			}else {
				bgcolor=0xbd8989;
				//  camera.position.z = 1;camera.position.y=0.5;//camera.lookAt(0.0,camera.position.y,0);
			}
			//layers ??  scene.background = new THREE.Color( bgcolor );
			//layers ??scene.fog = new THREE.Fog( bgcolor, 20, 100 );	
			window.babylon.views[id]={scene:scene,
				camera:camera,
				mixers:{}, //contains for each object in the scene their mixer 
				actions:{},//contains for each object in the scene a collection of actions  actions[modelid].[actionname]
				morphs:{}}; //contains for each object in the scene a collection of morphs  morphs[modelid].[morphname].influence
			window.babylon.activeViews[id]=window.babylon.views[id];
      engine.runRenderLoop(() => { scene.render();});
		}
  }
	//this uses animation to get into a pose; the duration is set to 0; make sure action is set to LoopOnce and clampWhenFinished
	window.babylon.setAnimation=function(sceneid,modelid,poseid){	}
	//this modifiys a shapekey
	window.babylon.setMorph=function(sceneid,modelid,morphid,influence){	}
	window.babylon.toogleCam=function (sceneid){	}
})();