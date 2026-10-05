# Interactive Brokers SDE1 — Java pen-and-paper DSA

Memorize one pair at a time. Read the question. Cover the answer. Write the `Solution` class on paper. Uncover and compare.

Every coding answer has the same shape: `class Solution`, one `public` method, a comment on the line that matters, then time and space.

LeetCode already gives you these. Write them once on the sheet, then only the method:

```java
class ListNode {
    int val;
    ListNode next;
    ListNode(int val) { this.val = val; }
}

class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int val) { this.val = val; }
}
```

On paper, write `import java.util.*;` once.

| Day | Pairs |
| --- | --- |
| 1 | 1, 2, 3, 7, 8, 9, 10 |
| 2 | 4, 5, 11, 12, 13, 14, 15 |
| 3 | 16, 17, 18, 19, 20, 21 |
| 4 | 22, 23, 24, 25, 26, 27 |
| 5 | 28, then 29 through 39 |
| 6 | Mock at the end. Four questions, 90 minutes, answers covered. |

---

## 1. Delete a node in O(1) — Reported

**Question**

You are given the node to delete, not the head. Delete it from a singly linked list in constant time. The node is not the tail.

Example:
Input: list `4 -> 5 -> 1 -> 9`, delete the node holding `5`
Output: `4 -> 1 -> 9`

**Answer**

```java
class Solution {
    public void deleteNode(ListNode node) {
        // No previous pointer, so copy the next value into this node.
        node.val = node.next.val;
        // Then drop the successor. The given node object stays in the list.
        node.next = node.next.next;
    }
}
```

Time: `O(1)`. Space: `O(1)`.

If the node is the tail, say constant time is impossible without the head. With the head, walk until `cur.next == node` and set `cur.next = null`. That is `O(n)`.

## 2. Second maximum — Reported

**Question**

Return the second distinct maximum. One pass. Constant extra space. If every value is equal, there is no answer.

Example:
Input: `[3, 1, 4, 4, 2]`
Output: `3`
Input: `[5, 5, 1]`
Output: `1`

**Answer**

```java
class Solution {
    public int secondMax(int[] a) {
        if (a == null || a.length < 2) {
            throw new IllegalArgumentException("need at least two elements");
        }

        // Integer, not int. null means "not seen". MIN_VALUE is a real value.
        Integer first = null;
        Integer second = null;

        for (int x : a) {
            if (first != null && x == first) {
                continue; // a repeat of the max is not the second max
            }
            if (first == null || x > first) {
                second = first; // old max becomes second
                first = x;
            } else if (second == null || x > second) {
                second = x;
            }
        }

        if (second == null) {
            throw new IllegalArgumentException("no distinct second maximum");
        }
        return second;
    }
}
```

Time: `O(n)`. Space: `O(1)`.

## 3. Stream membership — Reported

**Question**

Integers arrive one by one. Each new value differs from the previous value by exactly 1. After the stream ends, return whether `x` appeared. Constant time and constant extra space.

Example:
Input: stream `[5, 6, 5, 4, 3, 4, 5, 6, 7]`, query `4`
Output: `true`
Query `2` or `8`: `false`

**Answer**

You do not store the numbers. Steps of 1 fill every integer between the smallest and the largest.

```java
class Solution {
    public boolean appeared(int[] stream, int x) {
        if (stream == null || stream.length == 0) {
            return false;
        }

        int smallest = stream[0];
        int largest = stream[0];

        for (int i = 1; i < stream.length; i++) {
            int num = stream[i];
            if (num < smallest) {
                smallest = num;
            }
            if (num > largest) {
                largest = num;
            }
        }

        if (x < smallest) {
            return false;
        }
        if (x > largest) {
            return false;
        }
        return true;
    }
}
```

Time: `O(n)` to read the stream, `O(1)` per query after that. Space: `O(1)`.

## 4. Minimum partition difference — Reported

**Question**

Split a non-negative array into two groups so the absolute difference of the group sums is as small as possible. Return that difference.

Example:
Input: `[1, 6, 11, 5]`
Output: `1`
Explanation: `{1, 6, 5}` sums to 12 and `{11}` sums to 11.

