// tslint:disable:interface-over-type-literal

type Interval = [number, number];

type TreeNode = {
    interval: Interval,
    left: TreeNode,
    right: TreeNode,
    parent: TreeNode,
    max: number,
    height: number,
    assignRoot: Function,
    value: any
};

const NullNode = ((): TreeNode => ({
    interval: [0, 0],
    left: NullNode,
    right: NullNode,
    parent: NullNode,
    max: -1,
    height: -1,
    assignRoot: () => { },
    value: null
}))();

const leaf = (interval: Interval, parent, value, assignRoot = parent.assignRoot): TreeNode => ({
    interval,
    left: NullNode,
    right: NullNode,
    parent,
    max: interval[1],
    height: 0,
    assignRoot,
    value
});

const insert = (node: TreeNode, interval: Interval, value: any) => {
    const [min, max] = interval;
    if (node.interval[0] > min) {
        if (node.left === NullNode) {
            node.left = leaf(interval, node, value);
        } else {
            insert(node.left, interval, value);
        }
    } else {
        if (node.right === NullNode) {
            node.right = leaf(interval, node, value);
        } else {
            insert(node.right, interval, value);
        }
    }

    if (node.max < max) {
        node.max = max;
    }

    updateHeight(node);

    balance(node);
};

const rotateLeft = (node: TreeNode) => {
    const rightChild = node.right;
    swapParent(node, rightChild);

    node.right = rightChild.left;
    node.right.parent = node;

    rightChild.left = node;
    node.parent = rightChild;

    updateHeight(node);
    updateHeight(rightChild);
};

const swapParent = (node: TreeNode, child: TreeNode) => {
    child.parent = node.parent;
    const parent = node.parent;

    if (parent === NullNode) {
        node.assignRoot(child);
    } else {
        if (parent.left === node) {
            parent.left = child;
        } else {
            parent.right = child;
        }
    }
};

const rotateRight = (node: TreeNode) => {
    const leftChild = node.left;
    swapParent(node, leftChild);

    leftChild.right = node;
    node.parent = leftChild;

    node.left = leftChild.right;
    node.left.parent = node;

    updateHeight(node);
    updateHeight(leftChild);
};

const updateMaxAfterLeftRotate = (node) => {
    const parent = node.parent;
    const left = parent.left;

    left.max = Math.max(left.interval[1], left.left.max, left.left.max);

    node.max = Math.max(node.interval[1], node.right.max, node.left.max);

    parent.max = Math.max(parent.interval[1], parent.right.max, parent.left.max);
};

const updateMaxAfterRightRotate = (node) => {
    const parent = node.parent;
    const right = parent.right;

    right.max = Math.max(right.interval[1], right.left.max, right.left.max);

    node.max = Math.max(node.interval[1], node.right.max, node.left.max);

    parent.max = Math.max(parent.interval[1], parent.right.max, parent.left.max);
};

const balance = (node: TreeNode) => {
    if (node.left.height >= 2 + node.right.height) {
        const left = node.left;
        if (left.left.height >= left.right.height) {
            rotateRight(node);
            updateMaxAfterRightRotate(node);
        } else {
            rotateLeft(left);
            rotateRight(node);
            updateMaxAfterRightRotate(node);
        }
    } else if (node.right.height >= 2 + node.left.height) {
        const right = node.right;

        if (right.right.height > right.left.height) {
            rotateLeft(node);
            updateMaxAfterLeftRotate(node);
        } else {
            rotateRight(right);
            rotateLeft(node);
            updateMaxAfterLeftRotate(node);
        }
    }
};

const updateHeight = (node: TreeNode): void => {
    node.height = Math.max(node.left.height, node.right.height) + 1;
};


const search = (interval: Interval) =>
    (node: TreeNode) => {
        const [min, max] = interval;
        if (node.max < min) {
            return [];
        }

        const result = [];
        if (node.left !== NullNode && node.left.max >= min) {
            result.push(...search(interval)(node.left));
        }

        if (node.interval[0] <= max && min <= node.interval[1]) {
            result.push(node);
        }

        if (node.right !== NullNode) {
            result.push(...search(interval)(node.right));
        }

        return result;
    };


class IntervalTree {
    private root: TreeNode = NullNode;

    add(interval: Interval, value: any): void {
        if (this.root === NullNode) {
            this.root = leaf(interval, NullNode, value, node => this.root = node);
            return;
        }
        insert(this.root, interval, value);
    }

    range(start: number, end: number) {
        return search([start, end])(this.root);
    }

    max() {
        return this.root.max;
    }
}

export class IntervalCollection {
    private store: IntervalTree = new IntervalTree();

    constructor(elements: any[]) {
        elements
            .forEach(({ start, end, value }) =>
                this.store.add([start, end], value)
            );
    }

    range(start, end) {
        return this.store.range(start, end).map(({ value }) => value);
    }

    all() {
        return this.range(0, +Infinity);
    }

    max() {
        return this.store.max();
    }
}
