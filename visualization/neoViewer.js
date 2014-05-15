// provides
goog.provide('X.neoViewer');

// requires
goog.require('X.base');
goog.require('X.object');
goog.require('X.neoRenderer3D');
goog.require('goog.dom');
goog.require('X.parserNEO');

/**
 * Create a viewer inside a given DOM Element. The viewer handle multiple renderers that can be displayed or hidden. An hidden renderer has no objects and is up-to-date only if visible.
 * 
 * @constructor
 *
 * @extends X.base
 */

X.neoViewer = function() {

  /**
   * The HTML containers of this viewer, E.g. a <div> enumeration.
   * 
   * @enum {!Element|null}
   * @protected
   */
  this['containers'] = {
    '1': null,
    '2': null,
    '3': null,
    '4': null,
    '5': null,
    '6': null,
    '7': null,
    '8': null
  };
  

  this._container = window.document.body;
  
  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'neoViewer';

  /**
   * The 'dirty' flag of this object.
   * 
   * @type {boolean}
   * @protected
   */
  this._dirty = true;


  /**
   * The renderers of this viewer, E.g. a <div> enumeration. 4 for scenes, 4 for volumes.
   * 
   * @enum {?X.renderer}
   * @protected
   */
  this['renderers'] = {
    '1': null,
    '2': null,
    '3': null,
    '4': null,
    '5': null,
    '6': null,
    '7': null,
    '8': null
  };
  
  /**
  * The scene object of this viewer
  *
  * @type {?X.object}
  * @protected
  */
  this._topLevelObject = null; // the scene
  
  /**
  * The volume object of this viewer
  *
  * @type {?X.neoVolume}
  * @protected
  */
  this._topLevelVolume = null; // the scene
  
  /**
  * The currently picked object of this viewer
  *
  * @type {?X.object}
  * @protected
  */
  this._pickedObject = null;
  
  
  /**
  * The color of the currently picked object before it was picked (and so red-ed)
  *
  * @type {?Array}
  * @protected
  */
  this._pickedObjectColor = null;
  
  /**
  * @protected
  */
  this._focusedRenderer = -1;
  
  /**
  * @protected
  */
  this._volumeDisplay = false;
  
  this._viewState = 0;
  
  
  window.console.log('XTK Release 4 -- 04/12/12 -- http://www.goXTK.com');
};

// inherit from X.base
goog.inherits(X.neoViewer, X.base);


/**
 * Initialises the viewer : creates the containers, set them renderers and manage the event
 * 
 * @protected
 */
X.neoViewer.prototype.init = function() {

  this._topLevelObject = null;
  this._topLevelVolume = null;

  // clean the container
  while (this._container.hasChildNodes()) {
    this._container.removeChild(this._container.lastChild);
  }


  // create the views
  for (var i=1 ; i<9 ; i++) {
    (function(parent, id) {
      var _view = goog.dom.createElement('div');
      _view.style.width = "100%";
      _view.style.height = "100%";
      _view.style.position = "absolute";
      _view.style.left = "0%";
      _view.style.top = "0%";
      //_view.style.backgroundColor = "#"+(i*40)%100+(i*10+20)%100+"00";
      _view.style.margin = "0px";
      _view.id = "container_"+id;
      _view.style.zIndex = "1";
      _view.style.display = "block"; // we initialy display all to avoid a webgl warning "imcomplete framebuffer"
      goog.dom.appendChild(parent._container, _view);
      _view.mouseDownListener = goog.events.listen(_view, goog.events.EventType.MOUSEDOWN, parent.onFocus_.bind(parent,id));
      parent['containers'][i] = _view;
    })(this, i);
  }


  for (var i=1 ; i<9 ; i++) {
    // destroy the last renderers if they exist
    if (goog.isDefAndNotNull(this['renderers'][i]) && this['renderers'][i] instanceof X.renderer) {
      this['renderers'][i].destroy();
    }
    var r = new X.neoRenderer3D();
    r._container = this['containers'][i];
    if (i==1) {
      r.init("neoModelMain");
    }
    else if (i<5) {
      r.init("neoModelSec");
    }
    else if (i==5) {
      r.init("neoImageMain");
    }
    else {
      r.init("neoImageSec");
    }
    if (i<5) goog.events.listen(r, X.neoEvent.events.PICK, this.onPick_.bind(this));
    if (i>4) {
      goog.events.listen(r, X.neoEvent.events.PICK3D, this.onPick3d_.bind(this));
      goog.events.listen(r, X.neoEvent.events.RESLICE, this.onReslice_.bind(this));
    }
    this['renderers'][i] = r;
    
    // propagate the camera movements between the scenes and volumes but don't call useless renderings with pointers
    if (i>4) {
      // the vol's pointers point to the scene's matrices
      this['renderers'][i]._camera._view = this['renderers'][i-4]._camera._view;
      this['renderers'][i]._camera._glview = this['renderers'][i-4]._camera._glview;
    }
  }
  
  // default config : all views hidden but 1 main
  for (var i=2 ; i<9 ; i++) {
    this['containers'][i].style.display = "none";
  }
  this._viewState = 0;
  
  // Listen for key events
  this._container.onkeydown = this.onKey_.bind(this);
  
  // we use the goog.events.MouseWheelHandler for a browser-independent
  // implementation
  this._mouseWheelHandler = new goog.events.MouseWheelHandler(this._container);
    
  this._mouseWheelListener = goog.events.listen(this._mouseWheelHandler,
        goog.events.MouseWheelHandler.EventType.MOUSEWHEEL, this.onMouseWheel_
            .bind(this));
  
};


/**
 * Reinitialises the viewer without memeory leak due to closure
 * 
 * @protected
 */
