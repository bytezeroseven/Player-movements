
import Box from './Box.js';

function Player() {

	Box.apply( this, arguments );

	this.velX = 0;
	this.velY = 0;
	this.velZ = 0;
	this.yaw = 0;
	this.pitch = 0;

	this.commands = {
		forward: false,
		backward: false,
		left: false,
		right: false
	};

}

Object.assign( Player.prototype, Box.prototype, {

	update: function ( deltaTime, boundingBoxes, moveSpeed, gravity, jumpStrength, friction, frictionTime, inAirSpeed ) {

		var vx = Math.sin( this.yaw ) * moveSpeed * deltaTime;
		var vz = Math.cos( this.yaw ) * moveSpeed * deltaTime;

		if ( ! this.isOnGround ) {

			console.log( 'not on ground' ) 

			vx *= inAirSpeed;
			vz *= inAirSpeed;

		}

		if ( this.commands.forward ) {

			this.velX += vx;
			this.velZ += vz;

		} else if ( this.commands.backward ) {

			this.velX -= vx;
			this.velZ -= vz;

		}

		if ( this.commands.left ) {

			this.velX -= - vz;
			this.velZ -= vx;

		} else if ( this.commands.right ) {

			this.velX += - vz;
			this.velZ += vx;

		}

		// the collision test is handled later, 
		// so the player will always jump on the next frame

		if ( this.isOnGround && this.commands.jump ) {
			
			this.velY = jumpStrength;

		}

		// GP saves the day

		var f = Math.pow( 1.0 - ! this.isOnGround ? friction * inAirSpeed : friction, deltaTime / frictionTime );
		this.velX *= f;
		this.velZ *= f;

		this.velY -= gravity * deltaTime;

		this.x += this.velX * deltaTime;
		this.y += this.velY * deltaTime;
		this.z += this.velZ * deltaTime;

		this.isOnGround = false;

		for ( var i = 0; i < boundingBoxes.length; i ++ ) {

			var box = boundingBoxes[ i ];

			var intersection = this.intersectsBox( box );

			if ( intersection ) {

				switch ( intersection.axis ) {

					case 'x': 

						this.x += Math.sign( this.x - box.x ) * intersection.minOverlap;
						this.velX *= 0.1;
						break;

					case 'y': 
					
						var dir = Math.sign( this.y - box.y );
						this.y += dir * intersection.minOverlap;
			
						if ( dir === 1 && this.velY <= 0 ) {

							this.isOnGround = true;
							
						}

						this.velY = 0;

						break;

					case 'z': 
					
						this.z += Math.sign( this.z - box.z ) * intersection.minOverlap;
						this.velZ *= 0.1;
						break;

				}

			}

		}

	}


} );

export default Player;
