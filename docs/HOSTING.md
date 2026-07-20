# Hosting the practice site

## GitHub Pages

This repository is designed to deploy directly from GitHub Actions.

### Initial configuration

1. Open the repository on GitHub.
2. Select **Settings**.
3. Select **Pages**.
4. Under **Build and deployment**, set **Source** to **GitHub Actions**.
5. Open **Actions** and run **Deploy GitHub Pages**, or push a change to `main`.

The expected address is:

`https://gkastner87.github.io/prince2-practitioner-practice/`

The first deployment can take several minutes. The workflow's deployment job will show the final URL.

## Local use

The application is fully static. Once `index.html` is present, open it directly in a modern browser. No local web server is required.

## Privacy and saved progress

Answers and progress are stored with browser `localStorage`. They remain on the device and browser profile used to access the site. There is no account system, analytics service, database, or remote answer storage in the current version.

Clearing browser site data, using private browsing, or changing devices will remove or isolate saved progress.

## Public repository considerations

This repository is public. Questions and embedded answer rationales are therefore visible to anyone, including through the page source. That is suitable for study mode but does not provide secure exam administration.

For private or controlled testing, use an authenticated static host, make the repository private, or distribute the local HTML file directly.