X.neoViewer.prototype.reinit = function() {

  this._topLevelObject = null;
  this._topLevelVolume = null;

  for (var i=1 ; i<9 ; i++) {
    // destroy the last renderers if they exist
    if (goog.isDefAndNotNull(this['renderers'][i]) && this['renderers'][i] instanceof X.renderer) {
      this['renderers'][i].destroy();
    }
    var r = new X.neoRenderer3D();
    r._container = this['containers'][i];
    if (i==1 || i==5) r.init("neoModelMain");
    else r.init("neoModelSec");
    if (i<5) goog.events.listen(r, X.neoEvent.events.PICK, this.onPick_.bind(this));
    this['renderers'][i] = r;
  }
  
};


X.neoViewer.prototype.onModified_ = function(event) {
  // To propagate object transforms in the multiple renderers
  for (var i = 5; i < 9; i++) {
    if (goog.isDefAndNotNull(this['renderers'][i]) && this['containers'][i].style.display!="none") {
      /*event._object._sliceX._dirty = true;
      event._object._sliceY._dirty = true;
      event._object._sliceZ._dirty = true;*/
      event._object._sliceX._texture._dirty = true;
      event._object._sliceY._texture._dirty = true;
      event._object._sliceZ._texture._dirty = true;
      event._object._sliceX._points._dirty = true;
      event._object._sliceY._points._dirty = true;
      event._object._sliceZ._points._dirty = true;
      this['renderers'][i].update_(event._object._sliceX);
      this['renderers'][i].update_(event._object._sliceY);
      this['renderers'][i].update_(event._object._sliceZ);
    }
  }
};


/**
 * Reinitialises the viewer without memeory leak due to closure
 * 
 * @protected
 */
X.neoViewer.prototype.switchSceneVolume = function(toVolume) {
  if (!goog.isDefAndNotNull(toVolume) || toVolume instanceof Boolean) throw new Error('Invalid input');
  if (toVolume) {
    if (this._volumeDisplay == true) return;
    this._volumeDisplay = true;
    this.updateViews(this._viewState);
  } else {
    if (this._volumeDisplay == false) return;
    this._volumeDisplay = false;
    this.updateViews(this._viewState);
  }
};


/**
 * Overload this function to execute code on keyboard events.
 * 
 * @param {Event} event The browser fired keyboard event.
 */
X.neoViewer.prototype.onKey = function(event) {

  // do nothing
  
};

/**
 * Callback for keyboard events on the window. This fires proper
 * X.event events.
 * 
 * @param {Event} event The browser fired event.
 * @private
 */
X.neoViewer.prototype.onKey_ = function(event) {
  window.console.log("Viewer key !");

  this['keyEvent'] = event; // buffering..
  eval("this.onKey(this['keyEvent'])");
  
  var keyCode = event.keyCode;
  if (keyCode==86) { //v key
    window.console.log("v pushed");
    if (goog.isDefAndNotNull(this._pickedObject)) {
      var opacity = ((Math.round(this._pickedObject._opacity*2)*5 + 10) % 15)/10;
      if (opacity==0) {
        this._pickedObject._visibility = false;
        this._pickedObject._opacity = 0;
      } else {
        this._pickedObject._visibility = true;
        this._pickedObject._opacity = opacity;
      }
    }
    this.render();
    event.preventDefault();
  }
  
};


/**
 * Overload this function to execute code on mouse wheel events.
 * 
 * @param {Event} event The browser fired mousewheel event.
 */
X.neoViewer.prototype.onMouseWheel = function(event) {

  // do nothing
  
};


/**
 * Internal callback for mouse wheel events on the associated DOM element. Mouse wheel change the picked object's transparence.
 * 
 * @param {Event} event The browser fired event.
 * @protected
 */
X.neoViewer.prototype.onMouseWheel_ = function(event) {

  this['mouseWheelEvent'] = event;
  eval("this.onMouseWheel(this['mouseWheelEvent'])");
  
  // make sure, deltaY is defined
  if (!goog.isDefAndNotNull(event.deltaY)) {
    event.deltaY = 0;
  }
  window.console.log("mouse_wheel: "+event.deltaY);
  if (goog.isDefAndNotNull(this._pickedObject)) {
    var opacity = this._pickedObject._opacity - event.deltaY/50;
    if (opacity<0) opacity = 0;
    if (opacity>1) opacity = 1;
    if (opacity == this._pickedObject._opacity) return; // no new rendering if no change (for optimization)
    if (opacity==0) {
      this._pickedObject._visibility = false;
      this._pickedObject._opacity = 0;
    } else {
      this._pickedObject._visibility = true;
      this._pickedObject._opacity = opacity;
    }
    this.render();
  }
  
  // prevent any other action (like scrolling..)
  // event.preventDefault();
  
};


/**
 * External callback for focus events on the associated DOM element.
 * 
 * @param {number} id The focused renderer's id.
 * @public
 */
X.neoViewer.prototype.onFocus = function(id) {

 // for overloading

};


/**
 * Internal callback for focus events on the associated DOM element. Focus can be used for the GUI outside the framework.
 * 
 * @param {number} id The focused renderer's id.
 * @protected
 */
