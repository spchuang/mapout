// defines a bunch of random settings for the app. May factor them out in the future
define([
  'jquery',
  'underscore',
  'backbone',
  'marionette', 
  'handlebars',
],
function ($, _, Backbone, Marionette, Handlebars) {
   var csrftoken = $('meta[name=csrf-token]').attr('content');
   //include csrf token to Backone in global scope
   
   //setup for all ajax calls
   $.ajaxSetup({
       beforeSend: function(xhr, settings) {
           if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type)) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
         }
       }
   });
   Backbone.$ = window.$;
   
   //overwrite  backbone sync, to handle some universal errors
   var oldSync = Backbone.sync;
   Backbone.sync = function(method, model, options){
      //patch will be sent as put
      if(method == 'patch'){
         method = 'update';
      }
      if(method == 'read'){
         options.error = _.wrap(options.error, function(func, res, errorThrown){

            //handle not found requests
            if(res.status == 404){
               return vent.trigger('navigate:404Page');
            }
            
            //handle connection refused (not connected)
            if(res.status == 0){
               //don't call the error callback funciton
            
            }else{
               if(_.isFunction(func)) {
                  func(res);
               }
            }
         });
      }
      
      return oldSync(method, model, options);
   };
      
   Handlebars.registerHelper('if_eq', function(a, b, opts) {
      if(a == b){ // Or === depending on your needs
         return opts.fn(this);
      }else{
         return opts.inverse(this);
      }
   });
   
   Handlebars.registerHelper('toUpperCase', function(str) {
     return str.toUpperCase();
   });
   
   //set Handle bar as templating engine
   Backbone.Marionette.TemplateCache.prototype.compileTemplate = function(rawTemplate) {
      return Handlebars.compile(rawTemplate);
   };  
   
   //we don't need to retrieve the template from DOM (templateID itself is the template)
   Backbone.Marionette.TemplateCache.prototype.loadTemplate = function(templateId){
      return templateId;
   }
   
   //override backbone default parse funciton for model and collection
   Backbone.Model.prototype.parse = function (response, options) {
      if (options.collection) {
         return response;
      } else {
         return response.data;
      }
   };
   
   Backbone.Collection.prototype.parse = function(response){
      return response.data;
   }
   
});
