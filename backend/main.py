from fastapi import FastAPI # main class that creates web app 
from fastapi.responses import JSONResponse # to return JSON responses with custom status codes

from backend.db import get_recent_events, get_robot_state, log_event

#uvicorn is a lightweight ASGI server to run FastAPI apps, basically it hosts the app
app = FastAPI()

@app.get("/")
def root():
    return {"status": "running", "message": "RCP Backend Active"}

# ===========================
#  EVENTS LOG ENDPOINT
# ===========================
@app.get("/events")
def events(limit: int = 50):
    # this is calling the db helper it queries the robots_event table (check in db how that works )
    events = get_recent_events(limit)
    return events # note that returns a JSON for now but later will need to change ut to a specific format (a response model) perhaps use Pydantic??

# ===========================
#  ROBOT STATUS ENDPOINT
# ===========================
@app.get("/status")
def status():
    state = get_robot_state()
    if state is None:
        return JSONResponse(content={"error": "No state available yet"}, status_code=404)
    return state


# to test uvicorn backend.main:app --reload
# then open these you should be seeing the JSON responses:

# http://127.0.0.1:8000
# http://127.0.0.1:8000/events
# http://127.0.0.1:8000/status


# ===========================
#  SEND COMMAND TO ROBOT
# ===========================
@app.post("/command")

# here is the flow for how this is working  FastAPI → ros_publish_command → ROS topic /robot/commands → bridge node → Arduino.

def command(cmd: str): # you pass a string which will be the command to send to the robot
    # Log the outgoing command
    log_event("backend", "command", cmd) # uses method in db.py to log the command being sent

    # Publish to ROS (later we connect this) -- for now just a placeholder
    try:
        # willl later have to look into this into great detail 
        from backend.ros_interface import ros_publish_command 
        ros_publish_command(cmd)
    except Exception as e:
        return {"status": "failed", "error": str(e)}

    return {"status": "sent", "command": cmd}


from backend.ros_interface import run_ros_in_background

@app.on_event("startup")
def startup_event():
    print("Starting ROS node in background...")
    run_ros_in_background()
    print("ROS node started.")