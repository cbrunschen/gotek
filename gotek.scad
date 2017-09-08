w1 = 59;
h1 = 54.5;
w2 = 39;
h2 = 57.25;
h = h1 + h2; // 111.75; measured, matches h1 + h2
d = 1;

wTot = 101.6;

DEBUG=true;

module debug(s) {
    if (DEBUG) {
        echo(str(s));
    }
}

module pcb() {
    debug("pcb()");
    cube([w1, h1, d]);
    translate([0, h1, 0]) cube([w2, h2, d]);
}

rHole = 1.5;
dEdge = 3;
x1 = dEdge + rHole;
x2 = x1 + 50;

y1 = 21.5 + rHole;
y2 = y1 + 21.25;
y3 = y2 + 50;

module holes(r=rHole, h=d) {
    debug("holes()");
    $fn=24;
    translate([0, 0, h/2]) scale([1, 1, 2]) {
        translate([x1, y1, 0]) cylinder(r=r, h=h, center=true);
        translate([x2, y1, 0]) cylinder(r=r, h=h, center=true);
        translate([x1, y2, 0]) cylinder(r=r, h=h, center=true);
        translate([x2, y2, 0]) cylinder(r=r, h=h, center=true);
        translate([x1, y3, 0]) cylinder(r=r, h=h, center=true);
    }
}

hConn = 7;
yConn = -hConn;

module connectors() {
    debug("connectors()");
    // power connector
    translate([1, yConn, 0]) cube([10, hConn+3, 5]);
    
    // FDC connector
    translate([w1 - 17*2.54, yConn, 0])
        cube([17*2.54, hConn+5, 5.08]);
    
    // headers
    translate([17, 8, 0]) cube([7*2.54, 2*2.54, 8]);
    
    // programming headers
    translate([2.54, 8+2.54, 0]) cube([5*2.54, 2.54, 6.5]);
    translate([2*2.54, 8, 0]) cube([4*2.54, 2.54, 6.5]);
}

module support(rO=3, rI=rHole-0.3, h=2, d=1) {
    debug("support()");
    if (d >=0) {
        translate([0, 0, -h/2])
            cylinder(r=rO, h=h, center=true);
        translate([0, 0, d/2])
            cylinder(r=rI, h=d, center=true);
    } else {
        difference() {
            translate([0, 0, -h/2])
                cylinder(r=rO, h=h, center=true);
            translate([0, 0, d/2 + 0.1])
                cylinder(r=rI, h=abs(d)+0.2, center=true);
        }
    }
}

rButton = 1.9 + 0.2;
zButton = 5;

xSpacingButton = 7.5;
xButton1 = 5;
xButton2 = xButton1 + xSpacingButton;
xButton0 = xButton1 - xSpacingButton;

module horizontalCylinder(x, y, z, r, d) {
    debug("horizontalCylinder()");
    translate([x, y, z]) rotate([-90, 0, 0]) {
        $fn = 24;
        translate([0, 0, d/2 - 0.1]) cylinder(r=r, h=d + 0.1, center=true);
    }
}

module button(xButton=0, extra=0) {
    debug("button()");
    horizontalCylinder(xButton, extra, zButton, rButton+extra, 5-extra);
    translate([xButton-3, -6, d]) cube([6, 6+extra, 6]);
}

module buttons(extra=0) {
    debug("buttons()");
    translate([0, h, 0]) {
        button(xButton0, extra);
        button(xButton1, extra);
        button(xButton2, extra);
    }
}

zLed = zButton + 7.5;
rLed = 1.5;
xLed = xButton1;

module led(extra=0) {
    debug("led()");
    translate([0, h, 0]) {
        horizontalCylinder(xLed, 0, zLed, rLed+extra, 3);
    }
}

module leds(extra=0) {
    debug("leds()");
    led();
}

xUSB = 22.6;
wUSB = 15;
hUSB = 7.5;
zUSB = 1.5;
rUSB = 1.75;
dUSB = 10;

