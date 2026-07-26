# Runbook: Port the Decap CMS integration and custom theme to a forked site

## Context for the executing agent

This document was written against `keithbloom/zdb-productions-website` (branch
`master`) to be replayed against a **different** Hugo site that was originally
forked from this one, then had its theme altered independently. Because the
fork has diverged, **do not copy files blindly** — the two changes below must
be re-derived against the target repo's actual current content model and
theme, not assumed to match this repo's.

Read this whole document before making changes. It covers two independent
changes that can be applied in either order, but CMS-first is recommended
since it's lower-risk and doesn't touch the design:

1. **Decap CMS integration** — a git-backed admin UI at `/admin` with GitHub
   OAuth login, no custom backend.
2. **Theme replacement** — swapping a bundled/third-party Hugo theme for a
   bespoke set of root-level `layouts/` and a single hand-written stylesheet.

Both changes originated as real work on this repo; the commits are cited
below so you can inspect exact diffs with `git show <sha>` if anything here
is ambiguous, but **the target repo's structure is the source of truth**,
not this repo's.

---

## Before touching anything: inventory the target repo

Do this first, regardless of which change you apply:

- [ ] What does `config.toml`/`hugo.toml` currently declare as `theme = "..."`? Is it a git submodule under `themes/`, a Hugo Module, or vendored in-place?
- [ ] What content types exist under `content/`? List every section (e.g. `portfolio`, `about`, `contact`, `posts`) and read one front-matter example from each.
- [ ] What front-matter fields does each content type actually use? (Not what a generic theme *supports* — what this specific site's content files actually set.)
- [ ] Is the site deployed via Netlify, or something else (Vercel, Cloudflare Pages, GitHub Pages)? This changes how CMS auth and Hugo-version pinning work.
- [ ] What Hugo version does the target site build with today? Check the deploy config and/or run `hugo version` locally.
- [ ] Does `content/portfolio/*.md` (or equivalent) use an array-of-typed-objects pattern for embedded media (image/video/embed blocks), or is media just flat front-matter fields?

Everything downstream depends on these answers. Do not proceed on
assumptions carried over from this repo.

---

## Part 1 — Decap CMS integration

Source commits in this repo: `dff8344` (admin shell + GitHub login),
`a5e1d4b` (pin Hugo version in Netlify), `1fffc60` (required `media_folder`).
Also see `docs/adr/0001-git-based-cms-for-portfolio-editing.md` for the
reasoning — port that ADR's *reasoning*, not its literal text, into the
target repo's own `docs/adr/` if it keeps ADRs (see `docs/agents/domain.md`
in this repo for the convention).

### 1.1 Add the admin shell

Create `static/admin/index.html`:

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Content Manager</title>
  </head>
  <body>
    <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
  </body>
</html>
```

This file is identical across any Decap site — do not customize it.

### 1.2 Design `static/admin/config.yml` from the target site's actual content model

This is the part that must NOT be copied verbatim from this repo — the
collections have to mirror whatever content types you found in the
inventory step. Structural rules that do carry over:

- `backend.name: github`, `backend.repo: <owner>/<repo>`, `backend.branch:` set to the branch the site actually deploys from (check this — it may be `main` or `master`).
- `publish_mode: editorial_workflow` — routes every CMS edit through a draft branch + PR rather than committing straight to the deploy branch. Keep this unless the user says they want direct commits.
- `media_folder` and `public_folder` are **required by Decap's schema** even if no field references them yet — omitting them fails the whole admin page silently (this bit us: commit `1fffc60`). Point them at wherever the site's images already live, following the existing convention rather than inventing a new folder.
- One `collection` per repeating content type (e.g. `portfolio`), using `folder:` + `create: true`.
- One `files:`-style collection entry per singleton page (e.g. homepage, about, contact) if the site has hand-maintained pages outside the repeating collection — map each field in the CMS to the field that actually exists in that page's front matter today.
- Match `format:` (`toml-frontmatter`, `yaml`, etc.) to what the target site's content files actually use — check a real file, don't assume TOML.
- If the content type has a typed list of embedded media (image/video/embed blocks), model it as a `widget: "list"` field with `types:` (one type per block kind), using YAML anchors (`&block-commentary` / `*block-commentary`) to share repeated sub-fields like a commentary/description field across block types — see this repo's `static/admin/config.yml` `blocks` field for the pattern, but only if the target site actually has an equivalent blocks concept.
- Add a `local_backend: true` line plus the comment explaining it only activates when `decap-server` is running locally (see 1.4). This lets editors preview CMS edits without going through GitHub OAuth every time.

Do not add fields for concepts the target site's content doesn't have.
Under-scope this before over-scoping it — a minimal collection that loads is
better than a rich one that doesn't match reality.

### 1.3 Wire up GitHub OAuth (no custom backend needed)

If deploying on Netlify: Decap's `backend.name: github` works with
Netlify's *built-in* Git OAuth provider (a separate, still-supported
feature from the deprecated Netlify Identity product). Steps:

1. Register a GitHub OAuth App with callback URL `https://api.netlify.com/auth/done`.
2. Enter the OAuth App's Client ID/Secret in the Netlify site dashboard (Site configuration → General → Identity, or the equivalent "Git Gateway"/OAuth section — the exact menu location drifts between Netlify UI versions, so search the dashboard rather than trusting a hardcoded path).
3. Add editors as GitHub collaborators on the repo — Decap's access control is just "can you push to this repo," there's no separate user database.

