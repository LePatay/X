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
goog.provide('X.parserNEO');

// requires
goog.require('X.event');
goog.require('X.parser');
goog.require('X.triplets');
goog.require('goog.vec');
goog.require('X.neoVolume');



/**
 * Create a parser for the .NEO format.
 * 
 * @constructor
 * @extends X.parser
 */
X.parserNEO = function() {

  //
  // call the standard constructor of X.base
  goog.base(this);
  
  //
  // class attributes
  
  /**
   * @inheritDoc
   * @const
   */
  this._className = 'parserNEO';
  
};
// inherit from X.parser
goog.inherits(X.parserNEO, X.parser);


/**
 *
 */
X.parserNEO.prototype.parse = function(container, object, data, flag) {

  if (!(data instanceof ArrayBuffer)) {
    
    throw new Error("Wrong type for NEO file data");
    
  }

  var Uint8data = new Uint8Array(data); // we parse the arrayBuffer in a byte stream so later we can read it from any byte to any byte
  var position = 0;
  
  /****************
   * header begin *
   ****************/

  // soft
  var soft_name = this.parseUint8(Uint8data,position,256,10);
  position = position + soft_name.length + 1; // +1 for carriage return
  var version_string = this.parseUint8(Uint8data,position,256,10);
  position = position + version_string.length + 1;
  var version_number = this.parseUint8(Uint8data,position,256,10);
  position = position + version_number.length + 1;
  var res;
  if ((soft_name=="NEO") && version_string=="Version" && version_number=="1" || version_number=="5") {
    this.parseScene(container, object, data, flag);
    res = false;
  }else if ((soft_name=="NEI") && version_string=="Version" && version_number=="1" || version_number=="7") {
    this.parseImage(container, object, data, flag);
    res = true;
  }else throw new Error('Invalid file');
  return res;
};


/**
 * 
 */
