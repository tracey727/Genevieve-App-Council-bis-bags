# GENEVIEVE™ App PARKPOST™

Static PARKPOST™ dispenser and bin telemetry simulator.

## Repository status

This is a separate council bin/bag prototype. It is **not** the CLEAN-SAFE prototype and should not be merged into `Genevieve-Bins-v1.1`.

## What works

- cartridge selection logs
- quantity plus/minus logs
- dispense logs
- take event logs
- reset and clear-log actions
- cartridge refill logs
- colour option logs
- bin fill updates
- dispense count updates
- low-stock / spent / full-bin status states

## Cloudflare Pages

This is a static app with no npm/build dependency.

Use the nested folder `GENEVIEVE_PARKPOST_CLEAN_WORKING_FINAL` as the Cloudflare Pages root, or move its contents into a dedicated canonical PARKPOST repository before production use.

- Framework preset: none / static HTML
- Build command: leave blank
- Output directory: repository root for the selected project folder
- Keep `_redirects` for SPA fallback

## Trademark

GENEVIEVE™ App and PARKPOST™ are used as trademarks of the business owner.
