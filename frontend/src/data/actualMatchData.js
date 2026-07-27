/**
 * actualMatchData.js — Re-exports from the authoritative actualMatchResults.js
 * =============================================================================
 *
 * This file is kept for backward compatibility with BracketPage.jsx which
 * imports `actualMatches` from here.  All real data now lives in:
 *   frontend/src/data/actualMatchResults.js
 *
 * DO NOT add match data here — edit actualMatchResults.js instead.
 */

export { actualMatchResults as actualMatches } from './actualMatchResults.js';

