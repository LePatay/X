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
 *      http://www.opensource._org/licenses/mit-license._php
 * 
 *      "Free software" is a matter of liberty, not price._
 *      "Free" as in "free speech", not as in "free beer".
 *                                         - Richard M. Stallman
 * 
 * 
 */

// provides
goog.provide('X.neoModelInteractor');

// requires
goog.require('X.interactor3D');
goog.require('X.neoEvent.PickEvent');
goog.require('X.neoEvent.MeasureEvent');


/**
 * Create an neoModelInteractor for a given element in the DOM tree._
 * 
 * @constructor
 * @param {Element} element The DOM element to be observed.
 * @param {boolean} isThumbnail is that interactor for a thumbnail.
 * @extends X.interactor3D
 */
 
X.neoModelInteractor = function(element, isThumbnail) {

  // X.interactor3D.call(this, element); // equivalent to goog.base(this,element)
  
  //
  // call the standard constructor of X.base
  goog.base(this,element);
  //
  
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'neoModelInteractor';
  
  this.dblClickListener = null;
  
  this['config'] = {
    'MOUSEWHEEL_ENABLED': false,
    'MOUSECLICKS_ENABLED': true,
    'MOUSEDBLCLICKS_ENABLED': true,
    'KEYBOARD_ENABLED': true,
    'HOVERING_ENABLED': false,
    'CONTEXTMENU_ENABLED': false
  };
  
  this._rotationActive=false;
  
  this._panActive=false;
  
  this._measuresActive=false;

  if (!goog.isDefAndNotNull(isThumbnail) || !!isThumbnail!=isThumbnail) throw new Error("Invalid input parameter isThumbnail.");
  
  this._isThumbnail= isThumbnail;
};
// inherits from interactor
goog.inherits(X.neoModelInteractor, X.interactor3D);


/**
 * @inheritDoc
 */
X.neoModelInteractor.prototype.init = function() {

  if (this['config']['MOUSEWHEEL_ENABLED']) {
    
    // we use the goog.events.MouseWheelHandler for a browser-independent
    // implementation
    this.mouseWheelHandler = new goog.events.MouseWheelHandler(this._element);
    
    this.mouseWheelListener = goog.events.listen(this.mouseWheelHandler,
        goog.events.MouseWheelHandler.EventType.MOUSEWHEEL, this.onMouseWheel_
            .bind(this));
    
  } else {
    
    // remove all mouse wheel observers, if they exist..
    goog.events.unlistenByKey(this.mouseWheelListener);
    
    this.mouseWheelHandler = null;
    
  }
  
  if (this['config']['MOUSECLICKS_ENABLED']) {
    
    // mouse down
    this.mouseDownListener = goog.events.listen(this._element,
        goog.events.EventType.MOUSEDOWN, this.onMouseDown_.bind(this));
    
    // mouse up
    this.mouseUpListener = goog.events.listen(this._element,
        goog.events.EventType.MOUSEUP, this.onMouseUp_.bind(this));
    
  } else {
    
    // remove the observer, if it exists..
    // goog.events.unlisten(this._element, goog.events.EventType.MOUSEDOWN);
    goog.events.unlistenByKey(this.mouseDownListener);
    
    // remove the observer, if it exists..
    goog.events.unlistenByKey(this.mouseUpListener);
    
  }
  
  if (this['config']['MOUSEDBLCLICKS_ENABLED']) {
    
    // mouse dblclick
    this.dblClickListener = goog.events.listen(this._element,
        goog.events.EventType.DBLCLICK, this.onDblClick_.bind(this));
    
  } else {
    
    // remove the observer, if it exists..
    // goog.events.unlisten(this._element, goog.events.EventType.DBLCLICK);
    goog.events.unlistenByKey(this.dblClickListener);
    
  }
  
  
  if (!this['config']['CONTEXTMENU_ENABLED']) {
    
    // deactivate right-click context menu
    // found no way to use goog.events for that? tried everything..
    // according to http://help.dottoro.com/ljhwjsss.php, this method is
    // compatible with all browsers but opera
    this._element.oncontextmenu = function() {

      return false;
      
    };
    
  } else {
    
    // re-activate right-click context menu
    this._element.oncontextmenu = null;
  }
  
  if (this['config']['KEYBOARD_ENABLED']) {
    
    // the google closure way did not work, so let's do it this way..
    this._element.onkeydown = this.onKey_.bind(this);
    this._element.onkeyup = this.onKey_Up.bind(this);
    
  } else {
    
    // remove the keyboard observer
    this._element.onkeydown = null;
    this._element.onkeyup = null;
    
  }
  
  //
  // we always listen to mouse move events since they are essential for the
  // other events
  // we do make sure, we add them only once
  
  // remove the observer, if it exists..
  goog.events.unlistenByKey(this.mouseMoveListener);
  
  // remove the observer, if it exists..
  goog.events.unlistenByKey(this.mouseOutListener);
  
  // mouse movement inside the element
  this.mouseMoveListener = goog.events.listen(this._element,
      goog.events.EventType.MOUSEMOVE, this.onMouseMovementInside_.bind(this));
  
  // mouse movement outside the element
  this.mouseOutListener = goog.events.listen(this._element,
      goog.events.EventType.MOUSEOUT, this.onMouseMovementOutside_.bind(this));
  
};


