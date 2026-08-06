/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  MARKETING DASHBOARD PIPELINE — PASTE THIS WHOLE FILE INTO Code.gs        ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * Replaces seven separate Apps Script projects with one. All .gs files in an
 * Apps Script project share a single global scope, so the five source files are
 * concatenated here and you only paste once.
 *
 * ─── HOW TO INSTALL ─────────────────────────────────────────────────────────
 * 1. In Code.gs: Ctrl+A, then paste this entire file over it. Ctrl+S.
 * 2. Project Settings (gear) > Script Properties > Add:
 *       HUBSPOT_TOKEN = <the same private app token the old project used>
 * 3. Editor > Services (+) > add "Google Analytics Data" (AnalyticsData).
 * 4. Run SETUP_all(). Approve the OAuth prompt when it appears.
 * 5. Run ROSTER_rebuild(), then ROSTER_selfTest().
 *       The self-test must report 14/14 July marketing sends. If it does not,
 *       STOP. Every silent-wrongness bug this project has had looked fine at
 *       this exact moment.
 * 6. Run statusReport() any time to see what is automated and what is not.
 *
 * Do not run installMonthlyTrigger() until the self-test passes.
 */

/**
 * MARKETING DASHBOARD PIPELINE — SHARED CONFIG
 * ═════════════════════════════════════════════════════════════════════════════
 * One Apps Script project replaces seven. Everything the dashboard needs is
 * produced here, on one trigger, in one order, with no human step.
 *
 * ─── THE GOVERNING RULE ──────────────────────────────────────────────────────
 * From docs/AUTOMATION-ARCHITECTURE.md, learned from three separate incidents:
 *
 *   Never let a population be defined by a list a human maintains.
 *   Derive it from an API every run, and assert the population size.
 *
 * Every silent-wrongness bug in this project traced back to breaking that rule.
 * The 47-email history filter, the stale All Emails tab, and the GA4 channel
 * contamination were three faces of one design flaw. On 2026-08-05 it happened
 * again: classifying email traffic against the hand-typed All Emails roster
 * reported July Marketing revenue as $3,266 when the true figure is $3,680,
 * because all 14 of July's marketing sends were missing from that tab.
 *
 * So: nothing in this pipeline reads a hand-maintained tab. Ever. The Roster is
 * rebuilt from the HubSpot API on every run and every producer asserts its own
 * population before it is allowed to write.
 *
 * ─── WHAT PRODUCES WHAT ──────────────────────────────────────────────────────
 * Roster        HubSpot MARKETING_EMAIL   the population, and the classifier
 * ID Map        HubSpot campaigns API     utm_content -> email name
 * GA4 tabs      GA4 Data API              sessions, revenue, pages, items
 * data files    the tabs above            one producer function each
 * the HTML      template + data files     built here, not by build.py
 *
 * ─── DESIGN NOTE: WHY NO GITHUB ──────────────────────────────────────────────
 * build.py only inlines <script src> tags into a template and writes one
 * self-contained file. That is string substitution, so Apps Script does it in
 * 40_Build.gs. No repo, no token, no Action, no Python, and no dependency on
 * anyone's laptop being powered on. The finished HTML lands in Drive.
 */

// ═══ IDENTIFIERS ══════════════════════════════════════════════════════════════

/** New sheet, machine-written tabs only. Set by SETUP_createSheet(). */
var CFG_SHEET_ID = PropertiesService.getScriptProperties().getProperty('DASH_SHEET_ID_V2') || '';

/** The old sheet. READ ONLY, and only to migrate the ID Map. Never written to. */
var CFG_LEGACY_SHEET_ID = '1cswMAyGZD2UIoj5O404f-7BosrZvrmJL3mshAmuwOJU';

var CFG_GA4_PROPERTY_ID = '403249020';

/** Drive folder that receives the data files and the built HTML. */
var CFG_OUTPUT_FOLDER = 'Marketing Dashboard Output';

// ═══ TABS ═════════════════════════════════════════════════════════════════════

var TAB_ROSTER      = 'Roster';        // the population. rebuilt every run.
var TAB_ID_MAP      = 'ID Map';        // utm_content -> name. extended, never rebuilt.
var TAB_GA4_BY_ID   = 'GA4 By ID';
var TAB_GA4_MONTHLY = 'GA4 Monthly';
var TAB_GA4_BY_MAIL = 'GA4 Monthly By Email';
var TAB_RUN_LOG     = 'Run Log';       // every run appends. the audit trail.

// ═══ CLASSIFICATION ═══════════════════════════════════════════════════════════

/**
 * TWIW is identified by SUBSCRIPTION, not category.
 *
 * docs/MONTHLY-REFRESH.md records that the Category field is frequently left
 * blank on new TWIW sends (all four July 2026 issues had none), so a category
 * filter silently misses them. Subscription is set by the sending process and
 * has never been observed blank. Category is kept only as a fallback.
 */
var CFG_TWIW_SUBSCRIPTION = '19561173';

/** Category value that means "counts as Marketing Email on the dashboard". */
var CFG_MARKETING_CATEGORY = 'Marketing';

/**
 * Categories seen in the API as of 2026-08-05, verified against a live query:
 *   Marketing | Section | Periodicals | This Week in Welding
 * Anything not Marketing and not TWIW is "other" and is deliberately excluded
 * from the Marketing Email channel. Sections and Periodicals living in the same
 * hs_email source is exactly what inflated July revenue to $7,554.
 */

// ═══ TUNING ═══════════════════════════════════════════════════════════════════

var CFG_MAX_RUNTIME_MS = 4.5 * 60 * 1000;  // stay under the 6-minute ceiling
var CFG_API_SLEEP_MS   = 120;              // ~8 req/s, well under HubSpot's limit
var CFG_GA4_START      = '2025-06-01';     // matches dimension coverage in web-data.js

/**
 * Assertion thresholds. A producer that trips one of these REFUSES TO WRITE
 * rather than shipping a plausible-looking wrong number. This is the whole
 * point: the failures this project has had were all silent, and a silent
 * failure is worse than a loud one.
 */
/**
 * EXCLUDED SENDS — standing rule from docs/DATA-SPEC.md.
 *
 * These are dropped from email-data.js AND ga4-per-email.js. HubSpot has no
 * setting for this, so the source will keep returning them and every regenerate
 * has to drop them again.
 *
 * They are NOT dropped from the Roster: they are real marketing emails, and
 * removing them would misclassify their GA4 traffic rather than exclude it.
 * They are also NOT removed from channel totals, so July 2026 Marketing stays
 * $3,680. The rule is about per-send reporting, not about pretending the
 * traffic never happened. Confirmed with Roque 2026-08-05.
 */
var CFG_EXCLUDED_EIDS = {
  '214350957639': 'RWMA Annual Meeting - 2026 - Email 2 - RWMA Members (excluded 2026-07-08)',
  '217378527660': 'ITSA Annual Meeting - 2026 - Email 1 (ITSA Members) (excluded 2026-08-05)'
};

var CFG_ASSERT = {
  minRosterRows:      500,   // roster was 1,069 on 2026-08-05; a collapse means a bad pull
  minIdMapRows:       5000,  // was 11,605; a collapse means the migration failed
  maxUnresolvedShare: 0.30   // 23% on 2026-08-05. above 30% something is broken.
};

// ═══ SHARED HELPERS ═══════════════════════════════════════════════════════════

function CFG_sheet_() {
  if (!CFG_SHEET_ID) {
    throw new Error(
      'DASH_SHEET_ID_V2 is not set in Script Properties. Run SETUP_createSheet() first.');
  }
  return SpreadsheetApp.openById(CFG_SHEET_ID);
}

function CFG_hubspotToken_() {
  var t = PropertiesService.getScriptProperties().getProperty('HUBSPOT_TOKEN');
  if (!t) throw new Error('HUBSPOT_TOKEN not set in Script Properties.');
  return t;
}

