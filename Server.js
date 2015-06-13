process.argv.forEach(function (value, index, array) {
    if( value.match(/^NODE_ENV=/)   ) { process.env.NODE_ENV   = value.replace(/^NODE_ENV=/,   ''); }
    if( value.match(/^PORT_HTTP=/)  ) { process.env.PORT_HTTP  = value.replace(/^PORT_HTTP=/,  ''); }
    if( value.match(/^PORT_HTTPS=/) ) { process.env.PORT_HTTPS = value.replace(/^PORT_HTTPS=/, ''); }
});
process.env.NODE_ENV = process.env.NODE_ENV || "development";

var config         = require('./app/server/config/config.js')[process.env.NODE_ENV];
var _              = require("underscore");
var express        = require('express');
var bodyParser     = require('body-parser');
var compression    = require('compression');
var errorHandler   = require('express-error-handler');
var connect        = require('connect');
var connectDomain  = require("connect-domain");
var cookieParser   = require('cookie-parser');
var favicon        = require('serve-favicon');
var flash          = require("connect-flash");
var fs             = require('fs');
var http           = require('http');
var https          = require('https');
var methodOverride = require('method-override');
var mmm            = require('mmm');
var morgan         = require('morgan');
var path           = require('path');
var session        = require('express-session');
var ghost          = require('ghost');

var MongoStore     = require('connect-mongo')(session);

var app = express();
var access_log_stream = fs.createWriteStream(config.access_log, {flags: 'a'});
var error_log_stream  = fs.createWriteStream(config.error_log,  {flags: 'a'});


// Logging
if( ["staging","production"].indexOf(process.env.NODE_ENV) != -1 ) {
    // TODO: http://learnboost.github.io/cluster/docs/logger.html
    app.use(morgan("short")); 				              	// log every request to the console
    app.use(morgan("short", {stream: access_log_stream })); 					// log every request to the console
    app.enable('view cache');
}
if( ["test","development","vagrant"].indexOf(process.env.NODE_ENV) != -1 ) {
    app.use(morgan("dev"));
    app.use(morgan("dev", {stream: access_log_stream }));
    app.use(errorHandler({showStack: true, dumpExceptions: true}));
}

app.use(function(request, response, next) {
    response.header('Vary', 'Accept-Encoding');            // Instruct proxies to store both compressed and uncompressed versions
    response.header('Access-Control-Allow-Origin', '*');   // Allow connections from other hosts
    //response.header('X-Frame-Options', 'SAMEORIGIN');      // Prevent Clickjacking
    next();
});


// App Configutation Settings
//app.use(favicon("app/public/favicon.ico"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());
app.use(methodOverride());
app.use(cookieParser(config.cookieSecret));
app.use(flash());


// HTML Rendering Settings
app.set('views', __dirname + '/app/public/views');
mmm.setEngine('hogan.js');
app.set('view engine', 'mmm');


// Page Routes and Includes
app.use(           express.static(__dirname + '/app/public'));
app.use('/bower',  express.static(__dirname + '/bower'));
app.use('/vendor', express.static(__dirname + '/vendor'));
app.use(connectDomain()); // allow express to output propper stack traces

require('./app/server/routes/ajaxRoutes.js')(app);
require('./app/server/routes/pageRoutes.js')(app);
//require('./app/server/routes/CrudAPIRoutes.js')(app);
//require('./app/server/routes/errorRoutes.js')(app);


// Error Handling
app.on("error", function(error) {
    console.error('app.on("error")', error);
    error_log_stream.write(error);
});
process.on('uncaughtException', function (err) {
    console.error( "UNCAUGHT EXCEPTION " );
    console.error( "[Inside 'uncaughtException' event] " + err.stack || err.message );

    error_log_stream.write("UNCAUGHT EXCEPTION");
    error_log_stream.write("[Inside 'uncaughtException' event] " + err.stack || err.message);
});


//// Allow Ghost to start our webapp for us - no https mode
//var servers = [];
//if( config.web.port.https ) { servers.push( https.createServer(config.sslcert, app).listen(config.web.port.https) ); }
//if( config.web.port.http  ) { servers.push( http.createServer(app).listen(config.web.port.http) );  }

//***** Ghost Config *****//
// @doc https://github.com/TryGhost/Ghost/wiki/Using-Ghost-as-an-npm-module
ghost({
    config: path.join(__dirname, 'ghost', 'ghost-config.js')
}).then( function(ghostServer) {
    app.use(ghostServer.config.paths.subdir, ghostServer.rootApp);
    ghostServer.start(app);

    console.info(config.name, ' - listening on ports ', JSON.stringify(config.web.port), config.web.host, " | NODE_ENV: ", process.env.NODE_ENV );
});

module.exports = app;