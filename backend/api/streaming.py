# NOTE: this file returns live websocket status to the frontend 
# for live changes on the UI for what happens during the closed 
# feedback loop, updates to the robot status and to the robot 3D model.


from fastapi import APIRouter, WebSocket
import asyncio

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    for i in range(100):
        await websocket.send_text(f"Streaming message {i}")
        await asyncio.sleep(0.1)
    await websocket.close()
