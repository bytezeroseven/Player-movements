

var http = require( 'http' );
var path = require( 'path' );

var fs = require( 'fs' );

var contentTypes = {

	'.html': 'text/html',
	'.css': 'text/css',
	'.js': 'text/javascript'

};

var server = http.createServer( function ( request, response ) {

	var filename = path.join( __dirname, request.url );

	var extname = path.extname( filename );

	if ( extname == '' ) {

		filename = path.join( filename, 'index.html' );
		extname = '.html';

	}

	fs.exists( filename, function ( exists ) {

		if ( ! exists ) {

			response.end( 'Cannot GET ' + request.url );
			return;

		}

		response.writeHead( 200, { 'Content-Type': contentTypes[ extname ] || 'text/plain' } );

		fs.createReadStream( filename ).pipe( response );

	} );

} );

var port = process.env.PORT || 3000;

server.listen( port, function () {

	console.log( 'Server listening on port ' + port + '...' );

} );

