define([
    'jquery',
    'underscore',
    'marionette', 
    'app',
    'vent',
    "search/PlaceAutocomplete",
    "text!search/tpl-initial-page.html",
], function($, _, Marionette, App, vent, RenderPlaceAutocomplete, initialPageTpl){
   "use strict";
   
   var InitialPageView = Marionette.ItemView.extend({
      template: initialPageTpl,
      initialize: function(){
         this.input = {
            'start': null,
            'destination'  : null,
            'date' : ""
         }
      },
      ui: {
        inputBox: '.form-group',
      },
      events:{
         'click #searchButton': 'onSearchClick'
      },
      onRender: function(){
         $('body').addClass('on-home-page');
         
         //listen to resize
         $(window).on('resize.homepage', _.throttle(this.resizeHeader,500));
         
         
      },
      renderGooglePlaceDropDown : function(inputId){
         var self = this;
         RenderPlaceAutocomplete(inputId, function(place){
            var id = inputId.replace("-search","");
            self.input[id] = {
               'name' : place.name,
               'lat'  : place.geometry.location.lat(),
               'lng'  : place.geometry.location.lng()
            }
         });
      },
      onShow:function(){
         this.resizeHeader();
         this.renderGooglePlaceDropDown('start-search');
         this.renderGooglePlaceDropDown('destination-search');
         
         // HACK TESTING
         vent.trigger("open:map", {
            destination: {lat: 35.7090259, lng: 139.73199249999993,name: "Tokyo"},
            start: {lat: 25.0329694, lng: 121.56541770000001, name: "Taipei"}
         });

      },
      resizeHeader: function(){
         var newHeight = $(window).height()-51;
         if(newHeight > 600) {
            $('header').css('height', $(window).height()-51 + 'px'); 
         } else {
            $('header').css('height', '600px'); 
         }
      },
      
      onSearchClick: function(){
         // form validation
         if(!this.input['start'] || !this.input['destination']) {
            return;
         }
         vent.trigger("open:map", this.input);
      },
      
      onBeforeDestroy:function(){
         $(window).off('scroll.homepage resize.homepage');
         $('body').removeClass('on-home-page');
      }
      
   });
   
   return InitialPageView;
});