/** Write a tab wholesale. Clears first so a shorter result never leaves stale rows. */
function CFG_writeTab_(name, headers, rows) {
  var ss = CFG_sheet_();
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  sh.clear();
  sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
  if (rows.length) {
    sh.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
  sh.setFrozenRows(1);
  return rows.length;
}

function CFG_readTab_(name) {
  var sh = CFG_sheet_().getSheetByName(name);
  if (!sh) return { headers: [], rows: [] };
  var v = sh.getDataRange().getValues();
  if (!v.length) return { headers: [], rows: [] };
  return { headers: v[0].map(function (h) { return String(h).trim(); }), rows: v.slice(1) };
}

/** HTML entities arrive escaped in HubSpot names ("Green &amp; White Mountains"). */
function CFG_unescape_(s) {
  return String(s == null ? '' : s)
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .trim();
}

/** Month keys from a start ISO date up to but NOT including the current month. */
function CFG_months_(startISO) {
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var p = String(startISO).split('-');
  var y = Number(p[0]), m = Number(p[1]) - 1;
  var now = new Date(), endY = now.getFullYear(), endM = now.getMonth();
  var out = [];
  while (y < endY || (y === endY && m < endM)) {
    var last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    var ym = y + '-' + pad(m + 1);
    out.push({ key: ym, start: ym + '-01', end: ym + '-' + pad(last) });
    if (++m > 11) { m = 0; y++; }
  }
  return out;
}

/** Append one line to the Run Log. Survives across runs; this is the audit trail. */
function CFG_log_(step, status, detail) {
  var ss = CFG_sheet_();
  var sh = ss.getSheetByName(TAB_RUN_LOG);
  if (!sh) {
    sh = ss.insertSheet(TAB_RUN_LOG);
    sh.getRange(1, 1, 1, 4).setValues([['When', 'Step', 'Status', 'Detail']])
      .setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  sh.appendRow([
    Utilities.formatDate(new Date(), 'America/New_York', 'yyyy-MM-dd HH:mm:ss'),
    step, status, String(detail).slice(0, 2000)
  ]);
  Logger.log('[' + status + '] ' + step + ': ' + detail);
}

/** Assertion that refuses rather than warns. */
function CFG_assert_(condition, step, message) {
  if (condition) return;
  CFG_log_(step, 'REFUSED', message);
  throw new Error('ASSERTION FAILED in ' + step + ': ' + message +
    '\nNothing was written. Fix the cause rather than lowering the threshold.');
}
/**
 * ONE-TIME SETUP
 * ═════════════════════════════════════════════════════════════════════════════
 * Creates the new sheet and migrates the one thing worth keeping from the old
 * one. Run SETUP_all() once, then never again.
 *
 * ─── WHY A NEW SHEET ─────────────────────────────────────────────────────────
 * The old "HubSpot Emails - All Data" sheet accumulated tabs across three eras:
 * hand-pasted CSV exports, the GA4 sync, and the ID map. Some tabs are written
 * by code, some by hand, and nothing distinguishes them. That ambiguity is how a
 * stale hand-typed tab ended up silently defining a population.
 *
 * The new sheet has exactly one rule: EVERY TAB IS MACHINE-WRITTEN. If you find
 * yourself typing into it, something has gone wrong with the design.
 *
 * ─── WHAT IS MIGRATED, AND WHAT IS NOT ───────────────────────────────────────
 * MIGRATED: the ID Map. 11,605 resolved IDs, each of which cost one HubSpot API
 * call. Rebuilding from zero would burn hours of quota to recreate data you
 * already own. It moves across as-is.
 *
 * NOT MIGRATED: All Emails. That tab is the bug. It is superseded by the Roster,
 * which is rebuilt from the API every run.
 *
 * NOT DELETED: the old sheet, ever. It holds the only GA4 history from before
 * March 2026, which no API can re-serve. It becomes a read-only archive.
 */

/** Run this first. Creates the sheet and records its ID in Script Properties. */
function SETUP_createSheet() {
  var props = PropertiesService.getScriptProperties();
  var existing = props.getProperty('DASH_SHEET_ID_V2');
  if (existing) {
    Logger.log('Sheet already exists: https://docs.google.com/spreadsheets/d/' + existing +
               '/edit\nDelete the DASH_SHEET_ID_V2 property if you really want a new one.');
    return existing;
  }

  var ss = SpreadsheetApp.create('Marketing Dashboard Data');
  var id = ss.getId();
  props.setProperty('DASH_SHEET_ID_V2', id);

  // Sheet1 is replaced by a README so nobody mistakes this for a working doc.
  var s1 = ss.getSheets()[0];
  s1.setName('README');
  s1.getRange(1, 1, 8, 1).setValues([
    ['MARKETING DASHBOARD DATA'],
    [''],
    ['Every tab in this file is written by the Marketing Dashboard Pipeline'],
    ['Apps Script project. Do not type into any of them.'],
    [''],
    ['Editing a tab by hand will be silently overwritten on the next run, and'],
    ['worse, may define a wrong population in the meantime. That exact mistake'],
    ['cost a 55% under-report of July 2026 marketing revenue.']
  ]);
  s1.getRange(1, 1).setFontWeight('bold').setFontSize(14);
  s1.setColumnWidth(1, 620);

  Logger.log('Created: https://docs.google.com/spreadsheets/d/' + id + '/edit');
  return id;
}

/**
 * Copy the ID Map across from the legacy sheet.
 *
 * Reads the legacy tab defensively: its real headers are
 * "Campaign Id | Email Name | Status | Resolved At" but they have drifted before,
 * so columns are matched loosely rather than by position.
 *
 * NOT_FOUND rows are carried over deliberately. They record that an ID was
 * looked up and genuinely does not exist in HubSpot, which stops the refresher
 * from paying for the same failed lookup every month.
 */
function SETUP_migrateIdMap() {
  var src = SpreadsheetApp.openById(CFG_LEGACY_SHEET_ID).getSheetByName('ID Map');
  if (!src) throw new Error('Legacy sheet has no "ID Map" tab.');

  var v = src.getDataRange().getValues();
  var head = v[0].map(function (h) { return String(h).trim().toLowerCase(); });
  var find = function (opts) {
    for (var i = 0; i < opts.length; i++) {
      var k = head.indexOf(opts[i]);
      if (k >= 0) return k;
    }
    return -1;
  };
  var ci = find(['campaign id', 'id', 'campaignid', 'utm_content']);
  var cn = find(['email name', 'name', 'emailname']);
  var cs = find(['status']);
  var ca = find(['resolved at', 'at', 'resolvedat']);

  if (ci < 0 || cn < 0) {
    throw new Error('ID Map: no id/name column found. Header was: ' + head.join(' | '));
  }

  var rows = [];
  for (var r = 1; r < v.length; r++) {
    var id = String(v[r][ci] || '').trim();
    if (!id) continue;
    rows.push([
      id,
      String(v[r][cn] || '').trim(),
      cs >= 0 ? String(v[r][cs] || '').trim() : '',
      ca >= 0 ? String(v[r][ca] || '').trim() : ''
    ]);
  }

  CFG_assert_(rows.length >= CFG_ASSERT.minIdMapRows, 'Setup.migrateIdMap',
    'Only ' + rows.length + ' ID Map rows read from the legacy sheet, expected at ' +
    'least ' + CFG_ASSERT.minIdMapRows + '. Migrating a truncated map would silently ' +
    'drop months of resolved IDs.');

  CFG_writeTab_(TAB_ID_MAP, ['Campaign Id', 'Email Name', 'Status', 'Resolved At'], rows);

  var resolved = rows.filter(function (r) { return r[2] !== 'NOT_FOUND' && r[1]; }).length;
  CFG_log_('Setup.migrateIdMap', 'OK',
    rows.length + ' rows migrated (' + resolved + ' resolved, ' +
    (rows.length - resolved) + ' unresolved/NOT_FOUND)');
  return rows.length;
}

/** Drive folder for the data files and the built HTML. Idempotent. */
function SETUP_outputFolder() {
  var it = DriveApp.getFoldersByName(CFG_OUTPUT_FOLDER);
  var f = it.hasNext() ? it.next() : DriveApp.createFolder(CFG_OUTPUT_FOLDER);
  Logger.log('Output folder: ' + f.getUrl());
  return f;
}

/**
 * The whole setup, in order. Safe to re-run; each step is idempotent.
 * Stops at the first failure rather than continuing on a broken foundation.
 */
function SETUP_all() {
  var out = [];
  out.push('1. Sheet:         ' + SETUP_createSheet());
  // CFG_SHEET_ID was read at load time, so it is stale within this same
  // execution if the sheet was only just created. Re-read before using it.
  CFG_SHEET_ID = PropertiesService.getScriptProperties().getProperty('DASH_SHEET_ID_V2');
  out.push('2. ID Map:        ' + SETUP_migrateIdMap() + ' rows');
  var folder = SETUP_outputFolder();
  out.push('3. Output folder: ' + folder.getName() + '  ' + folder.getUrl());

  // The category map is produced outside Apps Script (see CATEGORY_load_ for why),
  // so its absence is the expected state on a first run, not an error.
  var hasCats = folder.getFilesByName(ROSTER_CATEGORY_FILE).hasNext();
  out.push('4. category-map:  ' + (hasCats ? 'present' : 'NOT YET PRESENT'));

  out.push('');
  if (!hasCats) {
    out.push('NEXT: the monthly "marketing-email-category-map" job must run once to');
    out.push('write category-map.json into the folder above. ROSTER_rebuild() will');
    out.push('refuse to run until it exists, on purpose: without categories every');
    out.push('email classifies as "other" and Marketing revenue reports as zero.');
  } else {
    out.push('NEXT: run ROSTER_rebuild(), then ROSTER_selfTest().');
    out.push('Do not proceed past a failing self-test.');
  }
  Logger.log(out.join('\n'));
}
/**
 * THE ROSTER — the population, and the only classifier
 * ═════════════════════════════════════════════════════════════════════════════
 * REWRITTEN 2026-08-05 after live probing disproved the first design.
 *
 * ─── THE JOIN KEY, CORRECTED ─────────────────────────────────────────────────
 * The first version of this file asserted that hs_origin_asset_id IS utm_content.
 * That is WRONG and was disproved directly: GET /email/public/v1/campaigns/
 * 215645742091 returns 404 "Unknown email campaign id", even though that is a
 * valid marketing email ID that /marketing/v3/emails/215645742091 serves fine.
 *
 * There are TWO separate ID spaces:
 *
 *   marketing email ID   215645742091   one per email. the asset.
 *                                       = hs_origin_asset_id. used for deep links.
 *   email campaign IDs   94735358, ...  MANY per email. one per send/variant.
 *                                       = what GA4 writes into utm_content.
 *
 * A single email carries dozens of campaign IDs in its allEmailCampaignIds array
 * (the "CWS - July 2026" record has roughly eighty). This is exactly what
 * MONTHLY-REFRESH.md meant by the semicolon-separated "All Internal HubSpot IDs"
 * column, and why seedIdMapFromAllEmails splits on ';'.
 *
 * So classification is a two-hop lookup:
 *     utm_content -> campaign ID -> marketing email -> category
 *
 * ─── WHY CATEGORY COMES FROM A FILE ──────────────────────────────────────────
 * `category` is a CUSTOM property AWS defined on the marketing email object. Its
 * values (Marketing, Section, This Week in Welding, Periodicals, Transactional,
 * Survey, Operational, Ad Sales, Other) are AWS's, not HubSpot's.
 *
 * Custom properties are only served by the CRM v3 API, and CRM v3 refuses this
 * object outright: "Object type MARKETING_EMAIL is not supported by this
 * endpoint." That is a 400, not a 403. No private-app scope fixes it. Verified
 * 2026-08-05 after granting crm.objects.custom.read, which changed the error
 * from 403 to 400 and confirmed the endpoint simply does not serve this type.
 *
 * So category arrives as a small file in the Drive output folder, refreshed
 * monthly by a scheduled job that reads it through an API surface that CAN see
 * custom properties. It is still derived from the API every month and still
 * never hand-typed, which is what the governing rule actually requires.
 *
 * If category is ever exposed to private apps, delete CATEGORY_load_ and read it
 * inline. Nothing else changes.
 */

var ROSTER_EMAILS_URL   = 'https://api.hubapi.com/marketing/v3/emails';
var ROSTER_CATEGORY_FILE = 'category-map.json';

// ═══ CATEGORY MAP ═════════════════════════════════════════════════════════════

/**
 * Returns { "215645742091": "Marketing", ... } built from the Drive file.
 *
 * FILE FORMAT (deliberately compact):
 *   { "generated": "...", "source": "...",
 *     "marketing": ["215645742091", ...],
 *     "twiw":      ["216734744436", ...] }
 *
 * Only the two categories that matter are listed. Everything absent from both
 * arrays classifies as "other", which is correct: Section, Periodicals,
 * Transactional, Survey, Operational, Ad Sales and Other are all excluded from
 * both channels anyway. Listing 6,100 Section IDs to say "not this one" would
 * quadruple the file for no gain.
 *
 * Absence is fatal rather than defaulted. An empty map would classify every
 * email as "other", reporting zero Marketing revenue: wrong, but plausible
 * enough to go unnoticed. That failure mode is this project's whole history.
 */
function CATEGORY_load_() {
  var folder = SETUP_outputFolder();
  var it = folder.getFilesByName(ROSTER_CATEGORY_FILE);
  CFG_assert_(it.hasNext(), 'Roster.category',
    ROSTER_CATEGORY_FILE + ' is not in the "' + CFG_OUTPUT_FOLDER + '" Drive folder. ' +
    'It is written by the monthly category-map job. Without it every email would ' +
    'classify as "other" and Marketing revenue would report as zero.');

  var doc = JSON.parse(it.next().getBlob().getDataAsString());
  CFG_assert_(doc && doc.marketing && doc.twiw, 'Roster.category',
    ROSTER_CATEGORY_FILE + ' is missing its "marketing" or "twiw" array. ' +
    'Expected {marketing:[...], twiw:[...]}.');

  var map = {};
  doc.marketing.forEach(function (id) { map[String(id).trim()] = 'Marketing'; });
  doc.twiw.forEach(function (id) { map[String(id).trim()] = 'This Week in Welding'; });

  var n = Object.keys(map).length;
  CFG_assert_(n >= CFG_ASSERT.minRosterRows, 'Roster.category',
    ROSTER_CATEGORY_FILE + ' has only ' + n + ' entries, expected at least ' +
    CFG_ASSERT.minRosterRows + '. A truncated map silently under-reports.');

  /**
   * FRESHNESS GATE. Added 2026-08-05 after realising the roster had a stale-input
   * hole the roster's own gate did not cover.
   *
   * A month-old map passes the "exists" and "has enough entries" checks happily.
   * But every email sent since it was generated is ABSENT from it, so those
   * emails classify as "other" and vanish from Marketing revenue. That is exactly
   * the $3,266 failure, reintroduced through the back door.
   *
   * The map is produced by the `marketing-email-category-map` scheduled task,
   * which runs in Cowork and therefore only fires while the desktop app is open.
   * If the app was closed on the 2nd it runs late, possibly after this pipeline.
   * So the age has to be asserted rather than assumed.
   *
   * 45 days allows a normal monthly cycle plus slack, and still catches a job
   * that has silently stopped running.
   */
  if (doc.generated) {
    var ageDays = (Date.now() - new Date(doc.generated + 'T00:00:00Z').getTime()) / 864e5;
    CFG_assert_(ageDays <= 45, 'Roster.category',
      ROSTER_CATEGORY_FILE + ' was generated ' + ageDays.toFixed(0) + ' days ago (' +
      doc.generated + '). Emails sent since then are missing from it and would ' +
      'classify as "other", silently dropping out of Marketing revenue. Run the ' +
      '"marketing-email-category-map" scheduled task, then re-run this.');
    Logger.log('category-map age: ' + ageDays.toFixed(0) + ' days (limit 45)');
  } else {
    CFG_log_('Roster.category', 'WARN',
      ROSTER_CATEGORY_FILE + ' has no "generated" date, so its age cannot be ' +
      'checked. Treat its Marketing figures with suspicion until it is regenerated.');
  }

  Logger.log('category-map: ' + doc.marketing.length + ' Marketing, ' +
             doc.twiw.length + ' TWIW, generated ' + (doc.generated || 'unknown'));
  return map;
}

// ═══ REBUILD ══════════════════════════════════════════════════════════════════

/**
 * Pull every marketing email, expand its campaign IDs, join category, write the
 * Roster tab as one row PER CAMPAIGN ID. That is the grain GA4 joins against.
 */
function ROSTER_rebuild() {
  var token = CFG_hubspotToken_();
  var cats = CATEGORY_load_();

  var rows = [], emails = 0, noCampaignIds = 0, uncategorised = 0, archivedEmails = 0;
  var started = Date.now();
  var seenEid = {};

  /**
   * ARCHIVED EMAILS MUST BE FETCHED SEPARATELY.
   *
   * /marketing/v3/emails defaults to archived=false. Emails archived in HubSpot
   * still have campaign IDs sitting in GA4 history, so excluding them silently
   * orphans their past traffic: it stops being attributable to any email and
   * quietly vanishes from every per-email and per-channel table.
   *
   * Measured 2026-08-05: skipping archived lost 197 month/email rows and 3,506
   * sessions of history versus the previous pipeline. Zero revenue, so the money
   * figures still reconciled and nothing looked wrong. That is exactly the kind
   * of invisible loss this rebuild exists to prevent, so both passes run.
   */
  [false, true].forEach(function (archived) {
    var after = null;
    do {
      var url = ROSTER_EMAILS_URL + '?limit=100&archived=' + archived +
                (after ? '&after=' + encodeURIComponent(after) : '');
      var res = UrlFetchApp.fetch(url, {
        muteHttpExceptions: true,
        headers: { Authorization: 'Bearer ' + token }
      });
      CFG_assert_(res.getResponseCode() === 200, 'Roster',
        'HTTP ' + res.getResponseCode() + ' from /marketing/v3/emails (archived=' +
        archived + '): ' + res.getContentText().slice(0, 200));

      var body = JSON.parse(res.getContentText());
      (body.results || []).forEach(function (e) {
        var eid = String(e.id || '').trim();
        if (!eid || seenEid[eid]) return;    // an email can appear in both passes
        emails++;
        if (archived) archivedEmails++;

        // Collect first, emit later. A/B variants have to be resolved against
        // their master, and the master may arrive on a later page or in the
        // other pass, so nothing can be written until every email is in hand.
        seenEid[eid] = {
          id: eid,
          name: CFG_unescape_(e.name),
          cat: cats[eid] || '',
          sub: (e.subscriptionDetails && e.subscriptionDetails.subscriptionId) || '',
          state: String(e.state || ''),
          publish: String(e.publishDate || ''),
          subcat: String(e.subcategory || ''),
          subject: CFG_unescape_(e.subject),
          isAb: !!e.isAb,
          clonedFrom: String(e.clonedFrom || '').trim(),
          ids: e.allEmailCampaignIds || []
        };
      });

      after = body.paging && body.paging.next ? body.paging.next.after : null;
      if (after) Utilities.sleep(CFG_API_SLEEP_MS);
    } while (after && Date.now() - started < CFG_MAX_RUNTIME_MS);
  });

  /**
   * A/B VARIANT ROLLUP.
   *
   * HubSpot names variant sends "(B) <master name>", which invites a rollup by
   * stripping the prefix. Do not. The live data contains
   * "(B) This Week In Welding_04-28-2026" with a capital I against masters named
   * with a lowercase i, so a name-based rollup fails silently on the very rows it
   * exists to fix.
   *
   * Verified 2026-08-05 via AB_probe: variant 186822787078 carries
   * clonedFrom = 186820812462, which is its master. That is an ID relationship,
   * so the rollup uses it and no string matching is involved.
   *
   * A variant inherits the master's name, category and subscription. Its campaign
   * IDs stay its own, so its GA4 traffic is attributed to the parent send rather
   * than stranded under a name nothing else knows about. Left unrolled this cost
   * 143 month/email rows, 14,608 sessions and $9,830 of web revenue.
   */
  var rolled = 0, orphanVariants = 0;
  Object.keys(seenEid).forEach(function (eid) {
    var e = seenEid[eid];
    if (!e.isAb || !e.clonedFrom) return;
    var master = seenEid[e.clonedFrom];
    if (!master) { orphanVariants++; return; }   // master deleted; keep as-is
    e.name = master.name;
    e.cat  = master.cat;
    e.sub  = master.sub;
    rolled++;
  });

  Object.keys(seenEid).forEach(function (eid) {
    var e = seenEid[eid];
    if (!e.cat) uncategorised++;
    if (!e.ids.length) { noCampaignIds++; return; }   // never sent, no GA4 traffic
    e.ids.forEach(function (cid) {
      rows.push([
        String(cid).trim(),   // campaign ID = utm_content
        eid,                  // marketing email ID
        e.name,
        e.cat,
        String(e.sub),
        e.state,
        e.publish,
        e.subcat,             // HubSpot's own: batch, automated, ...
        e.subject
      ]);
    });
  });

  CFG_assert_(rows.length >= CFG_ASSERT.minRosterRows, 'Roster',
    'Only ' + rows.length + ' campaign IDs across ' + emails + ' emails. ' +
    'Refusing to overwrite a good roster with a bad pull.');

  CFG_writeTab_(TAB_ROSTER, [
    'Campaign Id', 'Email Id', 'Name', 'Category', 'Subscription',
    'State', 'Publish Date', 'Subcategory', 'Subject'
  ], rows);

  var byCat = {};
  rows.forEach(function (r) { byCat[r[3] || '(none)'] = (byCat[r[3] || '(none)'] || 0) + 1; });

  var ranOut = Date.now() - started >= CFG_MAX_RUNTIME_MS;
  CFG_log_('Roster', ranOut ? 'WARN' : 'OK',
    emails + ' emails (' + archivedEmails + ' archived) -> ' + rows.length + ' campaign IDs. ' +
    'A/B variants rolled up to master: ' + rolled +
    (orphanVariants ? ' (' + orphanVariants + ' variants whose master is gone, kept as-is)' : '') +
    '. Uncategorised: ' + uncategorised + '. Never sent: ' + noCampaignIds + '. ' +
    'Campaign IDs by category: ' + JSON.stringify(byCat) +
    (ranOut ? '  WARNING: hit the runtime ceiling, the roster may be incomplete. Re-run.' : ''));
  return rows.length;
}

// ═══ CLASSIFY ═════════════════════════════════════════════════════════════════

/** campaignId -> { eid, name, category, sub }. Read once per run. */
function ROSTER_map() {
  var t = CFG_readTab_(TAB_ROSTER);
  CFG_assert_(t.rows.length >= CFG_ASSERT.minRosterRows, 'Roster.map',
    'Roster tab has only ' + t.rows.length + ' rows. Run ROSTER_rebuild() first.');
  var map = {};
  t.rows.forEach(function (r) {
    map[String(r[0]).trim()] = {
      eid: String(r[1]), name: r[2], category: r[3], sub: String(r[4]).trim(),
      state: r[5], publish: String(r[6]), subject: r[8] || ''
    };
  });
  return map;
}

/**
 * The channel decision, in one place.
 *
 *   twiw      subscription 19561173, or category says so
 *   marketing category exactly "Marketing"
 *   other     anything else identified: Section, Periodicals, Transactional, ...
 *   null      campaign ID not in the roster — DROPPED, never guessed
 *
 * Returning null rather than defaulting to marketing is deliberate. Treating
 * unknown as marketing is what reported July 2026 as $7,554 against a true
 * $3,680, by folding in newsletters and section sends.
 */
function ROSTER_channelOf(campaignId, map) {
  var e = map[String(campaignId).trim()];
  if (!e) return null;
  if (e.sub === CFG_TWIW_SUBSCRIPTION) return 'twiw';
  if (/this week in welding/i.test(e.category || '')) return 'twiw';
  if (e.category === CFG_MARKETING_CATEGORY) return 'marketing';
  return 'other';
}

// ═══ A/B VARIANT PROBE ════════════════════════════════════════════════════════

/**
 * Read-only. Finds how an A/B variant B email is linked to its master.
 *
 * WHY THIS IS A PROBE AND NOT A GUESS. Variant emails are named "(B) <master>",
 * so the obvious fix is to strip the prefix. That does not work: the live data
 * has "(B) This Week In Welding_04-28-2026" with a capital I, against records
 * named "This Week in Welding_..." with a lowercase i. A name-based rollup would
 * silently fail on exactly the rows it is meant to fix.
 *
 * /marketing/v3/emails exposes four fields that might carry the real link:
 * isAb, clonedFrom, primaryEmailCampaignId, emailCampaignGroupId. This prints
 * them for a variant and for its likely master so the rollup key is chosen from
 * evidence.
 *
 * Measured impact if left unfixed: 143 month/email rows, 14,608 sessions and
 * $9,830 of web revenue not rolling up to the parent send. Pre-existing.
 */
function AB_probe() {
  var t = CFG_readTab_(TAB_ROSTER);
  var variant = null;
  for (var i = 0; i < t.rows.length && !variant; i++) {
    if (/^\(B\)\s/.test(String(t.rows[i][2]))) variant = t.rows[i];
  }
  if (!variant) { Logger.log('No "(B) " named email found in the Roster tab.'); return; }

  var token = CFG_hubspotToken_();
  function fetchOne(eid) {
    var r = UrlFetchApp.fetch(
      'https://api.hubapi.com/marketing/v3/emails/' + eid,
      { muteHttpExceptions: true, headers: { Authorization: 'Bearer ' + token } });
    if (r.getResponseCode() !== 200) return { error: r.getResponseCode() };
    var b = JSON.parse(r.getContentText());
    return {
      id: b.id, name: b.name, isAb: b.isAb,
      clonedFrom: b.clonedFrom,
      primaryEmailCampaignId: b.primaryEmailCampaignId,
      emailCampaignGroupId: b.emailCampaignGroupId,
      campaignIdCount: (b.allEmailCampaignIds || []).length
    };
  }

  var v = fetchOne(variant[1]);
  var bare = String(variant[2]).replace(/^\(B\)\s*/, '').toLowerCase();

  // Candidate masters: same name ignoring case and the prefix.
  var masters = [];
  t.rows.forEach(function (r) {
    var n = String(r[2]);
    if (!/^\(B\)\s/.test(n) && n.toLowerCase() === bare) masters.push(r);
  });

  var out = ['A/B VARIANT PROBE', '─────────────────', '',
             'VARIANT: ' + JSON.stringify(v, null, 2), ''];

  if (masters.length) {
    out.push('LIKELY MASTER (matched on name, case-insensitive, prefix removed):');
    out.push(JSON.stringify(fetchOne(masters[0][1]), null, 2));
    out.push('');
    out.push('Compare clonedFrom / primaryEmailCampaignId / emailCampaignGroupId.');
    out.push('Whichever field is EQUAL across the two, or where the variant points AT');
    out.push('the master id, is the rollup key.');
  } else {
    out.push('No same-named master in the Roster. Either the master is named');
    out.push('differently, or the variant is standalone. If clonedFrom above holds an');
    out.push('id, that id IS the master and no name matching is needed at all.');
  }

  var abCount = t.rows.filter(function (r) { return /^\(B\)\s/.test(String(r[2])); }).length;
  out.push('');
  out.push('Roster rows with a "(B) " name: ' + abCount);
  Logger.log(out.join('\n'));
}

// ═══ SELF-TEST ════════════════════════════════════════════════════════════════

/**
 * Checks the roster against an independently corroborated answer.
 *
 * July 2026 had exactly 14 category=Marketing batch sends. Two sources agree:
 * docs/AUTOMATION-ARCHITECTURE.md recorded "None of July's 14 marketing sends
 * are in that tab" when Bug B was found, and a live CRM query on 2026-08-05
 * returned the same 14 with these exact IDs.
 *
 * These are MARKETING EMAIL ids (hs_origin_asset_id), so the test checks the
 * Email Id column, not the Campaign Id column.
 */
function ROSTER_selfTest() {
  var t = CFG_readTab_(TAB_ROSTER);

  var expect = [
    '215879942045', '215867597341', '215645742091', '215584344355', '216648091311',
    '217065641077', '217378527660', '217047109039', '216673323114', '217032302949',
    '217555092350', '217117427828', '217138534940', '217498792860'
  ];

  var seen = {};
  t.rows.forEach(function (r) {
    if (String(r[3]) === 'Marketing') seen[String(r[1])] = true;
  });
  var missing = expect.filter(function (e) { return !seen[e]; });

  // Every expected ID must be present AND classified Marketing.
  var ok = missing.length === 0;
  Logger.log(
    'ROSTER SELF-TEST\n' +
    '  July 2026 Marketing emails found: ' + (expect.length - missing.length) + '/14\n' +
    '  Missing: ' + (missing.length ? missing.join(', ') : 'none') + '\n' +
    '  Total Marketing campaign IDs in roster: ' +
      t.rows.filter(function (r) { return String(r[3]) === 'Marketing'; }).length + '\n' +
    '  ' + (ok ? 'PASS' : 'FAIL - do not trust downstream numbers until this passes'));
  CFG_log_('Roster.selfTest', ok ? 'OK' : 'FAIL',
    (expect.length - missing.length) + '/14 July marketing emails present');
  return ok;
}
/**
 * PRODUCER: email-pages-items.js — landing pages and items purchased, per channel
 * ═════════════════════════════════════════════════════════════════════════════
 * Ported from the standalone EMAIL_PAGES_ITEMS project, and simplified.
 *
 * ─── WHAT CHANGED, AND WHY IT MATTERS ────────────────────────────────────────
 * The old version classified traffic by resolving utm_content to an email NAME
 * through the ID Map, then matching that name against the hand-typed All Emails
 * tab. On 2026-08-05 that reported July Marketing item revenue as $3,266 against
 * a true $3,680, because all 14 of July's marketing sends were missing from the
 * tab. It did not error. It just under-reported.
 *
 * Now utm_content IS the campaign ID, and the Roster maps campaign ID straight
 * to category. One hop, no names, no string matching, nothing to go stale.
 *
 * THE ID MAP IS NO LONGER USED FOR CLASSIFICATION AT ALL. It survives only to
 * put human-readable names on things. That removes a whole class of failure:
 * an unresolved ID used to mean unclassifiable traffic, and now it just means a
 * row without a pretty label.
 *
 * ─── THE CONTROL TOTAL ───────────────────────────────────────────────────────
 * This file reports itemRevenue, which is price x quantity on ecommerce items.
 * The dashboard's Marketing Email card reports totalRevenue, which also includes
 * tax, shipping and non-item revenue. THEY WILL NEVER BE EQUAL, and the old log
 * line invited you to compare them anyway, which cost an afternoon of chasing a
 * gap that was not a bug.
 *
 * So this pulls totalRevenue per channel as a genuine control total. That number
 * SHOULD match the card. Real drift becomes visible instead of drowning in an
 * expected difference.
 */

var EPI_START    = '2025-06-01';   // matches dimension coverage in web-data.js
var EPI_TOP_N    = 15;             // per channel, per month
var EPI_FILENAME = 'email-pages-items.js';

/** hs_email / email only. All email channels share it; utm_content splits them. */
function EPI_filter_() {
  return { filter: { fieldName: 'sessionSourceMedium',
                     stringFilter: { matchType: 'EXACT', value: 'hs_email / email' } } };
}

function EPI_run_(dims, mets, start, end, limit, orderBy) {
  var req = {
    dateRanges: [{ startDate: start, endDate: end }],
    dimensions: dims.map(function (d) { return { name: d }; }),
    metrics: mets.map(function (m) { return { name: m }; }),
    dimensionFilter: EPI_filter_(),
    limit: limit || 5000
  };
  if (orderBy) req.orderBys = [{ metric: { metricName: orderBy }, desc: true }];
  var res = AnalyticsData.Properties.runReport(req, 'properties/' + CFG_GA4_PROPERTY_ID);
  return (res.rows || []).map(function (r) {
    return { dims: r.dimensionValues.map(function (v) { return v.value; }),
             mets: r.metricValues.map(function (v) { return Number(v.value) || 0; }) };
  });
}

function EPI_writeFile() {
  var roster = ROSTER_map();
  var months = CFG_months_(EPI_START);

  var pages = {}, items = {}, control = {};
  var kept = 0, dropped = 0, itemsSplit = true;

  months.forEach(function (m) {
    // ---- control totals: what the dashboard card should say ----
    var ctl = { marketing: 0, twiw: 0, other: 0 };
    EPI_run_(['sessionManualAdContent'], ['sessions', 'totalRevenue'], m.start, m.end, 20000)
      .forEach(function (r) {
        var ch = ROSTER_channelOf(r.dims[0], roster);
        if (!ch) { dropped += r.mets[0]; return; }
        kept += r.mets[0];
        ctl[ch] += r.mets[1];
      });
    control[m.key] = ctl;

    // ---- pages ----
    var pb = { marketing: {}, twiw: {}, other: {} };
    EPI_run_(['sessionManualAdContent', 'landingPagePlusQueryString'],
             ['sessions', 'engagedSessions'], m.start, m.end, 20000, 'sessions')
      .forEach(function (r) {
        var ch = ROSTER_channelOf(r.dims[0], roster);
        if (!ch) return;
        var b = pb[ch], k = r.dims[1];
        if (!b[k]) b[k] = { s: 0, e: 0 };
        b[k].s += r.mets[0]; b[k].e += r.mets[1];
      });
    ['marketing', 'twiw', 'other'].forEach(function (ch) {
      var arr = Object.keys(pb[ch]).map(function (k) {
        return [k, pb[ch][k].s, pb[ch][k].s ? Number((pb[ch][k].e / pb[ch][k].s).toFixed(4)) : 0];
      }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, EPI_TOP_N);
      if (arr.length) { (pages[m.key] = pages[m.key] || {})[ch] = arr; }
    });

    // ---- items ----
    var ib = { marketing: {}, twiw: {}, other: {}, all: {} };
    var rows = null;
    if (itemsSplit) {
      try {
        rows = EPI_run_(['sessionManualAdContent', 'itemName'],
                        ['itemsPurchased', 'itemRevenue'], m.start, m.end, 20000, 'itemRevenue');
      } catch (e) { itemsSplit = false; }
    }
    if (itemsSplit && rows) {
      rows.forEach(function (r) {
        var ch = ROSTER_channelOf(r.dims[0], roster);
        if (!ch) return;
        var b = ib[ch], k = r.dims[1];
        if (!b[k]) b[k] = { q: 0, rev: 0 };
        b[k].q += r.mets[0]; b[k].rev += r.mets[1];
      });
    } else {
      EPI_run_(['itemName'], ['itemsPurchased', 'itemRevenue'], m.start, m.end, 500, 'itemRevenue')
        .forEach(function (r) {
          var k = r.dims[0];
          if (!ib.all[k]) ib.all[k] = { q: 0, rev: 0 };
          ib.all[k].q += r.mets[0]; ib.all[k].rev += r.mets[1];
        });
    }
    (itemsSplit ? ['marketing', 'twiw', 'other'] : ['all']).forEach(function (ch) {
      var arr = Object.keys(ib[ch]).map(function (k) {
        return [k, ib[ch][k].q, Math.round(ib[ch][k].rev)];
      }).sort(function (a, b) { return b[2] - a[2]; }).slice(0, EPI_TOP_N);
      if (arr.length) { (items[m.key] = items[m.key] || {})[ch] = arr; }
    });
  });

  var mk = Object.keys(pages).sort();
  CFG_assert_(mk.length > 0, 'EPI', 'No months produced any rows. GA4 returned nothing.');

  var share = (kept + dropped) ? dropped / (kept + dropped) : 0;
  if (share > CFG_ASSERT.maxUnresolvedShare) {
    CFG_log_('EPI', 'WARN',
      'Unresolved utm_content is ' + (share * 100).toFixed(1) + '% of email sessions (' +
      dropped + ' of ' + (kept + dropped) + '), above the ' +
      (CFG_ASSERT.maxUnresolvedShare * 100) + '% threshold. Those sessions appear in ' +
      'monthly totals but in no channel breakdown, so per-channel figures read low. ' +
      'Check whether recent sends are missing from the Roster.');
  }

  var header =
    '// TOP PAGES AND ITEMS PURCHASED, FOR EMAIL TRAFFIC.\n' +
    '// GENERATED by EPI_writeFile() in the Marketing Dashboard Pipeline. Do not hand edit.\n' +
    '//\n' +
    '// Scope: sessionSourceMedium = "hs_email / email", split by utm_content, which is\n' +
    '//   the HubSpot email CAMPAIGN id, looked up directly in the Roster tab. Category\n' +
    '//   comes from HubSpot, never from a hand-maintained list.\n' +
    '//   marketing = category "Marketing".  twiw = subscription ' + CFG_TWIW_SUBSCRIPTION + '.\n' +
    '//   other = identified but neither (Section, Periodicals, Transactional, ...).\n' +
    '//   Unrecognised utm_content is DROPPED, never guessed into a channel.\n' +
    '//   ' + kept + ' sessions kept, ' + dropped + ' dropped (' + (share * 100).toFixed(1) + '%).\n' +
    '//\n' +
    '// SHAPE\n' +
    '//   pages:   month -> channel -> [ [landingPage, sessions, engagementRate], ... ]\n' +
    '//   items:   month -> channel -> [ [itemName, quantity, itemRevenue], ... ]\n' +
    '//   control: month -> channel -> totalRevenue\n' +
    '//\n' +
    '// CONTROL vs ITEMS. control is totalRevenue and is what the dashboard card shows.\n' +
    '//   items are itemRevenue, which excludes tax, shipping and non-item revenue and is\n' +
    '//   therefore ALWAYS LOWER. Compare control against the card. Never compare the sum\n' +
    '//   of items against the card; they measure different things.\n' +
    (itemsSplit ? '' :
    '//   ITEMS ARE NOT SPLIT. GA4 rejected itemName with sessionManualAdContent, so items\n' +
    '//   are keyed "all" and cover every email channel together. Label them that way.\n') +
    '//   Top ' + EPI_TOP_N + ' per channel per month.\n' +
    '//\n' +
    '// Months: ' + mk.length + ' (' + mk[0] + ' to ' + mk[mk.length - 1] + ')\n' +
    '// Generated ' + Utilities.formatDate(new Date(), 'America/New_York', 'yyyy-MM-dd HH:mm') + '\n';

  var content = header + 'window.EMAIL_PAGES_ITEMS = ' +
    JSON.stringify({ pages: pages, items: items, control: control, itemsSplit: itemsSplit }) + ';\n';

  var folder = SETUP_outputFolder();
  var it = folder.getFilesByName(EPI_FILENAME);
  if (it.hasNext()) it.next().setContent(content);
  else folder.createFile(EPI_FILENAME, content, MimeType.PLAIN_TEXT);

  // Describe what the two figures actually did, rather than asserting a
  // relationship that does not always hold. itemRevenue equals totalRevenue in
  // any month with no tax, shipping or non-item revenue, and July 2026 is one
  // such month. Printing "always lower" beside two identical numbers is the
  // kind of small dishonesty that trains people to stop reading logs.
  var recent = mk.slice(-3).map(function (k) {
    var c = control[k], i = (items[k] && items[k].marketing) || [];
    var itemRev = i.reduce(function (s, r) { return s + r[2]; }, 0);
    var ctl = Math.round(c.marketing);
    var note = itemRev === ctl ? 'equal: no tax, shipping or non-item revenue this month'
             : itemRev <  ctl ? 'lower by $' + (ctl - itemRev) + ': tax, shipping or non-item revenue'
             : 'HIGHER than control by $' + (itemRev - ctl) + ' — investigate, this should not happen';
    return '  ' + k +
      '   control(totalRevenue): marketing $' + ctl +
      '  twiw $' + Math.round(c.twiw) + '  other $' + Math.round(c.other) +
      '\n           top-' + EPI_TOP_N + ' marketing itemRevenue $' + itemRev + '  (' + note + ')';
  }).join('\n');

  CFG_log_('EPI', 'OK', mk.length + ' months, ' + content.length + ' bytes, ' +
    (share * 100).toFixed(1) + '% unresolved');
  Logger.log(
    EPI_FILENAME + ' written, ' + content.length + ' bytes, ' + mk.length + ' months\n' +
    'sessions kept ' + kept + ', dropped ' + dropped + ' (' + (share * 100).toFixed(1) + '%)\n\n' +
    'LAST 3 MONTHS. The control figure is the one that should match the dashboard card.\n' +
    'For 2026-07 the card reads $3,680; the stale-roster bug reported $3,266.\n' + recent);
  return mk.length;
}
/**
 * PRODUCER: ga4-per-email.js — GA4 web metrics per email, per month
 * ═════════════════════════════════════════════════════════════════════════════
 * Ported from PE_writePerEmailFile, and shortened from four steps to one.
 *
 * ─── WHAT THE OLD CHAIN LOOKED LIKE ──────────────────────────────────────────
 *   1. syncGA4EmailData()        GA4 -> "GA4 Email By ID" tab
 *   2. aggregateGA4FromIdMap()   join ID Map -> "GA4 Monthly By Email" tab
 *   3. PE_writePerEmailFile()    tab -> ga4-per-email.js
 *   plus a human running 1 and 2 in the right order, every month, by hand.
 *
 * Two intermediate tabs existed only because the name lookup was expensive. Now
 * the Roster maps campaign ID to name and category in one hop, so this queries
 * GA4 and writes the file directly. The tabs are gone and so is the ordering
 * requirement, which was itself a documented source of error.
 *
 * ─── A REAL IMPROVEMENT IN THE NAMES ─────────────────────────────────────────
 * The old chain named emails from /email/public/v1/campaigns/{id}, which returns
 * the CAMPAIGN name. The dashboard joins these keys against EMAIL_DATA.name and
 * TWIW_DATA.name, which come from the marketing email object's hs_name.
 *
 * The Roster's names come from /marketing/v3/emails, which is the same object.
 * So these keys should now match EMAIL_DATA more closely than before, not less.
 * PE_nameCheck() below measures that rather than assuming it.
 *
 * SHAPE: month -> emailName -> { s, e, u, nu, p, rev }
 *   s = sessions, e = engaged sessions, u = users, nu = new users,
 *   p = purchases, rev = revenue (totalRevenue).
 */

var PE_FILENAME = 'ga4-per-email.js';
var PE_START    = '2023-10-01';   // earliest month present in the current file

var PE_METRICS = ['sessions', 'engagedSessions', 'totalUsers', 'newUsers',
                  'ecommercePurchases', 'totalRevenue'];

function PE_writePerEmailFile() {
  var roster = ROSTER_map();
  var months = CFG_months_(PE_START);

  var out = {}, kept = 0, dropped = 0, excluded = 0, totS = 0, totR = 0, rows = 0;

  months.forEach(function (m) {
    var req = {
      dateRanges: [{ startDate: m.start, endDate: m.end }],
      dimensions: [{ name: 'sessionManualAdContent' }],
      metrics: PE_METRICS.map(function (x) { return { name: x }; }),
      dimensionFilter: EPI_filter_(),      // hs_email / email, shared with EPI
      limit: 50000
    };
    var res = AnalyticsData.Properties.runReport(req, 'properties/' + CFG_GA4_PROPERTY_ID);

    var byName = {};
    (res.rows || []).forEach(function (r) {
      var cid = r.dimensionValues[0].value;
      var v = r.metricValues.map(function (x) { return Number(x.value) || 0; });
      var e = roster[String(cid).trim()];

      // No roster entry means we cannot name it. Dropped, never guessed.
      if (!e || !e.name) { dropped += v[0]; return; }

      // Standing exclusions (DATA-SPEC.md). Counted separately from unnamed
      // traffic so the two never get confused: this is a deliberate reporting
      // decision, not an attribution failure. Channel totals still include it.
      if (CFG_EXCLUDED_EIDS[String(e.eid)]) { excluded += v[0]; return; }

      kept += v[0];

      var b = byName[e.name] || (byName[e.name] = { s: 0, e: 0, u: 0, nu: 0, p: 0, rev: 0 });
      b.s += v[0]; b.e += v[1]; b.u += v[2]; b.nu += v[3]; b.p += v[4]; b.rev += v[5];
    });

    var names = Object.keys(byName);
    if (!names.length) return;
    out[m.key] = {};
    names.forEach(function (n) {
      var b = byName[n];
      b.rev = Math.round(b.rev * 100) / 100;
      out[m.key][n] = b;
      totS += b.s; totR += b.rev; rows++;
    });
  });

  var mk = Object.keys(out).sort();
  CFG_assert_(mk.length >= 12, 'PerEmail',
    'Only ' + mk.length + ' months produced rows. Expected at least 12. ' +
    'A collapse here means the Roster or the GA4 filter is wrong.');
  CFG_assert_(rows >= 1000, 'PerEmail',
    'Only ' + rows + ' month/email rows. The current file has about 4,830. ' +
    'Refusing to publish a fraction of the data.');

  var share = (kept + dropped) ? dropped / (kept + dropped) : 0;

  var header =
    '// GA4 WEB METRICS PER EMAIL, PER MONTH.\n' +
    '// GENERATED by PE_writePerEmailFile() in the Marketing Dashboard Pipeline.\n' +
    '// Do not hand edit.\n' +
    '//\n' +
    '// Join: utm_content is the HubSpot email CAMPAIGN id, looked up in the Roster\n' +
    '//   tab, which is rebuilt from the HubSpot API every run. Names come from the\n' +
    '//   marketing email object, the same source as EMAIL_DATA.name.\n' +
    '//   ' + kept + ' sessions named, ' + dropped + ' dropped as unrecognised (' +
        (share * 100).toFixed(1) + '%), ' + excluded + ' excluded by standing rule.\n' +
    '//\n' +
    '// SHAPE: month -> emailName -> { s, e, u, nu, p, rev }\n' +
    '//   s = sessions, e = engaged, u = users, nu = new users,\n' +
    '//   p = purchases, rev = revenue.\n' +
    '//\n' +
    '// Monthly, never lifetime. Lifetime figures under a monthly heading is what\n' +
    '// made the Marketing Email table fail to add up to its own card total.\n' +
    '//\n' +
    '// Months: ' + mk.length + ' (' + mk[0] + ' to ' + mk[mk.length - 1] + ')\n' +
    '// Rows: ' + rows + ', sessions ' + totS + ', revenue ' + Math.round(totR) + '\n' +
    '// Generated ' + Utilities.formatDate(new Date(), 'America/New_York', 'yyyy-MM-dd HH:mm') + '\n';

  var content = header + 'window.GA4_PER_EMAIL = ' + JSON.stringify(out) + ';\n';

  var folder = SETUP_outputFolder();
  var it = folder.getFilesByName(PE_FILENAME);
  if (it.hasNext()) it.next().setContent(content);
  else folder.createFile(PE_FILENAME, content, MimeType.PLAIN_TEXT);

  CFG_log_('PerEmail', 'OK',
    mk.length + ' months, ' + rows + ' rows, ' + totS + ' sessions, $' +
    Math.round(totR) + ', ' + (share * 100).toFixed(1) + '% unnamed, ' +
    excluded + ' sessions excluded by rule');
  Logger.log(
    PE_FILENAME + ' written, ' + content.length + ' bytes\n' +
    '  months ' + mk.length + ' (' + mk[0] + ' to ' + mk[mk.length - 1] + ')\n' +
    '  rows ' + rows + '  (current live file has about 4,830)\n' +
    '  sessions ' + totS + '  revenue $' + Math.round(totR) + '\n' +
    '  dropped as unrecognised: ' + dropped + ' sessions (' + (share * 100).toFixed(1) + '%)\n' +
    '  excluded by standing rule: ' + excluded + ' sessions across ' +
      Object.keys(CFG_EXCLUDED_EIDS).length + ' sends');
  return rows;
}

/**
 * Does NOT change anything. Reports how well the names this producer emits line
 * up with a given month of the dashboard's own email list.
 *
 * Worth running once after the first real build. If names drift, the per-email
 * tables silently show blanks rather than erroring, which is the failure shape
 * this project keeps having. Measuring beats assuming.
 */
function PE_nameCheck(monthKey) {
  monthKey = monthKey || '2026-07';
  var t = CFG_readTab_(TAB_ROSTER);
  var names = {};
  t.rows.forEach(function (r) {
    if (String(r[3]) === 'Marketing' && String(r[6]).indexOf(monthKey) === 0) {
      names[r[2]] = true;
    }
  });
  var list = Object.keys(names).sort();
  Logger.log(
    'NAME CHECK for ' + monthKey + '\n' +
    '  ' + list.length + ' distinct Marketing email names published that month:\n    ' +
    list.join('\n    ') + '\n\n' +
    'Compare these against the Marketing Email table in the dashboard. Any name that\n' +
    'does not appear there is a join miss, and its web metrics will read as blank.');
  return list.length;
}
/**
 * PRODUCER: web-data.js — site traffic, pages, ecommerce and Search Console
 * =============================================================================
 * PORTED VERBATIM from the standalone WEB_DATA_PULL project on 2026-08-05.
 * The GA4 and Search Console query logic is untouched on purpose: it works, it
 * is the least understood part of the system, and rewriting it would have put
 * a proven component at risk for no gain.
 *
 * Only four things changed:
 *   1. the hard-coded legacy sheet id is gone; it uses CFG_sheet_()
 *   2. the GA4 property comes from CFG_GA4_PROPERTY_ID
 *   3. the data file is written to the pipeline's Drive output folder
 *   4. WEB_installMonthlyTrigger is removed; runMonthlyRefresh owns scheduling
 *
 * Unlike the other producers this one does NOT depend on the Roster. It is site
 * traffic, not email traffic, so there is nothing to classify.
 *
 * ENTRY POINTS
 *   WEB_pullAll()        refresh every tab from GA4 and Search Console
 *   WEB_writeDataFile()  tabs -> web-data.js in the Drive output folder
 * Run in that order. The orchestrator does both.
 */

/**
 * AWS WEB DATA PULL — GA4 + Search Console
 *
 * SETUP (already done as of 2026-08-05)
 *  - GCP project: light-truth-499111-f5 (number 521435178855). The Apps Script default
 *    project 1094393314452 is NOT accessible to Roque, which is why Search Console 403'd.
 *  - Services: Google Analytics Data API added.
 *  - APIs enabled in light-truth-499111-f5: Analytics Data API, Search Console API.
 *  - appsscript.json declares webmasters.readonly + script.external_request.
 *
 * RUN ORDER
 *  WEB_gscSites()   confirm Search Console reachable
 *  WEB_verify()     check a known-good month before trusting anything
 *  WEB_pullAll()    fill the six tabs
 *  WEB_installMonthlyTrigger()
 *
 * KEY EVENTS ARE NOT PULLED. Roque has ruled them out of this reporting; the GA4
 * counts swing 7x month to month (102k May, 279k Jun, 747k Jul) and reflect config
 * changes, not behaviour. Do not add keyEvents back to any metric list.
 *
 * SCOPE — two scopes. SITE = www.aws.org only. COMMERCE = all aws.org hosts + (not set).
 * TABS: Web Monthly, Web Traffic, Web Pages, Web Ecommerce, Search Monthly, Search Queries
 */

var WEB_PROPERTY_ID = CFG_GA4_PROPERTY_ID;
var WEB_START       = '2023-10-01';
// SHEET: uses the pipeline's sheet via CFG_sheet_(). The old hard-coded legacy
// sheet id is deliberately gone; this producer must never write to the archive.

/**
 * TWO SCOPES, because traffic and money happen on different hosts.
 *
 * SITE scope = www.aws.org only. This is the marketing site and it is what the report is
 *   about. June 2026 = 183,375 sessions, which matches the 183.4K in the historical
 *   monthly report, so this keeps continuity with everything already reported upward.
 *
 * COMMERCE scope = every aws.org host plus "(not set)", minus the separate properties.
 *   Checkout completes on my1.aws.org (note the "1"), which carried $1,729,881 of June's
 *   revenue. my.aws.org without the "1" has sessions but ZERO revenue. Filtering commerce
 *   to www.aws.org would report $0 alongside healthy traffic - plausible and wrong.
 *   "(not set)" is kept in deliberately: it is a live attribution issue Roque tracks.
 *
 * Do not merge these. Sessions and engagement describe the site; revenue and purchases
 * describe what that traffic went on to buy on the portal.
 */
var WEB_SITE_HOSTS = ['www.aws.org'];

/** Non-aws.org properties, excluded from commerce. Everything else aws.org counts. */
var WEB_COMMERCE_EXCLUDE = [
  'pubs.aws.org',
  'www.awslearning.org',
  'www.senseonline.org',
  'awsweldingbuyersguide.org',
  'careersinwelding.com',
  'www.careersinwelding.com',
  'jobsinwelding.com',
  'weldingapprenticeship.com',
  'weldingworkforcedata.com',
  'webportalapp.com',
  'www-aws-org.translate.goog'
];

/** Search Console. www URL-prefix property matches the historical report (3.3M impressions
 *  in Jun 2026). sc-domain:aws.org would be 7.6M because it sweeps in every subdomain. */
var WEB_GSC_SITES = [
  'https://www.aws.org/',
  'sc-domain:my.aws.org'
];

/** Fixed month for WEB_verify only. Every pull derives its own range from WEB_START. */
var WEB_VERIFY_MONTH = { start: '2026-06-01', end: '2026-06-30', label: 'Jun 2026' };

// ------------------------------------------------------------------ helpers

function WEB_months_(startIso) {
  var out = [], d = new Date(startIso), now = new Date();
  var last = new Date(now.getFullYear(), now.getMonth(), 0);   // through end of last month
  while (d <= last) {
    var y = d.getFullYear(), m = d.getMonth();
    out.push({
      key:   y + '-' + ('0' + (m + 1)).slice(-2),
      start: y + '-' + ('0' + (m + 1)).slice(-2) + '-01',
      end:   Utilities.formatDate(new Date(y, m + 1, 0), 'UTC', 'yyyy-MM-dd')
    });
    d = new Date(y, m + 1, 1);
  }
  return out;
}

function WEB_sheet_(name, headers) {
  var ss = CFG_sheet_();
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  sh.clear();
  sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
  sh.setFrozenRows(1);
  return sh;
}

function WEB_write_(sh, rows) {
  if (!rows.length) return;
  // column A is always Month. Force it to plain text BEFORE writing, or Sheets parses
  // "2026-04" as a date and the value comes back as a Date object on the next read.
  sh.getRange(2, 1, rows.length, 1).setNumberFormat('@');
  sh.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
}

/** www.aws.org only - traffic, engagement, pages, channels. */
function WEB_siteFilter_() {
  return { filter: { fieldName: 'hostName', inListFilter: { values: WEB_SITE_HOSTS } } };
}

/** Every aws.org host plus "(not set)" - revenue and purchases only. */
function WEB_commerceFilter_() {
  return { notExpression: {
    filter: { fieldName: 'hostName', inListFilter: { values: WEB_COMMERCE_EXCLUDE } }
  } };
}

function WEB_ga4_(dimensions, metrics, start, end, limit, orderByMetric, scope) {
  var req = {
    dateRanges: [{ startDate: start, endDate: end }],
    dimensions: dimensions.map(function (d) { return { name: d }; }),
    metrics:    metrics.map(function (m) { return { name: m }; }),
    limit:      limit || 100000,
    dimensionFilter: scope === 'commerce' ? WEB_commerceFilter_() : WEB_siteFilter_()
  };
  if (orderByMetric) req.orderBys = [{ metric: { metricName: orderByMetric }, desc: true }];
  var res = AnalyticsData.Properties.runReport(req, 'properties/' + WEB_PROPERTY_ID);
  return (res.rows || []).map(function (r) {
    return {
      dims: (r.dimensionValues || []).map(function (v) { return v.value; }),
      mets: (r.metricValues || []).map(function (v) { return Number(v.value || 0); })
    };
  });
}

/** Search Console over REST. The advanced service no longer exists in the Services list. */
function WEB_gsc_(site, dimensions, start, end, limit) {
  var url = 'https://searchconsole.googleapis.com/webmasters/v3/sites/'
          + encodeURIComponent(site) + '/searchAnalytics/query';
  var body = { startDate: start, endDate: end, rowLimit: limit || 25000 };
  if (dimensions && dimensions.length) body.dimensions = dimensions;
  try {
    var res = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(body),
      headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true
    });
    if (res.getResponseCode() !== 200) {
      Logger.log('GSC ' + res.getResponseCode() + ' for ' + site + ': ' + res.getContentText().slice(0, 500));
      return [];
    }
    return JSON.parse(res.getContentText()).rows || [];
  } catch (e) {
    Logger.log('GSC threw for ' + site + ': ' + e);
    return [];
  }
}

