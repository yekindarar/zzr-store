#!/bin/bash
cd /home/niko/Projects/peripheral-store/backend
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8001 &
sleep 2
cd /home/niko/Projects/peripheral-store
npx vite --host 0.0.0.0 --port 5173 --open 2>&1
