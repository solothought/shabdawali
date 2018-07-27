function Shabdawali(targetEl, opts){
    this.element = targetEl;
    this.lines = opts.lines;
    this.onChar = opts.onCharChange || function(){};
    this.onLine = opts.onLineChange || function(){};

    this.speed = opts.speed || 70;
    this.timeToReadAWord = 80;
    this.dynamicPauseBeforeDelete = opts.dynamicPauseBeforeDelete || true; 
    this.pauseBeforeDelete = opts.pauseBeforeDelete || 2000; 
    this.pauseBeforeNext = opts.pauseBeforeNext || 1000; 
    this.delay = opts.delay || 0; //initial delay

    this.deleteSpeed = opts.deleteSpeed || (this.speed / 2);
    this.deleteSpeedArr = [];

    this.repeat = opts.repeat || true;
    this.deleteEffect = opts.deleteEffect || true;

    if(opts.deleteFrom === "start"){
        this.trimmedText = function(text,len){ return text.substring(1); }
    }else{
        this.trimmedText = function(text,len){ return text.substring(0, len); }
    }
    

    this.currentLineIndex = 0;
    //updateDynamicDeleteSpeed
    for(var i = 0; i < this.lines.length; i++){
        var line = this.lines[i];
        this.deleteSpeedArr.push( opts.deleteSpeed || (this.deleteSpeed  - line.length ) );
        if( this.deleteSpeedArr[i] < 5 ) this.deleteSpeedArr[i] = 5;
    }
}

Shabdawali.prototype.start = function(){
    this.typeNext();
}

Shabdawali.prototype.deleteText = function(cLine){
    var txt = this.element.textContent;
    if(txt.length === 0){
        this.typeNext();
    }else{
        this.onChar("BS");
        txt = this.trimmedText(cLine, txt.length - 1);
        this.element.textContent = txt;
        var that = this;
        setTimeout(function() {
            that.deleteText(cLine);
        }, this.deleteSpeedArr[ this.currentLineIndex -1 ]);
    }
}

Shabdawali.prototype.typeText = function(cLine){
    var txt = this.element.textContent;
    if(cLine){
        if(txt.length === cLine.length){//complete line has been typed
            if(this.deleteEffect){
                var gape = this.pauseBeforeDelete;
                if(this.dynamicPauseBeforeDelete){
                    gape = this.timeToReadAWord * (cLine.length / 4);
                    if(gape < 2000) gape = 2000;
                }
                var that = this;
                setTimeout(function() {
                    that.deleteText(cLine);
                }, gape );
            }else{
                this.typeNext();
            }
        }else{//still typing
            txt = cLine.substring(0, txt.length + 1);
            this.onChar( txt.substr(txt.length - 1, 1) );
            this.element.textContent  = txt;
            var that = this;
            setTimeout(function() {
                that.typeText(cLine);
            }, this.speed );
        }
    }
}

Shabdawali.prototype.nextLine = function(){
    if(this.currentLineIndex === this.lines.length){
        if(this.repeat) this.currentLineIndex = 0;
    }
    var line =  this.lines[ this.currentLineIndex ];
    this.onLine("CR", this.currentLineIndex, line);
    this.currentLineIndex++;
    return line;
}

Shabdawali.prototype.typeNext = function(){
    var line = this.nextLine();
    var that = this;
    line && (
        setTimeout(function() {
            that.element.textContent = '';
            that.typeText(line) ;
        }, this.pauseBeforeNext)
    );
}

module.exports = function(targetEl, opts){
    return new Shabdawali(targetEl, opts);
}
