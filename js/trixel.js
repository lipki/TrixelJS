function Trixel(canvasId, options) {
  options = options || {};
  
  var paving = options.paving || Trixel.ISO;

  this.canvas = new Canvas(canvasId);
  
  // type of paving
  switch ( this.paving ) {
    default :
        options.canvas = this.canvas;
        this.paving = new Iso( options );
  }
  this.paving.draw();
  
  // variable repatriated
  this.matrix = this.paving.matrix;
  
}

Trixel.ISO = 'iso';

Trixel.HPLAN = 'Hplan';
Trixel.RAND = 'rand';
Trixel.IMG = 'image';

Trixel.prototype.colorMap = function ( style, options ) {
    var startTime = new Date().getTime();
    
    switch ( style ) {
        case Trixel.RAND :
            this.colorMapRAND( style, options );
        break;
        case Trixel.IMG :
            this.colorMapIMG( style, options );
        break;
        default :
            this.colorMapHPLAN( style );
    }
    
    console.log( style+' : '+(new Date().getTime() - startTime)+' milli' );
};

Trixel.prototype.colorMapRAND = function ( style, options ) {
    
    var matrix = this.matrix;

    for ( var px = 0 ; px < matrix.sizeX ; px++ )
    for ( var py = 0 ; py < matrix.sizeY ; py++ ) {
        
        var v = Math.random()*255;
        var b = Math.random()*255;
        var r = Math.random()*255;
        var color = new Color(r, v, b);
        
        if ( options.colors.length > 0 )
            color = options.colors[Math.floor(Math.random()*options.colors.length)];
        
        this.paving.setIxel( {x:px, y:py}, color );
    }
    
};

Trixel.prototype.colorMapHPLAN = function ( style ) {
    
    var matrix = this.matrix;

    for ( var px = 0 ; px < matrix.sizeX ; px++ )
    for ( var py = 0 ; py < matrix.sizeY ; py++ ) {
        var cx = px*255/matrix.sizeX;
        var cy = py*255/matrix.sizeY;
        var icx = 255-cx;
        var icy = 255-cy;
        var dcy = (cy-255/2)*2;
        
        var v = 255-(Math.sqrt((cx*cx)+(cy*cy)));
        var b = 255-(Math.sqrt((cx*cx)+(icy*icy)));
        var r = 255-(Math.sqrt((icx*icx)+(dcy*dcy)));
        
        v = v < 0 ? 0 : v;
        b = b < 0 ? 0 : b;
        r = r < 0 ? 0 : r;
        
        this.paving.setIxel( {x:px, y:py}, new Color(r, v, b) );
    }
    
};

Trixel.prototype.colorMapIMG = function ( style, options ) {
    
    function getPixel(imgData, index) {
        var i = index*4, d = imgData.data;
        return [d[i],d[i+1],d[i+2],d[i+3]/255] // [R,G,B,A]
    }
    
    function getPixelXY(imgData, p) {
        return getPixel(imgData, p.y*imgData.width+p.x);
    }
    
    var _this = this;
    var matrix = this.matrix;
    var img = new Image();
    img.src = options.src;
    img.onload = function() {
        var startTime = new Date().getTime();
    
        var cvs = document.createElement('canvas');
        cvs.width = matrix.sizeX; cvs.height = matrix.sizeY;
        //cvs.width = img.width; cvs.height = img.height;
        var ctx = cvs.getContext("2d");
        ctx.drawImage(img,0,0,cvs.width,cvs.height);
        var idt = ctx.getImageData(0,0,cvs.width,cvs.height);
    
        for ( var px = 0 ; px < matrix.sizeX ; px++ )
        for ( var py = 0 ; py < matrix.sizeY ; py++ ) {
            
            var pp = _this.paving.getCanvasPoint( {x:px, y:py} );
            pp = {
                x: (pp.x/_this.canvas.width)*cvs.width,
                y: (pp.y/_this.canvas.height)*cvs.height
            };
            pp = {
                x: pp.x > cvs.width  ? cvs.width  : ( pp.x < 0 ? 0 : Math.floor(pp.x) ),
                y: pp.y > cvs.height ? cvs.height : ( pp.y < 0 ? 0 : Math.floor(pp.y) )
            };
            
            var imgColor = getPixelXY( idt, pp );
            var color = new Color(imgColor[0], imgColor[1], imgColor[2], imgColor[3]);
            var c = Color.bind.apply( Color, color );
            _this.paving.setIxel( {x:px, y:py}, color );
        }
        
        console.log( Trixel.IMG+' : '+(new Date().getTime() - startTime)+' milli' );
    }
    
};

