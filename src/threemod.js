"use strict";
import * as THREE from '../node_modules/three/build/three.module.js';
import { GUI } from '../node_modules/three/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from '../node_modules/three/examples/jsm/loaders/RGBELoader.js';
const width=300, height=400;
function init(){
    window.three = window.three || {views:null,models:null,activeViews:null,scene:null,renderer:null,mixer:null,controls:null,clock:null,camera:null}; 
    window.three.init=function() {
		if(window.three.views) return;
        let stats, clock, gui,mesh,clips, mixer, actions, activeAction, previousAction;
        let camera, scene, renderer,controls, model,arm, face,expressions;
        const api = { state: 'Idle' };
		//those are some objects for caching instances
		window.three.views={};window.three.models={},window.three.activeViews={};

		clock = window.three.clock= new THREE.Clock(); //clock is used for animation mixing
		
        //controls= window.three.controls = new OrbitControls( camera, canvas );
		//controls.target.set( 0, 0.5, 0 );
		//controls.update();
		//controls.enablePan = true;
		//controls.enableDamping = true;
    }
    window.three.addModel=function(view,what){
		if(window.three.models[what]) {
			window.three.views[view].scene.add( window.three.models[what].model );
		} else {
        const loader = new GLTFLoader();
		loader.load(what
		, function ( object ) {
			const mixer = new THREE.AnimationMixer( object.scene ); //the mixer is necessary for animation or posing
			window.three.models[what]={model:object.scene,mixer:mixer};
			window.three.views[view].scene.add( object.scene );
			mixer.addEventListener( 'loop', function( e ) {//console.log(e); // properties of e: type, action and loopDelta
				e.action.paused=true; //stop looping action
			} ); //looping anims dont fire finished
			}, undefined, function ( e ) {console.error( e );	} );
		}
    }
	window.three.enterPage=function(){ //call this when leaving/entering a passage to flush out scenes to render 
		window.three.activeViews={};
	}
    window.three.setupScene=function(id,canvasid){
		window.three.init();
        const canvas = document.getElementById(canvasid)
		if(window.three.views[id]){
			window.three.activeViews[id]=window.three.views[id];
		}else{
			const scene = new THREE.Scene();
			const renderer = new THREE.WebGLRenderer({ antialias: true });
			renderer.setSize(width,height );//canvas.innerWidth, canvas.innerHeight );
			renderer.setPixelRatio( window.devicePixelRatio );
			renderer.outputEncoding = THREE.sRGBEncoding;
			//this adds agreen cube;
			const geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
			const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
			const cube = new THREE.Mesh( geometry, material );
			scene.add( cube );cube.position.set(1,0,-1);

			//lights
			const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
			hemiLight.position.set( 0, 20, 0 );
			scene.add( hemiLight );
			const dirLight = new THREE.DirectionalLight( 0xffffff );
			dirLight.position.set( 0, 20, 10 );
			scene.add( dirLight );

			const camera = new THREE.PerspectiveCamera( 75, width/height, 0.01, 1000 );
			let bgcolor=0xe0e0e0;
			camera.position.z = 1,camera.position.y = 0.5;
			//adjustments for different setups  todo load from file
			if(id==="TestA") {
				bgcolor=0xbd8989;
				camera.position.x = -0.45;camera.lookAt(0.0,camera.position.y,0);
			}else if (id==="TestB"){
				camera.position.z = 5;camera.position.y=3,camera.lookAt(0.0,camera.position.y,0);
			}else {
				bgcolor=0xbd8989;
				camera.position.z = 1;camera.position.y=0.5,camera.lookAt(0.0,camera.position.y,0);
			}
			scene.background = new THREE.Color( bgcolor );
			scene.fog = new THREE.Fog( bgcolor, 20, 100 );	
			window.three.views[id]={scene:scene,camera:camera,renderer:renderer};
			window.three.activeViews[id]=window.three.views[id];
		}
		canvas.appendChild( window.three.views[id].renderer.domElement );
        animate();
    }
    function animate() {
        const dt = window.three.clock.getDelta();
        //cube.rotation.x += 0.01;cube.rotation.y += 0.01;
		const views=Object.keys(window.three.activeViews);
		let view;
		for(var x of views) { //there could be multiple pictures in a passage... 
			view=window.three.activeViews[x];
			view.renderer.render( view.scene, view.camera );
			if(view.mixer) view.update( dt );
		}
        if(window.three.controls) window.three.controls.update();
        requestAnimationFrame( animate ); //this will cause animate to be called cyclical - we wouldnt need that except for animation
		//todo only call animate or if there is a change in the scene
    };
}
init();
//export {show };