(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.shabdawali = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

    this.typo = opts.typo || false;

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

    this.currentLetterIndex = 0;
}

Shabdawali.prototype.start = function(){
    this.typeNext();
}

Shabdawali.prototype.deleteText = function(cLine){
    //var txt = this.element.textContent;
    if(this.currentLetterIndex === 0){
        this.typeNext();
    }else{
        this.onChar("BS");
        this.element.textContent = this.trimmedText(cLine, --this.currentLetterIndex);
        var that = this;
        setTimeout(function() {
            that.deleteText(cLine);
        }, this.deleteSpeedArr[ this.currentLineIndex -1 ]);
    }
}

Shabdawali.prototype.typeText = function(cLine){
    //var txt = this.element.textContent;
    if(cLine){
        if(this.currentLetterIndex === cLine.length){//complete line has been typed
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
            //"amit kumar gupta".indexOf(' ', 5)
            var txt = cLine.substring(0, ++this.currentLetterIndex);
            this.onChar( txt.substr(this.currentLetterIndex - 1) );
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
    //this.currentLetterIndex = 0;
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

},{}]},{},[1])(1)
});
