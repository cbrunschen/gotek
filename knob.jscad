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
  return [];
  
  return [
    //{name:'debug', type:'checkbox', checked:0},
    {
      name: 'preset',
      type: 'choice',
      values: presetNames,
      captions: presetCaptions,
      caption: 'Preset:',
      initial: presetNames[0],
    },
    {
      name: 'shape', 
      type: 'choice', 
      values: ['BOX', 'BOX+LID', 'LID', 'FRAME'], 
      captions: ['Box only', 'Box + Lid', 'Lid only', 'Frame'],
      caption: 'Shape:',
      initial: 'FRAME',
    },
    {
      name: 'display', 
      type: 'choice', 
      values: ['OLED', '3LED'], 
      captions: ['0.91" OLED', '3 digit LED'],
      caption: 'Display:',
      initial: 'OLED',
    },
    { name: 'displayXOffset', type: 'float', initial: 0, min:-20.0, max:20.0, step:0.05, caption: "Display X offset (mm):" },
    { name: 'nLeds', type: 'int', initial:1, min:1, max:2, caption: "LEDs:"},
    { 
      name: 'controls', 
      type: 'choice', 
      values: ['2b', '2be', '3b', '3be'], 
      captions: ["2 Buttons", "2 Buttons + Encoder", "3 Buttons", "3 Buttons + Encoder"],
      initial: '3b', 
      caption: "Controls:"
    },
    { name: 'width', type: 'float', initial: 101.6, min:80.0, max:160.0, step:0.05, caption: "Bay Width (mm):" },
    { name: 'height', type: 'float', initial: 25.4, min:12.0, max:60.0, step:0.05, caption: "Bay Height (mm):" },
    { name: 'faceplateThickness', type: 'float', initial:2.5, min:0.0, max:5.0, step:0.05, caption: "Faceplate thickness (mm):"},
    { name: 'shroudDepth', type: 'float', initial:0, min:0.0, max:5.0, step:0.05, caption: "Shroud depth (mm):"},
    { name: 'bezel', type:'checkbox', checked:0, caption:'Bezel around faceplate:'},
    { name: 'bezelSize', type:'text', initial:'{"l":1, "r":1, "t":1, "b":1}', caption:'Bezel size on each side (mm):'},
    { name: 'bevel', type:'checkbox', checked:0, caption:'Bevel faceplate edges:'},
    { name: 'bevelShape', type:'text', initial:'[[0.4,0], [1,0.7]]', caption:'Bevel shape (within unit square):'},
    { name: 'bevelSize', type:'text', initial:'{"l":1, "r":1, "t":1, "b":1}', caption:'Bevel width along each edge (mm):'},
    { name: 'wallThickness', type: 'float', initial:1, min:0.0, max:5.0, step:0.05, caption: "Wall thickness (mm):"},
    { name: 'floorThickness', type: 'float', initial:1, min:0.0, max:5.0, step:0.05, caption: "Floor/Ceiling thickness (mm):"},
    { name: 'shieldThickness', type: 'float', initial:0.5, min:0.0, max:5.0, step:0.05, caption: "Display shield thickness (mm):"},
    { name: 'holderThickness', type: 'float', initial:0.5, min:0.0, max:5.0, step:0.05, caption: "Display holder thickness (mm):"},
    { name: 'xOffset', type: 'float', initial: 0, min:-20.0, max:20.0, step:0.05, caption: "X offset from center (mm):" },
    { name: 'zOffset', type: 'float', initial: 0, min:-20.0, max:20.0, step:0.05, caption: "Z offset from center (mm):" },
    { name: 'extra', type: 'float', intitial: 0.2, min:0.0, max:1.0, step:0.05, caption: "Extra space (mm):"},
    { name: 'bottomMounts', type:'checkbox', checked:1, caption:'Bottom mounting holes:'},
    { name: 'sideMounts', type:'checkbox', checked:1, caption:'Side mounting holes:'},
    { name: 'showBoard', type: 'checkbox', checked:0, caption: 'Show board:' }
  ];
}

function flatShaft(h, extra=0.2) {
  return CSG.cylinder({
    start:[0, 0, 0],
    end:[0, 0, h],
    radius:3+extra,
    resolution:120,
  }).subtract(CSG.cube({
    corner1:[-4, 1.5+extra, 0],
    corner2:[4, 4, h+1],
  }));
}

function notchedOutline(nNotches) {
  let rn1 =  0.8 * Math.PI / (2 * nNotches);
  
  let outline = CAG.circle({
    center:[0,0],
    radius:1,
    resolution:300,
  });
  
  for (let i = 0; i < nNotches; i++) {
      notch = CAG.circle({
          center:[1,0],
          radius:rn1,
      }).rotateZ(360 * i / nNotches);
      outline = outline.subtract(notch);
  }
  
  return outline;
}

function notchedOutline2(nNotches, d=0.05) {
  let d2 = d / 2;
  
  let r0 = 1 - d;
  let r1 = 1 - d/2;
  let r2 = 1;
  
  function toXY(r, angle) {
    return [r*Math.cos(angle), r*Math.sin(angle)];
  }
  
  let p = new CSG.Path2D([toXY(r1, 0)], /*closed=*/false);
  
  function lerp(a, b, t) {
    return (1.0-t) * a + t * b;
  }
  
  for (let i = 0; i < nNotches; i++) {
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
  }
  
  p = p.close();
  
  return p.innerToCAG();
}

function notchedCone(h, r1, r2, nNotches) {
  let outline = notchedOutline2(nNotches, 0.1);
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

function inside(h0=2.5, r0=6.5, h1=2, r1=3.2, h2=5, extra=0.2) {
  return union([
    CSG.cylinder({
      start:[0, 0, 0],
      end:[0, 0, h0],
      radius:r0+extra,
      resolution:120,
    }),
    CSG.cylinder({
      start:[0, 0, h0],
      end:[0, 0, h0+h1],
      radius:r1+extra,
      resolution:120,
    }),
    flatShaft(h2, extra).translate([0, 0, h0+h1]),
  ]);
}

function base(r0=7.5, h=3, r1=6, extra=0.2) {
  return union([
    new CSG.cylinder({
      start:[0, 0, 0],
      end:[0, 0, h],
      radiusStart:r0+extra,
      radiusEnd:r0+extra-0.5,
      resolution:120,
    }),
    new CSG.cylinder({
      start:[0, 0, h],
      end:[0, 0, h+1.5],
      radiusStart:r0+extra-0.5,
      radiusEnd:r1-(r0-r1)+extra,
      resolution:120,
    }),
  ]);
  
  let p = new CSG.Path2D([[0,0], [r0, 0]], /* closed = */ false);
  p = p.appendBezier([
    [r0, h], 
    [(r0+r1)/2, h], 
    [r1-h, 2*h]
  ], {resolution:120});
  p = p.appendPoints([[0, h]]);
  p = p.close();
  
  return p.innerToCAG().rotateExtrude({resolution:120});
}

function outside(h0=3, r0=7.5, r01=7, h12=8, r1=5.5, r2=4, extra=0.2) {
  let drh = (r1 - r2) / h12;
  return union([
    base(),
    notchedCone(h0 + h12, r1 + h0 * drh, r2, 17),
  ]);
    
}
 
function main(args) {
  debug("Calling main() with args " + JSON.stringify(args));

  return outside().subtract(inside());
}