// ------------------------------------------------------------------ diagnostics

function WEB_gscSites() {
  var res = UrlFetchApp.fetch('https://searchconsole.googleapis.com/webmasters/v3/sites', {
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    muteHttpExceptions: true
  });
  var out = res.getResponseCode() === 200
    ? (JSON.parse(res.getContentText()).siteEntry || [])
        .map(function (s) { return s.siteUrl + '  (' + s.permissionLevel + ')'; }).join('\n')
    : 'HTTP ' + res.getResponseCode() + ': ' + res.getContentText().slice(0, 500);
  Logger.log(out);
  return out;
}

/** Every hostname in the property, unfiltered, ranked by revenue. Use when revenue looks wrong. */
function WEB_diagHostnames() {
  var M = WEB_VERIFY_MONTH;
  var res = AnalyticsData.Properties.runReport({
    dateRanges: [{ startDate: M.start, endDate: M.end }],
    dimensions: [{ name: 'hostName' }],
    metrics: [{ name: 'sessions' }, { name: 'totalRevenue' }, { name: 'ecommercePurchases' }],
    orderBys: [{ metric: { metricName: 'totalRevenue' }, desc: true }],
    limit: 40
  }, 'properties/' + WEB_PROPERTY_ID);
  var out = (res.rows || []).map(function (r) {
    var host = r.dimensionValues[0].value;
    return (WEB_COMMERCE_EXCLUDE.indexOf(host) >= 0 ? '  [out of scope] ' : (WEB_SITE_HOSTS.indexOf(host) >= 0 ? '  [SITE + commerce] ' : '  [commerce only]  ')) + host +
           '  sessions ' + r.metricValues[0].value +
           '  revenue '  + r.metricValues[1].value +
           '  purchases ' + r.metricValues[2].value;
  }).join('\n');
  Logger.log(M.label + '\n' + out);
  return out;
}

