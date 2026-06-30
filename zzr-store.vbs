' ZZR Store Launcher
' 同时启动后端 (WSL) 和前端 (Vite)

Dim wsl, shell
Set wsl = CreateObject("WScript.Shell")

' 启动后端 (在 WSL 中)
wsl.Run "wsl -d Ubuntu -- cd ~/Projects/peripheral-store/backend && python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8001", 0, False

' 等待后端启动
WScript.Sleep 3000

' 启动前端 (在 WSL 中)
wsl.Run "wsl -d Ubuntu -- cd ~/Projects/peripheral-store && npx vite --host 0.0.0.0 --port 5173", 0, False

' 等待前端启动
WScript.Sleep 3000

' 打开浏览器
wsl.Run "msedge http://192.168.31.22:5173/zzr-store/", 1, False
