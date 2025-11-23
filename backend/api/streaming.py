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
