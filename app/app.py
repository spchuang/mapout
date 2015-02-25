import os
from flask import Flask, render_template
from .config import DefaultConfig
from .constants import INSTANCE_FOLDER_PATH
from .extensions import csrf
from .frontend import frontend


# For import *
__all__ = ['create_app']


DEFAULT_BLUEPRINTS = [
    frontend
]

def create_app(config=None, app_name=None, blueprints=None):
   """Create a Flask app."""
   
   if app_name is None:
     app_name = DefaultConfig.PROJECT
   if blueprints is None:
     blueprints = DEFAULT_BLUEPRINTS
   
   
   
   app = Flask(app_name, instance_path=INSTANCE_FOLDER_PATH, instance_relative_config=True)
   configure_app(app, config)
   configure_hook(app)
   configure_blueprints(app, blueprints)
   configure_extensions(app)
   configure_logging(app)
   configure_error_handlers(app)
   
   return app
    
def configure_app(app, config=None):
   """Different ways of configurations."""
   
   # http://flask.pocoo.org/docs/api/#configuration
   app.config.from_object(DefaultConfig)
   
   # http://flask.pocoo.org/docs/config/#instance-folders
   app.config.from_pyfile('production.cfg', silent=True)
   
   if config:
     app.config.from_object(config)
   
   # Use instance folder instead of env variables to make deployment easier.
   #app.config.from_envvar('%s_APP_CONFIG' % DefaultConfig.PROJECT.upper(), silent=True)
   

def configure_extensions(app):
   #flask-wtf
   csrf.init_app(app)
   

def configure_blueprints(app, blueprints):
   """Configure blueprints in views."""
   
   for blueprint in blueprints:
      app.register_blueprint(blueprint)


def configure_logging(app):
    """Configure file(info) and email(error) logging."""
    pass
    


def configure_hook(app):
   @app.before_request
   def before_request():
      pass


def configure_error_handlers(app):
   #note: we don't have files for 403 and 500 yet
   @app.errorhandler(403)
   def forbidden_page(error):
      return render_template("errors/403.html"), 403
   
   @app.errorhandler(404)
   def page_not_found(error):
      return "NOPE"
      #return render_template("errors/404.html"), 404
   
   @app.errorhandler(500)
   def server_error_page(error):
      return render_template("errors/500.html"), 500