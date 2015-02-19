define([
    'jquery',
    'underscore',
    'marionette', 
    'app',
    'vent',
    "search/CityListView",
    "text!search/tpl-map-page.html",
], function($, _, Marionette, App, vent, CityListView, mapPageTpl){
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
         this.get('cities').add(this.initialData.destination);
      },
      setMap: function(map){
         this.set({map : map});
      }

   });
   

   var LocationMarkerView = Marionette.ItemView.extend({
      initialize: function(options){
         var self = this;
         self.map = options.map;
         
         self.marker = new google.maps.Marker({
            map: self.map,
            position: options.city.get('point'),
            animation: google.maps.Animation.DROP,
            //icon : 'img/buildings_32x32.png',
            title: options.city.get('name'),
         });
         
         self.marker.infowindow = new google.maps.InfoWindow({
            content: options.city.get('name')
         });
         
         google.maps.event.addListener(self.marker, 'click', self.showDetail);
      },
      showDetail: function(){
         this.infowindow.open(this.map, this);
      }
   });
   
   
   var MapView = Marionette.ItemView.extend({
      template: "<div id='map-canvas'></div>",
      initialize: function(options){
         this.model = options.model
         this.listenTo(this.model,'change:start', this.updateStart);
         this.listenTo(this.model.get('cities'),'add', this.addCity);
         
      },
      onShow: function(){
         // set destination as center
         var center = getLatLng(this.model.initialData.destination);
         var styles = [
           {
             elementType: "geometry",
             stylers: [
               { lightness: 33 },
               { saturation: -90 }
             ]
           }
         ];
         var mapOptions = {
             zoom: 5,
             mapTypeId: google.maps.MapTypeId.ROADMAP,
             center: center,
             styles: styles
         };
         var map = new google.maps.Map(document.getElementById('map-canvas'),
           mapOptions);
         this.model.setMap(map);
      },
      removeCityMarkers: function(){
         
      },
      addCityMarkers: function(city){ 
         // TODO: remove the previous marker
         var markerView = new LocationMarkerView({map: this.model.get('map'), city: city});
         city.set({markerView: markerView});
      },
      updateStart: function(model){
         
         this.addCityMarkers(model.get('start'));
      },
      addCity: function(city){
         this.addCityMarkers(city);
      },
      drawLine: function(point1, point2){
         // TODO: provide ways to remove the lines later
         var line = new google.maps.Polyline({
            path: [point1, point2],
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2
         });
         
         line.setMap(this.model.get('map'));
      }
   });
   
   
   var MapPageView = Marionette.LayoutView.extend({
      template: mapPageTpl,
      regions: {
         sidebar: "#map-sidebar",
         map:     "#map-wrap"
      },
      initialize: function(initialData){
         // create an instance of the map model that contains the necessary information for the map
         this.model = new MapModel(initialData);
         this.mapView = null;
         $('body').addClass('on-map-page');
      },
      onRender: function(){
          this.getRegion('sidebar').show(new CityListView());
      },
      onShow: function(){
         this.mapView = new MapView({model: this.model});
         this.getRegion('map').show(this.mapView);
         this.model.loadInitialValue();
         this.mapView.drawLine(this.model.get('start').get('point'), this.model.get('cities').at(0).get('point'));
      },
      onBeforeDestroy:function(){
         $('body').removeClass('on-map-page');
      }   
   });
   
   return MapPageView;
   
});