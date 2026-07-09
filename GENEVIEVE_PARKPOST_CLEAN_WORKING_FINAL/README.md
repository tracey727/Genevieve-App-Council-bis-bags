# GENEVIEVE™ App PARKPOST™

Clean static deployable PARKPOST™ dispenser and bin telemetry simulator.

## Correct file layout

Upload these files at the root of the repo/project:

```text
index.html
styles.css
app.js
manifest.webmanifest
vercel.json
netlify.toml
_redirects
README.md
assets/
```

Do not upload the parent folder as an extra nested folder. `index.html` must be at the top level.

## What works

- cartridge selection logs
- quantity plus/minus logs
- dispense logs
- take event logs
- reset works
- clear log works
- cartridge refill logs
- colour option logs
- bin fill updates
- dispense count updates
- low stock / spent / full-bin status states

## Vercel settings

- Framework Preset: Other
- Install Command: blank
- Build Command: blank
- Output Directory: blank or `.`
- Root Directory: `./`

## No build requirements

- no npm
- no package.json
- no package-lock.json
- no node_modules
- no dist

## Trademark

GENEVIEVE™ App and PARKPOST™ are used as trademarks of the business owner.
