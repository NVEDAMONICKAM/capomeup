# CapoMeUp — project memory

Live at **https://capomeup.com**. A single-page tool for guitarists: paste or type a chord sheet (chords + lyrics), the chords are highlighted, and you can transpose them up/down by a semitone or tone and switch between sharps and flats, then copy the result.

## Core user flow

1. Type/paste a chord sheet into the left pane (a `<textarea>` over a highlight layer, placeholder "Enter Chords...").
2. As you type, chords are highlighted (pink `#EFD3D9`) and the right pane shows the same text, transposed by the current offset. There's no delay.
3. The round buttons in the middle (⇈ up tone, ↑ up semitone, ↓ down semitone, ⇊ down tone) change the transpose offset. The output updates and **stays transposed while you keep editing**.
4. The ♯/♭ toggle sets the spelling for every chord (default: sharps).
5. While the input has focus, the output line matching the input line you're on gets a subtle tint.
6. "COPY TO CLIPBOARD" copies the right pane as plain text.
7. Optional "Inline Chords" checkbox (bottom-left): only text between two bracket characters (default `[` `]`, editable, 1 char each) is treated as a chord, e.g. `[Am]Hello [G/B]world`.

## Tech stack

- Create React App (`react-scripts` 5.0.1), React 18, plain JavaScript (no TypeScript), plain CSS in one file.
- No router, no backend, no persistence. Fonts (IBM Plex Sans Medium) and SVG icons are bundled from `src/frontend/`.
- Tests: CRA Jest, table-driven unit tests in `src/backend/__tests__/` (detection, protected words, transposition, paste normalisation, line splitting). No component tests; UI is verified with ad-hoc Playwright scripts (see Testing).
- Deploy: `gh-pages` package → `gh-pages` branch → GitHub Pages with custom domain `capomeup.com`.

## Folder structure

```
public/index.html              HTML shell (meta, favicons)
public/CNAME                   capomeup.com (shipped in every build so deploys keep the custom domain)
public/favicons/               favicons + site.webmanifest
src/index.js                   React root (StrictMode)
src/App.js                     Single source of truth (text, inline settings, semitones, accidental, caret line); derives marked + output text
src/App.css                    ALL styling incl. responsive breakpoints (≤850px tablet/stacked, ≤484px phone, ≥1024px large, ≥851px hover animations)
src/backend/Keys.js            Note-name tables `oldKeys` (for reading) and `newKeys` (for writing)
src/backend/Words.js           PROTECTED_WORDS + protectedWordLength() + isWord() (H/R rule), shared by detection and transposition
src/backend/FindChords.js      Chord detection → wraps chords in ※ (U+203B) markers (synchronous)
src/backend/Transpose.js       transposeBy(text, semitones, accidental) and the older transpose(text, method, accidental)
src/backend/Normalise.js       normaliseText(): cleans pasted text (Notes NBSPs, U+2028, CRLF, zero-width chars)
src/backend/Lines.js           toLines(): marked text → lines of { text, chord } segments
src/frontend/InputBox.js       textarea + highlight layer, paste handler, caret-line reporting, Inline Chords controls
src/frontend/OutputBox.js      Output pane (rendered from props), transpose buttons, copy button
src/frontend/ColourChords.js   <ChordLines>: memoised one-block-per-line renderer used by BOTH panes
src/frontend/Toggle.js         ♯/♭ toggle button (keeps its own icon state, reports the value up)
src/reportWebVitals.js         CRA boilerplate, called with no callback (no-op)
```

## The marker convention

Detected chords are wrapped in the reference mark **`※` (U+203B)** on both sides, e.g. `※Am7※ ※G/B※`. The same character opens and closes. This marked string is the model:

- `findChords` produces it from raw text.
- `transposeBy` only edits characters between markers.
- `toLines` / `ChordLines` turn marked segments into pink spans and strip the markers.
- Copy strips all `※` before writing to the clipboard.

If the user's own text contains `※`, parsing goes wrong from that point. In source code, always write the marker as `'\u203B'`, never as the literal character (see Gotchas).

## Chord detection (`src/backend/FindChords.js`)

`findChords(text, method, open, close)` dispatches on `method`.

### `'pure'` (default)

