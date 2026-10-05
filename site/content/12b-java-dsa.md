# Interactive Brokers SDE1 — Java pen-and-paper DSA

Memorize one pair at a time. Read the question. Cover the answer. Write the Java on paper. Uncover and compare.

Shared nodes, write these once when a question uses them:

```java
class ListNode {
    int val;
    ListNode next; // singly linked: only a forward pointer
    ListNode(int val) { this.val = val; }
}

class TreeNode {
    int val;
    TreeNode left, right; // null means no child
    TreeNode(int val) { this.val = val; }
}
```

On paper, write `import java.util.*;` once.

Order: 1 through 28 are coding. 29 through 39 are the spoken questions from the same round. A title that says Reported comes from a public junior-round write-up.

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

Delete a node from a singly linked list in constant time. You are given that node, not the head.

**Answer**

You do not have the previous pointer, so you cannot do `prev.next = node.next`. Copy the successor into this node and unlink the successor. The node object you were given stays in the list; its value changes. That is the accepted answer for this problem.

```java
void deleteNode(ListNode node) {
    node.val = node.next.val;     // no prev pointer, so copy the next value into this node
    node.next = node.next.next;   // drop the successor; the given node object stays in the list
}
```

Walk `[4, 5, 1, 9]`, delete the node holding 5. After the copy the list is `[4, 1, 1, 9]`. After unlinking it is `[4, 1, 9]`.

This needs a successor. If the node is the tail, say so: constant time is impossible without the head (or a dummy previous link). With the head, walk until `cur.next == node` and set `cur.next = null`, which is `O(n)`.

Time `O(1)`. Extra space `O(1)`.


## 2. Second maximum — Reported

**Question**

Find the second maximum in an array in one pass and constant extra space. Second maximum means the second distinct value. If every element is equal, there is no answer.

**Answer**

Clarify before coding: “second maximum” here means the second **distinct** value. In `[5, 5, 1]` the answer is `1`. If every element is equal, there is no answer.

Use `Integer` so `Integer.MIN_VALUE` is a real data value and not a fake sentinel.

```java
int secondMax(int[] a) {
    if (a == null || a.length < 2) {
        throw new IllegalArgumentException("need at least two elements");
    }
    Integer first = null;    // Integer, not int: MIN_VALUE is a real value, null means "not seen"
    Integer second = null;
    for (int x : a) {
        if (first != null && x == first) {
            continue;         // duplicate of the max does not count as second
        }
        if (first == null || x > first) {
            second = first;   // old max becomes the second max
            first = x;
        } else if (second == null || x > second) {
            second = x;       // between second and first
        }
    }
    if (second == null) {
        throw new IllegalArgumentException("no distinct second maximum");
    }
    return second;
}
```

Trace `[3, 1, 4, 4, 2]`:

| x | first | second |
| --- | --- | --- |
| 3 | 3 | null |
| 1 | 3 | 1 |
| 4 | 4 | 3 |
| 4 | 4 | 3 (skipped, equal to first) |
| 2 | 4 | 3 (`2` is not greater than `3`) |

Answer `3`. One pass. A few variables, so extra space `O(1)`. Time `O(n)`.

If they allow a repeated maximum to count (`[5, 5]` returns `5`), drop the `x == first` skip and initialize from the first two positions instead of nulls.


## 3. Stream membership in O(1) / O(1) — Reported

**Question**

Integers arrive one by one. Each new value differs from the previous value by exactly 1. After the stream ends, answer whether a number x appeared. Constant time and constant extra space.

**Answer**

The queue is a distraction. You do not store the numbers.

Each step is exactly `+1` or `-1` on the number line. A walk that has reached both a minimum and a maximum has stepped through every integer between them. Proof you can say out loud: the first time the walk attains its final minimum and the first time it attains its final maximum, the portion of the walk between those two moments goes from one to the other in steps of 1, so every integer in between is visited.

So the whole stream is the closed range `[smallest, largest]`. You only remember those two numbers.

```java
class Solution {
    public boolean appeared(int[] stream, int x) {
        // Nothing arrived, so x was never seen.
        if (stream == null || stream.length == 0) {
            return false;
        }

        int smallest = stream[0];
        int largest = stream[0];

        for (int i = 1; i < stream.length; i++) {
            int num = stream[i];

            // Each new number is exactly 1 away from the previous one,
            // so every integer from smallest to largest has appeared.
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

Same idea if numbers arrive one by one instead of in an array:

```java
class StepStream {
    private boolean hasAnyNumber = false;
    private int smallest;
    private int largest;

    public void add(int x) {
        // First number. The range is just this one value.
        // A boolean is used because 0 can be a real number in the stream.
        if (hasAnyNumber == false) {
            smallest = x;
            largest = x;
            hasAnyNumber = true;
            return;
        }

        // Later numbers only widen the range. The numbers in between were visited
        // on the way, because each step changes the value by exactly 1.
        if (x < smallest) {
            smallest = x;
        }
        if (x > largest) {
            largest = x;
        }
    }

