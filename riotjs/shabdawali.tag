<shabdawali>
    <p ref="typing-paper"></p>
    <script>
        var speed = 120;
        var interval = 2000;
        var delay = 100;

        var typingSpeedArr = [];
        var deleteSpeedArr = [];

        var rotate = this.opts.rotate || true;
        var shouldDelete = this.opts.deleteEffect || true;

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
                }, deleteSpeedArr[ currentLineIndex ]);
            }
        };

        var typeText = function(cLine) {
            var txt = targetEl.text();
            //var cLine = currentLine();
            if(cLine){
                if(txt.length === cLine.length){//complete line has been typed
                    if(shouldDelete){
                        setTimeout(function() {
                            deleteText(cLine);
                        }, interval);
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
                typingSpeedArr.push( speed - line.length );
                if( typingSpeedArr[i] < 1 ) typingSpeedArr[i] = 2;

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
                }, interval)
            );
        }
        
        var targetEl ;
        var lines = this.opts.lines;
        var onChar = this.opts.onCharChange || function(){};
        var onLine = this.opts.onLineChange || function(){};
        this.on('mount', function(){
            setTimeout(startTyping, delay);
            targetEl = $(this.refs["typing-paper"]);
        });
    </script>
</shabdawali>
