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
};