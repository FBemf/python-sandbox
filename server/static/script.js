window.onload = function () {
    notify("Welcome!", "Welcome to the Python Sandbox! Complete with a working tab key.<br>-- Felipe :)", "is-info");
    // Tabs and backspaces
    undos = [];
    redos = [];
    let textarea = document.querySelector("#code");
    undos.push({
        body: textarea.value,
        start: textarea.selectionStart,
        end: textarea.selectionEnd,
    });
    document.querySelector("#code").addEventListener("keydown", function (e) {
        let keyCode = e.keyCode || e.which;
        console.log(keyCode);

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
                if (numSpaces > 0) {
                    if (numSpaces % 4 == 0) {
                        e.preventDefault();
                        this.value = this.value.substring(0, cursorPosition - 4)
                            + this.value.substring(cursorPosition);
                        this.selectionEnd = cursorPosition - 4;
                        this.selectionStart = this.selectionEnd;
                    } else {
                        e.preventDefault();
                        this.value = this.value.substring(0, cursorPosition - numSpaces % 4)
                            + this.value.substring(cursorPosition);
                        this.selectionEnd = cursorPosition - numSpaces % 4;
                        this.selectionStart = this.selectionEnd;
                    }
                }
            }
        } else if (keyCode == 9) {
            e.preventDefault();
            let start = this.selectionStart;
            let end = this.selectionEnd;

            let i = start - 1;
            let characters = 0;
            while (i >= 0 && this.value[i] != "\n") {
                characters += 1;
                i -= 1;
            }

            if (characters % 4 == 0) {
                this.value = this.value.substring(0, start)
                    + " ".repeat(4)
                    + this.value.substring(end);

                // put caret at right position again
                this.selectionEnd = start + 4;
                this.selectionStart = this.selectionEnd;
            } else {
                // set textarea value to: text before caret + tab + text after caret
                this.value = this.value.substring(0, start)
                    + " ".repeat(characters % 4)
                    + this.value.substring(end);

                // put caret at right position again
                this.selectionEnd = start + characters % 4;
                this.selectionStart = this.selectionEnd;
            }

        } else if (keyCode == 13) {
            undos.push({
                body: this.value,
                start: this.selectionStart,
                end: this.selectionEnd,
            });
            e.preventDefault();
            let start = this.selectionStart;
            let end = this.selectionEnd;

            let i = start - 1;
            let spaces = 0;
            while (i >= 0 && this.value[i] != "\n") {
                if (this.value[i] == " ") {
                    spaces += 1;
                } else {
                    spaces = 0;
                }
                i -= 1;
            }

            // set textarea value to: text before caret + tab + text after caret
            this.value = this.value.substring(0, start)
                + "\n"
                + " ".repeat(spaces)
                + this.value.substring(end);

            // put caret at right position again
            this.selectionEnd = start + spaces + 1;
            this.selectionStart = this.selectionEnd;
        } else if (keyCode == 32 || keyCode == 173) {
            undos.push({
                body: this.value,
                start: this.selectionStart,
                end: this.selectionEnd,
            });
        } else if (keyCode == 89 && e.ctrlKey) {
            e.preventDefault();
            if (redos.length > 0) {
                undos.push({
                    body: this.value,
                    start: this.selectionStart,
                    end: this.selectionEnd,
                });
                newState = redos.pop()
                this.value = newState.body;
                this.selectionStart = newState.start;
                this.selectionEnd = newState.end;
            }
        } else if (keyCode == 90 && e.ctrlKey) {
            e.preventDefault();
            if (undos.length > 0) {
                redos.push({
                    body: this.value,
                    start: this.selectionStart,
                    end: this.selectionEnd,
                });
                newState = undos.pop()
                this.value = newState.body;
                this.selectionStart = newState.start;
                this.selectionEnd = newState.end;
            }
        }
    });
}

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
                let parsed = JSON.parse(result);
                let status = "";
                let title = "";
                if (parsed.status == "success") {
                    title = "Python Output"
                    status = "is-success";
                } else if (parsed.status == "error") {
                    title = "Python Error"
                    status = "is-danger";
                }
                notify(title, parsed.text, status);
            })
        } else {
            let notifs = document.querySelector("#notifications");
            notify("Error!", "SERVER ERROR", "is-warning");
        }
        document.querySelector("#execute").classList.remove("is-loading");
    });
}

function notify(title, msg, type) {
    let notifs = document.querySelector("#notifications");
    let newNotif = document.createElement("article");
    newNotif.classList.add("message");
    newNotif.classList.add("is-small");
    newNotif.classList.add(type);
    let header = document.createElement("div");
    header.classList.add("message-header");
    header.innerHTML = title;
    let del = document.createElement("button");
    del.classList.add("delete");
    del.addEventListener("click", function () {
        newNotif.parentNode.removeChild(newNotif);
    });
    header.appendChild(del);
    let body = document.createElement("div");
    body.classList.add("message-body");
    body.classList.add("is-family-code");
    body.innerHTML = msg;
    newNotif.appendChild(header);
    newNotif.appendChild(body);
    notifs.insertBefore(newNotif, notifs.firstChild);
    animateIn(newNotif);
}

function animateIn(newNotif) {
    let progress = 0;
    let offset = 70;
    let time = 70.0;
    let timeExtension = 7;
    let frames = 3;

    newNotif.style.position = "relative";
    id = setInterval(frame, frames);
    function frame() {
        newNotif.style.opacity = progress;
        newNotif.style.left = (offset - offset * progress) + "px";
        progress += frames / time;
        time += timeExtension;
        if (progress >= 1) {
            clearInterval(id);
            newNotif.style.opacity = 1;
            newNotif.style.left = 0 + "px";
        }
    }
}
