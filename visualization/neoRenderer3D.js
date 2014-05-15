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
goog.provide('X.neoRenderer3D');

// requires
goog.require('X.renderer3D');
goog.require('X.neoModelInteractor');
goog.require('X.neoImageInteractor');
goog.require('X.neoLoader');
goog.require('goog.math.Vec3');


/**
 * Create a 3D neoRenderer.
 * 
 * @constructor
 * @extends X.renderer3D
 */
X.neoRenderer3D = function() {
  //
  // call the standard constructor of X.renderer3D
  goog.base(this);
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'neoRenderer3D';
  
  /**
   * The configuration of this renderer.
   * 
   * @enum {boolean}
   */
  this['config'] = {
    'PROGRESSBAR_ENABLED': true,
    'PICKING_ENABLED': true,
    'PICKING3D_ENABLED': true,
    'MEASURING_ENABLED': true,
    'ORDERING_ENABLED': true,
    'STATISTICS_ENABLED': false
  };
  
  this._measuresStarts = new Array();
  
  this._measuresEnds = new Array();
  
  this._measures = new Array();
  
};
// inherit from X.renderer
goog.inherits(X.neoRenderer3D, X.renderer3D);


/**
 * @inheritDoc
 */
X.neoRenderer3D.prototype.init = function(interactorType) {

  var _contextName = "experimental-webgl";

  // create the canvas
  var _canvas = goog.dom.createDom('canvas');
  
  //
  // append it to the container
  goog.dom.appendChild(this._container, _canvas);
  
  // the container might have resized now, so update our width and height
  // settings
  this._width = this._container.clientWidth;
  this._height = this._container.clientHeight;
  
  // width and height can not be set using CSS but via object properties
  _canvas.width = this._width;
  _canvas.height = this._height;
  _canvas.style.position = "relative";
  _canvas.style.zIndex = "2";
  _canvas.tabIndex = 0;
  

  // --------------------------------------------------------------------------
  //
  // Viewport initialization
  //
  
  //
  // Step1: Get Context of canvas
  //
  try {
    
    var _context = _canvas.getContext(_contextName);
    
    if (!_context) {
      
      // this exception triggers the display of the error message
      // because the context creation can either fail with an exception
      // or return a NULL context
      throw new Error();
      
    }
    
  } catch (e) {
    
    // Canvas2D is not supported with this browser/machine/gpu
    
    // attach a message to the container's inner HTML
    var _style = "color:green;font-family:sans-serif;";
    var _msg = 'We are sorry but the ' +
        _contextName +
        ' context is <strong>not supported</strong> on this machine so no visualization is possible. If your computer is recent please try to download Google Chrome or update your graphic pilotes, else contact 3DNeovision for further informations.';
    this._container.innerHTML = '<h3 style="' + _style +
        '">Oooops..</h3><p style="' + _style + '">' + _msg + '</p>';
    
    // .. and throw an exception
    throw new Error(_msg);
    
  }
  
  //
  // Step 1b: Configure the X.loader
  //
  this._loader = new X.neoLoader();
  
  // listen to a progress event which gets fired during loading whenever
  // progress was made
  goog.events.listen(this._loader, X.event.events.PROGRESS, this.onProgress
      .bind(this));
  
  //
  // Step 1c: Register the created canvas to this instance
  //
  this._canvas = _canvas;
  
  //
  // Step 1d: Register the created context to this instance
  //
  this._context = _context;
  
  //
  // Step2: Configure the context and the viewport
  //
  
  //
  // create a new interactor
  if (!goog.isDefAndNotNull(interactorType)) var _interactor = new X.interactor(this._canvas);
  else {
    if (interactorType=="neoModelMain") var _interactor = new X.neoModelInteractor(this._canvas, false);
    else if (interactorType=="neoModelSec") var _interactor = new X.neoModelInteractor(this._canvas, true);
    else if (interactorType=="neoImageMain") var _interactor = new X.neoImageInteractor(this._canvas, false);
    else if (interactorType=="neoImageSec") var _interactor = new X.neoImageInteractor(this._canvas, true);
    else var _interactor = new X.interactor(this._canvas);
  }
  
  // in the 2d case, create a 2d interactor (of course..)
  if (_contextName == '2d') {
    
    _interactor = new X.interactor2D(this._canvas);
    
  }
  // initialize it and..
  _interactor.init();
  
  // .. listen to resetViewEvents
  goog.events.listen(_interactor, X.event.events.RESETVIEW,
      this.resetViewAndRender.bind(this));
  // .. listen to hoverEvents
  goog.events.listen(_interactor, X.event.events.HOVER, this.onHover_
      .bind(this));
  // .. listen to scroll events
  goog.events.listen(_interactor, X.event.events.SCROLL, this.onScroll_
      .bind(this));
	  
  if (this['config']['PICKING_ENABLED']) {
    goog.events.listen(_interactor, X.neoEvent.events.PICK, this.onPick_
	  .bind(this));
  }
  
  if (this['config']['PICKING3D_ENABLED']) {
    goog.events.listen(_interactor, X.neoEvent.events.PICK3D, this.onPick3d_
	  .bind(this));
  }
  
  if (this['config']['MEASURING_ENABLED']) {
    goog.events.listen(_interactor, X.neoEvent.events.MEASURE, this.onMeasure_
	  .bind(this));
  }
  
  goog.events.listen(_interactor, X.neoEvent.events.RESLICE, this.onReslice_.bind(this));

  // .. and finally register it to this instance
  this._interactor = _interactor;
  
  //
  // create a new camera
  // width and height are required to calculate the perspective
  var _camera = new X.neoCamera3D(interactorType, this._width, this._height);
  
  if (_contextName == '2d') {
    _camera = new X.camera2D(this._width, this._height);
  }
  // observe the interactor for user interactions (mouse-movements etc.)
  _camera.observe(this._interactor);
  // ..listen to render requests from the camera
  // these get fired after user-interaction and camera re-positioning to re-draw
  // all objects
  goog.events.listen(_camera, X.event.events.RENDER, this.render_.bind(this,
      false, false));
  
  //
  // attach all created objects as class attributes
  // should be one of the last things to do here since we use these attributes
  // to check if the initialization was completed successfully
  this._camera = _camera;


  try {
    
    this._context.viewport(0, 0, this._width, this._height);
    
    // configure opacity to 0.0 to overwrite the viewport background-color by
    // the container color
    this._context.clearColor(0.0, 0.0, 0.0, 0.0);
    
    // enable transparency
    this._context.enable(this._context.BLEND);
    this._context.blendEquation(this._context.FUNC_ADD);
    this._context.blendFunc(this._context.SRC_ALPHA,
        this._context.ONE_MINUS_SRC_ALPHA);
    // .. and depth test
    this._context.enable(this._context.DEPTH_TEST);
    // .. with perspective rendering
    this._context.depthFunc(this._context.LEQUAL);
    //    
    

    // clear color and depth buffer
    this._context.clear(this._context.COLOR_BUFFER_BIT |
        this._context.DEPTH_BUFFER_BIT);
    
    if (this['config']['PICKING_ENABLED']) {
      //
      // create a frame buffer for the picking functionality
      //
      // inspired by JAX https://github.com/sinisterchipmunk/jax/ and
      // http://dl.dropbox.com/u/5095342/WebGL/webgldemo3.js
      //
      // we basically render into an invisible framebuffer and use a unique
      // object
      // color to check which object is where (a simulated Z buffer since we can
      // not directly access the one from WebGL)
      var pickFrameBuffer = this._context.createFramebuffer();
      var pickRenderBuffer = this._context.createRenderbuffer();
      var pickTexture = this._context.createTexture();
      
      this._context.bindTexture(this._context.TEXTURE_2D, pickTexture);
      
      this._context.texImage2D(this._context.TEXTURE_2D, 0, this._context.RGB,
          this._width, this._height, 0, this._context.RGB,
          this._context.UNSIGNED_BYTE, null);
      
      this._context.bindFramebuffer(this._context.FRAMEBUFFER, pickFrameBuffer);
      this._context.bindRenderbuffer(this._context.RENDERBUFFER,
          pickRenderBuffer);
      this._context.renderbufferStorage(this._context.RENDERBUFFER,
          this._context.DEPTH_COMPONENT16, this._width, this._height);
      this._context.bindRenderbuffer(this._context.RENDERBUFFER, null);
      
      this._context.framebufferTexture2D(this._context.FRAMEBUFFER,
          this._context.COLOR_ATTACHMENT0, this._context.TEXTURE_2D,
          pickTexture, 0);
      this._context.framebufferRenderbuffer(this._context.FRAMEBUFFER,
          this._context.DEPTH_ATTACHMENT, this._context.RENDERBUFFER,
          pickRenderBuffer);
      this._context.bindFramebuffer(this._context.FRAMEBUFFER, null);
      
      this._pickFrameBuffer = pickFrameBuffer;
      
    }
    
  } catch (e) {
    
    // this exception indicates if the browser supports WebGL
    throw new Error('Exception while accessing GL Context!\n' + e);
    
  }
  
  //
  // WebGL Viewport initialization done
  // --------------------------------------------------------------------------
  

  //
  // add default shaders to this renderer
  // it is possible to attach other custom shaders after this init call
  // also, this has to happen after this._canvas, this._context and
  // this._camera
  // were
  // attached to this renderer since we check for these
  var _defaultShaders = new X.shaders();
  this.addShaders(_defaultShaders);
  
};


