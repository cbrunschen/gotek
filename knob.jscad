/**
 * Copyright 2017 Christian Brunschen
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 * 
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 * TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

function debug(s) {
  console.log(s);
}

function clone(o) {
  p = {};
  Object.keys(o).forEach(function(key) {
       p[key] = o[key];
  });
  return p;
}

function extend(o, p) {
  if (p !== null && p !== undefined) {
    Object.keys(p).forEach(function(key) {
         o[key] = p[key];
    });
  }
  return o;
}

function paramsWithDefaults(params, defaults) {
  return extend(clone(defaults), params);
}

function getParameterDefinitions() {
  return [
    {
      name: 'nNotches',
      type: 'int', 
      initial:13, 
      min:1, 
      max:29, 
      caption: "Notches:"
    },

    {
      name: 'notchDepth',
      type: 'float', 
      initial: 0.1, 
      min: 0.0, 
      max: 1.0, 
      step: 0.05,
      caption: "Notch depth (fraction):"
    },
    
    { 
      name: 'bottomRadius', 
      type: 'float', 
      initial: 8.5, 
      min: 5.0, 
      max: 15.0, 
      step: 0.05, 
      caption: "Bottom radius (mm):"
    },
    
    { 
      name: 'topRadius', 
      type: 'float', 
      initial: 6.5, 
      min: 5.0, 
      max: 15.0, 
      step: 0.05, 
      caption: "Top radius (mm):"
    },

    { 
      name: 'wallThickness', 
      type: 'float', 
      initial: 2.0, 
      min: 0., 
      max: 15.0, 
      step: 0.05, 
      caption: "Wall thickness (mm):"
    },

    { 
      name: 'ceilingThickness', 
      type: 'float', 
      initial: 2.0, 
      min: 0., 
      max: 15.0, 
      step: 0.05, 
      caption: "Ceiling thickness (mm):"
    },
    
    { 
      name: 'flattenedShaftLength', 
      type: 'float', 
      initial: 5.0, 
      min: 1.0, 
      max: 30.0, 
      step: 0.05, 
      caption: "Flattenet Shaft Length (mm):"
    },
    
    { 
      name: 'baseHeight', 
      type: 'float', 
      initial: 4.5, 
      min: 0.0, 
      max: 15.0, 
      step :0.05, 
      caption: "Base height (mm):"
    },

    { 
      name: 'gripperThickness', 
      type: 'float', 
      initial: 0.5, 
      min: 0.1, 
      max: 3.0, 
      step: 0.05, 
      caption: "Gripper thickness (mm):"
    },
    
    {
      name: 'resolution',
      type: 'int', 
      initial: 30, 
      min: 12, 
      max: 360, 
      caption: "Resolution:"
    },

    { 
      name: 'extra', 
      type: 'float', 
      initial: 0.1, 
      min: 0.0, 
      max: 0.3, 
      step: 0.01, 
      caption: "Extra (mm):"
    },
    
  ];
  
}

function flatShaft(params) {
  params = paramsWithDefaults(params, {
    h:5, 
    resolution:60,
    extra:0.2
  });
  debug("flatShaft params = " + JSON.stringify(params));
  let h = params.h;
  let extra = params.extra;
  let resolution = params.resolution;
  
  return CSG.cylinder({
    start:[0, 0, 0],
    end:[0, 0, h],
    radius:3+extra,
    resolution:resolution,
  }).subtract(CSG.cube({
    corner1:[-4, 1.5+extra, 0],
    corner2:[4, 4, h+1],
  }));
}

function lerp(a, b, t) {
  return (1.0-t) * a + t * b;
}

function toXY(r, angle) {
  return [r*Math.cos(angle), r*Math.sin(angle)];
}

function norm(dx, dy) {
  return Math.sqrt(dx*dx + dy*dy);
}

/*
Old shape:
     let startAngle = (2*Math.PI) * (i/nNotches);
     let endAngle = (2*Math.PI) * ((i+1)/nNotches);
     let a1 = lerp(startAngle, endAngle, 0.25);
     
     p = p.appendBezier([
       toXY(r0, startAngle),
       toXY(r0, a1),
       toXY(r1, a1),
     ], {resolution:60});
     p = p.appendBezier([
       toXY(r2, a1),
       toXY(r2, endAngle),
      toXY(r1, endAngle),
     ], {resolution:60});
*/

function notchedOutline(params) {
  debug("notchedOutline(" + JSON.stringify(params) + ")")
  params = paramsWithDefaults(params, {
    nNotches: 13,
    notchDepth: 0.05,
    resolution: 60,
  });
  let nNotches = params.nNotches;
  let d = params.notchDepth;
  let resolution = params.resolution;
  
  let template = new CSG.Path2D([[0, 2]], /*closed=*/false);
  template = template.appendBezier([
    [1, 2],
    [3, 1.6],
    [3, 1]
  ], {resolution:resolution}).appendBezier([
    [3, 0.4],
    [3.4, 0],
    [4, 0]
  ], {resolution:resolution}).appendBezier([
    [4.6, 0],
    [5, 0.4],
    [5, 1]
  ], {resolution:resolution}).appendBezier([
    [5, 1.6],
    [7, 2],
    [8, 2]
  ], {resolution:resolution});
    
  let th = 2;
  let tw = 8;
  
  let r1 = 1;
  let r0 = r1 - d;  

  let pp = new CSG.Path2D([toXY(r1, 0)], /*closed=*/false);
    
  for (let i = 0; i < nNotches; i++) {
    let startAngle = (2*Math.PI) * (i/nNotches);
    let endAngle = (2*Math.PI) * ((i+1)/nNotches);
    
    for (let j = 0; j < template.points.length; j++) {
      let p = template.points[j];
      let a = p.x / tw;
      let b = p.y / th;
      pp = pp.appendPoint(toXY(lerp(r0, r1, b), lerp(startAngle, endAngle, a)));
    }
  }
  
  pp = pp.close();
  
  return pp.innerToCAG();
}

