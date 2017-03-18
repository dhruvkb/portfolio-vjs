var $body = $('body');
var $lastPrompt;

var commandHeirarchy = {
    'home': [
        'ls',
        'help',
        'clear',
        'exit',
        'cd info',
        'cd résumé',
        'cd resume',
        'ccat contact.md',
        'cat contact.md',
        'ccat credits.md',
        'cat credits.md'
    ],
    'info': [
        'cd ..',
        'ccat info.md',
        'cat info.md'
    ],
    'résumé': [
        'cd ..',
        'ccat resume_master.pdf',
        'ccat resume_computing.pdf',
        'ccat resume_physics.pdf',
        'ccat résumé_master.pdf',
        'ccat résumé_computing.pdf',
        'ccat résumé_physics.pdf'
    ]
};
commandHeirarchy['home'].forEach(function (homeCommand) {
    homeCommand = homeCommand.replace(' ', ' ../');
    commandHeirarchy['info'].push(homeCommand);
    commandHeirarchy['résumé'].push(homeCommand);
});
commandHeirarchy['home'].push('ccat résumé/résumé_master.pdf');

$(document).ready(function () {
    $lastPrompt = $('#last-prompt');

    var hash = window.location.hash.replace('#', '');
    if (hash === '') {
        window.location.hash = 'home';
        hash = 'home';
    }
    if (hash !== 'home') {
        window.location.hash = 'home';
        changeDirectoryClick(hash);
    } else {
        listClick();
    }
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
            (key.charCodeAt(0) == 95) ||  // Underscore
            (key.charCodeAt(0) == 46) ||  // Dot
            (key.charCodeAt(0) == 32)) {  // Space
            $lastPrompt.append(event.key);
            $body.scrollTop($body[0].scrollHeight);
        }
    });
});

// TODO: Replace includes('') with /regex matching/
function process() {
    var hash = window.location.hash.replace('#', '');
    var command = $lastPrompt.html();
    var isBadCommand = false;

    console.log('Command received: ' + command);

    if (commandHeirarchy[hash].indexOf(command) === -1) {
        $body.append('<p>Bad command. You can click the links or read <span class="yellow">help</span></p>');
        isBadCommand = true;
    } else {
        if (command === 'ls') {
            list();
        } else if (command.includes('cd')) {
            changeDirectory(command.replace('cd ../', '').replace('cd ', ''));
        } else if (command.includes('ccat') || command.includes('cat')) {
            colorizingConcatenate(command.replace('ccat ', '').replace('cat ', ''));
        } else if (command === 'clear') {
            clearScreen();
        } else if (command === 'help') {
            $body.append('<p><span class="yellow">ls</span> shows the files in the current directory</p>');
            $body.append('<p><span class="yellow">cd </span><span class="blue"><em>dirname</em></span> lets you change directories</p>');
            $body.append('<p><span class="yellow">ccat </span><span class="green">filename</span> shows the contents of a file</p>');
            $body.append('<p>These commands will work in the current directory</p>');
            commandHeirarchy[hash].forEach(function (item) {
                $body.append('<p class="li">' + item + '</p>')
            });
        }
        else if (command === 'exit') {
            $body.append('<p>Bye! Please close the window yourself.</p>')
        }
    }
    $lastPrompt.removeAttr('id');
    $body.append('<p class="prompt ' + window.location.hash.replace('#', '') + '" id="last-prompt">');
    $lastPrompt = $('#last-prompt');
    $body.scrollTop($body[0].scrollHeight);
    if (command.includes('cd') && !isBadCommand) {
        listClick();
    }
}

function listClick() {
    $lastPrompt.typed({
        strings: ['ls'],
        typeSpeed: 100,
        content: 'text',
        callback: process
    });
}

function list() {
    var hash = window.location.hash.replace('#', '');
    if (hash === 'home') {
        $body.append(
            '<p>'
            + '<a class="blue" onclick="changeDirectoryClick(\'info\')">info</a>&nbsp;&nbsp;'
            + '<a class="blue" onclick="changeDirectoryClick(\'résumé\')">résumé</a>&nbsp;&nbsp;'
            + '<a class="green" onclick="colorizingConcatenateClick(\'contact.md\')">contact.md</a>&nbsp;&nbsp;'
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
        $body.append('<p><em><strong>Note:</strong> You may experience problems when trying to <span class="yellow">ccat</span> pdf files</em></p>');
        $body.append('<p><em>In that case, click the file name and then your browser will let you proceed</em></p>');
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
    $lastPrompt.typed({
        strings: ['cd ' + dir],
        typeSpeed: 100,
        content: 'text',
        callback: process
    });
}

function changeDirectory(destinationHash) {
    // Ensure that the user is on one of the known hashes
    var hash = destinationHash;
    if (hash === '..') {
        hash = 'home';
    } else if (hash === 'resume') {
        hash = 'résumé';
    }
    window.location.hash = hash;
}

function colorizingConcatenateClick(file) {
    $lastPrompt.typed({
        strings: ['ccat ' + file],
        typeSpeed: 100,
        content: 'text',
        callback: process
    });
}

function colorizingConcatenate(fileName) {
    // Ensure that the file requested exists
    var allowedNames = ['info.md', 'contact.md', 'credits.md'];
    if (allowedNames.indexOf(fileName) === -1) {
        var resumes = [
            'résumé_master.pdf', 'résumé_computing.pdf', 'résumé_physics.pdf',
            'resume_master.pdf', 'resume_computing.pdf', 'resume_physics.pdf'
        ];
        if (resumes.indexOf(fileName) === -1) {
            $body.append('<p>File not found. Please check the command or try <span class="yellow">help</span></p>');
        } else {
            showPdf(fileName.replace('e', 'é'));
        }
    } else {
        $.ajax({
            url: window.location.origin + '/markdowns/' + fileName.replace('.', '') + '.html',
            method: 'GET',
            async: false,
            cache: false,
            success: [
                function (response) {
                    $body.append(response);
                }
            ]
        });
    }
}

function clearScreen() {
    window.location.reload(true);
}

function showPdf(fileName) {
    window.open(window.location.origin + '/pdf/' + fileName);
}