X.neoViewer.prototype.onFocus_ = function(id, event) {
  if(!goog.isDefAndNotNull(id) || isNaN(id)) throw new Error("Invalid input");
  eval("this.onFocus("+id+")");
  this._focusedRenderer = id;
  if (id>4 && event.button == goog.events.BrowserEvent.MouseButton.LEFT) { // volume
    var sliceid = this['renderers'][id].pick(event.offsetX, event.offsetY);
	  if (sliceid>0) {
	    var slice = this.getSlice_(sliceid);
	    if (slice._caption=="X") this['renderers'][id]._interactor._sliceActive = 0;
	    if (slice._caption=="Y") this['renderers'][id]._interactor._sliceActive = 1;
	    if (slice._caption=="Z") this['renderers'][id]._interactor._sliceActive = 2;
	  } else {
	    this['renderers'][id]._interactor._sliceActive = null;
	  }
  }
};

/**
 * Get the last focused renderer.
 * 
 * @return {number} The id of the focused renderer, -1 if no renderer focused.
 */
X.neoViewer.prototype.__defineGetter__('focus', function() {

  return this._focusedRenderer;
  
});


/**
 * Update the renderers configuration.
 * 
 * @param {number} config_number The configuration number. For the moment between 0 and 3.
 * @protected
 */