**Answer**

If one group sums to `s`, the other sums to `total - s`. The difference is `total - 2s`. Find an achievable `s` closest to `total / 2`.

```java
class Solution {
    public int minDiff(int[] a) {
        int total = 0;
        for (int x : a) {
            total += x;
        }

        boolean[] can = new boolean[total + 1];
        can[0] = true; // empty subset

        for (int x : a) {
            // Downward so this x is used once. Upward would reuse it.
            for (int s = total; s >= x; s--) {
                if (can[s - x]) {
                    can[s] = true;
                }
            }
        }

        for (int s = total / 2; s >= 0; s--) {
            if (can[s]) {
                return total - 2 * s;
            }
        }
        return total;
    }
}
```

Time: `O(n * total)`. Space: `O(total)`.

If `n` is about 20 or less and you blank on DP, each element is taken or skipped. That search is `O(2^n)`.

## 5. Repeated words — Reported (Mumbai)

**Question**

Return every word that occurs more than once. Ignore case. Keep first-seen order.

Example:
Input: `"Java is Java and java is fun"`
Output: `["java", "is"]`

**Answer**

```java
class Solution {
    public List<String> repeatedWords(String s) {
        List<String> out = new ArrayList<>();
        if (s == null || s.isEmpty()) {
            return out;
        }

        // LinkedHashMap keeps the order words were first seen.
        Map<String, Integer> count = new LinkedHashMap<>();
        String[] words = s.toLowerCase().split("\\s+");

        for (String w : words) {
            if (w.isEmpty()) {
                continue;
            }
            int seen = count.getOrDefault(w, 0);
            count.put(w, seen + 1);
        }

        for (Map.Entry<String, Integer> e : count.entrySet()) {
            if (e.getValue() > 1) {
                out.add(e.getKey());
            }
        }
        return out;
    }
}
```

Time: `O(n)`. Space: `O(u)` distinct words.

## 6. Three tree walks

**Question**

Write inorder, level order, and iterative postorder.

Example tree:

```text
    1
   / \
  2   3
 / \
4   5
```

Inorder: `[4, 2, 5, 1, 3]`
Level order: `[[1], [2, 3], [4, 5]]`
Postorder: `[4, 5, 2, 3, 1]`

**Answer**

```java
class Solution {
    public List<Integer> inorder(TreeNode root) {
        List<Integer> out = new ArrayList<>();
        walk(root, out);
        return out;
    }

    private void walk(TreeNode n, List<Integer> out) {
        if (n == null) {
            return;
        }
        walk(n.left, out);
        out.add(n.val); // on a BST this prints sorted order
        walk(n.right, out);
    }

    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> ans = new ArrayList<>();
        if (root == null) {
            return ans;
        }

        Queue<TreeNode> q = new ArrayDeque<>();
        q.offer(root);

        while (!q.isEmpty()) {
            int levelSize = q.size(); // snapshot before children are added
            List<Integer> level = new ArrayList<>();
            for (int i = 0; i < levelSize; i++) {
                TreeNode n = q.poll();
                level.add(n.val);
                if (n.left != null) {
                    q.offer(n.left);
                }
                if (n.right != null) {
                    q.offer(n.right);
                }
            }
            ans.add(level);
        }
        return ans;
    }

    public List<Integer> postorder(TreeNode root) {
        LinkedList<Integer> out = new LinkedList<>();
        if (root == null) {
            return out;
        }

        Deque<TreeNode> stack = new ArrayDeque<>();
        stack.push(root);

        while (!stack.isEmpty()) {
            TreeNode n = stack.pop();
            // Visit node, right, left. addFirst reverses that into left, right, node.
            out.addFirst(n.val);
            if (n.left != null) {
                stack.push(n.left); // push left first so right is popped first
            }
            if (n.right != null) {
                stack.push(n.right);
            }
        }
        return out;
    }
}
```

Inorder: time `O(n)`, stack space `O(h)`.
Level order: time `O(n)`, space `O(n)`.
Postorder: time `O(n)`, space `O(n)`.

