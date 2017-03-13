var $body = $('body');
var $lastPrompt = $('#last-prompt');
$(document).ready(function () {
    $body.focus();
    $body.keyup(function (event) {
        var key = event.key;
        console.log(key);
        if (key === 'Enter') {
            process();
        } else if (key === 'Backspace') {
            var content = $lastPrompt.html();
            $lastPrompt.html(content.substring(0, content.length - 1));
        } else {
            $lastPrompt.append(event.key);
        }
    });
});

function process() {
    var command = $lastPrompt.html();
    $lastPrompt.removeAttr('id');
    console.log(command);
    $body.append('<p class="prompt" id="last-prompt">');
    $lastPrompt = $('#last-prompt');
}