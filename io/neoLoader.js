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

goog.provide('X.neoLoader');
// requires
goog.require('X.loader');
goog.require('X.parserNEO');



/**
 * This object loads external files in an asynchronous fashion. In addition, the
 * loading process is monitored and summarized to a total progress value.
 * 
 * @constructor
 * @extends X.loader
 */
X.neoLoader = function() {

  // call the standard constructor of X.loader
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'neoLoader';
  
};
// inherit from X.base
goog.inherits(X.neoLoader, X.loader);


/**
 * Check if the given container is configured with a valid file format.
 * 
 * @param {!X.base} container A container which has an X.file() attached.
 * @return {!Array} An array holding the following information [filepath,
 *         extension in uppercase without the '.', the associated but
 *         uninstantiated parser for this file format, additional (optional)
 *         flags which are passed to the parser, the response type]
 * @throws {Error} An error, if the configured file format is not supported.
 */
X.neoLoader.prototype.checkFileFormat = function(container) {

  // get the associated file of the object
  var filepath = container._file._path;
  
  // grab the file extension
  var extension = filepath.split('.').pop().toUpperCase();
  
  // check if the file format is supported
  if (!(extension in X.neoLoader.extensions)) {
    
    throw new Error('The ' + extension + ' file format is not supported.');
    
  }
  
  return [filepath, extension, X.neoLoader.extensions[extension][0],
          X.neoLoader.extensions[extension][1], X.neoLoader.extensions[extension][2]];
  
};



/**
 * Supported data types by extension.
 * 
 * @enum {Array}
 */
X.neoLoader.extensions = {
  // support for the following extensions and the mapping to X.parsers as well
  // as some custom flags and the result type
  'STL': [X.parserSTL, null, null],
  'VTK': [X.parserVTK, null, null],
  'TRK': [X.parserTRK, null, null],
  'NEO': [X.parserNEO, null, 'arraybuffer'],
  // FSM, INFLATED, SMOOTHWM, SPHERE, PIAL and ORIG are all freesurfer meshes
  'FSM': [X.parserFSM, null, null],
  'INFLATED': [X.parserFSM, null, null],
  'SMOOTHWM': [X.parserFSM, null, null],
  'SPHERE': [X.parserFSM, null, null],
  'PIAL': [X.parserFSM, null, null],
  'ORIG': [X.parserFSM, null, null],
  'NRRD': [X.parserNRRD, null, null],
  'CRV': [X.parserCRV, null, null],
  'MGH': [X.parserMGZ, false, null],
  'MGZ': [X.parserMGZ, true, null],
  'TXT': [X.parserLUT, null, null],
  'LUT': [X.parserLUT, null, null],
  'PNG': [X.parserIMAGE, 'png', 'arraybuffer'], // here we use the arraybuffer
  // response type
  'JPG': [X.parserIMAGE, 'jpeg', 'arraybuffer'],
  'JPEG': [X.parserIMAGE, 'jpeg', 'arraybuffer'],
  'GIF': [X.parserIMAGE, 'gif', 'arraybuffer']
};