Trixel.prototype.setIxel = function ( p, color ) {
    this.paving.setIxel( p, color );
};;/*
 * Part of
 * Isomer v0.2.4
 * http://jdan.github.io/isomer/
 *
 * Copyright 2014 Jordan Scales
 * Released under the MIT license
 * http://jdan.github.io/isomer/license.txt
 *
 * Date: 2014-08-30
 */

function Canvas(elem) {
  this.elem = elem;
  this.ctx = this.elem.getContext('2d');
  
  this.width = elem.width;
  this.height = elem.height;
}

Canvas.prototype.clear = function () {
  this.ctx.clearRect(-this.width, -this.height, this.width, this.height);
};

Canvas.prototype.path = function (points, color) {
  this.ctx.beginPath();
  this.ctx.moveTo(points[0].x, points[0].y);
  
  for (var i = 1; i < points.length; i++) {
    this.ctx.lineTo(points[i].x, points[i].y);
  }
  
  this.ctx.closePath();
  
  this.ctx.save()
  
  this.ctx.globalAlpha = color.a;
  this.ctx.fillStyle = this.ctx.strokeStyle = color.toHex();
  this.ctx.stroke();
  this.ctx.fill();
  this.ctx.restore();
};
;/*
 * Part of
 * Isomer v0.2.4
 * http://jdan.github.io/isomer/
 *
 * Copyright 2014 Jordan Scales
 * Released under the MIT license
 * http://jdan.github.io/isomer/license.txt
 *
 * Date: 2014-08-30
 */

/**
 * A color instantiated with RGB between 0-255
 *
 * Also holds HSL values
 */
function Color(b, c, d, a, type) {
  
  this.a = parseFloat((Math.round(a * 100) / 100 || 1));
  
  switch(type) {
    case Color.HSL :
      this.h = parseFloat(b || 0);
      this.s = parseFloat(c || 0);
      this.l = parseFloat(d || 0);
      this.loadRGB();
    break;
    default:
      this.r = parseInt(b || 0);
      this.g = parseInt(c || 0);
      this.b = parseInt(d || 0);
      this.loadHSL();
  }
  
};

Color.HSL = 'hsl';
Color.RGB = 'rgb';

Color.prototype.toHex = function () {
  // Pad with 0s
  var hex = (this.r * 256 * 256 + this.g * 256 + this.b).toString(16);

  if (hex.length < 6) {
    hex = new Array(6 - hex.length + 1).join('0') + hex;
  }

  return '#' + hex;
};


/**
 * Returns a lightened color based on a given percentage and an optional
 * light color
 */
Color.prototype.lighten = function (percentage, lightColor) {
  lightColor = lightColor || new Color(255, 255, 255);

  var newColor = new Color(
    (lightColor.r / 255) * this.r,
    (lightColor.g / 255) * this.g,
    (lightColor.b / 255) * this.b,
    this.a
  );

  newColor.l = Math.min(newColor.l + percentage, 1);

  newColor.loadRGB();
  return newColor;
};


/**
 * Loads HSL values using the current RGB values
 * Converted from:
 * http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
 */
Color.prototype.loadHSL = function () {
  var r = this.r / 255;
  var g = this.g / 255;
  var b = this.b / 255;

  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);

  var h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;  // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  this.h = h;
  this.s = s;
  this.l = l;
};


/**
 * Reloads RGB using HSL values
 * Converted from:
 * http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
 */
Color.prototype.loadRGB = function () {
  var r, g, b;
  var h = this.h;
  var s = this.s;
  var l = this.l;

  if (s === 0) {
    r = g = b = l;  // achromatic
  } else {
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = this._hue2rgb(p, q, h + 1/3);
    g = this._hue2rgb(p, q, h);
    b = this._hue2rgb(p, q, h - 1/3);
  }

  this.r = parseInt(r * 255);
  this.g = parseInt(g * 255);
  this.b = parseInt(b * 255);
};


/**
 * Helper function to convert hue to rgb
 * Taken from:
 * http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
 */