X.neoViewer.prototype.updateViews = function(config_number) {

  // for visible renderers we must resize them, place them, add the scene in them and render them
  // for the unvisible ones, we must hide them and empty them (remote the scene)

  if (config_number==0) // 1 main view only
  {
    if(!this._volumeDisplay) {
      // scene
      this['containers'][1].style.width = "100%";
      this['containers'][1].style.height = "100%";
      this['containers'][1].style.left = "0%";
      this['containers'][1].style.top = "0%";
      this['containers'][1].style.display = "block";
      this['renderers'][1].resize();
      if (goog.isDefAndNotNull(this._topLevelObject) && this._topLevelObject instanceof X.object) this['renderers'][1].add(this._topLevelObject);
      
      for (var i=2 ; i<9 ; i++) {
        this['containers'][i].style.display = "none";
        this['renderers'][i].empty();
      }
    } else {
      // volume
      this['containers'][5].style.width = "100%";
      this['containers'][5].style.height = "100%";
      this['containers'][5].style.left = "0%";
      this['containers'][5].style.top = "0%";
      this['containers'][5].style.display = "block";
      this['renderers'][5].resize();
      if (goog.isDefAndNotNull(this._topLevelVolume) && this._topLevelVolume instanceof X.neoVolume) this['renderers'][5].add(this._topLevelVolume);
      
      for (var i=1 ; i<9 ; i++) {
        if (i==5) continue;
        this['containers'][i].style.display = "none";
        this['renderers'][i].empty();
      }
    }
    
  } else if (config_number==1) { // 1 great views, 2 minis
    if(!this._volumeDisplay) {
      // scene
      this['containers'][1].style.width = "66.6%";
      this['containers'][1].style.height = "100%";
      this['containers'][1].style.left = "0%";
      this['containers'][1].style.top = "0%";
      this['containers'][1].style.display = "block";
      this['renderers'][1].resize();
      if (goog.isDefAndNotNull(this._topLevelObject) && this._topLevelObject instanceof X.object) this['renderers'][1].add(this._topLevelObject);
      
      for (var i=2 ; i<5 ; i++) {
        if (i==3) continue; //only containers 2 and 4
        this['containers'][i].style.width = "33.3%";
        this['containers'][i].style.height = "50%";
        this['containers'][i].style.left = "66.6%";
        this['containers'][i].style.top = (i/2-1)*50+"%";
        this['containers'][i].style.display = "block";
        this['renderers'][i].resize();
        if (goog.isDefAndNotNull(this._topLevelObject) && this._topLevelObject instanceof X.object) this['renderers'][i].add(this._topLevelObject);
      }
      
      for (var i = 1; i < 9; i++) {
        if (i<5) continue;
        this['containers'][i].style.display = "none";
        this['renderers'][i].empty();
      }
    } else {
      // volume
      this['containers'][5].style.width = "66.6%";
      this['containers'][5].style.height = "100%";
      this['containers'][5].style.left = "0%";
      this['containers'][5].style.top = "0%";
      this['containers'][5].style.display = "block";
      this['renderers'][5].resize();
      if (goog.isDefAndNotNull(this._topLevelVolume) && this._topLevelVolume instanceof X.neoVolume) this['renderers'][5].add(this._topLevelVolume);
      
      for (var i=6 ; i<9 ; i++) {
        if (i==7) continue; //only containers 6 and 8
        this['containers'][i].style.width = "33.3%";
        this['containers'][i].style.height = "50%";
        this['containers'][i].style.left = "66.6%";
        this['containers'][i].style.top = (i/2-3)*50+"%";
        this['containers'][i].style.display = "block";
        this['renderers'][i].resize();
        if (goog.isDefAndNotNull(this._topLevelVolume) && this._topLevelVolume instanceof X.neoVolume) this['renderers'][i].add(this._topLevelVolume);
      }
      
      for (var i = 1; i < 9; i++) {
        if (i==5 || i==6 || i==8) continue;
        this['containers'][i].style.display = "none";
        this['renderers'][i].empty();
      } 
    }
  } else if (config_number==2) { // 4 equal views
    if(!this._volumeDisplay) {
      // scene
      for (var i=1 ; i<5 ; i++) {
      this['containers'][i].style.width = "50%";
      this['containers'][i].style.height = "50%";
      this['containers'][i].style.position = "absolute";
      this['containers'][i].style.left = (i%2)*50+"%";
      this['containers'][i].style.top = (i==2||i==3)?0:50+"%";
      this['containers'][i].style.display = "block";
      this['renderers'][i].resize();
      if (goog.isDefAndNotNull(this._topLevelObject) && this._topLevelObject instanceof X.object) this['renderers'][i].add(this._topLevelObject);
      }
      
      for (var i = 5; i < 9; i++) {
        this['containers'][i].style.display = "none";
        this['renderers'][i].empty();
      } 
    } else {
      // volume
      for (var i=5 ; i<9 ; i++) {
      this['containers'][i].style.width = "50%";
      this['containers'][i].style.height = "50%";
      this['containers'][i].style.position = "absolute";
      this['containers'][i].style.left = ((i-4)%2)*50+"%";
      this['containers'][i].style.top = (i==6||i==7)?0:50+"%";
      this['containers'][i].style.display = "block";
      this['renderers'][i].resize();
      if (goog.isDefAndNotNull(this._topLevelVolume) && this._topLevelVolume instanceof X.neoVolume) this['renderers'][i].add(this._topLevelVolume);
      }
      
      for (var i = 1; i < 5; i++) {
        this['containers'][i].style.display = "none";
        this['renderers'][i].empty();
      }       
    }
    
  } else if (config_number==3) { // 1 great views, 3 minis
    if(!this._volumeDisplay) {
      // scene
      this['containers'][1].style.width = "75%";
      this['containers'][1].style.height = "100%";
      this['containers'][1].style.left = "0%";
      this['containers'][1].style.top = "0%";
      this['containers'][1].style.display = "block";
      this['renderers'][1].resize();
      if (goog.isDefAndNotNull(this._topLevelObject) && this._topLevelObject instanceof X.object) this['renderers'][1].add(this._topLevelObject);

      for (var i=2 ; i<5 ; i++) {
        this['containers'][i].style.width = "25%";
        this['containers'][i].style.height = "33.3%";
        this['containers'][i].style.left = "75%";
        this['containers'][i].style.top = 33.3*(i-2)+"%";
        this['containers'][i].style.display = "block";
        this['renderers'][i].resize();
        if (goog.isDefAndNotNull(this._topLevelObject) && this._topLevelObject instanceof X.object) this['renderers'][i].add(this._topLevelObject);
      }
      
      for (var i = 5; i < 9; i++) {
        this['containers'][i].style.display = "none";
        this['renderers'][i].empty();
      }
    } else {
      // volume
      this['containers'][5].style.width = "75%";
      this['containers'][5].style.height = "100%";
      this['containers'][5].style.left = "0%";
      this['containers'][5].style.top = "0%";
      this['containers'][5].style.display = "block";
      this['renderers'][5].resize();
      if (goog.isDefAndNotNull(this._topLevelVolume) && this._topLevelVolume instanceof X.neoVolume) this['renderers'][5].add(this._topLevelVolume);

      for (var i=6 ; i<9 ; i++) {
        this['containers'][i].style.width = "25%";
        this['containers'][i].style.height = "33.3%";
        this['containers'][i].style.left = "75%";
        this['containers'][i].style.top = 33.3*(i-6)+"%";
        this['containers'][i].style.display = "block";
        this['renderers'][i].resize();
        if (goog.isDefAndNotNull(this._topLevelVolume) && this._topLevelVolume instanceof X.neoVolume) this['renderers'][5].add(this._topLevelVolume);
      }
      
      for (var i = 1; i < 5; i++) {
        this['containers'][i].style.display = "none";
        this['renderers'][i].empty();
      }   
    }
    
  } else if (config_number==4) { // 1 great views, 3 minis images
    if(!this._volumeDisplay) {
      // scene
      this['containers'][1].style.width = "75%";
      this['containers'][1].style.height = "100%";
      this['containers'][1].style.left = "0%";
      this['containers'][1].style.top = "0%";
      this['containers'][1].style.display = "block";
      this['renderers'][1].resize();
      if (goog.isDefAndNotNull(this._topLevelObject) && this._topLevelObject instanceof X.object) this['renderers'][1].add(this._topLevelObject);
      
      for (var i = 2; i < 6; i++) {
        this['containers'][i].style.display = "none";
        this['renderers'][i].empty();
      }   
    } else {
      // volume
      this['containers'][5].style.width = "75%";
      this['containers'][5].style.height = "100%";
      this['containers'][5].style.left = "0%";
      this['containers'][5].style.top = "0%";
      this['containers'][5].style.display = "block";
      this['renderers'][5].resize();
      if (goog.isDefAndNotNull(this._topLevelVolume) && this._topLevelVolume instanceof X.neoVolume) this['renderers'][5].add(this._topLevelVolume);
      
      for (var i = 1; i < 5; i++) {
        this['containers'][i].style.display = "none";
        this['renderers'][i].empty();
      }  
    }
    
    for (var i=6 ; i<9 ; i++) {
      this['containers'][i].style.width = "25%";
      this['containers'][i].style.height = "33.3%";
      this['containers'][i].style.left = "75%";
      this['containers'][i].style.top = 33.3*(i-6)+"%";
      this['containers'][i].style.display = "block";
      this['renderers'][i].resize();
      if (goog.isDefAndNotNull(this._topLevelVolume) && this._topLevelVolume instanceof X.neoVolume) this['renderers'][i].add(this._topLevelVolume);
    }
    
  } else throw new Error("Invalid config");
  
  this._viewState = config_number;
  
  this.render();

}


/**
 * Render the view's renderers.
 * 
 * @protected
 */
X.neoViewer.prototype.render = function() {
  for (var i in this['renderers']) {
    // render the renderers
    if (goog.isDefAndNotNull(this['renderers'][i]) && this['containers'][i].style.display!="none") {
      this['renderers'][i].render();
    }
  }
};


/**
 * Set the scene object for this viewer
 * 
 * @param {?X.object} object The object to set as top level object.
 * @protected
 */
