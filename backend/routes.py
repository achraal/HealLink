from fastapi import APIRouter, HTTPException
from typing import List
from models import CampagneSanitaire
from database import db

router = APIRouter()

# @router.post("/campagnes", response_model=CampagneSanitaire)
# async def create_campagne(campagne: CampagneSanitaire):
#     campagne_dict = campagne.dict()
#     result = await db.campagnes.insert_one(campagne_dict)
#     campagne_dict["id"] = str(result.inserted_id)
#     return campagne_dict
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
