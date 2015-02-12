from flask import (Blueprint, render_template, current_app, request,
                   flash, url_for, redirect, session, abort)
from ..helpers import response as Response

frontend = Blueprint('frontend', __name__)

@frontend.route('/health_check')
def index(path=None):
   return Response.make_data_resp(data=[], msg="good")
