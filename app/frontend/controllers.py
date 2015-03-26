from flask import (Blueprint, render_template, current_app, request,
                   flash, url_for, redirect, session, abort, make_response, jsonify)
from ..helpers import response as Response
from flask import request
from itertools import permutations
import datetime
import pprint
import copy
import time
import sys
import multiprocessing


from apiclient.discovery import build

frontend = Blueprint('frontend', __name__)

@frontend.route('/health_check')
def healthy(path=None):
   return Response.make_data_resp(data=[], msg="good")


def make_flight_request(queue, index, option, fields):
   print "START %s" % (index)
   service = build('qpxExpress', 'v1', developerKey="AIzaSyAJvR5WDJvCjf4MIR62Un1amSWPvgtLq00")
   request = service.trips().search(body=option['option'],fields=fields)
   response = request.execute()

   data = []
   if 'trips' in response:
      for trip in response['trips']['tripOption']:
         trip['cities'] = option['cities']
         trip['start'] = option['start']
         data.append(trip)
   try:
      pass
   except:
      print "Unexpected error:", sys.exc_info()[0]
      queue.put([])
   else:
      queue.put(data)
   print "Done %s" % index


@frontend.route('/api/optimize_routes', methods=['POST'])
def api_routes():

   # base option
   base_option = {
      "request": {
          "slice": [
          ],
          "passengers": {
            "adultCount": 1,
            "infantInLapCount": 0,
            "infantInSeatCount": 0,
            "childCount": 0,
            "seniorCount": 0
          },
          "solutions": 2,
          "refundable": False
         }
      }

   # find all combination
   cities_combo = list(permutations(request.json['cities'], len(request.json['cities'])))

   total_options = []
   for cities in cities_combo:
      cities = list(cities)
      # make a copy of default options
      option = copy.deepcopy(base_option)

      # generate the slice cities
      start_date = datetime.datetime.strptime(request.json['date'], "%Y-%m-%d").date()

      # add first slice
      option['request']['slice'].append({
         "origin": request.json['start'],
         "destination": cities[0]['name'],
         "date": start_date.strftime("%Y-%m-%d")
      })

      # add intermittent cities
      for i, val in enumerate(cities[:-1]):
         # add the days staying at each city
         start_date += datetime.timedelta(days=cities[i]['days'])

         option['request']['slice'].append({
            "origin": cities[i]['name'],
            "destination": cities[i+1]['name'],
            "date": start_date.strftime("%Y-%m-%d")
         })

      # add the last slice
      start_date += datetime.timedelta(days=cities[-1]['days'])
      option['request']['slice'].append({
         "origin": cities[-1]['name'],
         "destination": request.json['start'],
         "date": start_date.strftime("%Y-%m-%d")
      })

      total_options.append({
         'option': option,
         'cities': cities,
         'start' : request.json['start']
      })

   print len(total_options)
   start_time = time.time()

   # query google API
   jobs = []
   #total_options = total_options[0:10]

   result_queue = multiprocessing.Queue()
   for i, x in enumerate(total_options):
      process = multiprocessing.Process(target=make_flight_request, args=(result_queue, i, x, 'trips/tripOption(saleTotal,slice(segment(bookingCode, flight,leg(arrivalTime,departureTime,destination,origin))))'))
      jobs.append(process)

   for i, j in enumerate(jobs):
      j.start()
      if i % 8 == 0:
         time.sleep(1)

   temp = []
   while len(temp) < len(total_options):
      temp.append(result_queue.get())

   # Ensure all of the threads have finished
   for j in jobs:
      j.join()

   results = []
   for x in temp:
      for y in x:
         results.append(y)

   #results = [result_queue.get() for x in total_options]

   print("--- %s seconds ---" % (time.time() - start_time))
   return Response.make_data_resp(data=results, msg="good")

   #return Response.make_data_resp(data=total_options, msg="good")


@frontend.route('/test')
def test(path=None):
   service = build('qpxExpress', 'v1', developerKey="AIzaSyAJvR5WDJvCjf4MIR62Un1amSWPvgtLq00")

   options = {
      "request": {
       "slice": [
         {
           "origin": "LAX",
           "destination": "LON",
           "date": "2015-04-22"
         },
         {
           "origin": "LON",
           "destination": "BER",
           "date": "2015-04-28"
         },
         '''{
           "origin": "BER",
           "destination": "ROM",
           "date": "2015-05-04"
         },
         {
           "origin": "ROM",
           "destination": "BCN",
           "date": "2015-05-10"
         },
         {
           "origin": "BCN",
           "destination": "LAX",
           "date": "2015-05-14"
         }'''
       ],
       "passengers": {
         "adultCount": 1,
         "infantInLapCount": 0,
         "infantInSeatCount": 0,
         "childCount": 0,
         "seniorCount": 0
       },
       "solutions": 5,
       "refundable": False,
      }
      }
   start_time = time.time()
   # try do parallel
   threads = 5
   jobs = []
   for i in range(0, threads):
      out_list = list()
      process = multiprocessing.Process(target=make_flight_request, args=(options, 'trips/tripOption(saleTotal,slice(segment(bookingCode, flight,leg(arrivalTime,departureTime,destination,origin))))'))
      jobs.append(process)

   for j in jobs:
      j.start()

   # Ensure all of the threads have finished
   for j in jobs:
      j.join()


   print("--- %s seconds ---" % (time.time() - start_time))
   return Response.make_data_resp(data="TEST", msg="good")
#bookingCode, flight,leg(arrivalTime,departureTime,destination,origin

@frontend.route('/alg')
def alg(path=None):
   return render_template('alg_test.html')


@frontend.route('/')
@frontend.route('/<path:path>')
def index(path=None):
   return render_template('app.html')
