# Task: Seed All Public Pages & Update Menu

## Goal
Prepare all public pages in `frontend/src/app/(public)` for database-driven rendering:
- Seed page records in the `pages` table
- Seed content strings for each page
- Seed page sections for dynamic rendering
- Ensure all pages are properly linked in the navigation menu

## Step-by-Step Plan
1. **List All Public Pages**: Identify every public route under `frontend/src/app/(public)`
2. **Check Existing Seeds**: Review existing migrations and seed files to avoid duplicates
3. **Create Seed SQL Files**: For each page missing DB content:
   - Seed page record with slug, titles, etc.
   - Seed content strings used by the page
   - Seed page sections for rendering the page
4. **Update Menu Seed**: Ensure all pages are available in navigation menus
5. **Test Seed Execution**: Verify all seeds run without errors

## List of Public Pages to Handle
- `/` (home) – already handled?
- `/about` – we started this
- `/board`
- `/contact`
- `/events` (and `/events/[slug]`, `/events/[slug]/register`)
- `/jobs` (and `/jobs/[slug]`)
- `/members` (and `/members/[slug]`)
- `/news` (and `/news/[slug]`)
- `/newsletter`
- `/president-message`
- `/publications`
- `/search`
- `/page/[slug]` (catch-all)
- `/sections`
