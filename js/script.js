let $body = $('body');
let $lastPrompt;

let basicTree;
let tree;
let currentPointer;
let currentNode;

let allowedCommands = {};

let commandHistory = [];

let commandHistoryUp = [];
let commandHistoryDown = [];

const TYPE_SPEED = 50;
const alert = new Audio('ogg/glass.ogg');
const separator = '&nbsp;&nbsp; ';

$(document).ready(function () {
    // Set up the filesystem structure
    getStructure();
    generateTree();
    currentNode = tree.root;

    // Set the lastPrompt variable
    $lastPrompt = $('#last-prompt');

    // Update the currentPointer variable based on the current hash
    goToHash();
    // Automatically update the currentPointer variable whenever the hash changes
    $(window).on('hashchange', updateCurrentPointer);

    // Set the focus on body in order to detect keystrokes
    $lastPrompt.focus();
    // Attach listeners on last prompt
    attachListeners();
    // Attach listener on body
    $body.on('click', function (event) {
        event.preventDefault();
        $lastPrompt.focus();
        cursorToEnd();
    });
});

// Helper functions

function doNothing() {
    // Do nothing
}

function getShow(element) {
    return element['show'];
}

function replaceAllOccurrences(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function showPdf(fileName) {
    window.open(window.location.origin + '/pdf/' + fileName);
}

function typeText(text, callback, typeSpeed = TYPE_SPEED) {
    $lastPrompt.typed({
        strings: [text],
        typeSpeed: typeSpeed,
        content: 'text',
        callback: callback
    });
}

function attachListeners() {
    // Detect the Up key and use it to display the commands in reverse order
    $lastPrompt.on('keydown', upGrab);
    // Detect the Down key and use it to display the commands in forward order
    $lastPrompt.on('keydown', downGrab);
    // Detect the Tab key and prevent it from starting off a focus cycle
    $lastPrompt.on('keydown', tabGrab);
    // Detect the Enter key and prevent if from creating a new line
    $lastPrompt.on('keydown', enterGrab);
    // Focus snatching from body
}

function cursorToEnd() {
    let el = document.getElementById("last-prompt");
    let range = document.createRange();
    let sel = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
}

function newPrompt(presetContent = "") {
    let promptClass = (currentPointer === '~') ? 'home' : currentPointer;
    $body.append('<p class="prompt ' + promptClass + '" id="last-prompt" contenteditable="true">' + presetContent);
    $body.scrollTop($body[0].scrollHeight);

    $lastPrompt.removeAttr('id');
    $lastPrompt.removeAttr('contenteditable');
    $lastPrompt.off('keydown');

    $lastPrompt = $('#last-prompt');

    $lastPrompt.focus();
    attachListeners();
}

function goToHash() {
    let hash = window.location.hash.replace('#', '');
    if (hash === '' || hash === 'undefined') {
        hash = '~';
    }
    let node = nodeNamed(hash);
    if (node !== undefined && node.type === 'folder') {
        changeDirectoryClick(node.name);
        printTree();
    }
}

function updateCurrentPointer() {
    let hash = window.location.hash.replace('#', '');
    if (hash === '' || hash === 'undefined') {
        hash = '~';
    }
    currentPointer = hash;
    tree.traverseBreadthFirst(function (node) {
        if (node.name === currentPointer || node.alternativeName === currentPointer) {
            currentNode = node;
        }
    });
}

function updateAllowedCommands() {
    let allowedCommandsList = ['help', 'clear', 'exit', 'ls'];
    for (let i = 0; i < allowedCommandsList.length; i++) {
        allowedCommandsList[i] = {
            'show': '<span class="yellow">' + allowedCommandsList[i] + '</span>',
            'mean': allowedCommandsList[i]
        };
    }
    let children = currentNode.children;
    for (let i = 0; i < children.length; i++) {
        let child = children[i];
        let command = '';
        let className = '';
        if (child.type === 'file') {
            command = 'cat';
            className = 'green';
        }
        if (child.type === 'folder') {
            command = 'cd';
            className = 'blue';
        }

        let show = '<span class="yellow">'
            + command
            + '</span>'
            + '&nbsp;'
            + '<span class="' + className + '">'
            + child.name
            + '</span>';
        let mean = command + ' ' + child.name;
        allowedCommandsList.push({
            'show': show,
            'mean': mean
        });
        if (child.name !== child.alternativeName) {
            show = '<span class="yellow">'
                + command
                + '</span>'
                + '&nbsp;'
                + '<span class="' + className + '">'
                + child.alternativeName
                + '</span>';
            mean = command + ' ' + child.alternativeName;
            allowedCommandsList.push({
                'show': show,
                'mean': mean
            });
        }
    }
    allowedCommands = allowedCommandsList;
}

// Keyboard grabber functions

function upGrab(event) {
    if (event.key === 'ArrowUp') {
        event.preventDefault();

        if (commandHistoryUp.length !== 0) {
            let currentText = $lastPrompt.html();
            commandHistoryDown.push(currentText);
            $lastPrompt.html(commandHistoryUp.pop());
            cursorToEnd();
        }
    }
}

function downGrab(event) {
    if (event.key === 'ArrowDown') {
        event.preventDefault();

        if (commandHistoryDown.length !== 0) {
            let currentText = $lastPrompt.html();
            commandHistoryUp.push(currentText);
            $lastPrompt.html(commandHistoryDown.pop());
            cursorToEnd();
        }
    }
}

function tabGrab(event) {
    if (event.key === 'Tab') {
        event.preventDefault();

        let command = $lastPrompt.html();

        let matches = [];
        for (let i = 0; i < allowedCommands.length; i++) {
            let allowedCommand = allowedCommands[i];
            if (allowedCommand['mean'].startsWith(command)) {
                matches.push(allowedCommand);
            }
        }
        if (matches.length !== 1) {
            alert.play();
        }
        if (matches.length > 1) {
            let string = '<p>' + matches.map(getShow).join(separator) + '</p>';
            $body.append(string);
            newPrompt($lastPrompt.html());
        }
        if (matches.length === 1) {
            $lastPrompt.html(matches[0]['mean']);
        }

        // Set cursor at the end of the paragraph
        cursorToEnd();
    }
}

function enterGrab(event) {
    if (event.key === 'Enter') {
        event.preventDefault();

        process();
    }
}

// Tree handling functions

function getStructure() {
    $.ajax({
        method: 'GET',
        url: window.location.origin + '/js/structure.json',
        async: false,
        dataType: 'json',
        success: [
            function (response) {
                basicTree = response;
            }
        ]
    });
}

function generateTree() {
    let node = new Node(basicTree.name, basicTree.alternativeName, basicTree.type);
    tree = new Tree(node);
    if (node.type === 'folder') {
        populateTree(basicTree);
    }
}

function populateTree(basicNode) {
    let basicChildren = basicNode.children;
    for (let i = 0; i < basicChildren.length; i++) {
        let basicChild = basicChildren[i];
        let childNode = new Node(basicChild.name, basicChild.alternativeName, basicChild.type);
        tree.add(childNode, basicNode.name, tree.traverseBreadthFirst);
        if (basicChild.type === 'folder') {
            populateTree(basicChild);
        }
    }
}

function printTree(node = tree.root, level = 0) {
    let color = (node.type === 'folder') ? 'blue' : 'green';
    let pre = ('│' + separator).repeat(level);
    if (node.type === 'folder') {
        $body.append(
            '<p>' +
            pre +
            '<a class="' + color + '" onclick="changeDirectoryClick(absolutePathTo(nodeNamed(\'' + node.name + '\')))">' +
            node.name +
            '</a>' +
            '</p>'
        );
        for (let i = 0; i < node.children.length; i++) {
            printTree(node.children[i], level + 1);
        }
    } else {
        $body.append(
            '<p>' +
            pre +
            '<a class="' + color + '" onclick="concatenateClick(absolutePathTo(nodeNamed(\'' + node.name + '\')))">' +
            node.name +
            '</a>' +
            '</p>'
        );
    }
}

function nodeNamed(nodeName) {
    let nodeInQuestion = undefined;
    tree.traverseBreadthFirst(function (node) {
        if (node.name === nodeName || node.alternativeName === nodeName) {
            nodeInQuestion = node;
        }
    });
    return nodeInQuestion;
}

function absolutePathTo(node) {
    if (node.name === '~') {
        return '~';
    } else {
        return absolutePathTo(node.parent) + '/' + node.name;
    }
}

function nodeFrom(path) {
    let nodeInQuestion = currentNode;
    let pathEntities = path.split('/');
    for (let i = 0; i < pathEntities.length; i++) {
        let entity = pathEntities[i];
        if (entity === '~') {
            nodeInQuestion = tree.root;
        } else if (entity === '.') {
            // Do nothing
        } else if (entity === '..') {
            nodeInQuestion = nodeInQuestion.parent;
        } else {
            let nextNode = undefined;
            for (let j = 0; j < nodeInQuestion.children.length; j++) {
                let child = nodeInQuestion.children[j];
                if (child.name === entity || child.alternativeName === entity) {
                    nextNode = child;
                }
            }
            if (nextNode === undefined) {
                return undefined;
            } else {
                nodeInQuestion = nextNode;
            }
        }
    }
    return nodeInQuestion;
}

// Command processing

function process() {
    let command = $lastPrompt.html();

    // Save the command into history
    commandHistory.push(command);
    // Make the entire history available on pressing Up
    commandHistoryUp = commandHistory.slice();
    // Clear the down history because that nothing after Enter
    commandHistoryDown = [];

    let helpRe = /help/;
    let clearRe = /clear/;
    let exitRe = /exit/;
    let listRe = /ls/;
    let treeRe = /tree/;
    let changeDirectoryRe = /cd\s[~]?[a-zA-Zé\/.\-_]*/;
    let concatenateRe = /cat\s[~]?[a-zA-Zé\/.()\-_↵\s]+/;

    let commandType;
    if (helpRe.test(command)) {
        commandType = 'help';
    } else if (clearRe.test(command)) {
        commandType = 'clear';
    } else if (exitRe.test(command)) {
        commandType = 'exit';
    } else if (listRe.test(command)) {
        commandType = 'list';
    } else if (treeRe.test(command)) {
        commandType = 'tree';
    } else if (changeDirectoryRe.test(command)) {
        commandType = 'changeDirectory';
    } else if (concatenateRe.test(command)) {
        commandType = 'concatenate';
    } else {
        commandType = 'badCommand';
    }

    switch (commandType) {
        case 'help':
            help();
            break;
        case 'clear':
            clear();
            break;
        case 'exit':
            exit();
            break;
        case 'list':
            list();
            break;
        case 'tree':
            printTree();
            break;
        case 'changeDirectory':
            changeDirectory(command.substring(3));
            break;
        case 'concatenate':
            concatenate(command.substring(4));
            break;
        case 'badCommand':
            badCommand();
            break;
    }

    newPrompt();

    if (commandType === 'changeDirectory') {
        // List files after the process
        // listClick();
        // ^ Disabled at Ketan's behest
    }
}

// Individual command processors

function help() {
    $body.append('<p>You can:</p>');
    $body.append('<p> - go to directory <span class="blue">dirname</span> with <span class="yellow">cd</span> <span class="blue">dirname</span></p>');
    $body.append('<p> - read file <span class="green">filename</span> with <span class="yellow">cat</span> <span class="green">filename</span></p>');
    $body.append('<p> - see all files in the current directory with <span class="yellow">ls</span></p>');
    $body.append('<p> - print a sitemap with <span class="yellow">tree</span></p>');
    $body.append('<p> - clear the screen with <span class="yellow">clear</span></p>');
    $body.append('<p> - read help with <span class="yellow">help</span></p>');
    $body.append('<p> - use the mouse to click on the links and never type a command at all</p>');
}

function clear() {
    window.location.reload(true);
}

function exit() {
    $body.append('<p><span class="yellow">Goodbye!</span></p>');
    $body.append('<p>JavaScript is not allowed to close this window.</p>');
}

function list() {
    let string = '<p>';
    for (let i = 0; i < currentNode.children.length; i++) {
        let child = currentNode.children[i];
        if (child.type === 'folder') {
            string = string + '<a class="blue" onclick="changeDirectoryClick(absolutePathTo(nodeNamed(\'' + child.name + '\')))">';
            string = string + child.name;
            string = string + '</a>';
        } else {
            string = string + '<a class="green" onclick="concatenateClick(absolutePathTo(nodeNamed(\'' + child.name + '\')))">';
            string = string + child.name;
            string = string + '</a>';
        }
        string = string + separator;
    }
    string = string + '</p>';
    $body.append(string);
}

function changeDirectory(path) {
    let nextNode = nodeFrom(path);
    if (nextNode === undefined || nextNode.type === 'file') {
        badCommand();
        return;
    }
    currentNode = nextNode;
    currentPointer = currentNode.name;
    window.location.hash = currentPointer;
    updateAllowedCommands();
}

function concatenate(path) {
    let node = nodeFrom(path);
    if (node === undefined || node.type === 'folder') {
        badCommand();
        return;
    }
    let fileName = node.name;
    if (fileName.includes('.md')) {
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
    } else if (fileName.includes('.pdf')) {
        showPdf(replaceAllOccurrences(fileName, 'resume', 'résumé'));
    }
}

function badCommand() {
    $body.append('<p>Bad command. See <a class="yellow" onclick="helpClick()">help</a> or use the links to browse.</p>');
}

// Automated command typing functions

function listClick() {
    typeText('ls', process);
}

function changeDirectoryClick(dirPath) {
    typeText('cd ' + dirPath, process)
}

function concatenateClick(filePath) {
    typeText('cat ' + filePath, (filePath.includes('.pdf')) ? doNothing : process);
}

function helpClick() {
    typeText('help', process);
}