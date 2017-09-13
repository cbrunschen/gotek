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
  console.log(s);
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

function paramsWithDefaults(params, defaults) {
  result = clone(defaults);
  if (params !== null && params !== undefined) {
    Object.keys(params).forEach(function(key) {
         result[key] = params[key];
    });
  }
  return result;
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
    rO: 3,
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
    support.model({rO:2.5, rI:1.5, h:hh, d:dh}).translate([pcb.x1, pcb.y2, 0]),
    support.model({rO:2.5, rI:1.5, h:hh, d:dh}).translate([pcb.x2, pcb.y2, 0]),
    support.model({rO:2.5, rI:1.5, h:hh, d:dh}).translate([pcb.x1, pcb.y3, 0]),
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
    shield: 0.5,
  });
  var extra = params.extra;
  var shield = params.shield;
  
  debug("oled.hole(" + JSON.stringify(params) + ")");
  
  overlap = 0.1;
  return union([
    // PCB + display module + pins + folded flat cable:
    // - start 5mm back to allow space for insertion
    CSG.cube({
      corner1: [-extra, -(5+oled.d+shield), -extra],
      corner2: [oled.w+extra, -shield, oled.h+extra],
    }),

    // display active area including border!
    // push it out 4mm to ensure it penetrates through the front
    // of the faceplate
    // starts at 5mm (pcb inset) + 1.1mm (from the display edge),
    CSG.cube({
      corner1: [oled.vx, -(overlap+shield), oled.vz],
      corner2: [oled.vx + oled.vw, 4+overlap, oled.vz + oled.vh],
    }),
  ]);  
}

oled.holder = function(params) {
  params = paramsWithDefaults(params, {
    thickness: 1,
    extra: 0.15,
    depth: 1 + oled.d,
  });
  
  debug("oled.holder(" + JSON.stringify(params) + ")");
  
  var thickness = params.thickness;
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
    thickness: 1.0,
    extra: 0.15,
    bottom: 0,
  });
  var extra = params.extra;
  var thickness = params.thickness;
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

faceplate = {};
faceplate.model = function(params) {
  params = paramsWithDefaults(params, {
    left: usb.x - 101.6 / 2,
    bottom: usb.z - 25.4 / 2,
    width: 101.6,
    height: 25.4,
    thickness: 2.5,
    nLeds: 2,
    nButtons: 3,
    extra: 0.15,
    holderThickness: 1,
    display: oled,
    displayXOffset: 0,
  });
  var left = params.left;
  var bottom = params.bottom;
  var thickness = params.thickness;
  var width = params.width;
  var height = params.height;
  var nLeds = params.nLeds;
  var nButtons = params.nButtons;
  var extra = params.extra;
  var holderThickness = params.holderThickness;
  var display = params.display;
  var displayXOffset = params.displayXOffset;
  
  plate = cube({size:[width, thickness, height]}).translate([left, pcb.h, bottom]);
  holes = union([
    buttons.holes({n:nButtons, extra:extra}),
    leds.holes({n:nLeds, extra:extra}),
    usb.hole({extra:extra}),
  ]);
  plate = plate.subtract(holes);
  
  xz = display.placeXZ({extra:extra, holderThickness:holderThickness});
  displayX = xz[0] + displayXOffset;
  displayZ = xz[1];
  
  plate = plate.subtract(display.hole({thickness:holderThickness, extra:extra, bottom:bottom-displayZ}).translate([displayX, pcb.h+thickness, displayZ]));
  plate = plate.union(display.holder({thickness:holderThickness, extra:extra, bottom:bottom-displayZ}).translate([displayX, pcb.h+thickness, displayZ]));
  return plate;
}

shroud = {};
shroud.model = function(params) {
  params = paramsWithDefaults(params, {
    left: usb.x - 101.6 / 2,
    bottom: usb.z - 25.4 / 2,
    width: 101.6,
    height: 25.4,
    thickness: 1,
    shroudDepth: 5,
    shroudOverlap: 0.1,
  });
  var left = params.left;
  var bottom = params.bottom;
  var thickness = params.thickness;
  var width = params.width;
  var height = params.height;
  var depth = params.shroudDepth;
  var overlap = params.shroudOverlap;
  var right = left + width;
  var topp = bottom + height;
  
  return union([
    CSG.cube({
      corner1: [left, pcb.h - depth, bottom],
      corner2: [left + thickness, pcb.h + overlap, topp],
    }),
    
    CSG.cube({
      corner1: [left, pcb.h - depth, topp - thickness],
      corner2: [right, pcb.h + overlap, topp],
    }),

    CSG.cube({
      corner1: [right - thickness, pcb.h - depth, bottom],
      corner2: [right, pcb.h + overlap, topp],
    }),

    CSG.cube({
      corner1: [left, pcb.h - depth, bottom],
      corner2: [right, pcb.h + overlap, bottom + thickness],
    }),
  ]);
}