module roundedRect(size, radius)
{
    debug("roundedRect()");
	x = size[0];
	y = size[1];
	z = size[2];

	linear_extrude(height=z)
	hull()
	{
        $fn=24;
        
		// place 4 circles in the corners, with the given radius
		translate([(-x/2)+radius, (-y/2)+radius, 0])
		circle(r=radius);
	
		translate([(x/2)-radius, (-y/2)+radius, 0])
		circle(r=radius);
	
		translate([(-x/2)+radius, (y/2)-radius, 0])
		circle(r=radius);
	
		translate([(x/2)-radius, (y/2)-radius, 0])
		circle(r=radius);
	}
}

module usb(extra=0) {
    debug("usb()");
    translate([xUSB + wUSB/2, h-dUSB/2, zUSB+hUSB/2]) rotate([-90, 0, 0]) {
        roundedRect([wUSB+2*extra, hUSB+2*extra, dUSB], rUSB);
    }
}

module faceHoles(extra=0) {
    debug("faceHoles()");
    buttons(extra=extra);
    leds(extra=extra);
    usb(extra=extra);
}

module threeLeds() {
}

// width of PCB = 38mm
oled128x32Width = 38;
// Depth of PCB plus display etc = 2.8mm
oled128x32Depth = 2.45;
// Height of PCB = 12mm
oled128x32Height = 12;

oled128x32VisibleWidth = 22.384;
oled128x32VisibleXOffset = 5+1.1;
oled128x32VisibleHeight = 7.584;
oled128x32VisibleYOffset = oled128x32Height - 0.25 - 2.1 - oled128x32VisibleHeight;


module oled128x32(extra=0.1) {
    debug("oled128x32()");
    overlap = 0.1;
    union() {
        // PCB + display module + pins + folded flat cable:
        // - start 5mm back to allow space for insertion
        translate([-extra, -extra, -5])
            cube([oled128x32Width+2*extra, oled128x32Height+2*extra, 5+oled128x32Depth]);

        // display active area including border!
        // push it out 4mm to ensure it penetrates through the front
        // of the faceplate
        // starts at 5mm (pcb inset) + 1.1mm (from the display edge),
        translate([oled128x32VisibleXOffset, oled128x32VisibleYOffset, oled128x32Depth-overlap])
            cube([oled128x32VisibleWidth, oled128x32VisibleHeight, 4+overlap]);
    }
}

module oled128x32Holder(extra=0.1) {
    translate([-1, -1, -4]) cube([2 + oled128x32Width, 2 + oled128x32Height, 4]);
}

module placeholder(extra=0) {
    debug("placeholder()");
    difference() {
        pcb();
        holes();
    }

    faceHoles(extra=extra);
    connectors();
}

module supports(rO=2, rI=rHole-0.2, hh=2) {
    debug("supports()");
    $fn=24;
    dh = -(hh-1);
    translate([x1, y1, 0]) support(rO=rO, rI=rI, h=hh, d=2);
    translate([x2, y1, 0]) support(rO=rO, rI=rI, h=hh, d=2);
    translate([x1, y2, 0]) support(rO=2.5, rI=1.5, h=hh, d=dh);
    translate([x2, y2, 0]) support(rO=2.5, rI=1.5, h=hh, d=dh);
    translate([x1, y3, 0]) support(rO=2.5, rI=1.5, h=hh, d=dh);
}

module faceplate(d=2, hh=2, hTot=25.4, displayD=0.5, left=0, right=0) {
    debug("faceplate()");
    leftMax = xButton0 - rButton - 2;
    left = min(left, leftMax);
    
    rightMin = w2 + 2;
    right = max(rightMin, right);
    
    hMin = zLed + rLed + 2 + hh;
    hTot = max(hTot, hMin);
    