X.parserNEO.prototype.parseScene = function(container, object, data, flag) {

  if (!(data instanceof ArrayBuffer)) {
    
    throw new Error("Wrong type for NEO file data");
    
  }

  var Uint8data = new Uint8Array(data); // we parse the arrayBuffer in a byte stream so later we can read it from any byte to any byte
  var position = 0;
  
  /**********
   * header *
   **********/

  // soft
  var soft_name = this.parseUint8(Uint8data,position,256,10);
  position = position + soft_name.length + 1; // +1 for carriage return
  var version_string = this.parseUint8(Uint8data,position,256,10);
  position = position + version_string.length + 1;
  var version_number = this.parseUint8(Uint8data,position,256,10);
  position = position + version_number.length + 1;
  version_number = parseInt(version_number, 10);
    if (soft_name!="NEO" || version_string!="Version" || (version_number!=1 && version_number!=5)) throw new Error("Not a scene !");
  
  // patient name
  var patient_name_string = this.parseUint8(Uint8data,position,256,10);
  position = position + patient_name_string.length + 1;
      if (patient_name_string != "PatientName") throw new Error("Invalid header syntax : PatientName");
  var patient_name = this.parseUint8(Uint8data,position,256,10);
  position = position + patient_name.length + 1;
  
  // patient birthdate
  var patient_birthdate_string = this.parseUint8(Uint8data,position,256,10);
  position = position + patient_birthdate_string.length + 1;
    if (patient_birthdate_string != "PatientBirthdate") throw new Error("Invalid header syntax : PatientBirthdate");
  var patient_birthdate = this.parseUint8(Uint8data,position,256,10);
  position = position + patient_birthdate.length + 1;
  
  // patient sex
  var patient_sex_string = this.parseUint8(Uint8data,position,256,10);
  position = position + patient_sex_string.length + 1;
    if (patient_sex_string != "PatientSex") throw new Error("Invalid header syntax : PatientSex");
  var patient_sex = this.parseUint8(Uint8data,position,256,10);
  position = position + patient_sex.length + 1;
  
  // pathology type
  var patient_pathology_type_string = this.parseUint8(Uint8data,position,256,10);
  position = position + patient_pathology_type_string.length + 1;
    if (patient_pathology_type_string != "PathologyType") throw new Error("Invalid header syntax : PathologyType");
  var patient_pathology_type = this.parseUint8(Uint8data,position,256,10);
  position = position + patient_pathology_type.length + 1;
  
  // pathology teeth numbers
  var patient_pathology_teethnumber_string = this.parseUint8(Uint8data,position,256,10);
  position = position + patient_pathology_teethnumber_string.length + 1;
    if (patient_pathology_teethnumber_string != "PathologyToothNumber" && patient_pathology_teethnumber_string != "PathologyTeethNumber") throw new Error("Invalid header syntax : PathologyTeethNumber");
  var patient_pathology_teethnumber = this.parseUint8(Uint8data,position,256,10);
  position = position + patient_pathology_teethnumber.length + 1;
  
  // examination date
  var patient_examdate_string = this.parseUint8(Uint8data,position,256,10);
  position = position + patient_examdate_string.length + 1;
    if (patient_examdate_string != "ExaminationDate") throw new Error("Invalid header syntax : ExaminationDate");
  var patient_examdate = this.parseUint8(Uint8data,position,256,10);
  position = position + patient_examdate.length + 1;
  
  // clinician name
  var clinician_name_string = this.parseUint8(Uint8data,position,256,10);
  position = position + clinician_name_string.length + 1;
    if (clinician_name_string != "ClinicianName") throw new Error("Invalid header syntax : ClinicianName");
  var clinician_name = this.parseUint8(Uint8data,position,256,10);
  position = position + clinician_name.length + 1;
  
  /********
   * body *
   ********/
   
  //read the color
  var color = new Array();
  for (var i = 0; i <3; i++) {
    var component = this.parseUint8(Uint8data,position,256,10);
    position = position + component.length + 1;
    color[i] = parseFloat(component/255);
  }
  object._color = color;
  
  // read the groups
  var groups_number = this.parseUint8(Uint8data,position,256,10);
  position = position + groups_number.length + 1;
  groups_number = parseInt(groups_number,10);
  window.console.log(groups_number + " groups");
  var iter = 0;
  var group_name;
  var parent_group_name;
  var visibility;
  var groups_hierarchy = new Array();
  var groups_list = new Array();
  while (iter<groups_number) {
    var thisgroup = new X.object();
  
    group_name = this.parseUint8(Uint8data,position,256,10);
    position = position + group_name.length + 1;
      if (group_name == "Tooth") group_name = "Teeth";
      
    parent_group_name = this.parseUint8(Uint8data,position,256,10);
    position = position + parent_group_name.length + 1;
      if (parent_group_name == "Scène") parent_group_name = "Scene";
    thisgroup._caption = group_name;
      
    visibility = this.parseUint8(Uint8data,position,256,10);
    position = position + visibility.length + 1;
    visibility = parseInt(visibility, 10);
    thisgroup._visible = (visibility==1)?true:false;
    
    groups_list[group_name] = thisgroup;
    groups_hierarchy[group_name] = parent_group_name;
    
    iter++;
  }
  
  // Find the root
  for (var i in groups_hierarchy) {
    if (!goog.isDefAndNotNull(groups_hierarchy[groups_hierarchy[i]])) object._caption=groups_hierarchy[i]; // we get the only group who is only declared as a parent and not as a group, it usualy is "Scene"
  }
  // we could also directly look for "Scene"
  
  // compile the hierarchy of groups from the root group by recursivity
  this.computeGroupsHierarchy(object, groups_list, groups_hierarchy);
  
  
  // read the actors
  var actors_number = this.parseUint8(Uint8data,position,256,10);
  position = position + actors_number.length + 1;
  actors_number = parseInt(actors_number,10);
  window.console.log(actors_number + " actors");
  iter = 0;
  while (iter<actors_number) {
    var actor_type;
    var actor_name;
    var actor_group_name;
    var actor_origin = new Array();
    var actor_center = new Array();
    var actor_position = new Array();
    var actor_orientation = new Array();
    var actor_normal = new Array();
    var actor_scale = new Array();
    var actor_visibility;
    var actor_opacity;
    var actor_color = new Array();
    var actor = new X.mesh();
      
    // read the datas
    actor_type = this.parseUint8(Uint8data,position,256,10);
    position = position + actor_type.length + 1;
    //
    
    actor_name = this.parseUint8(Uint8data,position,256,10);
    position = position + actor_name.length + 1;
    actor._caption=actor_name;
    
    actor_group_name = this.parseUint8(Uint8data,position,256,10);
    position = position + actor_group_name.length + 1;
      if (group_name == "Tooth") group_name = "Teeth";
      if (parent_group_name == "Scène" || parent_group_name == "Scene") parent_group_name = "";
    this.addInGroupsHierarchy(object, actor, actor_group_name);
    
    for (var i = 0; i <3; i++) {
      var coordinate = this.parseUint8(Uint8data,position,256,10);
      position = position + coordinate.length + 1;
      actor_origin[i] = parseFloat(coordinate);
    }
    
    for (var i = 0; i <3; i++) {
      var coordinate = this.parseUint8(Uint8data,position,256,10);
      position = position + coordinate.length + 1;
      actor_center[i] = parseFloat(coordinate);
    }
    
    for (var i = 0; i <3; i++) {
      var coordinate = this.parseUint8(Uint8data,position,256,10);
      position = position + coordinate.length + 1;
      actor_position[i] = parseFloat(coordinate);
    }
    
    for (var i = 0; i <3; i++) {
      var coordinate = this.parseUint8(Uint8data,position,256,10);
      position = position + coordinate.length + 1;
      actor_orientation[i] = parseFloat(coordinate);
    }
    //actor._transform.rotateX(actor_orientation[0]);
    //actor._transform.rotateY(actor_orientation[1]);
    //actor._transform.rotateZ(actor_orientation[2]);
    
    for (var i = 0; i <3; i++) {
      var coordinate = this.parseUint8(Uint8data,position,256,10);
      position = position + coordinate.length + 1;
      actor_normal[i] = parseFloat(coordinate);
    }
    
    for (var i = 0; i <3; i++) {
      var coordinate = this.parseUint8(Uint8data,position,256,10);
      position = position + coordinate.length + 1;
      actor_scale[i] = parseFloat(coordinate);
    }
    
    actor_visibility = this.parseUint8(Uint8data,position,256,10);
    position = position + actor_visibility.length + 1;
    actor_visibility = parseInt(actor_visibility, 10);
    actor._visible = (actor_visibility==1)?true:false;
    
    actor_opacity = this.parseUint8(Uint8data,position,256,10);
    position = position + actor_opacity.length + 1;
    actor_opacity = parseFloat(actor_opacity);
    actor._opacity = (actor_opacity<0)?0:(actor_opacity>1)?1:actor_opacity;
    
    for (var i = 0; i <3; i++) {
      var component = this.parseUint8(Uint8data,position,256,10);
      position = position + component.length + 1;
      actor_color[i] = parseFloat(component/255);
    }
    actor._color = actor_color;
    
    window.console.log('name: '+actor_name+', in '+actor_group_name+' group, with visibility of '+actor_visibility+' and color ['+actor_color[0]+','+actor_color[1]+','+actor_color[2]+'].');
    
    // interpret the buffered data
    var bLoaded = false;
    if (actor_type == "Point") {
      bLoaded = true;
    } else if (actor_type == "Line") {
      bLoaded = true;
    } else if (actor_type == "Sphere") {
      var sdiameter = this.parseUint8(Uint8data,position,256,10);
      position = position + sdiameter.length + 1;
      sdiameter = parseFloat(sdiameter);
      bLoaded = true;
      // create a sphere ?
    } else if (actor_type == "Cylinder") {
      var clength = this.parseUint8(Uint8data,position,256,10);
      position = position + clength.length + 1;
      clength = parseFloat(clength);
      var cdiameter = this.parseUint8(Uint8data,position,256,10);
      position = position + cdiameter.length + 1;
      cdiameter = parseFloat(cdiameter);
      bLoaded = true;
      // create a cylinder here ?
    } else if (actor_type == "Measure") {
      bLoaded = true;
    } else if (actor_type == "Vector") {
      bLoaded = true;
    } else if (actor_type == "Plane") {
      // nothing, it's ok
    } else if (actor_type == "Text") {
      bLoaded = true;
    }
    
    if (!bLoaded) {
      var points_number = this.parseUint8(Uint8data, position,256,10);
      position = position + points_number.length + 1;
      points_number = parseInt(points_number,10);
      window.console.log(actor_name + " : " + points_number + " points");
      
      var points = this.parseFloat32(Uint8data, position, points_number*3);
      position = position + points_number*4*3;
      
      var cells_number = this.parseUint8(Uint8data, position, 256, 10);
      position = position + cells_number.length + 1;
      cells_number = parseInt(cells_number,10);
      window.console.log(actor_name + " : " + cells_number + " cells");
      
      var cells = this.parseInt32(Uint8data, position, cells_number*3);
      position = position + cells_number*4*3;
      
      // store all the vertex normals
      var points_normals = new Array();
      
      for (var i = 0 ; i < cells_number ; i++) {
      
        // the 3 points of the facet
        var x = new Array(), y = new Array(), z = new Array();
        
        // the 2 first vectors
        var u = new Array(), v = new Array;
        
        for (var j = 0 ; j < 3 ; j++) { // for every point of the cell 
          // compute the points
          x[j] = points[3*cells[3*i+j]];
          y[j] = points[3*cells[3*i+j]+1];
          z[j] = points[3*cells[3*i+j]+2];
          //if (!(x instanceof Number) || !(y instanceof Number) || !(z instanceof Number)) throw new Error(x+" "+y+" "+z+" ("+i+","+j+")");
        }
        
        
        // compute the normals by a dot product
        var nx = (y[0]-y[2])*(z[1]-z[0])-(z[0]-z[2])*(y[1]-y[0]);
        var ny = (z[0]-z[2])*(x[1]-x[0])-(x[0]-x[2])*(z[1]-z[0]);
        var nz = (x[0]-x[2])*(y[1]-y[0])-(y[0]-y[2])*(x[1]-x[0]);
        var norm2 = Math.sqrt(nx*nx+ny*ny+nz*nz);
        nx/=norm2;
        ny/=norm2;
        nz/=norm2;
        
        // add the points and the normals of the facet to the corresponding X.mesh
        for (var j = 0 ; j <3 ; j++){
          actor._points.add(x[j],y[j],z[j]);
          var index = 3*cells[3*i+j];
          if (!(points_normals[index] instanceof Array)) points_normals[index] = new Array();
          points_normals[index].push(nx,ny,nz);
        }
      }
      
      // compute the vertices unique normal
      for (var k in points_normals) {
        if (points_normals[k].length>3) {
          var number_adjacent_facets = points_normals[k].length/3; // normaly max 3
          for (var l=1 ; l<number_adjacent_facets ; l++) {
            points_normals[k][0] = points_normals[k][0] + points_normals[k][3*l];
            points_normals[k][1] = points_normals[k][1] + points_normals[k][3*l+1];
            points_normals[k][2] = points_normals[k][2] + points_normals[k][3*l+2];
          }
          // normalize the new normals
          points_normals[k][0] = points_normals[k][0] / number_adjacent_facets;
          points_normals[k][1] = points_normals[k][1] / number_adjacent_facets;
          points_normals[k][2] = points_normals[k][2] / number_adjacent_facets;
        }
      }
      
      for (var i = 0 ; i < cells_number ; i++) {
        for (var j = 0 ; j <3 ; j++){
          var index = 3*cells[3*i+j];
          actor._normals.add(points_normals[index][0],points_normals[index][1],points_normals[index][2]);
        }
      }
      iter++;
    } // endif bLoaded

  }
  
  // the object should be set up here, so let's fire a modified event
  var modifiedEvent = new X.event.ModifiedEvent();
  modifiedEvent._object = object;
  modifiedEvent._container = container;
  this.dispatchEvent(modifiedEvent);
  
};


