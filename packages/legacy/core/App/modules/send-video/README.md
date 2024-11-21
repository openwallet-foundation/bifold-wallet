- You'll need to add VIDEO_VERIFIER_HOST=your.ip.or.hostname:3100 to .env for it to work

start services

open port 3100 and 8081 to the emulator to you local machine

➜ android git:(feat/send-video) ✗ /Users/x/Library/Android/sdk/platform-tools/adb reverse tcp:8081 tcp:8081
8081
➜ android git:(feat/send-video) ✗ /Users/x/Library/Android/sdk/platform-tools/adb reverse tcp:3100 tcp:3100

➜ android git:(feat/send-video) ✗ /Users/x/Library/Android/sdk/platform-tools/adb reverse tcp:8081 tcp:8081
8081
➜ android git:(feat/send-video) ✗ /Users/x/Library/Android/sdk/platform-tools/adb reverse tcp:3100 tcp:3100
3100