    difference() {
        union() {
            translate([left, h, -hh]) cube([right - left, d, hTot]);
            translate([w2 + oled128x32Width + 1, h + d - oled128x32Depth - displayD, -0.5])
                rotate([-90, 180, 0])
                oled128x32Holder();
        }
        union() {
            faceHoles(extra=0);
            translate([w2 + oled128x32Width + 1, h + d - oled128x32Depth - displayD, -0.5])
                rotate([-90, 180, 0])
                oled128x32();
        }
    }
}

leftForCenter = -((wTot - w1) / 2);

module supportsAndFaceplate(rO=2, rI=rHole-0.2, hh=2, dF=2) {
    debug("supportsAndFaceplate()");
    supports(rO, rI, hh);
    
    translate([x1-rO, y1, -hh]) cube([rO*2, h+dF-y1, 1]);
    translate([x2-rO, y1, -hh]) cube([rO*2, y2-y1, 1]);
    translate([w2+2-2*rO, y1, -hh]) cube([rO*2, h+dF-y1, 1]);
    translate([x1, y1-rO, -hh]) cube([x2-x1, rO*2, 1]);
    translate([x1, y2-rO, -hh]) cube([x2-x1, rO*2, 1]);
    
    faceplate(d=dF, hh=hh);
}

sideHoleYs = [21, 81, 111];
sideHoleZ = 4.5;

module sideHoles(left, right) {
    debug("sideHoles()");
    $fn=24;
    for(sideHoleY = sideHoleYs) {
        debug(["sideHoleY = ", sideHoleY]);
        // left
        translate([left, h - sideHoleY, sideHoleZ])
        rotate([0, -90, 0])
        cylinder(r=1.76, h=4, center=true);
        
        // right
        translate([right, h - sideHoleY, sideHoleZ])
        rotate([0, 90, 0])
        cylinder(r=1.76, h=4, center=true);
    }
}

bottomHoleYs = [30, 100];
bottomHoleX = 3;

module bottomHoles(left, right) {
    debug("bottomHoles()");
    $fn=24;
    for (bottomHoleY = bottomHoleYs) {
        debug(["bottomHoleY = ", bottomHoleY]);
        // left
        translate([left + bottomHoleX, h - bottomHoleY, 0])
        cylinder(r=1.76, h=4, center=true);
        
        // right
        translate([right - bottomHoleX, h - bottomHoleY, 0])
        cylinder(r=1.76, h=4, center=true);
    }
}

module lowerBoxAndFaceplate(rO=2, rI=rHole-0.2, hh=5, dF=2, left=-21, right=left+101.6) {
    debug("lowerBoxAndFaceplate()");
    supports(rO, rI, hh);

    hTot = h + hConn;

    difference() {
        union() {
            // bottom
            translate([left, yConn, -hh]) cube([right-left, hTot, d]);
            // left side
            translate([left, yConn, -hh]) cube([1, hTot, 14]);
            // right side
            translate([right-1, yConn, -hh]) cube([1, hTot, 14]);
            // back left
            translate([left, yConn, -hh]) cube([-left-7, 1, 14]); 
            // back right
            translate([w1+7, yConn, -hh]) cube([right-w1-7, 1, 14]); 
            // back bottom
            translate([left, yConn, -hh]) cube([right-left, 1, hh-0.5]);
        }
        union() {
            translate([0, 0, -hh]) sideHoles(left, right);
            translate([0, 0, -hh]) bottomHoles(left, right);
        }
    }
    
    faceplate(d=dF, hh=hh, left=left, right=right);
}

module lid() {
    debug("lid()");
}

module bottomBar(p1, p2, w, h) {
    dx = p2[0] - p1[0];
    dy = p2[1] - p1[1];
    
    l = sqrt(dx*dx + dy*dy);
    ndx = dx / l;
    ndy = dy / l;
    
    angle = atan2(dy, dx);
    
    translate([p1[0], p1[1], 0])
        rotate([0, 0, angle])
        translate([0, -w/2, 0])
        cube([l, w, h]);
}

module roundedCorner(r, h) {
    union() {
        translate([0, 0, h/2]) cylinder(r=r, h=h, center=1);
        translate([-r, 0, 0]) cube([2*r, r, 1]);
        translate([0, -r, 0]) cube([r, 2*r, 1]);
    }
}