Color.prototype._hue2rgb = function (p, q, t){
  if(t < 0) t += 1;
  if(t > 1) t -= 1;
  if(t < 1/6) return p + (q - p) * 6 * t;
  if(t < 1/2) return q;
  if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
  return p;
};
;function Iso(options) {
    
    // options
    options = options || {};
    if ( options.canvas == undefined )
         console.log('ISO error: no canvas');
    else this.canvas = options.canvas;
    
    this.style = options.style || Iso.HORIZONTAL;
    this.strate = this.getStrate(options.strate || '20%');
    
    // trigo
    var height = this.strate;
    var side = this.side = height/Math.cos( 30*Math.PI/180 );
    var hSide = side/2;
    var cWidth = this.canvas.width;
    var cHeight = this.canvas.height;
    
    this.orientation = this.style == Iso.VERTICAL ? 90 : 0;
    this.rayon = hSide/Math.sin( 60*Math.PI/180 );
    this.mayon = height-this.rayon;
    
    // matrix
    this.matrix = {};
    this.matrix.sizeX = this.style == Iso.VERTICAL ? Math.ceil(cWidth/height) : Math.ceil(cWidth/hSide)+1;
    this.matrix.sizeY = this.style == Iso.VERTICAL ? Math.ceil(cHeight/side*2)+1 : Math.ceil(cHeight/height);
    
    console.log('sizeX:'+this.matrix.sizeX+', sizeY:'+this.matrix.sizeY);
    
    this.matrix.data = new Array(this.matrix.sizeX);
    for ( var px = 0 ; px < this.matrix.sizeX ; px++ ) {
        this.matrix.data[px] = new Array(this.matrix.sizeY);
        for ( var py = 0 ; py < this.matrix.sizeY ; py++ )
            this.matrix.data[px][py] = new Uint8Array(3);
    }
    
    console.log(this.matrix.sizeX*this.matrix.sizeY);
    
}

Iso.HORIZONTAL = 'horizontal';
Iso.VERTICAL = 'vertical';

Iso.prototype.getStrate = function ( strate ) {
    
    if ( strate.indexOf('%') != -1 ) {
        strate = parseInt(strate) || 20;
        var w = this.style == Iso.VERTICAL ? this.canvas.width : this.canvas.height;
        return w*strate/100;
    } else if ( strate.indexOf('px') != -1 ) {
        return parseInt(strate) || 20;
    } else {
        return parseInt(strate) || 20;
    }
    
};

Iso.prototype.draw = function () {
    var startTime = new Date().getTime();
    
    this.canvas.clear();
    
    for ( var px = 0 ; px < this.matrix.sizeX ; px++ )
    for ( var py = 0 ; py < this.matrix.sizeY ; py++ ) {
        var c = Color.bind.apply(Color, this.matrix.data[px][py]);
        this.setIxel( {x:px, y:py}, new c() );
    }
    
    console.log( 'draw : '+(new Date().getTime() - startTime)+' milli' );
};

Iso.prototype.setIxel = function ( p, color ) {
    
    var angle = this.orientation;
    var rayon = this.rayon;
    var pp = this.getCanvasPoint( p );
    var recto = 180;
    
    if ( Math.floor((p.x+p.y)/2) != (p.x+p.y)/2 )
        recto = 0;
    
    var points = new Array(3);
    for( var i = 0 ; i < 3 ; i++ ) {
        pa = ((i+.5)*120+angle+recto)*Math.PI/180;
        var x = Math.sin(pa)*rayon;
        var y = Math.cos(pa)*rayon;
        points[i] = {x:x+pp.x,y:y+pp.y};
    }
    
    this.matrix.data[p.x][p.y] = [color.r,color.g,color.b];
    
    this.canvas.path(points, color);
    
};

Iso.prototype.getCanvasPoint = function ( p ) {
    
    var height = this.strate;
    var hSide = this.side/2;
    var mayon = this.mayon;
    
    var ppx = this.style == Iso.VERTICAL ? p.x*height+mayon : p.x*hSide;
    var ppy = this.style == Iso.VERTICAL ? p.y*hSide : p.y*height+mayon;
    
    if ( Math.floor((p.x+p.y)/2) != (p.x+p.y)/2 ) {
        ppx += this.style == Iso.VERTICAL ? mayon : 0;
        ppy += this.style == Iso.VERTICAL ? 0 : mayon;
    }
    
    return {x:ppx, y:ppy};
    
};