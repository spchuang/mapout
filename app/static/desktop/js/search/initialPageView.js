define([
    'jquery',
    'underscore',
    'marionette', 
    'app',
    'vent',
    "text!search/tpl-initial-page.html",
], function($, _, Marionette, App, vent, initialPageTpl){
   "use strict";
   
   var InitialPageView = Marionette.ItemView.extend({
      template: initialPageTpl,
      initialize: function(){
         this.options = {
            'start-search': null,
            'destination-search'  : null,
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
         var input = document.getElementById(inputId);
         var self = this;
         // TODO: We want to replace this in the future to return only Airport
         var options = {
            types: ['(cities)']
         };
         var autocomplete = new google.maps.places.Autocomplete(input, options); 
         google.maps.event.addListener(autocomplete, 'place_changed', function () {
            var place = autocomplete.getPlace();
            
            self.options[inputId] = {
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
         if(!this.options['start-search'] || !this.options['destination-search']) {
            return;
         }
      
         vent.trigger("open:map", this.options);
      },
      
      onBeforeDestroy:function(){
         $(window).off('scroll.homepage resize.homepage');
         $('body').removeClass('on-home-page');
      }
      
   });
   
   return InitialPageView;
});