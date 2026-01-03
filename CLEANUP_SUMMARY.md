# Repository Cleanup Summary

**Date**: January 2, 2026
**Purpose**: Security hardening, file size reduction, and complete Tokyo→Singapore migration

---

## ✅ Completed Tasks

### 1. Security - Environment Variables Migration

**Created**:
- `.env` - Contains actual API keys and secrets (GITIGNORED)
- `.env.example` - Template for developers (committed to repo)
- `src/env-config.js` - Environment configuration loader
- `scripts/process-html.js` - HTML template processor for build time

**Updated**:
- `src/configs.js` - Now uses getters to load from envConfig instead of hardcoded values
- `public/index.html` - Uses placeholders (`__MAPBOX_ACCESS_TOKEN__`, etc.) replaced at build time

**Environment Variables**:
```
MAPBOX_ACCESS_TOKEN     - Mapbox GL JS access token
LTA_ACCOUNT_KEY         - LTA DataMall API key
GOOGLE_ANALYTICS_ID     - Google Analytics tracking ID
PROXY_URL               - Backend proxy server URL
SHARE_URL               - Deployment/share URL
LAST_STATIC_UPDATE      - Static data update timestamp
```

**⚠️ SECURITY WARNING**:
The following API keys were exposed in source code and should be rotated:
- **LTA DataMall Key**: `+Z3IvSNwTlmKVY92BS4/nQ==`
- **Mapbox Token**: `pk.eyJ1IjoiZ2VsZWRlayIsImEiOiJjbWp2Z2kxeGs1YXowM2RvdDAwZzA5eDdmIn0.cvxqYNPcROKg8kqsH7nNrQ`

**Action Required**: Generate new keys from:
- LTA DataMall: https://datamall.lta.gov.sg/content/datamall/en/request-for-api.html
- Mapbox: https://account.mapbox.com/access-tokens/

---

### 2. .gitignore Enhancements

Added comprehensive exclusions:
- **Environment files**: `.env`, `.env.local`, `.env.*.local`, `secrets/`, `*-secrets.js`, `*-keys.json`
- **Large raw data**: `gtfs-data/Static_*`, `*.zip`
- **Source maps**: `*.map` (can be regenerated)
- **IDE files**: `.vscode/`, `.idea/`, `*.swp`, etc.
- **OS files**: `.DS_Store`, `Thumbs.db`, `Desktop.ini`
- **Logs**: `*.log`, `npm-debug.log*`, etc.
- **Testing**: `coverage/`, `.nyc_output/`

---

### 3. File Cleanup - Space Savings

**Deleted Files**:
| File | Size | Reason |
|------|------|--------|
| `Static_ 2025_05.zip` | 609 MB | Duplicate (extracted version kept in gtfs-data/) |
| `stats.html` | 533 KB | Build artifact (now gitignored) |
| `dist/*.map` | ~11 MB | Source maps (regenerated on build) |
| `build/*.map` | ~11 MB | Source maps (regenerated on build) |
| `build/mini-tokyo-3d.esm.js` | 6.0 MB | Old Tokyo naming |

**Total Space Saved**: ~638 MB

**Files Now Excluded from Git**:
- `gtfs-data/Static_*` (~612 MB raw data)
- All `*.map` files (regenerated on build)

---

### 4. Tokyo → Singapore Renaming

**Files Renamed**:
- `src/css/mini-tokyo-3d.css` → `src/css/mini-singapore-3d.css`

**Code Updates**:
- `src/index.js` - Updated CSS import
- `src/index.esm.js` - Updated CSS import
- `src/map.js:3614` - Changed CSS class from `mini-tokyo-3d` to `mini-singapore-3d`
- `package.json` - Updated entry points:
  - `main`: `dist/mini-singapore-3d.js`
  - `module`: `dist/mini-singapore-3d.esm.js`
  - `style`: `dist/mini-singapore-3d.css`
- `rollup.config.mjs` - Updated banner and loader name

**Build Outputs Now Named**:
- `dist/mini-singapore-3d.js` (5.9 MB)
- `dist/mini-singapore-3d.min.js` (3.9 MB)
- `dist/mini-singapore-3d.esm.js` (6.0 MB)
- `dist/mini-singapore-3d.css` (115 KB)
- `dist/mini-singapore-3d.min.css` (103 KB)
- `dist/mini-singapore-3d-worker.js` (388 KB)

---

### 5. Build Process Updates

**New Dependencies**:
- `dotenv` (dev dependency) - Environment variable management

**Build Scripts**:
- Existing `npm run build` - Builds JS/CSS with rollup
- New: `node scripts/process-html.js` - Processes HTML templates with env vars

**Build Workflow**:
1. `npm run build` - Compiles source to dist/
2. `node scripts/process-html.js` - Processes HTML with environment variables
3. Copy dist files to build/ directory
4. Deploy build/ directory

---

## 📊 Repository State

**Before Cleanup**:
- Raw data: 1.2 GB (zip + extracted duplicate)
- Build artifacts: ~27 MB
- Exposed API keys in source code
- Mixed Tokyo/Singapore naming

**After Cleanup**:
- Raw data: 612 MB (extracted only, now gitignored)
- Build artifacts: Clean, properly named
- API keys in environment variables
- Consistent Singapore naming

**Git Repository Impact**:
- Cleaner commit history going forward
- ~640 MB less data to track (if .gitignore applied before commit)
- No sensitive credentials in source

---

## 🔒 Security Checklist

- [x] Move API keys to `.env` file
- [x] Add `.env` to `.gitignore`
- [x] Create `.env.example` for developers
- [x] Update source code to use environment variables
- [ ] **TODO**: Rotate exposed API keys (LTA DataMall, Mapbox)
- [ ] **TODO**: Update `.env` with new keys
- [ ] **TODO**: Test application with new keys

---

## 🚀 Next Steps

1. **Immediate**: Generate new API keys and update `.env`
2. **Before deploying**: Test with new environment configuration
3. **Optional**: Set up deployment pipeline to inject env vars
4. **Optional**: Add Malay and Tamil dictionary files (currently only EN, ZH)

---

## 📝 Notes for Developers

### Setting Up Environment

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your API keys in `.env`:
   ```
   MAPBOX_ACCESS_TOKEN=your_actual_token_here
   LTA_ACCOUNT_KEY=your_actual_key_here
   ```

3. **NEVER commit `.env` file** - It's gitignored for security

### Building

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Process HTML with environment variables
node scripts/process-html.js

# Copy files to build directory
cp dist/*.js dist/*.css build/
```

### Deployment

The `build/` directory contains:
- `index.html` (processed with env vars)
- `mini-singapore-3d.min.js` (minified app)
- `mini-singapore-3d.min.css` (minified styles)
- `mini-singapore-3d-worker.js` (web worker)
- `data/` directory (from `npm run build-data`)

Deploy the `build/` directory to your web server.

---

**Generated**: 2026-01-02
**Version**: 0.1.0-alpha.1
