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
goog.provide('X.neoCamera3D');

// requires
goog.require('X.camera3D');
goog.require('X.neoEvent');



/**
 * Create a neo 3D perspective camera.
 * 
 * @constructor
 * @param {number} width The width of the camera's viewport.
 * @param {number} height The height of the camera's viewport.
 * @extends X.camera3D
 */
X.neoCamera3D = function(type, width, height) {

  //
  // call the standard constructor of X.camera3D
  goog.base(this, width, height);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'neoCamera3D';
  
  /**
   * Type (orthographic or perspective).
   *
   * @type {string}
   * @public
   */
  this._type = type;
  
  this._zoomFactor = 1;
  
  if (this._type=="neoModelMain") this._perspective = new Float32Array(this.calculatePerspective_( this._fieldOfView, (width / height), 1, 10000).flatten());
  else if (this._type=="neoModelSec") this._perspective = new Float32Array(this.calculateOrthographic_(width, height, 1, 10000).flatten());
  else this._perspective = new Float32Array(this.calculatePerspective_( this._fieldOfView, (width / height), 1, 10000).flatten()); // default
  
};
// inherit from X.base
goog.inherits(X.neoCamera3D, X.camera3D);


/**
 * The callback for a ROTATE event.
 * 
 * @param {!X.event.RotateEvent} event The event.
 * @throws {Error} An exception if the event is invalid.
 * @protected
 */
X.neoCamera3D.prototype.onRotate_ = function(event) {

  if (!(event instanceof X.event.RotateEvent)) {
    
    throw new Error('Received no valid rotate event.');
    
  }
  
  eval("this.onRotate("+event._distance.x+","+event._distance.y+","+event._angle+")");
  
  this.rotate(event._distance, event._angle);
  
};


/**
 * The callback for a ROTATE event.
 * 
 * @param {number} x.
 * @param {number} y.
 * @param {number} z.
 * @throws {Error} An exception if the event is invalid.
 */
X.neoCamera3D.prototype.onRotate = function(x, y, z) {

  // overload to execute code from outside the framework

};


/**
 * Perform a rotate operation. This method fires a X.event.RenderEvent() after
 * the calculation is done.
 * 
 * @param {!goog.math.Vec2|!Array} distance The distance of the rotation in
 *          respect of the last camera position as either a 2D Array or a
 *          goog.math.Vec2 containing the X and Y distances for the rotation.
 * @param {number} angle The rotation angle around z axis
 * @public
 */
X.neoCamera3D.prototype.rotate = function(distance, angle) {

  if ((distance instanceof Array) && (distance.length == 2)) {
    
    distance = new goog.math.Vec2(distance[0], distance[1]);
    
  } else if (!(distance instanceof goog.math.Vec2)) {
    
    throw new Error('Invalid distance vector for rotate operation.');
    
  }
  
  // in radii, the 5 is a constant stating how quick the rotation performs..
  var angleX = -distance.x / 5 * Math.PI / 180;
  var angleY = -distance.y / 5 * Math.PI / 180;
  var angleZ = angle;
  
  var identity = X.matrix.createIdentityMatrix(4);
  // the x-Axis vector is determined by the first row of the view matrix
  var xAxisVector = new goog.math.Vec3(parseFloat(this._view.getValueAt(0, 0)),
      parseFloat(this._view.getValueAt(0, 1)), parseFloat(this._view.getValueAt(
          0, 2)));
  // the y-Axis vector is determined by the second row of the view matrix
  var yAxisVector = new goog.math.Vec3(parseFloat(this._view.getValueAt(1, 0)),
      parseFloat(this._view.getValueAt(1, 1)), parseFloat(this._view.getValueAt(
          1, 2)));
    // the z-Axis vector is determined by the third row of the view matrix
  var zAxisVector = new goog.math.Vec3(parseFloat(this._view.getValueAt(2, 0)),
      parseFloat(this._view.getValueAt(2, 1)), parseFloat(this._view.getValueAt(
          2, 2)));
  
  // we rotate around the Y Axis when the mouse moves along the screen in X
  // direction
  var rotateX = identity.rotate(angleX, yAxisVector);
  
  // we rotate around the X axis when the mouse moves along the screen in Y
  // direction
  var rotateY = identity.rotate(angleY, xAxisVector);
  
  var rotateZ = identity.rotate(angleZ, zAxisVector);
  
  // perform the actual rotation calculation
  this._view = new X.matrix(this._view.multiply(rotateZ.multiply(rotateY.multiply(rotateX))));
  this._glview = new Float32Array(this._view.flatten());
  
  // fire a render event
  this.dispatchEvent(new X.event.RenderEvent());
  
};


/**
 * The callback for a ZOOM event.
 * 
 * @param {!X.event.ZoomEvent} event The event.
 * @throws {Error} An exception if the event is invalid.
 * @protected
 */
X.neoCamera3D.prototype.onZoom_ = function(event) {

  if (!(event instanceof X.event.ZoomEvent)) {
    
    throw new Error('Received no valid zoom event.');
    
  }
  
  if (event._in) {
  
    eval("this.onZoom('in',"+event._fast+")");
    this.zoomIn(event._fast);
    
  } else {
    
    eval("this.onZoom('out',"+event._fast+")");
    this.zoomOut(event._fast);
    
  }
  
};


