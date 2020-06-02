
import Box from './Box.js';
import Player from './Player.js';

import * as THREE from 'https://threejs.org/build/three.module.js';

function Game() {


	this.boundingBoxes = [
		
		new Box( 0, 0, 0, 10, 1, 9 ),
		new Box( 5, 1, 0, 5, 0.5, 4 ),
		new Box( 4, 2, - 4, 2, 1, 4 ),
		new Box( 3, 3, - 4, 2, 1, 2 ),

		new Box( -5.5, 3.5, 0, 1, 8, 9 ),
		new Box( - 0.4, 2.5, - 5, 10, 6, 1 )

	];

	this.spawnPoint = new THREE.Vector4( 0, 4, 0, Math.PI / 2 ); 
	this.player = new Player( this.spawnPoint.x, this.spawnPoint.y, this.spawnPoint.z, 0.8, 1.5, 0.8 );
	this.player.yaw = this.spawnPoint.w;

	this.config = {
 	
 		fixedUpdateInterval: 1 / 60, // might be useful when this is put on a server
		moveSpeed: 20,
		gravity: 12,
		jumpStrength: 8,
		friction: 0.90, 		// between 0 and 1
		frictionTime: 0.2,	// time to scale the velocity by 'friction'
		inAirSpeed: 0.4,
		sensitivity: 1

	};

	this.internalUpdateClock = 0;

	this.renderer = new THREE.WebGLRenderer( {

		canvas: document.getElementById( 'game-canvas' ),
		alpha: true,
		antialias: true

	} );

	this.renderer.setSize( window.innerWidth, window.innerHeight );

	this.scene = new THREE.Scene();
	this.camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );

	this.boxGeometry = new THREE.BoxGeometry( 1, 1, 1 );

	for ( var i = 0; i < this.boundingBoxes.length; i ++ ) {

		var box = this.boundingBoxes[ i ];
		var mesh = new THREE.Mesh( this.boxGeometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff + 0xaaaaaa } ) );
		mesh.position.set( box.x, box.y, box.z );
		mesh.scale.set( box.sizeX, box.sizeY, box.sizeZ );

		this.scene.add( mesh );

	}

	this.playerMaterial = new THREE.MeshLambertMaterial( { color: 'orange' } );

	this.playerMesh = new THREE.Mesh( this.boxGeometry, this.playerMaterial );
	this.playerMesh.position.set( this.player.x, this.player.y, this.player.z );
	this.playerMesh.scale.set( this.player.sizeX, this.player.sizeY, this.player.sizeZ );
	this.scene.add( this.playerMesh );

	
	this.camera.rotation.order = 'YXZ';

	this.scene.add( new THREE.AmbientLight( '#fff', 0.6 ) )
	this.camera.add( new THREE.PointLight( '#fff', 0.4 ) );
	this.scene.add( this.camera );

	this.clock = new THREE.Clock();

	this.addEventListeners();

}

Object.assign( Game.prototype, {

	addEventListeners: function () {

		var scope = this;

		window.addEventListener( 'keydown', function ( event ) {

			switch ( event.key.toLowerCase() ) {

				case 'w':
					scope.player.commands.forward = true;
					break;

				case 's':
					scope.player.commands.backward = true;
					break;

				case 'a':
					scope.player.commands.left = true;
					break;

				case 'd':
					scope.player.commands.right = true;
					break;

				case ' ':
					scope.player.commands.jump = true;
					break;

			}

		} );

		window.addEventListener( 'keyup', function ( event ) {

			switch ( event.key.toLowerCase() ) {

				case 'w':
					scope.player.commands.forward = false;
					break;

				case 's':
					scope.player.commands.backward = false;
					break;

				case 'a':
					scope.player.commands.left = false;
					break;

				case 'd':
					scope.player.commands.right = false;
					break;

				case ' ':
					scope.player.commands.jump = false;
					break;

			}

		} );

		var el = document.getElementById( 'overlay' );

		el.addEventListener( 'click', function () {

			scope.renderer.domElement.requestPointerLock();

		} );

		var active = false;

		document.onpointerlockchange = function () {

			if ( document.pointerLockElement == scope.renderer.domElement ) {

				active = true;
				el.style.display = 'none';

			} else {

				active = false;
				el.style.display = '';

			}

		}

		this.renderer.domElement.addEventListener( 'mousemove', function ( event ) {
			
			if ( active ) {
			
				scope.player.yaw -= event.movementX * 0.001 * scope.config.sensitivity;
				scope.player.pitch -= event.movementY * 0.001 * scope.config.sensitivity;

			}

		} );

		window.addEventListener( 'resize', function () {

			scope.resize();

		} );

	},

	resize: function () {

		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();

		this.render();

	},

	render: function () {

		this.renderer.render( this.scene, this.camera );

	},

	update: function ( deltaTime ) {

		this.player.update( 
			deltaTime, 
			this.boundingBoxes, 
			this.config.moveSpeed, 
			this.config.gravity, 
			this.config.jumpStrength,
			this.config.friction,
			this.config.frictionTime,
			this.config.inAirSpeed
		);

		if ( this.player.y < - 10 ) {

			this.player.x = this.spawnPoint.x;
			this.player.y = this.spawnPoint.y;
			this.player.z = this.spawnPoint.z;
			this.player.yaw = this.spawnPoint.w;
			this.player.velX = this.player.velY = this.player.velZ = 0;

		}


	},

	animate: function () {

		var deltaTime = this.clock.getDelta();
		this.internalUpdateClock += deltaTime;

		while ( this.internalUpdateClock > this.config.fixedUpdateInterval ) {

			this.update( this.config.fixedUpdateInterval );
			this.internalUpdateClock -= this.config.fixedUpdateInterval;

		}


		this.playerMesh.position.set( this.player.x, this.player.y, this.player.z );

		var target = this.playerMesh.position.clone();
		target.y += 5;
		target.z -= Math.cos( this.player.yaw ) * 5;
		target.x -= Math.sin( this.player.yaw ) * 5;

		this.camera.position.lerp( target, 0.1 );
		this.camera.rotation.set( this.player.pitch, this.player.yaw + Math.PI, 0 );

		this.render();

		if ( ! this.__bindedAnimate ) this.__bindedAnimate = this.animate.bind( this );

		window.requestAnimationFrame( this.__bindedAnimate );

	}

} );

export default Game;

// krunker map export for later use

var test_map_data = {
    "name": "New Krunker Map",
    "ambient": "#97a0a8",
    "light": "#f2f8fc",
    "sky": "#dce8ed",
    "fog": "#8d9aa0",
    "fogD": 2000,
    "objects": [{
        "p": [26, 0, 0],
        "s": [10, 10, 10]
    }, {
        "p": [0, -10, 0],
        "s": [100, 10, 100]
    }],
    "spawns": [
        [0, 0, 0, 0, 0, 0]
    ]
}