/**
 * Resize this renderer.
 */
X.neoRenderer3D.prototype.resize = function() {
  this._width = this._container.clientWidth;
  this._height = this._container.clientHeight;
  this._canvas.width = this._width;
  this._canvas.height = this._height;
  this._camera.resize(this._width, this._height);
};


/**
 * Empty the scene of the renderer and breaks the listennings
 * 
 * @throws {Error} An exception if something goes wrong.
 */
X.neoRenderer3D.prototype.empty = function() {
  var objects = this._objects.values();
  while (objects.length>0) {
    var object = objects.pop();
    if (goog.isDefAndNotNull(object) && object instanceof X.object) this.downdate_(object);
    else window.console.log("Not valid object");
  }
  this._topLevelObjects = [];

  
};


/**
 * Stop listenning an object's events.
 * 
 * @param {!X.object} object The displayable object to setup within this
 *          renderer.
 * @throws {Error} An exception if something goes wrong.
 * @protected
 */
X.neoRenderer3D.prototype.downdate_ = function(object) {

  if (!this._canvas || !this._context) {
    
    throw new Error('The renderer was not initialized properly.');
    
  }
  
  if (!goog.isDefAndNotNull(object)) {
    window.console.log(object);
    throw new Error('Illegal object.');
    
  }
  
  // unlisten to modified events of this object, if we did that before
  if (goog.events.hasListener(object, X.event.events.MODIFIED)) {
    
    goog.events.unlisten(object, X.event.events.MODIFIED, this.onModified
        .bind(this));
    
  }
  
};


