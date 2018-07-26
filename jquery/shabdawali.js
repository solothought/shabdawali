// You need an anonymous function to wrap around your function to avoid conflict
(function($){
    // Attach this new method to jQuery
    // This is where you write your plugin's name
    $.fn.shabdawali = function(opts) {

        var targetEl = this;

        var lines = opts.lines;
        var onChar = opts.onCharChange || function(){};
        var onLine = opts.onLineChange || function(){};
    
        var speed = 120;
        var timeToReadAWord = 80;
        var intervalBetween2Lines = 2000;
        var delay = 100;
    
        var typingSpeedArr = [];
        var deleteSpeedArr = [];
    
        var rotate = opts.rotate || true;
        var shouldDelete = opts.deleteEffect || true;
    
        setTimeout(startTyping, delay);
    
        var deleteText = function(cLine) {
            var txt = targetEl.text();
            if(txt.length === 0){
                typeNext();
            }else{
                onChar("BS");
                txt = cLine.substring(0, txt.length - 1);
                targetEl.text(txt);
                setTimeout(function() {
                    deleteText(cLine);
                }, deleteSpeedArr[ currentLineIndex -1 ]);
            }
        };
    
        var typeText = function(cLine) {
            var txt = targetEl.text();
            //var cLine = currentLine();
            if(cLine){
                if(txt.length === cLine.length){//complete line has been typed
                    if(shouldDelete){
                        var gape = timeToReadAWord * (cLine.length / 4);
                        if(gape < 2000) gape = 2000;
                        
                        setTimeout(function() {
                            deleteText(cLine);
                        }, gape );
                    }else{
                        typeNext();
                    }
                }else{//still typing
                    txt = cLine.substring(0, txt.length + 1);
                    onChar( txt.substr(txt.length - 1, 1) );
                    targetEl.text(txt);
                    setTimeout(function() {
                        typeText(cLine);
                    }, typingSpeedArr[ currentLineIndex - 1 ] );
                }
            }
        };
    
        var currentLineIndex = 0;
    
        function nextLine(){
            if(currentLineIndex === lines.length){
                if(rotate) currentLineIndex = 0;
            }
            var line =  lines[ currentLineIndex ];
            onLine("CR", currentLineIndex, line);
            currentLineIndex++;
            return line;
        }
    
        function startTyping() {
    
            for(var i = 0; i < lines.length; i++){
                var line = lines[i];
               /*  typingSpeedArr.push( speed - line.length );
                if( typingSpeedArr[i] < 1 ) typingSpeedArr[i] = 4; */
                typingSpeedArr[i] = 50;
    
                deleteSpeedArr.push( (speed / 2)  - line.length );
                if( deleteSpeedArr[i] < 1 ) deleteSpeedArr[i] = 2;
            }
            typeNext();
        };
    
    
        function typeNext(){
            var line = nextLine();
            line && (
                setTimeout(function() {
                    targetEl.text('');
                    typeText(line) ;
                }, intervalBetween2Lines)
            );
        }

        return this;
      /* return this.each(function() {
        
      }); */
    };
  
  // pass jQuery to the function, 
  // So that we will able to use any valid Javascript variable name 
  // to replace "$" SIGN. But, we'll stick to $ (I like dollar sign: ) )
})(jQuery);