## 7. Reverse a linked list

**Question**

Reverse a singly linked list.

Example:
Input: `1 -> 2 -> 3`
Output: `3 -> 2 -> 1`

**Answer**

```java
class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;
        ListNode cur = head;

        while (cur != null) {
            ListNode next = cur.next; // save the rest before overwriting the link
            cur.next = prev;
            prev = cur;
            cur = next;
        }
        return prev; // new head
    }
}
```

Time: `O(n)`. Space: `O(1)`.

## 8. Linked list cycle

**Question**

Return true if the list has a cycle.
Follow-up: return the node where the cycle begins, or null.

**Answer**

```java
class Solution {
    public boolean hasCycle(ListNode head) {
        ListNode slow = head;
        ListNode fast = head;

        while (fast != null && fast.next != null) {
            slow = slow.next;          // one step
            fast = fast.next.next;     // two steps
            if (slow == fast) {        // same node, not the same value
                return true;
            }
        }
        return false;
    }

    public ListNode detectCycle(ListNode head) {
        ListNode slow = head;
        ListNode fast = head;

        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) {
                ListNode fromHead = head; // reset one pointer
                while (fromHead != slow) {
                    fromHead = fromHead.next;
                    slow = slow.next;
                }
                return fromHead; // they meet at the entrance
            }
        }
        return null;
    }
}
```

Time: `O(n)`. Space: `O(1)`.

One sentence if they ask why the entrance works: the distance from the head to the entrance equals the distance from the meeting point back around to the entrance.

## 9. Merge two sorted lists

**Question**

Merge two sorted linked lists into one sorted list.

Example:
Input: `1 -> 2 -> 4` and `1 -> 3 -> 4`
Output: `1 -> 1 -> 2 -> 3 -> 4`

**Answer**

```java
class Solution {
    public ListNode mergeTwoLists(ListNode a, ListNode b) {
        ListNode dummy = new ListNode(0); // so the first node needs no special case
        ListNode tail = dummy;

        while (a != null && b != null) {
            if (a.val <= b.val) {
                tail.next = a;
                a = a.next;
            } else {
                tail.next = b;
                b = b.next;
            }
            tail = tail.next;
        }

        if (a != null) {
            tail.next = a; // leftover list is already sorted
        } else {
            tail.next = b;
        }
        return dummy.next;
    }
}
```

Time: `O(n + m)`. Space: `O(1)` besides the reused nodes.

## 10. Middle of the linked list

**Question**

Return the middle node. If the length is even, return the second middle.

Example:
Input: `1 -> 2 -> 3 -> 4 -> 5`
Output: node `3`
Input: `1 -> 2 -> 3 -> 4`
Output: node `3`

**Answer**

```java
class Solution {
    public ListNode middleNode(ListNode head) {
        ListNode slow = head;
        ListNode fast = head;

        while (fast != null && fast.next != null) {
            slow = slow.next;       // one step
            fast = fast.next.next;  // two steps
        }
        return slow;
    }
}
```

Time: `O(n)`. Space: `O(1)`.

## 11. Remove n-th node from the end

**Question**

Remove the n-th node from the end. `n` is valid and at least 1.

Example:
Input: `1 -> 2 -> 3 -> 4 -> 5`, `n = 2`
Output: `1 -> 2 -> 3 -> 5`

**Answer**

```java
class Solution {
    public ListNode removeNthFromEnd(ListNode head, int n) {
        ListNode dummy = new ListNode(0); // deleting the head uses the same code
        dummy.next = head;
        ListNode fast = dummy;
        ListNode slow = dummy;

        for (int i = 0; i <= n; i++) { // n + 1 steps because of the dummy
            fast = fast.next;
        }

        while (fast != null) {
            fast = fast.next;
            slow = slow.next; // slow stops on the node before the target
        }

        slow.next = slow.next.next;
        return dummy.next;
    }
}
```

Time: `O(n)`. Space: `O(1)`.

## 12. Two Sum

**Question**

Return the indices of the two numbers that add up to `target`. Exactly one answer. Do not use the same index twice.