mounts = {};
mounts.side = {};
mounts.side.ys = [21, 81, 111];
mounts.side.z = 4.5;
mounts.side.r = 1.2;

mounts.side.holes = function(left, right) {
  debug("sideHoles()");
  var holes = [];

  for (var i = 0; i < mounts.side.ys.length; i++) {
    var y = mounts.side.ys[i];

    // left
    holes.push(cylinder({r:mounts.side.r, h:4, center:true}).rotateY(-90).translate([left, pcb.h - y, mounts.side.z]));

    // right
    holes.push(cylinder({r:mounts.side.r, h:4, center:true}).rotateY(90).translate([right, pcb.h - y, mounts.side.z]));
  }

  return union(holes);
}

mounts.bottom = {};
mounts.bottom.ys = [30, 100];
mounts.bottom.x = 3;
mounts.bottom.r = 1.2;

mounts.bottom.holes = function(left, right) {
  debug("bottomHoles()");
  var holes = [];

  for (var i = 0; i < mounts.bottom.ys.length; i++) {
    var y = mounts.bottom.ys[i];

    // left
    holes.push(cylinder({r:mounts.bottom.r, h:4, center:true}).translate([left + mounts.bottom.x, pcb.h - y, 0]));

    // right
    holes.push(cylinder({r:mounts.bottom.r, h:4, center:true}).translate([right - mounts.bottom.x, pcb.h - y, 0]));
  }

  return union(holes);
}

mounts.holes = function(left, right) {
  return union([
    mounts.bottom.holes(left, right),
    mounts.side.holes(left, right),
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
    thickness: 1,
  });
  var left = params.left;
  var bottom = params.bottom;
  var thickness = params.thickness;
  var width = params.width;
  var height = params.height;
  var right = left + width;
  var half = thickness / 2;
  
  var ll = left / 2;
  var rr = (right + pcb.w1) / 2;
  var hh = bottom + height / 2;
  
  return union([
    CSG.cube({
      corner1: [left, pcb.yConn, bottom],
      corner2: [right, pcb.h, bottom + thickness],
    }),
    
    CSG.cube({
      corner1: [left, pcb.yConn, bottom],
      corner2: [left + thickness, pcb.h, hh + half],
    }),
    
    CSG.cube({
      corner1: [right - thickness, pcb.yConn, bottom],
      corner2: [right, pcb.h, hh + half],
    }),

    CSG.cube({
      corner1: [left, pcb.yConn, bottom],
      corner2: [right, pcb.yConn + thickness, 0],
    }),

    CSG.cube({
      corner1: [left, pcb.yConn, bottom],
      corner2: [ll + half, pcb.yConn + thickness, hh + half],
    }),

    CSG.cube({
      corner1: [rr - half, pcb.yConn, bottom],
      corner2: [right, pcb.yConn + thickness, hh + half],
    }),
    
    supports.model({hh: -bottom}),
  ]).subtract(union([
    CSG.cube({
      corner1: [left + half, pcb.yConn + half, hh - half],
      corner2: [right - half, pcb.h, hh + thickness], 
    }),
    mounts.holes(left, right).translate([0, 0, bottom]),
  ]));
}

