const axios = require('axios');
const { Log } = require('../logging_middleware/logger');

// Your verified active evaluation JWT access token
const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJzaW1yYW4uMjNiMDEwMTI1MUBhYmVzLmFjLmluIiwiZXhwIjoxNzgwOTkyMjAzLCJpYXQiOjE3ODA5OTEzMDMsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiI5M2NiMjNlYy03NmQ2LTQzZGMtODk4My0yNWZmOTM3OThiNDIiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJzaW1yYW4iLCJzdWIiOiIyN2UyNTZlYy1jMjA1LTRlOWEtYTAxOS03ZjQxYzBmNmY1ZTkifSwiZW1haWwiOiJzaW1yYW4uMjNiMDEwMTI1MUBhYmVzLmFjLmluIiwibmFtZSI6InNpbXJhbiIsInJvbGxObyI6IjIzMDAzMjAxMDAyNDkiLCJhY2Nlc3NDb2RlIjoiY1h1cWh0IiwiY2xpZW50SUQiOiIyN2UyNTZlYy1jMjA1LTRlOWEtYTAxOS03ZjQxYzBmNmY1ZTkiLCJjbGllbnRTZWNyZXQiOiJ1UFNwSlZlY1BxVlBxa1ZFIn0.0gAvGXNYw7l6nkVjRAUF-KjjjUuMFutUlO_8bACsNqc";

const API_URL = "http://4.224.186.213/evaluation-service/notifications";
const TOP_N = 10;

// Step 1: Explicit priority weight matrix definition
const TYPE_WEIGHTS = { 
    'Placement': 3, 
    'Result': 2, 
    'Event': 1 
};

/**
 * Custom Bounded Min-Heap Implementation
 * Constrained tightly to size N to maintain O(N) memory allocation footprint.
 * Evaluation ties are broken using exact chronological timestamps.
 */
class FixedMinHeap {
    constructor(capacity) {
        this.capacity = capacity;
        this.heap = [];
    }

    // Helper comparison mechanism prioritizing Weight, falling back to older timestamp (epoch value)
    compare(a, b) {
        if (a.weight !== b.weight) {
            return a.weight - b.weight; 
        }
        return a.epoch - b.epoch; 
    }

    push(item) {
        if (this.heap.length < this.capacity) {
            this.heap.push(item);
            this.bubbleUp(this.heap.length - 1);
            return true;
        } else if (this.compare(item, this.heap[0]) > 0) {
            this.heap[0] = item;
            this.sinkDown(0);
            return true;
        }
        return false;
    }

    bubbleUp(index) {
        while (index > 0) {
            let parentIndex = Math.floor((index - 1) / 2);
            if (this.compare(this.heap[index], this.heap[parentIndex]) >= 0) break;
            this.swap(index, parentIndex);
            index = parentIndex;
        }
    }

    sinkDown(index) {
        let left = 2 * index + 1;
        let right = 2 * index + 2;
        let smallest = index;
        const len = this.heap.length;

        if (left < len && this.compare(this.heap[left], this.heap[smallest]) < 0) smallest = left;
        if (right < len && this.compare(this.heap[right], this.heap[smallest]) < 0) smallest = right;

        if (smallest !== index) {
            this.swap(index, smallest);
            this.sinkDown(smallest);
        }
    }

    swap(i, j) {
        let temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
    }

    getSortedResults() {
        // Return structured list arranged in descending order (highest priority element first)
        return [...this.heap].sort((a, b) => this.compare(b, a));
    }
}

// Convert native timestamp configuration strings safely into Unix comparisons integers
function parseToEpoch(timestampStr) {
    return new Date(timestampStr.replace(' ', 'T')).getTime();
}

async function fetchAndProcessNotifications() {
    // Audit operational invocation utilizing required Logging Middleware package
    await Log("backend", "info", "service", "Initiating secure request to evaluation-service API route.", ACCESS_TOKEN);

    try {
        const response = await axios.get(API_URL, { 
            timeout: 8000,
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}` 
            }
        });
        
        const rawNotifications = response.data.notifications;
        await Log("backend", "info", "handler", `Successfully fetched ${rawNotifications.length} raw notification items.`, ACCESS_TOKEN);

        const heapManager = new FixedMinHeap(TOP_N);

        // Process elements through binary sorting tree structure 
        rawNotifications.forEach(item => {
            heapManager.push({
                id: item.ID,
                type: item.Type,
                message: item.Message,
                timestamp: item.Timestamp,
                weight: TYPE_WEIGHTS[item.Type] || 0,
                epoch: parseToEpoch(item.Timestamp)
            });
        });

        const priorityInbox = heapManager.getSortedResults();
        
        // Print the structured Priority Inbox array directly into terminal container
        console.log(`\n=================== PRIORITY INBOX (TOP ${TOP_N}) ===================`);
        priorityInbox.forEach((item, index) => {
            console.log(`${index + 1}. [${item.type.toUpperCase()}] - ${item.timestamp}`);
            console.log(`   Message: ${item.message}`);
            console.log(`   ID:      ${item.id}\n`);
        });
        console.log(`==================================================================\n`);

        await Log("backend", "info", "service", "Priority Inbox heap parsing routine executed successfully.", ACCESS_TOKEN);

    } catch (error) {
        // Intercept error and register it with the centralized platform logs endpoint
        await Log("backend", "error", "handler", `Execution failure inside computational logic: ${error.message}`, ACCESS_TOKEN);
    }
}

// Trigger processing sequence
fetchAndProcessNotifications();