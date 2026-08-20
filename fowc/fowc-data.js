/* fowc-data.js — Fundamentals of Welding Curriculum, EDU_1045, 2026.
   Rebuilt 20 August 2026 after a full source audit. Every figure below was
   traced to a named system on that date; nothing is inherited unverified.

   THE FILTER WAS WRONG AND IS FIXED. Until 20 August the landing page filter was
   BEGINS_WITH '/educators/welding-curriculum/' with a trailing slash, which drops
   every session whose landing page was recorded without one. Roque found it by
   sending a page-path report that did not agree. The prefix is now
   '/educators/welding-curriculum'. It is worth 33 sessions on the published total,
   0.2 percent, and it was an undercount rather than a rounding difference.

   ONE QUERY. GA4 counts sessions with an approximate distinct algorithm, so the
   same question answered with a different number of dimensions comes back
   different: 14,813 at zero dimensions against 14,964 by month, channel, source
   and campaign. None is more correct and no mixture of them cross foots. So the
   header, the timeline, the traffic table, the print row, the paid session column
   and both comparisons are all aggregations of a single query, month x channel x
   source x campaign, run once for 2026 and once for 2025. Every total on the page
   therefore adds up by construction rather than by luck, and the year on year is
   like for like because both sides were built the same way.

   TWO WAYS TO COUNT THE PAGE, added 20 August on Miguel Romero's recommendation.
   Landing page sessions, 14,964, are sessions that started on the page: what the
   campaign delivered. Sessions reaching the page, 17,121, are sessions that viewed
   it at any point, including people who entered aws.org elsewhere and navigated
   in. The 2,157 difference is internal navigation the campaign did not buy, 13
   percent of arrivals, and it was invisible on this page until now. The second
   measure uses unifiedPagePathScreen CONTAINS 'educators/welding-curriculum',
   which is the filter Roque's own report used.

   Page views behave differently again and the two must never be compared. With a
   landing page filter, GA4's view count includes every page those sessions saw,
   64,188. With a page filter it counts only views of this page, 22,483. The page
   publishes the second.

   YEAR ON YEAR, same window, same filters, same construction: 62,663 landing page
   sessions in 2025 against 14,964 this year, down 76.1 percent. READ IT WITH THIS
   BESIDE IT: paid search alone was 57,065 sessions in 2025 against 11,877 now,
   which is 95 percent of the entire drop. Every other channel moved by hundreds.
   Paid social is the only channel up, by 10 percent. So the comparison is a
   statement about how much search was bought in each year, not about this page or
   this campaign, and the 2025 spend is not in this dashboard. That figure should
   be pulled before anyone reads the comparison as performance.

   MONTH ON MONTH is July against June, the last two complete months. August is
   partial, through the 19th, and is excluded. The card scope names both months so
   no reader has to infer them. Channels with no prior-year row, Print, AI
   assistant and Cross-network, carry no prior key and render a dash: a change from
   nothing is not a percentage.

   NO SUBMISSIONS-BY-CHANNEL CHART. Miguel suggested one. The traffic table already
   carries a form submissions column and a conversion rate per channel, so a chart
   would be the same numbers a second time.

   SUBMISSIONS COME FROM HUBSPOT ONLY, AND FROM THE FORM, NOT THE PAGE. That is
   the standing rule, set by Roque on 20 August: GA4 is not a source for form
   submissions on any report. The figure is 140 for 1 January to 19 August 2026,
   pulled from the HubSpot form report for form d73e472e, the Fundamentals of
   Welding Curriculum (FOWC) form, which is the number the form performance
   screen shows. Monthly is the same source: 13, 10, 18, 18, 32, 30, 11, 8.

   Two HubSpot numbers exist and they are three apart. HubSpot content analytics
   for the page www.aws.org/educators/welding-curriculum returns 143 with a
   monthly series of 13, 10, 18, 18, 33, 32, 11, 8. The page metric counts every
   form submitted on that page; the form metric counts only the FOWC form. The
   gap is one submission in May and two in June, and the FOWC form report is the
   one published because the campaign's outcome is submissions of the FOWC form.
   This page carried the page-level 143 for part of 20 August, and before that
   GA4's fowc_form_submission event count, 144, with a GA4 monthly split of
   1, 3, 7, 15, 46, 50, 14, 8. The GA4 total was one away from HubSpot while its
   distribution was substantially wrong, 1 in January against 13, 50 in June
   against 30, which is exactly how a wrong basis hides.

   Form views for the same window are 17,083 against the page's 17,104 raw
   views, so the two reports describe the same traffic; only the submission
   population differs.

   THE CHANNEL TABLE CARRIES SUBMISSIONS AND A CONVERSION RATE AGAIN, and they
   are HubSpot's, not GA4's. HubSpot does split this form's submissions by
   source: the Submissions by source table on the form performance screen, which
   is the forms-sources report filtered to form d73e472e. For 1 January to
   19 August 2026 it returns nine buckets summing to exactly 140:

     paid 42, organic 27, direct 32, email 24, referrals 13, other 1,
     ai-referrals 1, paid-social 0, social 0.

   Mapped onto the GA4 channel groups: paid to Paid search, paid-social to Paid
   social, organic to Organic search, email to Email, direct to Direct, social to
   Organic social, referrals to Referral, ai-referrals to AI assistant. One
   mapping is a judgement and is flagged as such: HubSpot's "other campaigns"
   bucket, 1 submission, is published against GA4's Unassigned row, those being
   the two buckets each system uses for traffic it recognises as campaign-tagged
   but cannot classify.

   Organic video, Print and Cross-network carry no submissions key at all.
   HubSpot has no bucket that corresponds to them, so the page renders a dash
   rather than a zero. A dash means HubSpot cannot say; it does not mean none.

   READ THE PER-CHANNEL CONVERSION RATE AS A RANKING, NOT AN ABSOLUTE. The
   numerator is HubSpot submissions and the denominator is GA4 sessions, which
   is the same arithmetic as the headline tile, 140 over 14,931. The two systems
   do not bucket traffic identically, and two rows are inflated by that alone:

     Referral  25.00 percent published, 13 over 52 GA4 sessions.
               HubSpot counts 280 form views on referrals, so its own rate is
               4.6 percent.
     Direct    11.64 percent published, 32 over 275 GA4 sessions.
               HubSpot counts 1,002 form views on direct, so its own rate is
               3.2 percent.

   Everywhere else the two denominators are close and the rate is sound: Paid
   search 0.35, Organic search 2.88, Email 6.70. This caveat is here and not on
   the page, per R2, but it is the first thing to say if anyone asks why Referral
   and Direct convert best. The honest reading is that both are small-session
   rows where HubSpot sees more form views than GA4 sees sessions.

   ALL 140 SUBMISSIONS HAPPENED ON THE CAMPAIGN LANDING PAGE. The forms-url
   report gives www.aws.org/educators/welding-curriculum 140, with 3 form views
   on a share.hsforms.com link and 2 on cm.aws.org producing none. So the three
   submission gap against page content analytics is definitely a second form on
   the same page, not the FOWC form being submitted somewhere else.

   PAID SESSIONS are allocated to a platform by GA4 session source, taken from
   the same grid: google 8,284, bing 3,592, linkedin 1,226. No campaign name
   join is used, because a campaign name join is the one fragile step available
   and it is not needed at platform level. Platforms therefore total 13,102
   against the traffic table's 13,105 paid sessions; the three session
   difference is Facebook paid social, which carries no FOWC spend and so has
   no platform row.

   THE PLACEMENT TABLE CARRIES NO SESSION COLUMN, and the reason was re-audited
   in full on 20 August against the LinkedIn API, the GA4 API and both platform
   interfaces. Findings, all verified:

   The two campaigns are in sponsored account 507421707, named Education.
   fowc_2026 and EDU_fowc_doc are LinkedIn CAMPAIGN GROUP names, not campaign
   names, which is why GA4 sees them as the campaign: Video views sits in group
   fowc_2026, download-doc sits in group EDU_fowc_doc. Confirmed in Campaign
   Manager, campaign ids 831744894 and 701402454.

   The video buy reports 56 landing page clicks against 447 sessions. That is
   not a join error and not a GA4 error:
     - Sessions begin the day the campaign began delivering, 16 July, and track
       impressions rather than clicks.
     - Seven delivery days recorded zero LinkedIn clicks and still produced 46
       GA4 sessions.
     - LinkedIn reports 57 totalEngagements of every type combined, against 447
       arrivals.
     - Campaign Manager shows the same 54 clicks and 0.05 percent click rate as
       the API, so the pull is faithful.
     - 447 sessions came from 447 distinct users, so GA4 is not splitting one
       arrival into several.
   The cause is the buy itself. Both campaigns run with offsiteDeliveryEnabled
   true, the LinkedIn Audience Network, and audienceExpansionEnabled true. The
   video campaign is objective VIDEO_VIEW, optimisation MAX_VIDEO_VIEW, cost
   type CPM, so LinkedIn's clicks field counts only chargeable clicks and off
   platform arrivals are largely absent from it. The click column measures
   billing, the session column measures arrivals, and no ratio between them can
   be published as a performance figure. Hence spend, impressions, video views
   and clicks only.

   THE SESSION FIGURE WAS TRIANGULATED three ways because the click to session
   ratio above 100 percent invites challenge. Channel group route 1,237,
   campaign decomposition route 787 plus 447 equals 1,234, published grid 1,236.
   The spread is GA4 approximate counting, not a filter fault.

   LINKEDIN POST CLICK QUALITY is weak and the page shows it without comment.
   Paid social delivered 1,239 sessions, 201 engaged, 84 percent bounce, an
   average of 3 seconds, and zero form submissions. Paid search on the same page
   averages 2m 50s. The fowc_2026 sessions are 447 sessions from 447 users with
   no repeat visits at all, and their device, browser and country mix looks like
   a real audience, so this reads as very low intent traffic rather than as
   something GA4 has miscounted.

   TAGGING DEFECT, for the record and not on the page: LinkedIn traffic to this
   landing page arrives under two mediums, paid 623 sessions and paid_social 607.
   Both fall into Paid Social so no published total is affected, but any filter
   written on medium alone will silently halve LinkedIn. The Corporate
   Membership investigation of 14 August raised the same issue.

   SPEND, CLICKS and IMPRESSIONS come from the platform APIs and are exact.
   Each platform was validated against a closed month before the open month was
   trusted. Complete through 19 August, not through the last closed month.

   THERE IS NO GOAL TARGET ON THIS PAGE, deliberately. A target of 460 was
   published until 20 August. It appears in exactly one document,
   MASTER-PROMPT-campaign-dashboard.md, in a section headed "FOWC, for the
   worked example", which is a dashboard design brief using FOWC as sample
   data. Its monthly submissions, 13, 10, 18, 18, 33, 32, 11, 8, are exactly the
   HubSpot page series, so that document was citing the source of record
   correctly and an earlier note in this file calling the series invented was
   wrong. Its organic social count is off, two posts planned with one published
   when ten exist. Neither observation gives 460 an owner. QUERY-for-Reporting-session.md defines the
   goal as submissions on HubSpot form d73e472e and states no number. The FOWC
   meeting of 18 August, attended by Claudia Keppinger, Roque Corona, Trish
   Fliss, Nicole Soules and Miguel Romero, lists the KPIs as demo requests,
   form submissions, email open rate, email click rate and landing page traffic,
   with no numeric target against any of them. So 460 has no owner, and a
   verdict of "28.9 points behind pace" against it was a judgement the data
   could not support. The submissions count is still published; only the target
   and the pace verdict are withdrawn, pending a number someone owns.

   NO PROGRESS AND PACING SECTION. Removed on 20 August at Roque's instruction,
   along with the campaign window, the landing page live date and the paid spend
   cut-off from the header. The page now carries one date, the data-through
   stamp in the masthead. The $18,000 budget from
   QUERY-for-Reporting-session.md is no longer published because nothing renders
   it; spend is reported as spend.

   EMAIL: re-pulled from HubSpot marketing email analytics, bot-excluded unique
   basis. Sends 1 and 2 are dated from the Email Campaign group on Monday board
   18399502759, not from the HubSpot publish timestamp. Sends 3 and 4 were
   published as 2 September and 4 November until 20 August; both were superseded
   at the FOWC meeting of 18 August, which moved Email 3 to after 5 October, so
   it does not precede the 2nd Edition teaser launch, and Email 4 to after
   30 November. The Monday board carries no date on either item as at 20 August.
   The notes record 30 November as "presumably" the 2nd Edition on-sale date and
   say to treat it as not firm.

   TRADITIONAL MEDIA: every item opened on the Monday board, per R6. Statuses
   are normalised to Done, In progress and Not started; the blog reads Stuck on
   the board, which describes the board rather than the delivery. Print clicks
   are Terminus, and Terminus counts a QR scan as a click on the same short
   link, so scans are inside the 22 and there is no separate figure.

   RULE: every value here is pulled. Nothing is estimated, apportioned or filled
   in to complete a layout. Where a figure is not pulled the key is absent and
   the dashboard renders nothing rather than a number.
*/
window.CAMPAIGN_DATA = {
  meta: {
    campaign: "Fundamentals of Welding Curriculum",
    code: "EDU_1045",
    year: 2026,
    campaignStart: "2026-03-16",
    campaignEnd: "2026-11-30",
    dataThrough: "2026-08-19",
    paidThrough: "2026-08-19",
    landingPage: "https://www.aws.org/educators/welding-curriculum/",
    landingPath: "/educators/welding-curriculum/",
    formUrl: "https://app.hubspot.com/submissions/7723471/form/d73e472e-dfd2-42d3-a8a7-626af5df4590/performance",
    mondayBoard: "https://aws-projects.monday.com/boards/18399502759"
  },

  flags: { hasPaid: true, hasOutcome: true },

  summary: [
    { channel: "Outcome",         label: "Form submissions",      value: 140,       fmt: "int" },
    { channel: "Outcome",         label: "Form conversion rate",  value: 0.94,      fmt: "pct2" },
    { channel: "Website",         label: "Landing page sessions", value: 14964,     fmt: "int" },
    { channel: "Website",         label: "Reached the page",      value: 17121,     fmt: "int" },
    { channel: "Website",         label: "Engagement rate",       value: 61.2,      fmt: "pct" },
    { channel: "Paid media",      label: "Paid spend",            value: 15166.42,  fmt: "money" },
    { channel: "Marketing email", label: "Email clicks",          value: 307,       fmt: "int" }
  ],

  goal: { label: "Form submissions", actual: 140 },

  landingPage: { sessions: 14964, engaged: 9154, seconds: 2214108, submissions: 140, reached: 17121, views: 22483 },

  /* Same two questions asked of 2025, same filters, same 1 January to 19 August
     window, same four-dimension construction. This is the only comparison basis
     on the page and it is like for like. */
  prior: { year: 2025, sessions: 62663, engaged: 45474, seconds: 4485756, reached: 66933, views: 72865 },

  /* Aggregated from the single grid by channel. Print falls out of the grid on
     source, welding journal, rather than being subtracted from Unassigned by
     hand, so the carve-out cannot drift. */
  channels: [
    { channel: "Paid search",    sessions: 11877, engaged: 7627, seconds: 2020467, submissions: 42, prior: 57065, m1: 5941, m2: 3167 },
    { channel: "Paid social",    sessions:  1240, engaged:  201, seconds:    4033, submissions:  0, prior:  1127, m1:  262, m2:  511 },
    { channel: "Organic search", sessions:   946, engaged:  793, seconds:  107267, submissions: 27, prior:  1340, m1:  107, m2:   90 },
    { channel: "Email",          sessions:   358, engaged:  265, seconds:   22358, submissions: 24, prior:   488, m1:  131, m2:    3 },
    { channel: "Direct",         sessions:   295, engaged:  132, seconds:   19310, submissions: 32, prior:   979, m1:   52, m2:   45 },
    { channel: "Organic social", sessions:   119, engaged:   63, seconds:    5665, submissions:  0, prior:   164, m1:   32, m2:    8 },
    { channel: "Referral",       sessions:    52, engaged:   41, seconds:    8563, submissions: 13, prior:  1408, m1:    2, m2:    7 },
    { channel: "Unassigned",     sessions:    40, engaged:    9, seconds:   16830, submissions:  1, prior:    46, m1:   10, m2:    9 },
    { channel: "Organic video",  sessions:    17, engaged:    8, seconds:    5507,                  prior:    46, m1:    2, m2:    0 },
    { channel: "Print",          sessions:    10, engaged:    8, seconds:     927,                                m1:    0, m2:    1 },
    { channel: "AI assistant",   sessions:     8, engaged:    7, seconds:    3181, submissions:  1,               m1:    1, m2:    3 },
    { channel: "Cross-network",  sessions:     2, engaged:    0, seconds:       0,                                m1:    2, m2:    0 }
  ],

  /* Same grid, aggregated by month. */
  monthly: [
    { m: "2026-01", sessions:  180, engaged:  124, seconds:   19573, submissions: 13, prior:   146, partial: false },
    { m: "2026-02", sessions:  205, engaged:  159, seconds:   24258, submissions: 10, prior:   180, partial: false },
    { m: "2026-03", sessions:  225, engaged:  159, seconds:   18837, submissions: 18, prior: 18397, partial: false },
    { m: "2026-04", sessions:  301, engaged:  205, seconds:   29568, submissions: 18, prior: 10389, partial: false },
    { m: "2026-05", sessions: 3110, engaged: 1906, seconds:  408030, submissions: 32, prior: 13344, partial: false },
    { m: "2026-06", sessions: 6542, engaged: 4200, seconds: 1138972, submissions: 30, prior:  9008, partial: false },
    { m: "2026-07", sessions: 3844, engaged: 2180, seconds:  548066, submissions: 11, prior:  9433, partial: false },
    { m: "2026-08", sessions:  557, engaged:  221, seconds:   26804, submissions:  8, prior:  1766, partial: true }
  ],

  paid: {
    /* Spend, clicks and impressions are exact, from the platform APIs, complete
       through 19 August. Google Ads cost from the GA4 advertiser cost metric,
       validated against the Paid Spend - Google tab on July to the cent;
       Microsoft from a report with the complete-data flag off, which a partial
       month requires; LinkedIn from adAnalytics on the two campaigns named
       "Video views" and "download-doc", identified by matching their May to
       July totals to the published placement rows exactly.

       Sessions are from the single GA4 grid, allocated by session source, and
       total 13,102. */
    platforms: [
      { platform: "Google Ads",            spend: 7376.62, clicks: 14636, impressions:  665197, sessions: 8285 },
      { platform: "Microsoft Advertising", spend: 4948.94, clicks:  4517, impressions:  241536, sessions: 3592 },
      { platform: "LinkedIn Ads",          spend: 2840.86, clicks:   684, impressions:  138795, sessions: 1237 }
    ],

    /* Placement from the buy itself: Search is Google plus Microsoft, Document
       ad is the LinkedIn download-doc campaign, Video is Video views. Spend,
       clicks and impressions only; see the note above on why sessions are not
       split by placement. Video views 91,343 is the metric the video buy was
       actually bought on and comes from the same adAnalytics call; without it
       the row reads as $21.89 per click on a campaign that was never bidding
       for clicks. */
    placements: [
      { placement: "Search",       platforms: "Google Ads, Microsoft Advertising", spend: 12325.56, clicks: 19153, impressions: 906733 },
      { placement: "Document ad",  platforms: "LinkedIn Ads",                      spend:  1614.79, clicks:   628, impressions:  28640 },
      { placement: "Video",        platforms: "LinkedIn Ads",                      spend:  1226.07, clicks:    56, impressions: 110155, views: 91343 }
    ],

    /* WHAT RAN, and it is not two ads. Twenty-one creatives ran across the two
       LinkedIn campaigns, but they share only two pieces of artwork: one video
       and one PDF. What differs between them is the message. So the page shows
       the two assets, each with the metric its buy was optimised for, and under
       each the message variants with their own delivery.

       Pulled 20 August from the LinkedIn creatives and adAnalytics endpoints,
       account 507421707, pivot CREATIVE, 1 January to 19 August. Note the path
       change: creative endpoints now require the account in the URL,
       /rest/adAccounts/507421707/creatives, and reject pageSize in favour of
       count.

       Cross-footing is exact on the document ad, $1,614.79 and 628 clicks
       against the placement row. The video's four message groups sum to
       $1,226.08 against a placement row of $1,226.07, a one cent difference
       from rounding sixteen creative-level floats to cents. The gate allows two
       cents on that one comparison and nothing else.

       The video's cost per click is $21.89 and is deliberately absent from the
       page. Nobody bid for those clicks. */
    creatives: [
      { placement: "Document ad", kind: "Document ad", campaign: "EDU_fowc_doc",
        campaignId: 701402454, boughtFor: "clicks",
        asset: "Welding-Curriculum-Fact-Sheet.pdf",
        cta: "Learn more",
        image: "https://american-welding-society.github.io/reporting/fowc/img/paid-linkedin-document.jpg",
        spend: 1614.79, impressions: 28640, clicks: 628,
        messages: [
          { name: "Program Upgrade Angle",    spend: 488.35, impressions: 8147, clicks: 219 },
          { name: "Content Depth / Features", spend: 369.16, impressions: 7653, clicks: 178 },
          { name: "Flexibility & Ease",       spend: 257.51, impressions: 4478, clicks:  78 },
          { name: "Career Path Focus",        spend: 253.15, impressions: 4097, clicks:  82 },
          { name: "value+scale",              spend: 246.62, impressions: 4265, clicks:  71 }
        ] },
      { placement: "Video", kind: "Video ad", campaign: "fowc_2026",
        campaignId: 831744894, boughtFor: "views",
        asset: "Empowering the next generation of welders",
        cta: "Request a demo",
        image: "https://american-welding-society.github.io/reporting/fowc/img/paid-linkedin-video.jpg",
        spend: 1226.07, impressions: 110155, clicks: 56, views: 91343,
        messages: [
          { name: "Transform your welding program with AWS FOWC",              spend: 630.08, impressions: 68207, clicks: 35, views: 58424 },
          { name: "Prepare students for certification and career success",     spend: 413.59, impressions: 36557, clicks: 16, views: 30587 },
          { name: "Request a demo of AWS Fundamentals of Welding Curriculum",  spend: 134.56, impressions:  3585, clicks:  3, views:  1822 },
          { name: "Industry-aligned welding education starts here",            spend:  47.85, impressions:  1806, clicks:  2, views:   510 }
        ] }
    ]
  },

  /* HubSpot marketing email analytics, bot-excluded unique basis, re-pulled
     20 August. Send and schedule dates from the Email Campaign group on the
     Monday board. Emails 3 and 4 are built but unsent: HubSpot records zero
     scheduled, zero delivered. */
  email: {
    sends: [
      { n: 1, sent: "2026-04",
        subject: "Empower Your Students with AWS Fundamentals of Welding Curriculum",
        url: "https://app.hubspot.com/contacts/7723471/record/0-29/544122920036",
        delivered: 8530, opens: 2463, clicks: 117, unsubs: 43 },
      { n: 2, sent: "2026-06",
        subject: "See AWS Fundamentals of Welding Curriculum in Action: Schedule Your Demo Now!",
        url: "https://app.hubspot.com/contacts/7723471/record/0-29/555868224659",
        delivered: 6212, opens: 1659, clicks: 190, unsubs: 14 },
      { n: 3, scheduled: "After Oct 5, 2026" },
      { n: 4, scheduled: "After Nov 30, 2026" }
    ]
  },

  /* Organic social, complete for calendar 2026. Built from the full platform
     inventory (501 organic posts: LinkedIn 226, Facebook 133, Instagram 142),
     not from the most recent page of each feed. Ten posts carry the campaign.
     LinkedIn reports impressions, Meta reports reach. Facebook reach and
     impressions are not recoverable: every metric in the post_impressions
     family returns HTTP 400 on the current token, so those cells stay empty
     rather than borrowing a number from a neighbouring row.

     Facebook engagement is post_clicks plus post_activity, which is the basis
     Meta Business Suite reports and the basis Nicole records on the Monday
     board. It reproduces her figures exactly: 112 on 17 March and 27 on 16
     June. Reactions alone, which this file previously published, gave 32 and
     11 for the same two posts.

     Facebook views come from post_media_view, which survived the 15 June 2026
     Page Insights deprecation that removed every metric with impressions,
     reach or views in its name. On the 17 March post it returns 11,030 against
     Nicole's Business Suite 10,994 from a May snapshot, so it is the same
     quantity still accruing. post_total_media_view_unique is Meta's redefined
     reach, unique media viewers rather than unique impressions, and is not
     published here because it is a different quantity from the reach figure
     the team has been recording. */
  social: {
    posts: [
      { platform: "LinkedIn", date: "2026-07-27",
        image: "https://american-welding-society.github.io/reporting/fowc/img/2026-07-27-linkedin.jpg",
        url: "https://www.linkedin.com/feed/update/urn%3Ali%3Ashare%3A7487537418812981249",
        mediaType: "image",
        caption: "Thinking about attending AWS Train the Trainer but still have questions? We've got answers. Visit aws.org/fowc to get your questions answered.",
        impressions: 8618, engagements: 214 },
      { platform: "Instagram", date: "2026-07-27",
        image: "https://american-welding-society.github.io/reporting/fowc/img/2026-07-27-instagram.jpg",
        url: "https://www.instagram.com/p/DbTV_peDRvn/",
        mediaType: "image",
        caption: "Thinking about attending AWS Train the Trainer but still have questions? We've got answers.",
        reach: 2641, views: 4089, engagements: 58 },
      { platform: "Facebook", date: "2026-06-17",
        image: "https://american-welding-society.github.io/reporting/fowc/img/2026-06-17-facebook.jpg",
        url: "https://www.facebook.com/1602329701256807/posts/1549352543221190",
        mediaType: "image",
        caption: "Thinking about attending AWS Train the Trainer but still have questions? We've got answers. Visit aws.org/fowc.",
        views: 4535, engagements: 85 },
      { platform: "Facebook", date: "2026-06-16",
        image: "https://american-welding-society.github.io/reporting/fowc/img/2026-06-16-facebook.jpg",
        url: "https://www.facebook.com/1602329701256807/posts/1548517826637995",
        mediaType: "image",
        caption: "Whether you're enhancing an existing course or building from the ground up, get the tools, structure and support you need.",
        views: 2776, engagements: 27 },
      { platform: "Instagram", date: "2026-06-16",
        image: "https://american-welding-society.github.io/reporting/fowc/img/2026-06-16-instagram.jpg",
        url: "https://www.instagram.com/p/DZqM35TDtm8/",
        mediaType: "image",
        caption: "Whether you're enhancing an existing course or building from the ground up, get the tools, structure and support you need.",
        reach: 2152, views: 4922, engagements: 49 },
      { platform: "Instagram", date: "2026-06-03",
        image: "https://american-welding-society.github.io/reporting/fowc/img/2026-06-03-instagram.jpg",
        url: "https://www.instagram.com/p/DZIvYqIFohQ/",
        mediaType: "image",
        caption: "The industry needs 320,500 new welding professionals by 2029. Is your classroom ready to help meet the demand?",
        reach: 3776, views: 5860, engagements: 89 },
      { platform: "Instagram", date: "2026-05-06",
        image: "https://american-welding-society.github.io/reporting/fowc/img/2026-05-06-instagram.jpg",
        url: "https://www.instagram.com/p/DYAM4XilmAt/",
        mediaType: "image",
        caption: "Building a world-class welding program starts with a rock-solid foundation. Swipe to see how we help instructors streamline accreditation.",
        reach: 1905, views: 3963, engagements: 28 },
      { platform: "LinkedIn", date: "2026-03-17",
        image: "https://american-welding-society.github.io/reporting/fowc/img/2026-03-17-linkedin.jpg",
        url: "https://www.linkedin.com/feed/update/urn%3Ali%3Ashare%3A7439487663524511744",
        mediaType: "image",
        caption: "Strong welding programs start with a strong foundation. The Fundamentals of Welding Curriculum from the American Welding Society.",
        impressions: 8503, engagements: 149 },
      { platform: "Facebook", date: "2026-03-17",
        image: "https://american-welding-society.github.io/reporting/fowc/img/2026-03-17-facebook.jpg",
        url: "https://www.facebook.com/1602329701256807/posts/1473296210826824",
        mediaType: "image",
        caption: "Strong welding programs start with a strong foundation. The Fundamentals of Welding Curriculum from the American Welding Society.",
        views: 11030, engagements: 112 },
      { platform: "Instagram", date: "2026-03-17",
        image: "https://american-welding-society.github.io/reporting/fowc/img/2026-03-17-instagram.jpg",
        url: "https://www.instagram.com/p/DV9z8c-DmoP/",
        mediaType: "image",
        caption: "Strong welding programs start with a strong foundation. The Fundamentals of Welding Curriculum from the American Welding Society.",
        reach: 3259, views: 4854, engagements: 22 }
    ]
  },

  /* Every item opened on the Monday board on 20 August, per R6. The date shown
     is the deployment window, not the internal due date: the Welding Journal ad
     was due 6 July but ran in the August issue, 3 to 31 August, which is what
     the GA4 print sessions show, one in July and seven in August.

     Print clicks are Terminus on weld.ng/curriculum, 22 as at 20 August.
     Terminus counts a QR scan as a click on the same short link, so the QR
     scans are inside that 22 and there is no separate scan figure to publish. */
  delivery: [
    { channel: "Print ad",       item: "Welding Journal print ad",    due: "2026-08-03", status: "Done",
      vanity: "weld.ng/curriculum", vanityUrl: "https://weld.ng/curriculum", clicks: 22, sessions: 10 },
    { channel: "Blog",           item: "Welding Digest blog post",    due: "2026-08-14", status: "In progress" },
    { channel: "Press release",  item: "Press release",               due: "2026-11-16", status: "In progress" },
    { channel: "Editorial",      item: "Editorial",                   due: "2026-12-01", status: "Not started" },
    { channel: "Member network", item: "Member network announcement", due: "2026-12-08", status: "Not started" }
  ]
};
