/***********************************************************************
 * LRU CACHE (Low Level Design)
 *
 * GOAL:
 * - O(1) get and put
 * - Evict least recently used item
 *
 * APPROACH:
 * - HashMap (key → node) for O(1) lookup
 * - Doubly Linked List for O(1) insert/remove and ordering
 *
 * COMPLEXITY:
 * - get:  O(1)
 * - put:  O(1)
 * - space: O(capacity)
 *
 * OOP PRINCIPLES:
 * - Encapsulation: DLL logic hidden inside class
 * - Composition: Cache uses Map + DLL
 * - SRP: Each class has a single responsibility
 ***********************************************************************/


/***********************************************************************
 * STEP 1: NODE
 *
 * RESPONSIBILITY:
 * - Represents a cache entry
 *
 * SPEAK:
 * "Each node stores key-value pair and pointers
 *  for efficient reordering in O(1)."
 ***********************************************************************/
class ListNode {
  constructor(
    public key: number,
    public value: number,
    public prev: ListNode | null = null,
    public next: ListNode | null = null
  ) {}
}


/***********************************************************************
 * STEP 2: DOUBLY LINKED LIST
 *
 * RESPONSIBILITY:
 * - Maintain access order
 * - Most Recently Used (MRU) → near head
 * - Least Recently Used (LRU) → near tail
 *
 * DESIGN:
 * - Uses dummy head & tail to avoid edge-case checks
 *
 * SPEAK:
 * "DLL maintains access order — most recently used
 *  items are near the head, least recently used near the tail."
 ***********************************************************************/
class DoublyLinkedList {
  private head: ListNode;
  private tail: ListNode;

  constructor() {
    // Dummy nodes simplify insert/remove logic
    this.head = new ListNode(0, 0);
    this.tail = new ListNode(0, 0);

    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  /**
   * Add node right after head (mark as most recently used)
   */
  addToFront(node: ListNode): void {
    node.next = this.head.next;
    node.prev = this.head;

    this.head.next!.prev = node;
    this.head.next = node;
  }

  /**
   * Remove a node from its current position
   */
  remove(node: ListNode): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }

  /**
   * Move an existing node to front (mark as MRU)
   */
  moveToFront(node: ListNode): void {
    this.remove(node);
    this.addToFront(node);
  }

  /**
   * Remove least recently used node (from tail)
   */
  removeLRU(): ListNode | null {
    // If list is empty (only dummy nodes)
    if (this.tail.prev === this.head) return null;

    const lru = this.tail.prev!;
    this.remove(lru);
    return lru;
  }
}


/***********************************************************************
 * STEP 3: LRU CACHE (Orchestrator)
 *
 * RESPONSIBILITY:
 * - Coordinate Map + DLL
 * - Ensure O(1) operations
 *
 * SPEAK:
 * "We use a HashMap for fast lookup and a doubly linked list
 *  to maintain access order efficiently."
 ***********************************************************************/
class LRUCache {
  private cache = new Map<number, ListNode>();
  private dll = new DoublyLinkedList();

  constructor(private readonly capacity: number) {}

  /**
   * GET operation
   *
   * SPEAK:
   * "If key exists, move it to front (MRU) and return value.
   *  Otherwise return -1."
   */
  get(key: number): number {
    if (!this.cache.has(key)) return -1;

    const node = this.cache.get(key)!;
    this.dll.moveToFront(node);

    return node.value;
  }

  /**
   * PUT operation
   *
   * SPEAK:
   * "If key exists, update value and move to front.
   *  If new key, insert and evict LRU if capacity exceeded."
   */
  put(key: number, value: number): void {
    // Edge case: capacity = 0
    if (this.capacity === 0) return;

    if (this.cache.has(key)) {
      const node = this.cache.get(key)!;
      node.value = value;
      this.dll.moveToFront(node);
      return;
    }

    const newNode = new ListNode(key, value);
    this.cache.set(key, newNode);
    this.dll.addToFront(newNode);

    // Evict LRU if capacity exceeded
    if (this.cache.size > this.capacity) {
      const lru = this.dll.removeLRU();
      if (lru) this.cache.delete(lru.key);
    }
  }
}


/***********************************************************************
 * STEP 4: DEMO / TEST CASES
 ***********************************************************************/

// Basic test
const cache = new LRUCache(2);

cache.put(1, 10);
cache.put(2, 20);

console.log(cache.get(1)); // 10

cache.put(3, 30); // evicts key 2

console.log(cache.get(2)); // -1
console.log(cache.get(3)); // 30


// Edge case: capacity = 1
const cache2 = new LRUCache(1);

cache2.put(1, 1);
cache2.put(2, 2); // evicts 1

console.log(cache2.get(1)); // -1
console.log(cache2.get(2)); // 2


// Edge case: capacity = 0
const cache3 = new LRUCache(0);

cache3.put(1, 1);
console.log(cache3.get(1)); // -1