/**
 * 
 */
X.parserNEO.prototype.parseImage = function(container, object, data, flag) {

  var volume = new X.neoVolume();
  object._children.push(volume);
  object._caption = "Image";

  if (!(data instanceof ArrayBuffer)) {
    
    throw new Error("Wrong type for NEO file data");
    
  }

  var Uint8data = new Uint8Array(data); // we parse the arrayBuffer in a byte stream so later we can read it from any byte to any byte
  var position = 0;
  
  /**********
   * header *
   **********/

  // soft
  var soft_name = this.parseUint8(Uint8data,position,256,10);
  position = position + soft_name.length + 1; // +1 for carriage return
  var version_string = this.parseUint8(Uint8data,position,256,10);
  position = position + version_string.length + 1;
  var version_number = this.parseUint8(Uint8data,position,256,10);
  position = position + version_number.length + 1;
  version_number = parseInt(version_number, 10);
  var type_string = this.parseUint8(Uint8data,position,256,10);
  position = position + type_string.length + 1;
  var type = this.parseUint8(Uint8data,position,256,10);
  position = position + type.length + 1;
  type = parseInt(type, 10);
    if (soft_name!="NEI" || version_string!="Version" || (version_number!=1 && version_number!=7) || type!=0) throw new Error("Not a scene !");
  
  // size
  var size_string = this.parseUint8(Uint8data, position, 256, 10);
  position = position + size_string.length + 1;
  if (size_string != "Size") throw new Error("Invalid header size");
  
  var width = this.parseUint8(Uint8data, position, 256, 10);
  position = position + width.length + 1;
  width = parseInt(width, 10);

  var height = this.parseUint8(Uint8data, position, 256, 10);
  position = position + height.length + 1;
  height = parseInt(height, 10);

  var depth = this.parseUint8(Uint8data, position, 256, 10);
  position = position + depth.length + 1;
  depth = parseInt(depth, 10);

  var size = width * height * depth;
  
  // position
  var position_string = this.parseUint8(Uint8data, position, 256, 10);
  position = position + position_string.length + 1;
    if (position_string != "Position") throw new Error("Invalid header position");
    
  var positionX = this.parseUint8(Uint8data, position, 256, 10);
  position = position + positionX.length + 1;
  positionX = parseFloat(positionX);

  var positionY = this.parseUint8(Uint8data, position, 256, 10);
  position = position + positionY.length + 1;
  positionY = parseFloat(positionY);

  var positionZ = this.parseUint8(Uint8data, position, 256, 10);
  position = position + positionZ.length + 1;
  positionZ = parseFloat(positionZ);

  var spacing_string = this.parseUint8(Uint8data, position, 256, 10);
  position = position + spacing_string.length + 1;
    if (spacing_string != "Spacing") throw new Error("Invalid header spacing");
  
  // spacing  
  var spacingX = this.parseUint8(Uint8data, position, 256, 10);
  position = position + spacingX.length +1;
  spacingX = parseFloat(spacingX);

  var spacingY = this.parseUint8(Uint8data, position, 256, 10);
  position = position + spacingY.length + 1;
  spacingY = parseFloat(spacingY);

  var spacingZ = this.parseUint8(Uint8data, position, 256, 10);
  position = position + spacingZ.length + 1;
  spacingZ = parseFloat(spacingZ);

  // extent
  var extent_string = this.parseUint8(Uint8data, position, 256, 10);
  position = position + extent_string.length + 1;
    if (extent_string != "Extent") throw new Error("Invalid header extent");
    
  var extentLeft = this.parseUint8(Uint8data, position, 256, 10);
  position = position + extentLeft.length + 1;
  extentLeft = parseInt(extentLeft, 10);

  var extentRight = this.parseUint8(Uint8data, position, 256, 10);
  position = position + extentRight.length + 1;
  extentRight = parseInt(extentRight, 10);

  var extentTop = this.parseUint8(Uint8data, position, 256, 10);
  position = position + extentTop.length + 1;
  extentTop = parseInt(extentTop, 10);

  var extentBot = this.parseUint8(Uint8data, position, 256, 10);
  position = position + extentBot.length + 1;
  extentBot = parseInt(extentBot, 10);

  var extentNear = this.parseUint8(Uint8data, position, 256, 10);
  position = position + extentNear.length + 1;
  extentNear = parseInt(extentNear, 10);

  var extentFar = this.parseUint8(Uint8data, position, 256, 10);
  position = position + extentFar.length + 1;
  extentFar = parseInt(extentFar, 10);

  var file_name_string = this.parseUint8(Uint8data, position, 256, 10);
  position = position + file_name_string.length +1;
    if (file_name_string != "File") throw new Error("Invalid header origin file");

  var file_name = this.parseUint8(Uint8data, position, 256, 10);
  position = position + file_name.length + 1;

  var view_type_string = this.parseUint8(Uint8data, position, 256, 10);
  position = position + view_type_string.length +1;
    if (view_type_string != "ViewType") throw new Error("Invalid header view type");

  var view_type = this.parseUint8(Uint8data, position, 256, 10);
  position = position + view_type.length + 1;
  view_type = parseInt(view_type, 10);
  
  // patient name
  var patient_name_string = this.parseUint8(Uint8data,position,256,10);
  position = position + patient_name_string.length + 1;
      if (patient_name_string != "PatientName") throw new Error("Invalid header syntax : PatientName");
  var patient_name = this.parseUint8(Uint8data,position,256,10);
  position = position + patient_name.length + 1;
  
  // patient birthdate
  var patient_birthdate_string = this.parseUint8(Uint8data,position,256,10);
  position = position + patient_birthdate_string.length + 1;
    if (patient_birthdate_string != "PatientBirthdate") throw new Error("Invalid header syntax : PatientBirthdate");
  var patient_birthdate = this.parseUint8(Uint8data,position,256,10);
  position = position + patient_birthdate.length + 1;
  
  // patient sex
  var patient_sex_string = this.parseUint8(Uint8data,position,256,10);
  position = position + patient_sex_string.length + 1;
    if (patient_sex_string != "PatientSex") throw new Error("Invalid header syntax : PatientSex");
  var patient_sex = this.parseUint8(Uint8data,position,256,10);
  position = position + patient_sex.length + 1;
  
  // pathology type
  var patient_pathology_type_string = this.parseUint8(Uint8data,position,256,10);
  position = position + patient_pathology_type_string.length + 1;
    if (patient_pathology_type_string != "PathologyType") throw new Error("Invalid header syntax : PathologyType");
  var patient_pathology_type = this.parseUint8(Uint8data,position,256,10);
  position = position + patient_pathology_type.length + 1;
  
  // pathology teeth numbers
  var patient_pathology_teethnumber_string = this.parseUint8(Uint8data,position,256,10);
  position = position + patient_pathology_teethnumber_string.length + 1;
    if (patient_pathology_teethnumber_string != "PathologyToothNumber" && patient_pathology_teethnumber_string != "PathologyTeethNumber") throw new Error("Invalid header syntax : PathologyTeethNumber");
  var patient_pathology_teethnumber = this.parseUint8(Uint8data,position,256,10);
  position = position + patient_pathology_teethnumber.length + 1;
  
  // examination date
  var patient_examdate_string = this.parseUint8(Uint8data,position,256,10);
  position = position + patient_examdate_string.length + 1;
    if (patient_examdate_string != "ExaminationDate") throw new Error("Invalid header syntax : ExaminationDate");
  var patient_examdate = this.parseUint8(Uint8data,position,256,10);
  position = position + patient_examdate.length + 1;
  
  // clinician name
  var clinician_name_string = this.parseUint8(Uint8data,position,256,10);
  position = position + clinician_name_string.length + 1;
    if (clinician_name_string != "ClinicianName") throw new Error("Invalid header syntax : ClinicianName");
  var clinician_name = this.parseUint8(Uint8data,position,256,10);
  position = position + clinician_name.length + 1;
  
  // grayscale
  var graylevels = this.parseUint16(Uint8data, position, size);
  position = position + size*2; // in octets
  volume._datastream = graylevels;
    
  // set the data
  volume._dimensions = [width, height, depth];
  volume._center = [positionX, positionY, positionZ];
  volume._spacing = [spacingX, spacingY, spacingZ];
  window.console.log(size+" points with datas: "+volume._dimensions+":"+volume._center+":"+volume._spacing);
  
  // find the min and max threshold
  var min = 65535, max = 0;
  for (var i = 0; i < size; i++) {
    if (graylevels[i]<min) min = graylevels[i];
    if (graylevels[i]>max) max = graylevels[i];
  }
  volume._min = min;
  volume._max = max;
  
  if (volume._lowerThreshold == -Infinity) {
    volume._lowerThreshold = min;
  }
  if (volume._upperThreshold == Infinity) {
    volume._upperThreshold = max;
  }
  
  //volume.slicing_(-1,-1,-1);
  volume._indexX = (width - 1) / 2;
  volume._indexY = (height - 1) / 2;
  volume._indexZ = (depth - 1) / 2;
  
  // now we have the values and need to reslice in the 3 orthogonal directions
  // and create the textures for each slice
  //this.slice_(volume, graylevels, [width, height, depth], min, max);
  
  
  // the object should be set up here, so let's fire a modified event
  var modifiedEvent = new X.event.ModifiedEvent();
  modifiedEvent._object = volume;
  modifiedEvent._container = container;
  this.dispatchEvent(modifiedEvent);
  
    
};


