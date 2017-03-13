var $body = $('body');
var $lastPrompt = $('#last-prompt');
$(document).ready(function () {
    $body.focus();
    $body.keydown(function (event) {
        if (event.key === 'Tab') {
            event.preventDefault();
            $body.focus();
            $body.append('<p>I feel your pain, my developer friend.</p><p>But this ain\'t a real terminal so you gotta type the whole thing</p>');
            $lastPrompt.removeAttr('id');
            $body.append('<p class="prompt" id="last-prompt">' + $lastPrompt.html());
            $lastPrompt = $('#last-prompt');
            $body.scrollTop($body[0].scrollHeight);
        }
    });
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
    console.log(command);
    var pageIsHome = false;
    console.log(window.location.href);
    if (window.location.href.includes('info')) {
        // Info page
        if (command === 'ls') {
            $body.append('There\'s info but you don\'t wanna type it all out again');
        }
    } else if (window.location.href.includes('r%C3%A9sum%C3%A9')) {
        // Résumé page
        if (command === 'ls') {
            $body.append(''
                + '<p>'
                + '<a class="blue" href="résumé_master.pdf">résumé_master.pdf</a>&nbsp;&nbsp;'
                + '<a class="blue" href="résumé_computing.pdf">résumé_computing.pdf</a>&nbsp;&nbsp;'
                + '<a class="blue" href="résumé_physics.pdf">résumé_physics.pdf</a>'
                + '</p>');
        }
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
                $body.append('<p>You should try <span class="yellow">cd info</span> or <span class="yellow">cd resume</span> or simply click a link</p>');
            }
        } else {
            $body.append('<p><strong>Bad command.</strong> You should try <span class="yellow">help</span>');
        }
    }
    if (!pageIsHome) {
        if (command === 'ls') {

        } else if (command.includes('cd')) {
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
        } else if (command === 'help') {
            $body.append('<p><span class="yellow">cd</span>: <em>change directory</em></p>');
            $body.append('<p>Eg: type <span class="yellow">cd ..</span> to go back or <span class="yellow">cd ../info</span> to go to the info page</p>');
            $body.append('<p>&nbsp;</p>');
            $body.append('<p><span class="yellow">ls</span>: <em>list files</em></p>');
            $body.append('<p>Eg: type <span class="yellow">ls</span> to see all the subfolders and files</p>');
        } else {
            $body.append('<p><strong>Bad command.</strong> You should try <span class="yellow">help</span>');
        }
    }
    $lastPrompt.removeAttr('id');
    $body.append('<p class="prompt" id="last-prompt">');
    $lastPrompt = $('#last-prompt');
    $body.scrollTop($body[0].scrollHeight);
}