Example:
Input: `nums = [2, 7, 11, 15]`, `target = 9`
Output: `[0, 1]`

**Answer**

```java
class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> indexOf = new HashMap<>();

        for (int i = 0; i < nums.length; i++) {
            int need = target - nums[i];
            if (indexOf.containsKey(need)) {
                return new int[] { indexOf.get(need), i };
            }
            indexOf.put(nums[i], i); // after the check, so a value is not paired with itself
        }
        return new int[0];
    }
}
```

Time: `O(n)`. Space: `O(n)`.

## 13. Best time to buy and sell stock

**Question**

Prices are in day order. One buy, then one later sell. Return the best profit. Return 0 if no profit is possible.

Example:
Input: `[7, 1, 5, 3, 6, 4]`
Output: `5`

**Answer**

```java
class Solution {
    public int maxProfit(int[] prices) {
        int cheapest = Integer.MAX_VALUE;
        int best = 0;

        for (int price : prices) {
            if (price < cheapest) {
                cheapest = price; // new buy price
            } else {
                int profit = price - cheapest; // sell today
                if (profit > best) {
                    best = profit;
                }
            }
        }
        return best;
    }
}
```

Time: `O(n)`. Space: `O(1)`.

## 14. Maximum subarray

**Question**

Return the largest sum of any contiguous subarray. The array may contain negatives.

Example:
Input: `[-2, 1, -3, 4, -1, 2, 1, -5, 4]`
Output: `6`
Explanation: `[4, -1, 2, 1]`

**Answer**

```java
class Solution {
    public int maxSubArray(int[] a) {
        int best = a[0];    // not 0, so an all-negative array still works
        int running = a[0]; // best sum ending at the current index

        for (int i = 1; i < a.length; i++) {
            // Restart at a[i] when the previous sum is worse than starting over.
            if (running + a[i] > a[i]) {
                running = running + a[i];
            } else {
                running = a[i];
            }
            if (running > best) {
                best = running;
            }
        }
        return best;
    }
}
```

Time: `O(n)`. Space: `O(1)`.

## 15. Merge intervals

**Question**

Merge all overlapping intervals. Each interval is `[start, end]`.

Example:
Input: `[[1, 3], [2, 6], [8, 10], [15, 18]]`
Output: `[[1, 6], [8, 10], [15, 18]]`

**Answer**

```java
class Solution {
    public int[][] merge(int[][] intervals) {
        if (intervals == null || intervals.length == 0) {
            return new int[0][];
        }

        Arrays.sort(intervals, new Comparator<int[]>() {
            public int compare(int[] a, int[] b) {
                return Integer.compare(a[0], b[0]); // sort by start
            }
        });

        List<int[]> out = new ArrayList<>();
        int start = intervals[0][0];
        int end = intervals[0][1];

        for (int i = 1; i < intervals.length; i++) {
            if (intervals[i][0] <= end) {
                // Overlap or touch. Math.max so a shorter interval does not shrink end.
                if (intervals[i][1] > end) {
                    end = intervals[i][1];
                }
            } else {
                out.add(new int[] { start, end });
                start = intervals[i][0];
                end = intervals[i][1];
            }
        }
        out.add(new int[] { start, end }); // last interval is still open
        return out.toArray(new int[out.size()][]);
    }
}
```

Time: `O(n log n)`. Space: `O(n)`.

## 16. Valid parentheses

**Question**

Return true if the brackets are valid. The string contains only `()[]{}`.

Example:
Input: `"()[]{}"` → `true`
Input: `"([)]"` → `false`
Input: `"(("` → `false`

**Answer**

```java
class Solution {
    public boolean isValid(String s) {
        Deque<Character> stack = new ArrayDeque<>();

        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '(' || c == '{' || c == '[') {
                stack.push(c);
                continue;
            }
            if (stack.isEmpty()) {
                return false; // closer with nothing open
            }
            char open = stack.pop();
            if (c == ')' && open != '(') {
                return false;
            }
            if (c == '}' && open != '{') {
                return false;
            }
            if (c == ']' && open != '[') {
                return false;
            }
        }
        return stack.isEmpty(); // false when an opener was never closed
    }
}
```

