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
    "search/PlaceAutocomplete",
    "text!search/tpl-map-cities-list.html",
], function($, _, Marionette, App, vent, RenderPlaceAutocomplete, citiesListTpl){
   "use strict";
   
   var CityListItemView = Backbone.Marionette.ItemView.extend({
      template: '<li><a href="#">{{name}}</a><button class="close">×</button></li>',
      events: {
         'click .close': 'onRemoveCity',
      },
      onRemoveCity: function(){
         this.model.destroy();
      }
   });

   var CityListView = Backbone.Marionette.CollectionView.extend({
      childView: CityListItemView,
      tagName: 'ul',
   });
   
   
   var SideBarView = Marionette.LayoutView.extend({
      template: citiesListTpl,
      events: {
         'click #add-city-btn': 'onAddCity'
      },
      regions: {
         list: '#cities-list'
      },
      initialize: function(options){
         // pass in initial start and end
         console.log(this.model);
         this.input = null;
         this.inputAutocomplete = null;
      },
      renderGooglePlaceDropDown : function(inputId){
         var self = this;
         this.inputAutocomplete = RenderPlaceAutocomplete(inputId, function(place){
            self.input = {
               'name' : place.name,
               'lat'  : place.geometry.location.lat(),
               'lng'  : place.geometry.location.lng()
            }
         });
      },
      onShow:function(){
         this.renderGooglePlaceDropDown('city-search');
         this.getRegion('list').show(new CityListView({collection: this.model.get('cities')}));
      },
      onAddCity: function(){
         if(!this.input){
            return;
         }
         this.model.addCity(this.input);
         
         // clear input
         this.input = null;
         this.$("#city-search").val('');
         this.inputAutocomplete.set('place',void(0));
      },
   });
   return SideBarView;
});