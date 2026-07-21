# PRINCE2 Project Management Study Library

A browser-based study environment for PRINCE2® Project Management Foundation and Practitioner Version 7.

## Live site

**https://gkastner87.github.io/prince2-practitioner-practice/**

The root page is a study-level selector:

- **Foundation:** `foundation/index.html`
- **Practitioner:** `practitioner/index.html`
- **Practitioner attempt history:** `history.html`
- **Reference library:** `references.html`

## Foundation library

- 160+ unique hard Foundation practice questions
- Five supplied practice sets
- Concise topic filters
- Answer reveal and supplied explanations
- Question-specific and general study notes
- Visual note formatting with Markdown stored underneath
- Notes export as a `.md` file
- Browser-local progress and notes

## Practitioner library

- Two original 70-mark Practitioner-style examinations
- Study mode with answer reveal after each question
- 150-minute timed exam mode
- Detailed answer rationales and scenario clues
- Option-by-option explanations
- Official-guide location references
- Browser-local progress and attempt history

## Interface

- Responsive desktop, iPad and mobile layouts
- Shared light and dark modes
- Theme preference retained in local storage
- Keyboard focus states and touch-sized controls

## Run locally

1. Download or clone the repository.
2. Open `index.html` in Edge, Chrome, Firefox or Safari.
3. Choose Foundation or Practitioner from the landing page.

No server, database or sign-in is required. Progress, attempt history, theme and notes are stored in the browser's local storage.

Some Foundation question-bank files use the browser `DecompressionStream` API. A current browser version is recommended.

## GitHub Pages deployment

GitHub Pages is configured to deploy from the `main` branch and repository root. A separate Pages deployment workflow is not required.

The validation workflow at `.github/workflows/validate-site.yml` checks JavaScript syntax, required pages, Foundation data integrity and Practitioner data integrity.

## Content and exam integrity

The Practitioner examinations are independently written practice material. Supplied Foundation questions are retained as study-library content and are not represented as live PeopleCert examination questions.

Candidates should verify PRINCE2-specific terminology, role assignments and page references against legitimately obtained current official guidance.

See [docs/DISCLAIMER.md](docs/DISCLAIMER.md).

## Repository structure

```text
.
├── index.html                  # Study-level landing page
├── practitioner/index.html     # Practitioner application
├── foundation/index.html       # Foundation library
├── history.html                # Practitioner attempt history
├── references.html             # Reference library
├── assets/                     # Shared application, layout and theme assets
├── data/                       # Practitioner question data
├── foundation/data/            # Foundation question data
├── tools/                      # Validation and reference utilities
└── .github/workflows/          # Repository validation
```

## Trademark notice

PRINCE2® is a registered trademark of PeopleCert. This independent study project is not affiliated with, approved by or endorsed by PeopleCert.