/**
 * Picking handler
 * @param {!X.neoEvent.PickEvent} event The pick event.
 * @protected
 */
X.neoRenderer3D.prototype.onPick_ = function(event) {
  var e = new X.neoEvent.PickEvent();
  if (event._type!='position') return;
  var objid = this.pick(event._x, event._y);
  var obj = this.get(objid);
  if (goog.isDefAndNotNull(obj)) e._obj = obj;
  e._type = 'object';
  this.dispatchEvent(e);
};


/**
 * 3D Picking handler
 * @param {!X.neoEvent.Pick3dEvent} event The pick event.
 * @protected
 */
X.neoRenderer3D.prototype.onPick3d_ = function(event) {
  if (event._type!='2d') return;
  var point3f = this.pick3d(event._x, event._y, null, false, 0, true);
  if (point3f.length==3) {
    var e = new X.neoEvent.Pick3dEvent();
    e._x = point3f[0];
    e._y = point3f[1];
    e._z = point3f[2];
    e._type = '3d';
    
	  this.dispatchEvent(e);
	}
};


/**
 * Reslice handler
 * @param {!X.neoEvent.ResliceEvent} event The reslice event.
 * @protected
 */
X.neoRenderer3D.prototype.onReslice_ = function(event) {
  var sliceDir = event._dir;
  // create the event
  var ev = new X.neoEvent.ResliceEvent();
  ev._dir = sliceDir;
  
  // if the z movement is already set (mouse wheel roll)
  if (goog.isDefAndNotNull(event._z) && event._z!=0) {
    ev._z = event._z;
  } else {  
    // else compute the direction of the movement and the movement from x and y moves
    var sliceFront = this._topLevelObjects[0].children[sliceDir]._front;
    sliceFront = new goog.math.Vec3(parseFloat(sliceFront[0]), parseFloat(sliceFront[1]), parseFloat(sliceFront[2]));
    //var sliceUp = this._topLevelObjects[0].children[sliceDir]._up;
    //sliceUp = new goog.math.Vec3(parseFloat(sliceUp[0]), parseFloat(sliceUp[1]),parseFloat(sliceUp[2]));
    var camera = this._camera;
    var cameraFront = goog.math.Vec3.difference(camera._focus, camera._position);
    var cameraUp = camera._up;
    var invertedModelMatrix = new X.matrix(camera._view.getTranspose());
    cameraFront = invertedModelMatrix.multiplyByVector(cameraFront).normalize();
    var coefz = goog.math.Vec3.dot(sliceFront, cameraFront);
    if (Math.abs(coefz)<0.0001) return; // we are perpendicula to the slice
    coefz = (coefz<0)?1:1; // -1 : we see the back of the slice, +1 we see the front of the slice
    cameraUp = invertedModelMatrix.multiplyByVector(cameraUp).normalize();
    var cameraRight = goog.math.Vec3.cross(cameraFront,cameraUp).normalize();
    var coefx = -1*goog.math.Vec3.dot(sliceFront, cameraRight);
    var coefy = goog.math.Vec3.dot(sliceFront, cameraUp);
    ev._z = coefx*event._x+coefy*event._y;
  }
  this.dispatchEvent(ev);
};


