var $body = $('body');
var $lastPrompt = $('#last-prompt');
$(document).ready(function () {
    $body.focus();
    $body.keyup(function (event) {
        $body.scrollTop($body[0].scrollHeight);
        var key = event.key;
        console.log(key);
        if (key === 'Enter') {
            process();
        } else if (key === 'Backspace') {
            var content = $lastPrompt.html();
            $lastPrompt.html(content.substring(0, content.length - 1));
        } else if (
            (key.charCodeAt(0) >= 97 && key.charCodeAt(0) <= 122 && key.length == 1) ||  // Lowercase a-z
            (key.charCodeAt(0) >= 65 && key.charCodeAt(0) <= 90 && key.length == 1) ||  // Uppercase A-Z
            (key.charCodeAt(0) == 47) ||  // Slash
            (key.charCodeAt(0) == 46) ||  // Dot
            (key.charCodeAt(0) == 32)) {  // Space
            $lastPrompt.append(event.key);
        }
    });
});

function process() {
    var command = $lastPrompt.html();
    var pageIsHome = false;
    if (window.location.href.includes('info')) {
        // Info page
    } else if (window.location.href.includes('résumé')) {
        // Résumé page
    } else if (window.location.href.includes('contact')) {
        // Contact page
    } else {
        pageIsHome = true;
        // Home page
        if (command === 'ls') {
            $body.append(''
                + '<p>'
                + '<a class="blue" href="info.html">info</a>&nbsp;&nbsp;'
                + '<a class="blue" href="résumé.html">résumé</a>&nbsp;&nbsp;'
                + '<a class="blue" href="contact.html">contact</a>'
                + '</p>');
        } else if (command.includes('cd')) {
            if (command === 'cd info') {
                window.location.href = window.location.origin + '/info.html';
            } else if (command === 'cd résumé' || command === 'cd resume') {
                window.location.href = window.location.origin + '/résumé.html';
            } else if (command === 'cd contact') {
                window.location.href = window.location.origin + '/contact.html';
            } else {
                $body.append('<p>You should try <span class="yellow">cd info</span> or simply click a link</p>');
            }
        } else {
            $body.append('<p>You should try <span class="yellow">cd info</span> or simply click a link</p>');
        }
    }
    if (!pageIsHome && command.includes('cd')) {
        if (command === 'cd ..') {
            window.location.href = window.location.origin;
        } else if (command === 'cd ../info') {
            window.location.href = window.location.origin + '/info.html';
        } else if (command === 'cd ../résumé' || command === 'cd ../resume') {
            window.location.href = window.location.origin + '/résumé.html';
        } else if (command === 'cd ../contact') {
            window.location.href = window.location.origin + '/contact.html';
        } else {
            $body.append('<p>You should try <span class="yellow">cd ..</span></p>')
        }
    }
    $lastPrompt.removeAttr('id');
    $body.append('<p class="prompt" id="last-prompt">');
    $lastPrompt = $('#last-prompt');
    $body.scrollTop($body[0].scrollHeight);
}