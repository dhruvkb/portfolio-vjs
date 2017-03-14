var $body = $('body');
var $lastPrompt;
$(document).ready(function () {
    changeDirectory(window.location.hash.replace('#', ''), true);
    var hash = window.location.hash.replace('#', '');

    // Print the prompt for the particular hash
    if (hash !== 'home') {
        $body.append('<p class="prompt home">cd ' + hash + '</p>');
    }
    $body.append('<p class="prompt ' + hash + '" id="last-prompt"></p>');
    $lastPrompt = $('#last-prompt');

    // Grab the focus to log keys
    $body.focus();

    // Detect the Tab key and prevent it from starting off a focus cycle
    $body.keydown(function (event) {
        if (event.key === 'Tab') {
            event.preventDefault();
            $body.focus();
            $body.append('<p>I feel your pain, my developer friend.</p><p>But this is not a real terminal so please type the whole thing.</p>');
            $lastPrompt.removeAttr('id');
            $body.append('<p class="prompt ' + hash + '" id="last-prompt">' + $lastPrompt.html());
            $lastPrompt = $('#last-prompt');
            $body.scrollTop($body[0].scrollHeight);
        }
    });

    // Detect other keys and then transfer control to command processing
    $body.keyup(function (event) {
        $body.scrollTop($body[0].scrollHeight);
        var key = event.key;
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
    console.log('Command received: ' + command);
    var hash = window.location.hash.replace('#', '');
    if (command === 'ls') {
        list();
    } else if (command.includes('cd')) {
        changeDirectory(command.replace('cd ', ''), false);
    } else if (command.includes('ccat')) {
        colorizingConcatenate();
    } else if (command === 'exit') {
        $body.append('<p>Bye! Please close the window yourself.</p>')
    } else {
        if (hash === 'home') {
            if (command === 'help') {

            }
        } else {
            if (hash === 'info') {

            } else if (hash === 'résumé') {

            } else if (hash === 'contact') {

            } else {

            }
        }
    }
    $lastPrompt.removeAttr('id');
    $body.append('<p class="prompt ' + window.location.hash.replace('#', '') + '" id="last-prompt">');
    $lastPrompt = $('#last-prompt');
    $body.scrollTop($body[0].scrollHeight);
}

function list() {
    var hash = window.location.hash.replace('#', '');
    if (hash === 'home') {
        $body.append(
            '<p>'
            + '<a class="blue" onclick="changeDirectoryClick(\'info\')">info</a>&nbsp;&nbsp;'
            + '<a class="blue" onclick="changeDirectoryClick(\'résumé\')">résumé</a>&nbsp;&nbsp;'
            + '<a class="blue" onclick="changeDirectoryClick(\'contact\')">contact</a>&nbsp;&nbsp;'
            + '<a class="green" onclick="colorizingConcatenateClick(\'credits.md\')">credits.md</a>'
            + '</p>'
        );
    }
    if (hash === 'info') {
        $body.append(
            '<p>'
            + '<a class="blue" onclick="changeDirectoryClick(\'..\')">.. (up)</a>&nbsp;&nbsp;'
            + '<a class="green" onclick="colorizingConcatenateClick(\'info.md\')">info.md</a>'
            + '</p>'
        );
    }
    if (hash === 'résumé') {
        $body.append(
            '<p>'
            + '<a class="blue" onclick="changeDirectoryClick(\'..\')">.. (up)</a>&nbsp;&nbsp;'
            + '<a class="green" onclick="showPdf(\'résumé_master.pdf\')">résumé_master.pdf</a>&nbsp;&nbsp;'
            + '<a class="green" onclick="showPdf(\'résumé_computing.pdf\')">résumé_computing.pdf</a>&nbsp;&nbsp;'
            + '<a class="green" onclick="showPdf(\'résumé_physics.pdf\')">résumé_physics.pdf</a>'
            + '</p>'
        );
    }
    if (hash === 'contact') {
        $body.append(
            '<p>'
            + '<a class="blue" onclick="changeDirectoryClick(\'..\')">.. (up)</a>&nbsp;&nbsp;'
            + '<a class="green" onclick="colorizingConcatenateClick(\'contact.md\')">contact.md</a>'
            + '</p>'
        )
    }
}

function changeDirectoryClick(dir) {
    $lastPrompt.html('cd ' + dir);
    process();
}

function changeDirectory(destinationHash, redirect) {
    // Ensure that the user is on one of the known hashes
    var hash = destinationHash;
    var allowedHashes = ['home', '..', 'info', 'résumé', 'resume', 'contact', 'credits'];
    if (allowedHashes.indexOf(hash) === -1) {
        if (redirect) {
            window.location.hash = 'home';
        } else {
            $body.append('<p>Bad command. Please check the command or try <span class="yellow">help</span></p>');
            return;
        }
    } else {
        window.location.hash = hash;
    }
    if (hash === '..') {
        window.location.hash = 'home';
    }
    if (hash === 'resume') {
        window.location.hash = 'résumé';
    }
    hash = window.location.hash.replace('#', '');

    //Print the introduction for the particular hash
    $body.append('<p class="prompt ' + hash + '">ls</p>');
    list();
}

function colorizingConcatenateClick(file) {
    $lastPrompt.html('ccat ' + file);
    process();
}

function colorizingConcatenate() {

}

function showPdf() {

}