Time: `O(n)`. Space: `O(n)`.

## 17. Longest substring without repeating characters

**Question**

Return the length of the longest substring in which every character is unique.

Example:
Input: `"abcabcbb"`
Output: `3`
Explanation: `"abc"`
Input: `"bbbbb"` → `1`
Input: `"pwwkew"` → `3`

**Answer**

```java
class Solution {
    public int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> last = new HashMap<>(); // char -> last index
        int start = 0;
        int best = 0;

        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (last.containsKey(c) && last.get(c) >= start) {
                // Repeat is still inside the window. Do not move start backward.
                start = last.get(c) + 1;
            }
            last.put(c, i);
            int len = i - start + 1;
            if (len > best) {
                best = len;
            }
        }
        return best;
    }
}
```

Time: `O(n)`. Space: `O(k)` for the characters you actually see.

## 18. Maximum sum of a window of size k

**Question**

Return the maximum sum of any contiguous window of length `k`.

Example:
Input: `[2, 1, 5, 1, 3, 2]`, `k = 3`
Output: `9`
Explanation: `[5, 1, 3]`

**Answer**

```java
class Solution {
    public int maxWindowSum(int[] a, int k) {
        if (a == null || k <= 0 || k > a.length) {
            throw new IllegalArgumentException("bad window");
        }

        int window = 0;
        for (int i = 0; i < k; i++) {
            window += a[i]; // first window
        }

        int best = window;
        for (int i = k; i < a.length; i++) {
            window = window + a[i] - a[i - k]; // add the new right, drop the left
            if (window > best) {
                best = window;
            }
        }
        return best;
    }
}
```

Time: `O(n)`. Space: `O(1)`.

## 19. Binary search

**Question**

Search a sorted ascending array of distinct ints. Return the index, or `-1`.

Example:
Input: `[1, 3, 5, 7, 9]`, `target = 7`
Output: `3`

**Answer**

```java
class Solution {
    public int search(int[] a, int target) {
        int lo = 0;
        int hi = a.length - 1; // inclusive

        while (lo <= hi) {
            int mid = lo + (hi - lo) / 2; // avoids lo + hi overflow
            if (a[mid] == target) {
                return mid;
            }
            if (a[mid] < target) {
                lo = mid + 1;
            } else {
                hi = mid - 1; // hi = mid loops forever when lo == hi
            }
        }
        return -1;
    }
}
```

Time: `O(log n)`. Space: `O(1)`.

## 20. BST insert and search

**Question**

Insert a value into a BST and search for a value. Equal keys go to the right.

**Answer**

```java
class Solution {
    public TreeNode insertIntoBST(TreeNode root, int val) {
        if (root == null) {
            return new TreeNode(val);
        }
        if (val < root.val) {
            root.left = insertIntoBST(root.left, val);
        } else {
            root.right = insertIntoBST(root.right, val); // equals go right
        }
        return root; // parent link stays valid
    }

    public boolean searchBST(TreeNode root, int val) {
        TreeNode cur = root;
        while (cur != null) {
            if (val == cur.val) {
                return true;
            }
            if (val < cur.val) {
                cur = cur.left;
            } else {
                cur = cur.right;
            }
        }
        return false;
    }
}
```

Time: `O(h)`. Balanced: `O(log n)`. Skewed: `O(n)`. Search uses `O(1)` extra space.

## 21. Height of a binary tree

**Question**

Return the number of nodes on the longest root-to-leaf path. An empty tree has height 0. A single node has height 1.

**Answer**

```java
class Solution {
    public int height(TreeNode root) {
        if (root == null) {
            return 0;
        }
        int left = height(root.left);
        int right = height(root.right);
        if (left > right) {
            return 1 + left;
        }
        return 1 + right;
    }
}
```

Time: `O(n)`. Space: `O(h)`.

## 22. Validate BST

**Question**

