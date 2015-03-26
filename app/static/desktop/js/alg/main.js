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

Handlebars.registerHelper('toTime', function(time) {

   var s = time.format("dddd, MMM D, h:mm a");
   return s;
});

Handlebars.registerHelper('getTimeDiff', function(endTime, startTime) {

   var durationAsMinutes = getDiffInMinutes(endTime, startTime)

   var hours = Math.floor(durationAsMinutes/60);
   var minutes = durationAsMinutes % 60;
   return hours + "h " + minutes + "m";
});

Handlebars.registerHelper('getValue', function(array, index) {
    return array[index];
});
Handlebars.registerHelper('getIncValue', function(array, index) {
    return array[index+1];
});

Handlebars.registerHelper('showMinutesDuration', function(durationAsMinutes) {

   var hours = Math.floor(durationAsMinutes/60);
   var minutes = durationAsMinutes % 60;
   return hours + "h " + minutes + "m";
});

function getDiffInMinutes(endTime, startTime){
   return moment.duration(endTime.diff(startTime)).asMinutes();
}


var cityFormHtml = '\
<form class="form-inline">\
   <div class="form-group">\
      <label class="sr-only" >city</label>\
      <input class="input-city form-control" autocomplete="off" placeholder="Enter City">\
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
   $("#result-wrap").hide();
   // testing
  /*var data = JSON.parse(localStorage.getItem('test'));

   $("#loading-sign").hide();
   displayResult(data);
   return;*/
   //return;
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
   $("#result-wrap").show();
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
   setupTypeahead($(".input-start-city"));

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


/* HANDLEBAR TEMPLATE */
var resultHTML = '\
<h3 id="result-title">Results ({{numResult}})</h3>\
<ul id="result-sort-tabs" class="nav nav-tabs" role="tablist">\
   <li data-sort="price" role="presentation" class="active"><a href="#price" >Price</a></li>\
   <li data-sort="stops" role="presentation"><a href="#stops" role="tab" >Stops</a></li>\
   <li data-sort="hours"  role="presentation"><a href="#hours" role="tab" >Hours</a></li>\
</ul>\
<ul class="list-group" id="result-list"></ul>\
';

var resultItemHTML = "\
<p class='list-price'>Sale Price: {{totalPrice}}</p>\
<p class='list-route'>Route: {{routeList}}</p> \
<p class='list-route-stop'>Total stops: {{totalStop}} ({{showMinutesDuration totalMinutes}})</p>\
<ul class='list-slice'></ul>\
";

var flightHTML = "\
<li class='flight-slice'>\
   Flight {{index}} :  {{getValue citiesList index}} &rarr;  {{getValue citiesList incrIndex}}\
   <ul>\
      {{#each segment}}\
         <li>{{this.flight.carrier}} {{this.flight.number}} {{this.leg.0.origin}} \
         {{toTime this.leg.0.departureTime}} {{this.leg.0.destination}} {{toTime this.leg.0.arrivalTime}}\
         ({{getTimeDiff this.leg.0.arrivalTime this.leg.0.departureTime}})</li>\
      {{/each}}\
   </ul>\
</li>";

var resultTemplate = Handlebars.compile(resultHTML);
var resultItemTemplate = Handlebars.compile(resultItemHTML);
var flightSliceTemplate = Handlebars.compile(flightHTML);


var sort = {
   PRICE : 'price',
   STOPS : 'stops',
   HOURS : 'hours'
}
function softResult(list, method){
   if (method == sort.PRICE){
      list.sort(function(a, b) {
         return a['saleTotalInNumber'] - b['saleTotalInNumber']
      });
   } else if (method == sort.STOPS) {
      list.sort(function(a, b) {
         if (a['totalStop'] == b['totalStop']) {
            return a['saleTotalInNumber'] - b['saleTotalInNumber']
         } else {
            return a['totalStop'] - b['totalStop'];
         }
      });
   } else if (method == sort.HOURS) {
      list.sort(function(a, b) {
         if (a['totalMinutes'] == b['totalMinutes']) {
            return a['saleTotalInNumber'] - b['saleTotalInNumber']
         } else {
            return a['totalMinutes'] - b['totalMinutes'];
         }
      });
   }
}

var sortMethod;

function onSortUpdate(evt, data){
   var select = $(evt.target).parent();
   if(select.hasClass('active')){
      return;
   }

   $("#result-sort-tabs > li").removeClass('active');
   select.addClass('active');

   sortMethod = select.data('sort');

   softResult(data['data'], sortMethod);
   displayResultList(data);

}

function formatData(data){
   $.each(data['data'], function (index, val){
      val['totalStop'] =  _.reduce(val['slice'], function(memo, slice){
            return memo + slice.segment.length; }, 0);
      val['saleTotalInNumber'] =  parseFloat(val['saleTotal'].replace("USD",""));

      _.each(val['slice'], function(slice){
         _.each(slice['segment'], function(segment){
            segment['leg'][0]['arrivalTime'] = moment(segment['leg'][0]['arrivalTime'], "YYY-MM-DDTHH:mm:ssZ");
            segment['leg'][0]['departureTime'] = moment(segment['leg'][0]['departureTime'], "YYY-MM-DDTHH:mm:ssZ");
         });
      });

      val['totalMinutes'] = _.reduce(val['slice'], function(memo, slice){
         var segmentMinutes = 0;
         for(var i=0; i<slice['segment'].length; i++){
            var segment = slice['segment'][i];

            // add duration from previous segment
            if(i > 0 ){
               var prevSegment = slice['segment'][i-1];
               segmentMinutes += getDiffInMinutes(segment['leg'][0]['departureTime'], prevSegment['leg'][0]['arrivalTime']);

            }
            segmentMinutes += getDiffInMinutes(segment['leg'][0]['arrivalTime'],
               segment['leg'][0]['departureTime']);

         }

         return memo + segmentMinutes;
      }, 0);


   });
}


function displayResult(data) {
   localStorage.setItem('test', JSON.stringify(data));
   console.log("DISPLAY RESULTS");
   console.log(data);

   formatData(data);

   // default sorting is price
   sortMethod = sort.PRICE;
   $("#result-wrap").html(resultTemplate({numResult: data['data'].length})).show();
   $("#result-sort-tabs >li").click(function(evt){
      console.log(data);
      onSortUpdate(evt, data);
   });

   // Sort by (1)price, (2) # of stops, (3) duration (agony?)
   softResult(data['data'], sortMethod);

   displayResultList(data);
}

function displayResultList(data){
   $("#result-list").empty();
   // print result
   $.each(data['data'], function (index, val){
      var cities = _.map(val['cities'], function(cityObj){
            return cityObj['name'] + ' (' + cityObj['days'] + ' days)';
         });
      cities.unshift(val['start']);
      cities.push(val['start']);

      var citiesList = _.map(val['cities'], function(cityObj){
            return cityObj['name'];
         });
         citiesList.unshift(val['start']);
         citiesList.push(val['start']);

      var itemData = {
         'totalPrice': val['saleTotal'],
         'routeList': cities.join(' - '),
         'totalStop': val['totalStop'],
         'totalMinutes' : val['totalMinutes']
      };

      //localStorage.setItem('test', JSON.stringify(data));
      var item = $("<li class='list-group-item'></li>");
      item.append(resultItemTemplate(itemData));

      // list flight info
      $.each(val['slice'], function(i, slice){
         item.find('.list-slice').append(flightSliceTemplate({
               'segment': slice['segment'],
               'index': i,
               'incrIndex': i+1,
               'citiesList': citiesList
         }));
      });

      $("#result-list").append(item);
   });
}
