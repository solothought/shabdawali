# शब्दावली (shabdawali)
<img src="static/shabdawali_logo.png" width="80px"> Amazing human-like typing effects with typo, events, dynamic speed and more



<div align="center"><img src="static/shabdawali.gif"></div>



## Features

* Amazing human-like typing effects beyond your imagination.
* It does typo, and corrects them.
* It mimics humar style by dynamic speed and pauses to type/delete sentences.
* Small size **[1.5k](https://bundlephobia.com/result?p=shabdawali@2.1.0)**.
* No dependency.
* CPU friendly.
* Can be used as a jQuery plugin, React component, or with other libraries.
* You can fully control it's behavior.
* You can use it for playing music notes, typing demos, typing posts on devRant, Twitter and Github.
* Check [live demo](https://solothought.com/shabdawali/).


# How to use

You can either install it through npm ,or download js from [dist](dist) folder or directly refer to [CDN](https://unpkg.com/shabdawali@2.2.0/dist/shabdawali.js).

```bash
npm i shabdawali
```

```js
var shabdawali = require('shabdawali'); // this line is needed only for nodejs users

shabdawali(el, {
    lines : ["sentence 1", "sentence 2"],
    //other configuration
})
```

## Configuration

### Speed

You can control typing speed, deleting speed, pauses etc. using the following configuration:

```js
{
    typingSpeed : 75,
    dynamicPauseBeforeDelete : true, 
    pauseBeforeDelete : 2000, 
    pauseBeforeNext : 1000, 
    delay : 0
}
```

### Effects

You can enable/disable effects:

```js
{
    typoEffect : false,
    repeat : true,
    deleteEffect : true,
    dynamicPause : true,
}
```

### Events

You may want to play music on a piano with key press effects. Events can help you:

```js
{
    onCharChange : function(char){...};
    onLineChange : function(char, lineNumber, line){...};
    nextWord : function(word){...};
}
```

playback events:

```js
var me = shabdavali(..),
me.on("pause", fn);
me.on("resume", fn);
```

**Some ideas**

* Keyboard typing effect.
* Piano playing effect.
* Typewriter strike effect.
* Number dial effect.
* Background change. 
* Whatever you can think of...

### Spelling Correction

By default Shabdawali looks for words longer than 4 letters, and randomly applies typo effects on a maximum of 1 word per sentence. Here is the configuration:

```js
{
    max : 1, // Maximum number of typos per line
    minWordLength : 5, //skip words which are smaller than 5 characters
    extendedRange : 3, //How long to type before correction effect
    skip : 2, //how many letters from the starting of a word should be left
    randomFactor : 4 //higher the value lesser the chance to pick a word for typo effect
}
```

You can override `checkIfFitsForTypoEffect(word)` to apply your logic to check if shabdawali would apply typo effects on current word.

Currently Shabdawali shuffles the letters of a word randomly to apply typo effects. But you can change this behavior by overriding `makeTypo()`.

**Some ideas**

* Apply typo effect on particular words or particular lines.
* Apply typo effect only on particular type of words.
* Apply the effects like;
    * missing vowels.
    * shuffle only 2-3 letters.
    * writing wrong spelling or similar words.
    * writing completely wrong sentences.
    * writing slang and then star/mask them.
    * whatever you can think of...


### Replaceable

When you don't want to make a sentence longer and don't want your reader to read the same sentence again-n-again, you can set `replaceable: true` to delete only uncommon parts.

E.g:

```
"I have worked in India"
"I have worked in Japan"
"I have worked in England"
```

### Playback

You can pause/resume the animation whenever you want:

```js
var amit = shabdawali(..);

amit.start(3);//pause after typing 3 sentences
amit.resume(3);//pause after typing next 3 sentences
amit.pause(); //pause manually
amit.resume(); //resume previously paused typing
```

# Integration with other JS libraries


## Jquery Plugin

```JavaScript
(function($){
    $.fn.shabdawali = function(options) {

    return this.each(function() {
        shabdawali($(this), options);
    });
};
  
})(jQuery);
```

## Riot JS Tag

```html
<slate>
    <h1 ref="slat"></h1>
    <script>
        shabdawali(this.refs.slat, this.opts);
    </script>
</slate>
```

## React component

```js
//-- check https://github.com/amitguptagwl/shabdawali for more detail

class Slate extends React.Component {
  constructor (props) {
    super(props);
  }
  
  componentDidMount () {
      var props = { lines: [ "शब्दावली (shabdawali)", "It can be used as a React component as well"]
    };
    shabdawali(this.el, props);
  }
  
  render(){
  	return <span ref={(el) => { this.el = el; }}>{this.props.children}</span>;
  }
}

ReactDOM.render(
  <div>
	  <Slate />
  </div>,
  document.getElementById('slat')
);
```

## Worth to check 

- **[BigBit standard)](https://github.com/amitguptagwl/bigbit)** : A standard to reprent any number in the universe in comparitively less space and without precision loss. A standard to save space to represent any text string in comparision of UTF encoding.
- **[imglab](https://github.com/NaturalIntelligence/imglab)** : Speedup and simplify image labeling / annotation. Supports multiple formats, one click annotation, easy 
- **[ वार्ता (vaarta)](https://github.com/amitguptagwl/vaarta/)** : Human like chatting effects.
