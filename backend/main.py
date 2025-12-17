
import uuid
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
from datetime import date

# Config MongoDB (ex: local ou Atlas)
MONGO_DETAILS = os.getenv("MONGO_DETAILS", "mongodb://localhost:27017")

app = FastAPI()

client = AsyncIOMotorClient(MONGO_DETAILS)
database = client.healLinkDB
campagnes_collection = database.get_collection("campagnes")


# Modèle Pydantic pour une campagne
class Campagne(BaseModel):
    id: str = Field(default_factory=str, alias="_id")
    nom: str
    centre: str
    latitude: float
    longitude: float
    stockVaccins: int
    categorie: Optional[str] = None
    dateDebut: Optional[date] = None
    dateFin: Optional[date] = None
    pochesDeSang: Optional[int] = None

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


# Convertir MongoDB document en dict Campagne
def campagne_helper(campagne) -> dict:
    return {
        "id": str(campagne["_id"]),
        "nom": campagne.get("nom"),
        "centre": campagne.get("centre"),
        "latitude": campagne.get("latitude"),
        "longitude": campagne.get("longitude"),
        "stockVaccins": campagne.get("stockVaccins"),
        "categorie": campagne.get("categorie"),
        "dateDebut": campagne.get("dateDebut"),
        "dateFin": campagne.get("dateFin"),
        "pochesDeSang": campagne.get("pochesDeSang"),
    }


# Récupérer toutes les campagnes
@app.get("/campagnes", response_model=List[Campagne])
async def get_campagnes():
    campagnes = []
    async for campagne in campagnes_collection.find():
        campagnes.append(campagne_helper(campagne))
    return campagnes


# Ajouter une nouvelle campagne
@app.post("/campagnes", response_model=Campagne)
async def create_campagne(campagne: Campagne):
    campagne_dict = campagne.dict(by_alias=True)
    result = await campagnes_collection.insert_one(campagne_dict)
    new_campagne = await campagnes_collection.find_one({"_id": result.inserted_id})
    return campagne_helper(new_campagne)

clients = {}

@app.websocket("/ws")
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
