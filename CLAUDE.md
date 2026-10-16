# CapoMeUp — project memory

Live at **https://capomeup.com**. A single-page tool for guitarists: paste or type a chord sheet (chords + lyrics), the chords are highlighted, and you can transpose them up/down by a semitone or tone and switch between sharps and flats, then copy the result.

## Core user flow

1. Type/paste a chord sheet into the left pane (a `contentEditable` div, placeholder "Enter Chords...").
2. About 1 second after you stop typing, the left pane re-renders with chords highlighted (pink `#EFD3D9`) and the right pane shows the same text.
3. Use the round buttons in the middle (⇈ up tone, ↑ up semitone, ↓ down semitone, ⇊ down tone) to transpose the **right pane only**.
4. The ♯/♭ toggle re-spells every chord with sharps or flats (default: sharps).
5. "COPY TO CLIPBOARD" copies the right pane as plain text.
6. Optional "Inline Chords" checkbox (bottom-left): only text between two bracket characters (default `[` `]`, editable) is treated as a chord, e.g. `[Am]Hello [G/B]world`.

## Tech stack

- Create React App (`react-scripts` 5.0.1), React 18, plain JavaScript (no TypeScript), plain CSS in one file.
- No router, no backend, no persistence. Fonts (IBM Plex Sans Medium) and SVG icons are bundled from `src/frontend/`.
- `@testing-library/*` is installed (CRA default) but **there are no tests**.
- Deploy: `gh-pages` package → `gh-pages` branch → GitHub Pages with custom domain `capomeup.com`.

## Folder structure

```
public/index.html              HTML shell (meta, favicons). Still mentions the removed AI feature in <meta description>.
public/favicons/               favicons + site.webmanifest (icon paths in the manifest are wrong: /android-chrome-*.png)
src/index.js                   React root (StrictMode)
src/App.js                     Layout: left half (logo + InputBox), right half (OutputBox). Holds `modifiedText` state.
src/App.css                    ALL styling incl. responsive breakpoints (≤850px tablet/stacked, ≤484px phone, ≥1024px large, ≥851px hover animations)
src/backend/Keys.js            Note-name tables `oldKeys` (for reading) and `newKeys` (for writing)
src/backend/FindChords.js      Chord detection → wraps chords in ※ (U+203B) markers
src/backend/Transpose.js       Transposes text between ※ markers
src/frontend/InputBox.js       contentEditable input, Enter handling, debounce, re-styling, caret restore, Inline Chords controls
src/frontend/OutputBox.js      Output pane, transpose buttons, copy button, holds its own copy of the text
src/frontend/ColourChords.js   Turns ※-marked text into highlighted spans (HTML string for input, React elements for output)
src/frontend/Toggle.js         ♯/♭ toggle button
src/frontend/InputButtons.js   DEAD CODE — not imported anywhere
src/reportWebVitals.js         CRA boilerplate, called with no callback (no-op)
```

## The marker convention (central to everything)

Detected chords are wrapped in the reference mark **`※` (U+203B)** on both sides, e.g. `※Am7※ ※G/B※`. The same character is used for open and close. This marked string is the "model" passed between components:

- `findChords` produces it from raw text.
- `transpose` only edits characters between markers.
- `colourChords*` turns marked segments into pink spans and strips the markers.
- Copy strips all `※` before writing to the clipboard.

If the user's own text contains `※`, everything after it is misparsed.

## Chord detection (`src/backend/FindChords.js`)

`findChords(text, method, open, close)` (declared `async` for no reason) dispatches on `method`:

### `'pure'` (default)

Walks the string char by char:
1. If the char is a note letter (`isKey`: any **single character** equal to the first character of an entry in `oldKeys`, so in effect uppercase `A`–`G` only) **and** `isWord(text, i)` is false → start a chord.
2. The chord runs until the next ASCII space `' '` or `'\n'` (or end of text). **Only those two characters end a chord.** Tabs, non-breaking spaces (U+00A0), `\r`, commas, `)` etc. are swallowed into the chord token.
3. Detection happens at **any** position, not just word starts (e.g. `McDonald` → `Mc※Donald※`).

`isWord(text, i)` is the only protection against lyrics being detected as chords. It returns true when **the next character is `H`, `h`, `R` or `r`**. So `Chorus`, `Bridge`, `Bring`, `From`, `Christ`, `Grace` are protected, but `A`, `Am`, `Em`, `Every`, `BEACH`, `Ending`, `Dad` are **not**. There is no protected-word list and no regex: just this one-character lookahead. (`isWord` is copy-pasted in `Transpose.js`.)

Lowercase chords (`am`, `g`) are never detected.

### `'indent'` (Inline Chords checkbox)

Everything between `openChar` and the next `closeChar` gets markers, whatever it is (`[Verse]` → highlighted, letters inside get transposed). `[]` with nothing inside is skipped; `[ ]` (one space) gets markers. An unclosed bracket marks to end of text. Bracket chars are compared as **single characters**, so a multi-char or empty bracket input silently matches nothing.

## Transposition (`src/backend/Transpose.js`)