If the target site is **not** on Netlify, this step differs materially
(Decap needs an OAuth proxy server for other hosts) — stop and ask the user
how the target site is deployed before implementing auth, rather than
assuming Netlify.

### 1.4 Local editing without GitHub auth (optional but recommended)

If the target site has a local dev setup (Docker Compose, or a plain `hugo
server`), add a `decap-server` proxy so `/admin` can edit the local working
tree directly instead of requiring a GitHub login on every local change.
This repo's `docker-compose.yml` pattern:

```yaml
  # Decap CMS local backend: lets /admin edit the local working tree
  # (no GitHub login) during development. See local_backend in
  # static/admin/config.yml.
  cms-proxy:
    image: node:20-alpine
    container_name: <name>_cms_proxy
    working_dir: /project
    volumes:
      - .:/project
    ports:
      - "8081:8081"
    environment:
      # fs mode edits files directly without git commits — hugo server
      # live-reloads the changes; you commit when you're happy.
      - MODE=fs
    command: npx -y decap-server
```

Adapt to whatever the target site's local dev tooling actually is — don't
introduce Docker Compose if the site doesn't already use it.

### 1.5 Pin the Hugo build version

If the deploy config doesn't already pin an exact Hugo version, add one —
build images periodically stop bundling a default Hugo binary or bundle a
newer one that breaks templates, and this is a common silent-failure point.
For Netlify:

```toml
[build.environment]
  HUGO_VERSION = "<version verified locally>"
  HUGO_EXTENDED = "true"
```

Use whatever version the target site already builds with locally, not this
repo's `0.164.0` — that number is meaningless outside this repo.

### 1.6 Verify

- [ ] `/admin` loads and shows the GitHub login (or local-backend) screen with no console errors.
- [ ] Each collection listed in the CMS sidebar corresponds to a real content type, and opening an existing entry shows its real current values (not blank fields) — this confirms field names in `config.yml` actually match the front matter.
- [ ] Editing a field and saving produces a sane git diff (or, in local-backend mode, a sane file change) — TOML/YAML formatting stays valid.

---

## Part 2 — Replace the theme with bespoke root-level layouts

Source commit in this repo: `8cb0a82` ("new theme"). See
`docs/adr/0002-custom-layouts-replace-theme.md` for the full reasoning —
port the *shape* of that decision record, not its content, into the target
repo if it keeps ADRs.

**Preconditions before you write a single line of CSS:**

### 2.1 Understand why you're replacing the theme, specifically for this site

Themes get replaced because they can't express something the content needs
— not on general principle. Before designing anything, identify what the
target site's *current* (already-altered) theme cannot do that the user
wants. In this repo's case that was: a showreel at the top, per-project
credits, tag filtering, a distinct About/Contact layout. The target site's
list will differ. Ask the user if it isn't obvious from prior conversation.

### 2.2 STOP — ask the user about visual aesthetic before designing anything

This is a hard requirement, not a suggestion: **do not write CSS, pick
colors, pick typography, or generate any visual mockup until the user has
answered this.** The user has explicitly said they want to approve the
aesthetic direction — this step is not satisfied by inferring a look from
the site's content or from this repo's own dark/cinematic palette.

Ask, at minimum:

- **Overall mood/tone** — e.g. dark & cinematic, light & minimal, bold & colorful, editorial/print-inspired, playful. (This repo chose dark, cinematic, video-first — that is *not* a default to reuse, it's an example of the kind of answer needed.)
- **Color direction** — a specific accent color or palette if they have one in mind, or brand colors to match; light mode, dark mode, or both.
- **Typography** — a preferred display/heading font and body font (or "surprise me within [constraint]"), and whether to pull from Google Fonts or a self-hosted/system stack.
- **Layout density/reference sites** — any existing sites/portfolios whose layout or spacing they want to emulate or avoid.
- **Imagery style** — full-bleed photography, cropped thumbnails, grid vs. list, whether video should autoplay/be prominent.

If a plan/task-tracking tool is available, treat this as a blocking step —
do not proceed to 2.3 until you have real answers, not placeholder ones.

### 2.3 Preserve this structural pattern (this is what "same structure" means)

Once the aesthetic is decided, rebuild the *architecture*, adapted to the
aesthetic answers and to the target site's real content types from the
inventory step:

- **Root-level `layouts/`, not `themes/<name>/layouts/`.** Delete the theme reference from `config.toml`/`hugo.toml` (or leave the old theme directory in place but unreferenced, to be deleted later — don't delete it destructively in the same change unless asked).
- `layouts/_default/baseof.html` — thin shell: `head` partial, `header` partial, a named `main` block, `footer` partial. Nothing else.
- `layouts/partials/head.html` — meta tags, title logic (`{{ if .IsHome }}` vs. inner pages), the single fingerprinted/minified CSS include (`resources.Get "css/main.css" | minify | fingerprint`), font loading, OpenGraph, analytics gated behind `hugo.IsProduction`.
- `layouts/partials/header.html` / `footer.html` — site nav driven from `site.Params.navlinks` (or whatever the target's existing config already defines — don't invent a new nav config shape), a CSS-only mobile nav toggle (checkbox + label, no JS dependency) if the aesthetic calls for a hamburger menu.
- `layouts/index.html`, `layouts/_default/list.html`, `layouts/_default/single.html`, and one directory-specific override per singleton section (e.g. `layouts/about/list.html`) as needed — match these to the target's actual sections, not this repo's `about`/`contact`/`portfolio` set.
- **One `assets/css/main.css`, no CSS framework.** Use CSS custom properties on `:root` for the design tokens (colors, fonts, spacing unit, radius) decided in 2.2, so the palette lives in one place. Do not pull in Bootstrap or any other framework the old theme used — that's the thing being removed.
- If the content model has typed embedded media (image/video/embed blocks), keep the dispatch pattern: `layouts/partials/blocks/<type>.html`, one file per block type, invoked from the single-page template via `{{ partial (printf "blocks/%s.html" .type) . }}`. Only port the block *types* the target site actually has.
- Hugo image processing via `resources.Get` + `.Fill`/`.Resize` (e.g. `"720x480 webp q85"`) for thumbnails/cover images, rather than serving raw uploaded images — keeps page weight down. Set explicit `width`/`height` attributes from the processed resource to avoid layout shift.
- Contact forms, if present, use Netlify's native form handling (`data-netlify="true"` + honeypot field) rather than a third-party form proxy — only if the target site deploys on Netlify; otherwise ask what form backend it actually has.

### 2.4 What NOT to carry over

- Don't reuse this repo's actual color values, font choices, or copy — those are specific answers to *this* site's 2.2 conversation, not defaults.
- Don't assume the same content sections (`about`, `contact`, `portfolio`) exist — build layouts only for sections the inventory step found.
- Don't assume the same optional front-matter fields (`year`, `role`, `client`, `tools`, `tags`) are wanted — these were additions specific to this site's portfolio-review outcome. Ask, or infer from what the target content already tracks.

### 2.5 Record the decision

If the target repo keeps ADRs (check for `docs/adr/`), add one documenting: what the old theme couldn't do, what replaced it, the Hugo version pin if it changed, and any content front-matter additions — following this repo's `docs/adr/0002-custom-layouts-replace-theme.md` as a structural example only.

### 2.6 Verify

- [ ] `hugo server` (or the target's local dev command) builds without template errors.
- [ ] Every content type from the inventory step renders correctly — spot-check one entry per section, not just the homepage.
- [ ] Responsive check: nav toggle, image scaling, and layout at mobile width.
- [ ] If Decap CMS was also ported (Part 1), reopen `/admin` and confirm the CMS fields still map correctly — a layout change can silently break `Featured item` / `relation` widgets or image-path assumptions if `media_folder`/`public_folder` conventions shifted.

---

## Order of operations

CMS integration (Part 1) and theme replacement (Part 2) are independent —
in this repo, CMS shipped first and the theme replacement came later,
several months afterward, as a separate piece of work. Recommend doing the
same here: land Part 1, confirm `/admin` works end to end, *then* start
Part 2's aesthetic conversation as its own piece of work. Don't bundle both
into one sitting or one PR — the aesthetic discussion in 2.2 deserves to not
be rushed alongside CMS plumbing.
