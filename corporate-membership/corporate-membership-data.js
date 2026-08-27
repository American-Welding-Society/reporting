/* CORPORATE MEMBERSHIP, MBM_1054. Generated file. Never edit by hand.
   Regenerate with scratchpad/build_cm_data.py, which reads one GA4 grid.

   SCOPE. 1 January to 26 August 2026, calendar year to date. The page is the whole
   /membership/corporate section: the main page plus the five tier pages
   educational-institution, sustaining, affiliate, supporting and welding-distributor.
   Roque confirmed the section basis on 27 August, and it matches the campaign plan's own
   stated KPI, "website sessions to Corporate Membership pages".

   SESSION BASIS. unifiedPagePathScreen, sessions that REACHED the page, the same basis
   FOWC publishes. Every session figure derives from ONE grid of
   yearMonth x channel x source x campaign x page, so channel, month and page all
   cross-foot to the same total. GA4 returns a different total at a different dimension
   depth; an earlier single-dimension pull of the same window returned 22,226 against this
   grid's 22,170. Neither is more correct. The grid is the published basis.

   THE LARGEST CAVEAT ON THIS PAGE, and the reason the section total is not a campaign
   figure. Between 11 May and 25 August, 10,827 sessions landed on /membership/corporate
   carrying li_ed, a LinkedIn email or notification click identifier, against 308 carrying
   li_fat_id, the ad click identifier. None existed in January to April. GA4 attributed
   only 776 of them to LinkedIn and recorded 8,570 as (direct), with the remainder spread
   across storage.googleapis.com at 1 percent engagement, Amazon ad-serving domains at
   3 percent, and several hundred unrelated consumer sites at two to four sessions each.
   They begin the day the ads went live and collapse when the budget exhausted on 24 July,
   yet at 10,827 they exceed LinkedIn's own reported 4,339 clicks by 2.5 times, which ad
   delivery cannot explain. Engagement on the main page fell from 87 percent to 27 percent
   entirely because of this traffic; the five tier pages held 80 to 94 percent throughout.
   Cause unconfirmed. LinkedIn Audience Network or invalid traffic are the candidates and
   Annalie or LinkedIn support should settle it. NOTHING ON THIS PAGE ASSERTS A CAUSE.

   OUTCOME. New corporate memberships only. Renewals are out of scope, Roque, 27 August.
   156 units and 67,358 dollars across nine NEW dues products, from GA4 item-scoped
   ecommerce for the calendar year. Renewals held out are 322 units and 190,308 dollars.
   WEMCO, ITSA and RWMA count as corporate memberships per Roque, but they exist only as
   renewal products, so including them does not change the new-member figure.
   "new" is a substring of "renew", so lifecycle is tested for renewal FIRST; the naive
   match classifies every renewal as new and roughly triples the outcome.

   EDUCATIONAL INSTITUTION. 440 add-to-carts and ZERO completed online purchases in the
   calendar year, against 3,202 sessions on that tier page. The only educational dues
   products that ever transacted are two Spanish-language international items.

   PAID. LinkedIn only; no other paid channel ran for this campaign. July is exact from
   the governed connector and covers BOTH ad sets in the campaign group: corporate at
   1,621 landing-page clicks and 912.45, and Educational at 2,278 and 907.02. The
   mid-campaign reporting counted only the first, so half the paid delivery was missing.
   The May to July figure of 2,999.97 and 4,339 clicks is the `corporate` ad set alone,
   read from Campaign Manager on 14 August; the Educational ad set's May and June spend
   has not yet been read back and is therefore ABSENT rather than estimated.
   Landing-page clicks only. Broader clicks are never substituted.

   EMAIL. Absent. The campaign's two sends are HubSpot WORKFLOW emails and the connector
   pulls marketing emails only. Not zero, not pulled.

   ORGANIC SOCIAL. Absent. Three posts published, on 13 May, 24 June and 19 August, per
   the Monday board. Post metrics could not be pulled: /rest/posts returns 403
   ACCESS_DENIED serviceErrorCode=100 on the current token, the same permission failure
   blocking the organic connector. The FOWC build pulled this successfully on 20 August,
   so the permission has changed since. Awaiting the new organic app's Community
   Management approval.

   TRADITIONAL. Delivery is recorded; no traceable performance metric exists for the F&M
   eBlast or the banner ads, so no figures are published for them.

   NO GOAL TARGET. None is owned. Cassie's 25 March note says targets would be set from
   2026 data, which is an intention, not a number.

   NO YEAR ON YEAR. The 2025 media plan differs and the comparison misleads. */

