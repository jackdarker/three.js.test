"use strict";
// import { FreeCamera } from '../node_modules/@babylonjs/core/Cameras/freeCamera.js'; //../node_modules/
// import { Engine } from '../node_modules/@babylonjs/core/Engines/engine.js';
// import { HemisphericLight } from '../node_modules/@babylonjs/core/Lights/hemisphericLight.js';
// import { Vector3 } from '../node_modules/@babylonjs/core/Maths/math.vector.js';
// import { CreateGround } from '../node_modules/@babylonjs/core/Meshes/Builders/groundBuilder.js';
// import { CreateSphere } from '../node_modules/@babylonjs/core/Meshes/Builders/sphereBuilder.js';
// import { Scene } from '../node_modules/@babylonjs/core/scene.js';
// import { GridMaterial } from '../node_modules/@babylonjs/materials/grid/gridMaterial.js';
import * as BABYLON from 'babylonjs';//requires importmap; doesnt work:"BABYLON.Engine is not a constructor";
;(function(){

// Get the canvas element from the DOM.
const canvas = document.getElementById("renderCanvas");

// Associate a Babylon Engine to it.
const engine = new BABYLON.Engine(canvas);

// Create our first scene.
var scene = new  Scene(engine);

// This creates and positions a free camera (non-mesh)
var camera = new  FreeCamera("camera1", new Vector3(0, 5, -10), scene);

// This targets the camera to scene origin
camera.setTarget( Vector3.Zero());

// This attaches the camera to the canvas
camera.attachControl(canvas, true);

// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
var light = new  HemisphericLight("light1", new Vector3(0, 1, 0), scene);

// Default intensity is 1. Let's dim the light a small amount
light.intensity = 0.7;

// Create a grid material
var material = new  GridMaterial("grid", scene);

// Our built-in 'sphere' shape.
var sphere =  CreateSphere("sphere1", { segments: 16, diameter: 2 }, scene);

// Move the sphere upward 1/2 its height
sphere.position.y = 2;

// Affect a material
sphere.material = material;

// Our built-in 'ground' shape.
var ground =  CreateGround("ground1", { width: 6, height: 6, subdivisions: 2 }, scene);

// Affect a material
ground.material = material;

// Render every frame
engine.runRenderLoop(() => {
  scene.render();
});
})();