window.onload = function () {
    $("#output").hide();
}

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
        success: function( result ) {
            $("#output").html(result);
        },
        error: function() {
            $("#output").html("<em>ERROR!</em>");
        },
    });
}