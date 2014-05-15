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
goog.provide('X.neoVolume');

// requires
goog.require('X.object');
goog.require('X.neoSlice');
goog.require('X.thresholdable');
goog.require('X.neoEvent');



/**
 * Create a displayable volume which consists of X.slices in X,Y and Z direction
 * and can also be volume rendered.
 * 
 * @constructor
 * @param {X.neoVolume=} volume Another X.neoVolume to use as a template.
 * @extends X.object
 */
X.neoVolume = function(volume) {

  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'volume';
  
  /**
   * The datastream of this volume.
   * 
   * @type {!Uint16Array}
   * @protected
   */  
  this._datastream = null;
  
  /**
   * The center of this volume.
   * 
   * @type {!Array}
   * @protected
   */
  this._center = [0, 0, 0];
  
  /**
   * The dimensions of this volume.
   * 
   * @type {!Array}
   * @protected
   */
  this._dimensions = [10, 10, 10];
  
  /**
   * The spacing of this volume.
   * 
   * @type {!Array}
   * @protected
   */
  this._spacing = [1, 1, 1];
  
  /**
   * The index of the currently shown slice in X-direction.
   * 
   * @type {!number}
   * @public
   */
  this._indexX = 0;
  
  /**
   * The index of the formerly shown slice in X-direction.
   * 
   * @type {!number}
   * @protected
   */
  this._indexXold = 0;
  
  /**
   * The index of the currently shown slice in Y-direction.
   * 
   * @type {!number}
   * @public
   */
  this._indexY = 0;
  
  /**
   * The index of the formerly shown slice in Y-direction.
   * 
   * @type {!number}
   * @protected
   */
  this._indexYold = 0;
  
  /**
   * The index of the currently shown slice in Z-direction.
   * 
   * @type {!number}
   * @public
   */
  this._indexZ = 0;
  
  /**
   * The index of the formerly shown slice in Z-direction.
   * 
   * @type {!number}
   * @protected
   */
  this._indexZold = 0;
  
  /**
   * The X.object holding the slices in X-direction.
   * 
   * @type {!X.object}
   * @protected
   */
  this._sliceX = new X.neoSlice();
  this._sliceX._texture = new X.texture();
  this._sliceX._volume = this;
  this._sliceX._caption = 'X';
  this._children.push(this._sliceX);
  
  /**
   * The X.object holding the slices in Y-direction.
   * 
   * @type {!X.object}
   * @protected
   */
  this._sliceY = new X.neoSlice();
  this._sliceY._texture = new X.texture();
  this._sliceY._volume = this;
  this._sliceY._caption = 'Y';
  this._children.push(this._sliceY);
  
  /**
   * The X.object holding the slices in Z-direction.
   * 
   * @type {!X.object}
   * @protected
   */
  this._sliceZ = new X.neoSlice();
  this._sliceZ._texture = new X.texture();
  this._sliceZ._volume = this;
  this._sliceZ._caption = 'Z';
  this._children.push(this._sliceZ);

  
  // inject functionality
  inject(this, new X.loadable()); // this object is loadable from a file
  inject(this, new X.thresholdable()); // this object is thresholdable
  
  if (goog.isDefAndNotNull(volume)) {
    
    // copy the properties of the given volume over
    this.copy_(volume);
    
  }
  
};
// inherit from X.object
goog.inherits(X.neoVolume, X.object);


/**
 * Copies the properties from a given volume to this volume.
 * 
 * @param {!X.neoVolume} volume The given volume.
 * @protected
 */
X.neoVolume.prototype.copy_ = function(volume) {

  window.console.log(volume);
  this._center = volume._center.slice();
  this._dimensions = volume._dimensions.slice();
  this._spacing = volume._spacing.slice();
  this._indexX = volume._indexX;
  this._indexXold = volume._indexXold;
  this._indexY = volume._indexY;
  this._indexYold = volume._indexYold;
  this._indexZ = volume._indexZ;
  this._indexZold = volume._indexZold;
  this._slicesX = new X.object(volume._slicesX);
  this._slicesY = new X.object(volume._slicesY);
  this._slicesZ = new X.object(volume._slicesZ);
  
  // TODO threshold
  
  // call the superclass' modified method
  goog.base(this, 'copy_', volume);
  
};


