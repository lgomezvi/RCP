from fastapi import FastAPI, APIRouter, WebSocket, WebSocketDisconnect # main class that creates web app 
from fastapi.responses import JSONResponse # to return JSON responses with custom status codes
import json
import os

from backend.db import get_recent_events, get_robot_state, log_event
# from backend.serial_interface import send_command

from typing import List, Dict
from backend.ai.instruction import action_to_instruction

import asyncio
from backend.serial_interface import open_arduino, execute, send_angle

#uvicorn is a lightweight ASGI server to run FastAPI apps, basically it hosts the app
app = FastAPI()
arduino = open_arduino()

# ChromaDB backend configuration
CHROMADB_BASE_URL = os.getenv("CHROMADB_BASE_URL", "http://localhost:5000")
SIMILARITY_THRESHOLD = 0.85

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

def query_chromadb(action: str, n_results: int = 1) -> Dict:
    """
    Query ChromaDB for similar actions.
    Returns the query results including cosine similarity.
    """
    try:
        response = requests.get(
            f"{CHROMADB_BASE_URL}/api/query/",
            params={"query": action, "n_results": n_results}
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error querying ChromaDB: {e}")
        return None

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await asyncio.sleep(60)  # Keeps the coroutine alive
    except WebSocketDisconnect:
        manager.disconnect(websocket)


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
async def command(cmd: Dict[str, List[str]]):
    try:
        import json
        instructions = []
        for action in cmd["actions"]: 
            instruction = None
            use_cache = False
            similarity = 0.0
            
            # Query ChromaDB for similar actions (vector db caching layer)
            chroma_result = query_chromadb(action)
            
            if chroma_result and chroma_result.get("results"):
                best_match = chroma_result["results"][0]
                similarity = best_match.get("cosine_similarity", 0.0)
                
                # Use cached result if similarity is above threshold
                if similarity >= SIMILARITY_THRESHOLD:
                    instruction_text = best_match.get("document_text")
                    use_cache = True
                    print(f"✓ Cache hit for '{action}' (similarity: {similarity:.3f})")
                    
                    # Parse the cached JSON string to dict
                    try:
                        instruction = json.loads(instruction_text)
                    except (json.JSONDecodeError, TypeError):
                        instruction = instruction_text
            
            # Generate new instruction using SLM if similarity is too low
            if instruction is None:
                print(f"⚡ Generating instruction for '{action}' (similarity: {similarity:.3f})")
                instruction_text = action_to_instruction(action)
                
                # Parse the SLM JSON string to dict
                try:
                    instruction = json.loads(instruction_text)
                except (json.JSONDecodeError, TypeError):
                    instruction = instruction_text
                    
                # TODO: Store the new instruction in ChromaDB for future use
            
            instructions.append(instruction)
            
            # Broadcast the instruction to connected WebSocket clients
            instruction_str = json.dumps(instruction) if isinstance(instruction, dict) else instruction
            await manager.broadcast(instruction_str)
            execute(arduino, instructions[-1])
            await manager.broadcast(instructions[-1])
            
        return {"instructions": instructions}
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)



# from backend.robot_controller import move_joint

# @app.post("/move")
# def move(joint: str, angle: int):
#     return move_joint(joint, angle)

