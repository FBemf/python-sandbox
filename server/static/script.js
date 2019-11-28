(function() {

    // Hide the output box
    window.onload = function () {
        document.querySelector("#output").style.display = "none"

        // Tabs and backspaces
        document.querySelector("#code").addEventListener("keydown", function(e) {
            let keyCode = e.keyCode || e.which;
        
            if (keyCode == 8) {
                if (this.selectionStart == null
                        || this.selectionStart == this.selectionEnd) {
                    let cursorPosition = this.selectionEnd;
                    let beforeCursor = this.value.substring(0, cursorPosition);
                    let numSpaces = 0;
                    let i = beforeCursor.length - 1;
                    while (beforeCursor[i] == " ") {
                        numSpaces += 1;
                        i -= 1;
                    }
                    if (numSpaces > 0 && numSpaces % 4 == 0) {
                        e.preventDefault();
                        this.value = this.value.substring(0, cursorPosition - 4)
                            + this.value.substring(cursorPosition);
                        this.selectionEnd = cursorPosition - 4;
                        this.selectionStart = this.selectionEnd;
                    }
                }
            } else if (keyCode == 9) {
                e.preventDefault();
                let start = this.selectionStart;
                let end = this.selectionEnd;
                let insertString = "    "
            
                // set textarea value to: text before caret + tab + text after caret
                this.value = this.value.substring(0, start)
                            + insertString
                            + this.value.substring(end);
            
                // put caret at right position again
                this.selectionEnd = start + insertString.length;
                this.selectionStart = this.selectionEnd;
            }
        });
    }
})();

// Execute the code in the box
function execute() {
    document.querySelector("#output").innerHTML = "<em>LOADING...</em>";
    document.querySelector("#output").style.display = "block";

    data = JSON.stringify({
        code: document.querySelector("#code").value,
    });
    fetch("/run", {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
        },
        body: data,
    }).then(response => {
        if (response.ok) {
            return response.text();
        } else {
            return "<em>SERVER ERROR</em>";
        }
    }).then(result => {
        document.querySelector("#output").innerHTML = result;
    });
}