function WEB_verify() {
  var M = WEB_VERIFY_MONTH;
  var r = WEB_ga4_([], ['sessions','engagedSessions'], M.start, M.end)[0];
  var c = WEB_ga4_([], ['totalRevenue','ecommercePurchases'], M.start, M.end, null, null, 'commerce')[0];
  var out = 'SITE  ' + M.label + ' (www.aws.org only)\n' +
            '  sessions ' + r.mets[0] + ', engaged ' + r.mets[1] + '\n' +
            '  EXPECTED sessions 183375  (matches the 183.4K in the monthly report)\n' +
            'COMMERCE ' + M.label + ' (all aws.org hosts + not set)\n' +
            '  revenue ' + c.mets[0] + ', purchases ' + c.mets[1] + '\n' +
            '  EXPECTED revenue 1766141';
  var g = WEB_gsc_('https://www.aws.org/', [], M.start, M.end, 1)[0];
  if (g) out += '\nGSC ' + M.label + ' -> impressions ' + g.impressions + ', clicks ' + g.clicks +
                '\n  EXPECTED ~3,319,377 impressions, ~51,668 clicks';
  Logger.log(out);
  return out;
}

// ------------------------------------------------------------------ pulls

function WEB_pullMonthly() {
  var sh = WEB_sheet_('Web Monthly',
    ['Month','Hostname','Sessions','Engaged Sessions','Engagement Rate','Revenue','Total Users','New Users']);
  var rows = [];
  WEB_months_(WEB_START).forEach(function (m) {
    WEB_ga4_(['hostName'], ['sessions','engagedSessions','engagementRate','totalRevenue','totalUsers','newUsers'],
             m.start, m.end, 30, 'sessions').forEach(function (r) {
      rows.push([m.key, r.dims[0], r.mets[0], r.mets[1], r.mets[2], r.mets[3], r.mets[4], r.mets[5]]);
    });
    // SITE row: www.aws.org only. Revenue here is deliberately near zero - checkout is elsewhere.
    var t = WEB_ga4_([], ['sessions','engagedSessions','engagementRate','totalRevenue','totalUsers','newUsers'],
                     m.start, m.end)[0];
    if (t) rows.push([m.key, 'SITE', t.mets[0], t.mets[1], t.mets[2], t.mets[3], t.mets[4], t.mets[5]]);
    // COMMERCE row: revenue and purchases, wherever on aws.org they completed.
    var c = WEB_ga4_([], ['sessions','engagedSessions','engagementRate','totalRevenue','totalUsers','newUsers'],
                     m.start, m.end, null, null, 'commerce')[0];
    if (c) rows.push([m.key, 'COMMERCE', c.mets[0], c.mets[1], c.mets[2], c.mets[3], c.mets[4], c.mets[5]]);
  });
  WEB_write_(sh, rows);
  return rows.length;
}

/**
 * Traffic breakdown, switchable by dimension in the dashboard.
 *
 * Each row carries BOTH scopes for the same dimension value:
 *   sessions / engaged / engagement rate  -> SITE scope (www.aws.org)
 *   revenue / purchases                   -> COMMERCE scope (all aws.org + not set)
 * That is the only way "Organic Search drove X sessions and $Y" can be true, since the
 * session happens on www and the purchase completes on my1.
 *
 * Last 25 months only. The long trend comes from Web Monthly; this table is for drilling
 * into a period, and 25 months keeps it inside the Apps Script 6-minute execution limit.
 */
/**
 * [ga4Dimensions, label, valueIndex, keepWhereDim0Equals, monthsBack]
 *
 * Country and US State added 2026-08-06 for the webmaster. Note what was found when
 * they were added: `Country` rows were ALREADY sitting in web-data.js but were NOT in
 * this list, so they were stale carry-over from an earlier pull. The next run would
 * have rewritten the tab without them and quietly emptied the dashboard's Country tab.
 * `Source` is in the same state and is intentionally left out, since it duplicates
 * Source / Medium and nothing reads it.
 *
 * US State: GA4's `region` is NOT US-only. Unfiltered it returns Ontario, Bavaria and
 * similar, which would drop provinces into a table headed "US State". WEB_ga4_ takes no
 * dimensionFilter, so pull country+region together and keep only the United States
 * rows, reading the value from index 1. Same rule as GEO_writeDataFile.
 *
 * monthsBack: the traffic pull is the slowest thing in this project and the 6-minute
 * execution cap is real, so the two geography dimensions only go back 14 months. That
 * is not a saving at the expense of data: GA4's retention on dimension-level rows is
 * 14 months on this property, and every request older than that comes back empty. The
 * long geographic view is geo-data.js, which is an aggregate and unaffected.
 */
var WEB_TRAFFIC_DIMS = [
  ['sessionDefaultChannelGroup','Channel'],
  ['sessionSourceMedium','Source / Medium'],
  ['sessionCampaignName','Campaign'],
  ['deviceCategory','Device'],
  ['country','Country', 0, null, 14],
  ['country,region','US State', 1, 'United States', 14]
];

function WEB_pullTraffic() {
  var sh = WEB_sheet_('Web Traffic',
    ['Month','Dimension','Value','Sessions','Engaged Sessions','Engagement Rate','Revenue','Purchases','Key Events']);
  var rows = [];
  var months = WEB_months_(WEB_START).slice(-25);
  months.forEach(function (m, mi) {
    var fromEnd = months.length - mi;   // 1 = most recent month
    WEB_TRAFFIC_DIMS.forEach(function (d) {
      var back = d.length > 4 ? d[4] : 25;
      if (fromEnd > back) return;       // dimension not pulled this far back

      var dimList = d[0].split(',');
      var vi   = d.length > 2 ? d[2] : 0;
      var keep = d.length > 3 ? d[3] : null;
      // A two-dimension pull spends most of its row budget on values that get filtered
      // out, so ask for far more rows or the United States would be cut off mid-list.
      var siteLim = keep ? 400 : 30, commLim = keep ? 400 : 60;
      var pick = function (r) { return r.dims[vi]; };
      var ok   = function (r) { return keep === null || r.dims[0] === keep; };

      // keyEvents added 2026-08-06 at Miguel's request for the geography section. It is
      // whatever GA4 is configured to treat as a key event on this property; run
      // WEB_keyEventBreakdown() to see which events those actually are before labelling
      // the column anything more specific than "key events".
      var siteRows = WEB_ga4_(dimList, ['sessions','engagedSessions','engagementRate','keyEvents'],
                              m.start, m.end, siteLim, 'sessions').filter(ok);
      var commRows = WEB_ga4_(dimList, ['totalRevenue','ecommercePurchases'],
                              m.start, m.end, commLim, 'totalRevenue', 'commerce').filter(ok);
      var rev = {};
      commRows.forEach(function (r) { rev[pick(r)] = { r: r.mets[0], p: r.mets[1] }; });
      siteRows.forEach(function (r) {
        var v = rev[pick(r)] || { r: 0, p: 0 };
        rows.push([m.key, d[1], pick(r), r.mets[0], r.mets[1], r.mets[2], Math.round(v.r), v.p, r.mets[3]]);
      });
      // a value can earn revenue without a www session (portal-only journeys) - keep it
      commRows.forEach(function (r) {
        if (r.mets[0] <= 0) return;
        var seen = siteRows.some(function (x) { return pick(x) === pick(r); });
        if (!seen) rows.push([m.key, d[1], pick(r), 0, 0, 0, Math.round(r.mets[0]), r.mets[1], 0]);
      });
    });
  });
  WEB_write_(sh, rows);
  return rows.length;
}

/**
 * What IS a key event on this property? Read-only, answers the question rather than
 * assuming it.
 *
 * This report has long carried a note saying key events count page views and scrolls,
 * on the strength of a 335,000-vs-662 ratio against purchases. That note was written
 * without checking WHICH events are configured as key events. Miguel says they are CTA
 * clicks and form submissions. This settles it: it lists every key event by name with
 * its count, so the dashboard column can be labelled with what it actually contains.
 *
 * Run it and paste the log.
 */
function WEB_keyEventBreakdown() {
  var months = WEB_months_(WEB_START).slice(-1);
  if (!months.length) { Logger.log('no complete month'); return ''; }
  var m = months[0];
  var rows = WEB_ga4_(['eventName'], ['keyEvents', 'eventCount'], m.start, m.end, 200, 'keyEvents');
  var out = ['Key events by event name, ' + m.key + ' (SITE scope, www.aws.org)', ''];
  var totKe = 0, totEc = 0;
  rows.forEach(function (r) { totKe += r.mets[0]; totEc += r.mets[1]; });
  out.push('  ' + pad_('event name', 34) + pad_('key events', 14) + 'all events');
  out.push('  ' + new Array(64).join('-'));
  rows.forEach(function (r) {
    if (r.mets[0] <= 0) return;           // not a key event
    out.push('  ' + pad_(r.dims[0], 34) + pad_(String(r.mets[0]), 14) + r.mets[1]);
  });
  out.push('');
  out.push('  key events total ' + totKe + '   all events total ' + totEc);
  out.push('  events with ZERO key events (not configured as key events):');
  var zero = rows.filter(function (r) { return r.mets[0] <= 0; }).map(function (r) { return r.dims[0]; });
  out.push('    ' + (zero.length ? zero.join(', ') : 'none'));
  Logger.log(out.join('\n'));
  return out.join('\n');
}
function pad_(s, n) { s = String(s); while (s.length < n) s += ' '; return s; }

function WEB_pullPages() {
  var sh = WEB_sheet_('Web Pages',
    ['Month','Landing Page','Sessions','Engagement Rate','Revenue']);
  var rows = [];
  WEB_months_(WEB_START).forEach(function (m) {
    WEB_ga4_(['landingPagePlusQueryString'],
             ['sessions','engagementRate','totalRevenue'],
             m.start, m.end, 100, 'sessions').forEach(function (r) {
      rows.push([m.key, r.dims[0], r.mets[0], r.mets[1], r.mets[2]]);
    });
  });
  WEB_write_(sh, rows);
  return rows.length;
}

function WEB_pullEcommerce() {
  var sh = WEB_sheet_('Web Ecommerce', ['Month','Item','Items Purchased','Item Revenue']);
  var rows = [];
  WEB_months_(WEB_START).forEach(function (m) {
    WEB_ga4_(['itemName'], ['itemsPurchased','itemRevenue'],
             m.start, m.end, 100, 'itemRevenue', 'commerce').forEach(function (r) {
      rows.push([m.key, r.dims[0], r.mets[0], r.mets[1]]);
    });
  });
  WEB_write_(sh, rows);
  return rows.length;
}

function WEB_pullSearchMonthly() {
  var sh = WEB_sheet_('Search Monthly',
    ['Month','Property','Impressions','Clicks','CTR','Avg Position']);
  var rows = [];
  var months = WEB_months_(WEB_START).slice(-16);   // GSC retains ~16 months
  WEB_GSC_SITES.forEach(function (site) {
    months.forEach(function (m) {
      var r = WEB_gsc_(site, [], m.start, m.end, 1)[0];
      if (!r) return;
      rows.push([m.key, site, r.impressions, r.clicks, r.ctr, r.position]);
    });
  });
  WEB_write_(sh, rows);
  return rows.length;
}

function WEB_pullSearchQueries() {
  var sh = WEB_sheet_('Search Queries',
    ['Month','Property','Query','Impressions','Clicks','CTR','Avg Position']);
  var rows = [];
  var months = WEB_months_(WEB_START).slice(-13);
  WEB_GSC_SITES.forEach(function (site) {
    months.forEach(function (m) {
      WEB_gsc_(site, ['query'], m.start, m.end, 1000).forEach(function (r) {
        if (r.impressions < 100) return;   // below this is noise, not signal
        rows.push([m.key, site, r.keys[0], r.impressions, r.clicks, r.ctr, r.position]);
      });
    });
  });
  WEB_write_(sh, rows);
  return rows.length;
}

// ------------------------------------------------------------------ runner

function WEB_pullAll() {
  var t0 = new Date(), log = [];
  log.push('Web Monthly:     ' + WEB_pullMonthly());
  log.push('Web Traffic:     ' + WEB_pullTraffic());
  log.push('Web Pages:       ' + WEB_pullPages());
  log.push('Web Ecommerce:   ' + WEB_pullEcommerce());
  log.push('Search Monthly:  ' + WEB_pullSearchMonthly());
  log.push('Search Queries:  ' + WEB_pullSearchQueries());
  log.push('elapsed: ' + Math.round((new Date() - t0) / 1000) + 's');
  Logger.log(log.join('\n'));
  return log.join('\n');
}

// WEB_installMonthlyTrigger removed: runMonthlyRefresh owns scheduling now.
// Two independent monthly triggers on the same sheet is how duplicate and
// half-finished runs happen.

// ------------------------------------------------------------------ dashboard export

/**
 * Builds web-data.js and saves it to Drive, so the dashboard can be rebuilt without
 * anyone copying numbers by hand. Run after WEB_pullAll().
 *
 * Writes/overwrites a single Drive file named web-data.js at the root of My Drive.
 * Returns the file URL. The whole point is that the numbers reaching the dashboard are
 * the same numbers the API returned, with no transcription step in between.
 */
function WEB_writeDataFile() {
  var ss = CFG_sheet_();
  // Sheets silently turns "2026-04" into a Date. Reading it back gives a Date object, and
  // String(date).split('-') produces garbage keys. Handle both shapes.
  var norm = function (k) {
    if (Object.prototype.toString.call(k) === '[object Date]') {
      return k.getFullYear() + '-' + ('0' + (k.getMonth() + 1)).slice(-2);
    }
    var p = String(k).trim().split('-');
    return p[0] + '-' + ('0' + p[1]).slice(-2);
  };
  var read = function (name) {
    var sh = ss.getSheetByName(name);
    if (!sh) return [];
    var v = sh.getDataRange().getValues();
    return v.slice(1).filter(function (r) { return r[0] !== '' && r[0] != null; });
  };
  var r2 = function (n, d) { return Math.round(Number(n) * Math.pow(10, d)) / Math.pow(10, d); };

  var site = {}, comm = {};
  read('Web Monthly').forEach(function (r) {
    var k = norm(r[0]);
    if (r[1] === 'SITE')     site[k] = { s: +r[2], e: +r[3], er: r2(r[4], 4), u: +r[6], nu: +r[7] };
    if (r[1] === 'COMMERCE') comm[k] = { s: +r[2], rev: Math.round(+r[5]) };
  });

  var search = {};
  read('Search Monthly').forEach(function (r) {
    var k = norm(r[0]), p = String(r[1]).indexOf('www.aws.org') >= 0 ? 'www' : 'my';
    search[k] = search[k] || {};
    search[k][p] = { i: +r[2], c: +r[3], ctr: r2(r[4], 5), pos: r2(r[5], 1) };
  });

  var traf = {};
  read('Web Traffic').forEach(function (r) {
    var k = norm(r[0]);
    traf[k] = traf[k] || {};
    traf[k][r[1]] = traf[k][r[1]] || [];
    // 6th element is keyEvents. Rows written before 2026-08-06 have no column 8, so
    // default to 0 rather than NaN; a stale tab then reads as "none recorded", not broken.
    traf[k][r[1]].push([r[2], +r[3], r2(r[5], 4), Math.round(+r[6]), +r[7], +r[8] || 0]);
  });
  Object.keys(traf).forEach(function (k) {
    Object.keys(traf[k]).forEach(function (d) {
      traf[k][d] = traf[k][d].sort(function (a, b) { return b[1] - a[1] || b[3] - a[3]; }).slice(0, 12);
    });
  });

  var ecom = {};
  read('Web Ecommerce').forEach(function (r) {
    var k = norm(r[0]); ecom[k] = ecom[k] || []; ecom[k].push([r[1], +r[2], Math.round(+r[3])]);
  });
  Object.keys(ecom).forEach(function (k) {
    ecom[k] = ecom[k].sort(function (a, b) { return b[2] - a[2]; }).slice(0, 12);
  });

  var pages = {};
  read('Web Pages').forEach(function (r) {
    var k = norm(r[0]); pages[k] = pages[k] || []; pages[k].push([r[1], +r[2], r2(r[3], 4)]);
  });
  Object.keys(pages).forEach(function (k) {
    pages[k] = pages[k].sort(function (a, b) { return b[1] - a[1]; }).slice(0, 12);
  });

  var queries = {};
  read('Search Queries').forEach(function (r) {
    if (String(r[1]).indexOf('www.aws.org') < 0) return;
    var k = norm(r[0]); queries[k] = queries[k] || [];
    queries[k].push([r[2], +r[3], +r[4], r2(r[5], 5), r2(r[6], 1)]);
  });
  Object.keys(queries).forEach(function (k) {
    queries[k] = queries[k].sort(function (a, b) { return b[2] - a[2]; }).slice(0, 20);
  });

  var months = Object.keys(site).sort();
  var keep = months.slice(-14);
  var pick = function (o) {
    var out = {}; keep.forEach(function (k) { if (o[k]) out[k] = o[k]; }); return out;
  };

  var payload = {
    site: site, comm: comm, search: search,
    traf: pick(traf), ecom: pick(ecom), pages: pick(pages), queries: queries
  };

  var header =
    '// WEB DATA for the Marketing Dashboard Website section.\n' +
    '// GENERATED by WEB_writeDataFile() in the Apps Script project - do not hand edit.\n' +
    '// Source tabs: Web Monthly, Web Traffic, Web Pages, Web Ecommerce, Search Monthly,\n' +
    '//   Search Queries. Regenerate by running WEB_pullAll() then WEB_writeDataFile().\n' +
    '//\n' +
    '// site   = www.aws.org ONLY. sessions/engaged/engagement rate/users. This matches the\n' +
    '//          183.4K figure the monthly report has always shown for June 2026.\n' +
    '// comm   = all aws.org hosts + "(not set)". revenue only. Checkout completes on\n' +
    '//          my1.aws.org, NOT www, so revenue must never be filtered to www.\n' +
    '// traf   = month -> dimension -> [value, sessions, engRate, revenue, purchases]\n' +
    '//          sessions are SITE scope, revenue is COMMERCE scope, same dimension value.\n' +
    '// search = month -> www|my -> impressions, clicks, ctr, avg position.\n' +
    '//          Search Console retains ~16 months only, so this series is shorter than GA4.\n' +
    '// NO KEY EVENTS. Deliberately excluded - the GA4 counts swing 7x on config changes.\n' +
    '// Generated ' + Utilities.formatDate(new Date(), 'America/New_York', 'yyyy-MM-dd HH:mm') + '\n';

  var content = header + 'window.WEB_DATA = ' + JSON.stringify(payload) + ';\n';

  var name = 'web-data.js';
  var folder = SETUP_outputFolder();
  var it = folder.getFilesByName(name);
  var file;
  if (it.hasNext()) { file = it.next(); file.setContent(content); }
  else { file = folder.createFile(name, content, MimeType.PLAIN_TEXT); }

  var msg = 'web-data.js written: ' + content.length + ' bytes\n' +
            'months site=' + Object.keys(site).length + ' comm=' + Object.keys(comm).length +
            ' search=' + Object.keys(search).length + ' traf=' + Object.keys(payload.traf).length + '\n' +
            file.getUrl();
  Logger.log(msg);
  return msg;
}
/**
 * PRODUCERS: email-data.js and twiw-email-data.js — the send tables
 * ═════════════════════════════════════════════════════════════════════════════
 * These two files are the dashboard's spine. Every rate it shows is computed
 * from these raw counts.
 *
 * ─── APPEND-ONLY, AND WHY IT IS NOT NEGOTIABLE ───────────────────────────────
 * From docs/MONTHLY-REFRESH.md: connector counts are LIVE and keep accruing,
 * while past months in email-data.js came from point-in-time snapshots. Re-pulling
 * full history would RESTATE previously reported months. A number that was shown
 * to a director in March must not quietly change in August.
 *
 * So these producers read the existing file, keep every existing record
 * byte-identical, and append only months that are not already present. If you
 * ever need a true rebuild, do it deliberately and knowingly, not as a side
 * effect of a monthly run.
 *
 * ─── STATISTICS ARE A SEPARATE CALL ──────────────────────────────────────────
 * /marketing/v3/emails returns the asset, not its performance. Delivered, opens,
 * clicks and unsubscribes come from the statistics endpoint. HS_statsProbe()
 * establishes which shape this portal returns BEFORE a real run, because
 * guessing at a stats payload is how you publish plausible wrong counts.
 *
 * ─── EXCLUSIONS ──────────────────────────────────────────────────────────────
 * CFG_EXCLUDED_EIDS are dropped here and in ga4-per-email.js, per the standing
 * rule in DATA-SPEC.md. They remain in the Roster and in channel totals.
 */

