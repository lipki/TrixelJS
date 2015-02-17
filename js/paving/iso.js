function Iso(options) {
    
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