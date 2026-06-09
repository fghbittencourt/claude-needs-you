import streamDeck, {
  action,
  SingletonAction,
  WillAppearEvent,
  KeyDownEvent,
  KeyAction,
} from "@elgato/streamdeck";
import http from "node:http";
import { execFile } from "node:child_process";

let blinkTimer: NodeJS.Timeout | null = null;
let current: KeyAction | null = null;

@action({ UUID: "com.fghbittencourt.claude-needs-you.alert" })
class ClaudeAlert extends SingletonAction {
  override onWillAppear(ev: WillAppearEvent) {
    if (ev.action.isKey()) {
      current = ev.action;
      ev.action.setState(0);
    }
  }
  override onKeyDown(_ev: KeyDownEvent) {
    streamDeck.logger.info("onKeyDown fired — stopping blink and focusing VSCode");
    stopBlink();
    execFile("open", ["-a", "Visual Studio Code"], (err) => {
      if (err) streamDeck.logger.error(`open -a failed: ${err.message}`);
      else streamDeck.logger.info("open -a Visual Studio Code OK");
    });
  }
}

function startBlink() {
  if (blinkTimer || !current) return;
  let on = false;
  blinkTimer = setInterval(() => {
    on = !on;
    current?.setState(on ? 1 : 0);
  }, 500);
}
function stopBlink() {
  if (blinkTimer) {
    clearInterval(blinkTimer);
    blinkTimer = null;
  }
  // reenvia state 0 três vezes para sobrescrever qualquer pacote em voo (latência WiFi)
  for (const delay of [50, 150, 300]) {
    setTimeout(() => current?.setState(0), delay);
  }
}

http
  .createServer((req, res) => {
    if (req.url === "/blink") startBlink();
    if (req.url === "/clear") stopBlink();
    res.statusCode = 200;
    res.end("ok");
  })
  .listen(37999, "127.0.0.1");

streamDeck.actions.registerAction(new ClaudeAlert());
streamDeck.connect();