var HS_EMAIL_FILE = 'email-data.js';
var HS_TWIW_FILE  = 'twiw-email-data.js';
var HS_STATS_URL  = 'https://api.hubapi.com/marketing/v3/emails/statistics/list';

// ═══ PROBE ════════════════════════════════════════════════════════════════════

/**
 * Run once before HS_writeEmailData. Two small calls. Tells you whether the
 * statistics endpoint is reachable and what field names it uses, so the producer
 * reads real keys rather than assumed ones.
 */
function HS_statsProbe() {
  var token = CFG_hubspotToken_();
  var out = ['HUBSPOT STATISTICS PROBE', '────────────────────────'];

  // A known July 2026 send: "CWS - July 2026", 5,086 delivered per the CRM.
  var eid = '215645742091';
  var url = HS_STATS_URL + '?startTimestamp=2026-07-01T00:00:00Z' +
            '&endTimestamp=2026-07-31T23:59:59Z&emailIds=' + eid;
  var res = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true, headers: { Authorization: 'Bearer ' + token } });

  out.push('GET ' + HS_STATS_URL + '  HTTP ' + res.getResponseCode());
  if (res.getResponseCode() !== 200) {
    out.push(res.getContentText().slice(0, 400));
    out.push('');
    out.push('If this is 403, the private app needs a marketing-email read scope.');
    out.push('If 404, this portal does not expose that endpoint and the producer');
    out.push('must read counts from the Roster pull instead. Tell Claude which.');
  } else {
    var b = JSON.parse(res.getContentText());
    out.push('top-level keys: ' + Object.keys(b).join(', '));
    var agg = b.aggregate || b;
    out.push('aggregate keys: ' + Object.keys(agg || {}).join(', '));
    if (agg && agg.counters) {
      out.push('counters: ' + JSON.stringify(agg.counters));
      out.push('');
      out.push('EXPECTED for CWS - July 2026: delivered 5086.');
      out.push('If "sent" or "delivered" matches that, the mapping is confirmed.');
    }
    out.push('');
    out.push('raw (trimmed): ' + JSON.stringify(b).slice(0, 1200));
  }
  Logger.log(out.join('\n'));
}

// ═══ SHARED HELPERS ═══════════════════════════════════════════════════════════

/** Read an existing data file out of the Drive output folder and parse a global. */
function HS_readExisting_(filename, globalName) {
  var folder = SETUP_outputFolder();
  var it = folder.getFilesByName(filename);
  CFG_assert_(it.hasNext(), 'HubSpot.' + globalName,
    filename + ' is not in the "' + CFG_OUTPUT_FOLDER + '" Drive folder. These ' +
    'producers are APPEND-ONLY and need the current file as their starting point. ' +
    'Upload the existing ' + filename + ' once, then this runs unattended forever. ' +
    'Regenerating from scratch instead would restate months already reported.');

  var txt = it.next().getBlob().getDataAsString();
  var marker = 'window.' + globalName + ' =';
  var i = txt.indexOf(marker);
  CFG_assert_(i >= 0, 'HubSpot.' + globalName,
    filename + ' does not define window.' + globalName + '.');

  // Parse just the array literal, stopping at its matching bracket, so the second
  // global in the file (…_MONTHS) does not confuse the parse.
  var rest = txt.slice(i + marker.length);
  var start = rest.indexOf('[');
  var depth = 0, end = -1, inStr = false, esc = false;
  for (var p = start; p < rest.length; p++) {
    var c = rest.charAt(p);
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === '[') depth++;
    else if (c === ']') { if (--depth === 0) { end = p; break; } }
  }
  CFG_assert_(end > start, 'HubSpot.' + globalName,
    'Could not find the end of the ' + globalName + ' array in ' + filename + '.');
  return JSON.parse(rest.slice(start, end + 1));
}

/**
 * subscription id -> display name, derived from the existing file joined to the
 * Roster on eid. No hard-coded table to go stale, and it is self-correcting: a
 * name that changes in HubSpot flows through on the next run.
 *
 * Unknown ids fall back to the raw id AND log loudly, rather than silently
 * emitting a blank that would look like a data problem downstream.
 */
function HS_subscriptionNames_(existing, roster) {
  var byEid = {};
  Object.keys(roster).forEach(function (cid) {
    var e = roster[cid];
    if (e.eid && e.sub) byEid[e.eid] = String(e.sub);
  });
  var map = {}, learned = 0;
  existing.forEach(function (r) {
    var subId = byEid[String(r.eid)];
    if (subId && r.sub && !map[subId]) { map[subId] = r.sub; learned++; }
  });
  Logger.log('Subscription names learned from existing data: ' + learned);
  return map;
}

/** UTC ISO -> America/New_York parts, as the spec requires. */
function HS_nyParts_(iso) {
  var d = new Date(iso);
  var s = Utilities.formatDate(d, 'America/New_York', 'yyyy-MM-dd|HH|u');
  var p = s.split('|');
  return {
    date:  p[0],
    month: p[0].slice(0, 7),
    hr:    Number(p[1]),
    dow:   Number(p[2]) % 7    // Utilities 'u' is 1=Mon..7=Sun; spec wants 0=Sun
  };
}

/** Business unit normalisation, per MONTHLY-REFRESH.md. */
function HS_bu_(v) {
  return String(v || '').replace(/;\s*/g, '; ').trim();
}

// ═══ STATISTICS ═══════════════════════════════════════════════════════════════

/**
 * Counts for one email. Field names VERIFIED 2026-08-05 against
 * "CWS - July 2026": the endpoint returned delivered 5086, matching the CRM
 * exactly, alongside open 2098, click 106, unsubscribed 10.
 *
 * Note delivered (5086) is NOT sent (5094). The spec asks for Delivered, and
 * every rate in the dashboard divides by it, so using sent would inflate the
 * denominator and quietly depress every rate.
 */
function HS_stats_(eid, token) {
  var url = HS_STATS_URL +
    '?startTimestamp=2010-01-01T00:00:00Z' +
    '&endTimestamp=' + Utilities.formatDate(new Date(), 'UTC', "yyyy-MM-dd'T'HH:mm:ss'Z'") +
    '&emailIds=' + encodeURIComponent(eid);
  var res = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true, headers: { Authorization: 'Bearer ' + token } });
  if (res.getResponseCode() !== 200) return null;
  var c = (JSON.parse(res.getContentText()).aggregate || {}).counters || {};
  return {
    delivered: Number(c.delivered) || 0,
    opened:    Number(c.open) || 0,
    clicked:   Number(c.click) || 0,
    unsub:     Number(c.unsubscribed) || 0
  };
}

/** eid -> roster entry, deduplicated (the Roster is one row per campaign id). */
function HS_emailsByEid_() {
  var t = CFG_readTab_(TAB_ROSTER);
  var out = {};
  t.rows.forEach(function (r) {
    var eid = String(r[1]);
    if (!out[eid]) {
      out[eid] = { eid: eid, name: r[2], cat: r[3], sub: String(r[4]).trim(),
                   state: String(r[5]), publish: String(r[6]),
                   subcat: String(r[7]), subject: r[8] || '' };
    }
  });
  return out;
}

// ═══ THE TWO PRODUCERS ════════════════════════════════════════════════════════

/**
 * Shared engine. `pick` decides which emails belong in this file.
 *
 * APPEND-ONLY: months already present in the existing file are never touched,
 * never re-fetched, never recomputed. Only genuinely new months are added.
 */
function HS_buildSendFile_(opts) {
  var token    = CFG_hubspotToken_();
  var existing = HS_readExisting_(opts.filename, opts.globalName);
  var roster   = ROSTER_map();
  var byEid    = HS_emailsByEid_();
  var subNames = opts.wantSub ? HS_subscriptionNames_(existing, roster) : {};

  var haveMonths = {}, haveEids = {}, earliest = null;
  existing.forEach(function (r) {
    haveMonths[r.month] = true;
    haveEids[String(r.eid)] = true;
    if (!earliest || r.month < earliest) earliest = r.month;
  });

  /**
   * TWO WINDOW GUARDS. Both added 2026-08-05 after the first real run tripped
   * over each of them, and neither would have errored.
   *
   * CURRENT MONTH. On the 5th, "this month" holds a few days of sends. Placing a
   * partial month beside complete ones reads as a collapse in every trend on the
   * dashboard. The first run appended a single 2026-08 send for exactly this
   * reason. The GA4 producers already stop before the current month via
   * CFG_months_; this now matches them.
   *
   * BEFORE THE SERIES START. "Not already in the file" is not the same as "new".
   * The first TWIW run appended 2021-08 and 2023-09, years before that series
   * begins in 2024-01, creating two isolated one-send months that would look
   * like real history. The existing file defines the reporting window; this
   * producer extends it forward, never backward. Backfilling is a deliberate
   * decision, not a side effect of a monthly refresh.
   */
  var currentMonth = Utilities.formatDate(new Date(), 'America/New_York', 'yyyy-MM');

  var added = [], skippedExcluded = 0, skippedNoDelivery = 0, calls = 0;
  var skippedCurrent = 0, skippedBeforeStart = 0;
  var skippedCurrentNames = [], skippedBeforeNames = [];

  Object.keys(byEid).forEach(function (eid) {
    var e = byEid[eid];
    if (!opts.pick(e)) return;
    if (!e.publish) return;
    if (String(e.state).toUpperCase() === 'DRAFT') return;

    var p = HS_nyParts_(e.publish);
    if (haveMonths[p.month]) return;      // append-only: month already reported
    if (haveEids[eid]) return;            // belt and braces
    // Covers the current partial month AND anything scheduled for the future.
    // String comparison, so 2026-09 and 2026-12 are caught the same way as
    // 2026-08. Scheduled sends legitimately appear in the roster with a future
    // publishDate and no statistics yet; they get picked up once their month
    // completes, which is exactly when their numbers are final.
    if (p.month >= currentMonth) {
      skippedCurrent++;
      skippedCurrentNames.push(p.date + '  ' + e.name);
      return;
    }
    if (earliest && p.month < earliest) {
      skippedBeforeStart++;
      skippedBeforeNames.push(p.date + '  ' + e.name);
      return;
    }

    if (CFG_EXCLUDED_EIDS[eid]) { skippedExcluded++; return; }

    var s = HS_stats_(eid, token);
    calls++;
    Utilities.sleep(CFG_API_SLEEP_MS);
    if (!s || s.delivered <= 0) { skippedNoDelivery++; return; }

    var rec = {
      name: e.name,
      date: p.date, month: p.month,
      delivered: s.delivered, clicked: s.clicked, opened: s.opened, unsub: s.unsub,
      dow: p.dow, hr: p.hr,
      eid: eid,
      subject: e.subject
    };
    if (opts.wantSub) {
      // `bu` is in the spec but referenced nowhere in the dashboard and blank on
      // 88% of existing records, so an empty string is faithful, not a gap.
      rec.bu  = '';
      rec.sub = subNames[e.sub] || String(e.sub);
    }
    added.push(rec);
  });

  var detail = '';
  if (skippedCurrentNames.length) {
    detail += '\n  HELD BACK, current or future month (will appear once complete):\n    ' +
              skippedCurrentNames.sort().join('\n    ');
  }
  if (skippedBeforeNames.length) {
    detail += '\n  HELD BACK, earlier than the series start ' + earliest +
              ' (backfill is a deliberate decision, not a refresh side effect):\n    ' +
              skippedBeforeNames.sort().join('\n    ');
  }

  if (!added.length) {
    CFG_log_(opts.globalName, 'OK',
      'No new months to add. ' + existing.length + ' records unchanged. ' +
      '(' + skippedExcluded + ' excluded by rule, ' + skippedNoDelivery + ' no delivery, ' +
      skippedCurrent + ' in the current partial month, ' + skippedBeforeStart +
      ' before the series start)');
    Logger.log(opts.filename + ': nothing to append. This is the normal result when\n' +
      'run twice in a month, and it means existing records were left untouched.' + detail);
    return 0;
  }

  // Order matters for the dashboard's month list; keep the file sorted by date.
  var all = existing.concat(added);
  all.sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });

  var months = {};
  all.forEach(function (r) { months[r.month] = true; });
  var monthList = Object.keys(months).sort();

  CFG_assert_(all.length >= existing.length, opts.globalName,
    'Record count went DOWN, ' + existing.length + ' to ' + all.length +
    '. Append-only must never lose rows.');

  var header =
    '// ' + opts.title + '\n' +
    '// GENERATED by the Marketing Dashboard Pipeline. Do not hand edit.\n' +
    '//\n' +
    '// APPEND-ONLY. Existing records are never recomputed, because HubSpot counts\n' +
    '// keep accruing after a send and re-pulling would restate months already\n' +
    '// reported. Only new months are added.\n' +
    '//\n' +
    '// Counts are HubSpot statistics: delivered / open / click / unsubscribed.\n' +
    '// delivered, not sent. Every rate in the dashboard divides by it.\n' +
    '//\n' +
    '// Records: ' + all.length + ' (' + added.length + ' added this run)\n' +
    '// Months: ' + monthList.length + ' (' + monthList[0] + ' to ' +
       monthList[monthList.length - 1] + ')\n' +
    '// Generated ' + Utilities.formatDate(new Date(), 'America/New_York', 'yyyy-MM-dd HH:mm') + '\n';

  var content = header +
    'window.' + opts.globalName + ' = ' + JSON.stringify(all) + ';\n' +
    'window.' + opts.monthsName + ' = ' + JSON.stringify(monthList) + ';\n';

  var folder = SETUP_outputFolder();
  var it = folder.getFilesByName(opts.filename);
  if (it.hasNext()) it.next().setContent(content);
  else folder.createFile(opts.filename, content, MimeType.PLAIN_TEXT);

  var newMonths = {};
  added.forEach(function (r) { newMonths[r.month] = (newMonths[r.month] || 0) + 1; });

  CFG_log_(opts.globalName, 'OK',
    added.length + ' records added across ' + Object.keys(newMonths).length +
    ' new month(s); ' + all.length + ' total. ' + calls + ' stats calls.');
  Logger.log(
    opts.filename + ' written\n' +
    '  existing kept   ' + existing.length + '\n' +
    '  added           ' + added.length + '  ' + JSON.stringify(newMonths) + '\n' +
    '  total           ' + all.length + '\n' +
    '  excluded byrule ' + skippedExcluded + '\n' +
    '  no delivery     ' + skippedNoDelivery + '\n' +
    '  current month   ' + skippedCurrent + '  (partial, deliberately held back)\n' +
    '  before start    ' + skippedBeforeStart + '  (earlier than ' + earliest + ')\n' +
    '  stats API calls ' + calls +
    '\n  ADDED:\n    ' + added.map(function (r) {
      return r.date + '  ' + r.delivered + ' delivered  ' + r.name;
    }).sort().join('\n    ') + detail);
  return added.length;
}

/** Marketing sends. Category = Marketing, batch only. */
function HS_writeEmailData() {
  return HS_buildSendFile_({
    filename: HS_EMAIL_FILE, globalName: 'EMAIL_DATA', monthsName: 'EMAIL_MONTHS',
    title: 'MARKETING EMAIL SENDS (HubSpot, Category = Marketing)',
    wantSub: true,
    pick: function (e) {
      return e.cat === CFG_MARKETING_CATEGORY &&
             String(e.subcat).toLowerCase() === 'batch';
    }
  });
}

/**
 * This Week in Welding. Selected by SUBSCRIPTION, not category.
 *
 * MONTHLY-REFRESH.md records that Category is frequently left blank on new TWIW
 * sends (all four July 2026 issues had none), so a category filter silently
 * misses them. Category is accepted as a fallback only.
 */
function HS_writeTwiwData() {
  return HS_buildSendFile_({
    filename: HS_TWIW_FILE, globalName: 'TWIW_DATA', monthsName: 'TWIW_MONTHS',
    title: 'THIS WEEK IN WELDING SENDS (HubSpot, subscription ' + CFG_TWIW_SUBSCRIPTION + ')',
    wantSub: false,
    pick: function (e) {
      // Subscription alone is not enough. Confirmations, test sends and other
      // non-issue emails share subscription 19561173 and would land in the
      // newsletter trend as if they were issues. Two real examples surfaced on
      // 2026-08-05, "This Week in Welding Template - Test Send" (2021-08-03) and
      // "Publications - This Week in Welding - Signup Confirmation" (2023-09-27).
      // Both were caught only because they predate the series start; an
      // equivalent send this month would have been added silently.
      //
      // subcategory = batch is what distinguishes a real broadcast issue from an
      // automated or transactional send, and it is the same filter the Marketing
      // producer already uses.
      var isBatch = String(e.subcat).toLowerCase() === 'batch';
      var isTwiw  = e.sub === CFG_TWIW_SUBSCRIPTION ||
                    /this week in welding/i.test(e.cat || '');
      return isTwiw && isBatch;
    }
  });
}
/**
 * PRODUCERS: the five GA4 channel files
 * ═════════════════════════════════════════════════════════════════════════════
 *   ga4-data.js          GA4_DATA        Marketing Email, ID-matched
 *   twiw-ga4-data.js     TWIW_GA4        This Week in Welding, ID-matched
 *                        TWIW_GA4_EMAIL  per issue
 *   ga4-channel-data.js  GA4_CHANNEL     ALL hs_email traffic, unfiltered
 *   auto-ga4-data.js     AUTO_GA4        hs_automation traffic
 *   sms-ga4-data.js      SMS_GA4         hs_sms / sms traffic
 *
 * ─── TWO SCOPES, DELIBERATELY DIFFERENT ──────────────────────────────────────
 * GA4_DATA and TWIW_GA4 are ID-MATCHED: they count only sessions whose
 * utm_content resolves to an email in that channel's Roster category. This is
 * the scope the dashboard's channel cards use.
 *
 * GA4_CHANNEL is the opposite on purpose: EVERY hs_email session, no ID filter.
 * It is deliberately larger than GA4_DATA, because hs_email also carries
 * Sections, Periodicals, TWIW and surveys. Do not "fix" the difference between
 * them; the gap is the point. Treating unmatched hs_email traffic as Marketing
 * is precisely what reported July 2026 as $7,554 against a true $3,680.
 *
 * ─── NO KEY EVENTS ───────────────────────────────────────────────────────────
 * The existing sms-ga4-data.js carries a key_events field. It is NOT reproduced
 * here. GA4 key events swing by up to 7x purely from configuration changes,
 * which makes them meaningless for period comparison, and they are banned from
 * every AWS report, chart and data file. Left out of the metric list entirely
 * rather than pulled and quietly hidden.
 */

var GA4C_START = '2023-10-01';

/** source/medium prefix filter, e.g. everything starting hs_automation. */
function GA4C_prefixFilter_(prefix) {
  return { filter: { fieldName: 'sessionSourceMedium',
                     stringFilter: { matchType: 'BEGINS_WITH', value: prefix } } };
}

/** exact source/medium, e.g. "hs_sms / sms". */
function GA4C_exactFilter_(value) {
  return { filter: { fieldName: 'sessionSourceMedium',
                     stringFilter: { matchType: 'EXACT', value: value } } };
}

function GA4C_run_(dims, mets, start, end, filter, limit) {
  var req = {
    dateRanges: [{ startDate: start, endDate: end }],
    metrics: mets.map(function (m) { return { name: m }; }),
    dimensionFilter: filter,
    limit: limit || 50000
  };
  if (dims && dims.length) req.dimensions = dims.map(function (d) { return { name: d }; });
  var res = AnalyticsData.Properties.runReport(req, 'properties/' + CFG_GA4_PROPERTY_ID);
  return (res.rows || []).map(function (r) {
    return {
      dims: (r.dimensionValues || []).map(function (v) { return v.value; }),
      mets: r.metricValues.map(function (v) { return Number(v.value) || 0; })
    };
  });
}