/**
 * The callback for a ZOOM event.
 * 
 * @param {!String} dir.
 * @param {!Boolean} fast.
 * @throws {Error} An exception if the event is invalid.
 */
X.neoCamera3D.prototype.onZoom = function(dir, fast) {

  // to overload
  
};


/**
 * Perform a zoom in operation. This method fires a X.event.RenderEvent() after
 * the calculation is done.
 * 
 * @param {boolean} fast Enables/disables the fast mode which zooms much
 *          quicker.
 * @public
 */
X.neoCamera3D.prototype.zoomIn = function(fast) {

  if (this._type=="neoModelSec") {
    this._perspective[0] = this._perspective[0]*1.1;
    this._perspective[5] = this._perspective[5]*1.1;
    this._perspective[10] = this._perspective[10]*1.1;
    this._zoomFactor = this._zoomFactor*1.1;
  } else {
    var zoomStep = 20;
    if (goog.isDefAndNotNull(fast) && !fast) {
      zoomStep = 5;
    }
    var zoomVector = new goog.math.Vec3(0, 0, zoomStep);
    var identity = X.matrix.createIdentityMatrix(4);
    var zoomMatrix = identity.translate(zoomVector);
    this._view = new X.matrix(zoomMatrix.multiply(this._view));
    this._glview = new Float32Array(this._view.flatten());
  }
  
  
  // fire a render event
  this.dispatchEvent(new X.event.RenderEvent());
  
  
};


/**
 * Perform a zoom out operation. This method fires a X.event.RenderEvent() after
 * the calculation is done.
 * 
 * @param {boolean} fast Enables/disables the fast mode which zooms much
 *          quicker.
 * @public
 */
X.neoCamera3D.prototype.zoomOut = function(fast) {

  if (this._type=="neoModelSec") {
    this._perspective[0] = this._perspective[0]/1.1;
    this._perspective[5] = this._perspective[5]/1.1;
    this._perspective[10] = this._perspective[10]/1.1;
    this._zoomFactor = this._zoomFactor/1.1;
  } else {
    var zoomStep = 20;
    if (goog.isDefAndNotNull(fast) && !fast) {
      zoomStep = 5;
    }
    var zoomVector = new goog.math.Vec3(0, 0, -zoomStep);
    var identity = X.matrix.createIdentityMatrix(4);
    var zoomMatrix = identity.translate(zoomVector);
    this._view = new X.matrix(zoomMatrix.multiply(this._view));
    this._glview = new Float32Array(this._view.flatten());
  }
  
  // fire a render event
  this.dispatchEvent(new X.event.RenderEvent());
  
};


/**
 * The callback for a PAN event.
 * 
 * @param {!X.event.PanEvent} event The event.
 * @throws {Error} An exception if the event is invalid.
 * @protected
 */
X.neoCamera3D.prototype.onPan_ = function(event) {

  if (!(event instanceof X.event.PanEvent)) {
    
    throw new Error('Received no valid pan event.');
    
  }
  
  eval("this.onPan("+event._distance.x+","+event._distance.y+")");
  
  this.pan(event._distance);
  
};


/**
 * The callback for a PAN event.
 * 
 * @param {number} x.
 * @param {number} y.
 * @throws {Error} An exception if the event is invalid.
 */
X.neoCamera3D.prototype.onPan = function(x, y) {

  // to overload

};


/**
 * Resize the camera's viewport.
 * 
 * @param {number} width.
 * @param {number} width.
 * @throws {Error} An exception if the values are invalid.
 */
X.neoCamera3D.prototype.resize = function (width, height) {

  // validate width and height
  if (!goog.isNumber(width) || !goog.isNumber(height)) {
    
    throw new Error('A camera needs valid width and height values.');
    
  }
  if (this._type=="neoModelMain") this._perspective = new Float32Array(this.calculatePerspective_(
      this._fieldOfView, (width / height), 1, 10000).flatten());
      
  else if (this._type=="neoModelSec") this._perspective = new Float32Array(this.calculateOrthographic_(
      width, height, 1, 10000).flatten());
  
};


