/* SECTION
LRU Cache (Least Recently Used)

Concept:
An LRU Cache stores key-value pairs with a fixed capacity.
When the cache reaches its maximum capacity and a new item is added,
the least recently used item is removed first.

How this implementation works:
- Uses JavaScript's Map, which maintains insertion order.
- The most recently used item is kept at the end of the Map.
- The least recently used item is at the beginning of the Map.

Operations:
- get(key):
  • Returns the value if the key exists.
  • Marks the key as recently used by deleting and re-inserting it.
- put(key, value):
  • Updates the key if it exists.
  • If the cache is full, removes the least recently used key.
  • Inserts the new key-value pair as most recently used.

Time Complexity:
- get → O(1) average
- put → O(1) average

Space Complexity:
- O(capacity)
*/

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return -1;

    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);

    return value;
  }

  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size === this.capacity) {
      const lruKey = this.cache.keys().next().value;
      this.cache.delete(lruKey);
    }

    this.cache.set(key, value);
  }
}

const lru = new LRUCache(2);
lru.put(1, 1);
lru.put(2, 2);
console.log(lru.get(1)); // 1
lru.put(3, 3);          // evicts key 2
console.log(lru.get(2)); // -1
lru.put(4, 4);          // evicts key 1
console.log(lru.get(1)); // -1
console.log(lru.get(3)); // 3
console.log(lru.get(4)); // 4
