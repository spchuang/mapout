define([
    'jquery',
    'underscore',
    'marionette', 
    'app',
    'vent',
    "text!header/tpl-header.html",
], function($, _, Marionette, App, vent, headerTpl){
   "use strict";
   
   var HeaderView = Marionette.ItemView.extend({
      template: headerTpl,
       
   });
   
   return HeaderView;
});