module minimalBoxAndFaceplate(rO=2, rI=rHole-0.2, hh=5, dF=2, left=-21, right=left+101.6) {
    debug("lowerBoxAndFaceplate()");
    supports(rO, rI, hh);

    hTot = h + hConn;

    difference() {
        union() {
            sideStartY = h - sideHoleYs[1] - 4;
            sideH = h - sideStartY;
            sideZ = 9;
            sideZ2 = sideZ / 2;
            
            bottomStartY = h - bottomHoleYs[1] - 4;
            bottomH = h - bottomStartY;
            bottomW = 6;
            bottomR = bottomW / 2;
            
            // bottom left side
            translate([left, bottomStartY + bottomR, -hh]) cube([bottomW, bottomH - bottomR, 1]);
            // bottom right side
            translate([right - bottomW, bottomStartY + bottomR, -hh]) cube([bottomW, bottomH - bottomR, 1]);
            
            // bottom, left supports
            translate([x1 - bottomR, y1, -hh]) cube([bottomW, h-y1, 1]);
            translate([x1, y1, -hh]) cylinder(r=bottomR, h=1);
            // bottom, right supports
            translate([x2 - bottomR, y1, -hh]) cube([bottomW, h-y1, 1]);
            translate([x2, y1, -hh]) cylinder(r=bottomR, h=1);
            // bottom, back
            translate([left + bottomR, bottomStartY + bottomR, 0.5-hh]) cylinder(r=bottomR, h=1, center=true);
            translate([right - bottomR, bottomStartY + bottomR, 0.5-hh]) cylinder(r=bottomR, h=1, center=true);
            
            xx0 = left + bottomW/2;
            xx1 = right - bottomW / 2;
            yy0 = bottomStartY + bottomW / 2;
            yy1 = h - bottomW / 2;
            
            translate([0, 0, -hh]) bottomBar([xx0, yy0], [x1, y1], bottomW, 1);
            translate([0, 0, -hh]) bottomBar([x1, y1], [xx1, yy1], bottomW, 1);
            translate([0, 0, -hh]) bottomBar([xx1, yy0], [x2, y1], bottomW, 1);
            translate([0, 0, -hh]) bottomBar([x2, y1], [xx0, yy1], bottomW, 1);
            
            $fn=24;
            // left side
            translate([left, sideStartY, -hh]) cube([1, sideH, sideZ2]);
            translate([left, sideStartY+sideZ2, -hh+sideZ2]) cube([1, sideH-sideZ2,
 sideZ2]);
            translate([left, sideStartY+sideZ2, -hh+sideZ2]) rotate([0, 90, 0]) cylinder(r=sideZ2, h=1);
            
            // right side
            translate([right-1, sideStartY, -hh]) cube([1, sideH, sideZ2]);
            translate([right-1, sideStartY+sideZ2, -hh+sideZ2]) cube([1, sideH-sideZ2,
 sideZ2]);
            translate([right-1, sideStartY+sideZ2, -hh+sideZ2]) rotate([0, 90, 0]) cylinder(r=sideZ2, h=1);
        }
        union() {
            translate([0, 0, -hh]) sideHoles(left, right);
            translate([0, 0, -hh]) bottomHoles(left, right);
        }
    }
    
    faceplate(d=dF, hh=hh, left=left, right=right);
    
    // shroud back a bit from the faceplate, just a few millimieters
    translate([left, h-3, -hh]) cube([1, 3.1, 25.4]);
    translate([right-1, h-3, -hh]) cube([1, 3.1, 25.4]);
    translate([left, h-3, 25.4-hh-1]) cube([right-left, 3.1, 1]);
    translate([left, h-3, -hh]) cube([right-left, 3.1, 1]);
    }


// #placeholder(extra=-0.25);
left=leftForCenter;
minimalBoxAndFaceplate(hh=6.5, dF=2.5, left=left, right=left+101.6);

    
