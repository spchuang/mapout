/*
   Step 1.
   Show the list of cities (start and desired cities to visit)
   - Add new cities
   - delete cities
*/
define([
    'jquery',
    'underscore',
    'marionette', 
    'app',
    'vent',
    "text!search/tpl-map-cities-list.html",
], function($, _, Marionette, App, vent, citiesListTpl){
   "use strict";
   
   var CityListView = Marionette.ItemView.extend({
      template: citiesListTpl,
      initialize: function(options){
         // pass in initial start and end
         
         
      }
   
   });
   return CityListView;
});