/**
 * @param {Uint8Array} Uint8Buffer
 * @param {number} initposition
 * @param {number} maxlength
 * @param {number} parseCharCode
 * @return {string}
 */
X.parserNEO.prototype.parseUint8 = function(Uint8Buffer, initposition, maxlength,parseCharCode) {
  var length = 0;
  var position = initposition;
  var resultBuffer ="";
  while (Uint8Buffer[position]!=parseCharCode && length<=maxlength) {
    resultBuffer = resultBuffer + String.fromCharCode(Uint8Buffer[position++] & 0xff);
    length++;
  }
  return resultBuffer;
};


/**
 * @param {Uint8Array} Uint8Buffer
 * @param {number} offset
 * @param {number} length
 * @return {Uint16Array}
 */
X.parserNEO.prototype.parseUint16 = function(Uint8Buffer,offset,length) {
  var x = new Uint8Array(Uint8Buffer.subarray(offset,length*2+offset)).buffer;
  var resultBuffer = new Uint16Array(x);
  return resultBuffer;
};


/**
 * @param {Uint8Array} Uint8Buffer
 * @param {number} offset
 * @param {number} length
 * @return {Float32Array}
 */
X.parserNEO.prototype.parseFloat32 = function(Uint8Buffer,offset,length) {
  var x = new Uint8Array(Uint8Buffer.subarray(offset,length*4+offset)).buffer;
  var resultBuffer = new Float32Array(x);
  return resultBuffer;
};


