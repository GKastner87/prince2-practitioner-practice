# PRINCE2 7 Foundation Question Library — Staging

This directory is the unpublished source library for the future Foundation section.

It is intentionally **not connected to `index.html`**, the Practitioner exam engine, or GitHub Pages navigation. Work remains on the `agent/foundation-library-staging` branch until the questions have been normalized, rewritten where required, referenced, and approved.

## Import rule

The source export's `Result` field is ignored. It only records the dummy option selected while exposing the question and explanation.

For each imported item, the library will instead preserve or derive:

1. Source question number.
2. Question text and options, when redistribution is appropriate.
3. The answer indicated by the supplied explanation.
4. The supplied rationale and topic metadata.
5. A later PRINCE2-specific answer verified against the official guide.
6. Review and publication status.

A source item is not rejected merely because the export says `Correct` or `Incorrect`.

## Current batch

`foundation-incoming-001` contains the first user-supplied export.

Import outcome:

- Claimed count: 25
- Records found: 24
- Missing source number: 25
- Source result field: ignored
- Imported for review: 24
- Approved for publication: 0

The initial topic mappings are provisional. All items remain in the library while we determine whether each should become:

- a direct Foundation question,
- a PRINCE2-specific rewrite,
- supplementary general project-management material, or
- an archived source item that is not published.

## Publication gates

A question may move from `incoming_review` to `approved` only when it has:

1. Original wording suitable for this repository.
2. A clear PRINCE2 7 Foundation mapping.
3. One unambiguous correct answer.
4. A rationale explaining why the answer is correct.
5. Explanations for the distractors.
6. Official guide chapter, section, and page references.
7. Any external references clearly marked as supplementary.
8. Confirmed rights to publish the final wording.

## Statuses

- `incoming_review`: imported but not yet validated.
- `rewrite_required`: concept may be retained but needs PRINCE2-specific wording.
- `supplementary`: useful project-management knowledge but not a core Foundation item.
- `archived`: retained in source history but not planned for publication.
- `reference_review`: rewritten and awaiting source verification.
- `approved`: validated and eligible for a future Foundation exam.
- `published`: loaded by the live site.

## Important

The repository is public even when a branch is not deployed through GitHub Pages. This staging branch must not be merged until wording, references, and redistribution rights have been reviewed.