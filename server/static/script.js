(function() {

    // Hide the output box
    window.onload = function () {
        $("#output").hide();
    }

    // Tabs and backspaces
    $(document).delegate("#code", "keydown", function(e) {
        let keyCode = e.keyCode || e.which;
    
        console.log(keyCode);
        if (keyCode == 8) {
            if (this.selectionStart == null
                    || this.selectionStart == this.selectionEnd) {
                let cursorPosition = this.selectionEnd;
                let beforeCursor = $(this).val() .substring(0, cursorPosition);
                let numSpaces = 0;
                let i = beforeCursor.length - 1;
                while (beforeCursor[i] == " ") {
                    numSpaces += 1;
                    i -= 1;
                }
                if (numSpaces > 0 && numSpaces % 4 == 0) {
                    e.preventDefault();
                    $(this).val($(this).val().substring(0, cursorPosition - 4)
                        + $(this).val().substring(cursorPosition));
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
            $(this).val($(this).val().substring(0, start)
                        + insertString
                        + $(this).val().substring(end));
        
            // put caret at right position again
            this.selectionEnd = start + insertString.length;
            this.selectionStart = this.selectionEnd;
        }
    });
})();

// Execute the code in the box
function execute() {
    $("#output").html("<em>LOADING...</em>");
    $("#output").show();

    data = JSON.stringify({
        code: $("#code").val(),
    });

    $.ajax({
        type: "POST",
        url: "/run",
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
        },
        data: data,
        success: function(result) {
            $("#output").html(result);
        },
        error: function(xhr) {
            $("#output").html("<em>UNKNOWN ERROR</em>");
        },
    });
}