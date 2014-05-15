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
goog.provide('X.neoSlice');

// requires
goog.require('X.slice');


/**
 * Create a displayable 2D slice/plane.
 * 
 * @constructor
 * @param {X.neoSlice=} slice Another X.neoSlice to use as a template.
 * @extends X.slice
 */
X.neoSlice = function(slice) {

  //
  // call the standard constructor of X.base
  goog.base(this);
  
  /**
   * A pointer to the parent volume of this slice.
   * 
   * @type {?X.neoVolume}
   * @protected
   */
  this._volume = null;
  
  if (goog.isDefAndNotNull(slice)) {
    
    // copy the properties of the given object over
    this.copy_(slice);
    
  }
  
};
// inherit from X.object
goog.inherits(X.neoSlice, X.slice);


// export symbols (required for advanced compilation and in particular the copy
// constructors with duck typing)
goog.exportSymbol('X.neoSlice', X.neoSlice);
