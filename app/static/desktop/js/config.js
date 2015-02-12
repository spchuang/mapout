"use strict";

requirejs.config({
    baseUrl: '/static/desktop/js/',
    paths: {
        "jquery"                 : 'vendors/jquery/jquery',
        "text"                   : 'vendors/requirejs-text/text',
        "handlebars"             : 'vendors/handlebars/handlebars',
        'bootstrap'              : 'vendors/bootstrap/bootstrap',
        "backbone"               : 'vendors/backbone/backbone',
        "underscore"             : 'vendors/underscore/underscore',
        "marionette"             : 'vendors/backbone.marionette/backbone.marionette',
   },
    shim: {
      'underscore': {
         exports: '_'
      },
      'backbone': {
         deps: ["underscore", "jquery"],
         exports: "Backbone",
         init: function() { 
            Backbone.$ = window.$;
         }
      },
      'handlebars': {
         exports: 'Handlebars'
      },
      'marionette' : {
         deps : ['jquery', 'underscore', 'backbone'],
         exports : 'Marionette'
      },
      "bootstrap": {
         deps: ["jquery"]
      },
    }
    ,
    urlArgs: "bust=" + (new Date()).getTime(), //remove cache
    
});



