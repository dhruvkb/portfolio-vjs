/**
 *
 * @param callback
 */
function getStructure(callback) {
    $.ajax({
        method: 'GET',
        url: window.location.origin + '/js/structure.json',
        dataType: 'json',
        success: [
            function (response) {
                let basicTree = response;
                callback(basicTree);
            }
        ]
    });
}

/**
 *
 * @param basicTree
 */
function generateTree(basicTree) {
    let node = new Node(basicTree.name, basicTree.alternativeName, basicTree.type);
    tree = new Tree(node);
    if (node.type === 'folder') {
        populateTree(basicTree);
    }
}

/**
 *
 * @param basicNode
 */
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

/**
 *
 * @param node
 * @param level
 */
function printTree(node = tree.root, level = 0) {
    let color = (node.type === 'folder') ? 'blue' : 'green';
    let pre = ('│' + separator).repeat(level);
    if (node.type === 'folder') {
        printLine(
            pre +
            '<a class="' + color + '" onclick="changeDirectoryWalkthrough(absolutePathTo(nodeNamed(\'' + node.name + '\')))">' +
            node.name +
            '</a>'
        );
        for (let i = 0; i < node.children.length; i++) {
            printTree(node.children[i], level + 1);
        }
    } else {
        printLine(
            pre +
            '<a class="' + color + '" onclick="concatenateWalkthrough(absolutePathTo(nodeNamed(\'' + node.name + '\')))">' +
            node.name +
            '</a>'
        );
    }
}

/**
 *
 * @param nodeName
 * @returns {undefined}
 */
function nodeNamed(nodeName) {
    let nodeInQuestion = undefined;
    tree.traverseBreadthFirst(function (node) {
        if (node.name === nodeName || node.alternativeName === nodeName) {
            nodeInQuestion = node;
        }
    });
    return nodeInQuestion;
}

/**
 *
 * @param node
 * @returns {string}
 */
function absolutePathTo(node) {
    if (node.name === '~') {
        return '~';
    } else {
        return absolutePathTo(node.parent) + '/' + node.name;
    }
}

/**
 *
 * @param path
 * @returns {*}
 */
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