/**
 * Picking handler
 * @param {!X.neoEvent.PickEvent} event The pick event.
 * @protected
 */
X.neoRenderer3D.prototype.onMeasure_ = function(event) {
	var point3f = this.pick3d(event._x, event._y,null, false, 0, true);
	if (point3f.length==3) {
	  // there is a picked 3d point
	  if (this._measuresStarts.length == this._measuresEnds.length) {
	    this._measuresStarts.push(point3f);
	  } else if (this._measuresStarts.length == this._measuresEnds.length + 1) {
	    var anotherpoint3f = this._measuresStarts.slice(this._measuresStarts.length-1, this._measuresStarts.length);
	    var distance = Math.sqrt( (point3f[0]-anotherpoint3f[0])*(point3f[0]-anotherpoint3f[0])+(point3f[1]-anotherpoint3f[1])*(point3f[1]-anotherpoint3f[1])+(point3f[2]-anotherpoint3f[2])*(point3f[2]-anotherpoint3f[2]) );
	    this._measures.push(distance);
	    this._measuresEnds.push(point3f);
	  }
	  this.render();
	}
};

/**
 * @inheritDoc
 */
X.neoRenderer3D.prototype.update_ = function(object) {

  // call the update_ method of the superclass
  goog.base(this, 'update_', object);

};

