import uuid
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import os
import json

# Config MongoDB (ex: local ou Atlas)
MONGO_DETAILS = os.getenv("MONGO_DETAILS", "mongodb://localhost:27017")

app = FastAPI()





# Récupérer toutes les campagnes


clients = {}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    client_id = str(uuid.uuid4())[:8]
    clients[client_id] = websocket

    # Send the ID back to the client
    await clients[client_id].send_json({"type": "welcome", "userID": client_id})
    await clients[client_id].send_json({
                    "type":"poke",
                    "data" : "testmail@mail.mail"
                })
    
    print("Client connected")
    try:
        while True:
            data = await websocket.receive_text()
            data_dict = json.loads(data)
            print(f"📩 {client_id}: {data}")
            if(data_dict['target'] in clients.keys()) : 
                print("AAAAAAAAAAAAAAAAAAAAAAAAA")
                await clients[data_dict['target']].send_json({
                    "type":"poke",
                    "data" : data_dict['email']
                })
            #await websocket.send_text(f"Server echo: {data}")
    except WebSocketDisconnect:
        del clients[client_id]
        print(f"❌ {client_id} disconnected")




if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)