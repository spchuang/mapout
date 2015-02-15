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
         
         
      },
      ui: {
        inputBox: '.form-group',
      },
      events:{
         'focus @ui.inputBox': 'onInputFocus',
         'blur  @ui.inputBox': 'onInputBlur',
      },
      onRender: function(){
         $('body').addClass('on-home-page');
         
         //listen to resize
         $(window).on('resize.homepage', _.throttle(this.resizeHeader,500));
         
      },
      onShow:function(){
         this.resizeHeader();
      },
      resizeHeader: function(){
         $('header').css('height', $(window).height()-51 + 'px'); 
      },
      onInputFocus: function(){
         this.ui.searchWrap.addClass('focus');
      },
      onInputBlur: function(){
         this.ui.searchWrap.removeClass('focus');
      },
      onBeforeDestroy:function(){
         $(window).off('scroll.homepage resize.homepage');
      }
      
   });
   
   return InitialPageView;
});