/**
 * @inheritDoc
 */
X.neoModelInteractor.prototype.onMouseDown_ = function(event) {

  if (event.button == goog.events.BrowserEvent.MouseButton.LEFT) {
    
    // left button click
    this._leftButtonDown = true;
    if (!this._panActive) {
      this._rotationActive = true;
    }
    
  } else if (event.button == goog.events.BrowserEvent.MouseButton.MIDDLE) {
    
    // middle button click
    this._middleButtonDown = true;
    
  } else if (event.button == goog.events.BrowserEvent.MouseButton.RIGHT) {
    
    // right button click
    this._rightButtonDown = true;
    
  }
  
  eval("this.onMouseDown(" + this._leftButtonDown + "," +
      this._middleButtonDown + "," + this._rightButtonDown + ")");
  
  // end all hovering since the scene can change and a caption might be
  // misplaced etc.
  this.hoverEnd_();
  
  // prevent further handling by the browser
  event.preventDefault();
  
};


/**
 * Callback for mouse up events on the associated DOM element.
 * 
 * @param {Event} event The browser fired event.
 * @private
 */
X.neoModelInteractor.prototype.onMouseUp_ = function(event) {
  if (event.button == goog.events.BrowserEvent.MouseButton.LEFT) {
    
    // left button click
    this._leftButtonDown = false;
    this._rotationActive = false;
    
  } else if (event.button == goog.events.BrowserEvent.MouseButton.MIDDLE) {
    
    // middle button click
    this._middleButtonDown = false;
    
  } else if (event.button == goog.events.BrowserEvent.MouseButton.RIGHT) {
    
    // right button click
    this._rightButtonDown = false;
    
  }
  
    eval("this.onMouseUp(" + this._leftButtonDown + "," + this._middleButtonDown +
      "," + this._rightButtonDown + ")");
  
  // end all hovering since the scene can change and a caption might be
  // misplaced etc.
  this.hoverEnd_();
  
  // prevent further handling by the browser
  event.preventDefault();
  
};


/**
 * @inheritDoc
 */
