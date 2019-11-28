(function() {

    // Hide the output box
    window.onload = function () {
        document.querySelector("#output-box").style.display = "none"

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
    document.querySelector("#execute").classList.add("is-loading");

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
            response.text().then(result => {
                parsed = JSON.parse(result);
                document.querySelector("#output").innerHTML = parsed.text;
                if (parsed.status == "success") {
                    document.querySelector("#output-box").classList.add("is-success");
                } else if (parsed.status == "error") {
                    document.querySelector("#output-box").classList.add("is-warning");
                }
            })
        } else {
            document.querySelector("#output").innerHTML = "SERVER ERROR";
            document.querySelector("#output-box").classList.add("is-error");
        }
        document.querySelector("#execute").classList.remove("is-loading");
        box = document.querySelector("#output-box");
        box.classList.remove("is-success");
        box.classList.remove("is-warning");
        box.classList.remove("is-error");
        box.style.display = "block";
    });
}