

function Box( x, y, z, sizeX, sizeY, sizeZ ) {

	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;

	this.sizeX = sizeX || 0;
	this.sizeY = sizeY || 0;
	this.sizeZ = sizeZ || 0;

	this.halfSizeX = sizeX !== undefined ? sizeX / 2 : 0;
	this.halfSizeY = sizeY !== undefined ? sizeY / 2 : 0;
	this.halfSizeZ = sizeZ !== undefined ? sizeZ / 2 : 0;

}

Object.assign( Box.prototype, {

	intersectsBox: function ( box ) {

		var overlapX = Math.min( this.x + this.halfSizeX, box.x + box.halfSizeX ) - Math.max( this.x - this.halfSizeX, box.x - box.halfSizeX );

		if ( overlapX < 0 ) return false;

		var overlapY = Math.min( this.y + this.halfSizeY, box.y + box.halfSizeY ) - Math.max( this.y - this.halfSizeY, box.y - box.halfSizeY );

		if ( overlapY < 0 ) return false;

		var overlapZ = Math.min( this.z + this.halfSizeZ, box.z + box.halfSizeZ ) - Math.max( this.z - this.halfSizeZ, box.z - box.halfSizeZ );

		if ( overlapZ < 0 ) return false;

		var minOverlap = Math.min( overlapX, overlapY, overlapZ );
		var axis;

		if ( minOverlap === overlapX ) {

			axis = 'x'

		} else if ( minOverlap === overlapY ) {

			axis = 'y';

		} else if ( minOverlap === overlapZ ) {

			axis = 'z';

		}

		return {

			minOverlap: minOverlap, 
			axis: axis

		};

	}

} );

export default Box;

