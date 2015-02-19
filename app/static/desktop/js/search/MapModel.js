define([
    'jquery',
    'underscore',
    'marionette', 
    'app',
    'vent',
], function($, _, Marionette, App, vent){
   "use strict";

   var getLatLng = function(point) {
      return new google.maps.LatLng(point.lat, point.lng);
   }
   
   var CityModel = Backbone.Model.extend({
      initialize: function(options){
         this.set({point: getLatLng(options)});
      },
   });
   var CityCollection = Backbone.Collection.extend({
      model: CityModel
   });
   
   var MapModel = Backbone.Model.extend({
      defaults: function(){
         return {
            map      : null,
            start    : null,
            cities   : new CityCollection
         }
      },
      initialize: function(initialData) {
         // hold a copy of initial data
         this.initialData = initialData;
      },
      loadInitialValue: function(){
         // initialize with start and end
         this.set({start : new CityModel(this.initialData.start)});
         this.addCity(this.initialData.destination);
      },
      setMap: function(map){
         this.set({map : map});
      },
      addCity: function(cityJSON){
         this.get('cities').add(cityJSON);
      }

   });
   return MapModel;
});