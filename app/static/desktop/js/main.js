
//load common settings first. We also need to guarantee sessionModel is loaded first
define([
	'initialize/settings',
], function () {
   require([
      'jquery',
      'vent',
      'reqres',
      'initialize/app',
      'initialize/routes',  
   ], function ($, vent, reqres, App, AppRouter ) {
   	'use strict';
   	
      App.addInitializer(function() {
         vent.trigger("app:start");      
      });
      
      vent.on("app:start", function(options){
         // Start routing once we have captured a user's auth status
         
         App.Router = {};
         
         _.each(AppRouter, function(router, name) {
            App.Router[name] = new router();
            
         });
         
         if(Backbone.history){
            if(!Backbone.history.start({ pushState: true })){
               vent.trigger('navigate:404Page');
            }
         }
      });
      
      // All navigation that is relative should be passed through the navigate
       // method, to be processed by the router. If the link has a `data-bypass`
       // attribute, bypass the delegation completely.
      $('html').on("click", function(evt) {
         var middleBtnnKey = 2;
         //check if its middle key click
         if( (evt.which == middleBtnnKey) ) return;
         
         //check if its command + click
         if(evt.ctrlKey || evt.metaKey) {
            return;
         }
       
         var navigateTo = $(evt.target).attr('data-navigate');
         if( navigateTo !== undefined){
            vent.trigger("navigate:"+navigateTo);
         }
       
         if(evt.target.tagName !== 'INPUT' && $(evt.target).closest('a').attr('data-bypass') === undefined){
            evt.preventDefault(); 
         }
         
       });
       
      
   	App.start();
   	
   });

});