X.neoViewer.prototype.set = function(object) {
  if (!goog.isDefAndNotNull(object) || !(object instanceof X.object)) {
    throw new Error('This is not a valid object');
  }
  // check if volume or scene
  if (object._caption == "Image" && object._children.length==1 && object._children[0] instanceof X.neoVolume) {
  
    // stop listenning the old volume
    goog.events.unlisten(this._topLevelVolume, X.neoEvent.events.MULTIMODIFIED, this.onModified_);
    
    // VOLUME
    this._topLevelVolume = object._children[0];
    this.fitZoom_();
    
    // set in the renderers
    for (var i = 5; i < 9; i++) {
      // set only in the visible renderers
      if (goog.isDefAndNotNull(this['renderers'][i])) {
        this['renderers'][i].empty();
        // we could also set picked to null here, but it seems not necessary
        if (this['containers'][i].style.display!="none") {
          this['renderers'][i].add(object._children[0]);
          this['renderers'][i].render();
        }
      }
    }
    goog.events.listen(this._topLevelVolume, X.neoEvent.events.MULTIMODIFIED, this.onModified_.bind(this));
    this._topLevelVolume.modified();
    // clear the tree hiearchy
    eval("this.updateTree('')");
  }
  else {
    // SCENE
    this._topLevelObject = object;
    this.fitZoom_();
    
    // set in the renderers
    for (var i = 1; i < 5; i++) {
      // set only in the visible renderers
      if (goog.isDefAndNotNull(this['renderers'][i])) {
        this['renderers'][i].empty();
        // we could also set picked to null here, but it seems not necessary
        if (this['containers'][i].style.display!="none") {
          this['renderers'][i].add(object);
          this['renderers'][i].render();
        }
      }
    }
    this._topLevelObject = object;
    this._topLevelObject.modified();
    
    // fit the zoom
    this.fitZoom_();
  
    // generate the tree hiearchy
    eval("this.updateTree(this.getHTML())");
  }
};

/**
 * Set the camera position so the object busy the mayor part of the screen
 * 
 * @protected
 */
X.neoViewer.prototype.fitZoom_ = function() {

  // get the global bounding box container every objects of the scene (not every group, every actor). We could read it in the renderer but we are not sure volume and scene have laready been displayed
  var topLevelObjects = new Array();
  if (goog.isDefAndNotNull(this._topLevelObject)) topLevelObjects.push(this._topLevelObject);
  if (goog.isDefAndNotNull(this._topLevelVolume)) topLevelObjects.push(this._topLevelVolume);

  var minx = +Infinity, miny = +Infinity, minz = +Infinity;
  var maxx = -Infinity, maxy = -Infinity, maxz = -Infinity;
  
  function findAABB(obj) {
    // TODO : ADD TRANSFORMS IN COMPUTATIONS !
    if (!goog.isDefAndNotNull(obj._points) || obj._points._triplets.length==0 || obj._children.length>0) {
      // not an actor
      var children = obj._children;
      for (var j in children) findAABB(children[j]);
    } else {
      var thispoints = obj._points;
      if (thispoints._minA < minx) minx = thispoints._minA;
      if (thispoints._minB < miny) miny = thispoints._minB;
      if (thispoints._minC < minz) minz = thispoints._minC;
      if (thispoints._maxA > maxx) maxx = thispoints._maxA;
      if (thispoints._maxB > maxy) maxy = thispoints._maxB;
      if (thispoints._maxC > maxz) maxz = thispoints._maxC;
    }
  }
  
  for (var i in topLevelObjects) {
    var rootObject = topLevelObjects[i];
    findAABB(rootObject);
  }
  
  // compute the camera distance from the AABB and not taking care of the camera direction
  var minT = Math.min(minx, miny, minz);
  var maxT = Math.max(maxx, maxy, maxz);
  
  if (minT == +Infinity || maxT == -Infinity) return; // scene empty of actors, do nothing
  
  for (var i in this['renderers']) {
    var camera = this['renderers'][i]._camera;
    var angle = camera._fieldOfView*3.1415/180;
    
    // Trigonometry : tan(angle) = ((max-min)/2) / (position)
    var position = (maxT-minT) / (2*Math.tan(angle));
    if (camera._position.z==position) return; // nothing to do
    
    if (camera._type=="neoModelSec") {
      var zoomFactor = camera.position.z-position; // >0 if zoom in
      coef = zoomFactor/camera._zoomFactor;
      camera._perspective[0] = camera._perspective[0]*coef;
      camera._perspective[5] = camera._perspective[5]*coef;
      camera._perspective[10] = camera._perspective[10]*coef;
      camera._zoomFactor = camera._zoomFactor*coef;
    } else {
      var zoomVector = new goog.math.Vec3(0, 0, position-camera._position.z);
      var identity = X.matrix.createIdentityMatrix(4);
      var zoomMatrix = identity.translate(zoomVector);
      camera._view = new X.matrix(zoomMatrix.multiply(camera._view));
      camera._glview = new Float32Array(camera._view.flatten());
    }
    window.console.log(position);
  }
};


/**
 * Add an object in this viewer
 * 
 * @param {?X.object} object The object to add in the scene.
 * @protected
 */
