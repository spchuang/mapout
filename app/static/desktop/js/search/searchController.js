define([
   'jquery',
   'underscore',
   'backbone',
   'marionette',
   'app',
   'vent',
   'reqres',
   'search/InitialPageView'
],
function ($, _, Backbone, Marionette, App, vent, reqres, InitialPageView) {
   "use strict";
   
   var SearchController = Marionette.Controller.extend({
      showInitialPage: function() {
         vent.trigger('mainRegion:show', new InitialPageView());
      }
   
   });
   
   var sc = new SearchController();
   
   return sc;
});