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
  params = paramsWithDefaults(params, {
    h:10, 
    r1:8, 
    r2:6, 
    nNotches:13,
    notchDepth:0.1,
    resolution:60,
  });
  let r1 = params.r1;
  let r2 = params.r2;
  let h = params.h;
  
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
  params = paramsWithDefaults(params, {
    h:10, 
    r1:8.5, 
    r2:6.5, 
    nNotches:13, 
    d:2,
    resolution:60,
  });
  let h = params.h;
  let r1 = params.r1;
  let r2 = params.r2;
  let nNotches = params.nNotches;
  let d = params.d;
  let resolution = params.resolution;
  
  return notchedCone({
    h:h,
    r1:r1,
    r2:r2,
    nNotches:nNotches,
    resolution:resolution,
  }).subtract(
    CSG.cylinder({
      start:[0,0,0],
      end:[0,0,h-d],
      radiusStart:r1-d,
      radiusEnd:r2-d,
      resolution:resolution,
    })
  )
}

function gripper(params) {
  params = paramsWithDefaults(params, {
    baseHeight: 2,
    flatShaftLength: 5,
    totalHeight: 10,
    thickness: 0.5,
    extra: 0.1,
    resolution: 60,
  });
  let baseHeight = params.baseHeight;
  let flatShaftLength = params.flatShaftLength;
  let totalHeight = params.totalHeight;
  let thickness = params.thickness;
  let extra = params.extra;
  let resolution = params.resolution;
  
  let shaft = flatShaft({
    h: flatShaftLength,
    extra:extra,
  });
  return CSG.cylinder({
    start: [0, 0, baseHeight],
    end: [0, 0, totalHeight],
    radius: 3 + thickness + extra,
    resolution: resolution,
  }).subtract(shaft.translate([0, 0, baseHeight]));
}
 
function main(params) {
  debug("Calling main() with params " + JSON.stringify(params));
  
  params = paramsWithDefaults(params, {
    nNotches: 13,
    flattenedShaftLength: 5,
    baseHeight: 2,
    gripperThickness: 0.5,
    resolution: 60,
    extra: 0.1,
  });
  
  debug("main() params with defaults are " + JSON.stringify(params));
  
  let flatShaftLength = params.flattenedShaftLength;
  let baseHeight = params.baseHeight;
  let gripperThckness = params.gripperThickness;
  let totalHeight = baseHeight + flatShaftLength + 3;
  let extra = params.extra;
  let resolution = params.resolution;
  let nNotches = params.nNotches;

  return union([
    gripper({
      baseHeight: baseHeight,
      flatShaftLength: flatShaftLength,
      totalHeigh: totalHeight,
      thickness: gripperThckness,
      extra: extra,
      resolution: resolution,
    }),
    shell({
      h: 10, 
      r1: 8, 
      r2: 6, 
      nNotches: nNotches, 
      d: 1.5,
      resolution: resolution,
    }),
  ]);
}