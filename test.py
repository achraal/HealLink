import json
import uuid
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

# ========================= CONFIG =========================

USE_DUMMY_DB = True   # 🔁 Set to False to use MongoDB


app = FastAPI()

# ========================= DATABASE =========================


# -------- Dummy DB (in-memory) --------
dummy_campagnes = {}
dummy_cagnottes = {}
dummy_dons = {}

def generate_id():
    return str(uuid.uuid4())

# ========================= SEEDER =========================

def seed_dummy_data():
    for i in range(5):
        id = generate_id()
        dummy_campagnes[id] = {
            "id": id,
            "nom": f"Vaccination Campagne {i+1}",
            "centre": f"Centre de Santé {i+1}",
            "latitude": 33.5 + i * 0.01,
            "longitude": -7.6 + i * 0.01,
            "stockVaccins": 100 + i * 50,
            "categorie": "Vaccination",
            "dateDebut": date.today(),
            "dateFin": date.today(),
            "pochesDeSang": None
        }

    for i in range(3):
        id = generate_id()
        print(id)
        objectif = 1000 * (i+1)
        collecte = 250 * (i+1)
        dummy_cagnottes[id] = {
            "id": id,
            "titre": f"Aide Médicale {i+1}",
            "description": "Collecte pour soins médicaux",
            "objectif": objectif,
            "collecte": collecte,
            "date_debut": date.today(),
            "date_fin": date.today(),
            "est_active": True,
            "pourcentage": (collecte / objectif) * 100
        }

    print("✅ Dummy database seeded")

@app.on_event("startup")
async def startup_event():
    if USE_DUMMY_DB:
        seed_dummy_data()

# ========================= MODELS =========================

class Campagne(BaseModel):
    nom: str
    centre: str
    latitude: float
    longitude: float
    stockVaccins: int
    categorie: Optional[str] = None
    dateDebut: Optional[date] = None
    dateFin: Optional[date] = None
    pochesDeSang: Optional[int] = None

class Cagnotte(BaseModel):
    titre: str
    description: Optional[str] = None
    objectif: float
    collecte: float = 0
    date_debut: Optional[date] = None
    date_fin: Optional[date] = None
    est_active: bool = True

class Don(BaseModel):
    montant: float
    message: Optional[str] = None
    cagnotte_id: str

# ========================= CAMPAGNES =========================

@app.get("/campagnes")
async def get_campagnes():
    if USE_DUMMY_DB:
        return list(dummy_campagnes.values())

    return []
@app.get("/campagnes/{campagne_id}")
async def get_campagne(campagne_id: str):
    if USE_DUMMY_DB:
        return dummy_campagnes.get(campagne_id)

    return None


@app.post("/campagnes")
async def create_campagne(campagne: Campagne):
    data = campagne.dict()
    data["id"] = generate_id()

    if USE_DUMMY_DB:
        dummy_campagnes[data["id"]] = data
        return data

# ========================= CAGNOTTES =========================

@app.get("/cagnottes")
async def get_cagnottes():
    if USE_DUMMY_DB:
        return list(dummy_cagnottes.values())

@app.post("/cagnottes")
async def create_cagnotte(cagnotte: Cagnotte):
    data = cagnotte.dict()
    data["id"] = generate_id()
    data["collecte"] = 0

    if USE_DUMMY_DB:
        dummy_cagnottes[data["id"]] = data
        return data

# ========================= DONS =========================

@app.post("/cagnottes/{cagnotte_id}/don")
async def faire_don(cagnotte_id: str, don: Don):
    if USE_DUMMY_DB:
        if cagnotte_id not in dummy_cagnottes:
            raise HTTPException(404, "Cagnotte not found")

        dummy_cagnottes[cagnotte_id]["collecte"] += don.montant

        don_id = generate_id()
        dummy_dons[don_id] = {
            "id": don_id,
            "montant": don.montant,
            "message": don.message,
            "date_don": datetime.utcnow(),
            "cagnotte_id": cagnotte_id
        }

        return {
            "message": "Don enregistré",
            "don_id": don_id,
            "nouvelle_collecte": dummy_cagnottes[cagnotte_id]["collecte"]
        }
@app.get("/cagnottes/{cagnotte_id}")
async def get_cagnotte(cagnotte_id: str):
    if USE_DUMMY_DB:
        return dummy_cagnottes.get(cagnotte_id)

    return None


@app.get("/dons")
async def get_dons():
    if USE_DUMMY_DB:
        return list(dummy_dons.values())[::-1][:20]

# ========================= WEBSOCKET =========================

clients = {}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    client_id = str(uuid.uuid4())[:8]
    clients[client_id] = websocket

    await websocket.send_json({"type": "welcome", "userID": client_id})

    try:
        while True:
            data = await websocket.receive_text()
            data_dict = json.loads(data)

            if data_dict.get("target") in clients:
                await clients[data_dict["target"]].send_json({
                    "type": "poke",
                    "data": data_dict["email"]
                })
    except WebSocketDisconnect:
        del clients[client_id]

# ========================= RUN =========================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