X.neoViewer.prototype.add = function(object) {
  if (!goog.isDefAndNotNull(object) || !(object instanceof X.object)) {
    throw new Error('This is not a valid object');
  }
  
  // check if volume or scene
  if (object._caption == "Image" && object._children.length==1 && object._children[0] instanceof X.neoVolume) {
    // VOLUME
    this._topLevelVolume = object._children[0];
    this.fitZoom_();
  
    // set in the renderers
    for (var i = 5; i < 9; i++) {
      // set only in the visible renderers
      if (goog.isDefAndNotNull(this['renderers'][i])) {
        if (this['renderers'][i]._topLevelObjects.length>0) return; // we do not erase the old volume if there is one !
        // we could also set picked to null here, but it seems not necessary
        if (this['containers'][i].style.display!="none") {
          this['renderers'][i].add(object._children[0]);
          this['renderers'][i].render();
        }
      }
    }
    this._topLevelVolume.modified();
  }
  else {
    // SCENE
    if (this._topLevelObject._caption != object._caption) throw new Error('This object is not compatible with the current scene');
    this._topLevelObject = object;
    this.fitZoom_();
    
    // reduce an object's childhood
    function reduce(obj) {
      var children = obj._children;
      for (var i = 0; i < children.length; i++) {
        var number_of_equal_actors = 0; // for renaming
        var number_of_merges = 0;
        for (var j = i+1; j < children.length; j++) {
          if (children[i]._caption == children[j]._caption) {
            // 2 groups or actors with the same name
            if (children[i]._points._triplets.length != 0 && children[j]._points._triplets.length != 0) {
              //2 actors : rename the copies
              number_of_equal_actors++;
              // check the name <thisname>+(+<number_of_equal_actors>+) is free, i.e. there is no copy of <thisname> in the previous hierarchy. If some exist, we take an index higher the their max
              
              // find if an homonym exists
              var found = false;
              for (var k in children) {
                  if (children[k]._caption == children[j]._caption + "(" + number_of_equal_actors + ")") {
                    found = true;
                    break;
                  }
              }
              if (found) {
                // find the max index
                for (var k in children) {
                    var caption = children[k]._caption;
                    caption = caption.split("(");
                    var number = caption.pop(); // we got "<number>)" for the moment
                    number = number.split(")");
                    number = parseInt(number.shift(),10);
                    caption = caption.join("(");
                    if (children[k]._caption == children[j]._caption && number>number_of_equal_actors) number_of_equal_actors = number;
                }
              }
              children[j]._caption = children[j]._caption + "(" + number_of_equal_actors + ")";
            } else if (children[i]._points._triplets.length == 0 && children[j]._points._triplets.length == 0) {
              //2 groups : merge them and destroy the 2nd group
              children[i]._children = children[i]._children.concat(children[j]._children);
              children.splice(j,1);
              number_of_merges++;
            }     
          }
        }
        // take care of the children of the merged groups one we are sure nothing more will merge inside
        if (number_of_merges>0) reduce(children[i]);
      }
    }
    
    var rootchildren = object._children;
    for (var i in rootchildren) this._topLevelObject._children.push(rootchildren[i]);
    // reduce the hierarchy
    reduce(this._topLevelObject);
    this._topLevelObject.modified();
  }  
  
  // generate the tree hiearchy
  eval("this.updateTree(this.getHTML())");
};



/**
 * Repercutes the viewer's resizing on the renderers
 * 
 * @protected
 */
X.neoViewer.prototype.resize = function() {
  for (var i in this['renderers']) {
    this['renderers'][i].resize();
    //this['renderers'][i].init(this['config']['viewsConfig'][i]);
    this['renderers'][i].render();
  }
};


/**
 * Callback for the hierarchy visualization when the scene structure is modified
 * 
 * @param {string} htmlcode The ul representing the scene hierarchy. See technical doc for more informations about it's schedule.
 * @public
 */
X.neoViewer.prototype.updateTree = function(htmlcode) {

  // Nothing here

};


/**
 * Get the existing X.object with the given id.
 * 
 * @param {!number} id The object's id.
 * @return {?X.object} The requested X.object or null if it was not found.
 * @throws {Error} If the given id was invalid.
 * @public
 */
X.neoViewer.prototype.get = function(id) {
  var object=null;
  
  function find(myobj) {
    if (myobj._id==id) object=myobj;
    if (myobj._children.length>0) {
      for (var i in myobj._children) {
        find(myobj._children[i]);
      }
    }
  }
  
  if (goog.isDefAndNotNull(this._topLevelObject) && this._topLevelObject instanceof X.object) {
    if (goog.isDefAndNotNull(id)) {
      find(this._topLevelObject);
    }
    else object=this._topLevelObject;
  }
  if (object==null) throw new Error("Object not found");
  return object;
}


/**
 * Get the existing slice with the given id.
 * 
 * @param {!number} id The object's id.
 * @return {?X.neoVolume} The requested X.object or null if it was not found.
 * @throws {Error} If the given id was invalid.
 * @public
 */
X.neoViewer.prototype.getSlice_ = function(id) {
  var object=null;
  
  if (goog.isDefAndNotNull(this._topLevelVolume) && this._topLevelVolume instanceof X.neoVolume) {
    if (goog.isDefAndNotNull(id)) {
      if (this._topLevelVolume._children[0]._id == id) object = this._topLevelVolume._children[0];
      else if (this._topLevelVolume._children[1]._id == id) object = this._topLevelVolume._children[1];
      else if (this._topLevelVolume._children[2]._id == id) object = this._topLevelVolume._children[2];
    }
    else object = this._topLevelVolume;
  }
  if (object == null) throw new Error("Slice not found");
  return object;
}


/**
 * Highlight the X.object with the given id.
 * 
 * @param {!number} id The object's id.
 * @throws {Error} If the given id was invalid.
 * @public
 */
X.neoViewer.prototype.highlight = function(id) {
  function rechighlight(myobj,forced) {
    // highlight this if it has the good id or if forced (i.e. it's child of the good id
    var forcedchildren = false;
    if (forced || myobj._id == id) {
      myobj._opacity = 1-(1-myobj._opacity)/10;
      forcedchildren = true;
    } else {
      myobj._opacity = myobj._opacity/10;
    }
    // go through children
    if (myobj._children.length>0) {
      for (var i in myobj._children) {
        rechighlight(myobj._children[i], forcedchildren);
      }
    }
  }
  rechighlight(this._topLevelObject, false);
}


