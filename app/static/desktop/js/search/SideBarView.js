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
    "bootstrap",
    "bootstrap-datepicker"
], function($, _, Marionette, App, vent, RenderPlaceAutocomplete, citiesListTpl){
   "use strict";
   
   var CityListItemView = Backbone.Marionette.ItemView.extend({
      template: '<li><a href="#">{{name}}</a><button class="close">×</button>\
                  <div class="days-input"><span class="glyphicon glyphicon-home"></span> <input type="text"></div>\
                  <div class="force-date-input"><span class="glyphicon glyphicon-fire"></span> <input type="text"></div></li>',
      events: {
         'click .close': 'onRemoveCity',
      },
      onRender: function(){
         this.$el.find(".days-input span").attr('title', 'How long are you planning to stay?').tooltip({
            placement: 'bottom'
         });
         this.$el.find(".force-date-input span").attr('title', 'FIRE: do you have to be here on a specfici date(s)?').tooltip({
            placement: 'bottom'
         });
         
         this.$el.find(".force-date-input input").datepicker({
            format: "DD M dd, yyyy",
            multidate: true
         });
      },
      onRemoveCity: function(){
         if(this.model.collection.length > 1){
            this.model.destroy();
         } else {
            alert("Needs to have at least one destination");
         }
         
      }
   });

   var CityListView = Backbone.Marionette.CollectionView.extend({
      childView: CityListItemView,
      tagName: 'ul',
   });
   
   var StartCityView = Marionette.ItemView.extend({
      template: '<a href="#">{{name}}</a><button class="close"><span class="glyphicon glyphicon-pencil"></span></button>'
   });
   
   var SideBarView = Marionette.LayoutView.extend({
      template: citiesListTpl,
      events: {
         'click #add-city-btn': 'onAddCity'
      },
      regions: {
         start: '#start-city',
         list: '#cities-list'
      },
      initialize: function(options){
         // pass in initial start and end
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
         
         this.getRegion('start').show(new StartCityView({model: this.model.get('start')}));
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