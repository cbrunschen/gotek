w1 = 59;
h1 = 54.5;
w2 = 39;
h2 = 57.25;
h = h1 + h2; // 111.75; measured, matches h1 + h2
d = 1;

wTot = 101.6;

module pcb() {

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
    translate([x, y, z]) rotate([-90, 0, 0]) {
        $fn = 24;
        translate([0, 0, d/2 - 0.1]) cylinder(r=r, h=d + 0.1, center=true);
    }
}

module button(xButton=0, extra=0) {
    horizontalCylinder(xButton, extra, zButton, rButton+extra, 5-extra);
    translate([xButton-3, -6, d]) cube([6, 6+extra, 6]);
}

module buttons(extra=0) {
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
    translate([0, h, 0]) {
        horizontalCylinder(xLed, 0, zLed, rLed+extra, 3);
    }
}

module leds(extra=0) {
    led();
}

xUSB = 22.6;
wUSB = 15.5;
hUSB = 7.3;
zUSB = 1.5;
rUSB = 1.75;
dUSB = 10;

module roundedRect(size, radius)
{
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
    translate([xUSB + wUSB/2, h-dUSB/2, zUSB+hUSB/2]) rotate([-90, 0, 0]) {
        roundedRect([wUSB+2*extra, hUSB+2*extra, dUSB], rUSB);
    }
}

module faceHoles(extra=0) {
    buttons(extra=extra);
    leds(extra=extra);
    usb(extra=extra);
}

module threeLeds() {
}

oled128x32Width = 38;
oled128x32Depth = 2.45;

module oled128x32() {
    o = 0.1;
    union() {
        // PCB
        translate([0, 0, -3]) cube([oled128x32Width, 12, 4]);
        // display module + pins + folded flat cable
        translate([0, 0.25, 1-o]) cube([37, 11.5, 1.45+o]);
        // display active area including border!
        translate([5+1.1, 12+0.25-2.1-7.584, 1+1.45-o]) cube([22.384, 7.584, 4+o]);
    }
}

module placeholder(extra=0) {
    difference() {
        pcb();
        holes();
    }

    faceHoles(extra=extra);
    connectors();
}

module supports(rO=2, rI=rHole-0.2, hh=2) {
    $fn=24;
    rs = r - 0.3;
    dh = -(hh-1);
    translate([x1, y1, 0]) support(rO=rO, rI=rI, h=hh, d=2);
    translate([x2, y1, 0]) support(rO=rO, rI=rI, h=hh, d=2);
    translate([x1, y2, 0]) support(rO=2.5, rI=1.5, h=hh, d=dh);
    translate([x2, y2, 0]) support(rO=2.5, rI=1.5, h=hh, d=dh);
    translate([x1, y3, 0]) support(rO=2.5, rI=1.5, h=hh, d=dh);
}

module faceplate(d=2, hh=2, hTot=25.4, displayD=0.5, left=0, right=0) {
    leftMax = xButton0 - rButton - 2;
    left = min(left, leftMax);
    
    rightMin = w2 + 2;
    right = max(rightMin, right);
    
    hMin = zLed + rLed + 2 + hh;
    hTot = max(hTot, hMin);
    
    difference() {
        translate([left, h, -hh]) cube([right - left, d, hTot]);
        union() {
            faceHoles(extra=0);
            translate([w2 + oled128x32Width + 1, h + d - oled128x32Depth - displayD, -1])
                rotate([-90, 180, 0])
                oled128x32();
        }
    }
}

leftForCenter = -((wTot - w1) / 2);

module supportsAndFaceplate(rO=2, rI=rHole-0.2, hh=2, dF=2) {
    supports(rO, rI, hh);
    
    translate([x1-rO, y1, -hh]) cube([rO*2, h+dF-y1, 1]);
    translate([x2-rO, y1, -hh]) cube([rO*2, y2-y1, 1]);
    translate([w2+2-2*rO, y1, -hh]) cube([rO*2, h+dF-y1, 1]);
    translate([x1, y1-rO, -hh]) cube([x2-x1, rO*2, 1]);
    translate([x1, y2-rO, -hh]) cube([x2-x1, rO*2, 1]);
    
    faceplate(d=dF, hh=hh);
}

sideHoleYs = [16.9]; // , 118.5];
sideHoleZ = 6.35;

module sideHoles(left, right) {
    $fn=24;
    for(sideHoleY = sideHoleYs) {
        echo("sideHoleY = ", sideHoleY);
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

bottomHoleYs = [29.52, 61.27, 105.72];
bottomHoleX = 3.18;

module bottomHoles(left, right) {
    $fn=24;
    for (bottomHoleY = bottomHoleYs) {
        echo("bottomHoleY = ", bottomHoleYs);
        // left
        translate([left + bottomHoleX, h - bottomHoleY, 0])
        cylinder(r=1.76, h=4, center=true);
        
        // right
        translate([right - bottomHoleX, h - bottomHoleY, 0])
        cylinder(r=1.76, h=4, center=true);
    }
}

module lowerBoxAndFaceplate(rO=2, rI=rHole-0.2, hh=5, dF=2, left=-21, right=left+101.6) {
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
}

// #placeholder(extra=-0.25);
left=leftForCenter;
lowerBoxAndFaceplate(hh=6.5, dF=2.5, left=left, right=left+101.6);


