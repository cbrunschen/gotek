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

var pcb = {};

pcb.w1 = 59;
pcb.h1 = 54.5;
pcb.w2 = 39;
pcb.h2 = 57.25;
pcb.h = pcb.h1 + pcb.h2; // 111.75; measured, matches h1 + h2
pcb.d = 1;

pcb.rHole = 1.5;
pcb.dEdge = 3;
pcb.x1 = pcb.dEdge + pcb.rHole;
pcb.x2 = pcb.x1 + 50;

pcb.y1 = 21.5 + pcb.rHole;
pcb.y2 = pcb.y1 + 21.25;
pcb.y3 = pcb.y2 + 50;

function debug(s) {
  // console.log(s);
}

pcb.board = function() {
  debug("pcb = " + JSON.stringify(pcb));
  debug("size=" + JSON.stringify({size: [pcb.w1, pcb.h1, pcb.d]}));
  return union([
    cube({size: [pcb.w1, pcb.h1, pcb.d]}),
    cube({size: [pcb.w2, pcb.h2+0.1, pcb.d]}).translate([0, pcb.h1-0.1, 0]),
  ]);
}

pcb.holes = function() {
  return union([
    cylinder({r:pcb.r, h:pcb.d, center:true}).translate([pcb.x1, pcb.y1, 0]),
    cylinder({r:pcb.r, h:pcb.d, center:true}).translate([pcb.x2, pcb.y1, 0]),
    cylinder({r:pcb.r, h:pcb.d, center:true}).translate([pcb.x1, pcb.y2, 0]),
    cylinder({r:pcb.r, h:pcb.d, center:true}).translate([pcb.x2, pcb.y2, 0]),
    cylinder({r:pcb.r, h:pcb.d, center:true}).translate([pcb.x1, pcb.y3, 0]),
  ]).translate([0, 0, pcb.d/2]).scale([1, 1, 2]);
}

pcb.hConn = 7;
pcb.yConn = -pcb.hConn;
pcb.yConnMax = 16;

pcb.notch = {};
pcb.notch.x = 33;
pcb.notch.w = 8;
pcb.notch.y = pcb.yConn - 10;
pcb.notch.h = 0 - pcb.notch.y;
pcb.notch.z = -1.5;
pcb.notch.d = pcb.d + 2 * 2.54;
pcb.notch.p1 = [pcb.notch.x, pcb.notch.y, pcb.notch.z];
pcb.notch.p2 = [pcb.notch.x + pcb.notch.w, pcb.notch.y + pcb.notch.h, pcb.notch.z + pcb.notch.d];

pcb.connectors = function() {
  debug("connectors()");
  return union([
    // power connector
    cube({size: [10, pcb.hConn+3, 5]}).translate([1, pcb.yConn, 0]),

    // FDC connector
    cube({size: [17*2.54, pcb.hConn+5, 5.08]}).translate([pcb.w1 - 17*2.54, pcb.yConn, 0]),

    // headers
    cube({size: [7*2.54, 2*2.54, 8]}).translate([17, 8, 0]),

    // programming headers
    cube({size: [5*2.54, 2.54, 6.5]}).translate([2.54, 8+2.54, 0]),
    cube({size: [4*2.54, 2.54, 6.5]}).translate([2*2.54, 8, 0]),
  ]).translate([0, 0, pcb.d]);
}