/**
 * Re-show the slices or re-activate the volume rendering for this volume.
 * 
 * @inheritDoc
 */
X.neoVolume.prototype.modified = function() {

  window.console.log("Modified");

  this.slicing_(this._indexX, this._indexY, this._indexZ);
  
  var e = new X.neoEvent.MultiModifiedEvent();
  e._object = this;
  this.dispatchEvent(e);
  
  // call the superclass' modified method
  goog.base(this, 'modified');
  
};


/**
 * Show the current slices which are set by this._indexX, this._indexY and
 * this._indexZ and hide all others.
 */
X.neoVolume.prototype.slicing_ = function(x,y,z) {

  if(!goog.isDefAndNotNull(x) || !goog.isDefAndNotNull(y) || !goog.isDefAndNotNull(z)) throw new Error("Invalid input!");
  
  var halfDimensionX = (this._dimensions[0] - 1) / 2;
  var halfDimensionY = (this._dimensions[1] - 1) / 2;
  var halfDimensionZ = (this._dimensions[2] - 1) / 2;
  
  if (x==-1 || y==-1 || z==-1) {
    this._indexX = Math.floor(halfDimensionX);
    this._indexY = Math.floor(halfDimensionY);
    this._indexZ = Math.floor(halfDimensionZ);
  } else {
    this._indexX = Math.floor(x);
    if (this._indexX<0) this._indexX = 0;
    if (this._indexX>=this._dimensions[0]) this._indexX = this._dimensions[0]-1;
    this._indexY = Math.floor(y);
    if (this._indexY<0) this._indexY = 0;
    if (this._indexY>=this._dimensions[1]) this._indexY = this._dimensions[1]-1;
    this._indexZ = Math.floor(z);
    if (this._indexZ<0) this._indexZ = 0;
    if (this._indexZ>=this._dimensions[2]) this._indexZ = this._dimensions[2]-1;
  }
  
  window.console.log("indexes:"+this._indexX+":"+this._indexY+":"+this._indexZ);
  
  var refreshX = (this._indexXold!=this._indexX);
  var refreshY = (this._indexYold!=this._indexY);
  var refreshZ = (this._indexZold!=this._indexZ);
  
  window.console.log("refreshes:"+refreshX+":"+refreshY+":"+refreshZ);
  
  //this._dirty = true;
  
  var rows = this._spacing[0] * (this._dimensions[0] - 1);
  var cols = this._spacing[1] * (this._dimensions[1] - 1);
  var slices = this._spacing[2] * (this._dimensions[2] - 1);
      
  if (refreshX) {
    var positionX = -halfDimensionX * this._spacing[0] + this._indexX * this._spacing[0];
    this._sliceX.setup([this._center[0]+positionX, this._center[1], this._center[2]], [1, 0, 0], [0, 1, 0], slices, cols);
    this._indexXold = this._indexX;
    this._sliceX._dirty = true;
  }
  if (refreshY) {
    var positionY = -halfDimensionY * this._spacing[1] + this._indexY * this._spacing[1];
    this._sliceY.setup([this._center[0], this._center[1]+positionY, this._center[2]], [0, 1, 0], [0, 0, -1], rows, slices);
    this._indexYold = this._indexY;
    this._sliceY._dirty = true;
  }
  if (refreshZ) {
    var positionZ = -halfDimensionZ * this._spacing[2] + this._indexZ * this._spacing[2];
    this._sliceZ.setup([this._center[0], this._center[1], this._center[2]+positionZ], [0, 0, 1], [0, 1, 0], rows, cols);
    this._indexZold = this._indexZ;
    this._sliceZ._dirty = true;
  }

  this.applyTexture_(refreshX, refreshY, refreshZ);
  
};


/**
 * Show the current slices which are the nearest from the 3d point (x,y,z).
 */
X.neoVolume.prototype.slicing2_ = function(x,y,z) {
  
  var halfDimensionX = (this._dimensions[0] - 1) / 2;
  var halfDimensionY = (this._dimensions[1] - 1) / 2;
  var halfDimensionZ = (this._dimensions[2] - 1) / 2;

  this._indexX = Math.floor( (x-this._center[0]) / this._spacing[0] + halfDimensionX );
  if (this._indexX<0) this._indexX = 0;
  if (this._indexX>this._dimensions[0]) this._indexX = this._dimensions[0];
  this._indexY = Math.floor( (y-this._center[1]) / this._spacing[1] + halfDimensionY );
  if (this._indexY<0) this._indexY = 0;
  if (this._indexY>this._dimensions[1]) this._indexY = this._dimensions[1];
  this._indexZ = Math.floor( (z-this._center[2]) / this._spacing[2] + halfDimensionZ );
  if (this._indexZ<0) this._indexZ = 0;
  if (this._indexZ>this._dimensions[2]) this._indexZ = this._dimensions[2];
  
  this._dirty = true;
  
  this.modified();

}


