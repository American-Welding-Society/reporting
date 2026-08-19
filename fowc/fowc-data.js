/* fowc-data.js — Fundamentals of Welding Curriculum, EDU_1045, 2026.
   Regenerated 19 August 2026.

   RULE: every value here is pulled. Nothing is estimated, apportioned or filled in to
   complete a layout. Where a figure is not pulled the key is absent or null and the
   dashboard renders nothing rather than a number.

   PAID SESSIONS: resolved 20 August, and the platform basis is the correct one.

       GA4 holds only 5,774 sessions under any campaign name containing "fowc" because
       most paid sessions arrive with sessionCampaignName (not set). PAIDC_month_
       recovers the campaign from the HubSpot ad parameters in the landing page query
       string, which restores the rest. Measured directly, sessions whose landing URL
       carries hsa_cam 23825879689:

         google / cpc, campaign name (not set)        8,259
         bing / cpc, campaign name edu_fowc_search    3,685

       So the platform figures are sound and are published here. The campaign-level
       total of 10,069 was the wrong one: it omitted a real 3,685-session row that
       carries no spend.

       The genuine defect this exposes is in the Microsoft account, not the pipeline.
       The Microsoft ads were imported from Google Ads and kept Google's hsa_cam in
       their final URLs, so 3,685 Bing sessions carry a Google campaign id. They are
       counted here under Microsoft Advertising, which is where they belong, and under
       Search, which is what they are.

   FORM SUBMISSIONS: resolved 20 August. The page fires a purpose-built event,
   fowc_form_submission. Scoped to sessions that landed on the campaign page it totals
   144 in 2026, against HubSpot's 143. One apart, so it is the form.

       Every submission figure on this dashboard now comes from that single event, so the
       headline, the monthly series and the channel split all reconcile to each other.
       The generic form_submit event fires 392 times on the page and is not the form;
       keyEvents returns 19,722 for paid search alone and is banned anyway.

       This also corrects the monthly series. The constants previously carried showed 13
       submissions in January and 10 in February, which cannot be right: the landing page
       went live on 11 May 2026. The event series reads 1, 3, 7, 15, 46, 50, 14, 8, which
       matches the page's own history.

   PRINT: resolved 20 August. welding journal / print sits inside Unassigned, 8 sessions
   and 7 engaged. It is broken out as its own row and those 8 sessions are removed from
   Unassigned, which drops from 47 to 39 and from 16 engaged to 9. No double count.

   ORGANIC SOCIAL: resolved 19 August. Complete calendar 2026 inventory across
   LinkedIn, Facebook and Instagram, reconciled against Nicole Soules' Monday board.
   See Claude-CAMPAIGN-DASHBOARDS.md sections 10 and 11.

   PAID SPEND: complete through 19 August, not through the last closed month.
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
    { channel: "Website",         label: "Landing page sessions", value: 14842,     fmt: "int" },
    { channel: "Website",         label: "Engagement rate",       value: 61.5,      fmt: "pct" },
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

  landingPage: { sessions: 14842, engaged: 9130, submissions: 144 },

  /* GA4, sessionDefaultChannelGroup, landing page filtered, 2026. The headline session and
     engagement figures come from this same query so the table and the strip agree. */
  channels: [
    { channel: "Paid search",    sessions: 11803, engaged: 7620, submissions: 65 },
    { channel: "Paid social",    sessions:  1228, engaged:  199, submissions:  0 },
    { channel: "Organic search", sessions:   935, engaged:  784, submissions: 31 },
    { channel: "Email",          sessions:   356, engaged:  263, submissions: 43 },
    { channel: "Direct",         sessions:   275, engaged:  129, submissions:  4 },
    { channel: "Organic social", sessions:   117, engaged:   63, submissions:  0 },
    { channel: "Referral",       sessions:    52, engaged:   41, submissions:  1 },
    { channel: "Unassigned",     sessions:    39, engaged:    9, submissions:  0 },
    { channel: "Organic video",  sessions:    17, engaged:    8, submissions:  0 },
    { channel: "AI assistant",   sessions:     8, engaged:    7, submissions:  0 },
    { channel: "Print",          sessions:     8, engaged:    7, submissions:  0 },
    { channel: "Cross-network",  sessions:     4, engaged:    0, submissions:  0 }
  ],
  monthly: [
    { m: "2026-01", sessions:  177, engaged:  124, submissions:  1, partial: false },
    { m: "2026-02", sessions:  196, engaged:  158, submissions:  3, partial: false },
    { m: "2026-03", sessions:  223, engaged:  159, submissions:  7, partial: false },
    { m: "2026-04", sessions:  300, engaged:  205, submissions: 15, partial: false },
    { m: "2026-05", sessions: 3064, engaged: 1893, submissions: 46, partial: false },
    { m: "2026-06", sessions: 6426, engaged: 4195, submissions: 50, partial: false },
    { m: "2026-07", sessions: 3781, engaged: 2181, submissions: 14, partial: false },
    { m: "2026-08", sessions:  535, engaged:  208, submissions:  8, partial: true }
  ],


  paid: {
    /* Complete through 19 August 2026. The Paid Campaign Cache is monthly and
       stops at the last closed month, so August was pulled directly: Google Ads
       cost from the GA4 advertiser cost metric, validated against the Google tab
       on July to the cent; Microsoft from a report with the complete-data flag
       off, which is what a partial month requires; LinkedIn from adAnalytics on
       the two campaigns named "Video views" and "download-doc", identified by
       matching their May to July totals to the published placement rows exactly.

       August adds: Google 0.00, Microsoft 24.00, LinkedIn 916.69. Google stopped
       spending on this campaign after July; LinkedIn is now the largest channel
       by sessions. Sessions are the platform basis, see the header. */
    platforms: [
      { platform: "Google Ads",            spend: 7376.62, clicks: 14636, impressions:  665197, sessions: 8490 },
      { platform: "Microsoft Advertising", spend: 4948.94, clicks:  4517, impressions:  241536, sessions: 4498 },
      { platform: "LinkedIn Ads",          spend: 2840.86, clicks:   684, impressions:  138794, sessions: 1229 }
    ],

    /* Placement type from the buy itself: Campaign ID Map channel SEARCH for the Google
       campaign, tactic Search on the Microsoft rows, tactic Document on EDU_fowc_doc, and
       the LinkedIn ad set literally named Video views under group fowc_2026. */
    placements: [
      { placement: "Search",       platforms: "Google Ads, Microsoft Advertising", spend: 12325.56, clicks: 19153, impressions: 906733, sessions: 12988 },
      { placement: "Document ad",  platforms: "LinkedIn Ads",                      spend:  1614.79, clicks:   628, impressions:  28640, sessions:   792 },
      { placement: "Video",        platforms: "LinkedIn Ads",                      spend:  1226.07, clicks:    56, impressions: 110154, sessions:   437 }
    ]
  },

  email: {
    sends: [
      { n: 1, sent: "2026-04",
        subject: "Empower Your Students with AWS Fundamentals of Welding Curriculum",
        delivered: 8530, opens: 2463, clicks: 117, unsubs: 43 },
      { n: 2, sent: "2026-06",
        subject: "See AWS Fundamentals of Welding Curriculum in Action: Schedule Your Demo Now!",
        delivered: 6212, opens: 1659, clicks: 190, unsubs: 14 },
      { n: 3, scheduled: "after Oct 5, 2026" },
      { n: 4, scheduled: "after Nov 30, 2026" }
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
     11 for the same two posts. */
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
        engagements: 85 },
      { platform: "Facebook", date: "2026-06-16",
        image: "https://american-welding-society.github.io/reporting/fowc/img/2026-06-16-facebook.jpg",
        url: "https://www.facebook.com/1602329701256807/posts/1548517826637995",
        mediaType: "image",
        caption: "Whether you're enhancing an existing course or building from the ground up, get the tools, structure and support you need.",
        engagements: 27 },
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
        engagements: 112 },
      { platform: "Instagram", date: "2026-03-17",
        image: "https://american-welding-society.github.io/reporting/fowc/img/2026-03-17-instagram.jpg",
        url: "https://www.instagram.com/p/DV9z8c-DmoP/",
        mediaType: "image",
        caption: "Strong welding programs start with a strong foundation. The Fundamentals of Welding Curriculum from the American Welding Society.",
        reach: 3259, views: 4854, engagements: 22 }
    ]
  },

  delivery: [
    { channel: "Print ad",       item: "Welding Journal print ad",    due: "2026-07-06", status: "Done",
      vanity: "weld.ng/curriculum", vanityUrl: "https://weld.ng/curriculum", clicks: 21, sessions: 8 },
    { channel: "Blog",           item: "Welding Digest blog post",    due: "2026-08-14", status: "In progress" },
    { channel: "Press release",  item: "Press release",               due: "2026-11-16", status: "In progress" },
    { channel: "Editorial",      item: "Editorial",                   due: "2026-12-01", status: "Not started" },
    { channel: "Member network", item: "Member network announcement", due: "2026-12-08", status: "Not started" }
  ]
};
