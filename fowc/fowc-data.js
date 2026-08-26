/* fowc-data.js — Fundamentals of Welding Curriculum, EDU_1045, 2026.
   Rebuilt 20 August 2026 after a full source audit. Every figure below was
   traced to a named system on that date; nothing is inherited unverified.

   THE PAGE COUNTS EVERYONE WHO REACHED THE CURRICULUM PAGE, not only those who
   landed on it. Changed 20 August at Roque's instruction, after Miguel Romero
   pointed out that a landing page measure cannot see a visitor who enters aws.org
   elsewhere and navigates in. The filter is unifiedPagePathScreen CONTAINS
   'educators/welding-curriculum'. Sessions are 17,146 for 1 January to 19 August,
   against 14,964 on the old landing page basis: 2,182 sessions, 13 percent of the
   total, were invisible before.

   Everything moved together. The tile, the timeline, the channel table, the paid
   session column and the conversion rate are all on the new basis, because a page
   where the table foots to one number and the tile above it shows another is a
   page nobody trusts. The prior landing page filter had its own defect, a trailing
   slash that dropped 33 sessions, found the same day and fixed before the switch.

   ENGAGEMENT TIME NOW MEANS TIME ON THIS PAGE. This is the consequence of the
   switch that is easiest to miss. With a landing page filter, GA4's engagement
   duration covers the whole session wherever it went, and averaged 2m 28s. With a
   page filter it covers this page only, and averages 36s. The second is the more
   useful number and the one a reader assumes they are looking at, but it is not
   comparable to anything published before 20 August.

   ONE QUERY. GA4 counts sessions with an approximate distinct algorithm, so the
   same question answered with a different number of dimensions comes back
   different. So the header, the timeline, the traffic table, the print row, the
   paid session column and the comparisons are all aggregations of a single query,
   month x channel x source x campaign, run once for 2026 and once for 2025. Every
   total adds up by construction, and the year on year is like for like because
   both sides were built the same way.

   NO MONTH ON MONTH AND NO YEAR ON YEAR. Both were added on 20 August at
   Miguel's recommendation and removed the same day. The year comparison is not
   like for like: this page carried roughly 55,000 paid search sessions in 2025
   against 11,900 in 2026, so a minus 76 percent reads as campaign failure when
   what changed is the media plan. The only thing that would stop a reader
   drawing that conclusion is a paragraph of explanation, and R2 keeps the
   paragraph off the page, so the number cannot be published responsibly. Month
   on month measured the flight plan rather than performance: June was the
   heaviest delivery month, so every channel read down in July regardless. The
   prior-year and two-month keys were removed from this file as well, because a
   removed section takes its data with it. Miguel gets the comparisons through a
   saved analytics exploration instead.

   THE TRAIN THE TRAINER POSTS LEFT THE SOCIAL SECTION on 20 August, Nicole's
   call: they promoted Train the Trainer rather than the curriculum. Three posts
   went, seven remain, and engagements fall from 833 to 476. The largest single
   post in the section was one of the three, so the drop is real and expected
   rather than a fault.

   MONTH ON MONTH is July against June, the last two complete months. August is
   partial, through the 19th, and is excluded. The card scope names both months so
   no reader has to infer them. Channels with no prior-year row carry no prior key
   and render a dash: a change from nothing is not a percentage.

   NO SUBMISSIONS-BY-CHANNEL CHART. Miguel suggested one. The traffic table already
   carries a form submissions column and a conversion rate per channel, so a chart
   would be the same numbers a second time. A chart has to add a comparison the
   table cannot make.

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

   VIDEO ASSETS are not campaign delivery and the page says so. Claudia's
   framing, 20 August: include them because they are live, reusable, and show
   the look, feel and messaging lining up, not because this campaign produced
   them. Four of the five were published in 2025 and one in 2020.

   Titles, publish dates, durations and view counts were read from the YouTube
   watch pages on 20 August 2026, from the American Welding Society channel.
   VIEWS ARE LIFETIME, not campaign window. A windowed figure needs YouTube
   Analytics access with the channel owner's consent, which the pipeline does
   not have, so the card says lifetime and no rate is computed against them.

   LONG FORM AND SHORTS ARE TOTALLED SEPARATELY, deliberately. A Short registers
   a view almost immediately while long form needs watch time, so one combined
   number would flatter the total and mean nothing. Long form 12,720 across
   three assets, Shorts 1,918 across two.

   Nicole described RbN7M9TumCQ as the 2020 original rebranded. The watch page
   gives its publish date as 25 March 2025 and its length as 174 seconds, the
   same length as the 2020 original 0_lISK-tZMY. So it is a re-upload of the
   same cut rather than an edit of the original listing, and the re-upload
   started its view count from zero: the 2020 original holds 10,111 views and
   the rebranded copy 1,305.

   ONLY ONE OF THE FIVE LINKS TO THE LANDING PAGE. The 2020 original carries the
   curriculum URL in its description. The rebranded re-upload, the testimonial
   and both Shorts carry no link to it at all, and none of the five carries utm
   parameters. That is recorded here rather than on the page, per R2, and it is
   why the Organic video channel row is small.

   THUMBNAILS ARE HOTLINKED to i.ytimg.com rather than copied into the repo, the
   opposite of the organic social gallery. Social platforms serve signed URLs
   that expire; YouTube thumbnail URLs are stable and public, so there is
   nothing to rot.

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
    dataThrough: "2026-08-24",
    paidThrough: "2026-08-19",
    landingPage: "https://www.aws.org/educators/welding-curriculum/",
    landingPath: "/educators/welding-curriculum/",
    formUrl: "https://app.hubspot.com/submissions/7723471/form/d73e472e-dfd2-42d3-a8a7-626af5df4590/performance",
    mondayBoard: "https://aws-projects.monday.com/boards/18399502759"
 },

  flags: { hasPaid: true, hasOutcome: true },

  summary: [
    { channel: "Outcome",         label: "Form submissions",      value: 142,       fmt: "int" },
    { channel: "Outcome",         label: "Form conversion rate",  value: 0.82,      fmt: "pct2" },
    { channel: "Website",         label: "Sessions on the page",  value: 17278,     fmt: "int" },
    { channel: "Website",         label: "Engagement rate",       value: 65.1,      fmt: "pct" },
    { channel: "Paid media",      label: "Paid spend",            value: 15166.42,  fmt: "money" },
    { channel: "Marketing email", label: "Email clicks",          value: 366,       fmt: "int" }
  ],

  goal: { label: "Form submissions", actual: 142 },

  landingPage: { sessions: 17278, engaged: 11256, seconds: 617668, views: 22642, submissions: 142 },

  /* Same two questions asked of 2025, same filters, same 1 January to 19 August
     window, same four-dimension construction. This is the only comparison basis
     on the page and it is like for like. */

  /* Aggregated from the single grid by channel. Print falls out of the grid on
     source, welding journal, rather than being subtracted from Unassigned by
     hand, so the carve-out cannot drift. */
  channels: [
    { channel: "Paid search",     sessions: 12263, engaged: 7940, seconds:  410520, submissions:  42 },
    { channel: "Organic search",  sessions:  2082, engaged: 1903, seconds:  123509, submissions:  28 },
    { channel: "Paid social",     sessions:  1304, engaged:  212, seconds:    3986, submissions:   0 },
    { channel: "Direct",          sessions:   721, engaged:  545, seconds:   38720, submissions:  33 },
    { channel: "Email",           sessions:   444, engaged:  343, seconds:   16052, submissions:  24 },
    { channel: "Referral",        sessions:   176, engaged:  161, seconds:   11836, submissions:  13 },
    { channel: "Organic social",  sessions:   131, engaged:   74, seconds:    4168, submissions:   0 },
    { channel: "Unassigned",      sessions:    82, engaged:   17, seconds:    3121, submissions:   1 },
    { channel: "AI assistant",    sessions:    26, engaged:   25, seconds:    1904, submissions:   1 },
    { channel: "Organic video",   sessions:    22, engaged:   13, seconds:    2271 },
    { channel: "Print",           sessions:    14, engaged:   12, seconds:     899 },
    { channel: "Display",         sessions:     7, engaged:    7, seconds:     588 },
    { channel: "Cross-network",   sessions:     4, engaged:    2, seconds:      80 },
    { channel: "Paid shopping",   sessions:     1, engaged:    1, seconds:       7 },
    { channel: "SMS",             sessions:     1, engaged:    1, seconds:       7 }
  ],

  /* Same grid, aggregated by month. */
  monthly: [
    { m: "2026-01", sessions:  359, engaged:  291, seconds:  19756, submissions: 13, partial: false },
    { m: "2026-02", sessions:  325, engaged:  275, seconds:  18193, submissions: 10, partial: false },
    { m: "2026-03", sessions:  382, engaged:  307, seconds:  22185, submissions: 18, partial: false },
    { m: "2026-04", sessions:  466, engaged:  359, seconds:  31583, submissions: 18, partial: false },
    { m: "2026-05", sessions: 3487, engaged: 2255, seconds: 128202, submissions: 32, partial: false },
    { m: "2026-06", sessions: 7221, engaged: 4807, seconds: 249710, submissions: 30, partial: false },
    { m: "2026-07", sessions: 4213, engaged: 2538, seconds: 124279, submissions: 11, partial: false },
    { m: "2026-08", sessions:  825, engaged:  424, seconds:  23760, submissions: 10, partial: true }
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
      { platform: "Google Ads",            spend: 7376.62, clicks: 14636, impressions:  665197, sessions: 8476 },
      { platform: "Microsoft Advertising", spend: 4948.94, clicks:  4517, impressions:  241536, sessions: 3788 },
      { platform: "LinkedIn Ads",          spend: 2840.86, clicks:   684, impressions:  138795, sessions: 1301 }
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
    /* Two kinds of send, and they are not comparable, so the table groups them.
       A DEDICATED send is the campaign's own email: the whole audience, the
       whole message, so delivered, opens, clicks and unsubscribes all belong to
       FOWC. An INCLUSION is a slot inside a newsletter that went out for its own
       reasons. Its delivered, opens and unsubscribes belong to the newsletter,
       not to this campaign, so those cells carry no key and render a dash. Only
       the clicks on the FOWC link are the campaign's, and that is the only
       figure an inclusion row publishes.

       The inclusion figure is HubSpot's Top clicked links for that send, read
       against the exact URL https://www.aws.org/educators/welding-curriculum/.
       This Week in Welding on 19 May 2026 sent 58 clicks to the page out of 460
       clicks on the newsletter as a whole.

       Society Newsletter Q2 2026, 27 June, was checked and is deliberately
       absent. All four pages of its Top clicked links were read and no
       curriculum link appears in any of them, so it produced no measurable
       clicks to the page. Its rendered text matches a search for "fowc" but
       that match is not a clicked link. Absent beats a zero nobody can source.

       Delivered, opens and clicks were re-pulled on 27 August. HubSpot restates
       engagement after a send, so Email 1 now reads 2,464 opens against the
       2,463 published on 20 August, and Email 2 reads 1,661 and 191 against
       1,659 and 190. Restatement, not a correction. */
    sends: [
      { n: 1, group: "dedicated", sent: "2026-04",
        subject: "Empower Your Students with AWS Fundamentals of Welding Curriculum",
        url: "https://app.hubspot.com/contacts/7723471/record/0-29/544122920036",
        delivered: 8530, opens: 2464, clicks: 117, unsubs: 43 },
      { n: 2, group: "dedicated", sent: "2026-06",
        subject: "See AWS Fundamentals of Welding Curriculum in Action: Schedule Your Demo Now!",
        url: "https://app.hubspot.com/contacts/7723471/record/0-29/555868224659",
        delivered: 6212, opens: 1661, clicks: 191, unsubs: 14 },
      { group: "inclusion", sent: "2026-05",
        subject: "This Week in Welding, 19 May",
        url: "https://app.hubspot.com/contacts/7723471/record/0-29/557221188021",
        clicks: 58 },
      { n: 3, group: "dedicated", scheduled: "After Oct 5, 2026" },
      { n: 4, group: "dedicated", scheduled: "After Nov 30, 2026" }
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
  /* Live assets, produced before this campaign. Views are lifetime. */
  video: {
    assets: [
      { id: "0_lISK-tZMY", format: "Long form", published: "2020-07-25", seconds: 174, views: 10111,
        title: "American Welding Society Fundamentals Of Welding Curriculum (FOWC) Package Overview" },
      { id: "8-PA6Oobt9E", format: "Short",     published: "2025-10-07", seconds:  55, views:  1405,
        title: "How AWS Curriculum Prepares Students for Real-World Welding Jobs" },
      { id: "RbN7M9TumCQ", format: "Long form", published: "2025-03-25", seconds: 174, views:  1305,
        title: "AWS Fundamentals of Welding Curriculum (FOWC) Welding Program for High Schools & Colleges" },
      { id: "AOKbEhnYMOQ", format: "Long form", published: "2025-09-02", seconds: 196, views:  1304,
        title: "Why Welding Educators Choose AWS Fundamentals of Welding Curriculum (FOWC)" },
      { id: "NBiy8J7DN1U", format: "Short",     published: "2025-06-12", seconds:  30, views:   513,
        title: "The Fundamentals of Welding Curriculum (FOWC): The Welding Curriculum Is Changing the Classroom" }
    ]
 },

  social: {
    posts: [
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
    /* The artwork is the file from the Design WJ Print Ad subitem on the Monday
       board, EDU_1045_2026_FOWC_AD FP.pdf, page one rendered to an image. The QR
       code on it points at the same weld.ng short link, and Terminus counts a scan
       as a click on that link, so scans are inside the 22 and there is no separate
       figure to publish. */
    { channel: "Print ad",       item: "Welding Journal print ad",    due: "2026-08-03", status: "Done",
      vanity: "weld.ng/curriculum", vanityUrl: "https://weld.ng/curriculum", clicks: 22, sessions: 14,
      headline: "Prepare students for success in welding",
      asset: "EDU_1045_2026_FOWC_AD FP.pdf",
      placement: "Full page, Welding Journal, August 2026 issue",
      image: "https://american-welding-society.github.io/reporting/fowc/img/print-wj-ad.jpg" },
    { channel: "Blog",           item: "Welding Digest blog post",    due: "2026-08-14", status: "In progress" },
    { channel: "Press release",  item: "Press release",               due: "2026-11-16", status: "In progress" },
    { channel: "Editorial",      item: "Editorial",                   due: "2026-12-01", status: "Not started" },
    { channel: "Member network", item: "Member network announcement", due: "2026-12-08", status: "Not started" }
  ]
};