    public boolean contains(int x) {
        if (hasAnyNumber == false) {
            return false;
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

Example: `5, 6, 5, 4, 3, 4, 5, 6, 7`. `smallest` becomes 3, `largest` becomes 7. `contains(4)` is true. `contains(2)` and `contains(8)` are false.

Empty stream: `contains` is false for every `x`. One element: only that element.

Time per `add` and per query: `O(1)`. Extra space: `O(1)`.

Say the assumption in the interview: this is correct only while the “difference is always 1” promise holds. If a gap were allowed, you would need a set, which is `O(n)` space.


## 4. Minimum partition difference — Reported

**Question**

Split an array of non-negative integers into two groups so the absolute difference of the group sums is as small as possible. Return that difference.

**Answer**

Example: `[1, 6, 11, 5]`. Groups `{1, 6, 5}` and `{11}` sum to 12 and 11. Difference `1`.

Each element goes to group A or group B. If group A sums to `s`, group B sums to `total - s`, and the difference is `abs(total - 2s)`. You want an achievable `s` as close to `total / 2` as possible.

Brute force, fine to write first if `n` is small (about 20 or less):

```java
int minDiff(int[] a) {
    int total = 0;
    for (int x : a) total += x;
    return search(a, 0, 0, total);
}

int search(int[] a, int i, int sum, int total) {
    if (i == a.length) {
        return Math.abs(total - 2 * sum); // other group is total - sum
    }
    int skip = search(a, i + 1, sum, total);       // leave a[i] in the other group
    int take = search(a, i + 1, sum + a[i], total); // put a[i] in this group
    return Math.min(skip, take);
}
```

Time `O(2^n)`. Space `O(n)` for the call stack.

The pen-and-paper optimization is subset-sum DP. `can[s]` means some subset sums to `s`.

```java
int minDiff(int[] a) {
    int total = 0;
    for (int x : a) total += x;

    boolean[] can = new boolean[total + 1]; // can[s] = some subset sums to s
    can[0] = true;                           // empty subset

    for (int x : a) {
        for (int s = total; s >= x; s--) {   // downward: each x is used once
            if (can[s - x]) can[s] = true;
        }
    }

    for (int s = total / 2; s >= 0; s--) {   // closest achievable sum to total/2
        if (can[s]) return total - 2 * s;
    }
    return total;
}
```

The inner loop runs **downward** so each element is used once. An upward loop would reuse `x` inside the same round.

Trace sums for `[1, 6, 11, 5]`, total 23. Achievable sums include 11 and 12. Closest to 11.5 from below is 11. Difference `23 - 22 = 1`.

Time `O(n * total)`. Space `O(total)`. Values are non-negative; say that a negative element breaks this DP.

`can[0] = true` is the empty subset. That is correct: one group may be empty, and the difference is then `total`.


## 5. Repeated words — Reported (Mumbai)

**Question**

Print every word that occurs more than once in a string. Ignore case. Keep the order in which words first appear.

**Answer**

“Print the repetitive words from a string.” Preserve first-seen order. Treat uppercase and lowercase as the same word. Split on whitespace.

```java
List<String> repeatedWords(String s) {
    if (s == null || s.isEmpty()) return new ArrayList<>();

    Map<String, Integer> count = new LinkedHashMap<>(); // insertion order = first-seen order
    for (String w : s.toLowerCase().split("\\s+")) {    // ignore case, split on whitespace
        if (w.isEmpty()) continue;
        count.put(w, count.getOrDefault(w, 0) + 1);
    }

    List<String> out = new ArrayList<>();
    for (Map.Entry<String, Integer> e : count.entrySet()) {
        if (e.getValue() > 1) out.add(e.getKey()); // appeared more than once
    }
    return out;
}
```

`"Java is Java and java is fun"` → `[java, is]`.

`LinkedHashMap` keeps insertion order. A plain `HashMap` is also correct if they do not care about order; say which one you picked.

Time `O(n)`. Space `O(u)` for `u` distinct words.

If they want punctuation stripped, say you would also trim characters that are not letters before counting.


## 6. Three tree walks

**Question**

Write inorder, level order, and iterative postorder for a binary tree. State time and space for each.

**Answer**

Inorder is left, node, right. On a BST this prints sorted order. That is worth saying.

```java
void inorder(TreeNode n, List<Integer> out) {
    if (n == null) return;
    inorder(n.left, out);  // left
    out.add(n.val);        // node; on a BST this prints sorted order
    inorder(n.right, out); // right
}
```

Time `O(n)`. Stack space `O(h)`, and `h` is `n` on a skewed tree.

Level order uses a queue. Record the queue size at the start of each level so levels stay separate. That size snapshot is the line interviewers look for.

```java
List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> ans = new ArrayList<>();
    if (root == null) return ans;

    Queue<TreeNode> q = new ArrayDeque<>();
    q.offer(root);
    while (!q.isEmpty()) {
        int levelSize = q.size(); // snapshot: children added below belong to the next level
        List<Integer> level = new ArrayList<>();
        for (int i = 0; i < levelSize; i++) {
            TreeNode n = q.poll();
            level.add(n.val);
            if (n.left != null) q.offer(n.left);
            if (n.right != null) q.offer(n.right);
        }
        ans.add(level);
    }
    return ans;
}
```

Time `O(n)`. Space `O(n)` for the widest level.

Iterative postorder (left, right, node), the follow-up after a recursive walk: do node, right, left with a stack, and insert each popped value at the **front** of the output. Reversing “node, right, left” is “left, right, node.”

```java
List<Integer> postorder(TreeNode root) {
    LinkedList<Integer> out = new LinkedList<>();
    if (root == null) return out;

    Deque<TreeNode> stack = new ArrayDeque<>();
    stack.push(root);
    while (!stack.isEmpty()) {
        TreeNode n = stack.pop();
        out.addFirst(n.val);              // visit node, right, left; addFirst reverses it to left, right, node
        if (n.left != null) stack.push(n.left);   // push left first
        if (n.right != null) stack.push(n.right); // so right is popped first
    }
    return out;
}
```

Push left before right so right is popped first. Time `O(n)`. Space `O(n)`.

Tree for a trace:

```text
    1
   / \
  2   3
 / \
4   5
```

Inorder: `4 2 5 1 3`. Level order: `[1] [2 3] [4 5]`. Postorder: `4 5 2 3 1`.


## 7. Reverse a linked list

**Question**

Reverse a singly linked list.

**Answer**

```java
ListNode reverse(ListNode head) {
    ListNode prev = null;       // new tail's next
    ListNode cur = head;
    while (cur != null) {
        ListNode next = cur.next; // save the rest before overwriting cur.next
        cur.next = prev;
        prev = cur;
        cur = next;
    }
    return prev; // prev is the new head
}
```

Save `next` before you overwrite `cur.next`. That is the whole bug.

`[1, 2, 3]` becomes `[3, 2, 1]`. Empty and one-node lists return themselves. Time `O(n)`. Space `O(1)`.


## 8. Cycle, then the start of the cycle

**Question**

Detect a cycle in a singly linked list. Follow-up: return the node where the cycle begins.

**Answer**

```java
boolean hasCycle(ListNode head) {
    ListNode slow = head;
    ListNode fast = head;
    while (fast != null && fast.next != null) { // fast.next guards the two-step move
        slow = slow.next;       // one step
        fast = fast.next.next;  // two steps
        if (slow == fast) return true; // identity, not value
    }
    return false; // fast fell off: no cycle
}
```

`fast` moves two steps, `slow` one. On a cycle, `fast` gains one node per iteration and must land on `slow`. If there is no cycle, `fast` falls off the end. Compare nodes with `==` (identity), not values.

Time `O(n)`. Space `O(1)`. A `HashSet` of visited nodes also works and uses `O(n)` space. Mention it, then write Floyd, because constant space is what they want after you offer the set.

Cycle entrance: after they meet, put one pointer back at the head. Move both one step at a time. They meet at the entrance.

```java
ListNode cycleStart(ListNode head) {
    ListNode slow = head;
    ListNode fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) {
            ListNode fromHead = head; // reset one pointer to the head
            while (fromHead != slow) { // both move one step; they meet at the entrance
                fromHead = fromHead.next;
                slow = slow.next;
            }
            return fromHead;
        }
    }
    return null; // no cycle
}
```

Why this works, in one sentence: the distance from the head to the entrance equals the distance from the meeting point around the cycle back to the entrance. You do not need the algebra unless they ask. No cycle: return null.


## 9. Merge two sorted lists

**Question**

Merge two sorted linked lists into one sorted list.

**Answer**

```java
ListNode merge(ListNode a, ListNode b) {
    ListNode dummy = new ListNode(0); // dummy so the first node needs no special case
    ListNode tail = dummy;
    while (a != null && b != null) {
        if (a.val <= b.val) { // <= keeps equal values in their original relative order
            tail.next = a;
            a = a.next;
        } else {
            tail.next = b;
            b = b.next;
        }
        tail = tail.next;
    }
    tail.next = (a != null) ? a : b; // the leftover list is already sorted
    return dummy.next;
}
```

The dummy removes the “is this the first node?” branch. `<=` keeps the merge stable. Whichever list remains is already sorted, so one pointer assignment attaches it.

Time `O(n + m)`. Space `O(1)` besides the output list, which reuses the input nodes.


## 10. Middle node

**Question**

Return the middle node of a singly linked list. If the length is even, return the second middle.

**Answer**

```java
ListNode middle(ListNode head) {
    ListNode slow = head;
    ListNode fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;       // one step
        fast = fast.next.next;  // two steps; slow lands on the middle (second middle if even)
    }
    return slow;
}
```

`[1, 2, 3, 4, 5]` → node `3`. `[1, 2, 3, 4]` → node `3` (second middle). Empty list: null.

Time `O(n)`. Space `O(1)`. Counting the length and walking `n/2` is also fine; this version is one pass.


## 11. Remove n-th from the end

**Question**

Remove the n-th node from the end of a singly linked list. n is valid and at least 1.

**Answer**

Use a dummy so deleting the head is the same code as deleting any other node. Move `fast` `n + 1` steps ahead of `slow` (the extra step is the dummy). Then move both until `fast` falls off. `slow` sits on the node **before** the target.

```java
ListNode removeNthFromEnd(ListNode head, int n) {
    ListNode dummy = new ListNode(0); // deleting the head is the same as deleting any other node
    dummy.next = head;
    ListNode fast = dummy;
    ListNode slow = dummy;

    for (int i = 0; i <= n; i++) { // n + 1 steps, because of the dummy
        fast = fast.next;
    }
    while (fast != null) { // gap stays n + 1; slow stops on the node before the target
        fast = fast.next;
        slow = slow.next;
    }
    slow.next = slow.next.next;
    return dummy.next;
}
```

List `[1, 2, 3, 4, 5]`, `n = 2`. Target is `4`. After the gap, `slow` stops on `3`, and `3.next` becomes `5`.

Time `O(n)`. Space `O(1)`.


## 12. Two Sum

**Question**

Two Sum. Return the indices of two numbers that add up to a target. Exactly one answer exists. Do not use the same index twice.

**Answer**

```java
int[] twoSum(int[] a, int target) {
    Map<Integer, Integer> indexOf = new HashMap<>(); // value -> index
    for (int i = 0; i < a.length; i++) {
        int need = target - a[i];
        if (indexOf.containsKey(need)) {
            return new int[] { indexOf.get(need), i };
        }
        indexOf.put(a[i], i); // insert after the check, so a value is not paired with itself
    }
    return new int[0];
}
```

Check the map **before** inserting `a[i]`, so a value is not paired with itself. `[2, 7, 11, 15]`, target `9` → `[0, 1]`. `[3, 3]`, target `6` → `[0, 1]`, because the first `3` is already stored when the second is seen.

Time `O(n)`. Space `O(n)`.

If the array is already sorted and they want values rather than indices, use two pointers at the ends. That is `O(n)` time and `O(1)` extra space, and it destroys index information unless you stored indices first.


## 13. Best time to buy and sell stock

**Question**

Prices are given in order. One buy and one later sell. Return the best profit in one pass. Return 0 if no profit is possible.

**Answer**

Track the cheapest price seen so far. The sell is today, the buy is that cheapest earlier day.

```java
int maxProfit(int[] prices) {
    int cheapest = Integer.MAX_VALUE; // lowest price seen so far (the buy)
    int best = 0;
    for (int price : prices) {
        if (price < cheapest) {
            cheapest = price; // a new low; selling today would not use this price
        } else {
            best = Math.max(best, price - cheapest); // sell today
        }
    }
    return best; // stays 0 when prices only fall
}
```

`[7, 1, 5, 3, 6, 4]` → buy at 1, sell at 6, profit 5. Strictly decreasing prices → 0. Time `O(n)`. Space `O(1)`.


## 14. Maximum subarray

**Question**

Return the maximum sum of any contiguous subarray. The array may contain negatives.

**Answer**

```java
int maxSubArray(int[] a) {
    int best = a[0];    // start at a[0], not 0, so an all-negative array still works
    int running = a[0]; // best sum of a subarray that ends here
    for (int i = 1; i < a.length; i++) {
        running = Math.max(a[i], running + a[i]); // restart if the prefix sum is worse
        best = Math.max(best, running);
    }
    return best;
}
```

`running` is the best sum of a subarray that **ends at i**. If the previous running sum is negative, start over at `a[i]`.

`[-2, 1, -3, 4, -1, 2, 1, -5, 4]` → `6` from `[4, -1, 2, 1]`. One negative number, for example `[-3]`, returns `-3` because `best` starts at `a[0]` and never gets replaced by 0.

Time `O(n)`. Space `O(1)`.


## 15. Merge intervals

**Question**

Merge overlapping intervals. Each interval is [start, end] with start ≤ end.

**Answer**

Sort by start. Sweep left to right. If the next interval starts before the current one ends, extend the end. Otherwise close the current interval.

```java
int[][] merge(int[][] intervals) {
    if (intervals == null || intervals.length == 0) return new int[0][];

    Arrays.sort(intervals, new Comparator<int[]>() {
        public int compare(int[] a, int[] b) {
            return Integer.compare(a[0], b[0]); // sort by start
        }
    });

    List<int[]> out = new ArrayList<>();
    int start = intervals[0][0];
    int end = intervals[0][1];

    for (int i = 1; i < intervals.length; i++) {
        if (intervals[i][0] <= end) {             // overlaps or touches the open interval
            end = Math.max(end, intervals[i][1]); // extend; a contained interval must not shrink end
        } else {
            out.add(new int[] { start, end });    // close the finished interval
            start = intervals[i][0];
            end = intervals[i][1];
        }
    }
    out.add(new int[] { start, end }); // last interval is still open
    return out.toArray(new int[out.size()][]);
}
```

`[[1, 3], [2, 6], [8, 10], [15, 18]]` → `[[1, 6], [8, 10], [15, 18]]`. Touching endpoints merge because the test is `<=`. `[1, 4]` and `[4, 5]` become `[1, 5]`. If they want touching intervals kept apart, change `<=` to `<` and say you did that.

Time `O(n log n)` from the sort. The sweep is `O(n)`. Space `O(n)` for the output.

A lambda is fine if you have already talked about lambdas: `(a, b) -> Integer.compare(a[0], b[0])`. The anonymous class above is what you write if you want every token visible on paper.


## 16. Valid parentheses

**Question**

Return true if a string of brackets is valid. The string contains only ()[]{}.

**Answer**

```java
boolean isValid(String s) {
    Deque<Character> stack = new ArrayDeque<>();
    for (int i = 0; i < s.length(); i++) {
        char c = s.charAt(i);
        if (c == '(' || c == '{' || c == '[') {
            stack.push(c); // opening bracket: remember it
            continue;
        }
        if (stack.isEmpty()) return false; // closer with nothing open
        char open = stack.pop();
        if (c == ')' && open != '(') return false;
        if (c == '}' && open != '{') return false;
        if (c == ']' && open != '[') return false;
    }
    return stack.isEmpty(); // false when an opener was never closed
}
```

`"()[]{}"` true. `"(]"` false. `"([)]"` false. `"(("` false because the stack is not empty at the end. A closer with an empty stack is false.

Time `O(n)`. Space `O(n)`.


## 17. Longest substring without repeating characters

**Question**

Return the length of the longest substring in which all characters are unique.

**Answer**

Window `[start, i]`. Store the last index of each character. When `c` already appears inside the window, move `start` to one past that index.

```java
int lengthOfLongestSubstring(String s) {
    Map<Character, Integer> last = new HashMap<>(); // char -> last index
    int start = 0; // window is [start, i]
    int best = 0;
    for (int i = 0; i < s.length(); i++) {
        char c = s.charAt(i);
        if (last.containsKey(c) && last.get(c) >= start) { // repeat is still inside the window
            start = last.get(c) + 1; // do not jump backward; the >= start check prevents that
        }
        last.put(c, i);
        best = Math.max(best, i - start + 1);
    }
    return best;
}
```

`"abcabcbb"`: window grows to `"abc"` (length 3), then `a` repeats and `start` jumps to index 1, and the best stays 3. `"bbbbb"` → 1. `""` → 0. `"pwwkew"` → 3 (`"wke"`).

The check `last.get(c) >= start` matters. In `"abba"`, the first `a` is at index 0, which is already outside the window when the second `a` arrives. Ignoring that and jumping `start` backward would be the bug.

Time `O(n)`. Space `O(k)` for the alphabet you actually see.


## 18. Maximum sum of a window of size k

**Question**

Return the maximum sum of any contiguous window of length k.

**Answer**

```java
int maxWindowSum(int[] a, int k) {
    if (a == null || k <= 0 || k > a.length) {
        throw new IllegalArgumentException("bad window");
    }
    int window = 0;
    for (int i = 0; i < k; i++) window += a[i]; // first window

    int best = window;
    for (int i = k; i < a.length; i++) {
        window += a[i] - a[i - k]; // add the new right end, drop the element that left
        best = Math.max(best, window);
    }
    return best;
}
```

Add the new right end, subtract the element that fell out on the left. `[2, 1, 5, 1, 3, 2]`, `k = 3` → windows 8, 7, 9, 6, answer 9.

Time `O(n)`. Space `O(1)`. Recomputing each window from scratch is `O(n * k)`. Say that, then write the slide.


## 19. Binary search

**Question**

Binary search a sorted ascending array of distinct ints. Return the index, or -1.

**Answer**

```java
int binarySearch(int[] a, int target) {
    int lo = 0;
    int hi = a.length - 1; // inclusive range
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2; // avoids lo + hi overflow
        if (a[mid] == target) return mid;
        if (a[mid] < target) lo = mid + 1;
        else hi = mid - 1; // must be mid - 1; hi = mid loops forever when lo == hi
    }
    return -1;
}
```

`lo + (hi - lo) / 2` avoids overflowing `lo + hi` when you talk about 32-bit indexes. The loop is `lo <= hi` because the search space is inclusive. On a miss, set `lo = mid + 1` or `hi = mid - 1`. Writing `hi = mid` with this inclusive loop can spin forever when `lo == hi`.

Time `O(log n)`. Space `O(1)`.


## 20. BST insert and search

**Question**

Insert a value into a BST and search for a value. Equal keys go to the right.

**Answer**

```java
TreeNode insert(TreeNode root, int val) {
    if (root == null) return new TreeNode(val);
    if (val < root.val) root.left = insert(root.left, val);
    else root.right = insert(root.right, val); // equal keys go right
    return root; // return the same root so the parent link stays valid
}

boolean search(TreeNode root, int val) {
    TreeNode cur = root;
    while (cur != null) {
        if (val == cur.val) return true;
        cur = (val < cur.val) ? cur.left : cur.right; // same rule as insert
    }
    return false;
}
```

Equal keys go right, matching `else`. Say that out loud so the interviewer knows duplicates are a choice, not an accident.

Time `O(h)`. Balanced tree: `O(log n)`. Skewed tree: `O(n)`. Insert uses `O(h)` stack. Search above is iterative, so `O(1)` extra space.


## 21. Height

**Question**

Return the height of a binary tree: the number of nodes on the longest root-to-leaf path. An empty tree has height 0.

**Answer**

```java
int height(TreeNode root) {
    if (root == null) return 0; // empty tree; a single node then returns 1
    return 1 + Math.max(height(root.left), height(root.right));
}
```

A single node returns 1. Time `O(n)`. Space `O(h)`.

If they define height as edges rather than nodes, a single node returns 0 and the recursive step is unchanged except the empty tree must be `-1`. Pick one definition and state it. This file uses node count.


## 22. Validate BST

**Question**

Return true if a binary tree is a BST. Node values may be Integer.MIN_VALUE or Integer.MAX_VALUE.

**Answer**

Carry an open range `(lo, hi)` down the tree. Every node must sit strictly inside it.

```java
boolean isValidBST(TreeNode root) {
    return check(root, Long.MIN_VALUE, Long.MAX_VALUE); // long, so Integer.MIN/MAX are legal node values
}

boolean check(TreeNode n, long lo, long hi) {
    if (n == null) return true;
    if (n.val <= lo || n.val >= hi) return false; // strict: left < node < right
    return check(n.left, lo, n.val) && check(n.right, n.val, hi);
}
```

`long` bounds matter. If `lo` and `hi` are `int`, a node holding `Integer.MIN_VALUE` can look illegal, or `hi` cannot represent “greater than MAX_VALUE.”

Equal children are rejected (`<=` and `>=`). That matches the usual BST rule: left is strictly smaller, right is strictly larger. A tree that is only “left child ≤ parent” in value but whose right subtree hides a smaller node fails this check, which is the point. Example of an invalid tree: root 10, left 5, right 15, and 15’s left child is 6. The range on that 6 is `(10, 15)`, and 6 is not inside it.

Time `O(n)`. Space `O(h)`.

An inorder walk must be strictly increasing. That is a good second answer if the range version slips:

```java
boolean isValidBST(TreeNode root) {
    long[] prev = new long[] { Long.MIN_VALUE }; // array so the recursive calls share one variable
    boolean[] hasPrev = new boolean[] { false };
    return inorderOk(root, prev, hasPrev);
}

boolean inorderOk(TreeNode n, long[] prev, boolean[] hasPrev) {
    if (n == null) return true;
    if (!inorderOk(n.left, prev, hasPrev)) return false;
    if (hasPrev[0] && n.val <= prev[0]) return false; // inorder of a BST is strictly increasing
    prev[0] = n.val;
    hasPrev[0] = true;
    return inorderOk(n.right, prev, hasPrev);
}
```


## 23. Lowest common ancestor in a BST

**Question**

Return the lowest common ancestor of two nodes in a BST. Both nodes exist in the tree.

**Answer**

Both nodes are in the tree. Use the BST property. If both values are smaller than the root, the ancestor is in the left subtree. If both are larger, it is in the right. Otherwise this node is the split, so it is the ancestor (one of `p` or `q` may be the node itself).

```java
TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
    TreeNode cur = root;
    while (cur != null) {
        if (p.val < cur.val && q.val < cur.val) {
            cur = cur.left; // both are in the left subtree
        } else if (p.val > cur.val && q.val > cur.val) {
            cur = cur.right; // both are in the right subtree
        } else {
            return cur; // split point, or one of p/q is this node
        }
    }
    return null;
}
```

Time `O(h)`. Space `O(1)`.

For a general binary tree, without the BST property, recurse to both sides and return the node where the two recursive calls are both non-null. Time `O(n)`, space `O(h)`. Write that only if they remove the BST assumption.


## 24. Queue from two stacks

**Question**

Implement a queue with two stacks. Support offer, poll, and peek. Amortized constant time is enough.

**Answer**

`in` receives new elements. `out` serves the front. Pour `in` onto `out` only when `out` is empty. Each element is pushed and popped at most once per stack, so each operation is amortized `O(1)`.

```java
class MyQueue {
    private final Deque<Integer> in = new ArrayDeque<>();  // new items enter here
    private final Deque<Integer> out = new ArrayDeque<>(); // front of the queue is the top of out

    void offer(int x) {
        in.push(x);
    }

    private void pour() {
        if (out.isEmpty()) { // pour only when out is empty, so order stays FIFO
            while (!in.isEmpty()) {
                out.push(in.pop()); // reversing the stack reverses the order once
            }
        }
    }

    int poll() {
        pour();
        return out.pop();
    }

    int peek() {
        pour();
        return out.peek();
    }
}
```

Offer 1, offer 2, offer 3. `in` from top is `3, 2, 1`. First `poll` pours, so `out` from top is `1, 2, 3`. `poll` returns 1. The next `poll` does not pour, and returns 2.

A `poll` on an empty queue throws. Say you would check `isEmpty` if they want a safe API.


## 25. Min stack

**Question**

Implement a min stack. push, pop, top, and getMin must each be constant time.

**Answer**

Keep a second stack of minimums. Push onto it when `x` is less than or equal to the current minimum. `<=` so two copies of the minimum both get recorded, and one `pop` does not forget the other.

```java
class MinStack {
    private final Deque<Integer> values = new ArrayDeque<>();
    private final Deque<Integer> mins = new ArrayDeque<>(); // mins so far, one entry per time a new min is pushed

    void push(int x) {
        values.push(x);
        if (mins.isEmpty() || x <= mins.peek()) { // <= keeps a second copy of the same minimum
            mins.push(x);
        }
    }

    int pop() {
        int x = values.pop();
        if (x == mins.peek()) mins.pop(); // drop the min only when that copy leaves
        return x;
    }

    int top() {
        return values.peek();
    }

    int getMin() {
        return mins.peek(); // O(1)
    }
}
```

Push `3, 1, 1`. Minimums are `3, 1, 1`. Pop once. Minimum is still `1`.

Each method is `O(1)`. Space `O(n)`.


## 26. Hash map with chaining, then the real one

**Question**

Implement a hash map for int keys with separate chaining. put and get only. Then say what java.util.HashMap adds.

**Answer**

Fixed table. A bad hash still works; chains just get longer. For the interview, a small table and `key % length` is enough if you also handle a negative key.

```java
class MyHashMap {
    static class Node {
        int key;
        int val;
        Node next; // chain for keys that land in the same bucket
        Node(int key, int val) {
            this.key = key;
            this.val = val;
        }
    }

    private final Node[] buckets = new Node[16];

    private int index(int key) {
        return Math.floorMod(key, buckets.length); // (-1) % 16 is -1 in Java; floorMod stays non-negative
    }

    void put(int key, int val) {
        int i = index(key);
        for (Node n = buckets[i]; n != null; n = n.next) {
            if (n.key == key) {
                n.val = val; // update; do not insert a second node for the same key
                return;
            }
        }
        Node created = new Node(key, val);
        created.next = buckets[i]; // insert at the head of the chain
        buckets[i] = created;
    }

    Integer get(int key) {
        int i = index(key);
        for (Node n = buckets[i]; n != null; n = n.next) {
            if (n.key == key) return n.val;
        }
        return null; // null means missing, so a stored 0 is still findable
    }
}
```

`put` updates an existing key instead of inserting a second node. `get` returns null on a miss so you can tell “stored 0” from “missing.” `Math.floorMod` keeps a negative key in range. In Java, `(-1) % 16` is `-1`, and that would crash as an index. Mention that.

Average `put` / `get`: `O(1)`. Worst case, one long chain: `O(n)`.

What `java.util.HashMap` adds, in the order they usually ask:

- An array of bins. Each bin is a chain of nodes holding hash, key, value, next.
- Default initial capacity 16. Default load factor `0.75`.
- When `size > capacity * loadFactor`, rehash: allocate about double the capacity (power of two) and reinsert every entry. Rehash is `O(n)`, so individual inserts are amortized `O(1)`.
- The index is not `hashCode() % n`. The hash mixes high bits (`hashCode ^ (hashCode >>> 16)`), then uses `(n - 1) & hash` because `n` is a power of two.
- Before Java 8, a collision chain was only a linked list. A bad `hashCode` made a bin `O(n)`.
- Since Java 8, a bin that reaches 8 nodes becomes a red-black tree, so that bin is `O(log n)`. If the table is still smaller than 64, Java resizes instead of treeifying. When a tree bin shrinks to 6 nodes, it becomes a list again.
- Keys must obey: if `a.equals(b)` then `a.hashCode() == b.hashCode()`.


## 27. Student as a HashMap key, then ordering — Reported

**Question**

A Student has id and name. Can that class be a HashMap key as written? Make lookup by id work. Sort students by id with Comparable, and by name with a Comparator.

**Answer**

A class can be used as a key only after `equals` and `hashCode` agree. The default `Object` methods use identity: two `new Student(1, "Asha")` objects are not equal, and they almost certainly have different hash codes. `map.get(new Student(1, "Asha"))` returns null even if you just inserted an equal-looking student.

Override both, on the same fields. Here that field is `id`.

```java
final class Student implements Comparable<Student> {
    private final int id;     // final: a key field must not change while the object is in a map
    private final String name;

    Student(int id, String name) {
        this.id = id;
        this.name = name;
    }

    int id() { return id; }
    String name() { return name; }

    @Override
    public boolean equals(Object other) {
        if (this == other) return true;
        if (!(other instanceof Student)) return false;
        Student that = (Student) other;
        return this.id == that.id; // logical equality is the id, not the reference
    }

    @Override
    public int hashCode() {
        return Integer.hashCode(id); // same field as equals; equal ids share a bucket
    }

    @Override
    public int compareTo(Student other) {
        return Integer.compare(this.id, other.id); // negative, 0, or positive
    }
}
```

If you override `equals` and forget `hashCode`, the bucket is chosen with the identity hash, then `equals` says the ids match, but `get` is looking in a different bucket. Lookup fails.

Keep key fields `final`. If `id` changes while the object sits in the map, the entry stays in the old bucket and `get` cannot find it.

`compareTo` returns a negative number when `this` comes first, `0` when the two are tied, and a positive number when `this` comes after. The values do not have to be exactly `-1` and `1`. `Integer.compare` already follows that contract. `Collections.sort(list)` with no extra argument uses `compareTo`.

A different order does not belong on `compareTo`. Write a `Comparator`:

```java
class NameOrder implements Comparator<Student> {
    public int compare(Student a, Student b) {
        return a.name().compareTo(b.name()); // a second order, outside compareTo
    }
}
```

`Collections.sort(list, new NameOrder());`

`Comparable` is the class’s natural order (one of them). `Comparator` is an outside policy, and you can have as many as you need. Natural order here is id. Name order is a comparator. If two students share a name, this comparator returns 0 even though their ids differ. Say that if they ask about a tie.

Contract worth one sentence: `compareTo` returning 0 should agree with `equals` for sorted sets. This class does that, because both use `id`. The name comparator does not, so do not use `NameOrder` as the only ordering inside a `TreeSet` if students can share a name; the second student would be dropped.


## 28. Find the bug

**Question**

Find the bug in each snippet. A Mumbai online test used this format.

**Answer**

**Bug A.** Binary search never finishes when the target is absent.

```java
int find(int[] a, int target) {
    int lo = 0;
    int hi = a.length - 1;
    while (lo <= hi) {
        int mid = (lo + hi) / 2;    // can overflow; prefer lo + (hi - lo) / 2
        if (a[mid] == target) return mid;
        if (a[mid] < target) lo = mid + 1;
        else hi = mid;              // bug: when lo == hi this assigns hi the same value and never ends
    }
    return -1;
}
```

When `lo == hi` and `a[mid]` is too big, `hi = mid` assigns `hi` the same value. The loop condition stays true.

Fix: `else hi = mid - 1;` and `int mid = lo + (hi - lo) / 2;`.

**Bug B.** Reverse drops the rest of the list.

```java
ListNode reverse(ListNode head) {
    ListNode prev = null;
    ListNode cur = head;
    while (cur != null) {
        cur.next = prev;           // bug: the only link to the rest of the list is overwritten
        prev = cur;
        cur = cur.next;            // follows the new link back to prev, not forward
    }
    return prev;
}
```

`cur.next = prev` overwrites the only link to the remainder, then `cur = cur.next` follows that new link back to `prev`.

Fix: `ListNode next = cur.next;` before the overwrite, then `cur = next;` at the bottom.

**Bug C.** Two students with the same id do not find each other in a `HashMap`.

```java
class Student {
    int id;
    String name;
    public boolean equals(Object o) {
        if (!(o instanceof Student)) return false;
        return this.id == ((Student) o).id; // equals uses id
    }
    // bug: hashCode is still Object's identity hash, so equal ids land in different buckets
}
```

`HashMap` chooses the bin with `hashCode`, then checks `equals` inside that bin. Default `hashCode` is identity, so an equal id in another object lives in another bin.

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