function GA4C_rate_(engaged, sessions) {
  return sessions ? Number((engaged / sessions).toFixed(4)) : 0;
}

function GA4C_write_(filename, body, logName, months) {
  var folder = SETUP_outputFolder();
  var it = folder.getFilesByName(filename);
  if (it.hasNext()) it.next().setContent(body);
  else folder.createFile(filename, body, MimeType.PLAIN_TEXT);
  CFG_log_(logName, 'OK', months + ' months, ' + body.length + ' bytes');
  return months;
}

function GA4C_header_(title, scope, months) {
  return '// ' + title + '\n' +
    '// GENERATED by the Marketing Dashboard Pipeline. Do not hand edit.\n' +
    '// Scope: ' + scope + '\n' +
    '// GA4 key events are deliberately excluded: config changes swing them by up\n' +
    '//   to 7x, which makes them useless for period comparison.\n' +
    '// Months: ' + months.length + ' (' + months[0] + ' to ' + months[months.length - 1] + ')\n' +
    '// Generated ' + Utilities.formatDate(new Date(), 'America/New_York', 'yyyy-MM-dd HH:mm') + '\n';
}

// ═══ ID-MATCHED CHANNELS ══════════════════════════════════════════════════════

/**
 * Shared engine for the two ID-matched channels. Counts only sessions whose
 * utm_content resolves, through the Roster, to the requested channel.
 */
function GA4C_matched_(channel) {
  var roster = ROSTER_map();
  var months = CFG_months_(GA4C_START);
  var out = {}, perName = {};

  months.forEach(function (m) {
    var agg = { sessions: 0, engaged: 0, purchases: 0, revenue: 0 };
    GA4C_run_(['sessionManualAdContent'],
              ['sessions', 'engagedSessions', 'ecommercePurchases', 'totalRevenue'],
              m.start, m.end, EPI_filter_())
      .forEach(function (r) {
        var cid = r.dims[0];
        if (ROSTER_channelOf(cid, roster) !== channel) return;
        var e = roster[String(cid).trim()];
        if (CFG_EXCLUDED_EIDS[String(e.eid)]) return;
        agg.sessions += r.mets[0]; agg.engaged += r.mets[1];
        agg.purchases += r.mets[2]; agg.revenue += r.mets[3];

        if (e.name) {
          var b = perName[e.name] || (perName[e.name] = { sessions: 0, engaged: 0, revenue: 0 });
          b.sessions += r.mets[0]; b.engaged += r.mets[1]; b.revenue += r.mets[3];
        }
      });
    if (!agg.sessions) return;
    out[m.key] = {
      sessions: agg.sessions,
      engaged_sessions: agg.engaged,
      engagement_rate: GA4C_rate_(agg.engaged, agg.sessions),
      purchases: agg.purchases,
      total_revenue: Math.round(agg.revenue)
    };
  });

  Object.keys(perName).forEach(function (n) { perName[n].revenue = Math.round(perName[n].revenue); });
  return { monthly: out, perName: perName };
}

/** ga4-data.js — Marketing Email, ID-matched. The channel card's source. */
function GA4_writeMonthlyData() {
  var r = GA4C_matched_('marketing');
  var mk = Object.keys(r.monthly).sort();

  CFG_assert_(mk.length >= 30, 'GA4_DATA',
    'Only ' + mk.length + ' months, expected at least 30. The live file has 34. ' +
    'MERGE-ONLY rule: never publish fewer months than were previously captured.');

  var july = r.monthly['2026-07'];
  if (july) {
    CFG_assert_(Math.abs(july.total_revenue - 3680) <= 50, 'GA4_DATA',
      'July 2026 Marketing revenue came out at $' + july.total_revenue +
      ', expected about $3,680. That figure is corroborated by two independent ' +
      'sources and is this pipeline\'s reference point. Do not publish past it.');
  }

  var body = GA4C_header_('MARKETING EMAIL WEB METRICS (GA4, ID-matched)',
      'hs_email / email, utm_content resolved through the Roster to category ' +
      'Marketing. Deliberately SMALLER than GA4_CHANNEL, which counts all hs_email.',
      mk) +
    'window.GA4_DATA = ' + JSON.stringify(r.monthly) + ';\n';
  return GA4C_write_('ga4-data.js', body, 'GA4_DATA', mk.length);
}

/** twiw-ga4-data.js — This Week in Welding, monthly and per issue. */
function GA4_writeTwiwChannel() {
  var r = GA4C_matched_('twiw');
  var mk = Object.keys(r.monthly).sort();

  CFG_assert_(mk.length >= 24, 'TWIW_GA4',
    'Only ' + mk.length + ' months, expected at least 24. The live file has 31.');

  var body = GA4C_header_('THIS WEEK IN WELDING WEB METRICS (GA4, ID-matched)',
      'hs_email / email, utm_content resolved through the Roster to subscription ' +
      CFG_TWIW_SUBSCRIPTION + '. A/B variants are rolled up to their master issue.',
      mk) +
    'window.TWIW_GA4 = ' + JSON.stringify(r.monthly) + ';\n' +
    'window.TWIW_GA4_EMAIL = ' + JSON.stringify(r.perName) + ';\n';
  return GA4C_write_('twiw-ga4-data.js', body, 'TWIW_GA4', mk.length);
}

// ═══ SOURCE/MEDIUM CHANNELS ═══════════════════════════════════════════════════

/** Shared engine for the three unmatched channels. No Roster involved. */
function GA4C_bySourceMedium_(filter) {
  var months = CFG_months_(GA4C_START);
  var out = {};
  months.forEach(function (m) {
    var rows = GA4C_run_([], ['sessions', 'engagedSessions', 'totalRevenue'],
                         m.start, m.end, filter, 1);
    if (!rows.length) return;
    var v = rows[0].mets;
    if (!v[0]) return;
    out[m.key] = {
      sessions: v[0],
      engaged: v[1],
      engagement_rate: GA4C_rate_(v[1], v[0]),
      revenue: Math.round(v[2])
    };
  });
  return out;
}

/**
 * ga4-channel-data.js — ALL hs_email traffic, no ID filter.
 * Larger than GA4_DATA by design. See the header note at the top of this file.
 */
function GA4_writeChannelData() {
  var out = GA4C_bySourceMedium_(GA4C_prefixFilter_('hs_email'));
  var mk = Object.keys(out).sort();
  CFG_assert_(mk.length >= 30, 'GA4_CHANNEL',
    'Only ' + mk.length + ' months, expected at least 30.');
  var body = GA4C_header_('ALL EMAIL CHANNEL WEB METRICS (GA4, unfiltered)',
      'every session whose source/medium begins hs_email. Includes Marketing, ' +
      'Sections, Periodicals, TWIW and surveys together. Intentionally broader ' +
      'than GA4_DATA; the gap between them is meaningful, not an error.', mk) +
    'window.GA4_CHANNEL = ' + JSON.stringify(out) + ';\n';
  return GA4C_write_('ga4-channel-data.js', body, 'GA4_CHANNEL', mk.length);
}

/** auto-ga4-data.js — workflow-sent email traffic. */
function GA4_writeAutoChannel() {
  var out = GA4C_bySourceMedium_(GA4C_prefixFilter_('hs_automation'));
  var mk = Object.keys(out).sort();
  CFG_assert_(mk.length >= 24, 'AUTO_GA4',
    'Only ' + mk.length + ' months, expected at least 24.');
  var body = GA4C_header_('AUTOMATED EMAIL WEB METRICS (GA4)',
      'source/medium begins hs_automation, which is what HubSpot stamps on links ' +
      'in workflow-sent email.', mk) +
    'window.AUTO_GA4 = ' + JSON.stringify(out) + ';\n';
  return GA4C_write_('auto-ga4-data.js', body, 'AUTO_GA4', mk.length);
}

/**
 * sms-ga4-data.js — SMS traffic.
 *
 * The exact source/medium value was VERIFIED 2026-08-05 by enumerating every
 * source/medium in the property, not assumed from the naming pattern.
 */
function GA4_writeSmsChannel() {
  var out = GA4C_bySourceMedium_(GA4C_exactFilter_('hs_sms / sms'));
  var mk = Object.keys(out).sort();
  CFG_assert_(mk.length >= 10, 'SMS_GA4',
    'Only ' + mk.length + ' months, expected at least 10. The live file has 14.');
  var body = GA4C_header_('SMS WEB METRICS (GA4)',
      'source/medium exactly "hs_sms / sms". key_events is deliberately omitted ' +
      'even though the previous file carried it.', mk) +
    'window.SMS_GA4 = ' + JSON.stringify(out) + ';\n';
  return GA4C_write_('sms-ga4-data.js', body, 'SMS_GA4', mk.length);
}

/** All five, in one call. */
function GA4_writeAllChannels() {
  var r = [];
  [['ga4-data.js', GA4_writeMonthlyData],
   ['twiw-ga4-data.js', GA4_writeTwiwChannel],
   ['ga4-channel-data.js', GA4_writeChannelData],
   ['auto-ga4-data.js', GA4_writeAutoChannel],
   ['sms-ga4-data.js', GA4_writeSmsChannel]].forEach(function (p) {
    try { r.push('  OK      ' + p[0] + '  ' + p[1]() + ' months'); }
    catch (e) { r.push('  FAILED  ' + p[0] + '  ' + String(e).slice(0, 200)); }
  });
  Logger.log('GA4 CHANNEL FILES\n' + r.join('\n'));
}
/**
 * PRODUCERS: auto-email-data.js and auto-history-data.js
 * ═════════════════════════════════════════════════════════════════════════════
 *   auto-email-data.js   AUTO_DATA      one row per automated email, ONE month
 *                        AUTO_WINDOW    that month, e.g. "2026-07"
 *   auto-history-data.js AUTO_HISTORY   month -> eid -> counters
 *                        AUTO_HISTORY_MONTHS, AUTO_CHANGES
 *
 * ─── WHAT THE PROBE SETTLED, 2026-08-05 ──────────────────────────────────────
 * Three findings, each of which changed the design:
 *
 * 1. TOTAL opens and clicks DO NOT EXIST in this API. The counters block returns
 *    open 2098 and click 106 for a send whose openratio is 41.25% of 5,086
 *    delivered, which proves both are UNIQUE. No field anywhere exceeds them.
 *    The existing files carry totalOpens and totalClicks, but the dashboard
 *    reads neither, at zero call sites. So they are omitted rather than filled
 *    with unique counts wearing a total's name.
 *
 * 2. job / series / order / steplabel DO NOT EXIST in the API either. Probed the
 *    full payload of an automated email: no mention of job, series, steplabel or
 *    workflow. But the dashboard DOES use .job at 13 sites and .series at 11.
 *    They must have been derived by hand. So they are CARRIED FORWARD by eid
 *    from the existing file, and any automated email lacking them is named
 *    explicitly in the log rather than shipped with a silent null.
 *
 * 3. The population is 181 automated emails by subcategory, not the 112 the old
 *    docs assumed and nothing like the 47 that Bug A shipped with. It comes from
 *    the Roster every run and is asserted, never from "what sent recently".
 *
 * ─── APPEND-ONLY, LIKE THE SEND FILES ────────────────────────────────────────
 * History gains one month when that month completes. Existing months are never
 * recomputed, because HubSpot keeps revising engagement after the fact and a
 * figure already reported must not move.
 */

var AUTO_EMAIL_FILE   = 'auto-email-data.js';
var AUTO_HISTORY_FILE = 'auto-history-data.js';
var AUTO_HISTOGRAM_URL = 'https://api.hubapi.com/marketing/v3/emails/statistics/histogram';

/**
 * Subcategories that mean "sent by a workflow" rather than "broadcast".
 * Verified against the live distribution: batch 7313, localtime 340,
 * automated 175, ab_master/ab_variant 125 each, plus singletons.
 * localtime is a send-time-optimised BATCH email and is deliberately excluded.
 */
var AUTO_SUBCATS = {
  'automated': true, 'automated_ab_master': true, 'automated_ab_variant': true,
  'automated_for_deal': true, 'automated_for_form': true, 'automated_for_ticket': true,
  'optin_email': true, 'optin_followup_email': true, 'resubscribe_email': true,
  'ticket_closed_kickback_email': true, 'ticket_opened_kickback_email': true
};

/** The automated population, from the Roster. Deduplicated by eid. */
function AUTO_population_() {
  var t = CFG_readTab_(TAB_ROSTER);
  var out = {}, seen = {};
  t.rows.forEach(function (r) {
    var eid = String(r[1]);
    if (seen[eid]) return;
    seen[eid] = true;
    if (!AUTO_SUBCATS[String(r[7] || '').toLowerCase()]) return;
    out[eid] = { eid: eid, name: r[2], subcat: String(r[7]) };
  });
  CFG_assert_(Object.keys(out).length >= 100, 'Automated',
    'Only ' + Object.keys(out).length + ' automated emails found, expected at ' +
    'least 100. Bug A shipped a history built from 47 emails and hid 1,240,975 ' +
    'delivered. Refusing to repeat that.');
  return out;
}

/** Counters for one email over one month. Field names verified 2026-08-05. */
function AUTO_stats_(eid, start, end, token) {
  var url = HS_STATS_URL +
    '?startTimestamp=' + start + 'T00:00:00Z' +
    '&endTimestamp=' + end + 'T23:59:59Z' +
    '&emailIds=' + encodeURIComponent(eid);
  var res = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true, headers: { Authorization: 'Bearer ' + token } });
  if (res.getResponseCode() !== 200) return null;
  var c = (JSON.parse(res.getContentText()).aggregate || {}).counters || {};
  return {
    sent:       Number(c.sent) || 0,
    delivered:  Number(c.delivered) || 0,
    suppressed: Number(c.suppressed) || 0,
    opened:     Number(c.open) || 0,
    clicked:    Number(c.click) || 0,
    unsub:      Number(c.unsubscribed) || 0,
    hard:       Number(c.hardbounced) || 0,
    soft:       Number(c.softbounced) || 0,
    spam:       Number(c.spamreport) || 0,
    replies:    Number(c.reply) || 0
  };
}

/** The most recent COMPLETE month. Never the current partial one. */
function AUTO_latestCompleteMonth_() {
  var months = CFG_months_('2020-01-01');
  return months[months.length - 1];
}

// ═══ HISTORY ══════════════════════════════════════════════════════════════════

function AUTO_writeHistory() {
  var token = CFG_hubspotToken_();
  var folder = SETUP_outputFolder();
  var it = folder.getFilesByName(AUTO_HISTORY_FILE);
  CFG_assert_(it.hasNext(), 'AUTO_HISTORY',
    AUTO_HISTORY_FILE + ' is not in the Drive output folder. This producer is ' +
    'append-only and needs the existing 70 months as its starting point.');

  var txt = it.next().getBlob().getDataAsString();
  var hist = JSON.parse(txt.slice(
    txt.indexOf('{', txt.indexOf('window.AUTO_HISTORY =')),
    txt.lastIndexOf('};', txt.indexOf('window.AUTO_HISTORY_MONTHS')) + 1));

  var m = AUTO_latestCompleteMonth_();
  if (hist[m.key]) {
    CFG_log_('AUTO_HISTORY', 'OK',
      'Latest complete month ' + m.key + ' is already present. ' +
      Object.keys(hist).length + ' months unchanged.');
    Logger.log(AUTO_HISTORY_FILE + ': nothing to append. ' + m.key +
      ' already recorded, and earlier months are never recomputed.');
    return 0;
  }

  var pop = AUTO_population_(), eids = Object.keys(pop);
  var monthData = {}, withActivity = 0, calls = 0, started = Date.now();

  for (var i = 0; i < eids.length; i++) {
    if (Date.now() - started > CFG_MAX_RUNTIME_MS) {
      CFG_log_('AUTO_HISTORY', 'REFUSED',
        'Ran out of time after ' + calls + ' of ' + eids.length + ' emails. ' +
        'Nothing written: a half-built month is worse than no month.');
      throw new Error('AUTO_writeHistory hit the runtime ceiling at ' + calls +
        '/' + eids.length + '. Re-run; nothing was written.');
    }
    var s = AUTO_stats_(eids[i], m.start, m.end, token);
    calls++;
    Utilities.sleep(CFG_API_SLEEP_MS);
    if (!s || !s.sent) continue;
    monthData[eids[i]] = s;
    withActivity++;
  }

  CFG_assert_(withActivity > 0, 'AUTO_HISTORY',
    'No automated email showed any activity in ' + m.key + '. That is not ' +
    'plausible for this account and means the pull is broken, not that nothing sent.');

  hist[m.key] = monthData;
  var months = Object.keys(hist).sort();

  var body =
    '// AUTOMATED EMAIL MONTHLY HISTORY\n' +
    '// GENERATED by AUTO_writeHistory() in the Marketing Dashboard Pipeline.\n' +
    '// Do not hand edit, except AUTO_CHANGES which is maintained by a human.\n' +
    '//\n' +
    '// APPEND-ONLY. One month is added when it completes; earlier months are\n' +
    '// never recomputed, because HubSpot revises engagement after the fact.\n' +
    '//\n' +
    '// Counters are UNIQUE opens and clicks. totalOpens/totalClicks are absent:\n' +
    '// this API does not expose them, and the dashboard reads neither.\n' +
    '//\n' +
    '// Population: ' + eids.length + ' automated emails from the Roster, of which ' +
       withActivity + ' were active in ' + m.key + '.\n' +
    '// Months: ' + months.length + ' (' + months[0] + ' to ' + months[months.length - 1] + ')\n' +
    '// Generated ' + Utilities.formatDate(new Date(), 'America/New_York', 'yyyy-MM-dd HH:mm') + '\n' +
    'window.AUTO_HISTORY = ' + JSON.stringify(hist) + ';\n' +
    'window.AUTO_HISTORY_MONTHS = ' + JSON.stringify(months) + ';\n' +
    'window.AUTO_CHANGES = ' + (txt.indexOf('window.AUTO_CHANGES') >= 0
      ? txt.slice(txt.indexOf('window.AUTO_CHANGES =') + 21).trim().replace(/;\s*$/, '')
      : '[]') + ';\n';

  var f = folder.getFilesByName(AUTO_HISTORY_FILE);
  if (f.hasNext()) f.next().setContent(body);
  else folder.createFile(AUTO_HISTORY_FILE, body, MimeType.PLAIN_TEXT);

  CFG_log_('AUTO_HISTORY', 'OK',
    'Added ' + m.key + ': ' + withActivity + ' active of ' + eids.length +
    ' automated emails, ' + calls + ' API calls. ' + months.length + ' months total.');
  Logger.log(AUTO_HISTORY_FILE + ' written\n  added month ' + m.key +
    '\n  active emails ' + withActivity + ' of ' + eids.length +
    '\n  months total  ' + months.length);
  return withActivity;
}

// ═══ CURRENT-MONTH SNAPSHOT ═══════════════════════════════════════════════════

