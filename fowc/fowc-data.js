/* fowc-data.js — Fundamentals of Welding Curriculum, EDU_1045, 2026.
   Rebuilt 20 August 2026 after a full source audit. Every figure below was
   traced to a named system on that date; nothing is inherited unverified.

   ONE QUERY. GA4 counts sessions with an approximate distinct algorithm, so the
   same question answered with a different number of dimensions comes back
   different: 14,758 at zero dimensions, 14,845 by channel, 14,706 by month,
   14,734 by month and channel, 14,920 by month, channel, source and campaign.
   None is more correct and no mixture of them cross foots. So the header, the
   timeline, the traffic table, the print row and the paid session column are
   all aggregations of a single query, month x channel x source x campaign,
   197 cells, no (other) rows. Every total on the page therefore adds up by
   construction rather than by luck.

   SUBMISSIONS are event counts, which GA4 sums exactly rather than estimating.
   fowc_form_submission returns 144 at every dimension count. HubSpot's form
   performance page reports 143. GA4 is published because it is the only source
   that can also split by channel and by month, and using two sources for one
   quantity is what stops a page adding up. The one record difference is noted
   rather than reconciled.

   PAID SESSIONS are allocated to a platform by GA4 session source, taken from
   the same grid: google 8,284, bing 3,592, linkedin 1,226. No campaign name
   join is used, because a campaign name join is the one fragile step available
   and it is not needed at platform level. Platforms therefore total 13,102
   against the traffic table's 13,105 paid sessions; the three session
   difference is Facebook paid social, which carries no FOWC spend and so has
   no platform row.

   THE PLACEMENT TABLE CARRIES NO SESSION COLUMN. Splitting LinkedIn between
   the document ad and the video buy does need the campaign name join, and on
   20 August that join was traced end to end: the LinkedIn campaigns are in
   sponsored account 507421707, not 507112113 where the pipeline had been
   looking, and their creatives store an untagged landing page URL because
   LinkedIn appends utm_campaign, utm_content and utm_term at serve time. GA4
   confirms it, with utm_term "Video views" and utm_content naming the video
   asset. The join is sound. What it produces is not publishable: the video buy
   reports 56 landing page clicks against 439 sessions from 439 distinct users,
   an eight to one gap in the opposite direction from the LinkedIn gap the
   Corporate Membership investigation of 14 August measured, where 4,339 clicks
   produced 749 sessions. Both figures are pulled and neither can be shown to be
   the wrong one, so the placement table reports the buy only.

   LINKEDIN POST CLICK QUALITY is weak and the page shows it without comment.
   Paid social delivered 1,229 sessions, 199 engaged, 84 percent bounce, an
   average of 3.3 seconds, and zero form submissions. Paid search on the same
   page averages 171 seconds. The fowc_2026 sessions are 445 sessions from 445
   users with no repeat visits at all.

   SPEND, CLICKS and IMPRESSIONS come from the platform APIs and are exact.
   Each platform was validated against a closed month before the open month was
   trusted. Complete through 19 August, not through the last closed month.

   GOAL 460 and BUDGET 18,000: MASTER-PROMPT-campaign-dashboard.md and
   QUERY-for-Reporting-session.md. Budget is $6,000 each on Google Ads,
   Microsoft Advertising and LinkedIn Ads. CAMPAIGN WINDOW and LANDING PAGE
   LIVE date: the same two documents.

   EMAIL: re-pulled from HubSpot marketing email analytics, bot-excluded unique
   basis. Send dates and the two forward schedules come from the Email Campaign
   group on Monday board 18399502759, not from the HubSpot publish timestamp.

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
    landingPageLive: "2026-05-11",
    paidThrough: "2026-08-19",
    landingPage: "https://www.aws.org/educators/welding-curriculum/",
    landingPath: "/educators/welding-curriculum/",
    formUrl: "https://app.hubspot.com/submissions/7723471/form/d73e472e-dfd2-42d3-a8a7-626af5df4590/performance",
    mondayBoard: "https://aws-projects.monday.com/boards/18399502759"
  },

  flags: { hasPaid: true, hasOutcome: true },

  summary: [
    { channel: "Outcome",         label: "Form submissions",      value: 144,       fmt: "int" },
    { channel: "Outcome",         label: "Form conversion rate",  value: 0.97,      fmt: "pct2" },
    { channel: "Website",         label: "Landing page sessions", value: 14920,     fmt: "int" },
    { channel: "Website",         label: "Engagement rate",       value: 61.2,      fmt: "pct" },
    { channel: "Paid media",      label: "Paid spend",            value: 15166.42,  fmt: "money" },
    { channel: "Marketing email", label: "Email clicks",          value: 307,       fmt: "int" }
  ],

  goal: { label: "Form submissions", actual: 144, target: 460 },

  pacing: {
    daysElapsed: 156,
    daysTotal: 259,
    budget: 18000,
    spend: 15166.42,
    goalActual: 144,
    goalTarget: 460
  },

  landingPage: { sessions: 14920, engaged: 9138, submissions: 144 },

  /* Aggregated from the single grid by channel. Print falls out of the grid on
     source, welding journal, rather than being subtracted from Unassigned by
     hand, so the carve-out cannot drift. */
  channels: [
    { channel: "Paid search",    sessions: 11876, engaged: 7627, submissions: 65 },
    { channel: "Paid social",    sessions:  1229, engaged:  199, submissions:  0 },
    { channel: "Organic search", sessions:   937, engaged:  784, submissions: 31 },
    { channel: "Email",          sessions:   358, engaged:  264, submissions: 43 },
    { channel: "Direct",         sessions:   275, engaged:  129, submissions:  4 },
    { channel: "Organic social", sessions:   117, engaged:   63, submissions:  0 },
    { channel: "Referral",       sessions:    52, engaged:   41, submissions:  1 },
    { channel: "Unassigned",     sessions:    39, engaged:    9, submissions:  0 },
    { channel: "Organic video",  sessions:    17, engaged:    8, submissions:  0 },
    { channel: "Print",          sessions:     8, engaged:    7, submissions:  0 },
    { channel: "AI assistant",   sessions:     8, engaged:    7, submissions:  0 },
    { channel: "Cross-network",  sessions:     4, engaged:    0, submissions:  0 }
  ],

  /* Same grid, aggregated by month. */
  monthly: [
    { m: "2026-01", sessions:  177, engaged:  124, submissions:  1, partial: false },
    { m: "2026-02", sessions:  196, engaged:  158, submissions:  3, partial: false },
    { m: "2026-03", sessions:  223, engaged:  159, submissions:  7, partial: false },
    { m: "2026-04", sessions:  301, engaged:  205, submissions: 15, partial: false },
    { m: "2026-05", sessions: 3100, engaged: 1905, submissions: 46, partial: false },
    { m: "2026-06", sessions: 6541, engaged: 4200, submissions: 50, partial: false },
    { m: "2026-07", sessions: 3843, engaged: 2179, submissions: 14, partial: false },
    { m: "2026-08", sessions:  539, engaged:  208, submissions:  8, partial: true }
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
      { platform: "Google Ads",            spend: 7376.62, clicks: 14636, impressions:  665197, sessions: 8284 },
      { platform: "Microsoft Advertising", spend: 4948.94, clicks:  4517, impressions:  241536, sessions: 3592 },
      { platform: "LinkedIn Ads",          spend: 2840.86, clicks:   684, impressions:  138794, sessions: 1226 }
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
      { placement: "Video",        platforms: "LinkedIn Ads",                      spend:  1226.07, clicks:    56, impressions: 110154, views: 91343 }
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
      { n: 3, scheduled: "Sep 2, 2026" },
      { n: 4, scheduled: "Nov 4, 2026" }
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
      vanity: "weld.ng/curriculum", vanityUrl: "https://weld.ng/curriculum", clicks: 22, sessions: 8 },
    { channel: "Blog",           item: "Welding Digest blog post",    due: "2026-08-14", status: "In progress" },
    { channel: "Press release",  item: "Press release",               due: "2026-11-16", status: "In progress" },
    { channel: "Editorial",      item: "Editorial",                   due: "2026-12-01", status: "Not started" },
    { channel: "Member network", item: "Member network announcement", due: "2026-12-08", status: "Not started" }
  ]
};
