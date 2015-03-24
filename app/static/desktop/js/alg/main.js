function setupCSRF(){
   var csrftoken = $('meta[name=csrf-token]').attr('content');
   $.ajaxSetup({
       beforeSend: function(xhr, settings) {
           if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type)) {
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
         }
       }
   });
}

var cityFormHtml = '\
<form class="form-inline">\
   <div class="form-group">\
      <label class="sr-only" >city</label>\
      <input class="input-city form-control" placeholder="Enter City">\
   </div>\
   <div class="form-group">\
      <label class="sr-only" >days</label>\
      <input class="input-days form-control" placeholder="How many days">\
   </div>      \
   <a class="close-btn" href="#"><span class="glyphicon glyphicon-remove"></span></a> \
</form>\
';

function onAddCityClick(){
   var newCity = $(cityFormHtml);
   $("#cities-wrap").append(newCity);
   setupTypeahead(newCity.find('.input-city'));
   // attach closing event
   newCity.find('.close-btn ').click(function(){
      newCity.remove();
   });
}

function onOptimizeClick(){
   var isInvalid = false;
   // testing
   /*var data = JSON.parse(localStorage.getItem('test'));
   displayResult(data);
   return;*/
   return;
   var data = {
      'start': $(".input-start-city").val(),
      'date' : $(".input-start-date").val(),
      "cities": []
   }

   // step 1: extract out all the input values
   if(data['start'] == "" || data['date'] == ""){
      isInvalid = true;
   }

   $("#cities-wrap >form").each(function () {
      if(isInvalid){
         return;
      }

      var city = {
         'name': $(this).find('.input-city').val(),
         'days': parseInt($(this).find('.input-days').val())
      }

      // input validation
      if (city['name'] == "" || city['days'] == ""){
         isInvalid = true;
         return;
      }

      data['cities'].push(city);
   });

   if(isInvalid){
      alert("Fill out all the input");
      return;
   }
   // step 2: pint the server


   // SHOW LOADING
   $("#loading-sign").show();
   $("#result-list").empty();


   $.ajax(
      "/api/optimize_routes",
      {
      type: 'POST',
      data: JSON.stringify(data),
      contentType : "application/json",
   }).done(function(result) {
      $("#loading-sign").hide();

      displayResult(result);
   });
}

function onAutofillClick(testData) {
   var forms = $("#cities-wrap >form");
   // if too many forms
   var addNum = testData['cities'].length - forms.length;
   if(addNum > 0) {
      // if too less
      while(addNum > 0){
         onAddCityClick();
         addNum-=1;
      }
   } else if (addNum < 0){
      while(addNum < 0){
         forms.get(0).remove()
         addNum+=1;
      }
   }


   $(".input-start-city").val(testData['start']);
   $(".input-start-date").val(testData['date']);
   $("#cities-wrap >form").each(function (key, val) {
      $(this).find('.input-city').val(testData['cities'][key]['name']);
      $(this).find('.input-days').val(testData['cities'][key]['days']);
   });
}


var airports = new Bloodhound({
   datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
   queryTokenizer: Bloodhound.tokenizers.whitespace,
   limit: 10,
   prefetch: {
      url: '/static/desktop/js/alg/airport_code.json',
      ttl: 10, //10 mins
      filter: function(list) {
         return $.map(list, function(airport) {
            return {
               code: airport.code,
               country: airport.country,
               city: airport.city,
               value: airport.city + " " + airport.country + " " + airport.code
            }
         });
      }
   }
});
airports.initialize();

function setupTypeahead(input){
   input.typeahead(null,
   {
      name: 'airports',
      displayKey: 'code',
      source: airports.ttAdapter(),
      templates: {
         empty: '<div>unable to find any airport that match your query</div>',
         suggestion: Handlebars.compile('<p>{{city}}, {{country}} ({{code}})</p>')
      }
   });
}
$( document ).ready(function() {

   // initialize
   setupCSRF();
   $("#loading-sign").hide();
   $("#result-wrap").hide();
   var newCity = $(cityFormHtml);

   // add first city input
   $("#cities-wrap").append(newCity);
   newCity.find(".close-btn").remove();
   setupTypeahead(newCity.find('.input-city'));

   // action attach
   $("#autofill-europe-btn").click(function(){
      onAutofillClick({
         'start': 'LAX',
         'date' : '2015-04-22',
         "cities": [
            {'name': 'LON', 'days': 6},
            {'name': 'BER', 'days': 6},
            {'name': 'ROM', 'days': 6},
            {'name': 'BCN', 'days': 6},
         ]
      });
   });

   $("#autofill-asia-btn").click(function(){
      onAutofillClick({
         'start': 'LAX',
         'date' : '2015-06-20',
         "cities": [
            {'name': 'TPE', 'days': 20},
            {'name': 'NRT', 'days': 7},
            {'name': 'GMP', 'days': 5},
            {'name': 'HKG', 'days': 5},
         ]
      });
   });

   $("#add-city-btn").click(onAddCityClick);

   $("#optimize-btn" ).click(onOptimizeClick);
});

function displayResult(data) {
   localStorage.setItem('test', JSON.stringify(data));
   console.log("DISPLAY RESULTS");
   console.log(data);
   $("#result-title span").text(data['data'].length);
   $("#result-wrap").show();

   // filter
   data['data'] = _.filter(data['data'], function(val){
      return !_.isUndefined(val['trips'])
   });

   // sort by price
   data['data'].sort(function(a, b) {
      return parseFloat(a['trips']['tripOption'][0]['saleTotal'].replace("USD",""))
         - parseFloat(b['trips']['tripOption'][0]['saleTotal'].replace("USD",""));
   });


   // print result
   $.each(data['data'], function (index, val){
      localStorage.setItem('test', JSON.stringify(data));
      var item = $("<li class='list-group-item'></li>");
      item.append("<p class='list-price'>Sale Price: <span></span></p>\
                  <p class='list-route'>Route: <span></span></p> \
                  <ul class='list-slice'></ul>");

      // list price
      item.find('.list-price span').append(val['trips']['tripOption'][0]['saleTotal']);

      // list cities
      var cities = _.map(val['cities'], function(cityObj){
         return cityObj['name'] + ' (' + cityObj['days'] + ')';
      });
      cities.unshift(val['start'])
      cities.push(val['start'])
      item.find('.list-route span').append(cities.join(' - '));

      // list flight info
      $.each(val['trips']['tripOption'][0]['slice'], function(i, slice){
         $.each(slice['segment'], function(i, flight){
            item.find('.list-slice').append('<li>'+
                     flight['flight']['carrier'] + ' ' + flight['flight']['number'] + ' ' +
                     flight['leg'][0]['origin'] + ' ' + flight['leg'][0]['departureTime'] + ' '+
                     flight['leg'][0]['destination'] + ' ' + flight['leg'][0]['arrivalTime'] +
                     '</li>');
         });
      });

      $("#result-list").append(item);
   });
}
