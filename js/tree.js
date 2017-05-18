class Queue {
    constructor() {
        this.oldestIndex = 1;
        this.newestIndex = 1;
        this.storage = {};
    }

    size() {
        return this.newestIndex - this.oldestIndex;
    }

    enqueue(data) {
        this.storage[this.newestIndex] = data;
        this.newestIndex++;
    }

    dequeue() {
        let oldestIndex = this.oldestIndex;
        let newestIndex = this.newestIndex;
        let deletedData;

        if (oldestIndex !== newestIndex) {
            deletedData = this.storage[oldestIndex];
            delete this.storage[oldestIndex];
            this.oldestIndex++;
            return deletedData;
        }
    }
}

class Node {
    constructor(name, alternativeName, type) {
        this.name = name;
        if (alternativeName === undefined) {
            this.alternativeName = name;
        } else {
            this.alternativeName = alternativeName;
        }
        this.type = type;

        this.parent = null;
        this.children = [];
    }
}

class Tree {
    constructor(root) {
        root.parent = root;
        this.root = root;
    }

    traverseDepthFirst(callback) {
        (function recurse(currentNode) {
            for (let i = 0, length = currentNode.children.length; i < length; i++) {
                recurse(currentNode.children[i]);
            }
            callback(currentNode);
        })(this.root);
    }

    traverseBreadthFirst(callback) {
        let queue = new Queue();
        queue.enqueue(this.root);
        let currentTree = queue.dequeue();
        while (currentTree) {
            for (let i = 0, length = currentTree.children.length; i < length; i++) {
                queue.enqueue(currentTree.children[i]);
            }
            callback(currentTree);
            currentTree = queue.dequeue();
        }
    }

    contains(callback, traversal) {
        traversal.call(this, callback)
    }

    add(node, parentName, traversal) {
        let parent = null;
        let callback = function (node) {
            if (node.name === parentName) {
                parent = node;
            }
        };
        this.contains(callback, traversal);
        if (parent) {
            parent.children.push(node);
            node.parent = parent;
        } else {
            console.log('Error occurred when adding ' + node.name + ' to ' + parentName);
        }
    }
}