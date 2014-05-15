/*
 * 
 *                  xxxxxxx      xxxxxxx
 *                   x:::::x    x:::::x 
 *                    x:::::x  x:::::x  
 *                     x:::::xx:::::x   
 *                      x::::::::::x    
 *                       x::::::::x     
 *                       x::::::::x     
 *                      x::::::::::x    
 *                     x:::::xx:::::x   
 *                    x:::::x  x:::::x  
 *                   x:::::x    x:::::x 
 *              THE xxxxxxx      xxxxxxx TOOLKIT
 *                    
 *                  http://www.goXTK.com
 *                   
 * Copyright (c) 2012 The X Toolkit Developers <dev@goXTK.com>
 *                   
 *    The X Toolkit (XTK) is licensed under the MIT License:
 *      http://www.opensource.org/licenses/mit-license.php
 * 
 *      "Free software" is a matter of liberty, not price.
 *      "Free" as in "free speech", not as in "free beer".
 *                                         - Richard M. Stallman
 * 
 * 
 */

// provides
goog.provide('X.neoEvent');
goog.provide('X.neoEvent.events');

// events provided
goog.provide('X.neoEvent.PickEvent');
goog.provide('X.neoEvent.MeasureEvent');

// requires
goog.require('X.event');



/**
 * The superclass class for all events in XTK.
 * 
 * @constructor
 * @param {string} type A type identifier for this event.
 * @extends X.event
 */
X.neoEvent = function(type) {
  
  //
  // call the default event constructor
  goog.base(this, type);
  
  //
  // class attributes
  
  /**
   * The className of this class.
   * 
   * @type {string}
   * @protected
   */
  this._className = 'neoEvent';
  
};
// inherit from goog.events.Event
goog.inherits(X.neoEvent, X.event);


/**
 * The events of this class.
 * 
 * @enum {string}
 */
X.neoEvent.events = {
  // the pick Event
  PICK: X.event.uniqueId('pick'),
  
  // the pick Event
  PICK3D: X.event.uniqueId('pick3d'),
  
  // the measure Event
  MEASURE : X.event.uniqueId('measure'),
  
  // the reslice event for volumes
  RESLICE : X.event.uniqueId('reslice'),
  
  // MULTI MODIFIED
  MULTIMODIFIED : X.event.uniqueId('multimodified')

};

/**
 * The pick event, indicating mouse-pick on an X.object.
 * 
 * @constructor
 * @extends X.neoEvent
 */
X.neoEvent.PickEvent = function() {

  // call the default event constructor
  goog.base(this, X.neoEvent.events.PICK);
  
  this._x = 0;
  this._y = 0;
  this._obj = null;
  this._type = '';
  
};
// inherit from goog.events.Event
goog.inherits(X.neoEvent.PickEvent, X.neoEvent);


/**
 * The pick3d event, indicating mouse-pick.
 * 
 * @constructor
 * @extends X.neoEvent
 */
X.neoEvent.Pick3dEvent = function() {

  // call the default event constructor
  goog.base(this, X.neoEvent.events.PICK3D);
  
  this._x = 0;
  this._y = 0;
  this._z = 0;
  this._type = '';
  
};
// inherit from goog.events.Event
goog.inherits(X.neoEvent.Pick3dEvent, X.neoEvent);


/**
 * The measure event, indicating a measure point.
 * 
 * @constructor
 * @extends X.neoEvent
 */
X.neoEvent.MeasureEvent = function() {

  // call the default event constructor
  goog.base(this, X.neoEvent.events.MEASURE);
  
  this._x = 0;
  this._y = 0;
  
};
// inherit from goog.events.Event
goog.inherits(X.neoEvent.MeasureEvent, X.neoEvent);


/**
 * The reslice event, indicating a reslice request.
 * 
 * @constructor
 * @extends X.neoEvent
 */
X.neoEvent.ResliceEvent = function() {

  // call the default event constructor
  goog.base(this, X.neoEvent.events.RESLICE);
  
  this._dir = 0;
  this._x = 0;
  this._y = 0;
  this._z = 0;
  
};
// inherit from goog.events.Event
goog.inherits(X.neoEvent.ResliceEvent, X.neoEvent);


/**
 * The modified event to flag an object as 'dirty' but for all the renderers.
 * 
 * @constructor
 * @extends X.event
 */
X.neoEvent.MultiModifiedEvent = function() {

  // call the default event constructor
  goog.base(this, X.neoEvent.events.MULTIMODIFIED);

  /**
   * The object which was modified.
   * 
   * @type {!X.object}
   * @protected
   */
  this._object = new X.object();
  
};
// inherit from goog.events.Event
goog.inherits(X.neoEvent.MultiModifiedEvent, X.neoEvent);