Return true if the tree is a BST. Left is strictly smaller. Right is strictly larger. Node values may be `Integer.MIN_VALUE` or `Integer.MAX_VALUE`.

Example of an invalid tree: root `10`, left `5`, right `15`, and `15`'s left child is `6`.

**Answer**

```java
class Solution {
    public boolean isValidBST(TreeNode root) {
        // long bounds so Integer.MIN_VALUE and MAX_VALUE are legal node values
        return check(root, Long.MIN_VALUE, Long.MAX_VALUE);
    }

    private boolean check(TreeNode n, long lo, long hi) {
        if (n == null) {
            return true;
        }
        if (n.val <= lo || n.val >= hi) {
            return false;
        }
        if (!check(n.left, lo, n.val)) {
            return false;
        }
        return check(n.right, n.val, hi);
    }
}
```

Time: `O(n)`. Space: `O(h)`.

## 23. Lowest common ancestor in a BST

**Question**

Return the lowest common ancestor of `p` and `q` in a BST. Both nodes exist.

**Answer**

```java
class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        TreeNode cur = root;
        while (cur != null) {
            if (p.val < cur.val && q.val < cur.val) {
                cur = cur.left; // both are on the left
            } else if (p.val > cur.val && q.val > cur.val) {
                cur = cur.right; // both are on the right
            } else {
                return cur; // split, or this node is p or q
            }
        }
        return null;
    }
}
```

Time: `O(h)`. Space: `O(1)`.

## 24. Queue from two stacks

**Question**

Implement a queue with two stacks. `offer`, `poll`, and `peek` should be amortized `O(1)`.

Example: offer `1`, offer `2`, offer `3`. First `poll` returns `1`. Next `poll` returns `2`.

**Answer**

```java
class MyQueue {
    private Deque<Integer> in = new ArrayDeque<>();  // new items
    private Deque<Integer> out = new ArrayDeque<>(); // front of the queue

    public void offer(int x) {
        in.push(x);
    }

    private void pour() {
        if (!out.isEmpty()) {
            return; // pour only when out is empty, so order stays FIFO
        }
        while (!in.isEmpty()) {
            out.push(in.pop()); // reversing once turns stack order into queue order
        }
    }

    public int poll() {
        pour();
        return out.pop();
    }

    public int peek() {
        pour();
        return out.peek();
    }
}
```

Each item is moved at most once from `in` to `out`, so each call is amortized `O(1)`.

## 25. Min stack

**Question**

`push`, `pop`, `top`, and `getMin` must each be `O(1)`.

Example: push `3`, push `1`, push `1`. `getMin` is `1`. After one pop, `getMin` is still `1`.

**Answer**

```java
class MinStack {
    private Deque<Integer> values = new ArrayDeque<>();
    private Deque<Integer> mins = new ArrayDeque<>();

    public void push(int x) {
        values.push(x);
        if (mins.isEmpty() || x <= mins.peek()) {
            mins.push(x); // <= keeps a second copy of the same minimum
        }
    }

    public int pop() {
        int x = values.pop();
        if (x == mins.peek()) {
            mins.pop(); // drop the min only when that copy leaves
        }
        return x;
    }

    public int top() {
        return values.peek();
    }

    public int getMin() {
        return mins.peek();
    }
}
```

Each method is `O(1)`. Space: `O(n)`.

## 26. Hash map with chaining

**Question**

Implement `put` and `get` for int keys using separate chaining. Then say what `java.util.HashMap` adds.

**Answer**

```java
class MyHashMap {
    static class Node {
        int key;
        int val;
        Node next; // keys that land in the same bucket
        Node(int key, int val) {
            this.key = key;
            this.val = val;
        }
    }

    private Node[] buckets = new Node[16];

    private int index(int key) {
        // (-1) % 16 is -1 in Java. floorMod stays non-negative.
        return Math.floorMod(key, buckets.length);
    }

    public void put(int key, int val) {
        int i = index(key);
        Node n = buckets[i];
        while (n != null) {
            if (n.key == key) {
                n.val = val; // update, do not insert a second node
                return;
            }
            n = n.next;
        }
        Node created = new Node(key, val);
        created.next = buckets[i]; // new node at the head of the chain
        buckets[i] = created;
    }

    public Integer get(int key) {
        int i = index(key);
        Node n = buckets[i];
        while (n != null) {
            if (n.key == key) {
                return n.val;
            }
            n = n.next;
        }
        return null; // null means missing, so a stored 0 is still findable
    }
}
```

