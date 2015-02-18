define([
    'jquery',
    'underscore',
    'marionette', 
    'app',
    'vent',
    "text!search/tpl-map-page.html",
], function($, _, Marionette, App, vent, mapPageTpl){
   "use strict";
   
   var locationMarkerView = Marionette.ItemView.extend({
      initialize: function(options){
         var self = this;
         self.map = options.map;
         
         self.marker = new google.maps.Marker({
            map: self.map,
            position: new google.maps.LatLng(options.marker.lat, options.marker.lng),
            animation: google.maps.Animation.DROP,
            //icon : 'img/buildings_32x32.png',
            title: options.marker.name,
         });
         
         self.marker.infowindow = new google.maps.InfoWindow({
            content: options.marker.name
         });
         
         google.maps.event.addListener(self.marker, 'click', self.showDetail);
      },
      showDetail: function(){
         this.infowindow.open(this.map, this);
      }
   });
   
   
   var MapPageView = Marionette.ItemView.extend({
      template: mapPageTpl,
      _initializeMap: function(){
      
         // set destinatino as center
         var center = new google.maps.LatLng(this.options['destination-search'].lat, this.options['destination-search'].lng);
         
         console.log(center);
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
         this.map = new google.maps.Map(document.getElementById('map-canvas'),
           mapOptions);
         
      },
      initialize: function(options){
         this.options = options;
         $('body').addClass('on-map-page');
      },
      onShow: function(){
         var self = this;
         this._initializeMap();
         
         // add initial markers
         var startView = new locationMarkerView({map: this.map, marker: this.options['start-search']});
         var endView = new locationMarkerView({map: this.map, marker: this.options['destination-search']});
         
         // draw line
         var line = new google.maps.Polygon({
            paths: [startView.marker.position, endView.marker.position],
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2
         });
         
         line.setMap(this.map);

         /*
         var listener = google.maps.event.addListener(this.map, "idle", function () {
            self.map.setZoom(3);
            google.maps.event.removeListener(listener);
         });*/
      },
      onBeforeDestroy:function(){
         $('body').removeClass('on-map-page');
      }   
   });
   
   return MapPageView;
   
});