/**
 * Unhighlight the X.object with the given id.
 * 
 * @param {!number} id The object's id.
 * @throws {Error} If the given id was invalid.
 * @public
 */
X.neoViewer.prototype.unhighlight = function(id) {
  function recunhighlight(myobj,forced) {
    // highlight this if it has the good id or if forced (i.e. it's child of the good id
    var forcedchildren = false; // we force the transformation for the descendants of the good node
    if (forced || myobj._id == id) {
      myobj._opacity = 1-(1-myobj._opacity)*10;
      forcedchildren = true;
    } else {
      myobj._opacity = myobj._opacity*10;
    }
    // go through children
    if (myobj._children.length>0) {
      for (var i in myobj._children) {
        recunhighlight(myobj._children[i], forcedchildren);
      }
    }
  }
  recunhighlight(this._topLevelObject, false);
}


X.neoViewer.prototype.getHTML = function() {
  var output = "<ul>";
  function generateInnerHTML(myobj) {
    if (myobj._children.length>0) {
      if (myobj._points.length==0) {
        if (myobj._caption.toLowerCase().indexOf("scene")!=-1) output = output + '<li id="node_'+myobj._id+'" rel="scene"><a href="#">'+myobj._caption+'</a><ul>';
        else output = output + '<li id="node_'+myobj._id+'" rel="group"><a href="#">'+myobj._caption+'</a><ul>';
      }
      else output = output + '<li id="node_'+myobj._id+'" rel="actor"><a href="#">'+myobj._caption+'</a><ul>'
      for (var i in myobj._children) {
        generateInnerHTML(myobj._children[i]);
      }
      output = output + '</ul></li>';
    }
    else {
      if (myobj._points.length==0) {
        if (myobj._caption.toLowerCase().indexOf("scene")!=-1) output = output + '<li id="node_'+myobj._id+'" rel="scene"><a href="#">'+myobj._caption+'</a></li>';
        else output = output + '<li id="node_'+myobj._id+'" rel="group"><a href="#">'+myobj._caption+'</a></li>';
      }
      else output = output + '<li id="node_'+myobj._id+'" rel="actor"><a href="#">'+myobj._caption+'</a></li>';
    }
  }
  if (goog.isDefAndNotNull(this._topLevelObject) && this._topLevelObject instanceof X.object) generateInnerHTML(this._topLevelObject);
  output = output + "</ul>";
  return output;
}


/**
 * Get the renderers
 * @param {number} number The renderer number.
 * @return {?X.renderer} the desired renderer.
 */
X.neoViewer.prototype.getARenderer = function(number) {
  if (!goog.isDefAndNotNull(number) || number<1 || number>4) {
    throw new Error("Nombre non valide");
  } else {
    return this['renderers'][number];
  }
};


/**
 * Public method for executing code at picking.
 * @param {string} id The id of the picked object. -1 if no selection
 * @public
 */
X.neoViewer.prototype.onPick = function(id) {

};


/**
 * Picking handler
 * @param {!X.neoEvent.PickEvent} event The pick event.
 * @protected
 */
X.neoViewer.prototype.onPick_ = function(event) {
  if (event._type=="object") {
    var obj = event._obj;
    // unselect & restore the last picked object (i.e. cancel the last selection)
    if (goog.isDefAndNotNull(this._pickedObject) && goog.isDefAndNotNull(this._pickedObjectColor)) {
      this._pickedObject._color = this._pickedObjectColor;
      this._pickedObjectColor = null;
    }
    // if now new object selected or if the new is equal to the old one : delete the selection
    if (!goog.isDefAndNotNull(obj) || (goog.isDefAndNotNull(obj) && goog.isDefAndNotNull(this._pickedObject) && obj._id==this._pickedObject._id) ) this._pickedObject = null;
    // else if there is a new object, try to add a new selection
    else if (goog.isDefAndNotNull(obj)) {
      this._pickedObjectColor = obj._color;
      this._pickedObject = obj;
      obj._color = [1, 0, 0];
    }
    // callback
    if (!!this._pickedObject) eval("this.onPick("+this._pickedObject._id+")");
    else eval("this.onPick('-1')");
  } else if (event._type=="slice") {
    var slice = event._obj;
    if (!goog.isDefAndNotNull(slice)) {
      this._pickedSlice = null;
    }
    else this._pickedSlice = slice;
    for (var i = 5; i <9; i++) {
      this['renderers'][i]._interactor._sliceActive = true;
    }
  } else return
  this.render();
};


/**
 * Public method for executing code at 3D picking.
 * @param {number} x The x-coordinate of the picked point
 * @param {number} y The y-coordinate of the picked point
 * @param {number} z The z-coordinate of the picked point
 * @public
 */
X.neoViewer.prototype.onPick3d = function(x, y, z) {

};


/**
 * 3D Picking handler
 * @param {!X.neoEvent.Pick3dEvent} event The pick event.
 * @protected
 */
X.neoViewer.prototype.onPick3d_ = function(event) {
  if (event._type=="3d") {
    if (!goog.isDefAndNotNull(this._topLevelVolume)) return;
    this._topLevelVolume.slicing2_(event._x,event._y, event._z);
  
    // we buffer for callback
    this['3dx'] = event._x;
    this['3dy'] = event._y;
    this['3dz'] = event._z;
    // callback
    eval("this.onPick("+this['3dx']+", "+this['3dy']+", "+this['3dz']+")");
    
    this.render();
  }
};


