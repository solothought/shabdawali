(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.shabdawali = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var {shuffle, replaceOn} = require('./util');

function Shabdawali(targetEl, opts){
    this.element = targetEl;
    this.lines = opts.lines;
    this.onChar = opts.onCharChange || function(){};
    this.onLine = opts.onLineChange || function(){};
    this.nextWord = opts.nextWord || function(){};

    this.speed = opts.speed || 70;
    this.timeToReadAWord = 80;
    this.dynamicPauseBeforeDelete = opts.dynamicPauseBeforeDelete || true; 
    this.pauseBeforeDelete = opts.pauseBeforeDelete || 2000; 
    this.pauseBeforeNext = opts.pauseBeforeNext || 1000; 
    this.delay = opts.delay || 0; //initial delay

    this.typoEffect = opts.typoEffect || false;

    this.deleteSpeed = opts.deleteSpeed || (this.speed / 2);
    this.deleteSpeedArr = [];

    this.repeat = opts.repeat || true;
    this.deleteEffect = opts.deleteEffect || true;

    if(opts.deleteFrom === "start"){
        this.trimmedText = function(text,len){ return text.substring(1); }
    }else{
        this.trimmedText = function(text,len){ return text.substring(0, len); }
    }
    

    //updateDynamicDeleteSpeed
    for(var i = 0; i < this.lines.length; i++){
        var line = this.lines[i];
        this.deleteSpeedArr.push( opts.deleteSpeed || (this.deleteSpeed  - line.length ) );
        if( this.deleteSpeedArr[i] < 5 ) this.deleteSpeedArr[i] = 5;
    }
    
    this.currentLineIndex = 0;
    this.currentLetterIndex = 0;
    this.nextWordIndex = 0;
    this.typo = {//TO DO make it configurable
        max : 1,
        minWordLength : 5,
        extendedRange : 3,
        skip : 2,
        randomFactor : 4 //higher 
    }
    this.typoCount = 0;
    this.startCorrectingAt = -1;
}

//Check if the given word should be used for spelling correction effects
Shabdawali.prototype.makeTypo = function(word){//TO DO make it configurable
    return shuffle( word.substr( this.typo.skip ));
}

Shabdawali.prototype.checkIfFitsForTypoEffect = function(word){//TO DO make it configurable
    if (Math.floor((Math.random() * this.typo.randomFactor) + 1) !== 2){
        return false;
    }
    
    if(word.length >= this.typo.minWordLength){
        return true;
    }
}

Shabdawali.prototype.start = function(){
    this.typeNext();
}

Shabdawali.prototype.deleteText = function(cLine){
    if(this.correctingText && this.typoRange === 0){
        this.typeText( this.lines[this.currentLineIndex - 1] );
        this.correctingText = false;
    }else if(this.correctingText && this.typoRange > 0){
        this.delete(cLine, this.speed);
        this.typoRange--;
    }else if(this.currentLetterIndex === 0){
        this.typeNext();
    }else{
        this.delete(cLine, this.deleteSpeedArr[ this.currentLineIndex -1 ]);
    }
}

Shabdawali.prototype.delete = function(cLine, speed){
    this.onChar("BS");
    this.element.textContent = this.trimmedText(cLine, --this.currentLetterIndex);
    var that = this;
    setTimeout(function() {
        that.deleteText(cLine);
    }, speed);
}


Shabdawali.prototype.typeText = function(cLine){
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
            if( this.typoEffect && this.currentLetterIndex >= this.nextWordIndex && this.nextWordIndex > -1 && this.typoCount < this.typo.max){
                var nextWordIndex = cLine.indexOf(' ', this.nextWordIndex+1)
                var word = cLine.substr(this.nextWordIndex, nextWordIndex - this.nextWordIndex);
                this.nextWord(word);//callBack
                if( this.checkIfFitsForTypoEffect(word) ){
                    var typoWord = this.makeTypo( word ) ;
                    cLine = replaceOn(cLine, this.currentLetterIndex + 1 , typoWord);
                    this.typoCount++;
                    this.typoRange =  this.typo.skip + typoWord.length + this.typo.extendedRange;
                    this.startCorrectingAt = this.currentLetterIndex + this.typoRange;
                }
                this.nextWordIndex = nextWordIndex;
            }

            if(this.typoEffect && this.startCorrectingAt > 0 && this.startCorrectingAt === this.currentLetterIndex){
                this.startCorrectingAt = -1;
                this.correctingText = true;
                this.deleteText(cLine);
            }else{
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
    this.nextWordIndex = 0;
    this.typoCount = 0;
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

},{"./util":2}],2:[function(require,module,exports){


module.exports.replaceOn = function(line, start, str) {
    return line.substr(0,start) + str + line.substr(start+str.length);
}
module.exports.shuffle = function(word) {
    var a = word.split(""),
        n = a.length;

    for (var i = n - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
        }
    return a.join("");
}


},{}]},{},[1])(1)
});