/**
* Unproject fuction.
*
* @param {number} x The x-coordinate on the viewport.
* @param {number} y The x-coordinate on the viewport.
* @return {Array} the resulting direction
*/
X.neoCamera3D.prototype.unproject = function (x,y) {
  
  // get the 4x4 iew matrix
  var mvMatrix = this._view.getInverse().getTranspose();
  
  // create the 4x4 projection matrix from the flatten gl version
  var pMatrix = new X.matrix(4,4);
  for (var i=0 ; i<16 ; i++) {
    pMatrix.setValueAt(i - 4*Math.floor(i/4), Math.floor(i/4), this._perspective[i]);
  }
  
  // compute the product and inverse it
  var pmvMatrix = pMatrix.multiply(mvMatrix);
  var inverse_pmvMatrix = pmvMatrix.getInverse();
  if (!goog.isDefAndNotNull(inverse_pmvMatrix)) throw new Error("Could not inverse the transformation matrix.");
  
  // check if x & y are map in [-1,1] interval (required for the computations). Don't forget the y-coordinate is inversed when you pick.
  if (x<-1 || x>1 || y<-1 || y>1) throw new Error("Invalid x or y coordinate, it must be between -1 and 1");
  
  // fill the 4x1 normalized (in [-1,1]) vector of the point of the screen in word camera world's basis
  var point4f = new X.matrix(4,1);
  point4f.setValueAt(0, 0, x);
  point4f.setValueAt(1, 0, y);
  point4f.setValueAt(2, 0, -1.0); // 2*?-1, with ?=0 for near plan and ?=1 for far plan
  point4f.setValueAt(3, 0, 1.0); // homogeneous coordinate arbitrary set at 1
  
  // compute the picked ray in the world's basis in homogeneous coordinates
  var ray4f = inverse_pmvMatrix.multiply(point4f);
  if (ray4f.getValueAt(3,0)==0) throw new Error("Ray is not valid.");
  
  // return it in not-homogeneous coordinates to compute the direction in the world's basis
  var point3f = new X.matrix(3,1);
  point3f.setValueAt(0, 0, -ray4f.getValueAt(0, 0) / ray4f.getValueAt(3, 0) );
  point3f.setValueAt(1, 0, -ray4f.getValueAt(1, 0) / ray4f.getValueAt(3, 0) );
  point3f.setValueAt(2, 0, -ray4f.getValueAt(2, 0) / ray4f.getValueAt(3, 0) );
  var norm = Math.sqrt(point3f.getValueAt(0, 0)*point3f.getValueAt(0, 0)+point3f.getValueAt(1, 0)*point3f.getValueAt(1, 0)+point3f.getValueAt(2, 0)*point3f.getValueAt(2, 0));
  
  // return the normalised version
  return point3f.multiply(1/norm).toArray();
};


/**
 * Calculate a orthogonal projection matrix based on the given values. This calculation is
 * based on known principles of Computer Vision.
 * 
 * @param {number} width The width of the viewport.
 * @param {number} height The height of the viewport.
 * @param {number} zNearClippingPlane The Z coordinate of the near clipping
 *          plane (close to the eye).
 * @param {number} zFarClippingPlane The Z coordinate of the far clipping plane
 *          (far from the eye).
 * @return {X.matrix} The perspective matrix.
 * @private
 */
X.neoCamera3D.prototype.calculateOrthographic_ = function(width,
    height, zNearClippingPlane, zFarClippingPlane) {

  var ymax = height/2;
  var ymin = -ymax;
  var xmax = width/2;
  var xmin = -xmax;
  
  return this.calculateViewingFrustum2_(xmin, xmax, ymin, ymax,
      zNearClippingPlane, zFarClippingPlane);
  
};

/**
 * Calculate the (orthographic) viewing frustum which is the three-dimensional area which is
 * visible to the eye by 'trimming' the world space. This calculation is based
 * on known principles of Computer Vision (Source:
 * http://en.wikipedia.org/wiki/Viewing_frustum).
 * 
 * @param {number} left The Y coordinate of the left border.
 * @param {number} right The Y coordinate of the right border.
 * @param {number} bottom The X coordinate of the bottom border.
 * @param {number} top The X coordinate of the top border.
 * @param {number} znear The Z coordinate of the near the eye border.
 * @param {number} zfar The Z coordinate of the far of the eye border.
 * @return {X.matrix} The frustum matrix.
 * @private
 */
X.neoCamera3D.prototype.calculateViewingFrustum2_ = function(left, right, bottom,
    top, znear, zfar) {
  var x = 2/((right-left));
  var y = 2/((top-bottom));
  var z = -2/((zfar-znear));
  var a = -(left+right)/(right-left);
  var b = -(top+bottom)/(top-bottom);
  var c = -(znear+zfar)/(zfar-znear);
  
  return new X.matrix([[this._zoomFactor*x, 0, 0, a], [0, this._zoomFactor*y, 0, b], [0, 0, this._zoomFactor*z, c], [0, 0, 0, 1]]);
  
};

goog.exportSymbol('X.neoCamera3D', X.neoCamera3D);
goog.exportSymbol('X.neoCamera3D.prototype.onRotate', X.neoCamera3D.prototype.onRotate);
goog.exportSymbol('X.neoCamera3D.prototype.rotate', X.neoCamera3D.prototype.rotate);
goog.exportSymbol('X.neoCamera3D.prototype.onPan', X.neoCamera3D.prototype.onPan);
goog.exportSymbol('X.neoCamera3D.prototype.onZoom', X.neoCamera3D.prototype.onZoom);
goog.exportSymbol('X.neoCamera3D.prototype.zoomIn', X.neoCamera3D.prototype.zoomIn);
goog.exportSymbol('X.neoCamera3D.prototype.zoomOut', X.neoCamera3D.prototype.zoomOut);
goog.exportSymbol('X.neoCamera3D.prototype.unproject', X.neoCamera3D.prototype.unproject);