/**
 * Public method for executing code at reslicing.
 * @param {number} dir 
 * @param {number} delta
 * @public
 */
X.neoViewer.prototype.onReslice = function(dir, delta) {

};


/**
 * Reslicing handler
 * @param {!X.neoEvent.ResliceEvent} event The pick event.
 * @protected
 */
X.neoViewer.prototype.onReslice_ = function(event) {
  if (!goog.isDefAndNotNull(this._topLevelVolume)) return;
  this._topLevelVolume.slicing3_(event._dir, event._z);

  // we buffer for callback
  this['sliceDir'] = event._dir;
  this['sliceDelta'] = event._z;
  // callback
  eval("this.onReslice("+this['3sliceDir']+", "+this['3sliceDelta']+")");
  
  this._topLevelVolume.modified();
  this.render();
};


/**
 * Picking function
 * @param {!number} id The id of the object we want to select. Selection = picking.
 * @protected
 */
X.neoViewer.prototype.select = function(id) {
  var obj = this.get(id);
  // unselect & restore the last picked object (i.e. cancel the last selection)
  if (goog.isDefAndNotNull(this._pickedObject) && goog.isDefAndNotNull(this._pickedObjectColor)) {
    this._pickedObject._color = this._pickedObjectColor;
    this._pickedObjectColor = null;
  }
  // if now new object selected or if the new is equal to the old one : delete the selection
  if (!goog.isDefAndNotNull(obj) || (goog.isDefAndNotNull(obj) && goog.isDefAndNotNull(this._pickedObject) && obj._id==this._pickedObject._id) ) this._pickedObject = null;
  // else if there is a new object, try to add a new selection
  else if (goog.isDefAndNotNull(obj)) {
    this._pickedObjectColor = obj._color;
    this._pickedObject = obj;
    obj._color = [1, 0, 0];
  }
  // callback
  if (!!this._pickedObject) eval("this.onPick("+this._pickedObject._id+")");
  else eval("this.onPick('-1')");
  
  this.render();
};


/**
 * Get the container of this neoviewer.
 * 
 * @return {!Element|HTMLBodyElement} The container of this renderer.
 * @public
 */
X.neoViewer.prototype.__defineGetter__('container', function() {

  return this._container;
  
});


/**
 * Set the container for this neoviewer. This has to happen before
 * X.renderer.init() is called.
 * 
 * @param {!string|Element|HTMLBodyElement} container Either an ID to a DOM
 *          container or the DOM element itself.
 * @throws {Error} An error, if the given container is invalid.
 * @public
 */
X.neoViewer.prototype.__defineSetter__('container', function(container) {

  // check if a container is passed
  if (!goog.isDefAndNotNull(container)) {
    
    throw new Error('An ID to a valid container (<div>..) is required.');
    
  }
  
  // check if the passed container is really valid
  var _container = container;
  
  // if an id is given, try to get the corresponding DOM element
  if (goog.isString(_container)) {
    
    _container = goog.dom.getElement(container);
    
  }
  
  // now we should have a valid DOM element
  if (!goog.dom.isElement(_container)) {
    
    throw new Error('Could not find the given container.');
    
  }
  
  this._container = _container;
  
});


// export symbols (required for advanced compilation)
goog.exportSymbol('X.neoViewer', X.neoViewer);
goog.exportSymbol('X.neoViewer.prototype.init', X.neoViewer.prototype.init);
goog.exportSymbol('X.neoViewer.prototype.reinit', X.neoViewer.prototype.reinit);
goog.exportSymbol('X.neoViewer.prototype.switchSceneVolume', X.neoViewer.prototype.switchSceneVolume);
goog.exportSymbol('X.neoViewer.prototype.set', X.neoViewer.prototype.set);
goog.exportSymbol('X.neoViewer.prototype.add', X.neoViewer.prototype.add);
goog.exportSymbol('X.neoViewer.prototype.resize', X.neoViewer.prototype.resize);
goog.exportSymbol('X.neoViewer.prototype.render', X.neoViewer.prototype.render);
goog.exportSymbol('X.neoViewer.prototype.get', X.neoViewer.prototype.get);
goog.exportSymbol('X.neoViewer.prototype.getHTML', X.neoViewer.prototype.getHTML);
goog.exportSymbol('X.neoViewer.prototype.getARenderer', X.neoViewer.prototype.getARenderer);
goog.exportSymbol('X.neoViewer.prototype.updateTree', X.neoViewer.prototype.updateTree);
goog.exportSymbol('X.neoViewer.prototype.updateViews', X.neoViewer.prototype.updateViews);
goog.exportSymbol('X.neoViewer.prototype.onPick', X.neoViewer.prototype.onPick);
goog.exportSymbol('X.neoViewer.prototype.onPick3d', X.neoViewer.prototype.onPick3d);
goog.exportSymbol('X.neoViewer.prototype.onReslice', X.neoViewer.prototype.onReslice);
goog.exportSymbol('X.neoViewer.prototype.onKey', X.neoViewer.prototype.onKey);
goog.exportSymbol('X.neoViewer.prototype.onMouseWheel', X.neoViewer.prototype.onMouseWheel);
goog.exportSymbol('X.neoViewer.prototype.onFocus', X.neoViewer.prototype.onFocus);
goog.exportSymbol('X.neoViewer.prototype.highlight', X.neoViewer.prototype.highlight);
goog.exportSymbol('X.neoViewer.prototype.unhighlight', X.neoViewer.prototype.unhighlight);
goog.exportSymbol('X.neoViewer.prototype.select', X.neoViewer.prototype.select);
