# Add Highlights Ingest Command

## Goal

Add a dedicated command that ingests curated highlights from `/home/kevin/Documents/chess/README.md`, resolves the matching PGNs and analysis markdown from `/home/kevin/Documents/chess/games` and `/home/kevin/Documents/chess/analysis`, and refreshes the repo-local highlight snapshot consumed by the site.

## Steps

- [ ] Add reusable README/table parsing helpers plus deterministic slug/title generation for curated highlights.
- [ ] Implement a highlights ingest script that reads the external chess workspace, resolves source PGNs/analysis files, updates `content/highlights/`, and rewrites the generated manifest.
- [ ] Wire a package command for the new ingest flow without breaking the existing site build pipeline.
- [ ] Add targeted tests for README parsing and update docs for the new command.
- [ ] Run the new ingest command and core verification checks, then record the final review.

## Review

- Pending.
