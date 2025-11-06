from pydantic import BaseModel
from typing import Optional

class CampagneSanitaire(BaseModel):
    id: Optional[str]
    type: str  # ex: "vaccination", "dépistage", "don de sang"
    centre: str
    localisation: dict  # {"lat": float, "lng": float}
    stock: int  # ex: nombre vaccins ou poches sanguines disponibles
    date_debut: str
    date_fin: str