`transpose(text, method, accidental)`:
- `method`: `uptone` (+2), `upsemi` (+1), `downsemi` (+11, i.e. −1 mod 12), `downtone` (+10), `switch` (+1 then −1, which re-spells with the new accidental).
- `accidental`: index into `newKeys` rows: **`0` = flats, `1` = sharps**.
- Algorithm: finds each `※…※` span. For **every** character inside that is a note letter and not followed by H/h/R/r, it looks up the pitch class (if the next char is `b` or `#` it reads two chars and deletes the accidental) via `oldKeys`, adds `diff` mod 12, and writes `newKeys[pc][accidental]`. So slash basses (`D/F#`) work because every letter in the token is transposed, but so does junk (`N.C.` → `N.C#.`, `BEACH` → `CFA#CH`, `Ending:` → `Fnding:`).
- `oldKeys` accepts `B#`, `E#`, `Fb`, `Cb`. `newKeys` only ever outputs `C Db/C# D Eb/D# E F Gb/F# G Ab/G# A Bb/A# B`. Spelling is global (all sharps or all flats), not key-aware.
- Unicode `♯`/`♭` are **not** understood (`C♯` +1 → `C#♯`).
- Loop control uses a `trigger`/`index` trick. **If the text contains no markers at all, the outer loop never ends → the tab freezes.** This happens when you press any transpose button or the ♯/♭ toggle with non-empty text that has no detected chords.

## Input ↔ output data flow

```
contentEditable onInput
  → InputBox.sendText()
      getContent(): reads div.textContent (NOT innerText; <div>/<br> line breaks are lost), records caret char offset → cursorPosition
      findChords(text) → setOutputText(markedText)        // InputBox's "outputText" = marked text
  → useEffect([outputText]) debounced 1000 ms:
      styleInput(): colourChordsInput(markedText) → HTML string (NOT escaped)
                    setContent(): clears div, inserts HTML at the current window selection
                                  (or innerHTML if `inButton` flag set by checkbox/bracket changes)
                    setCursor(cursorPosition): walks childNodes to the offset, splits a node, places caret
      onSubmit(markedText) → App.setModifiedText
  → OutputBox receives `output` prop → useEffect copies it into its own `outputText` state
      transpose buttons operate on OutputBox.outputText only
      colourChordsOutput(outputText) → React spans
```

Consequences:
- The right pane lags typing by about 1 s.
- Transpositions live only in OutputBox state. **Any edit to the input resets the output to the untransposed text.** Clicks during the 1 s debounce are lost.
- Enter is intercepted (`keyCode === 13`): `preventDefault` and a manual `'\n'` text node is inserted. No `input` event fires, so the output doesn't update until the next keystroke. At the end of a line the caret ends up *before* the inserted `\n`, so typed text lands on the same line. On mobile IME (keyCode 229) the browser default runs instead and inserts `<div>`/`<br>`, which `textContent` drops.
- Paste is not handled: rich HTML (e.g. from iOS Notes: `<div>` per line, `&nbsp;`) is inserted as-is. After the 1 s restyle the line breaks are gone and NBSPs stop chord tokens from ending.
- Every restyle rewrites the DOM, which kills native undo/redo and resets selection.
- App.js attaches scroll-sync listeners during render (leaks a pair each render).

## Running, building, testing, deploying

```bash
npm ci                 # Node 24 works; lots of CRA audit noise is expected
npm start              # dev server on :3000 (BROWSER=none PORT=xxxx to customise)
npm run build          # passes "with warnings"; FAILS if CI=true (warnings treated as errors)
npx eslint src         # lint (CRA eslint config in package.json)
npm test               # CRA Jest. Currently "No tests found"
npm run deploy         # runs build, then pushes build/ to the gh-pages branch → LIVE
```

- **Pushing to `main` does NOT deploy.** Only `npm run deploy` does (manual, from a dev machine). No GitHub Actions, Vercel or Netlify.
- `public/` has **no `CNAME` file**, so each `npm run deploy` wipes the custom-domain CNAME from `gh-pages`. Git history shows it being re-created by hand in the GitHub UI after every deploy ("Create CNAME" commits).
- As of 2026-10-16 the live bundle hash (`main.c024f090.js`) matches a fresh build of `main` @ 6da62e5.
- Browser testing in this WSL env: the Playwright chromium headless shell is in `~/.cache/ms-playwright`, but it needs `libgbm1` + `libwayland-server0`, which aren't installed system-wide. You can extract them with `apt-get download` + `dpkg -x` into a temp dir and set `LD_LIBRARY_PATH`.

## Known quirks / fragile areas

- `transpose` infinite loop on chord-free text (see above). Most severe bug.
- Clicking anywhere outside the input during the 1 s debounce makes `setContent` insert into the wrong place / wipe the input, and `setCursor` throws (`textNodes[nodeIndex]` undefined), so the output never updates.
- Moving the caret (arrows/click) during the debounce: it snaps back to the last typing position.
- Text containing `<tag>`-like sequences is parsed as HTML by the restyle (text lost; `setCursor` then throws).
- Output pane uses `white-space: pre-line` on non-chord text, so runs of spaces collapse and chord-over-lyric alignment is lost visually (clipboard copy is fine).
- `.output` is `position:absolute`; transpose buttons/toggle/copy are positioned with fixed + magic-number transforms per breakpoint.
- At ≥1024px input/output font-size is `1vw` (≈10–11px on iPad landscape/small laptops; iOS may zoom on focus).
- JSX uses `class`/`for` (React warns), duplicate React keys in `colourChordsOutput`, transpose buttons are `div`s (no keyboard/screen-reader access), logo `img` has no `alt`.
- Dead code/CSS left over from the removed AI feature (`aiButton`, loading animation, `.ai-*`, `.lds-default`, `.group-2`, `ArrowRight` import) and `InputButtons.js`.
- `inButton` flag can get stuck true if toggling Inline Chords doesn't change the output, so the next restyle drops the caret to the start.
- Stage 2 (planned): iPhone/iPad Notes paste, protecting "Ending", Enter key, full input/output sync. Root-cause notes for these live in the Stage 1 audit.
