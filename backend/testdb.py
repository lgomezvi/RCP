from backend.db import log_event, get_recent_events

log_event("test_backend", "command", "MOVE_JOINT 1 30")

events = get_recent_events()
for e in events:
    print(e.timestamp, e.source, e.event_type, e.payload)


# python testdb.py
# Expected output: 2025-02-18 02:34:01 test_backend command MOVE_JOINT 1 30