X.neoModelInteractor.prototype.onMouseMovementInside_ = function(event) {
  this['mousemoveEvent'] = event; // we need to buffer the event to run eval in
  // advanced compilation
  eval("this.onMouseMove(this['mousemoveEvent'])");
  
  this._element.focus();
  
  this.mouseInside = true;
  
  // prevent any other actions by the browser (f.e._ scrolling, selection..)
  event.preventDefault();
  
  // is shift down?
  var shiftDown = event.shiftKey;
  
  // is ctrl down?
  var ctrlDown = event.ctrlKey;
  
  // grab the current mouse position
  var currentMousePosition = new goog.math.Vec2(event.offsetX, event.offsetY);
  
  // get the distance in terms of the last mouse move event
  var distance = this._lastMousePosition.subtract(currentMousePosition);
  
  // save the current mouse position as the last one
  this._lastMousePosition = currentMousePosition.clone();
  
  // 
  // hovering, if _ENABLED..
  //
  if (this['config']['HOVERING_ENABLED']) {
    
    if (Math.abs(distance.x) > 0 || Math.abs(distance.y) > 0 ||
        this._middleButtonDown || this._leftButtonDown ||
        this._rightButtonDown) {
      
      // there was some mouse movement, let's cancel the hovering countdown
      this.hoverEnd_();
      
    }
    
    // start the hovering countdown
    // if the mouse does not move for 2 secs, fire the HoverEvent to initiate
    // picking etc.
    this.hoverTrigger = setTimeout(function() {

      this.hoverEnd_();
      
      var e = new X.event.HoverEvent();
      e.x = currentMousePosition.x;
      e.y = currentMousePosition.y;
      
      this.dispatchEvent(e);
      
      // reset the trigger
      this.hoverTrigger = null;
      
    }.bind(this), 300);
    
  }
  
  // threshold the distance to avoid 'irregular' movement
  if (Math.abs(distance.x) < 2) {
    
    distance.x = 0;
    
  }
  if (Math.abs(distance.y) < 2) {
    
    distance.y = 0;
    
  }
  distance.x = distance.x / this._element.width;
  distance.y = distance.y / this._element.height;
  
  // jump out if the distance is 0 to avoid unnecessary events
  if (distance.magnitude() == 0) {
    
    return;
    
  }
  
  if (this._isThumbnail) {
    //
    // check which mouse buttons or keys are pressed
    //
    if (this._leftButtonDown && shiftDown && !ctrlDown && this._rotationActive) {
      //
      // LEFT MOUSE BUTTON DOWN AND SHIFT and NO CTRL DOWN
      //
      
      // create a new rotate event
      var e = new X.event.RotateEvent();
      
      distance.x = distance.x * 720;
      distance.y = distance.y * 720;
      
      // attach the distance vector
      e._distance = distance;
      
      // attach the angle in degrees
      e._angle = 0;
      
      // .. fire the event
      this.dispatchEvent(e);
      

    } else if (this._leftButtonDown && shiftDown && ctrlDown && this._rotationActive) {
      //
      // LEFT MOUSE BUTTON DOWN AND SHIFT AND CTRL DOWN
      //
      
      // create a new rotate event
      var e = new X.event.RotateEvent();
      
      // attach the distance vector
      e._distance = new goog.math.Vec2(0,0);
      
      // attach the angle in degrees
      e._angle = distance.y * 2 * 3.1415;
      
      // .. fire the event
      this.dispatchEvent(e);
      

    } else if (this._leftButtonDown && shiftDown && !ctrlDown && this._panActive) {
      //
      // LEFT MOUSE BUTTON DOWN AND SHIFT DOWN
      //
      
      // create a new pan event
      var e = new X.event.PanEvent();
      
      // to slow the pan
      distance.x = distance.x*200;
      distance.y = distance.y*200;
      
      // attach the distance vector
      e._distance = distance;
      
      // .. fire the event
      this.dispatchEvent(e);  
    } else if (this._leftButtonDown && !shiftDown && ctrlDown) {
      //
      // LEFT MOUSE BUTTON DOWN AND CTRL DOWN
      //
      
      // Code set up event here !  
    } else if (this._rightButtonDown || (this._leftButtonDown && shiftDown && ctrlDown) ) {
      //
      // RIGHT MOUSE BUTTON DOWN
      //
      if ((distance.y>2/this._element.width || distance.y<-2/this._element.width) && (distance.x<40/this._element.width && distance.x>-40/this._element.width)) { // threshold
        
        // create a new zoom event
        var e = new X.event.ZoomEvent();
        
        // set the zoom direction
        // true if zooming in, false if zooming out
        e._in = (distance.y > 0);
        
        // with the right click, the zoom will happen rather
        // fine than fast
        e._fast = true;
        
        // .. fire the event
        this.dispatchEvent(e);
      }
    }
  } else {
    //
    // check which mouse buttons or keys are pressed
    //
    if (this._leftButtonDown && !shiftDown && !ctrlDown) {
      //
      // LEFT MOUSE BUTTON DOWN AND NOT SHIFT NOR CTRL DOWN
      //
      // create a new rotate event
      var e = new X.event.RotateEvent();
      
      distance.x = distance.x * 720;
      distance.y = distance.y * 720;
      
      // attach the distance vector
      e._distance = distance;
      
      // attach the angle in degrees
      e._angle = 0;
      
      // .. fire the event
      this.dispatchEvent(e);
      

    } else if (this._leftButtonDown && !shiftDown && ctrlDown) {
      //
      // LEFT MOUSE BUTTON DOWN AND NOT SHIFT NOR CTRL DOWN
      //
      
      // create a new rotate event
      var e = new X.event.RotateEvent();
      
      distance.y = distance.y*2*3.1415;
      
      // attach the distance vector
      e._distance = new goog.math.Vec2(0,0);
      
      // attach the angle in degrees
      e._angle = distance.y;
      
      // .. fire the event
      this.dispatchEvent(e);
      

    } else if (this._leftButtonDown && shiftDown && !ctrlDown) {
      //
      // LEFT MOUSE BUTTON DOWN AND SHIFT DOWN
      //
      
      // create a new pan event
      var e = new X.event.PanEvent();
      
      // to slow the pan
      distance.x = distance.x * 200;
      distance.y = distance.y * 200;
      
      // attach the distance vector
      e._distance = distance;
      
      // .. fire the event
      this.dispatchEvent(e);  
    } else if (this._leftButtonDown && !shiftDown && ctrlDown) {
      //
      // LEFT MOUSE BUTTON DOWN AND CTRL DOWN
      //
      
      // Code set up event here !  
    } else if (this._rightButtonDown || (this._leftButtonDown && shiftDown && ctrlDown) ) {
      //
      // RIGHT MOUSE BUTTON DOWN
      //
      if ((distance.y>2/this._element.width || distance.y<-2/this._element.width) && (distance.x<40/this._element.width && distance.x>-40/this._element.width)) { // threshold

        // create a new zoom event
        var e = new X.event.ZoomEvent();
        
        // set the zoom direction
        // true if zooming in, false if zooming out
        e._in = (distance.y > 0);
        
        // with the right click, the zoom will happen rather
        // fine than fast
        e._fast = true;
        
        // .. fire the event
        this.dispatchEvent(e);
      }
    }
  }
  
};