/**
 * Show the current slices which are the nearest from the 3d point (x,y,z).
 */
X.neoVolume.prototype.slicing3_ = function(dir, delta) {
  var halfDimensionX = (this._dimensions[0] - 1) / 2;
  var halfDimensionY = (this._dimensions[1] - 1) / 2;
  var halfDimensionZ = (this._dimensions[2] - 1) / 2;
  
  var rows = this._spacing[0] * (this._dimensions[0] - 1);
  var cols = this._spacing[1] * (this._dimensions[1] - 1);
  var slices = this._spacing[2] * (this._dimensions[2] - 1);
  
  if (dir==0) {
    this._indexX += Math.floor(delta);
  } else if (dir==1) {
    this._indexY += Math.floor(delta);
  } else if (dir==2) {
    this._indexZ += Math.floor(delta);   
  }

  this._dirty = true;
  
  this.modified();

};


/**
 * Show the current slices which are set by this._indexX, this._indexY and
 * this._indexZ and hide all others.
 */
X.neoVolume.prototype.applyTexture_ = function(rx, ry, rz) {

  var width = this._dimensions[0];
  var height = this._dimensions[1];
  var depth = this._dimensions[2];

  if (ry) {
    // Y direction
    var textureY = new X.texture();
    textureY._rawDataWidth = width;
    textureY._rawDataHeight = depth;
    textureY._rawData = new Uint8Array(4 * width * depth);
    for (var i = 0; i < width; i++) {
      for (var k = 0; k < depth; k++) {
        var readValue = this._datastream[i+this._indexY*width+k*width*height] * 255 / this._max;  
        var indexXZ = 4*(i+k*width);
        textureY._rawData[indexXZ] = readValue;
        textureY._rawData[++indexXZ] = readValue;
        textureY._rawData[++indexXZ] = readValue;
        textureY._rawData[++indexXZ] = 255;
      }
    }
    this._sliceY._texture = textureY;
    this._sliceY._texture._dirty = true;
  }

  if (rx) {
    // X direction
    var textureX = new X.texture();
    textureX._rawDataWidth = height;
    textureX._rawDataHeight = depth;
    textureX._rawData = new Uint8Array(4 * height * depth);
    for (var j = 0; j < height; j++) {
      for (var k = 0; k < depth; k++) {
        var readValue = this._datastream[this._indexX+j*width+k*width*height] * 255 / this._max;
        var indexYZ = 4*(j+k*height);
        textureX._rawData[indexYZ] = readValue;
        textureX._rawData[++indexYZ] = readValue;
        textureX._rawData[++indexYZ] = readValue;
        textureX._rawData[++indexYZ] = 255;
      }
    }
    this._sliceX._texture = textureX;
    this._sliceX._texture._dirty = true;
  }

  if (rz) {
    // Z direction
    var textureZ = new X.texture();
    textureZ._rawDataWidth = width;
    textureZ._rawDataHeight = height;
    textureZ._rawData = new Uint8Array(4 * width * height);
    for (var i = 0; i < width; i++) {
      for (var j = 0; j < height; j++) {
        var readValue = this._datastream[i+j*width+this._indexZ*width*height] * 255 / this._max;
        var indexXY = 4*(i+j*width);
        textureZ._rawData[indexXY] = readValue;
        textureZ._rawData[++indexXY] = readValue;
        textureZ._rawData[++indexXY] = readValue;
        textureZ._rawData[++indexXY] = 255;
      }
    }
    this._sliceZ._texture = textureZ;
    this._sliceZ._texture._dirty = true;
  }

};


// export symbols (required for advanced compilation)
goog.exportSymbol('X.neoVolume', X.neoVolume);
goog.exportSymbol('X.neoVolume.prototype.modified', X.neoVolume.prototype.modified);