Average `put` / `get`: `O(1)`. One long chain: `O(n)`.

Say this about the real `HashMap`:

- Default capacity 16. Load factor `0.75`. When size passes `capacity * 0.75`, capacity doubles and every entry is reinserted.
- Before Java 8 a collision chain is only a linked list.
- Since Java 8, a bin with 8 nodes becomes a red-black tree, so that bin is `O(log n)`. If the table is still smaller than 64, Java resizes instead of treeifying. At 6 nodes the tree becomes a list again.
- If `a.equals(b)` then `a.hashCode()` must equal `b.hashCode()`.

## 27. Student as a HashMap key — Reported

**Question**

`Student` has `id` and `name`. Can it be a `HashMap` key as written? Make lookup by id work. Sort by id with `Comparable`, and by name with a `Comparator`.

**Answer**

Default `equals` and `hashCode` use the object reference, so two students with the same id do not find each other. Override both on `id`.

```java
final class Student implements Comparable<Student> {
    private final int id; // final: a key must not change while it sits in the map
    private final String name;

    Student(int id, String name) {
        this.id = id;
        this.name = name;
    }

    public int id() {
        return id;
    }

    public String name() {
        return name;
    }

    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof Student)) {
            return false;
        }
        Student that = (Student) other;
        return this.id == that.id;
    }

    public int hashCode() {
        return Integer.hashCode(id); // same field as equals
    }

    public int compareTo(Student other) {
        return Integer.compare(this.id, other.id); // negative, 0, or positive
    }
}

class NameOrder implements Comparator<Student> {
    public int compare(Student a, Student b) {
        return a.name().compareTo(b.name()); // a second order, outside compareTo
    }
}
```

`Collections.sort(list)` uses `compareTo`. `Collections.sort(list, new NameOrder())` sorts by name.

`compareTo` returning 0 should agree with `equals`. Both use `id`, so that holds. `NameOrder` returns 0 for the same name even when ids differ, so do not use it alone in a `TreeSet`.

## 28. Find the bug

**Question**

Find the bug in each snippet.

**Answer**

Bug A. Binary search never finishes when the target is absent.

```java
class Solution {
    public int find(int[] a, int target) {
        int lo = 0;
        int hi = a.length - 1;
        while (lo <= hi) {
            int mid = (lo + hi) / 2;
            if (a[mid] == target) {
                return mid;
            }
            if (a[mid] < target) {
                lo = mid + 1;
            } else {
                hi = mid; // bug: when lo == hi this assigns the same hi and never ends
            }
        }
        return -1;
    }
}
```

Fix: `hi = mid - 1`, and `mid = lo + (hi - lo) / 2`.

Bug B. Reverse drops the rest of the list.

```java
class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;
        ListNode cur = head;
        while (cur != null) {
            cur.next = prev; // bug: the only link to the rest is overwritten
            prev = cur;
            cur = cur.next;  // follows the new link back to prev
        }
        return prev;
    }
}
```

Fix: `ListNode next = cur.next;` before the overwrite, then `cur = next`.

Bug C. Two students with the same id miss each other in a `HashMap`.

```java
class Student {
    int id;
    String name;

    public boolean equals(Object o) {
        if (!(o instanceof Student)) {
            return false;
        }
        return this.id == ((Student) o).id; // equals uses id
    }
    // bug: hashCode is still identity, so equal ids land in different buckets
}
```

Fix: `public int hashCode() { return Integer.hashCode(id); }` and make `id` final.

---

## 29. Spoken

**Question**

What does `Parent p = new Child()` mean when `Child extends Parent`?

**Answer**

This compiles. The variable type is `Parent`. The object type is `Child`. Calls go through `Parent` methods. An overridden method runs the `Child` body. A method that exists only on `Child` needs a cast.