Walks the string char by char:
1. If a **protected word** starts here (`protectedWordLength > 0`), it's copied verbatim and skipped.
2. Otherwise, if the char is a note letter (uppercase `A`–`G`) **and** `isWord` is false (next char isn't H/h/R/r), a chord starts.
3. The chord runs until the next **whitespace** character (`/\s/`: space, `\n`, tab, NBSP, `\r`, U+2028…) or end of text. Commas, `)` etc. are still swallowed into the token.
4. Detection can start mid-word (e.g. `McDonald` → `Mc※Donald※`).

Lowercase chords (`am`, `g`) are never detected. This is intentional.

### Protected words (`src/backend/Words.js`)

`PROTECTED_WORDS = ['endings','ending','end','coda','capo','fade','ad','bass','all','n.c.','n.c']`. They're matched case-insensitively as **whole words**: the previous char must not be a letter, and the char after the word must not be a letter. So `Ending`, `ENDING`, `Ending:`, `[Ending]`, `Ending 1` are protected, but `Endless` isn't. Longer entries must come before their prefixes. The same check runs inside `transposeChord`, because Inline mode marks whatever is inside brackets.

The older H/R rule (`isWord`) still protects `Chorus`, `Bridge`, `From`, etc. Labels starting with non-chord letters (Intro, Outro, Verse, Pre-Chorus, Tag, Interlude, Instrumental, Solo, Refrain, Hook, Riff) were never at risk. Single-letter lyric words (`A`, `Am I wrong`) are still read as chords: a known limitation.

### `'indent'` (Inline Chords checkbox)

Everything between `openChar` and the next `closeChar` gets markers (`[Verse]` is highlighted, but it contains no chord letters). `[]` with nothing inside is skipped. An unclosed bracket marks to the end of the text, so a marked span can cross a newline. Bracket chars are compared as single characters, and the inputs are `maxLength=1`.

## Transposition (`src/backend/Transpose.js`)

- `transposeBy(text, semitones, accidental)`: `semitones` is any integer, normalised mod 12. `0` re-spells using the chosen accidental. `accidental` is an index into `newKeys` rows: **`0` = flats, `1` = sharps**.
- `transpose(text, method, accidental)` is kept for tests and maps `uptone/upsemi/downsemi/downtone/switch` to +2/+1/−1/−2/0.
- For every char inside a `※…※` span: protected words are skipped. Otherwise, a note letter not followed by H/h/R/r is looked up via `oldKeys` (if followed by `b`/`#`/`♭`/`♯`, two chars are read). Then `diff` is added mod 12 and `newKeys[pc][accidental]` is written. Slash basses work because every letter in the token is transposed.
- `oldKeys` accepts `B#`, `E#`, `Fb`, `Cb`. Output only ever uses `C Db/C# D Eb/D# E F Gb/F# G Ab/G# A Bb/A# B`. Spelling is a global sharps/flats choice, not key-aware. This is intentional.
- Text with no markers, or an unclosed marker, is copied through unchanged.

## State and data flow (Stage 2)

```
App state:  text · inline {enabled, open, close} · semitones (0–11) · accidental · respell · caretLine
derived:    markedText = findChords(text, inline…)                      (useMemo)
            outputText = semitones === 0 && !respell ? markedText
                                                     : transposeBy(markedText, semitones, accidental)
InputBox:   <textarea value={text}> (transparent text, visible caret) laid over
            <div class="editor-highlight"><ChordLines markedText/></div>
            onChange → onTextChange · onPaste → normaliseText → execCommand('insertText')
            onSelect/onFocus → caret line → onCaretLineChange · onBlur → null
OutputBox:  <ChordLines markedText={outputText} currentLine={caretLine}/>; buttons → onTranspose(±1/±2)
```

Rules:
- Transpose clicks are ignored when there are no chords. Clearing the input resets `semitones` to 0.
- At 0 semitones the original spellings show, until the user picks sharps/flats (`respell` becomes true).
- Both panes render through `ChordLines`, one `<div class="chord-line">` per line (an empty line is `<br>`), so input line N is output line N.
- Each line is `React.memo`'d on a content signature, so a keystroke re-renders only the changed line(s).
- Measured on the production build in headless Chromium: 100 lines is one frame (~16 ms); 2000 lines is ~36 ms.
- The textarea and highlight layer must share every text-layout property (`.editor-highlight, #editable-text` rule in App.css). Font size is set on `.editor`, and both children inherit it. If you change font, padding, wrapping or letter-spacing on one, change it on both, or the coloured text drifts from the caret.
- Autocapitalise and autocorrect are off on the textarea, so iOS doesn't "correct" chords.
- App.js syncs left/right `scrollTop` with listeners attached once in a `useEffect`.

## Running, building, testing, deploying

```bash
npm ci                 # Node 24 works; lots of CRA audit noise is expected
npm start              # dev server on :3000 (BROWSER=none PORT=xxxx to customise)
npm run build          # must stay clean under CI=true (warnings = errors)
npx eslint src         # lint (CRA eslint config in package.json)
npm test               # CRA Jest, watch mode
npm run test:ci        # single run (use this in scripts/CI)
npm run deploy         # runs build, then pushes build/ to the gh-pages branch → LIVE
```

- **Pushing to `main` does NOT deploy.** Only `npm run deploy` does (manual, from a dev machine). There are no GitHub Actions, Vercel or Netlify, and no branch preview URLs.
- `public/CNAME` keeps the custom domain across deploys.
- To test on a phone: `npm start` and open the "On Your Network" URL on the same Wi-Fi.
- Line endings are mixed: most `src` files are CRLF; `App.js`, `index.js` and the test files are LF. Keep each file's existing endings so diffs stay small.

### Testing notes (this WSL machine)

- **Playwright Chromium:** the headless shell is cached in `~/.cache/ms-playwright` (chromium_headless_shell-1228). It needs `libgbm1` and `libwayland-server0`, which aren't installed system-wide. Extract them with `apt-get download` + `dpkg -x` into a temp dir and set `LD_LIBRARY_PATH`. Install the `playwright` npm package in a scratch dir, not in the project, and pass `executablePath`.
- **WebKit doesn't run here:** Playwright's WebKit build needs Ubuntu 24.04 libs and this machine is 22.04. So nothing has been verified in a Safari engine, and real iOS hardware remains untested.
- **Stopping background servers:** stop `npm start` / `http.server` by PID (`ps -eo pid,args | grep '[r]eact-scripts'`, then `kill <pid>`). `pkill -f <pattern>` also matches the shell running it and kills that shell first, leaving the server running. A leftover dev server keeps writing `node_modules/.cache/babel-loader`, which makes `npm ci` fail with `ENOTEMPTY`.
- **Undo in tests:** Playwright's `keyboard.type` gives one undo step per character.
- **Paste inspector:** a private claude.ai artifact at https://claude.ai/artifact/ECmwdr3caicazZvu8Wbwc3 captures exactly what Notes puts on the clipboard (types, escaped text/plain and text/html). Use a real capture from it to replace the constructed Notes fixture in `normalise.test.js`.

## Gotchas

- **Unicode escapes in generated code:** when an AI tool writes files, `\uXXXX` escapes may get turned into the literal characters. That's harmless for `※`, but invisible for NBSP and zero-width characters, and a **syntax error** for U+2028/U+2029 inside a regex literal. After writing code with escapes, scan `src` for non-ASCII characters outside comments.
- **jsdom:** CRA Jest has no layout, so alignment, caret and scroll can only be checked in a real browser.

## Known quirks / fragile areas

Fixed in Stage 1 (Oct 2026):
- transpose freeze on chord-free text
- input wiped when clicking away
- caret snapping back
- HTML-like text being parsed
- output collapsing spaces
- tiny text on large touch screens
- React warnings and the scroll listener leak
- keyboard/screen-reader access
- dead AI code
- missing CNAME
- stale metadata

Fixed in Stage 2:
- **Paste from Notes:** contentEditable turned pasted lines into `<div>`/`<br>`, which `textContent` dropped; NBSPs glued chords to words. Now there's a textarea plus `normaliseText`.
- **Enter:** it was intercepted and a bare `\n` inserted by hand. A trailing `\n` has no line box, so the caret couldn't sit after it (two presses needed). No input event fired, it wasn't in the undo history, and mobile IME Enter inserted `<div>`s that were merged away. Now the textarea handles it natively.
- **"Ending" and other labels** were being transposed.
- **Sync:** there was a 1 s debounce, Enter didn't update the output, and edits wiped the transposition. There's now a single source of truth and derived output.
- **Undo/redo** now works (native textarea; paste goes through `execCommand('insertText')`).

Still open:
- Untested on real iOS/iPadOS Safari: textarea padding quirks could misalign the highlight layer by a few px; also Notes paste with a real clipboard, autocorrect-off behaviour and Enter with predictive text.
- The Notes fixture is constructed, not captured. Replace it with a paste-inspector capture.
- Single-letter lyric words (`A`, `Am`) are still read as chords.
- A literal `※` in user text breaks parsing.
- Layout uses fixed positioning with magic-number transforms per breakpoint. `100vh` on iOS Safari includes the toolbar area.
- Scroll sync matches `scrollTop` only. Long wrapped lines can wrap differently in the two panes (different widths/padding; transposed chords change length).
- There's no on-screen indicator of the current transpose offset.
