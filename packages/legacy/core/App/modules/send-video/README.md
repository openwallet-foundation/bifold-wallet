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

### Apply Patches to enable Send Video

The first patch enables the Send Video demo in the app. The second patch adds the DRPC to the agent. One the second patch is applied, re-run `yarn install` to install the new dependencies.

```bash
git am packages/legacy/core/App/modules/send-video/0001-feat-enable-send-video-demo.patch
```

```bash
git am packages/legacy/core/App/modules/send-video/0002-feat-add-drpc-to-agent.patch
```