## 30. Spoken

**Question**

Does `Child c = new Parent()` compile?

**Answer**

No. A `Parent` object is not a `Child`.

## 31. Spoken

**Question**

What does the cast `(Child) p` do?

**Answer**

It compiles. At run time it succeeds when `p` really refers to a `Child` or a subclass of `Child`. Otherwise it throws `ClassCastException`.

## 32. Spoken

**Question**

How do `ArrayList` and `LinkedList` differ, including cache behavior?

**Answer**

`ArrayList` stores elements in one contiguous array. Indexing is `O(1)`. Add at the end is amortized `O(1)` and sometimes copies the array. Insert in the middle shifts elements and is `O(n)`. Neighbors sit next to each other, so a scan hits the CPU cache.

`LinkedList` in Java is a doubly linked list. Indexing is `O(n)`. Insert or delete at a node you already hold is `O(1)`, and reaching that node from an index is `O(n)`. Each node is a separate object, so a scan jumps around memory and misses the cache. That is why a full scan of a linked list is slower than a scan of an array.

## 33. Spoken

**Question**

What is the difference between `==` and `equals` on objects?

**Answer**

`==` compares references. `equals` is the method you override for logical equality. On strings, use `equals`. `==` can look true only because of interning.

## 34. Spoken

**Question**

Why use `StringBuilder` when appending in a loop?

**Answer**

`String` is immutable. Each change builds a new `String`. Appending with `+` in a loop copies the growing text again and again. `StringBuilder` appends into one buffer. `StringBuffer` is the synchronized builder. Use `StringBuilder` when one thread owns the buffer.

## 35. Spoken

**Question**

What is a checked exception, and what is an unchecked exception?

**Answer**

A checked exception extends `Exception` and must be caught or declared. An unchecked exception extends `RuntimeException`. `NullPointerException` and `IllegalArgumentException` are unchecked. Use unchecked for a programmer error. Use checked when the caller can recover and should be forced to decide.

## 36. Spoken

**Question**

What do `synchronized` and `volatile` guarantee?

**Answer**

`synchronized` takes the object's lock. One thread holds it. Exit releases it, and writes inside the block become visible to the next thread that enters.

`volatile` makes reads and writes of one variable visible across threads. It does not make `count++` atomic, because increment is a read plus a write. For a counter, use `synchronized` or `AtomicInteger`.

## 37. Spoken

**Question**

When do you use an interface, and when an abstract class?

**Answer**

An interface is a contract. A class can implement several. An abstract class can hold fields and finished methods, and a class extends only one. Use an interface for a capability such as `Comparable` or `Runnable`. Use an abstract class when subclasses share real state.

## 38. Spoken

**Question**

What are a primary key, a foreign key, `INNER JOIN`, `LEFT JOIN`, and an index?

**Answer**

A primary key identifies one row and is indexed. A foreign key points at a key in another table.

`INNER JOIN` keeps rows that match in both tables. `LEFT JOIN` keeps every left-hand row and fills the right side with null when nothing matches.

An index on a column used in `WHERE` or `JOIN` avoids a full table scan. The usual structure is a B-tree: search is `O(log n)` and ranges are natural. A hash index answers equality only. Every insert and update maintains the index.

If you have not used JDBC, say so, then answer the SQL.

## 39. Spoken

**Question**

In one sentence each: process vs thread, and TCP vs UDP.

**Answer**

A process has its own address space. A thread shares that process heap and has its own stack.

TCP is a reliable byte stream. UDP sends datagrams with no delivery promise. HTTP sits on TCP. DNS usually starts on UDP.

## Mock

Cover every answer. 90 minutes. No compiler.

1. Question 7, then question 1. State the tail case on question 1.
2. Question 2. Trace `[5, 1, 5, 4, -2]` beside the code.
3. Question 17 or question 15. Walk one example on the code.
4. Question 27. Then say the Java 8 collision rule from question 26 out loud.

Done means: empty input is handled, time and space sit under the method, and the window in question 17 never moves `start` backward.
