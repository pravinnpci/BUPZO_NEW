const fs = require('fs');
const file = 'bupzo-backend/app/main.py';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix oi.price -> p.price
content = content.replace(
  "SELECT json_agg(json_build_object('id', oi.id, 'product_id', oi.product_id, 'quantity', oi.quantity, 'price', oi.price, 'name', p.name))",
  "SELECT json_agg(json_build_object('id', oi.id, 'product_id', oi.product_id, 'quantity', oi.quantity, 'price', p.price, 'name', p.name))"
);
content = content.replace(
  "SELECT json_agg(json_build_object('id', oi.id, 'product_id', oi.product_id, 'quantity', oi.quantity, 'price', oi.price, 'name', p.name))",
  "SELECT json_agg(json_build_object('id', oi.id, 'product_id', oi.product_id, 'quantity', oi.quantity, 'price', p.price, 'name', p.name))"
);

// 2. Add WebSocket Endpoint and imports
content = content.replace(
  "from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File, Request, Query\nfrom fastapi.responses import StreamingResponse",
  "from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File, Request, Query, WebSocket, WebSocketDisconnect\nfrom fastapi.responses import StreamingResponse"
);

const wsEndpoint = `
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Message text was: {data}")
    except WebSocketDisconnect:
        pass

@app.delete("/api/products/{product_id}")
`;
content = content.replace('@app.delete("/api/products/{product_id}")', wsEndpoint);

fs.writeFileSync(file, content);
console.log('Fixed main.py backend bugs');
