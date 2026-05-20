[README.md](https://github.com/user-attachments/files/28064745/README.md)
# Study Timer — plain web Pomodoro

Simple study timer (Focus/Break) implemented as a plain HTML/CSS/JS app. Stores session history and stats in `localStorage`. Supports desktop notifications and a short beep sound.

Run locally:

1. Open `index.html` in a modern browser (Chrome/Firefox/Safari).
2. Or serve with a simple HTTP server:

```bash
# Python 3
python3 -m http.server 8000

# then open http://localhost:8000 in your browser
```

Notes:
- Notifications require granting permission in the browser.
- Data is stored only in your browser's `localStorage` under key `study-timer-data-v1`.