/**
 * Overload this function to execute code on double click.
 *
 * @param {Event} event The browser fired mousewheel event.
 * @public
 */
X.neoModelInteractor.prototype.onDblClick = function(event) {
};


/**
 * Callback for mouse double click on the associated DOM element.
 *
 * @param {Event} event The browser fired dbl click event.
 */
X.neoModelInteractor.prototype.onDblClick_ = function(event) {
  this['dblClickEvent'] = event; // we need to buffer the event to run eval in
  // advanced compilation
  eval("this.onDblClick(this['dblClickEvent'])");
  
  // end all hovering since the scene can change and a caption might be
  // misplaced etc.
  this.hoverEnd_();
  
  // prevent further handling by the browser
  event.preventDefault();
  
  // grab the current mouse position
  var currentMousePosition = new goog.math.Vec2(event.offsetX, event.offsetY);
  
  if (this._measuresActive) {
    var e = new X.neoEvent.MeasureEvent();
    e._x = currentMousePosition.x;
    e._y = currentMousePosition.y;
  } else {
    var e = new X.neoEvent.PickEvent();
    e._x = currentMousePosition.x;
    e._y = currentMousePosition.y;
    e._type = 'position';
  }
  this.dispatchEvent(e);
};


/**
 * @inheritDoc
 */
X.neoModelInteractor.prototype.onKey_ = function(event) {
  // only listen to key events if the mouse is inside our element
  // this f.e._ enables key event listening for multiple renderers
  if (!this.mouseInside) {
    
    return;
    
  }
  
  this['keyEvent'] = event; // buffering..
  eval("this.onKey(this['keyEvent'])");
  
  // end all hovering since the scene can change and a caption might be
  // misplaced etc.
  this.hoverEnd_();
  // observe the shift key
  var shift = event.shiftKey;
  
  if (shift && !this._rotationActive) { // && !this._rotationActive ?
    this._panActive = true;
  }
  
};


/**
 * Callback for keyboard events on the associated DOM element. This fires proper
 * X.event events.
 * 
 * @param {Event} event The browser fired event.
 * @private
 */
X.neoModelInteractor.prototype.onKey_Up = function(event) {
  // observe the control keys (shift, alt, ..)
  var shift = event.shiftKey;
  if (shift) {
    // if we unpush shift
    this._panActive = false;
  }
  
  // only listen to key events if the mouse is inside our element
  // this f.e._ enables key event listening for multiple renderers
  if (!this.mouseInside) {
    
    return;
    
  }
  
  // end all hovering since the scene can change and a caption might be
  // misplaced etc.
  this.hoverEnd_();
};


// export symbols (required for advanced compilation)
goog.exportSymbol('X.neoModelInteractor', X.neoModelInteractor);
goog.exportSymbol('X.neoModelInteractor.prototype.init', X.neoModelInteractor.prototype.init);
goog.exportSymbol('X.neoModelInteractor.prototype.onDblClick', X.neoModelInteractor.prototype.onDblClick);
