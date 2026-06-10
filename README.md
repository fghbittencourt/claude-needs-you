# Claude Needs You — Stream Deck Plugin

> **macOS only.** The hook relies on `osascript` to detect the active window, which is not available on other platforms.

Stream Deck plugin that blinks a button when Claude Code needs your input, and focuses VS Code when you click it.

## How it works

- A Claude Code `Stop` hook fires `curl POST localhost:37999/blink` whenever Claude finishes a response and is waiting for input — but only if VS Code is **not** in focus
- The plugin runs an HTTP server on `127.0.0.1:37999` inside the Stream Deck process
- `/blink` → button alternates between idle (purple) and alert (amber) every 500ms
- `/clear` → stops blinking and returns to idle state
- Clicking the button → stops blinking + focuses VS Code via `open -a "Visual Studio Code"`

## Requirements

- macOS
- [Stream Deck app](https://www.elgato.com/downloads) 7.1+
- Stream Deck hardware or Stream Deck Mobile
- Node.js 24+
- [Claude Code CLI](https://claude.ai/code)
- VS Code

## Setup

### 1. Install dependencies and build

```bash
make install
make build
```

### 2. Link the plugin to Stream Deck

```bash
make link
```

### 3. Configure Claude Code hooks

Add to your project's `.claude/settings.local.json`:

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "frontapp=$(osascript -e 'tell application \"System Events\" to get name of first application process whose frontmost is true'); [ \"$frontapp\" = \"Code\" ] || /usr/bin/curl -s -X POST localhost:37999/blink || true"
          }
        ]
      }
    ]
  }
}
```

> **Tip:** add this to `~/.claude/settings.json` instead to apply it to all your projects at once.

### 4. Add the action to your Stream Deck profile

Open the Stream Deck app, find **Claude Needs You** in the plugin list, and drag the action to a button.

## Development

```bash
make watch    # build + auto-restart on file changes
make restart  # restart the plugin in Stream Deck
make logs     # tail the plugin logs
make blink    # manually trigger blink (for testing)
make clear    # manually stop blink
```

## Plugin UUID

`com.fghbittencourt.claude-needs-you`

## Known limitations

- The `Stop` hook does not fire while Claude is waiting for an `AskUserQuestion` response (mid-turn tool call). See [open issue](https://github.com/anthropics/claude-code/issues).
- Requires the Stream Deck plugin to be running (Stream Deck app open) for the HTTP server to be available.
- If you have multiple VS Code windows open, clicking the button brings the app to the front but macOS decides which window to show (usually the last one in focus). There is no way to target a specific window with this approach.

## Contributing

PRs welcome. Keep changes focused — this plugin is intentionally minimal.

## License

[MIT](LICENSE)
