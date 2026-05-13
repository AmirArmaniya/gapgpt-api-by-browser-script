# GapGPT Web → Local API (English)

[فارسی](./README.Fa.md) | [中文](./README.zh.md)

This repository runs a small local Node.js server plus a Tampermonkey browser script that converts the gapgpt web UI into a local HTTP API. It is a convenience/educational project adapted from upstream work (see credits).

## Quick highlights
- Free local API (uses your browser session)
- Works with web gapgpt (including gpt-4 if your account has access)
- Designed for local development and experimentation

![Demo](./demo.gif)

## Disclaimer (Read carefully)
- This project is provided for educational and demonstration purposes only.
- I (AmirArmaniya) take no responsibility for misuse, abuse, or legal consequences resulting from running this software.
- Use at your own risk. This is not legal advice.

## Important licensing note
1. This fork is based on others' public code. You must follow the original project's license. Do not relicense code you do not own.
2. I recommend the `MIT` license for permissive reuse. Confirm the upstream license before publishing. A recommended `LICENSE` (MIT template) is included in this repo — verify compatibility first.

## Contributions
- Contributions are not accepted for this fork. This repository is published for visibility/demonstration only.

## Quick start
1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm run start
# or
docker-compose up
```

3. Install Tampermonkey in your browser and paste `tampermonkey-script.js` as a new user script.
4. Open `https://chat.openai.com/` and sign in. When the script shows the success indicator, the local API will be available at:

```
http://localhost:8766/v1/chat/completions
```

## API parameters (short)
| Parameter | Description | Required |
|---|---:|:---|
| `messages` | OpenAI chat-format messages | Yes |
| `model` | Model selection on the webpage | No |
| `stream` | Stream response | No |

## Example request
```json
{
  "messages": [{"role":"user","content":"Hello"}]
}
```

## Upstream and credits
This project is adapted from `zsodur/gapgpt-api-by-browser-script`. Please review the original repository and its license before publishing.

- gapgpt provider: https://gapgpt.app
- Upstream: https://github.com/zsodur/chatgpt-api-by-browser-script
- Published by: https://github.com/AmirArmaniya

## License (recommended)
This repository includes a recommended `MIT` license file. Confirm the original project's license and ensure you have rights to publish derived work. If the upstream project uses a different license, follow that license.

---
If you want, I can add the official `LICENSE` file (MIT) and update the Persian README so both languages match. Tell me to proceed.

## Try it — quick smoke test
Try a minimal request locally once the browser script is connected.

Simple curl (no streaming):

```bash
curl -X POST http://localhost:8766/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Say hello"}]}'
```

Run with Docker (example):

```bash
docker build -t gapgpt .
docker run -p 8766:8766 gapgpt
```

Or use `docker-compose up` as documented earlier.

## FAQ
- Q: Can I publish this publicly? A: Only after you confirm the upstream license allows redistribution/derivative works. The upstream repo does not include an explicit LICENSE file; that requires caution.
- Q: Will I get into legal trouble? A: I am not a lawyer. This project has potential Terms-of-Service and copyright implications — publish at your own risk. See `SECURITY.md` and the license note.
- Q: Do you accept contributions? A: This fork is published for visibility only; contributions are disabled by design in the README. You can change that if you want.
- Q: How do I stop the service? A: Kill the Node process or stop the Docker container.
