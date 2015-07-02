var ghost     = require('ghost');
var path      = require('path');
var express   = require('express');
var parentApp = express();

parentApp.use('/img',    express.static(__dirname + '/../app/public/img/'));
parentApp.use('/scss',   express.static(__dirname + '/../app/public/scss/'));
parentApp.use('/bower',  express.static(__dirname + '/../bower/'));
parentApp.use('/vendor', express.static(__dirname + '/../vendor/'));

ghost({
    config: path.join(__dirname, 'ghost-config-standalone.js')
}).then(function (ghostServer) {
    parentApp.use(ghostServer.config.paths.subdir, ghostServer.rootApp);
    ghostServer.start(parentApp);
});