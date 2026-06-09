# Stage 1: Priority Inbox Architectural Design Document

## 1. Core Priority Evaluation Logic
To accurately reflect the operational urgency of incoming system alerts, priorities are computed via an explicit multi-variable ordering framework:

1. **Category Weight:** Categorical sorting metrics are strictly defined by importance:
   Placement (Weight: 3) > Result (Weight: 2) > Event (Weight: 1)
2. **Chronological Recency:** For alerts sharing identical categorical weights, the tie-breaking condition calculates the exact Unix Epoch value derived from the object's Timestamp. Items with larger unix timestamps (more recent) take absolute precedence.

## 2. In-Memory Scaling Optimization
As alerts stream continuously into the application, processing the collection using standard array sort cycles creates an unsustainable execution bound.

### Selected Approach: Bounded Min-Heap
To achieve high-efficiency throughput, the ingestion engine uses an in-memory Fixed-Size Min-Heap strictly constrained to a size of n = 10.