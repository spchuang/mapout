define([
  'marionette',
  'search/SearchController'
],
function (Marionette, SearchController) {
   "use strict";   

   var AppRouter = {
      SearchRouter: Marionette.AppRouter.extend({
         appRoutes: {
            "(/)": "showInitialPage"
         },
         controller: SearchController
      }),        
 
   };
   
   return AppRouter;
});