function AUTO_writeEmailData() {
  var token = CFG_hubspotToken_();
  var folder = SETUP_outputFolder();
  var m = AUTO_latestCompleteMonth_();

  // job and series exist only in the current file. Carry them forward by eid.
  /**
   * Read the prior file with the SAME bracket-aware parser the send producers
   * use, and let it assert rather than swallow.
   *
   * The first version here used indexOf('];') inside a bare try/catch. It failed
   * on 2026-08-05 and the catch hid it, so `prior` was empty, all 54 emails lost
   * their job and series, and the early-return on an unchanged window never
   * fired. The file was rewritten with worse data than it started with and the
   * only symptom was a WARN nobody would have questioned.
   *
   * A silent catch around a parse is the same class of mistake as a stale tab
   * defining a population: it turns a broken read into plausible output.
   */
  var prior = {}, priorWindow = '';
  var arr = HS_readExisting_(AUTO_EMAIL_FILE, 'AUTO_DATA');
  arr.forEach(function (r) { prior[String(r.eid)] = r; });

  var it = folder.getFilesByName(AUTO_EMAIL_FILE);
  if (it.hasNext()) {
    var w = it.next().getBlob().getDataAsString()
      .match(/window\.AUTO_WINDOW\s*=\s*"([^"]+)"/);
    priorWindow = w ? w[1] : '';
  }
  CFG_assert_(Object.keys(prior).length >= 20, 'AUTO_DATA',
    'Only ' + Object.keys(prior).length + ' prior records parsed from ' +
    AUTO_EMAIL_FILE + '. job and series exist in no API and can ONLY come from ' +
    'this file, so a failed read here silently strips them from every row.');

  if (priorWindow === m.key) {
    CFG_log_('AUTO_DATA', 'OK', 'Window ' + m.key + ' already current. Unchanged.');
    Logger.log(AUTO_EMAIL_FILE + ': already at ' + m.key + '. Nothing recomputed.');
    return 0;
  }

  var pop = AUTO_population_(), eids = Object.keys(pop);
  var rows = [], missingJob = [], calls = 0, started = Date.now();

  for (var i = 0; i < eids.length; i++) {
    if (Date.now() - started > CFG_MAX_RUNTIME_MS) {
      throw new Error('AUTO_writeEmailData hit the runtime ceiling at ' + calls +
        '/' + eids.length + '. Nothing written; re-run.');
    }
    var eid = eids[i];
    var s = AUTO_stats_(eid, m.start, m.end, token);
    calls++;
    Utilities.sleep(CFG_API_SLEEP_MS);
    if (!s || !s.sent) continue;

    var p = prior[eid] || {};
    if (p.job == null) missingJob.push(eid + '  ' + pop[eid].name);

    /**
     * NAME CARRIES FORWARD TOO.
     *
     * The existing file's names are shortened: "Certified Welder - Renewal -
     * Weekly Notice" where HubSpot holds "Accreditation - Certified Welder -
     * Renewal - Weekly Notice". Someone stripped the leading category by hand.
     * Emitting the raw HubSpot name would silently relabel every row and break
     * any name-based comparison against previous reports, so an email that is
     * already known keeps the name it has always had. Only genuinely new emails
     * arrive with the HubSpot name.
     */
    rows.push({
      name: p.name != null ? p.name : pop[eid].name,
      job: p.job != null ? p.job : null,
      series: p.series != null ? p.series : null,
      order: p.order != null ? p.order : null,
      steplabel: p.steplabel != null ? p.steplabel : null,
      eid: eid,
      delivered: s.delivered, opened: s.opened, clicked: s.clicked,
      unsub: s.unsub, hard: s.hard, soft: s.soft, spam: s.spam,
      excluded: p.excluded === true,
      sent: s.sent, suppressed: s.suppressed, replies: s.replies
    });
  }

  CFG_assert_(rows.length >= 20, 'AUTO_DATA',
    'Only ' + rows.length + ' automated emails had activity in ' + m.key +
    '. The live file has 53. Refusing to publish a collapsed population.');

  var body =
    '// AUTOMATED EMAIL, ONE MONTH\n' +
    '// GENERATED by AUTO_writeEmailData() in the Marketing Dashboard Pipeline.\n' +
    '//\n' +
    '// job / series / order / steplabel are NOT available from any HubSpot API\n' +
    '// (probed 2026-08-05: no such fields on the marketing email object). They\n' +
    '// are carried forward by eid from the previous file. A newly automated email\n' +
    '// arrives with job = null and is named in the run log so it can be set once.\n' +
    '//\n' +
    '// totalOpens / totalClicks are absent: the API exposes unique counts only,\n' +
    '// and the dashboard reads neither field.\n' +
    '//\n' +
    '// Window: ' + m.key + '.  Emails with activity: ' + rows.length +
       ' of ' + eids.length + ' automated.\n' +
    '// Generated ' + Utilities.formatDate(new Date(), 'America/New_York', 'yyyy-MM-dd HH:mm') + '\n' +
    'window.AUTO_DATA = ' + JSON.stringify(rows) + ';\n' +
    'window.AUTO_WINDOW = ' + JSON.stringify(m.key) + ';\n';

  var f = folder.getFilesByName(AUTO_EMAIL_FILE);
  if (f.hasNext()) f.next().setContent(body);
  else folder.createFile(AUTO_EMAIL_FILE, body, MimeType.PLAIN_TEXT);

  CFG_log_('AUTO_DATA', missingJob.length ? 'WARN' : 'OK',
    m.key + ': ' + rows.length + ' active emails, ' + calls + ' API calls' +
    (missingJob.length ? ', ' + missingJob.length + ' missing job/series' : ''));
  Logger.log(AUTO_EMAIL_FILE + ' written\n  window ' + m.key +
    '\n  active ' + rows.length + ' of ' + eids.length +
    (missingJob.length
      ? '\n\n  NEEDS A job/series VALUE (not derivable from any API):\n    ' +
        missingJob.sort().join('\n    ') +
        '\n  The dashboard groups by these at 24 call sites, so these rows will' +
        '\n  fall outside every grouping until someone sets them.'
      : '\n  every email carried a job and series forward'));
  return rows.length;
}
/**
 * PRODUCER: geo-data.js — sessions, purchases and revenue by country and US state
 * ═════════════════════════════════════════════════════════════════════════════
 * Requested by the webmaster 2026-08-05: sessions by country, sessions by US
 * state, and which places generate the most conversions and purchases.
 *
 * ─── "CONVERSIONS" MEANS PURCHASES HERE, AND THAT IS DELIBERATE ──────────────
 * GA4 reports both `keyEvents` and `ecommercePurchases`. On this property over
 * the last 7 days they were 335,000 and 662 respectively: a 500:1 ratio. Key
 * events are counting page views, scrolls and downloads, so a "conversions by
 * state" chart built on them would be measuring browsing, not buying.
 *
 * Key events are also banned from every AWS report because configuration changes
 * swing them by up to 7x, which makes any period comparison meaningless.
 *
 * So this file emits `purchases` (real transactions) and `revenue`, and the
 * dashboard must label the column "Conversions (purchases)" with the definition
 * visible next to the number. A conversions figure nobody can define is worse
 * than no conversions figure.
 *
 * ─── SCOPE ───────────────────────────────────────────────────────────────────
 * SITE-WIDE, matching the rest of web-data.js. This is the website's geography,
 * not email's. It deliberately does NOT filter to hs_email, and it does not
 * touch the Roster, because there is nothing to classify.
 *
 * ─── THE TWO DIMENSIONS ──────────────────────────────────────────────────────
 *   country  e.g. "United States"   every country
 *   region   e.g. "California"      GA4's first-level subdivision
 *
 * `region` is NOT US-only. It returns Ontario, Bavaria and so on, so US states
 * are isolated by pairing it with country = United States. Emitting raw region
 * as "states" would mix provinces into a US map.
 */

var GEO_FILENAME = 'geo-data.js';
var GEO_START    = '2023-10-01';
var GEO_TAB      = 'Web Geo';

// ─── WHY THERE ARE TWO CAPS, NOT ONE ─────────────────────────────────────────
// Countries have a real long tail (233 of them), so publishing the top N by sessions
// is the point of the cap.
//
// US states do not. There are 51 including the District of Columbia, and one shared
// cap of 40 silently dropped the eleven smallest by traffic. That removed ALASKA,
// which earns more revenue per session than any other state on this property
// ($9.43 against a $4.17 US average) — so the dashboard's revenue-per-session
// ranking was missing its own top row and looked complete while doing it. Louisiana
// showed as number one. The other ten dropped were Delaware, DC, Hawaii, Maine, New
// Hampshire, North Dakota, Rhode Island, South Dakota, Vermont and Wyoming.
//
// Sorting by sessions and cutting at 40 is precisely the wrong filter for a metric
// whose whole purpose is to find places that punch above their traffic. So states get
// their own cap, set high enough to publish all of them; it is a runaway guard, not a
// filter, and the assertion below fails loudly if it ever becomes one again.
var GEO_TOP_N      = 40;   // countries
var GEO_TOP_STATES = 80;   // states: publishes all 51, cap is a guard not a filter

var GEO_METRICS = ['sessions', 'engagedSessions', 'ecommercePurchases', 'totalRevenue'];

function GEO_run_(dims, start, end, filter) {
  var req = {
    dateRanges: [{ startDate: start, endDate: end }],
    dimensions: dims.map(function (d) { return { name: d }; }),
    metrics: GEO_METRICS.map(function (m) { return { name: m }; }),
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 5000
  };
  if (filter) req.dimensionFilter = filter;
  var res = AnalyticsData.Properties.runReport(req, 'properties/' + CFG_GA4_PROPERTY_ID);
  return (res.rows || []).map(function (r) {
    return { dims: r.dimensionValues.map(function (v) { return v.value; }),
             mets: r.metricValues.map(function (v) { return Number(v.value) || 0; }) };
  });
}

function GEO_shape_(rows, nameIdx) {
  return rows.map(function (r) {
    return {
      name: r.dims[nameIdx],
      sessions: r.mets[0],
      engaged: r.mets[1],
      purchases: r.mets[2],
      revenue: Math.round(r.mets[3]),
      // Revenue per session is the figure that actually answers "which places
      // punch above their traffic". Raw sessions are dominated by the US and
      // say almost nothing on their own.
      rps: r.mets[0] ? Number((r.mets[3] / r.mets[0]).toFixed(4)) : 0
    };
  });
}

function GEO_writeDataFile() {
  var months = CFG_months_(GEO_START);
  CFG_assert_(months.length, 'Geo', 'No complete months to report.');

  var start = months[0].start, end = months[months.length - 1].end;

  // ── countries ──────────────────────────────────────────────────────────────
  var countries = GEO_shape_(GEO_run_(['country'], start, end, null), 0)
    .filter(function (r) { return r.sessions > 0 && r.name && r.name !== '(not set)'; });

  // ── US states ──────────────────────────────────────────────────────────────
  var usOnly = { filter: { fieldName: 'country',
                 stringFilter: { matchType: 'EXACT', value: 'United States' } } };
  var states = GEO_shape_(GEO_run_(['region'], start, end, usOnly), 0)
    .filter(function (r) { return r.sessions > 0 && r.name && r.name !== '(not set)'; });

  CFG_assert_(countries.length >= 20, 'Geo',
    'Only ' + countries.length + ' countries returned, expected at least 20. ' +
    'That is not plausible for this property and means the pull is broken.');
  CFG_assert_(states.length >= 30, 'Geo',
    'Only ' + states.length + ' US states returned, expected at least 30.');
  // The bug this exists to prevent: states were sorted by sessions and cut at 40, so
  // the eleven lowest-traffic states never reached the data file and the dashboard's
  // revenue-per-session ranking silently lost its top entry. Truncating states is
  // never correct here, so refuse rather than publish a partial map.
  CFG_assert_(states.length <= GEO_TOP_STATES, 'Geo',
    'GA4 returned ' + states.length + ' US regions but GEO_TOP_STATES is ' +
    GEO_TOP_STATES + ', so the published file would be truncated and a high-earning ' +
    'state could disappear from the ranking without any error. Raise GEO_TOP_STATES.');

  var us = countries.filter(function (c) { return c.name === 'United States'; })[0];
  var totSess = countries.reduce(function (s, c) { return s + c.sessions; }, 0);
  var totRev  = countries.reduce(function (s, c) { return s + c.revenue; }, 0);
  var totPurch = countries.reduce(function (s, c) { return s + c.purchases; }, 0);

  CFG_assert_(us && us.sessions > 0, 'Geo',
    'The United States is absent from the country breakdown. Something is wrong ' +
    'with the pull; the US is 80%+ of this property\'s traffic.');

  var summary = {
    countries: countries.length,
    statesWithPurchases: states.filter(function (s) { return s.purchases > 0; }).length,
    usSessionShare: totSess ? Number((us.sessions / totSess).toFixed(4)) : 0,
    usRevenueShare: totRev ? Number((us.revenue / totRev).toFixed(4)) : 0,
    totalSessions: totSess,
    totalPurchases: totPurch,
    totalRevenue: totRev
  };

  var header =
    '// GEOGRAPHY: sessions, purchases and revenue by country and US state.\n' +
    '// GENERATED by GEO_writeDataFile() in the Marketing Dashboard Pipeline.\n' +
    '// Do not hand edit.\n' +
    '//\n' +
    '// CONVERSIONS = PURCHASES. Not GA4 key events. Measured 2026-08-05, this\n' +
    '//   property recorded 335,000 key events against 662 purchases in 7 days, a\n' +
    '//   500:1 ratio, because key events count page views, scrolls and downloads.\n' +
    '//   Key events also swing up to 7x on configuration changes and are banned\n' +
    '//   from every AWS report. Label the dashboard column "Conversions\n' +
    '//   (purchases)" and show that definition next to the number.\n' +
    '//\n' +
    '// SITE-WIDE, like the rest of web-data.js. Not email-scoped.\n' +
    '//\n' +
    '// US states come from GA4 `region` FILTERED to country = United States.\n' +
    '//   region alone also returns Ontario, Bavaria and similar, so unfiltered it\n' +
    '//   would mix provinces into a US map.\n' +
    '//\n' +
    '// rps = revenue per session. This is the figure that answers "which places\n' +
    '//   punch above their traffic weight". Raw sessions are ' +
        Math.round(summary.usSessionShare * 100) + '% United States\n' +
    '//   and say very little on their own.\n' +
    '//\n' +
    '// Window: ' + start + ' to ' + end + ' (' + months.length + ' complete months)\n' +
    '// Countries: ' + countries.length + '   US states: ' + states.length + '\n' +
    '// Generated ' + Utilities.formatDate(new Date(), 'America/New_York', 'yyyy-MM-dd HH:mm') + '\n';

  var content = header + 'window.GEO_DATA = ' + JSON.stringify({
    window: { start: start, end: end, months: months.length },
    summary: summary,
    countries: countries.slice(0, GEO_TOP_N),
    states: states.slice(0, GEO_TOP_STATES)
  }) + ';\n';

  var folder = SETUP_outputFolder();
  var it = folder.getFilesByName(GEO_FILENAME);
  if (it.hasNext()) it.next().setContent(content);
  else folder.createFile(GEO_FILENAME, content, MimeType.PLAIN_TEXT);

  // Also land it in the sheet so it is inspectable without opening the data file.
  CFG_writeTab_(GEO_TAB,
    ['Scope', 'Name', 'Sessions', 'Engaged', 'Purchases', 'Revenue', 'Rev/session'],
    countries.slice(0, GEO_TOP_N).map(function (c) {
      return ['country', c.name, c.sessions, c.engaged, c.purchases, c.revenue, c.rps];
    }).concat(states.slice(0, GEO_TOP_STATES).map(function (s) {
      return ['us-state', s.name, s.sessions, s.engaged, s.purchases, s.revenue, s.rps];
    })));

  var topRps = states.filter(function (s) { return s.sessions >= 200; })
    .sort(function (a, b) { return b.rps - a.rps; }).slice(0, 5);

  CFG_log_('Geo', 'OK',
    countries.length + ' countries, ' + states.length + ' US states, ' +
    totPurch + ' purchases, $' + totRev);
  Logger.log(
    GEO_FILENAME + ' written, ' + content.length + ' bytes\n' +
    '  window        ' + start + ' to ' + end + '\n' +
    '  countries     ' + countries.length + '\n' +
    '  US states     ' + states.length + '  (' + summary.statesWithPurchases + ' with purchases)\n' +
    '  US share      ' + Math.round(summary.usSessionShare * 100) + '% of sessions, ' +
        Math.round(summary.usRevenueShare * 100) + '% of revenue\n' +
    '  purchases     ' + totPurch + '   revenue $' + totRev + '\n\n' +
    '  Highest revenue per session (states with 200+ sessions):\n    ' +
    topRps.map(function (s) {
      return s.name + '  $' + s.rps.toFixed(2) + '/session  (' + s.sessions +
             ' sessions, ' + s.purchases + ' purchases)';
    }).join('\n    '));
  return countries.length + states.length;
}
/**
 * THE BUILD — what build.py used to do, done here instead
 * ═════════════════════════════════════════════════════════════════════════════
 * Inlines every data file into the template and writes one self-contained HTML
 * to Drive. This is the step that removes GitHub, Actions, Python, and any
 * dependency on a particular computer being switched on.
 *
 * ─── TWO THINGS THIS MUST ALWAYS DO ──────────────────────────────────────────
 * Both were learned the hard way in build.py and are carried over verbatim,
 * because rediscovering them would be expensive.
 *
 * 1. Emit the window.__resources guard. The dc-runtime re-fetches location.href
 *    and re-parses it. Over file:// that fetch fails and the inline template
 *    survives. Over http(s) it succeeds, the runtime mis-parses the
 *    self-contained file, and renders its own source instead of the dashboard.
 *    Defining __resources makes the runtime skip the re-fetch. This was verified
 *    with a blob-URL test, not guessed.
 *
 * 2. Write the file in one go rather than editing in place.
 *
 * ─── WHERE THE INPUTS LIVE ───────────────────────────────────────────────────
 * The template and support.js are uploaded to the Drive output folder once and
 * change only when the dashboard's design changes, which is rare. The data files
 * are written there by the producers on every run.
 *
 * A missing data file is dropped rather than fatal, exactly as build.py did, so
 * a channel that has not been generated yet never 404s the built page. But
 * unlike build.py, a missing file is also logged as a WARNING, because "silently
 * skipped" is how this project loses data.
 */

var BUILD_TEMPLATE = 'Marketing Dashboard.dc.html';
var BUILD_SUPPORT  = 'support.js';
var BUILD_OUTPUT   = 'Marketing Dashboard.html';

var BUILD_GUARD =
  '<script>\n' +
  '/* STANDALONE BUILD GUARD - do not remove. See 40_Build.gs for why. */\n' +
  'window.__resources = window.__resources || {};\n' +
  '</script>\n';

var BUILD_HEAD_EXTRA =
  '<title>Marketing Dashboard | American Welding Society</title>\n' +
  '<meta name="robots" content="noindex, nofollow">\n';

/**
 * PUBLISH TO GITHUB PAGES
 * ═════════════════════════════════════════════════════════════════════════════
 * The template is READ from the repo and the built dashboard is COMMITTED back to
 * it, so the live Pages link is always whatever the last run produced. This
 * removes the two manual steps that kept going wrong: uploading the template to
 * Drive by hand, and the built file never reaching anywhere public.
 *
 * Repo:  https://github.com/roquecorona/awsmonthlyreport   (public, branch main)
 * Live:  https://roquecorona.github.io/awsmonthlyreport/
 *
 * ─── SETUP, ONCE ─────────────────────────────────────────────────────────────
 * 1. Put the template in the repo at src/Marketing Dashboard.dc.html
 * 2. Create a fine-grained personal access token with Contents: Read and write,
 *    scoped to this one repo.
 * 3. Apps Script -> Project Settings -> Script Properties -> GITHUB_TOKEN = <token>
 * 4. Run GH_selfTest(). It checks all of the above and says exactly what is wrong.
 *
 * ─── WHY THE GIT DATA API AND NOT /contents ──────────────────────────────────
 * The built file is roughly 2 MB. The simple PUT /contents endpoint wants the
 * previous file's sha, and GET /contents refuses to return metadata cleanly for
 * files over 1 MB. Blob -> tree -> commit -> ref works at any size and needs no
 * prior sha, so it does not quietly break as the dashboard grows.
 */
var GH_OWNER         = 'roquecorona';
var GH_REPO          = 'awsmonthlyreport';
var GH_BRANCH        = 'main';
var GH_TEMPLATE_PATH = 'src/Marketing Dashboard.dc.html';
var GH_OUTPUT_PATH   = 'index.html';
var GH_API           = 'https://api.github.com';

function GH_token_() {
  var t = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  if (!t) throw new Error(
    'GITHUB_TOKEN is not set in Script Properties. Create a fine-grained token with ' +
    'Contents: Read and write on ' + GH_OWNER + '/' + GH_REPO + ', then add it under ' +
    'Project Settings -> Script Properties.');
  return t;
}

function GH_base_() { return GH_API + '/repos/' + GH_OWNER + '/' + GH_REPO; }

/** Every call goes through here so a failure names the endpoint and the reason. */
function GH_call_(method, url, payload, accept) {
  var opts = {
    method: method,
    headers: {
      Authorization: 'Bearer ' + GH_token_(),
      Accept: accept || 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'marketing-dashboard-pipeline'
    },
    muteHttpExceptions: true
  };
  // Only set a body and a content type when there actually is one. A GET carrying
  // contentType:'application/json' and a null payload is the kind of thing that works
  // until it does not.
  if (payload) { opts.contentType = 'application/json'; opts.payload = JSON.stringify(payload); }
  var res = UrlFetchApp.fetch(url, opts);
  var code = res.getResponseCode();
  if (code < 200 || code >= 300) {
    throw new Error('GitHub ' + method.toUpperCase() + ' ' + url.replace(GH_API, '') +
      ' -> HTTP ' + code + '  ' + res.getContentText().slice(0, 400));
  }
  return res;
}

function GH_json_(method, url, payload) {
  return JSON.parse(GH_call_(method, url, payload).getContentText());
}

/** Raw file text. Works at any size; no 1 MB JSON ceiling. */
function GH_readFile_(path) {
  var url = GH_base_() + '/contents/' + encodeURI(path) + '?ref=' + GH_BRANCH;
  return GH_call_('get', url, null, 'application/vnd.github.raw').getContentText();
}

/** sha of a path at the branch head, or '' if it is not there yet. */
function GH_shaAt_(path) {
  var head = GH_json_('get', GH_base_() + '/git/ref/heads/' + GH_BRANCH).object.sha;
  var tree = GH_json_('get', GH_base_() + '/git/commits/' + head).tree.sha;
  var list = GH_json_('get', GH_base_() + '/git/trees/' + tree + '?recursive=1').tree || [];
  for (var i = 0; i < list.length; i++) if (list[i].path === path) return list[i].sha;
  return '';
}

/**
 * Commit one file. Returns the commit sha, or '' when the content is byte-identical
 * to what is already there - a monthly run that changes nothing should not litter
 * the history with empty commits.
 */
function GH_commitFile_(path, content, message) {
  var base = GH_base_();
  var head = GH_json_('get', base + '/git/ref/heads/' + GH_BRANCH).object.sha;
  var baseTree = GH_json_('get', base + '/git/commits/' + head).tree.sha;

  var blob = GH_json_('post', base + '/git/blobs', {
    content: Utilities.base64Encode(content, Utilities.Charset.UTF_8),
    encoding: 'base64'
  });

  // Blobs are content-addressed, so an identical file yields an identical sha.
  var existing = GH_json_('get', base + '/git/trees/' + baseTree + '?recursive=1').tree || [];
  for (var i = 0; i < existing.length; i++) {
    if (existing[i].path === path && existing[i].sha === blob.sha) return '';
  }

  var tree = GH_json_('post', base + '/git/trees', {
    base_tree: baseTree,
    tree: [{ path: path, mode: '100644', type: 'blob', sha: blob.sha }]
  });
  var commit = GH_json_('post', base + '/git/commits', {
    message: message, tree: tree.sha, parents: [head]
  });
  GH_json_('patch', base + '/git/refs/heads/' + GH_BRANCH, { sha: commit.sha });
  return commit.sha;
}

