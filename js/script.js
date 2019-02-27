let $body = $('body');
let terminal = new Terminal('terminal');
$body.append(terminal.html);

let tree;
let currentNode;
let currentPointer;
let allowedCommands;

let commandHistory = [];
let commandHistoryUp = [];
let commandHistoryDown = [];

let domParser = new DOMParser();
let $terminal = $('#terminal');

let separator = '&nbsp;&nbsp; ';

$(document).ready(documentReady);

/**
 * All the tasks to perform as soon as the HTML document is ready
 */
function documentReady() {
    styleTerminal();

    // Asynchronous AJAX
    getStructure(function (basicTree) {
        // Convert the JSON to a proper tree implementation
        generateTree(basicTree);

        // Start at ~
        currentNode = tree.root;
        currentPointer = currentNode.name;

        // Remainder of the document ready function
        printTopBlock();

        hashToDirectory();
        window.onhashchange = hashChange;

        // Once everything is ready, take input
        takeInput();
    });
}

/**
 * Compute the prompt text that is placed before the input cursor
 * @returns {string} prompt text
 */
function getPrompt() {
    return '[guest@dhruvkb.github.io ' + currentPointer + ']$ ';
}

/**
 *
 * @param $element
 * @param text
 * @param callback
 * @param typeSpeed
 */
function typeText(text, callback) {
    let $element = $terminal.find('div').find('p').last().find('span').first();
    $element.typed({
        strings: [text],
        typeSpeed: 50,
        content: 'text',
        showCursor: false,
        callback: callback
    });
}

/**
 * This does nothing, works as a callback when you don't need one
 */
function doNothing() {
    // This does nothing, works as a callback when you don't need one
}

/**
 * This pulls the focus to the hidden input field acting as the prompt
 */
function focus() {
    $('input').focus();
}

/**
 * Set the background color, text color and size of the terminal
 * Uses the Solarized theme
 */
function styleTerminal() {
    terminal.setHeight('100vh');

    terminal.setBackgroundColor('#002b36');
    terminal.setTextColor('#93a1a1');
    terminal.setTextSize('14px');
}

/**
 * The top block introduces people to the me and the site
 * It also helps informs them of the supported commands
 */
function printTopBlock() {
    printLine('<span class="green">==================</span>');
    printLine('<span class="cyan">&nbsp;dhruv bhanushali</span>');
    printLine('<span class="green">==================</span>');
    printLine(`<strong>software developer</strong>`);
    printLine(`<strong>undergraduate, IIT Roorkee</strong>`);
    printLine('<br>');
    help();
    printLine('<br>');
    printTree();
    printLine('<br>');
}

/**
 * Attach listeners for presses of up, down and tab keys
 */
function attachListeners() {
    let $input = $('input');
    $input.on('keydown', goUp);
    $input.on('keydown', goDown);
    $input.on('keydown', autoComplete);
}

/**
 * Show the prompt and attach a listener to process the input
 */
function takeInput() {
    terminal.input('', processInput);

    let $inputParagraph = $terminal.find('div').find('p').last();
    $inputParagraph.attr('data-prompt', getPrompt());
    attachListeners();
}

/**
 * Process the entered input and then prompt for more input
 * @param input: the entered commands
 */
function processInput(input) {
    let $last = $terminal.find('div').find('p').find('div').last();
    $last.html(getPrompt() + $last.html());

    let helpRe = /^help$/;
    let clearRe = /^clear$/;
    let exitRe = /^exit$/;
    let listRe = /^ls$/;
    let treeRe = /^tree$/;
    let changeDirectoryRe = /^cd\s[~]?[a-zA-Zé\/.\-_]*$/;
    let concatenateRe = /^cat\s[~]?[a-zA-Zé\/.()\-_↵\s]+$/;

    let commandType;
    if (helpRe.test(input)) {
        commandType = 'help';
    } else if (clearRe.test(input)) {
        commandType = 'clear';
    } else if (exitRe.test(input)) {
        commandType = 'exit';
    } else if (listRe.test(input)) {
        commandType = 'list';
    } else if (treeRe.test(input)) {
        commandType = 'tree';
    } else if (changeDirectoryRe.test(input)) {
        commandType = 'changeDirectory';
    } else if (concatenateRe.test(input)) {
        commandType = 'concatenate';
    } else {
        commandType = 'badCommand';
    }

    commandHistory.push(input);
    commandHistoryUp = commandHistory.slice();
    commandHistoryDown = [];

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
            changeDirectory(input.substring(3));
            break;
        case 'concatenate':
            concatenate(input.substring(4), takeInput);
            return;
        case 'badCommand':
            badCommand();
            break;
    }

    takeInput();
}

/**
 * Print the line to the screen, rendering entered html tags
 * @param output: the line to print to the screen
 */
function printLine(output) {
    terminal.print(output);
    let $last = $terminal.find('div').find('p').find('div').last();
    let encodedStr = $last.html();
    let dom = domParser.parseFromString(
        '<!DOCTYPE html><html lang="en"><body>' + encodedStr + '</body></html>',
        'text/html'
    );
    let decodedString = dom.body.textContent;
    $last.html(decodedString);
}

/**
 * Go to the directory indicated by the hash
 */
function hashToDirectory() {
    let hash = window.location.hash.replace('#', '');
    if (hash === '' || hash === 'undefined') {
        hash = '~';
    }
    let node = nodeNamed(hash);
    if (node !== undefined && node.type === 'folder') {
        changeDirectory(node.name);
    }
}

/**
 * Update current node and pointer to match hash
 */
function hashChange() {
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