window.CAMPAIGN_DATA = {

  meta: {
    campaign: "Corporate Membership",
    code: "MBM_1054",
    year: 2026,
    dataThrough: "2026-08-26",
    paidThrough: "2026-07-31",
    landingPage: "https://www.aws.org/membership/corporate/",
    landingPath: "/membership/corporate/",
    mondayBoard: "https://aws-projects.monday.com/boards/18395365253"
  },

  flags: { hasPaid: true, hasOutcome: true },

  summary: [
    { channel: "Outcome",    label: "New corporate memberships", value: 156, fmt: "int" },
    { channel: "Outcome",    label: "New membership revenue",    value: 67358.00, fmt: "money" },
    { channel: "Website",    label: "Sessions on the section",   value: 22170, fmt: "int" },
    { channel: "Website",    label: "Engagement rate",           value: 53.8, fmt: "pct" },
    { channel: "Paid media", label: "LinkedIn spend, July",      value: 1819.47, fmt: "money" },
    { channel: "Website",    label: "Unattributed LinkedIn sessions", value: 10827, fmt: "int" }
  ],

  goal: { label: "New corporate memberships", actual: 156 },

  landingPage: { sessions: 22170, engaged: 11929, seconds: 732633 },

  channels: [
    { channel: "Direct",          sessions:  12717, engaged:  5539, seconds:   252622 },
    { channel: "Organic Search",  sessions:   4072, engaged:  3867, seconds:   297584 },
    { channel: "Referral",        sessions:   1828, engaged:   561, seconds:    26767 },
    { channel: "Paid Search",     sessions:   1177, engaged:  1140, seconds:    98468 },
    { channel: "Paid Social",     sessions:    795, engaged:   225, seconds:     5040 },
    { channel: "Unassigned",      sessions:    549, engaged:    88, seconds:    14530 },
    { channel: "Email",           sessions:    489, engaged:   332, seconds:    21785 },
    { channel: "Organic Shopping", sessions:    372, engaged:    23, seconds:      203 },
    { channel: "Organic Social",  sessions:     64, engaged:    54, seconds:     1488 },
    { channel: "AI Assistant",    sessions:     46, engaged:    43, seconds:     9830 },
    { channel: "Display",         sessions:     27, engaged:    24, seconds:     2562 },
    { channel: "Cross-network",   sessions:     16, engaged:    15, seconds:      754 },
    { channel: "Paid Shopping",   sessions:     10, engaged:    10, seconds:      673 },
    { channel: "Paid Other",      sessions:      3, engaged:     3, seconds:      157 },
    { channel: "Organic Video",   sessions:      3, engaged:     3, seconds:       60 },
    { channel: "SMS",             sessions:      2, engaged:     2, seconds:      110 },
  ],

  monthly: [
    { m: "2026-01", sessions:  1753, engaged:  1505, seconds:  105174, partial: false },
    { m: "2026-02", sessions:  1712, engaged:  1475, seconds:  105967, partial: false },
    { m: "2026-03", sessions:  1643, engaged:  1450, seconds:  100482, partial: false },
    { m: "2026-04", sessions:  1252, engaged:  1079, seconds:   76114, partial: false },
    { m: "2026-05", sessions:  4436, engaged:  1658, seconds:   86357, partial: false },
    { m: "2026-06", sessions:  5514, engaged:  2003, seconds:  113654, partial: false },
    { m: "2026-07", sessions:  4812, engaged:  1914, seconds:   81351, partial: false },
    { m: "2026-08", sessions:  1048, engaged:   845, seconds:   63534, partial: true },
  ],

  pages: [
    { page: "Corporate Membership (main)", sessions: 14463, engaged:  5266 },
    { page: "educational-institution",     sessions:  3208, engaged:  2804 },
    { page: "sustaining",                  sessions:  1774, engaged:  1544 },
    { page: "affiliate",                   sessions:  1146, engaged:   994 },
    { page: "supporting",                  sessions:  1013, engaged:   878 },
    { page: "welding-distributor",         sessions:   566, engaged:   443 },
  ],

  outcome: {
    label: "New corporate memberships",
    units: 156, revenue: 67358.00, addToCarts: 356,
    products: [
      { name: "Sustaining New, domestic",             units: 38, revenue: 34580.00 },
      { name: "Affiliate New, domestic",              units: 75, revenue: 15000.00 },
      { name: "Supporting New, domestic",             units: 19, revenue:  8645.00 },
      { name: "Distributor New, domestic",            units:  8, revenue:  4440.00 },
      { name: "Affiliate New, international",         units: 12, revenue:  2400.00 },
      { name: "Distributor New, international",       units:  2, revenue:  1110.00 },
      { name: "Sustaining New, international",        units:  1, revenue:   910.00 },
      { name: "Educational Institution New (Spanish)",units:  1, revenue:   273.00 }
    ],
    educationalInstitution: { addToCarts: 440, purchases: 0 }
  },

  paid: {
    platforms: [
      { platform: "LinkedIn", spend: 1819.47, clicks: 3899, landingPageClicks: 3899, impressions: 104422,
        note: "July 2026, both ad sets. clicks holds LANDING PAGE clicks; broader clicks are never substituted." }
    ],
    adSets: [
      { name: "corporate",   spend:  912.45, clicks: 1621, landingPageClicks: 1621, impressions: 42107 },
      { name: "Educational", spend:  907.02, clicks: 2278, landingPageClicks: 2278, impressions: 62315 }
    ],
    campaignToDate: { adSet: "corporate", spend: 2999.97, landingPageClicks: 4339, impressions: 150117,
                      window: "1 May to 31 July 2026" },
    attribution: { taggedSessions: 777, linkedInAdClickSessions: 308, unattributedLinkedInSessions: 10827 }
  },

  delivery: [
    { channel: "Paid social",   item: "LinkedIn carousel, 5 creatives", due: "2026-05-11", status: "Delivered" },
    { channel: "Paid social",   item: "Budget exhausted",               due: "2026-07-24", status: "Delivered" },
    { channel: "Email",         item: "New Primary Contact Workflow",   due: "2026-05-21", status: "Delivered" },
    { channel: "Email",         item: "Corporate Membership email in Corporate workflow", due: "2026-06-24", status: "Delivered" },
    { channel: "Organic social",item: "JobsInWelding Employer Advantage", due: "2026-05-13", status: "Delivered" },
    { channel: "Organic social",item: "Member Value in Action",         due: "2026-06-24", status: "Delivered" },
    { channel: "Organic social",item: "Did You Know, key benefits",     due: "2026-08-19", status: "Delivered" },
    { channel: "Organic social",item: "Member Value in Action, second", due: "2026-10-21", status: "Scheduled" },
    { channel: "Traditional",   item: "May F&M eBlast",                 due: "2026-05-13", status: "Delivered" },
    { channel: "Traditional",   item: "May banner ad, F&M Magazine",    due: "2026-05-05", status: "Delivered" },
    { channel: "Traditional",   item: "July banner ad, F&M Magazine",   due: "2026-06-18", status: "Delivered" },
    { channel: "Traditional",   item: "September banner ad, F&M Magazine", due: "2026-09-10", status: "In progress" },
    { channel: "Web",           item: "Landing page copy and design",   due: "2026-04-29", status: "Delivered" },
    { channel: "Web",           item: "Compare at a Glance section",    due: "2026-04-25", status: "Delivered" },
    { channel: "Web",           item: "Sitecore CMS implementation",    due: "2026-05-15", status: "Delivered" },
    { channel: "Collateral",    item: "Corporate Benefits Sheet",       due: "",           status: "On hold" }
  ]
};
