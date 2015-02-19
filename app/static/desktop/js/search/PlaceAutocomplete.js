define([
    'jquery',
    'underscore',
    'marionette', 
    'app',
    'vent',
], function($, _, Marionette, App, vent){
   "use strict";
   
   var RenderPlaceAutocomplete = function(inputId, callback){
      var input = document.getElementById(inputId);
      var self = this;
      // TODO: We want to replace this in the future to return only Airport
      var options = {
         types: ['(cities)']
      };
      var autocomplete = new google.maps.places.Autocomplete(input, options); 
      google.maps.event.addListener(autocomplete, 'place_changed', function () {
         var place = autocomplete.getPlace();
         callback(place);
     });
      
      
   }
   return RenderPlaceAutocomplete;
});