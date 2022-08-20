"use strict";
import * as THREE from '../node_modules/three/build/three.module.js';
import * as SkeletonUtils from '../node_modules/three/examples/jsm/utils/SkeletonUtils.js';
import { GUI } from '../node_modules/three/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from '../node_modules/three/examples/jsm/loaders/RGBELoader.js';
const width=300, height=400;
;(function(){
    window.three = window.three || {views:null,models:null,activeViews:null,clock:null}; 
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
    window.three.addModel=function(view,modelid){
		if(window.three.models[modelid]) {
			postLoad(view,modelid)
		} else {
        const loader = new GLTFLoader();
			loader.load(modelid
			, function ( object ) {
				window.three.models[modelid]={model:object.scene,anims:object.animations};
				postLoad(view,modelid);
				}, undefined, function ( e ) {console.error( e );	} );
		}
		function postLoad(view,modelid){
			if(window.three.views[view].mixers[modelid]) return;
			let face=null,morphs={keys:{},values:{}};
			const mcopy = SkeletonUtils.clone( window.three.models[modelid].model );
			const mixer = new THREE.AnimationMixer( mcopy ); //the mixer is necessary for animation or posing
			window.three.views[view].mixers[modelid]=mixer; //todo if we add same model multiple times, we would need multiple mixers
			// get actions
			let action,actions={};
			window.three.views[view].actions[modelid]={};
			for(var x of window.three.models[modelid].anims) {
				action = mixer.clipAction( x );
				action.clampWhenFinished = true; action.loop = THREE.LoopOnce; //should freeze into pose
				window.three.views[view].actions[modelid][x.name]=action;
			}
			
			// get morphs
			mcopy.traverse( function ( child ) { //find the first Object3D with morphTargets; todo and if there are multiple? 
				if(!face && child.morphTargetDictionary){
					face=child;
				}
			});
			face = mcopy.getObjectByName( 'Head_4' ); //Todo !! Robot has multiple objects with morphtargets - pick the right one
			if(face) {
				morphs.keys=Object.keys( face.morphTargetDictionary );
				morphs.values=face.morphTargetInfluences;
			}
			window.three.views[view].morphs[modelid]=morphs;

			//mixer.addEventListener( 'loop', function( e ) {//console.log(e); // properties of e: type, action and loopDelta
			//	e.action.paused=true; //stop looping action; this is an alternative to set LoopOnce
			//} ); //looping anims dont fire finished
			window.three.views[view].scene.add( mcopy );
		}
		
    }
	window.three.enterPage=function(){ //call this when leaving/entering a passage to flush out scenes to render 
		window.three.activeViews={};
	}
    window.three.setupScene=function(id,canvasid){ //Warning ! you may only setup 8 or so renderers in a browser ! A workaround: https://threejs.org/manual/#en/multiple-scenes
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
			scene.add( cube );cube.position.set(-0.2,0,0);

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
			window.three.views[id]={scene:scene,
				camera:camera,
				renderer:renderer, 
				mixers:{}, //contains for each object in the scene their mixer 
				actions:{},//contains for each object in the scene a collection of actions  actions[modelid].[actionname]
				morphs:{}}; //contains for each object in the scene a collection of morphs  morphs[modelid].[morphname].influence
			window.three.activeViews[id]=window.three.views[id];
		}
		canvas.appendChild( window.three.views[id].renderer.domElement );
        animate();
    }
	//this uses animation to get into a pose; the duration is set to 0; make sure action is set to LoopOnce and clampWhenFinished
	window.three.setAnimation=function(sceneid,modelid,poseid){
		let action,mixer=window.three.views[sceneid].mixers[modelid];
		let actions = Object.keys(window.three.views[sceneid].actions[modelid]);
		//mixer.stopAllAction(); //if already running an action;  this will reset morphs! 
		for(var x of actions){ //need to stop other actions first
			action=window.three.views[sceneid].actions[modelid][x];
			if(action.isRunning) action.fadeOut(0);
		}
		action = window.three.views[sceneid].actions[modelid][poseid];
		
		action.reset()
		.setEffectiveTimeScale( 1 )
		.setEffectiveWeight( 1 )
		.setDuration(0) //if you set this to 1, full animation will play !
		//.fadeIn( 1 )
		.play();
	}
	//this modifiys a shapekey
	window.three.setMorph=function(sceneid,modelid,morphid,influence){
		const names = window.three.views[sceneid].morphs[modelid].keys;
		const i=names.indexOf(morphid);
		if(i<0) return;
		window.three.views[sceneid].morphs[modelid].values[i]=influence;
	}
	window.three.toogleCam=function (sceneid){
		let camera =window.three.views[sceneid].camera;
		if(camera.position.z===1) {
			camera.position.z=0.5
		}else {
			camera.position.z=1;
		}
		//camera.lookAt(new THREE.Vector3(0,1,0));
	}
	function animate() { //called to start the renderer
        const dt = window.three.clock.getDelta();
        //cube.rotation.x += 0.01;cube.rotation.y += 0.01;
		const views=Object.keys(window.three.activeViews);
		let view,mixer;
		for(var x of views) { //there could be multiple pictures in a passage... 
			view=window.three.activeViews[x];
			view.renderer.render( view.scene, view.camera );
			const mixers=Object.keys(view.mixers);
			for(var y of mixers) {
				mixer=window.three.activeViews[x].mixers[y];
				if(mixer) mixer.update( dt );
			}
		}
        requestAnimationFrame( animate ); //this will cause animate to be called cyclical - we wouldnt need that except for animation
		//todo only call animate or if there is a change in the scene
    };
})(window);
//export {show };