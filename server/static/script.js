window.onload = function () {
    notify("Welcome!", "Welcome to the Python Sandbox! Complete with a working tab key<br>-- Felipe", "is-info");
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
}