/**
 * @param {Uint8Array} Uint8Buffer
 * @param {number} offset
 * @param {number} length
 * @return {Int32Array}
 */
X.parserNEO.prototype.parseInt32 = function(Uint8Buffer,offset,length) {
  var x = new Uint8Array(Uint8Buffer.subarray(offset,length*4+offset)).buffer;
  var resultBuffer = new Int32Array(x);
  return resultBuffer;
};

/**
 * Builds the groups hierarchy by recursivity from one root node
 * 
 * @param {!X.object} myobj The root object, usualy the "Scene"
 * @param {Array} myhierarchy the table or relations parent-child between groups
 * @protected
 */
 
 X.parserNEO.prototype.computeGroupsHierarchy = function(myobj, mygroups, myhierarchy) {
 // This function developps one node of the groups tree
 function developNode(root_obj) {
    for (var i in myhierarchy) // i is a group name
    {
      if (myhierarchy[i]==root_obj._caption) {
        var child_obj = mygroups[i];
        root_obj._children.push(child_obj);
        developNode(child_obj);
      }
    }
  }
  developNode(myobj);
};

/**
 * Builds the groups hierarchy by recursivity from one root node
 * 
 * @param {!X.object} myrootgroup the root group, usualy the "Scene"
 * @param {!X.object} myobj the actor to insert in the scene
 * @param {!string} mygroup the parent group of myobj
 * @protected
 */
X.parserNEO.prototype.addInGroupsHierarchy = function(myrootgroup, myobj, mygroup) {
  // the function setInPlace places the element in the subtree that has 'root' has origin
  function setInPlace(root, new_obj, new_obj_group) {
    if (root._caption==new_obj_group) {
      root._children.push(new_obj);
    }
    else {
      var children = root._children;
      for (var i in children) {
        setInPlace(children[i], new_obj, new_obj_group);
      }
    }
  }
  setInPlace(myrootgroup, myobj, mygroup);
};

// export symbols (required for advanced compilation)
goog.exportSymbol('X.parserNEO', X.parserNEO);
goog.exportSymbol('X.parserNEO.prototype.parse', X.parserNEO.prototype.parse);
goog.exportSymbol('X.parserNEO.prototype.parseScene', X.parserNEO.prototype.parseScene);
goog.exportSymbol('X.parserNEO.prototype.parseImage', X.parserNEO.prototype.parseImage);