pcb.model = function() {
  debug("pcb()");
  return pcb.board().subtract(pcb.holes()).union(pcb.connectors());
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

var support = {};
support.model = function(params) {
  params = paramsWithDefaults(params, {
    rO: 3,
    rI: pcb.rHole,
    h : 2,
    d : 1,
  });
  var rO = params.rO;
  var rI = params.rI;
  var h = params.h;
  var d = params.d;
  
  debug("support(" + JSON.stringify(params) + ")");
  if (d >=0) {
    return union([
      cylinder({r:rO, h:h, center:true}).translate([0, 0, -h/2]),
      cylinder({r:rI, h:d, center:true}).translate([0, 0, d/2]),
    ]);
  } else {
    return difference([
      cylinder({r:rO, h:h, center:true}).translate([0, 0, -h/2]),
      cylinder({r:rI, h:abs(d)+0.2, center:true}).translate([0, 0, d/2+0.1]),
    ]);
  }
}

var supports = {};
supports.model = function(params) {
  params = paramsWithDefaults(params, {
    rO: 2.5,
    rI: pcb.rHole - 0.2,
    hh : 2,
    d : 2,
  });
  
  var rO = params.rO;
  var rI = params.rI;
  var hh = params.hh;
  var d = params.d;
  
  var dh = -(hh - 1);
  return union([
    support.model({rO:rO, rI:rI, h:hh, d:2}).translate([pcb.x1, pcb.y1, 0]),
    support.model({rO:rO, rI:rI, h:hh, d:2}).translate([pcb.x2, pcb.y1, 0]),
    support.model({rO:rO, rI:1.5, h:hh, d:dh}).translate([pcb.x1, pcb.y2, 0]),
    support.model({rO:rO, rI:1.5, h:hh, d:dh}).translate([pcb.x2, pcb.y2, 0]),
    support.model({rO:rO, rI:1.5, h:hh, d:dh}).translate([pcb.x1, pcb.y3, 0]),
  ]);
}

topSupport = {};
topSupport.hole = function(params) {
  params = paramsWithDefaults(params, {
    rO: 3,
    rI: pcb.rHole,
    hh : 2,
    d : 1,
  });

  var rO = params.rO;
  var rI = params.rI;
  var hh = params.hh;
  var d = params.d;

  return union([
    cylinder({r:rO, h:hh * 2}).translate([0, 0, -(hh-d)]),
    cylinder({r:rI, h:10}).translate([0, 0, -(hh-d)-9.9]),
  ]);
}

topSupport.body = function(params) {
  params = paramsWithDefaults(params, {
    rO: 3,
    rI: pcb.rHole,
    hh : 2,
    d : 1,
  });

  var rO = params.rO;
  var rI = params.rI;
  var hh = params.hh;
  var d = params.d;

  return cylinder({r:rO+d, h:hh}).translate([0, 0, -hh]);
}

topSupports = {};
topSupports.model = function(params) {
  return union([
    topSupport.body(params).translate([pcb.x1, pcb.y2, 0]),
    topSupport.body(params).translate([pcb.x2, pcb.y2, 0]),
    topSupport.body(params).translate([pcb.x1, pcb.y3, 0]),
  ]);
}

topSupports.holes = function(params) {
  return union([
    topSupport.hole(params).translate([pcb.x1, pcb.y2, 0]),
    topSupport.hole(params).translate([pcb.x2, pcb.y2, 0]),
    topSupport.hole(params).translate([pcb.x1, pcb.y3, 0]),
  ]);
}

var buttons = {};
buttons.rHole = 1.9 + 0.2;
buttons.r = 1.6;
buttons.z = pcb.d + 4;

buttons.xSpacing = 7.5;
buttons.x1 = 1 + buttons.xSpacing / 2;
buttons.x2 = buttons.x1 + buttons.xSpacing;
buttons.x0 = buttons.x1 - buttons.xSpacing;

function horizontalCylinder(x, y, z, r, d) {
    debug("horizontalCylinder()");
    return cylinder({r:r, h:d, center:true})
        .rotateX(-90)
        .translate([x, y + d/2, z]);
}

buttons.button = function(params) {
  params = paramsWithDefaults(params, {
    x: 0,
  });
  debug("buttons.button(" + JSON.stringify(params) + ")");
  var x = params.x;
  
  return union([
    horizontalCylinder(x, 0, buttons.z, buttons.r, 5),
    cube({size: [6, 6, 6]}).translate([x-3, -6, pcb.d]),    
  ]);
}

buttons.buttonHole = function(params) {
  params = paramsWithDefaults(params, {
    x: 0,
    extra: 0,
  });
  debug("buttons.buttonHole(" + JSON.stringify(params) + ")");
  var x = params.x;
  var extra = params.extra;
  
  return horizontalCylinder(x, -1, buttons.z, buttons.rHole+extra, 6);
}

buttons.buttons = function(perButton, params) {
  params = paramsWithDefaults(params, {
    extra: 0,
    n: 3
  });
  var extra = params.extra;
  var n = params.n;
  
  debug("buttons.buttons(" + JSON.stringify(params) + ")");
  var result = [];
  if (n == 3) {
    result.push(perButton({x:buttons.x0, extra:extra}));
  }
  result.push(perButton({x:buttons.x1, extra:extra}));
  result.push(perButton({x:buttons.x2, extra:extra}));
  
  return union(result).translate([0, pcb.h, 0]);
}


buttons.model = function(params) {
  return buttons.buttons(buttons.button, params);
}

buttons.holes = function(params) {
  return buttons.buttons(buttons.buttonHole, params);
}

var leds = {};
leds.z = buttons.z + 7.5;
leds.r = 1.5;
leds.rHole = 1.55;
leds.x1 = buttons.x1;
leds.x2 = buttons.x2;

leds.led = function(params) {
  params = paramsWithDefaults(params, {
    x: leds.x1,
  });
  var x = params.x;
  
  debug("leds.led(" + JSON.stringify(params) + ")");
  return horizontalCylinder(x, 0, leds.z, leds.r, 4)
      .translate([0, pcb.h-1, 0]);
}

leds.ledHole = function(params) {
  params = paramsWithDefaults(params, {
    extra: 0,
    x: leds.x1,
  });
  var extra = params.extra;
  var x = params.x;
  
  debug("leds.ledHole(" + JSON.stringify(params) + ")");
  return horizontalCylinder(x, 0, leds.z, leds.rHole+extra, 6)
      .translate([0, pcb.h-2, 0]);
}

leds.leds = function(perLed, params) {
  params = paramsWithDefaults(params, {
    extra: 0,
    n:1,
  });
  debug("leds(" + JSON.stringify(params) + ")");
  var n = params.n;
  var extra = params.extra;
  
  var result = [];
  if (n == 2) {
    result.push(perLed({x:leds.x2, extra:extra}));
  }
  result.push(perLed({c:leds.x1, extra:extra}));
  return union(result);
}

leds.model = function(params) {
  return leds.leds(leds.led, params);
}

leds.holes = function(params) {
  return leds.leds(leds.ledHole, params);
}

usb = {};
usb.w = 15;
usb.h = 7.5;
usb.d = 20;
usb.x = 22 + usb.w/2;
usb.y = pcb.h;
usb.z = pcb.d + usb.h/2;
usb.r = 1.75;

usb.model = function(params) {
  return CSG.roundedCube({
    center:[usb.x, usb.y, usb.z],
    radius:[usb.w/2, usb.d/2, usb.h/2], 
    roundradius:usb.r, 
    resolution:24});
}

usb.hole = function(params) {
  params = paramsWithDefaults(params, {
    extra: 0,
  });
  var extra = params.extra;
  
  return CSG.roundedCube({
    center:[usb.x, usb.y, usb.z],
    radius:[usb.w/2+extra, usb.d/2, usb.h/2+extra], 
    roundradius:usb.r, 
    resolution:24});
}

oled = {};
// width of PCB = 38mm
oled.w = 38;
// Height of PCB = 12mm
oled.h = 12;
// Depth of PCB plus display etc = 2.8mm
oled.d = 2.8;

oled.leftPcb = 7;
oled.rightPcb = 4.4;
oled.wGlass = 26.6;

oled.vw = 24.4;
oled.vx = oled.leftPcb + 1.1;
oled.vh = 7.6;
oled.vz = oled.h-1.1-oled.vh;

oled.placeXZ = function(params) {
  params = paramsWithDefaults(params, {
    extra: 0.15,
    holderThickness: 1,
  });
  
  var extra = params.extra;
  var holderThickness = params.holderThickness;
  
  x = pcb.w2 + holderThickness + 0.5 + extra;
  z = usb.z - oled.vh/2 - oled.vz;
  return [x, z];
}

oled.hole = function(params) {
  params = paramsWithDefaults(params, {
    extra: 0.15,
    shieldThickness: 0.5,
  });
  var extra = params.extra;
  var shieldThickness = params.shieldThickness;
  
  debug("oled.hole(" + JSON.stringify(params) + ")");
  
  overlap = 0.1;
  return union([
    // PCB + display module + pins + folded flat cable:
    // - start 5mm back to allow space for insertion
    CSG.cube({
      corner1: [-extra, -(5+oled.d+shieldThickness), -extra],
      corner2: [oled.w+extra, -shieldThickness, oled.h+extra],
    }),

    // display active area including border!
    // push it out 4mm to ensure it penetrates through the front
    // of the faceplate
    // starts at 5mm (pcb inset) + 1.1mm (from the display edge),
    CSG.cube({
      corner1: [oled.vx, -(overlap+shieldThickness), oled.vz],
      corner2: [oled.vx + oled.vw, 4+overlap, oled.vz + oled.vh],
    }),
  ]);  
}

oled.holder = function(params) {
  params = paramsWithDefaults(params, {
    holderThickness: 1,
    extra: 0.15,
    depth: 1 + oled.d,
  });
  
  debug("oled.holder(" + JSON.stringify(params) + ")");
  
  var thickness = params.holderThickness;
  var depth = params.depth;
  var extra = params.extra;
  var pad = thickness + extra;
  
  debug("oled.holder(): pad is " + pad);
  
  var grabberLen = depth - oled.d;
  // var grabberMidY = -depth + grabberLen * 3 / 4;
  var sideGrabberZ = oled.vz + oled.vh / 4;
  var sideGrabberH = oled.vh / 2;
  
  grabbers = [
    //left
    CSG.cube({
      corner1: [-pad, -depth, sideGrabberZ],
      corner2: [-pad + thickness, 0, sideGrabberZ + sideGrabberH],
    }),
    // CAG.fromPoints([
    //   [0, -depth, 0],
    //   [0.5,  grabberMidY, 0],
    //   [0, -oled.d, 0],
    // ]).extrude({offset: [0, 0, sideGrabberH]}).translate([-extra, 0, sideGrabberZ]),
    
    //right
    CSG.cube({
      corner1: [oled.w + extra, -depth, sideGrabberZ],
      corner2: [oled.w + pad, 0, sideGrabberZ + sideGrabberH],
    }),
    // CAG.fromPoints([
    //   [0, -depth, 0],
    //   [-0.5,  grabberMidY, 0],
    //   [0, -oled.d, 0],
    // ]).extrude({offset: [0, 0, sideGrabberH]}).translate([oled.w + extra, 0, sideGrabberZ]),
  ];
    
  var gw = oled.w / 8;
  var gr = gw / 2;
  
  for (i = 0; i < 2; i++) {
    x = (1+i) * oled.w / 3;
    
    grabbers = grabbers.concat([
      //top
      CSG.cube({
        corner1: [x-gr, -depth, oled.h + extra],
        corner2: [x+gr, 0, oled.h + pad],
      }),
      // CAG.fromPoints([
      //   [0, -depth, 0],
      //   [0.5,  grabberMidY, 0],
      //   [0, -oled.d, 0],
      // ]).extrude({offset: [0, 0, gw]}).rotateY(90).translate([x-gr, 0, oled.h + extra]),
  
      //bottom
      CSG.cube({
        corner1: [x-gr, -depth, -pad],
        corner2: [x+gr, 0, -extra],
      }),
      // CAG.fromPoints([
      //   [0, -depth, 0],
      //   [-0.5,  grabberMidY, 0],
      //   [0, -oled.d, 0],
      // ]).extrude({offset: [0, 0, gw]}).rotateY(90).translate([x-gr, 0, -extra]),
    ]);
  }
  
  return union(grabbers);
}

threeDigitLed = {};
threeDigitLed.w = 36.5;  // pcb width
threeDigitLed.h = 17;  // pcb height
threeDigitLed.vw = 21.15;  // visible width
threeDigitLed.vh = 11.15;  // visible height
threeDigitLed.vx = 11.5;  // offset from left pcb edge to left display edge
threeDigitLed.vz = 4.5;  // offset from bottom pcb edge to bottom display edge
threeDigitLed.baseline = 6.0;  // offset from botom pcb edge to baseline for alignment
threeDigitLed.vd = 5.0; // depth (y-axis) of display from pcb surface

threeDigitLed.placeXZ = function(params) {
  params = paramsWithDefaults(params, {
    extra: 0.15,
  });

  var extra = params.extra;
  x = usb.x + usb.w/2 + 2;
  z = usb.z - (usb.h/2) - threeDigitLed.baseline;
  return [x, z];
}

threeDigitLed.hole = function(params) {
  params = paramsWithDefaults(params, {
    extra: 0.15,
  });
  var extra = params.extra;

  return CSG.cube({
    corner1: [threeDigitLed.vx-extra, -10, threeDigitLed.vz-extra],
    corner2: [threeDigitLed.vx + threeDigitLed.vw + extra, 10, threeDigitLed.vz + threeDigitLed.vh + extra],
  });
}

threeDigitLed.holder = function(params) {
  params = paramsWithDefaults(params, {
    holderThickness: 1.0,
    extra: 0.15,
    bottom: 0,
  });
  var extra = params.extra;
  var thickness = params.holderThickness;
  var bottom = params.bottom;

  return union([
    CSG.cube({
      corner1: [1, -(threeDigitLed.vd - extra), bottom],
      corner2: [1+thickness, 0, threeDigitLed.h-1],
    }),
    CSG.cube({
      corner1: [threeDigitLed.w-1-thickness, -(threeDigitLed.vd - extra), bottom],
      corner2: [threeDigitLed.w-1, 0, threeDigitLed.h-1],
    }),
  ]);
}

function makeFaceplate(params) {
  debug("making bezeled face plate with params " + JSON.stringify(params));
  debug("bevel proto = " + JSON.stringify(params.bevelProto));
    
  var width = params.width;
  var height = params.height;
  var s = params.bezelSize;
  var bevelSize = params.bevelSize;
  var bevelProto = params.bevelProto;
  var faceplateThickness = params.faceplateThickness;
  
  var inner = CSG.cube({
    corner1:[bevelSize.r, 0, bevelSize.b],
    corner2:[width + s.l + s.r - bevelSize.l, faceplateThickness, height + s.b + s.t - bevelSize.t],
  });
  
  if (bevelProto === undefined || !bevelProto) {
    return inner;
  }
    
  // make a prototype for the lower-right corner
  cornerProto = bevelProto.translate([0, 0, -1]).intersect(bevelProto.rotateY(90));

  // Let's presume we have the 4 bezel sizes. 
  var bezel = [];
  
  // let's start looking at the front of the drive, with [0, 0, 0] at the bottom-right as we look at the drive
  
  var bh = height + s.t + s.b - bevelSize.t - bevelSize.b;
  var bw = width + s.l + s.r - bevelSize.l - bevelSize.r;
 
  if (bevelSize.r > 0) {
    // add the bezel to the right-from-the-front
    bezel.push(
      bevelProto.scale([bevelSize.r, faceplateThickness, bh]).translate([-bevelSize.r, 0, bevelSize.b])
    );
  }

  if (bevelSize.l > 0) {
    // add the bezel to the left-from-the-front
    bezel.push(
      bevelProto
          .scale([bevelSize.l, faceplateThickness, bh])
          .mirroredX()
          .translate([bevelSize.l-s.l-s.r-width, 0, bevelSize.b])
    );
  }

  if (bevelSize.b > 0) {
    // add the bezel to the bottom
    bezel.push(
      bevelProto
          .scale([bevelSize.b, faceplateThickness, bw])
          .rotateY(90)
          .translate([bevelSize.l-s.l-s.r-width, 0, bevelSize.b])
    );
  }

  if (bevelSize.t > 0) {
    // add the bezel to the top
    bezel.push(
      bevelProto
          .scale([bevelSize.t, faceplateThickness, bw])
          .rotateY(-90)
          .translate([-bevelSize.r, 0, height+s.b+s.t-bevelSize.t])
    );
  }
  
  if (bevelSize.r > 0 && bevelSize.b > 0) {
    // bottom-right corner
    bezel.push(
      cornerProto.scale([bevelSize.r, faceplateThickness, bevelSize.b]).translate([-bevelSize.r, 0, bevelSize.b])
    );
  }

  if (bevelSize.r > 0 && bevelSize.t > 0) {
    // top-right corner
    bezel.push(
      cornerProto.scale([bevelSize.r, faceplateThickness, -bevelSize.t]).translate([-bevelSize.r, 0, height+s.b+s.t-bevelSize.t])
    );
  }

  if (bevelSize.l > 0 && bevelSize.t > 0) {
    // top-left corner
    bezel.push(
      cornerProto.scale([-bevelSize.l, faceplateThickness, -bevelSize.t]).translate([bevelSize.l-s.l-s.r-width, 0, height+s.b+s.t-bevelSize.t])
    );
  }

  if (bevelSize.l > 0 && bevelSize.b > 0) {
    // bottom-left corner
    bezel.push(
      cornerProto.scale([-bevelSize.l, faceplateThickness, bevelSize.b]).translate([bevelSize.l-s.l-s.r-width, 0, bevelSize.b])
    );
  }
  
  if (bezel.length > 0) {
    edges = union(bezel).rotateZ(180).translate([0, faceplateThickness, 0])
    return inner.union(edges);
  } else {
    return inner;
  }
}

faceplate = {};
faceplate.model = function(params) {
  params = paramsWithDefaults(params, {
    left: usb.x - 101.6 / 2,
    bottom: usb.z - 25.4 / 2,
    width: 101.6,
    height: 25.4,
    faceplateThickness: 2.5,
    nLeds: 2,
    nButtons: 3,
    extra: 0.15,
    holderThickness: 1,
    shieldThickness: 0.5,
    display: oled,
    displayXOffset: 0,
    debug: undefined,
  });
  var left = params.left;
  var bottom = params.bottom;
  var faceplateThickness = params.faceplateThickness;
  var width = params.width;
  var height = params.height;
  var nLeds = params.nLeds;
  var nButtons = params.nButtons;
  var extra = params.extra;
  var holderThickness = params.holderThickness;
  var shieldThickness = params.shieldThickness;
  var display = params.display;
  var displayXOffset = params.displayXOffset;
  var bezelSize = params.bezelSize;
  
  if (params.debug !== undefined && params.debug) {
    debug("params.debug is " + params.debug);
    return cube({size:[width, 1.2, height]}).translate([left, pcb.h, bottom]);
  }
  
  plate = makeFaceplate(params).translate([left - bezelSize.r, pcb.h, bottom - bezelSize.b]);
  origPlate = plate;
  
  holes = union([
    buttons.holes({n:nButtons, extra:extra}),
    leds.holes({n:nLeds, extra:extra}),
    usb.hole({extra:extra}),
  ]);
  plate = plate.subtract(holes);
  
  xz = display.placeXZ({extra:extra, holderThickness:holderThickness});
  displayX = xz[0] + displayXOffset;
  displayZ = xz[1];
  
  plate = plate.subtract(
      display.hole({holderThickness:holderThickness, shieldThickness:shieldThickness, extra:extra, bottom:bottom-displayZ})
          .translate([displayX, pcb.h+faceplateThickness, displayZ]));
  plate = plate.union(
      display.holder({holderThickness:holderThickness, shieldThickness:shieldThickness, extra:extra, bottom:bottom-displayZ})
          .translate([displayX, pcb.h+faceplateThickness, displayZ]));
  return plate.intersect(origPlate);
}

shroud = {};
shroud.model = function(params) {
  params = paramsWithDefaults(params, {
    left: usb.x - 101.6 / 2,
    bottom: usb.z - 25.4 / 2,
    width: 101.6,
    height: 25.4,
    wallThickness: 1,
    floorThickness: 1,
    shroudDepth: 5,
    shroudOverlap: 0.1,
  });
  var left = params.left;
  var bottom = params.bottom;
  var wallThickness = params.wallThickness;
  var floorThickness = params.floorThickness;
  var width = params.width;
  var height = params.height;
  var depth = params.shroudDepth;
  var overlap = params.shroudOverlap;
  var right = left + width;
  var topp = bottom + height;
  
  return union([
    CSG.cube({
      corner1: [left, pcb.h - depth, bottom],
      corner2: [left + wallThickness, pcb.h + overlap, topp],
    }),
    
    CSG.cube({
      corner1: [left, pcb.h - depth, topp - floorThickness],
      corner2: [right, pcb.h + overlap, topp],
    }),

    CSG.cube({
      corner1: [right - wallThickness, pcb.h - depth, bottom],
      corner2: [right, pcb.h + overlap, topp],
    }),

    CSG.cube({
      corner1: [left, pcb.h - depth, bottom],
      corner2: [right, pcb.h + overlap, bottom + floorThickness],
    }),
  ]);
}

mounts = {};
mounts.side = {};
mounts.side.ys = [21, 81, 111];
mounts.side.z = 4.5;
mounts.side.r = 1.2;
mounts.side.d = 2;

mounts.side.holes = function(left, right, minY) {
  debug("mounts.side.holes()");
  var holes = [];

  for (var i = 0; i < mounts.side.ys.length; i++) {
    var y = pcb.h - mounts.side.ys[i];
    if (y < minY) {
      continue;
    }

    // left
    holes.push(cylinder({r:mounts.side.r, h:6, center:true}).rotateY(-90).translate([left, y, mounts.side.z]));

    // right
    holes.push(cylinder({r:mounts.side.r, h:6, center:true}).rotateY(90).translate([right, y, mounts.side.z]));
  }

  return union(holes);
}

mounts.side.model = function(left, right, minY) {
  debug("mounts.side.model()");
  var model = [];

  var r = mounts.side.r + 1.5;

  for (var i = 0; i < mounts.side.ys.length; i++) {
    var y = pcb.h - mounts.side.ys[i];
    if (y < minY) {
      continue;
    }
    
    // left
    model.push(CSG.cylinder({
      start:  [left, y, mounts.side.z],
      end:    [left + mounts.side.d, y, mounts.side.z],
      radius: r,
      resolution:24,
    }));
    model.push(CSG.cube({
      corner1: [left, y - r, 0],
      corner2: [left + mounts.side.d, y + r, mounts.side.z],
    }));

    // right
    model.push(CSG.cylinder({
      start:  [right, y, mounts.side.z],
      end:    [right - mounts.side.d, y, mounts.side.z],
      radius: r,
      resolution:24,
    }));
    model.push(CSG.cube({
      corner1: [right, y - r, 0],
      corner2: [right - mounts.side.d, y + r, mounts.side.z],
    }));
  }

  return union(model);
}

mounts.bottom = {};
mounts.bottom.ys = [30, 100];
mounts.bottom.x = 3;
mounts.bottom.r = 1.2;
mounts.bottom.d = 2;

mounts.bottom.holes = function(left, right, minY) {
  debug("mounts.bottom.holes()");
  var holes = [];

  for (var i = 0; i < mounts.bottom.ys.length; i++) {
    var y = pcb.h - mounts.bottom.ys[i];
    
    if (y < minY) {
      continue;
    }

    // left
    holes.push(cylinder({r:mounts.bottom.r, h:4, center:true}).translate([left + mounts.bottom.x, y, 0]));

    // right
    holes.push(cylinder({r:mounts.bottom.r, h:4, center:true}).translate([right - mounts.bottom.x, y, 0]));
  }

  return union(holes);
}

mounts.bottom.model = function(left, right, minY) {
  debug("mounts.bottom.model()");
  var model = [];

  for (var i = 0; i < mounts.bottom.ys.length; i++) {
    var y = pcb.h - mounts.bottom.ys[i];
    if (y < minY) {
      continue;
    }
    
    var r = mounts.bottom.r + 1;

    // left
    model.push(CSG.cylinder({
      start:  [left + mounts.bottom.x, y, 0],
      end:    [left + mounts.bottom.x, y, mounts.bottom.d],
      radius: r,
      resolution:24,
    }));

    // right
    model.push(CSG.cylinder({
      start:  [right - mounts.bottom.x, y, 0],
      end:    [right - mounts.bottom.x, y, mounts.bottom.d],
      radius: r,
      resolution:24,
    }));
  }

  return union(model);
}

mounts.holes = function(left, right, yMin) {
  return union([
    mounts.bottom.holes(left, right, yMin),
    mounts.side.holes(left, right, yMin),
  ]);
}

mounts.model = function(left, right, yMin) {
  return union([
    mounts.side.model(left, right, yMin),
    mounts.bottom.model(left, right, yMin),
  ]);
}

box = {};
box.lower = {};
box.lower.model = function(params) {
  params = paramsWithDefaults(params, {
    left: usb.x - 101.6 / 2,
    bottom: usb.z - 25.4 / 2,
    width: 101.6,
    height: 25.4,
    floorThickness: 1,
    wallThickness: 1,
    preset: 'none',
    shroudDepth: 0,
    sideMounts: true,
    bottomMounts: true,
  });
  var left = params.left;
  var bottom = params.bottom;
  var floorThickness = params.floorThickness;
  var wallThickness = params.wallThickness;
  var width = params.width;
  var height = params.height;
  var right = left + width;
  var halfWall = wallThickness / 2;
  var outerWall = halfWall;
  var halfFloor = floorThickness / 2;
  var preset = params.preset;
  var shroudDepth = params.shroudDepth;
  var sideMounts = params.sideMounts;
  var bottomMounts = params.bottomMounts;
  
  var ll = left / 2;
  var rr = (right + pcb.w1) / 2;
  var hh = bottom + height / 2;
  var hu = hh + 1;
  var hd = hh - 1;
  var yy = pcb.yConn;
  
  if (preset == 'gotekbox') {
    // Override the self-adjusting values.
    // The width & height will have been passed in appropriately.
    wallThickness = max(1, wallThickness);
    halfWall = wallThickness / 2;
    outerWall = 1;
    ll = left + 14;
    rr = right - 14;
    hu = bottom + 14;
    hd = bottom + 12;
    yy = pcb.h - 120.5;  // 120 measured; add an extra half millimiter for safety;s sake
    shroudDepth = 0;
  }
  
  var b = union([
    CSG.cube({
      corner1: [left, yy, bottom],
      corner2: [right, pcb.h, bottom + floorThickness],
    }),
    
    CSG.cube({
      corner1: [left, yy, bottom],
      corner2: [left + wallThickness, pcb.h, hu],
    }),
    
    CSG.cube({
      corner1: [right - wallThickness, yy, bottom],
      corner2: [right, pcb.h, hu],
    }),

    CSG.cube({
      corner1: [left, yy, bottom],
      corner2: [right, yy + wallThickness, 0],
    }).subtract(CSG.cube({
      corner1: pcb.notch.p1,
      corner2: pcb.notch.p2,
    })),

    CSG.cube({
      corner1: [left, yy, bottom],
      corner2: [ll + outerWall, yy + wallThickness, hu],
    }),

    CSG.cube({
      corner1: [rr - outerWall, yy, bottom],
      corner2: [right, yy + wallThickness, hu],
    }),
    
    supports.model({hh: -bottom}),
    shroud.model(params),
  ]).subtract(union([
    CSG.cube({
      corner1: [left + outerWall, yy + outerWall, hd],
      corner2: [right - outerWall, pcb.h - shroudDepth, bottom + height], 
    }),
  ]));
  
  if (sideMounts) {
    b = b
        .union(mounts.side.model(left, right, yy).translate([0, 0, bottom]))
        .subtract(mounts.side.holes(left, right, yy).translate([0, 0, bottom]));
  }
  if (bottomMounts) {
    b = b
        .union(mounts.bottom.model(left, right, yy).translate([0, 0, bottom]))
        .subtract(mounts.bottom.holes(left, right, yy).translate([0, 0, bottom]));
  }
    
  return b;
}

box.upper = {};
box.upper.model = function(params) {
  params = paramsWithDefaults(params, {
    left: usb.x - 101.6 / 2,
    bottom: usb.z - 25.4 / 2,
    width: 101.6,
    height: 25.4,
    floorThickness: 1,
    wallThickness: 1,
    shroudDepth: 0,
  });
  var left = params.left;
  var bottom = params.bottom;
  var floorThickness = params.floorThickness;
  var wallThickness = params.wallThickness;
  var width = params.width;
  var height = params.height;
  var topp = bottom + height;
  var right = left + width;
  var halfWall = wallThickness / 2;
  var halfFloor = floorThickness / 2;
  var shroudDepth = params.shroudDepth;
  
  var yMax = pcb.h - shroudDepth;
  
  var ll = left / 2;
  var rr = (right + pcb.w1) / 2;
  var hh = bottom + height / 2;
  var hu = hh + 1;
  var hd = hh - 1;
  
  return union([
    CSG.cube({
      corner1: [left, pcb.yConnMax, topp - floorThickness],
      corner2: [right, yMax, topp],
    }),

    CSG.cube({
      corner1: [left, pcb.yConn, topp - floorThickness],
      corner2: [ll + halfWall, pcb.yConnMax + 0.1, topp],
    }),

    CSG.cube({
      corner1: [rr - halfWall, pcb.yConn, topp - floorThickness],
      corner2: [right, pcb.yConnMax + 0.1, topp],
    }),
    
    CSG.cube({
      corner1: [left, pcb.yConn, hu],
      corner2: [left + wallThickness, yMax, topp],
    }),
    CSG.cube({
      corner1: [left + halfWall, pcb.yConn + halfWall, hd],
      corner2: [left + wallThickness, yMax, topp],
    }),
    
    CSG.cube({
      corner1: [right - wallThickness, pcb.yConn, hu],
      corner2: [right, yMax, topp],
    }),
    CSG.cube({
      corner1: [right - wallThickness, pcb.yConn+halfWall, hd],
      corner2: [right - halfWall, yMax, topp],
    }),

    CSG.cube({
      corner1: [ll, pcb.yConnMax, 2],
      corner2: [rr, pcb.yConnMax + wallThickness, topp],
    }),

    CSG.cube({
      corner1: [left, pcb.yConn, hu],
      corner2: [ll+halfWall, pcb.yConn + wallThickness, topp],
    }),
    CSG.cube({
      corner1: [left+halfWall, pcb.yConn + halfWall, hd],
      corner2: [ll+halfWall, pcb.yConn + wallThickness, topp],
    }),

    CSG.cube({
      corner1: [rr-halfWall, pcb.yConn, hu],
      corner2: [right, pcb.yConn + wallThickness, topp],
    }),
    CSG.cube({
      corner1: [rr-halfWall, pcb.yConn + halfWall, hd],
      corner2: [right-halfWall, pcb.yConn + wallThickness, topp],
    }),
    
    CSG.cube({
      corner1: [ll-halfWall, pcb.yConn+halfWall, hd],
      corner2: [ll+halfWall, pcb.yConnMax + wallThickness, topp],
    }),
    CSG.cube({
      corner1: [ll-halfWall, pcb.yConn + 1.5 * wallThickness, 2],
      corner2: [ll+halfWall, pcb.yConnMax + wallThickness, topp],
    }),
    
    CSG.cube({
      corner1: [rr-halfWall, pcb.yConn+halfWall, hd],
      corner2: [rr+halfWall, pcb.yConnMax + wallThickness, topp],
    }),
    CSG.cube({
      corner1: [rr-halfWall, pcb.yConn + 1.5 * wallThickness, 2],
      corner2: [rr+halfWall, pcb.yConnMax + wallThickness, topp],
    }),
    
    topSupports.model({hh:topp-1}).translate([0, 0, topp]),
  ]).subtract(union([
    topSupports.holes({hh:topp-1}).translate([0, 0, topp]),
  ]));
}

function bottomBar(p1, p2, w, h) {
  var dx = p2[0] - p1[0];
  var dy = p2[1] - p1[1];
  
  var l = sqrt(dx*dx + dy*dy);
  angle = atan2(dy, dx);
  
  return CSG.cube({
    corner1:[0, -w/2, 0],
    corner2:[l, w/2, h],
  }).rotateZ(angle).translate([p1[0], p1[1], 0]);
}


function frame(params) {
  params = paramsWithDefaults(params, {
    left: usb.x - 101.6 / 2,
    bottom: usb.z - 25.4 / 2,
    width: 101.6,
    wallThickness: 1,
    floorThickness: 1,
    barwidth: 6,
    wallheight: 8,
    bottomMounts: true,
    sideMounts: true,
  });
  var left = params.left;
  var bottom = params.bottom;
  var floorThickness = params.floorThickness;
  var wallThickness = params.wallThickness;
  var width = params.width;
  var height = params.height;
  var w = params.barwidth;
  var h = params.wallheight;
  var r = w / 2;
  var right = left + width;
  
  var bottomMounts = params.bottomMounts;
  var sideMounts = params.sideMounts;
  
  var bottomMountY = pcb.h - mounts.bottom.ys[1];
  var sideMountY = pcb.h - mounts.side.ys[1];
  var minY = min(bottomMountY, sideMountY);
  
  var f = union([
    bottomBar([pcb.x1, pcb.y1], [right-r, pcb.h], w, floorThickness),
    bottomBar([pcb.x1, pcb.y1], [pcb.x1, pcb.h], w, floorThickness),
    
    bottomBar([pcb.x2, pcb.y1], [left+r, pcb.h], w, floorThickness),
    bottomBar([pcb.x2, pcb.y1], [pcb.x2, pcb.h], w, floorThickness),

    CSG.cylinder({
      start: [pcb.x1, pcb.y1, 0],
      end: [pcb.x1, pcb.y1, floorThickness],
      radius: r,
    }),

    CSG.cylinder({
      start: [pcb.x2, pcb.y1, 0],
      end: [pcb.x2, pcb.y1, floorThickness],
      radius: r,
    }),

    CSG.cylinder({
      start: [left+r, pcb.h, 0],
      end: [left+r, pcb.h, floorThickness],
      radius: r,
    }).intersect(CSG.cube({corner1:[left, pcb.h, 0], corner2:[left+w, pcb.h-w, floorThickness]})),

    CSG.cylinder({
      start: [right-r, pcb.h, 0],
      end: [right-r, pcb.h, floorThickness],
      radius: r,
    }).intersect(CSG.cube({corner1:[right-w, pcb.h, 0], corner2:[right, pcb.h-w, floorThickness]})),
  ]);
  
  if (bottomMounts) {
    f = union([f,
      bottomBar([left+r, pcb.h], [left+r, bottomMountY], w, floorThickness),
      bottomBar([left+r, bottomMountY], [pcb.x1, pcb.y1], w, floorThickness),
      bottomBar([right-r, pcb.h], [right-r, bottomMountY], w, floorThickness),
      bottomBar([right-r, bottomMountY], [pcb.x2, pcb.y1], w, floorThickness),

      CSG.cylinder({
        start: [left+r, bottomMountY, 0],
        end: [left+r, bottomMountY, floorThickness],
        radius: r,
      }),

      CSG.cylinder({
        start: [right-r, bottomMountY, 0],
        end: [right-r, bottomMountY, floorThickness],
        radius: r,
      }),

      mounts.bottom.model(left, right, minY),
    ]).subtract(mounts.bottom.holes(left, right, minY));
  } else {
    if (sideMounts) {
      f = union([f,
        bottomBar([left, sideMountY], [pcb.x1, pcb.y1], w, floorThickness)
            .union(CSG.cylinder({start:[left, sideMountY, 0], end:[left, sideMountY, floorThickness], radius:r}))
            .subtract(CSG.cube({corner1:[left, sideMountY-w, -1], corner2:[left-w, sideMountY+w, floorThickness+1]})),
        bottomBar([right, sideMountY], [pcb.x2, pcb.y1], w, floorThickness)
            .union(CSG.cylinder({start:[right, sideMountY, 0], end:[right, sideMountY, floorThickness], radius:r}))
            .subtract(CSG.cube({corner1:[right, sideMountY-w, -1], corner2:[right+w, sideMountY+w, floorThickness+1]})),

        CSG.cylinder({
          start: [left, sideMountY, 0],
          end: [left, sideMountY, floorThickness],
          radius: r,
        }).intersect(CSG.cube({corner1:[left, sideMountY-w, 0], corner2:[left+w, sideMountY+w, floorThickness]})),

        CSG.cylinder({
          start: [right, sideMountY, 0],
          end: [right, sideMountY, floorThickness],
          radius: r,
        }).intersect(CSG.cube({corner1:[right, sideMountY-w, 0], corner2:[right-w, sideMountY+w, floorThickness]})),
      ]);
    } else {
      f = union([f,
        bottomBar([left+r, pcb.h], [pcb.x1, pcb.y1], w, floorThickness),
        bottomBar([right-r, pcb.h], [pcb.x2, pcb.y1], w, floorThickness),
      ]);
    }
  }
    
  if (sideMounts) {
    f = union([f,
      CSG.cube({
        corner1: [left, sideMountY-h/2, 0],
        corner2: [left+wallThickness, pcb.h, h/2],
      }),
      CSG.cube({
        corner1: [left, sideMountY, 0],
        corner2: [left+wallThickness, pcb.h, h],
      }),
      CSG.cylinder({
        start: [left, sideMountY, h/2],
        end: [left+wallThickness, sideMountY, h/2],
        radius: h/2,
      }),

      CSG.cube({
        corner1: [right-wallThickness, sideMountY-h/2, 0],
        corner2: [right, pcb.h, h/2],
      }),
      CSG.cube({
        corner1: [right-wallThickness, sideMountY, 0],
        corner2: [right, pcb.h, h],
      }),
      CSG.cylinder({
        start: [right-wallThickness, sideMountY, h/2],
        end: [right, sideMountY, h/2],
        radius: h/2,
      }),
      
      mounts.side.model(left, right, minY)
    ]).subtract(mounts.side.holes(left, right, minY));
  } else {
    
  }
    
  f = f.translate([0, 0, bottom]).union(supports.model({hh: -bottom})).union(shroud.model(params));
  return f;
}

function placeholder(params) {
  params = paramsWithDefaults(params, {
    nLeds: 2,
    nButtons: 3,
  });
  var nLeds = params.nLeds;
  var nButtons = params.nButtons;

  return union([
    pcb.model(),
    buttons.model({n:nButtons}),
    leds.model({n:nLeds}),
    usb.model(),
  ]);
}

presets = {
  none: {
    "caption": "None (manual entry)",
    "params": {},
  },
  gotekbox: {
    "caption": "Gotek-compatible box",
    "params": {
      "shape": "BOX",
      "displayXOffset": 0,
      "width": 101.6,
      "height": 25.4,
      "faceplateThickness": 2.5,
      "xOffset": 0,
      "zOffset": 0,
      "shroudDepth": 0,
    },
  },
};

presetNames = [
  'none', 'gotekbox',
];
presetCaptions = [];
for (var i = 0; i < presetNames.length; i++) {
  presetCaptions[i] = presets[presetNames[i]].caption;
}

function getParameterDefinitions() {
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
    { name: 'nButtons', type: 'int', initial:3, min:2, max:3, caption: "Buttons:"},
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
 
function render(params) {
  debug("Rendering with params " + JSON.stringify(params));
  
  var shape = params.shape;
  var width = params.width;
  var height = params.height;
  var left = params.left;
  var bottom = params.bottom;
  var right = left + width;
  var topp = bottom + height;
  var wallThickness = params.wallThickness;
  var faceplateThickness = params.faceplateThickness;
  var shroudDepth = params.shroudDepth;
  var floorThickness = params.floorThickness;
  var shieldThickness = params.shieldThickness;
  var bottomMounts = params.bottomMounts;
  var sideMounts = params.sideMounts;
  var showBoard = params.showBoard;
  
  var bezel = params.bezel;
  var bezelSize = params.bezelSize;
  var bevel = params.bevel;
  var bevelProto = params.bevelProto;
  
  var parts = [];
  var delta = {dx:0, dz:0}; 
  var bezelDelta = {dx:bezelSize.r, dz:bezelSize.b};
    
  if (shape.includes('BOX')) {
    if (bezel) {
      delta = bezelDelta;
    }

    parts.push(faceplate.model(params)),
    parts.push(box.lower.model(params));
  }
  if (shape.includes('LID')) {
    parts.push(box.upper.model(params).rotateY(180).translate([2*left-2-delta.dz, 0, bottom + bottom + height - delta.dz]));
  }
  if (shape == 'FRAME') {
    if (bezel) {
      delta = bezelDelta;
    }
    parts.push(faceplate.model(params)),
    parts.push(frame(params));
  } else {
    // nothing!
  }
  
  if (showBoard) {
    parts.push(placeholder(params).setColor([1, 1, 0, 0.5]));
  }  
  
  var part = union(parts).translate([-pcb.w1/2, -pcb.h/2, -bottom]);
  var bounds = part.getBounds();
  
  cx = (bounds[0].x + bounds[1].x) / 2;
  cy = (bounds[0].y + bounds[1].y) / 2;
  return part.translate([-cx, -cy, delta.dz]);
}

function toBool(s) {
  return !!s;
}

function main(args) {
  debug("Calling main() with args " + JSON.stringify(args));
  var preset = args.preset;
  var presetArgs = presets[preset].params;
  
  // overwrite the UI value with the preset ones
  Object.keys(presetArgs).forEach(function(key) {
    debug("replacing value for '" + key + "' with new value '" + presetArgs[key] + "'");
    args[key] = presetArgs[key];
  });
  
  var shape = args.shape;
  var displayType = args.display;
  var width = args.width;
  var height = args.height;
  var xOffset = args.xOffset;
  var zOffset = args.zOffset;
  var left = usb.x - width/2 - xOffset;
  var bottom = usb.z - height/2 - zOffset;
  var nLeds = args.nLeds;
  var nButtons = args.nButtons;
  var extra = args.extra;
  var showBoard = args.showBoard;
  var faceplateThickness = args.faceplateThickness;
  var wallThickness = args.wallThickness;
  var shroudDepth = args.shroudDepth;
  var floorThickness = args.floorThickness;
  var shieldThickness = args.shieldThickness;
  var holderThickness = args.holderThickness;
  var displayXOffset = args.displayXOffset;
  var bottomMounts = toBool(args.bottomMounts);
  var sideMounts = toBool(args.sideMounts);
    
  var display = oled;
  if (displayType == '3LED') {
    display = threeDigitLed;
  }
  
  var bezel = toBool(args.bezel);
  var bezelSize = {l:0, r:0, t:0, b:0};
  if (bezel) {
    try {
      debug("bezel size = " + args.bezelSize);
      bezelSize = JSON.parse(args.bezelSize);
      debug("parsed bezel size = " + JSON.stringify(bezelSize));
    } catch (e) {
      debug("failed to parse bezel size = " + args.bezelSize);
      bezel = false;
    }
  }
  
  var bevel = toBool(args.bevel);
  var bevelSize = {l:0, r:0, t:0, b:0};
  var bevelShape;
  var bevelPath;
  var bevelProto;
  
  if (bevel) {
    try {
      debug("bevel shape = " + args.bevelShape);
      bevelShape = JSON.parse(args.bevelShape);
      debug("parsed bevel shape = " + JSON.stringify(bevelShape));
    } catch(e) {
      bevel = false;
    }
  
    if (bevel && bevelShape !== undefined && Array.isArray(bevelShape)) {
      bevelShape = [[0, 0]].concat(bevelShape).concat([[1,1], [0,1], [0,0]]);
      bevelPath = CAG.fromPoints(bevelShape);
      // the prototype is within the unit cube from orgin to [1, 1, 1].
      bevelProto = bevelPath.extrude({offset:[0, 0, 1]});
    }

    debug("bevel size = " + args.bevelSize);
    try {
      bevelSize = JSON.parse(args.bevelSize);
      debug("parsed bevel size = " + JSON.stringify(bevelSize));
    } catch (e) {
      debug("failed to parse bevel size " + argsargs.bevelSize);
      bevel = false;
    }
  }
  
  var params = {
    debug:args.debug,
    preset:preset,
    shape:shape,
    width:width,
    left:left,
    height:height,
    bottom:bottom,
    extra:extra,
    faceplateThickness:faceplateThickness,
    bezel:bezel,
    bezelSize:bezelSize,
    bevel:bevel,
    bevelSize:bevelSize,
    bevelProto:bevelProto,
    wallThickness:wallThickness,
    floorThickness:floorThickness,
    shieldThickness:shieldThickness,
    holderThickness:holderThickness,    
    shroudDepth: shroudDepth,
    nButtons: nButtons,
    nLeds: nLeds,
    display:display,
    displayXOffset: displayXOffset,
    bottomMounts: bottomMounts,
    sideMounts: sideMounts,
    showBoard: showBoard,
  };
  
  if (args.debug) {
    return debugShape(params);
  } else {
    return render(params);
  }
}

function debugDisplay(display) {
  var space = 5;
  var params = {
    extra:0.15,
    bottom:-space/2,
  }
  result = CSG.cube({
    corner1: [-space/2,-2.5, -space/2],
    corner2: [display.w+space, 0, display.h+space],
  }).subtract(display.hole(params)).union(display.holder(params)).translate([-display.w/2, -1.25, space/2]);
  result = result.intersection(CSG.cube({
    corner1: [-60, -60, 9],
    corner2: [60, 60, 15],
  })).lieFlat();
  return result;
}

function debugMounts(params) {
  return mounts.model(params.left, params.left + params.width, -50);
}

function debugShape(params) {
  // return debugDisplay(threeDigitLed);
  return debugMounts(params);
  
  result = render(params);
  bounds = result.getBounds();
  result = result.intersect(CSG.cube({
    corner1: [-100, -100, 9],
    corner2: [100,100, 60],
  }))
  .subtract(CSG.cube({corner1:[-40, -40, -40], corner2:[40, 40, 40]}))
  .translate([0, 0, -9])
  .union(CSG.cube({corner1:[bounds[0].x, bounds[0].y, 0], corner2:[bounds[1].x, bounds[0].y + 2, 1]}))
  ;
  return result;
}