function notchedCone(params) {
  debug("notchedCone(" + JSON.stringify(params) + ")")
  params = paramsWithDefaults(params, {
    height:10, 
    bottomRadius:8, 
    topRadius:6, 
    nNotches:13,
    notchDepth:0.1,
    resolution:60,
  });
  let r1 = params.bottomRadius;
  let r2 = params.topRadius;
  let h = params.height;
  
  let outline = notchedOutline(params);
  let dr = r2 - r1;
  
  let f = function(point, axis, normal) {
      var t = point.z / h;
      var r = r1 + t * dr;
      debug("t=" + t + ", dr=" + dr + " => r=" + r);
      return outline.scale([r, r]);
  }

  var cs = new CSG.ConnectorList();
  cs.appendConnector(new CSG.Connector([0,0,0], [0,0,1], [1,0,0]));
  cs.appendConnector(new CSG.Connector([0,0,h], [0,0,1], [1,0,0]));
  
  return cs.followWith(f);
}

function shell(params) {
  debug("shell(" + JSON.stringify(params) + ")")
  params = paramsWithDefaults(params, {
    height:10, 
    bottomRadius:8.5, 
    topRadius:6.5, 
    nNotches:13, 
    notchDepth:0.1,
    wallThickness:2,
    ceilingThickness:1,
    resolution:60,
  });
  let h = params.height;
  let r1 = params.bottomRadius;
  let r2 = params.topRadius;
  let nNotches = params.nNotches;
  let notchDepth = params.notchDepth;
  let d = params.wallThickness;
  let e = params.ceilingThickness;
  let resolution = params.resolution;
  
  return notchedCone({
    height:h,
    bottomRadius:r1,
    topRadius:r2,
    nNotches:nNotches,
    notchDepth:notchDepth,
    resolution:resolution,
  }).subtract(
    CSG.cylinder({
      start:[0,0,0],
      end:[0,0,h - e],
      radiusStart:r1 - d,
      radiusEnd:r2 - d,
      resolution:resolution,
    })
  )
}

function gripper(params) {
  debug("gripper(" + JSON.stringify(params) + ")")
  params = paramsWithDefaults(params, {
    baseHeight: 2,
    flatShaftLength: 5,
    height: 10,
    thickness: 0.5,
    extra: 0.1,
    resolution: 60,
  });
  let baseHeight = params.baseHeight;
  let flatShaftLength = params.flatShaftLength;
  let height = params.height;
  let thickness = params.thickness;
  let extra = params.extra;
  let resolution = params.resolution;
  
  let shaft = flatShaft({
    h: flatShaftLength,
    extra:extra,
  });
  return CSG.cylinder({
    start: [0, 0, baseHeight],
    end: [0, 0, height],
    radius: 3 + thickness + extra,
    resolution: resolution,
  }).subtract(shaft.translate([0, 0, baseHeight]));
}
 
function main(params) {
  debug("Calling main() with params " + JSON.stringify(params));
  
  params = paramsWithDefaults(params, {
    nNotches: 13,
    notchDepth: 0.1,
    height: 10,
    bottomRadius: 8.5,
    topRadius:6.5,
    wallThickness: 2,
    ceilingThickness: 1,
    flattenedShaftLength: 5,
    baseHeight: 2,
    gripperThickness: 0.5,
    resolution: 60,
    extra: 0.1,
  });
  
  debug("main() params with defaults are " + JSON.stringify(params));
  
  let flatShaftLength = params.flattenedShaftLength;
  let baseHeight = params.baseHeight;
  let wallThickness = params.wallThickness;
  let ceilingThickness = params.ceilingThickness;
  let gripperThickness = params.gripperThickness;
  let bottomRadius = params.bottomRadius;
  let topRadius = params.topRadius;
  let height = baseHeight + flatShaftLength + ceilingThickness;
  let extra = params.extra;
  let resolution = params.resolution;
  let nNotches = params.nNotches;
  let notchDepth = params.notchDepth;

  return union([
    gripper({
      baseHeight: baseHeight,
      flatShaftLength: flatShaftLength,
      height: height,
      thickness: gripperThickness,
      extra: extra,
      resolution: resolution,
    }),
    shell({
      height: height, 
      bottomRadius: bottomRadius, 
      topRadius: topRadius, 
      nNotches: nNotches, 
      notchDepth: notchDepth,
      wallThickness: wallThickness,
      ceilingThickness: ceilingThickness,
      resolution: resolution,
    }),
  ]);
}