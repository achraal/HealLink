
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



cagnottes_collection = database.get_collection("cagnottes")
dons_collection = database.get_collection("dons")

class Cagnotte(BaseModel):
    id: str = Field(default_factory=str, alias="_id")
    titre: str
    description: Optional[str] = None
    objectif: float
    collecte: float = 0.0
    date_debut: Optional[date] = None
    date_fin: Optional[date] = None
    est_active: bool = True

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Don(BaseModel):
    id: str = Field(default_factory=str, alias="_id")
    montant: float
    message: Optional[str] = None
    date_don: Optional[datetime] = None
    cagnotte_id: str

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

def cagnotte_helper(cagnotte) -> dict:
    return {
        "id": str(cagnotte["_id"]),
        "titre": cagnotte.get("titre"),
        "description": cagnotte.get("description"),
        "objectif": float(cagnotte.get("objectif", 0)),
        "collecte": float(cagnotte.get("collecte", 0)),
        "pourcentage": min(100, (float(cagnotte.get("collecte", 0)) / float(cagnotte.get("objectif", 1))) * 100),
        "date_debut": cagnotte.get("date_debut"),
        "date_fin": cagnotte.get("date_fin"),
        "est_active": cagnotte.get("est_active", True)
    }

def don_helper(don) -> dict:
    return {
        "id": str(don["_id"]),
        "montant": float(don.get("montant")),
        "message": don.get("message"),
        "date_don": don.get("date_don"),
        "cagnotte_id": str(don.get("cagnotte_id"))
    }

@app.get("/cagnottes")
async def get_cagnottes():
    cagnottes = []
    async for cagnotte in cagnottes_collection.find({"est_active": {"$ne": False}}):
        cagnottes.append(cagnotte_helper(cagnotte))
    return cagnottes

@app.post("/cagnottes")
async def create_cagnotte(cagnotte: Cagnotte):
    cagnotte_dict = cagnotte.dict(by_alias=True)
    result = await cagnottes_collection.insert_one(cagnotte_dict)
    new_cagnotte = await cagnottes_collection.find_one({"_id": result.inserted_id})
    return cagnotte_helper(new_cagnotte)

@app.post("/cagnottes/{cagnotte_id}/don")
async def faire_don(cagnotte_id: str, don: Don):
    # Vérifier que la cagnotte existe
    cagnotte = await cagnottes_collection.find_one({"_id": ObjectId(cagnotte_id)})
    if not cagnotte:
        raise HTTPException(status_code=404, detail="Cagnotte non trouvée")
    
    # Créer le don
    don_dict = don.dict(by_alias=True)
    don_dict["date_don"] = datetime.utcnow()
    result_don = await dons_collection.insert_one(don_dict)
    
    # Mettre à jour la cagnotte
    nouvelle_collecte = float(cagnotte.get("collecte", 0)) + don.montant
    await cagnottes_collection.update_one(
        {"_id": ObjectId(cagnotte_id)},
        {"$set": {"collecte": nouvelle_collecte}}
    )
    
    return {
        "message": "Don enregistré !",
        "don_id": str(result_don.inserted_id),
        "nouveau_collecte": nouvelle_collecte
    }

@app.get("/dons")
async def get_dons():
    dons = []
    async for don in dons_collection.find().sort("date_don", -1).limit(20):
        dons.append(don_helper(don))
    return dons
