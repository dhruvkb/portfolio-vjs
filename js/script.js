let $body = $('body');
let $lastPrompt;

let basicTree;
let tree;
let currentPointer;
let currentNode;

const TYPE_SPEED = 50;

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
    // Detect the Tab key and prevent it from starting off a focus cycle
    $lastPrompt.on('keydown', tabGrab);
    // Detect the Enter key and prevent if from creating a new line
    $lastPrompt.on('keydown', enterGrab);
    // Focus snatching from body
    $body.on('click', function (event) {
        event.preventDefault();
        $lastPrompt.focus();
        cursorToEnd();
    });
});

// Helper functions

function replaceAllOccurrences(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function showPdf(fileName) {
    window.open(window.location.origin + '/pdf/' + fileName);
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
    $lastPrompt.on('keydown', tabGrab);
    $lastPrompt.on('keydown', enterGrab);
}

function goToHash() {
    let hash = window.location.hash.replace('#', '');
    if (hash === '' || hash === 'undefined') {
        hash = '~';
    }
    let node = nodeNamed(hash);
    if (node !== undefined && node.type === 'folder') {
        changeDirectoryClick(node.name);
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

// Keyboard grabber functions

function tabGrab(event) {
    if (event.key === 'Tab') {
        event.preventDefault();

        $body.append('<p>I can understand your pain, my developer friend.</p>');
        $body.append('<p>But this is not a real terminal, so please type the whole command.</p>');

        newPrompt($lastPrompt.html());

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
    /*
     tree.traverseDepthFirst(function (node) {
     console.log(node.name);
     });
     */
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

    let helpRe = /help/;
    let clearRe = /clear/;
    let exitRe = /exit/;
    let listRe = /ls/;
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
        listClick();
    }
}

// Individual command processors

function help() {
    $body.append('<p>If you find this hard, you may use the links to browse</p>');
    // TODO: Show help relevant to the currentNode
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
        string = string + "&nbsp;&nbsp;"
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

function doNothing() {
    // Do nothing
}

function listClick() {
    $lastPrompt.typed({
        strings: ['ls'],
        typeSpeed: TYPE_SPEED,
        content: 'text',
        callback: process
    });
}

function changeDirectoryClick(dirPath) {
    $lastPrompt.typed({
        strings: ['cd ' + dirPath],
        typeSpeed: TYPE_SPEED,
        content: 'text',
        callback: process
    });
}

function concatenateClick(filePath) {
    $lastPrompt.typed({
        strings: ['cat ' + filePath],
        typeSpeed: TYPE_SPEED,
        content: 'text',
        callback: (filePath.includes('.pdf')) ? doNothing : process
    });
}

function helpClick() {
    $lastPrompt.typed({
        strings: ['help'],
        typeSpeed: TYPE_SPEED,
        content: 'text',
        callback: process
    });
}