/**
* Compute intersection between a ray given by a point and a vector, and the axis oriented bounding box of an object. POSSIBLE UPGRADES : new versions without different types of detections ?
*
* @param {Array} point The ray start point.
* @param {Array} vector The ray direction in 3D space.
* @param {X.object} object The object whose bounding box is used.
* @return {!boolean} The result of the intersection.
*/
X.neoRenderer3D.prototype.intersectionRayAABB = function(point, vector, object) {
  var points = object._points;
  var xmin = points._minA, ymin = points._minB, zmin = points._minC, xmax = points._maxA, ymax = points._maxB, zmax = points._maxC;
  if (object instanceof X.slice || object instanceof X.volume || object instanceof X.neoVolume || object instanceof X.sphere || object instanceof X.cylinder || object instanceof X.cube) {
      xmin += object._center[0];
      xmax += object._center[0];
      ymin += object._center[1];
      ymax += object._center[1];
      zmin += object._center[2];
      zmax += object._center[2];
  }
  /*
  // if the ray is almost parallel to an axis, check if its coordinate is out of the scene square. This avoids high numbers in the following part
  if (Math.abs(vector[0])<0.00001 && (point[0]<xmin || point[0]>xmax)) return false;
  if (Math.abs(vector[2])<0.00001 && (point[2]<zmin || point[2]>zmax)) return false;
  if (Math.abs(vector[1])<0.00001 && (point[1]<ymin || point[1]>ymax)) return false;
  if (Math.abs(vector[0])<0.00001 && point[0]>xmin && point[0]<xmax) return true;
  if (Math.abs(vector[2])<0.00001 && point[2]>zmin && point[2]<zmax) return true;
  if (Math.abs(vector[2])<0.00001 && point[1]>ymin && point[1]<ymax) return true;
  
  // x-coordinate : (E1) point.x+nxmin*vector.x <= AABB <= point.x+nxmax*vector.x
  var nxmin=0, nxmax=0;
  if (vector[0]!=0) {
    if (vector[0]>0) {
      nxmin = ( xmin - point[0] ) / vector[0];
      nxmax = ( xmax - point[0] ) / vector[0];
    } else {
      nxmax = ( xmin - point[0] ) / vector[0];
      nxmin = ( xmax - point[0] ) / vector[0];
    }
  }
  // y coordinate : (E2) point.y+nymin*vector.y <= AABB <= point.y+nymax*vector.y
  var nymin=0, nymax=0;
  if (vector[1]!=0) {
    if (vector[1]>0) {
      nymin = ( ymin - point[1] ) / vector[1];
      nymax = ( ymax - point[1] ) / vector[1];
    } else {
      nymax = ( ymin - point[1] ) / vector[1];
      nymin = ( ymax - point[1] ) / vector[1];
    }
  }
  // z coordinate : (E3) point.y+nymin*vector.y <= AABB <= point.y+nymax*vector.y
  var nzmin=0, nzmax=0;
  if (vector[2]!=0) {
    if (vector[2]>0) {
      nzmin = ( zmin - point[2] ) / vector[2];
      nzmax = ( zmax - point[2] ) / vector[2];
    } else {
      nzmax = ( zmin - point[2] ) / vector[2];
      nzmin = ( zmax - point[2] ) / vector[2];
    }
  }
  
  // we check if the 3 equation can be verified by 1 point : point+nmin*vector <= AABB <= point+nmax*vector
  var nmin = Math.max(nxmin,nymin,nzmin);
  var nmax = Math.min(nxmax,nymax,nzmax);
  if (nmin>nmax) return false; // no solution to the system {(E1), (E2), (E3)}
  return true; // there is a solution (= an intersection)
  */
  
  var tnear = -Infinity, tfar = Infinity;
  var t1, t2;
  var AABBmin = [xmin, ymin, zmin], AABBmax = [xmax, ymax, zmax];
  for (var i = 0; i < 3; i++) {
    if (Math.abs(vector[i])<0.00001) {
      if (point[i]<AABBmin[i] || point[i]>AABBmax[i]) return false;
    } else {
      // caution : vector is inverted
      t1 = -1 * (AABBmin[i] - point[i]) / vector[i];
      t2 = -1 * (AABBmax[i] - point[i]) / vector[i];
      if (t1>t2) {
        var t0 = t2;
        t2 = t1;
        t1 = t0;
        //delete t0;
      }
      if (t1>tnear) tnear = t1;
      if (t2<tfar) tfar = t2;
      if (tnear>tfar) return false;
      if (tfar<0) return false;
    }
  }
  // we have tnear and tfar valids
  return true;
  
}


