(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.shabdawali = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var shuffle = require('./util').shuffle;
var replaceOn = require('./util').replaceOn;
var commonStartingString = require('./util').commonStartingString;

function Shabdawali(targetEl, opts){
    this.element = targetEl;
    if(!opts) opts={};

    this.lines = opts.lines;
    this.playCount = -1;
    this.onChar = opts.onCharChange || function(){};
    this.onLine = opts.onLineChange || function(){};
    this.nextWord = opts.nextWord || function(){};

    this.speed = opts.typingSpeed || 70;
    this.timeToReadAWord = 80;
    this.dynamicPauseBeforeDelete = opts.dynamicPauseBeforeDelete !== false ? true : false; 
    this.pauseBeforeDelete = opts.pauseBeforeDelete || 2000; 
    this.pauseBeforeNext = opts.pauseBeforeNext || 1000; 
    this.delay = opts.delay || 0; //initial delay

    this.typoEffect = opts.typoEffect || false;
    this.dynamicPause = opts.dynamicPause || false;

    this.deleteSpeed = opts.deleteSpeed || (this.speed / 2);
    this.deleteSpeedArr = [];
    this.deleteUpto = [];

    if(opts.repeat === false){
        this.repeat = false;
    }else{
        this.repeat = true;
    }

    if(opts.deleteEffect === false){
        this.deleteEffect = false;
    }else{
        this.deleteEffect = true;
    }
    
    if(opts.cursorEffect){
        this.appendCursor(this.element);
        this.showCursor();
    } else{
        this.hideCursor();
    }

    if(opts.deleteFrom === "start"){
        this.trimmedText = function(text,len){ return text.substring(1); }
    }else{
        this.trimmedText = function(text,len){ return text.substring(0, len); }
    }
    

    //updateDynamicDeleteSpeed and deleteUpto
    for(var i = 0; i < this.lines.length; i++){
        var line = this.lines[i];
        if(opts.replacable){
            if(i < this.lines.length - 1){
                var commonUpto = commonStartingString(line, this.lines[ i+1 ])
                this.deleteUpto.push(commonUpto || 0);
            }else{
                this.deleteUpto.push(0);//delete upto 1st char
            }
        }else{
            this.deleteUpto.push(0);//delete upto 1st char
        }

        this.deleteSpeedArr.push( opts.deleteSpeed || (this.deleteSpeed  - ( line.length - this.deleteUpto[i] ) ) );
        if( this.deleteSpeedArr[i] < 5 ) this.deleteSpeedArr[i] = 5;
    }
    
    
    this.typo = {//TO DO make it configurable
        max : 1,
        minWordLength : 5,
        goAheadLimit : 3,
        skip : 2,
        randomFactor : 4 //higher 
    }
    
    
    this._pauseCallBack;

    this.events = {
        "pause" : [],
        "resume" : [],
        "finish" : []
    }

    
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

Shabdawali.prototype.start = function(count){
    this._stopped = false;
    this.currentLineIndex = 0;
    this.currentLetterIndex = 0;
    this.nextWordIndex = 0;
    this.typoCount = 0;
    this.startCorrectingAt = -1;
    if(count && count <= this.lines.length ){
        this.playCount = count;
    }else{
        this.playCount = -1;
    }
    this.element.textContent = '';
    this.typeNext();
}

Shabdawali.prototype.stop = function(){
    this._stopped = true;
}

Shabdawali.prototype.pause = function(){
    this._paused = true;
    this._emit("pause");
}
Shabdawali.prototype.resume = function(count){
    if(count && count <= this.lines.length ){
        this.playCount = count;
    }else{
        this.playCount = -1;
    }
    this._paused = false;
    this._pauseCallBack && setTimeout(this._pauseCallBack, this.pauseUntil);
    this._pauseCallBack = null;

    //repeat when on end
    if(this.currentLineIndex === this.lines.length){
        this.start(count);
    }
    this._emit("resume");
}

Shabdawali.prototype.deleteText = function(cLine){
    if(this._stopped){
        return;
    }else if(this._paused){
        var that = this;
        this._pauseCallBack = function() {
            that.deleteText(cLine);
        }
    }else if(this.correctingText && this.typoRange === 0){
        this.typeText( this.lines[this.currentLineIndex - 1] );
        this.correctingText = false;
    }else if(this.correctingText && this.typoRange > 0){
        this.delete(cLine, this.speed);
        this.typoRange--;
    }else if(this.currentLetterIndex === this.deleteUpto[this.currentLineIndex - 1 ] ){
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
    if(this._stopped){
        return;
    }else if(this._paused){
        var that = this;
        this._pauseCallBack = function() {
            that.typeText(cLine);
        }
    }else if(cLine){
        if(this.currentLetterIndex === cLine.length){//complete line has been typed
            if(this.typoEffect && this.startCorrectingAt > 0 && this.startCorrectingAt === this.currentLetterIndex){
                this.startCorrectingAt = -1;
                this.correctingText = true;
                this.deleteText(cLine);
            }else if(this.deleteEffect){
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
            if( this.typoEffect && this.currentLetterIndex === this.nextWordIndex && this.typoCount < this.typo.max){
                var nextSpaceIndex = cLine.indexOf(' ', this.nextWordIndex);
                //var goAheadLimit = this.typo.goAheadLimit;
                if(nextSpaceIndex === -1) { 
                    nextSpaceIndex = cLine.length + 1;
                    //goAheadLimit = -1;
                }
                var word = cLine.substr(this.nextWordIndex, nextSpaceIndex - this.nextWordIndex);
                this.nextWord(word);//callBack
                if( this.checkIfFitsForTypoEffect(word) ){
                    var typoWord = this.makeTypo( word ) ;
                    cLine = replaceOn(cLine, this.currentLetterIndex + this.typo.skip , typoWord);
                    this.typoCount++;
                    this.typoRange =  word.length;// + goAheadLimit;
                    this.startCorrectingAt = this.currentLetterIndex + this.typoRange ;
                }
                this.nextWordIndex = nextSpaceIndex + 1;
            }

            if(this.typoEffect && this.startCorrectingAt > 0 && this.startCorrectingAt === this.currentLetterIndex){
                this.startCorrectingAt = -1;
                this.correctingText = true;
                this.deleteText(cLine);
            }else{
                var char = cLine.substr( this.currentLetterIndex++ , 1);
                this.onChar( char );
                //this.element.textContent  += char;
                this.element.textContent  = cLine.substr( 0, this.currentLetterIndex  );
                var that = this;
                if(this.dynamicPause && char == ' ') {
                    var prevSpaceIndex = cLine.lastIndexOf(' ', this.currentLetterIndex - 2);
                    if(prevSpaceIndex == -1){
                        prevSpaceIndex = 0;
                    }
                    var prevWord = cLine.substr(prevSpaceIndex, this.currentLetterIndex- prevSpaceIndex);
                    var complexity = wordComplexity(prevWord); 
                    complexity = complexity == 1? 1 : complexity * (prevWord.length/2);
                    setTimeout(function() {
                        that.typeText(cLine);
                        },this.speed * complexity );
                }
                else {
                    setTimeout(function() {
                    that.typeText(cLine);
                    }, this.speed );
                }
            }

        }
    }
}
/*
Complexity will have values ranging from 1-4,
where '1' will have no complexity and the value
of complexity will increase by one for each of 
the conditions satisfied
*/
var wordComplexity = function(word){
    var complexity = 1;
    if(word.length > 10){
        complexity++;
    }
    if(word.substr(word.length-1,1)=='!' || word.substr(word.length-1,1)=='.' || word.substr(word.length-1,1)==';'){
        complexity++;
    }
    if(countConsonants(word) > 5){
        complexity++;
    }
    return complexity;
}

var countConsonants = function(word){
    var numberOfConsonants = 0;
    for(var index = 0; index < word.length; index ++) {
        var vowels = ["a","e","i","o","u"];
        if(vowels.indexOf(word.charAt(index).toLowerCase()) < 0){
            numberOfConsonants++;
        }
    }
    return numberOfConsonants;
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
    if(this.playCount === 0){//automatic pause when start or resume is called with line number
        this.pause();
        var that = this;
        this._pauseCallBack = function() {
            that.typeNext();
        }
        return;
    }else if(this.playCount > 0){
        this.playCount--;
    }else {

    }
    this.nextWordIndex = 0;
    this.typoCount = 0;
    var line = this.nextLine();
    this.currentLetterIndex = this.deleteUpto[ this.currentLineIndex - 2 ] || 0;
    var that = this;
    line && (
        setTimeout(function() {
            that.element.textContent = '';
            that.typeText(line) ;
        }, this.pauseBeforeNext)
    );

    if(!line){//nothing to play
        this._emit("finish");
    }
}

Shabdawali.prototype._emit = function(eventName){
    for(var i=0; i< this.events[eventName].length; i++){
        this.events[eventName][i]();
    }
}
Shabdawali.prototype.on = function(eventName, fn){
    this.events[eventName].push(fn);
}

Shabdawali.prototype.appendCursor = function(){
    this.cursorEl = document.createElement('span');
    this.cursorEl.classList.add('shabdawali-cursor');
    this.cursorEl.textContent = '|';
    this.element.insertAdjacentElement('afterend', this.cursorEl);
}

Shabdawali.prototype.hideCursor = function(){
    this.cursorEl.style.display = "none";
}

Shabdawali.prototype.showCursor = function(){
    this.cursorEl.style.display = "inline";
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

module.exports.commonStartingString = function(line1,line2) {
    for(var i=0; i < line1.length; i++){
        if(line1[i] !== line2[i]) return i;
    }
}
},{}]},{},[1])(1)
});