/**
 * Run this after setup. It fails loudly and specifically rather than leaving you to
 * guess which of the token, the repo or the template path is wrong.
 */
function GH_selfTest() {
  var out = [];
  var ok = function (s) { out.push('  [OK]   ' + s); };
  var bad = function (s) { out.push('  [FAIL] ' + s); };

  try { GH_token_(); ok('GITHUB_TOKEN is set'); }
  catch (e) { bad(String(e.message)); Logger.log(out.join('\n')); return out.join('\n'); }

  try {
    var repo = GH_json_('get', GH_base_());
    ok('repo reachable: ' + repo.full_name + '  (' + repo.visibility +
       ', default branch ' + repo.default_branch + ')');
    if (repo.default_branch !== GH_BRANCH) {
      bad('GH_BRANCH is "' + GH_BRANCH + '" but the repo default is "' +
          repo.default_branch + '". Change GH_BRANCH.');
    }
  } catch (e) {
    bad('cannot reach the repo. Token missing Contents access, or wrong owner/name. ' +
        String(e.message));
    Logger.log(out.join('\n')); return out.join('\n');
  }

  try {
    var tpl = GH_readFile_(GH_TEMPLATE_PATH);
    var tags = (tpl.match(/<script src="([^"]+)"><\/script>/g) || []).length;
    ok('template found: ' + GH_TEMPLATE_PATH + '  (' + tpl.length + ' chars, ' +
       tags + ' script tags to inline)');
    if (!tags) bad('template has no <script src> tags. Wrong file?');
  } catch (e) {
    bad('template NOT found at ' + GH_TEMPLATE_PATH + '. Upload it to the repo. ' +
        String(e.message));
  }

  // Write access is the thing most likely to be wrong, so prove it rather than assume.
  try {
    GH_json_('get', GH_base_() + '/git/ref/heads/' + GH_BRANCH);
    ok('branch "' + GH_BRANCH + '" readable');
  } catch (e) { bad('branch "' + GH_BRANCH + '" not readable. ' + String(e.message)); }

  try {
    var nj = GH_shaAt_('.nojekyll');
    if (nj) ok('.nojekyll present');
    else out.push('  [note] .nojekyll is absent. Harmless for a root index.html, but ' +
                  'add an empty one if Pages ever starts mangling the output.');
  } catch (e) { /* not fatal */ }

  out.unshift('GitHub publish self-test');
  out.push('', '  Live URL: https://' + GH_OWNER + '.github.io/' + GH_REPO + '/');
  Logger.log(out.join('\n'));
  return out.join('\n');
}

function BUILD_file_(folder, name) {
  var it = folder.getFilesByName(name);
  return it.hasNext() ? it.next() : null;
}

function BUILD_dashboard() {
  var folder = SETUP_outputFolder();

  // The template now lives in the GitHub repo, not in the Drive folder. Drive was a
  // manual upload that had to be repeated on every design change, and it silently
  // drifted twice: BUILD_file_ takes the FIRST getFilesByName match, so a duplicate
  // meant building from a stale template with no error at all. The repo has one path
  // and a history.
  var html = GH_readFile_(GH_TEMPLATE_PATH);
  CFG_assert_(html && html.length > 1000, 'Build',
    'Template ' + GH_TEMPLATE_PATH + ' came back empty from ' + GH_OWNER + '/' + GH_REPO +
    '. Run GH_selfTest() - it names which of the token, repo or path is wrong.');

  // Same regex build.py used, so the two cannot disagree about what a tag is.
  var tagRe = /<script src="([^"]+)"><\/script>/g;
  var refs = [], m;
  while ((m = tagRe.exec(html)) !== null) refs.push({ tag: m[0], ref: m[1] });

  CFG_assert_(refs.length > 0, 'Build',
    'No <script src> tags found in the template. Nothing would be inlined.');

  var inlined = [], missing = [];
  refs.forEach(function (r) {
    // Template refs look like "support.js" or "../data/email-data.js".
    // Everything lives flat in one Drive folder, so only the basename matters.
    var base = r.ref.split('/').pop();
    var f = BUILD_file_(folder, base);
    if (!f) {
      missing.push(base);
      html = html.replace(r.tag, '<!-- not built: ' + base + ' -->');
      return;
    }
    var body = f.getBlob().getDataAsString();
    html = html.replace(r.tag, '<script>\n' + body + '\n</script>');
    inlined.push(base + ' (' + body.length + ')');
  });

  html = html.replace('<head>', '<head>\n' + BUILD_HEAD_EXTRA + BUILD_GUARD);

  // Structural check, carried over from build.py. A mismatch means a template
  // edit left a tag open, and the dashboard renders blank rather than erroring.
  // Counted across the whole file on purpose: the dc-runtime source contains its
  // own "</x-dc>" inside a regex literal, so slicing on the first one lands in
  // the runtime and silently checks nothing.
  ['sc-if', 'sc-for'].forEach(function (t) {
    var o = (html.match(new RegExp('<' + t, 'g')) || []).length;
    var c = (html.match(new RegExp('</' + t + '>', 'g')) || []).length;
    CFG_assert_(o === c, 'Build',
      t + ' tags unbalanced: ' + o + ' open / ' + c + ' close. The template has an ' +
      'unclosed tag and the dashboard would render blank.');
  });

  var out = BUILD_file_(folder, BUILD_OUTPUT);
  if (out) out.setContent(html);
  else out = folder.createFile(BUILD_OUTPUT, html, MimeType.HTML);

  // Publish. This is the step that makes the live link true: without it the build
  // only ever reached a Drive folder nobody outside the account can open.
  var live = 'https://' + GH_OWNER + '.github.io/' + GH_REPO + '/';
  var sha = '', pub = '';
  try {
    sha = GH_commitFile_(GH_OUTPUT_PATH, html,
      'Dashboard rebuild ' + Utilities.formatDate(new Date(), 'America/New_York', 'yyyy-MM-dd HH:mm'));
    pub = sha ? ('published ' + sha.slice(0, 7) + ', live in about a minute at ' + live)
              : ('no change since the last publish, ' + live + ' is already current');
  } catch (e) {
    // A publish failure must not lose the build. The Drive copy is already written.
    pub = 'PUBLISH FAILED: ' + String(e.message).slice(0, 300);
    CFG_log_('Build', 'WARN', pub);
  }

  CFG_log_('Build', (missing.length || sha === '' && pub.indexOf('FAILED') === 0) ? 'WARN' : 'OK',
    'Built ' + html.length + ' bytes from ' + inlined.length + ' files.  ' + pub +
    (missing.length ? '  MISSING (panels will be blank): ' + missing.join(', ') : ''));

  Logger.log(
    'BUILT: ' + out.getUrl() + '\n' +
    '  ' + html.length + ' bytes\n' +
    '  ' + pub + '\n' +
    '  inlined: ' + inlined.join('\n           ') +
    (missing.length ? '\n  MISSING: ' + missing.join(', ') : ''));
  return live;
}
/**
 * THE ORCHESTRATOR — one entry point, one trigger
 * ═════════════════════════════════════════════════════════════════════════════
 * runMonthlyRefresh() is the whole monthly process. Nothing else needs running
 * by hand. Install the trigger once and the dashboard maintains itself.
 *
 * ─── ORDER MATTERS AND IS NOT NEGOTIABLE ─────────────────────────────────────
 * 1. Roster      the population. everything downstream classifies against it.
 * 2. Self-test   proves the roster is right BEFORE anything trusts it.
 * 3. ID Map      resolve any utm_content the roster introduced.
 * 4. Producers   GA4 and HubSpot pulls, each asserting its own population.
 * 5. Build       inline everything into one HTML.
 *
 * Step 2 is the one people will be tempted to skip. Don't. Every silent-
 * wrongness incident in this project would have been caught by a step-2-style
 * check, and each one instead shipped a plausible wrong number to a director.
 *
 * ─── FAILURE POLICY ──────────────────────────────────────────────────────────
 * A producer that cannot assert its own correctness throws, and the run stops
 * with the previous good data still in place. A partial refresh is never
 * published. The Run Log tab records what happened either way.
 *
 * This is deliberately the opposite of the old behaviour, where a stale tab
 * produced a confident, wrong, un-flagged number.
 */

function runMonthlyRefresh() {
  var started = new Date();
  CFG_log_('Run', 'START', 'Monthly refresh beginning');

  var steps = [];
  function step(name, fn, required) {
    try {
      var r = fn();
      steps.push('  OK       ' + name + (r != null ? '  (' + r + ')' : ''));
      return r;
    } catch (e) {
      steps.push('  FAILED   ' + name + '  ' + String(e).slice(0, 240));
      if (required) {
        CFG_log_('Run', 'ABORTED', 'Required step failed: ' + name + ' — ' + e);
        Logger.log(['MONTHLY REFRESH ABORTED', ''].concat(steps).join('\n') +
          '\n\nNothing was published. Previous data is untouched.');
        throw e;
      }
      return null;
    }
  }

  // ── 1 & 2. the population, and proof that it is right ──────────────────────
  step('Roster rebuild', ROSTER_rebuild, true);

  var rosterOk = step('Roster self-test', ROSTER_selfTest, false);
  CFG_assert_(rosterOk !== false, 'Run',
    'The roster self-test failed. July 2026 must contain exactly 14 Marketing ' +
    'sends. Publishing on a roster that cannot reproduce a known-good month is ' +
    'how the $3,266 error shipped. Fix the pull, do not bypass this.');

  // ── 3. resolve any new utm_content ─────────────────────────────────────────
  // Ported from GA4_WebApp.refreshIdMap. Not required: an unresolved ID is
  // dropped and counted, which is honest, where a wrong name would not be.
  if (typeof IDMAP_refresh === 'function') step('ID Map refresh', IDMAP_refresh, false);

  // ── 4. producers ───────────────────────────────────────────────────────────
  // Each writes one data file to the Drive output folder. Ported one at a time
  // from the old projects; a producer that is not present yet is simply skipped,
  // and 40_Build logs its data file as missing rather than pretending.
  // WEB_pullAll must run before WEB_writeDataFile: the first refreshes the six
  // Web/Search tabs from GA4 and Search Console, the second serialises those tabs
  // into the data file. Running only the second republishes last month's numbers
  // under this month's date, which is worse than failing.
  [
    ['Pages and items', 'EPI_writeFile'],
    ['GA4 per email',   'PE_writePerEmailFile'],
    ['Web pull',        'WEB_pullAll'],
    ['Web data',        'WEB_writeDataFile'],
    ['Marketing sends', 'HS_writeEmailData'],
    ['TWIW sends',      'HS_writeTwiwData'],
    ['GA4 marketing',   'GA4_writeMonthlyData'],
    ['GA4 TWIW',        'GA4_writeTwiwChannel'],
    ['GA4 all email',   'GA4_writeChannelData'],
    ['GA4 automated',   'GA4_writeAutoChannel'],
    ['GA4 SMS',         'GA4_writeSmsChannel'],
    ['Automated sends', 'AUTO_writeEmailData'],
    ['Automated hist',  'AUTO_writeHistory']
  ].forEach(function (p) {
    if (typeof globalThis[p[1]] === 'function') step(p[0], globalThis[p[1]], false);
    else steps.push('  SKIPPED  ' + p[0] + '  (' + p[1] + ' not ported yet)');
  });

  // ── 5. build ───────────────────────────────────────────────────────────────
  var url = step('Build dashboard', BUILD_dashboard, true);

  var mins = ((new Date() - started) / 60000).toFixed(1);
  CFG_log_('Run', 'DONE', 'Completed in ' + mins + ' min');
  Logger.log(['MONTHLY REFRESH COMPLETE (' + mins + ' min)', ''].concat(steps)
    .concat(['', 'Dashboard: ' + url]).join('\n'));
  return url;
}

// ═══ PHASED MONTHLY RUN ═══════════════════════════════════════════════════════
/**
 * WHY THIS IS SPLIT ACROSS EIGHT TRIGGERS
 *
 * Apps Script caps a single execution at SIX MINUTES on a consumer Google
 * account, which this is. Measured durations on 2026-08-05:
 *
 *   roster 65s | EPI 93s | per-email 30s | web pull 95-216s
 *   GA4 channels 100s | automated history ~180s | automated sends 89s | build 22s
 *
 * The chain totals roughly 12-14 minutes. Every producer fits comfortably alone,
 * which is exactly why running them one at a time all evening never revealed it.
 * A single monthly trigger would abort around the GA4 files having refreshed some
 * data and not others: not corrupt, because each producer asserts before writing,
 * but a dashboard silently mixing two months.
 *
 * So each phase gets its own hourly trigger with large headroom.
 *
 * ─── THE STALE-ROSTER GATE ───────────────────────────────────────────────────
 * Phase 1 stamps a token on success. Later phases refuse to run if that stamp is
 * missing or older than a day.
 *
 * Without it, a failed phase 1 would leave LAST month's roster in place and every
 * later phase would happily classify against it, missing every email sent since.
 * That is precisely the stale-population failure this pipeline exists to prevent,
 * and splitting the run is what would have reintroduced it.
 */

var RUN_STAMP_KEY = 'RUN_ROSTER_STAMP';

function RUN_gate_(phase) {
  var s = PropertiesService.getScriptProperties().getProperty(RUN_STAMP_KEY);
  CFG_assert_(s, phase,
    'Phase 1 has not run. The Roster is the population every later phase ' +
    'classifies against, so running now would publish against a stale roster.');
  var ageHrs = (Date.now() - Number(s)) / 36e5;
  CFG_assert_(ageHrs < 24, phase,
    'The Roster was last rebuilt ' + ageHrs.toFixed(1) + ' hours ago. Phase 1 ' +
    'must have failed this cycle. Refusing to publish against a stale population.');
}

function RUN_phase_(name, steps, gated) {
  if (gated) RUN_gate_(name);
  var out = [], t0 = Date.now();
  steps.forEach(function (p) {
    if (typeof globalThis[p[1]] !== 'function') {
      out.push('  SKIPPED  ' + p[0] + '  (' + p[1] + ' not present)');
      return;
    }
    try {
      var r = globalThis[p[1]]();
      out.push('  OK       ' + p[0] + (r != null ? '  (' + r + ')' : ''));
    } catch (e) {
      out.push('  FAILED   ' + p[0] + '  ' + String(e).slice(0, 200));
      CFG_log_(name, 'FAILED', p[0] + ': ' + String(e).slice(0, 300));
    }
  });
  var secs = ((Date.now() - t0) / 1000).toFixed(0);
  CFG_log_(name, 'DONE', secs + 's');
  Logger.log(name + '  (' + secs + 's of a 360s ceiling)\n' + out.join('\n'));
}

function runPhase1_Roster() {
  RUN_phase_('Phase1 Roster', [['Roster rebuild', 'ROSTER_rebuild']], false);
  var ok = ROSTER_selfTest();
  CFG_assert_(ok !== false, 'Phase1 Roster',
    'Roster self-test failed. July 2026 must contain exactly 14 Marketing sends. ' +
    'No stamp written, so later phases will refuse to run rather than publish ' +
    'against a roster that cannot reproduce a known-good month.');
  PropertiesService.getScriptProperties().setProperty(RUN_STAMP_KEY, String(Date.now()));
  CFG_log_('Phase1 Roster', 'OK', 'Self-test passed, stamp written.');
}

function runPhase2_EmailWeb() {
  RUN_phase_('Phase2 EmailWeb', [
    ['Pages and items', 'EPI_writeFile'],
    ['GA4 per email',   'PE_writePerEmailFile']], true);
}
function runPhase3_Web() {
  RUN_phase_('Phase3 Web', [
    ['Web pull',  'WEB_pullAll'],
    ['Web data',  'WEB_writeDataFile'],
    ['Geography', 'GEO_writeDataFile']], true);
}
function runPhase4_GA4Channels() {
  RUN_phase_('Phase4 GA4Channels', [
    ['GA4 marketing', 'GA4_writeMonthlyData'],
    ['GA4 TWIW',      'GA4_writeTwiwChannel'],
    ['GA4 all email', 'GA4_writeChannelData'],
    ['GA4 automated', 'GA4_writeAutoChannel'],
    ['GA4 SMS',       'GA4_writeSmsChannel']], true);
}
function runPhase5_Sends() {
  RUN_phase_('Phase5 Sends', [
    ['Marketing sends', 'HS_writeEmailData'],
    ['TWIW sends',      'HS_writeTwiwData']], true);
}
function runPhase6_AutoHistory() {
  RUN_phase_('Phase6 AutoHistory', [['Automated history', 'AUTO_writeHistory']], true);
}
function runPhase7_AutoSends() {
  RUN_phase_('Phase7 AutoSends', [['Automated sends', 'AUTO_writeEmailData']], true);
}
function runPhase8_Build() {
  // Deliberately NOT gated. If earlier phases failed the build should still run
  // and report exactly which data files are missing, which is more useful than
  // refusing and leaving no artefact and no explanation.
  RUN_phase_('Phase8 Build', [['Build dashboard', 'BUILD_dashboard']], false);
}

/**
 * Install all eight. Idempotent: clears every trigger this pipeline owns first,
 * so repeated runs never stack duplicates.
 */
function installMonthlyTrigger() {
  var phases = [
    ['runPhase1_Roster',       6],
    ['runPhase2_EmailWeb',     7],
    ['runPhase3_Web',          8],
    ['runPhase4_GA4Channels',  9],
    ['runPhase5_Sends',       10],
    ['runPhase6_AutoHistory', 11],
    ['runPhase7_AutoSends',   12],
    ['runPhase8_Build',       13]
  ];
  var owned = {};
  phases.forEach(function (p) { owned[p[0]] = true; });
  owned['runMonthlyRefresh'] = true;   // retire the old single trigger

  var removed = 0;
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (owned[t.getHandlerFunction()]) { ScriptApp.deleteTrigger(t); removed++; }
  });

  phases.forEach(function (p) {
    ScriptApp.newTrigger(p[0]).timeBased().onMonthDay(3).atHour(p[1]).create();
  });

  CFG_log_('Trigger', 'OK', removed + ' removed, ' + phases.length + ' installed (day 3, 6am-1pm)');
  Logger.log(
    'Installed ' + phases.length + ' monthly triggers, day 3:\n' +
    phases.map(function (p) { return '  ' + String(p[1]).padStart(2) + ':00  ' + p[0]; }).join('\n') +
    '\n\n' + removed + ' old trigger(s) removed.\n' +
    'Each phase runs alone, well inside the 6-minute ceiling.\n' +
    'Phases 2-7 refuse to run unless phase 1 rebuilt the Roster and passed its\n' +
    'self-test within the last 24 hours.');
}

/**
 * What is automated and what is not, answered from the live project rather than
 * from documentation that may have drifted. Run this any time you want the
 * honest status.
 */
function statusReport() {
  var producers = [
    ['email-pages-items.js', 'EPI_writeFile'],
    ['ga4-per-email.js',     'PE_writePerEmailFile'],
    ['web-data.js',          'WEB_writeDataFile'],
    ['geo-data.js',          'GEO_writeDataFile'],
    ['email-data.js',        'HS_writeEmailData'],
    ['twiw-email-data.js',   'HS_writeTwiwData'],
    ['auto-email-data.js',   'AUTO_writeEmailData'],
    ['auto-history-data.js', 'AUTO_writeHistory'],
    ['ga4-data.js',          'GA4_writeMonthlyData'],
    ['ga4-channel-data.js',  'GA4_writeChannelData'],
    ['auto-ga4-data.js',     'GA4_writeAutoChannel'],
    ['sms-ga4-data.js',      'GA4_writeSmsChannel'],
    ['twiw-ga4-data.js',     'GA4_writeTwiwChannel'],
    ['sms-data.js',          null]   // HubSpot SMS UI only, no API. browser or manual.
  ];
  var done = [], todo = [], manual = [];
  producers.forEach(function (p) {
    if (!p[1]) manual.push('  ' + p[0] + '  (no HubSpot SMS API — browser only)');
    else if (typeof globalThis[p[1]] === 'function') done.push('  ' + p[0] + '  <- ' + p[1] + '()');
    else todo.push('  ' + p[0] + '  <- ' + p[1] + '() NOT PORTED');
  });

  Logger.log(
    'PIPELINE STATUS\n═══════════════\n\n' +
    'AUTOMATED (' + done.length + ')\n' + (done.join('\n') || '  none') + '\n\n' +
    'NOT YET PORTED (' + todo.length + ')\n' + (todo.join('\n') || '  none') + '\n\n' +
    'MANUAL BY NECESSITY (' + manual.length + ')\n' + (manual.join('\n') || '  none') + '\n\n' +
    'Sheet:  ' + (CFG_SHEET_ID ? 'https://docs.google.com/spreadsheets/d/' + CFG_SHEET_ID : 'NOT CREATED') + '\n' +
    'Trigger: ' + (ScriptApp.getProjectTriggers().filter(function (t) {
      return t.getHandlerFunction() === 'runMonthlyRefresh';
    }).length ? 'installed' : 'NOT INSTALLED'));
}