/**
* Compute intersection between a ray given by a point and a vector, and an object.
*
* @param {number} x.
* @param {number} y.
* @param {?X.object} withObject The object whose bounding box is used.
* @param {?boolean} withNormals 0 if the normal direction is used in the algorithm to elinitate triangles or not
* @param {?number} withVisibility visibility min for objects : <0 = every object, 0 = every visible object, more = every object with opacity superior to this value
* @param {*} usePick2d tells if choose to use pick2d to faster the picking. Automaticaly set withVisibility to negative.
* @return {Array} The intersection point the nearest of the ray start point.
*/
X.neoRenderer3D.prototype.pick3d = function(x, y, withObject, withNormals, withVisibility, usePick2d) {

  var inv_view_matrix = this._camera._view.getInverse();
  if (Math.abs(x)>this._width || Math.abs(y)>this._height) throw new Error("The point is out of the screen");
  
  // unproject
  var direction = this._camera.unproject((x/this._width)*2-1, ((this._height-y)/this._height)*2-1); // normalize the values + inverse y
  
  // the scene centroid point
  var centroid = new X.matrix(4,1);
  centroid.setValueAt(0,0,this._center[0]);
  centroid.setValueAt(1,0,this._center[1]);
  centroid.setValueAt(2,0,this._center[2]);
  centroid.setValueAt(3,0,1);
  
  // the camera position as an object of the scene
  var camera_center = new X.matrix(4,1);
  camera_center.setValueAt(0,0,0); // don't forget in OpenGL the camera always is at (0,0,0), it's the scene that moves
  camera_center.setValueAt(1,0,0);
  camera_center.setValueAt(2,0,0);
  camera_center.setValueAt(3,0,1);
  camera_center = inv_view_matrix.multiply(camera_center);
  camera_center = camera_center.add(centroid); // xtk translates the scene so it is rendered as centered on [0,0,0] before applying the view_matrix
  camera_center = new Array(camera_center.getValueAt(0,0), camera_center.getValueAt(1,0), camera_center.getValueAt(2,0)); // array of the 3 coordinates

  var result = new Array(), mindistance = Infinity;
  
  // is there an object to faster it ?
  var anobject;
  if (goog.isDefAndNotNull(withObject) && withObject instanceof X.object) {
    anobject = withObject;
  }
  else if (goog.isDefAndNotNull(usePick2d) && !!usePick2d) {
    anobject = this.get(this.pick(x,y));
  }
  
  var objects;
  if (goog.isDefAndNotNull(anobject)) objects = new Array(anobject);
  else objects = this._objects.values();
  
  // do we use the normals ?
  if (goog.isDefAndNotNull(withNormals) && !!withNormals) {
    for (var i in objects) {
        
      //the number of intersections opposed to the ray, for information
      var opposits = 0;

      var object = objects[i];
      
      // opacity test
      if (goog.isDefAndNotNull(withVisibility) && object._opacity <= withVisibility && !usePick2d) continue;
      
      window.console.log("The object is "+object._caption);
      
      // only keep objects whose AABB intersect the ray
      if (!this.intersectionRayAABB(camera_center, direction, object)) {
        window.console.log("Not this one");
      } else {
        window.console.log("One to test");
        var length = object._points.count / 3; // number of triangles
        window.console.log("There are "+length+" triangles to check");
        if (length==0) return new Array(); // if the object has no ._points skip and return an empty array

        // look through the triangles and test them
        for (var j=0 ; j<length ; j++) {
          if (j%500==0) window.console.log("Triangle n°"+j);

          // get the 3 points of the triangle
          var px = object._points.get(3*j);
          var py = object._points.get(3*j+1);
          var pz = object._points.get(3*j+2);

          // 2 edges of the triangle
          var u = new goog.math.Vec3(py[0] - px[0], py[1] - px[1], py[2] - px[2]);
          var v = new goog.math.Vec3(pz[0] - px[0], pz[1] - px[1], pz[2] - px[2]);

          // normal of the triangle (going outside with normal conventions)
          var n = goog.math.Vec3.cross(u,v);
          if (Math.abs(n.x)<0.00001 && Math.abs(n.y)<0.00001 && Math.abs(n.z)<0.00001) {
            window.console.log("Degenerated triangle"); // the triange has 1 side very tiny comparated to the others or is almost null
            continue;
          }

          // direction from the triangle to the ray start point
          var w0 = new goog.math.Vec3(camera_center[0] - px[0],camera_center[1] - px[1],camera_center[2] - px[2]);

          // here we compute r : the number of times we have to sum the direction vector to reach the plan of the triangle
          var a = -goog.math.Vec3.dot(n,w0); // = (-1) * norm of the normal of the triangle * length of the projection of the w0 vector on the normal = (-1) * distance(ray start point, plan of the triangle) = (-1)*length(normal to the plan that goes through the ray start point)
          var b = goog.math.Vec3.dot(n, new goog.math.Vec3(direction[0],direction[1],direction[2])); // = norm of the normal of the triangle * length of the projection of direction vector on the normal
          if (Math.abs(b)<0.00001) {
            window.console.log("The ray is almost parallel to the triangle"); // we eliminate those triangles because of the future division by b
            continue;
          }
          var r = a/b;

          // Test if the ray goes to the opposite of the triangle. This may happen too often to log it without provoking laggs.
          if (r<0) {
            opposits = opposits + 1;
            continue;
            // POSSIBLE UPGRADE : do not eliminate those triangles with just making "r=Math.abs(r);"
          }
          
          // vi : the point at the intersection of the plan of the triangle and the ray
          var vi = goog.math.Vec3.sum(new goog.math.Vec3(camera_center[0],camera_center[1],camera_center[2]),new goog.math.Vec3(r*direction[0],r*direction[1],r*direction[2]));

          // coefficients for the later projection in the basis made by the 2 first edges of the triangle
          var uu = goog.math.Vec3.dot(u,u), vv = goog.math.Vec3.dot(v,v), uv = goog.math.Vec3.dot(u,v);

          // vector from the 1st edge of the triangle to the intersection ray-plan
          var w = vi.subtract(new goog.math.Vec3(px[0],px[1],px[2]));

          // norm(u|v) * coordinates of the projection of w on u|v;
          var wu = goog.math.Vec3.dot(w,u);
          var wv = goog.math.Vec3.dot(w,v);


          var D = uv * uv - uu * vv;
          var s,t; // coordinates of the intersection point in the basis made by the 2 first edges of the triangle
          s = (uv * wv - vv * wu) / D;
          if (s < 0.0 || s > 1.0) continue; // point outside
          t = (uv * wu - uu * wv) / D;
          if (t < 0.0 || (s + t) > 1.0) continue; // point outside
          window.console.log("this one!");

          // parametric coordinates of the intersection point inside the triangle
          // save the nearest
          if (mindistance>-a) {
            result = [px[0]+s*u.x+t*v.x, px[1]+s*u.y+t*v.y, px[2]+s*u.z+t*v.z];
            mindistance = -a;
          }
        }
      }
      window.console.log("There are "+opposits+" opposits triangles");
    }  
  } else {
    for (var i in objects) {
        
      var object = objects[i];
      
      // opacity test
      if (goog.isDefAndNotNull(withVisibility) && object._opacity <= withVisibility && !usePick2d) continue;
      
      window.console.log("The object is "+object._caption);
      
      // only keep objects whose AABB intersect the ray
      if (!this.intersectionRayAABB(camera_center, direction, object)) {
        window.console.log("Not this one");
      } else {
        window.console.log("One to test");
        var length = object._points.count / 3; // number of triangles
        window.console.log("There are "+length+" triangles to check");
        if (length==0) return new Array(); // if the object has no ._points skip and return an empty array

        // look through the triangles and test them
        for (var j=0 ; j<length ; j++) {
          if (j%500==0) window.console.log("Triangle n°"+j);

          // get the 3 points of the triangle
          var px = object._points.get(3*j);
          var py = object._points.get(3*j+1);
          var pz = object._points.get(3*j+2);

          // 2 edges of the triangle
          var u = new goog.math.Vec3(py[0] - px[0], py[1] - px[1], py[2] - px[2]);
          var v = new goog.math.Vec3(pz[0] - px[0], pz[1] - px[1], pz[2] - px[2]);

          // normal of the triangle (going outside with normal conventions)
          var n = goog.math.Vec3.cross(u,v);
          if (Math.abs(n.x)<0.00001 && Math.abs(n.y)<0.00001 && Math.abs(n.z)<0.00001) {
            window.console.log("Degenerated triangle"); // the triange has 1 side very tiny comparated to the others or is almost null
            continue;
          }

          // direction from the triangle to the ray start point
          var w0 = new goog.math.Vec3(camera_center[0] - px[0],camera_center[1] - px[1],camera_center[2] - px[2]);

          // here we compute r : the number of times we have to sum the direction vector to reach the plan of the triangle
          var a = -goog.math.Vec3.dot(n,w0); // = (-1) * norm of the normal of the triangle * length of the projection of the w0 vector on the normal = (-1) * distance(ray start point, plan of the triangle) = (-1)*length(normal to the plan that goes through the ray start point)
          var b = goog.math.Vec3.dot(n, new goog.math.Vec3(direction[0],direction[1],direction[2])); // = norm of the normal of the triangle * length of the projection of direction vector on the normal
          if (Math.abs(b)<0.00001) {
            window.console.log("The ray is almost parallel to the triangle"); // we eliminate those triangles because of the future division by b
            continue;
          }
          var r = a/b;
          
          // vi : the point at the intersection of the plan of the triangle and the ray
          var vi = goog.math.Vec3.sum(new goog.math.Vec3(camera_center[0],camera_center[1],camera_center[2]),new goog.math.Vec3(r*direction[0],r*direction[1],r*direction[2]));

          // coefficients for the later projection in the basis made by the 2 first edges of the triangle
          var uu = goog.math.Vec3.dot(u,u), vv = goog.math.Vec3.dot(v,v), uv = goog.math.Vec3.dot(u,v);

          // vector from the 1st edge of the triangle to the intersection ray-plan
          var w = vi.subtract(new goog.math.Vec3(px[0],px[1],px[2]));

          // norm(u|v) * coordinates of the projection of w on u|v;
          var wu = goog.math.Vec3.dot(w,u);
          var wv = goog.math.Vec3.dot(w,v);


          var D = uv * uv - uu * vv;
          var s,t; // coordinates of the intersection point in the basis made by the 2 first edges of the triangle
          s = (uv * wv - vv * wu) / D;
          if (s < 0.0 || s > 1.0) continue; // point outside
          t = (uv * wu - uu * wv) / D;
          if (t < 0.0 || (s + t) > 1.0) continue; // point outside
          window.console.log("this one!");

          // parametric coordinates of the intersection point inside the triangle
          // save the nearest
          if (mindistance>-a) {
            result = [px[0]+s*u.x+t*v.x, px[1]+s*u.y+t*v.y, px[2]+s*u.z+t*v.z];
            mindistance = -a;
          }
        }
      }
    }
  }

  
  return result;
  
};


