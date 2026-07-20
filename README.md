# PRINCE2 7 Practitioner Practice

A browser-based practice environment for PRINCE2® 7 Practitioner study. It contains two original full-length scenario exams with study and timed modes.

## Practice site

After GitHub Pages is enabled for this repository, the site will be available at:

**https://gkastner87.github.io/prince2-practitioner-practice/**

## Included material

- Two original 70-mark Practitioner-style examinations
- Study mode with answer reveal after each question
- 150-minute timed exam mode
- Detailed answer rationales and scenario clues
- Option-by-option explanations
- References to relevant sections of the official PRINCE2 7 guidance
- Browser-local progress saving
- Printable candidate and answer-guide downloads

## Run locally

1. Download or clone the repository.
2. Open `index.html` in Edge, Chrome, Firefox, or Safari.
3. Select an exam and choose either **Study / reveal answer** or **Timed exam**.

No server, database, sign-in, or internet connection is required after the files are downloaded. Progress is stored in the browser's local storage.

## Downloads

- [Candidate pack — PDF](downloads/PRINCE2-7-Practitioner-Candidate-Pack.pdf)
- [Candidate pack — Word](downloads/PRINCE2-7-Practitioner-Candidate-Pack.docx)
- [Enhanced answer guide — PDF](downloads/PRINCE2-7-Practitioner-Enhanced-Answer-Guide.pdf)
- [Enhanced answer guide — Word](downloads/PRINCE2-7-Practitioner-Enhanced-Answer-Guide.docx)

## GitHub Pages deployment

The repository includes a GitHub Actions workflow at `.github/workflows/deploy-pages.yml`.

For the initial setup:

1. Open **Settings → Pages** in GitHub.
2. Under **Build and deployment**, select **GitHub Actions** as the source.
3. Push to `main`, or manually run the **Deploy GitHub Pages** workflow.

See [docs/HOSTING.md](docs/HOSTING.md) for more detail.

## Content and exam integrity

All questions in this repository are independently written practice material. They are not copied from, represented as, or intended to reconstruct live PeopleCert examination questions.

The official PRINCE2 book is not included in this repository. Candidates should use legitimately obtained official guidance and training material.

See [docs/DISCLAIMER.md](docs/DISCLAIMER.md).

## Repository structure

```text
.
├── index.html
├── downloads/
├── docs/
└── .github/workflows/deploy-pages.yml
```

## Trademark notice

PRINCE2® is a registered trademark of PeopleCert. This independent study project is not affiliated with, approved by, or endorsed by PeopleCert.
