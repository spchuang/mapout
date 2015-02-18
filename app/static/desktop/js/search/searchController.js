define([
   'jquery',
   'underscore',
   'backbone',
   'marionette',
   'app',
   'vent',
   'reqres',
   'search/InitialPageView',
   'search/MapPageView'
],
function ($, _, Backbone, Marionette, App, vent, reqres, InitialPageView, MapPageView) {
   "use strict";
   
   var SearchController = Marionette.Controller.extend({
      showInitialPage: function() {
         vent.trigger('mainRegion:show', new InitialPageView());
      },
      
      showMapPage: function(options) {
         vent.trigger('mainRegion:show', new MapPageView(options));
      }
   
   });
   
   var sc = new SearchController();
   
   sc.listenTo(vent, 'open:map', function(options){
      sc.showMapPage(options);
   });
   
   
   
   return sc;
});