/**
 * Callback for keyboard events on the associated DOM element. This fires proper
 * X.event events.
 * 
 * @param {Boolean} on The mode on/off to set.
 * @public
 */
X.neoRenderer3D.prototype.setMeasures = function(on) {
  alert(!!on);
  this._interactor._measuresActive = !!on;
}


// export symbols (required for advanced compilation)
goog.exportSymbol('X.neoRenderer3D', X.neoRenderer3D);
goog.exportSymbol('X.neoRenderer3D.prototype.init', X.neoRenderer3D.prototype.init);
goog.exportSymbol('X.neoRenderer3D.prototype.onShowtime',
    X.neoRenderer3D.prototype.onShowtime);
goog.exportSymbol('X.neoRenderer3D.prototype.get', X.neoRenderer3D.prototype.get);
goog.exportSymbol('X.neoRenderer3D.prototype.resize',
    X.neoRenderer3D.prototype.resize);
goog.exportSymbol('X.neoRenderer3D.prototype.destroy',
    X.neoRenderer3D.prototype.destroy);
goog.exportSymbol('X.neoRenderer3D.prototype.empty', X.neoRenderer3D.prototype.empty);
goog.exportSymbol('X.neoRenderer3D.prototype.intersectionRayAABB', X.neoRenderer3D.prototype.intersectionRayAABB);
goog.exportSymbol('X.neoRenderer3D.prototype.pick3d', X.neoRenderer3D.prototype.pick3d);
goog.exportSymbol('X.neoRenderer3D.prototype.setMeasures', X.neoRenderer3D.prototype.setMeasures);
