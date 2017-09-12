var pcb = {
};

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
  ]);
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

support = {};
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

supports = {};
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

buttons = {};
buttons.r = 1.9 + 0.2;
buttons.z = pcb.d + 4;

buttons.xSpacing = 7.5;
buttons.x1 = 1 + buttons.xSpacing / 2;
buttons.x2 = buttons.x1 + buttons.xSpacing;
buttons.x0 = buttons.x1 - buttons.xSpacing;

function horizontalCylinder(x, y, z, r, d) {
    debug("horizontalCylinder()");
    return cylinder({r:r, h:d, center:true, fn:12})
        .rotateX(-90)
        .translate([x, y + d/2, z]);
}

buttons.button = function(params) {
  params = paramsWithDefaults(params, {
    x: 0,
    extra: 0,
  });
  debug("button(" + JSON.stringify(params) + ")");
  var x = params.x;
  var extra = params.extra;
  
  return union([
    horizontalCylinder(x, extra, buttons.z, buttons.r+extra, 5-extra),
    cube({size: [6, 6+extra, 6]}).translate([x-3, -6, pcb.d]),    
  ]);
}

buttons.model = function(params) {
  params = paramsWithDefaults(params, {
    extra: 0,
    n: 3
  });
  var extra = params.extra;
  var n = params.n;
  
  debug("buttons(" + JSON.stringify(params) + ")");
  var result = [];
  if (n == 3) {
    result.push(buttons.button({x:buttons.x0, extra:extra}));
  }
  result.push(buttons.button({x:buttons.x1, extra:extra}));
  result.push(buttons.button({x:buttons.x2, extra:extra}));
  
  return union(result).translate([0, pcb.h, 0]);
}

leds = {};
leds.z = buttons.z + 7.5;
leds.r = 1.5;
leds.x1 = buttons.x1;
leds.x2 = buttons.x2;

leds.led = function(params) {
  params = paramsWithDefaults(params, {
    extra: 0,
    x: leds.x1,
  });
  var extra = params.extra;
  var x = params.x;
  
  debug("led(" + JSON.stringify(params) + ")");
  return horizontalCylinder(x, 0, leds.z, leds.r+extra, 6)
      .translate([0, pcb.h-1, 0]);
}

leds.model = function(params) {
  params = paramsWithDefaults(params, {
    extra: 0,
    n:1,
  });
  debug("leds(" + JSON.stringify(params) + ")");
  var n = params.n;
  var extra = params.extra;
  
  var result = [];
  if (n == 2) {
    result.push(leds.led({x:leds.x2, extra:extra}));
  }
  result.push(leds.led({c:leds.x1, extra:extra}));
  return union(result);
}

usb = {};
usb.w = 15;
usb.h = 7.5;
usb.d = 20;
usb.x = 22.6 + usb.w/2;
usb.y = pcb.h;
usb.z = 1.5 + usb.h/2;
usb.r = 1.75;

usb.model = function(params) {
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

oled.vw = 22.384;
oled.vx = 5+1.1;
oled.vh = 7.584;
oled.vz = oled.h-1.1-oled.vh;

oled.hole = function(params) {
  params = paramsWithDefaults(params, {
    extra: 0.25,
    shield: 0.5,
  });
  var extra = params.extra;
  var shield = params.shield;
  
  debug("oled.hole(" + JSON.stringify(params) + ")");
  
  overlap = 0.1;
  return union([
    // PCB + display module + pins + folded flat cable:
    // - start 5mm back to allow space for insertion
    cube({size:[oled.w, 5+oled.d, oled.h]}).translate([-extra, -(5+oled.d+shield), -extra]),

    // display active area including border!
    // push it out 4mm to ensure it penetrates through the front
    // of the faceplate
    // starts at 5mm (pcb inset) + 1.1mm (from the display edge),
    cube({size:[oled.vw, 4+overlap, oled.vh]}).translate([oled.vx, -(overlap+shield), oled.vz]),
  ]);
}

oled.holder = function(params) {
  params = paramsWithDefaults(params, {
    thickness: 1, 
    extra: 0.25,
    depth: 2.5 + oled.d,
  });
  
  var thickness = params.thickness;
  var depth = params.depth;
  var extra = params.extra;
  var pad = thickness + extra;
  
  return cube({size:[oled.w + 2+pad, depth, oled.h + 2*pad]}).translate([-pad, -depth, -pad]);
}

faceplate = {};
faceplate.model = function(params) {
  params = paramsWithDefaults(params, {
    width: 101.6,
    height: 25.4,
    thickness: 2.5,
  });
  var thickness = params.thickness;
  var width = params.width;
  var height = params.height;
}

function main() {
  return union([
    pcb.model().setColor(css2rgb('yellow')),
    supports.model({hh:5}).setColor(1, 0, 0, 0.5),
    buttons.model({n:3}).setColor(0, 0, 1, 0.5),
    leds.model({n:2}),
    usb.model(),
    oled.holder().subtract(oled.hole()).translate([pcb.w2 + 5, 100, -2]).setColor([1, 1, 0, 0.5]),
  ]).translate([-pcb.w1/2, -pcb.h/2, 0]);
}