box.upper = {};
box.upper.model = function(params) {
  params = paramsWithDefaults(params, {
    left: usb.x - 101.6 / 2,
    bottom: usb.z - 25.4 / 2,
    width: 101.6,
    height: 25.4,
    thickness: 1,
  });
  var left = params.left;
  var bottom = params.bottom;
  var thickness = params.thickness;
  var width = params.width;
  var height = params.height;
  var topp = bottom + height;
  var right = left + width;
  var half = thickness / 2;
  
  var ll = left / 2;
  var rr = (right + pcb.w1) / 2;
  var hh = bottom + height / 2;
  
  return union([
    CSG.cube({
      corner1: [left, pcb.yConnMax, topp - thickness],
      corner2: [right, pcb.h, topp],
    }),

    CSG.cube({
      corner1: [left, pcb.yConn, topp - thickness],
      corner2: [ll + half, pcb.yConnMax + 0.1, topp],
    }),

    CSG.cube({
      corner1: [rr - half, pcb.yConn, topp - thickness],
      corner2: [right, pcb.yConnMax + 0.1, topp],
    }),
    
    CSG.cube({
      corner1: [left, pcb.yConn, hh+half],
      corner2: [left + thickness, pcb.h, topp],
    }),
    CSG.cube({
      corner1: [left+half, pcb.yConn+half, hh-half],
      corner2: [left + thickness, pcb.h, topp],
    }),
    
    CSG.cube({
      corner1: [right - thickness, pcb.yConn, hh+half],
      corner2: [right, pcb.h, topp],
    }),
    CSG.cube({
      corner1: [right - thickness, pcb.yConn+half, hh-half],
      corner2: [right - half, pcb.h, topp],
    }),

    CSG.cube({
      corner1: [ll, pcb.yConnMax, 2],
      corner2: [rr, pcb.yConnMax + thickness, topp],
    }),

    CSG.cube({
      corner1: [left, pcb.yConn, hh+half],
      corner2: [ll+half, pcb.yConn + thickness, topp],
    }),
    CSG.cube({
      corner1: [left+half, pcb.yConn + half, hh-half],
      corner2: [ll+half, pcb.yConn + thickness, topp],
    }),

    CSG.cube({
      corner1: [rr-half, pcb.yConn, hh+half],
      corner2: [right, pcb.yConn + thickness, topp],
    }),
    CSG.cube({
      corner1: [rr-half, pcb.yConn + half, hh-half],
      corner2: [right-half, pcb.yConn + thickness, topp],
    }),
    
    CSG.cube({
      corner1: [ll-half, pcb.yConn+half, hh],
      corner2: [ll+half, pcb.yConnMax + thickness, topp],
    }),
    CSG.cube({
      corner1: [ll-half, pcb.yConn+thickness+half, 2],
      corner2: [ll+half, pcb.yConnMax + thickness, topp],
    }),
    
    CSG.cube({
      corner1: [rr-half, pcb.yConn+half, hh],
      corner2: [rr+half, pcb.yConnMax + thickness, topp],
    }),
    CSG.cube({
      corner1: [rr-half, pcb.yConn+thickness+half, 2],
      corner2: [rr+half, pcb.yConnMax + thickness, topp],
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
    thickness: 1,
    barwidth: 6,
    wallheight: 8,
  });
  var left = params.left;
  var bottom = params.bottom;
  var d = params.thickness;
  var width = params.width;
  var height = params.height;
  var w = params.barwidth;
  var h = params.wallheight;
  var r = w / 2;
  var right = left + width;
  
  var bottomMountY = pcb.h - mounts.bottom.ys[1];
  var sideMountY = pcb.h - mounts.side.ys[1];
  
  return union([
    bottomBar([left+r, pcb.h], [left+r, bottomMountY], w, d),
    bottomBar([left+r, bottomMountY], [pcb.x1, pcb.y1], w, d),
    bottomBar([pcb.x1, pcb.y1], [right-r, pcb.h-r], w, d),
    bottomBar([pcb.x1, pcb.y1], [pcb.x1, pcb.h], w, d),
    
    bottomBar([right-r, pcb.h], [right-r, bottomMountY], w, d),
    bottomBar([right-r, bottomMountY], [pcb.x2, pcb.y1], w, d),
    bottomBar([pcb.x2, pcb.y1], [left+r, pcb.h-r], w, d),
    bottomBar([pcb.x2, pcb.y1], [pcb.x2, pcb.h], w, d),
    
    CSG.cylinder({
      start: [left+r, bottomMountY, 0],
      end: [left+r, bottomMountY, d],
      radius: r,
    }),

    CSG.cylinder({
      start: [right-r, bottomMountY, 0],
      end: [right-r, bottomMountY, d],
      radius: r,
    }),

    CSG.cylinder({
      start: [pcb.x1, pcb.y1, 0],
      end: [pcb.x1, pcb.y1, d],
      radius: r,
    }),

    CSG.cylinder({
      start: [pcb.x2, pcb.y1, 0],
      end: [pcb.x2, pcb.y1, d],
      radius: r,
    }),
    
    CSG.cube({
      corner1: [left, sideMountY-h/2, 0],
      corner2: [left+d, pcb.h, h/2],
    }),
    CSG.cube({
      corner1: [left, sideMountY, 0],
      corner2: [left+d, pcb.h, h],
    }),
    CSG.cylinder({
      start: [left, sideMountY, h/2],
      end: [left+d, sideMountY, h/2],
      radius: h/2,
    }),

    CSG.cube({
      corner1: [right-d, sideMountY-h/2, 0],
      corner2: [right, pcb.h, h/2],
    }),
    CSG.cube({
      corner1: [right-d, sideMountY, 0],
      corner2: [right, pcb.h, h],
    }),
    CSG.cylinder({
      start: [right-d, sideMountY, h/2],
      end: [right, sideMountY, h/2],
      radius: h/2,
    }),
  ])
      .subtract(mounts.holes(left, right))
      .translate([0, 0, bottom])
      .union(supports.model({hh: -bottom}))
      .union(shroud.model(params));
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

function getParameterDefinitions() {
  return [
    // {name:'debug', type:'checkbox', checked:1,},
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
    { name: 'displayXOffset', type: 'float', initial: 0, min:-20.0, max:20.0, step:0.05, caption: "Display X offset:" },
    { name: 'nLeds', type: 'int', initial:1, min:1, max:2, caption: "LEDs:"},
    { name: 'nButtons', type: 'int', initial:3, min:2, max:3, caption: "Buttons:"},
    { name: 'width', type: 'float', initial: 101.6, min:80.0, max:160.0, step:0.05, caption: "Bay Width:" },
    { name: 'height', type: 'float', initial: 25.4, min:12.0, max:60.0, step:0.05, caption: "Bay Height:" },
    { name: 'thickness', type: 'float', initial:1.0, min:0.0, max:5.0, step:0.05, caption: "Material thickness:"},
    { name: 'xOffset', type: 'float', initial: 0, min:-20.0, max:20.0, step:0.05, caption: "X offset from center:" },
    { name: 'zOffset', type: 'float', initial: 0, min:-20.0, max:20.0, step:0.05, caption: "Z offset from center:" },
    { name: 'extra', type: 'float', intitial: 0.2, min:0.0, max:1.0, step:0.05, caption: "Extra space:"},
    { name: 'showBoard', type: 'checkbox', checked:0, caption: 'Show board:' }
  ];
}

function main(args) {
  if (args.debug) {
    return debugShape();
  }

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
  var thickness = args.thickness;
  var displayXOffset = args.displayXOffset;
    
  var display = oled;
  if (displayType == '3LED') {
    display = threeDigitLed;
  }

  var params = {
    width:width,
    left:left,
    height:height,
    bottom:bottom,
    extra:extra,
    holderThickness:thickness,
    shroudDepth: 2,
    nButtons: nButtons,
    nLeds: nLeds,
    thickness: thickness,
    display:display,
    displayXOffset: displayXOffset,
  };
  
  var right = left + width;
  var topp = bottom + height;
  var parts = [];
  if (shape.includes('BOX')) {
    // Trim any part of the faceplace that would interfere with the box or the lid.
    outsideBox = CSG.cube({
      corner1: [left-10, -10, bottom-10],
      corner2: [right+10, pcb.h+10, topp+10],
    }).subtract(CSG.cube({
      corner1: [left+thickness, 0, bottom-thickness],
      corner2: [right-thickness, pcb.h+10, topp-thickness],
    })).subtract(CSG.cube({
      corner1: [left, pcb.h, bottom],
      corner2: [right, pcb.h+10, topp],
    }));

    parts.push(faceplate.model(params).subtract(outsideBox)),
    parts.push(box.lower.model(params));
  }
  if (shape.includes('LID')) {
    parts.push(box.upper.model(params).rotateY(180).translate([2*left-2, 0, bottom + bottom + height]));
  }
  if (shape == 'FRAME') {
    parts.push(faceplate.model(params)),
    parts.push(frame(params));
  } else {
    // nothing!
  }
  
  if (showBoard) {
    parts.push(placeholder(params).setColor([1, 1, 0, 0.5]));
  }
  return union(parts).translate([-pcb.w1/2, -pcb.h/2, -bottom]);
  
}

function debugDisplay(display) {
  var space = 5;
  var params = {
    extra:0.15,
    bottom:-space/2,
  }
  return CSG.cube({
    corner1: [-space/2,-2.5, -space/2],
    corner2: [display.w+space, 0, display.h+space],
  }).subtract(display.hole(params)).union(display.holder(params)).translate([-display.w/2, -1.25, space/2]);
}

function debugShape() {
  return debugDisplay(threeDigitLed);
}
