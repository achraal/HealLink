from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from typing import List
from models import CampagneSanitaire
import uuid
#from database import db

router = APIRouter()

# @router.post("/campagnes", response_model=CampagneSanitaire)
# async def create_campagne(campagne: CampagneSanitaire):
#     campagne_dict = campagne.dict()
#     result = await db.campagnes.insert_one(campagne_dict)
#     campagne_dict["id"] = str(result.inserted_id)
#     return campagne_dict
"""

@router.get("/campagnes", response_model=List[CampagneSanitaire])
async def get_campagnes():
    campagnes = []
    cursor = db.campagnes.find()
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        campagnes.append(doc)
    return campagnes

@router.get("/campagnes", response_model=List[CampagneSanitaire])
async def get_campagnes():
    campagnes = await db.campagnes.find().to_list(100)
    return campagnes
"""

clients = {}

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    client_id = str(uuid.uuid4())[:8]
    clients[client_id] = websocket

    # Send the ID back to the client
    await clients[client_id].send_json({"type": "welcome", "userID": client_id})
    
    print("Client connected")
    try:
        while True:
            data = await websocket.receive_text()
            print(f"📩 {client_id}: {data}")
            if(data in clients.keys()) : 
                print("AAAAAAAAAAAAAAAAAAAAAAAAA")
                await clients[data].send_json({
                    "type":"poke",
                    "data" : "hey"
                })
            #await websocket.send_text(f"Server echo: {data}")
    except WebSocketDisconnect:
        del clients[client_id]
        print(f"❌ {client_id} disconnected")
