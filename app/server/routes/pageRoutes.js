var config    = require('../config/config.js')[process.env.NODE_ENV];
var _         = require("underscore");
var async     = require('async');
var express   = require("express");
var extend    = require("node.extend");
var Glob      = require("glob").Glob
var uuid      = require('node-uuid');

//var fs        = require("fs");
//var markdown  = require("markdown").markdown;
//var path      = require("path");
//var unirest   = require('unirest');
//var url       = require("url");
//var validator = require("email-validator");


module.exports = function(app){
    var renderParams = function(request) {
        request.cookies["uuid"] = request.cookies["uuid"] || uuid.v4();

        var render = {};
        // render.user = request.isAuthenticated() ? request.user : null; // requires passport

        render.text         = require("../../public/views/text/english.js");
        render.lang         = "en";
        render.apilang      = "eng";
        render.language     = "english";
        render.direction    = "ltr";
        render.url          = request.url;
        render.NODE_ENV     = process.env.NODE_ENV;
        render.production   = !!(render.NODE_ENV === "production");

        //render.menu_section_name = request.url.replace(/^\//,'').replace(/\/.*$/,'')
        //render.menu_section = {
        //    whatwedo:  menu_section_name === "whatwedo",
        //    portfolio: menu_section_name === "portfolio",
        //    connect:   menu_section_name === "connect"
        //}

        render.layout     = "template";
        render.urls       = require("../../public/views/text/urls.js")(request, render);
        render.config     = extend({}, config, { sslcert: null, rootCA: null, basicAuth: null, cookieSecret: null, sessionSecret: null });

        return render;
    };

    var redirectWithoutParams = function(request, response, withouts) {
        withouts = _.flatten([withouts]);
        var parsed = url.parse(request.url, true);
        var query = [];
        for( var key in parsed.query ) {
            if( parsed.query[key] && withouts.indexOf(key) === -1 ) {
                query.push( key + "=" + parsed.query[key] );
            }
        }
        var querystring = query.length && "?" + query.join("&") || "";
        response.redirect( parsed.pathname + querystring );
    };

    app.get("/", function(request, response) {
        response.redirect("/whatwedo");
    });
    app.get("/contact", function(request, response) {
        response.redirect("/connect");
    });
    console.log('app.get("/") -> response.redirect("/whatwedo")');


    var pattern = __dirname + "/../../public/views/pages/*.mmm";
    var globber = new Glob(pattern, {mark: true, sync:true});
    _(globber.found)
        .map(function(filepath) {
            return filepath.replace(/^.*\/([^/]*)\.mmm$/, '$1')
        })
        .filter(function(pagename) { return !!pagename; })
        .forEach(function(pagename) {
            console.log('app.get("/'+pagename+'")');
            app.get("/"+pagename, function(request, response) {
                var render = renderParams(request);
                render.wrapperClassName = "page_"+pagename;

                response.render("pages/"+pagename, render);
            });
        });


    //app.get("/whatwedo", function(request, response) {
    //    var render = renderParams(request);
    //    response.render("pages/whatwedo", render);
    //});
    //app.get("/portfolio", function(request, response) {
    //    var render = renderParams(request);
    //    response.render("pages/portfolio", render);
    //});
    //app.get("/connect", function(request, response) {
    //    var render = renderParams(request);
    //    response.render("pages/connect", render);
    //});
    app.get("/portfolio/:pageID", function(request, response) {
        var render = renderParams(request);
        render.wrapperClassName = "page_portfolio_item";

        response.render("portfolio/"+request.params.pageID, render);
    });
    console.log('app.get("/portfolio/:pageID")');

};