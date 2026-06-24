"""Seed the database with 5 realistic meetings."""
import json
import uuid
from datetime import datetime, timedelta

from database import engine, SessionLocal, Base
from models import Meeting, Transcript, Summary, ActionItem

Base.metadata.create_all(bind=engine)


# ── helpers ───────────────────────────────────────────────────────────────────

def seg(speaker: str, text: str, start: float, end: float) -> dict:
    return {"id": str(uuid.uuid4()), "speaker": speaker, "text": text,
            "start_time": start, "end_time": end}


def chapter(title: str, start: float, summary: str) -> dict:
    return {"title": title, "start_time": start, "summary": summary}


# ── meeting 1: Q4 product roadmap ─────────────────────────────────────────────

M1_SEGMENTS = [
    seg("Sarah Chen", "Good morning everyone. Let's kick off our Q4 product roadmap planning session. We have a lot to cover today.", 0, 8),
    seg("James Park", "Morning Sarah. Before we dive in, should we quickly recap where Q3 landed?", 8, 14),
    seg("Sarah Chen", "Great idea. Q3 was strong — we hit 94% of our feature commitments. The mobile redesign shipped two weeks early.", 14, 22),
    seg("Priya Nair", "The mobile redesign numbers are fantastic. Daily actives jumped 28% week over week after launch.", 22, 30),
    seg("Tom Reeves", "Engineering is ready to double down on performance next quarter. We've identified the top three bottlenecks.", 30, 38),
    seg("Sarah Chen", "Perfect. For Q4, the three pillars are: AI-powered insights, collaboration features, and infrastructure hardening.", 38, 48),
    seg("James Park", "On the AI insights side, we're looking at smart meeting summaries, action item extraction, and speaker sentiment analysis.", 48, 58),
    seg("Priya Nair", "From the product side, users have been asking for automated follow-up emails based on action items. That's a quick win.", 58, 68),
    seg("Tom Reeves", "We can ship that in three weeks if we prioritize it. The LLM integration is already stubbed out.", 68, 76),
    seg("Sarah Chen", "Let's put that in the sprint one slot. James, what's the timeline for collaboration features?", 76, 84),
    seg("James Park", "Shared workspaces by end of October, real-time commenting in November, and team dashboards by early December.", 84, 94),
    seg("Priya Nair", "We should also invest in the onboarding funnel. Activation rate is at 41% — we want to hit 60% this quarter.", 94, 104),
    seg("Tom Reeves", "Infrastructure: we're migrating to Kubernetes, adding a CDN layer for transcripts, and moving to Postgres from SQLite in prod.", 104, 115),
    seg("Sarah Chen", "All of that needs to be invisible to users. Zero downtime migration is a hard requirement.", 115, 123),
    seg("James Park", "Agreed. We'll do shadow mode for two weeks before the cutover.", 123, 130),
    seg("Priya Nair", "I'd also like to schedule a mid-quarter review in early November to check our velocity.", 130, 138),
    seg("Tom Reeves", "And we need to nail down the on-call rotation before the Kubernetes migration. That's a risk area.", 138, 146),
    seg("Sarah Chen", "I'll own the mid-quarter review calendar invite. Tom, can you draft the on-call rotation by Friday?", 146, 154),
    seg("Tom Reeves", "Done. I'll also send out the migration risk doc to the team by EOD Wednesday.", 154, 161),
    seg("Sarah Chen", "Great session everyone. Let's sync again in two weeks to review sprint progress. Any final questions?", 161, 170),
    seg("James Park", "No blockers from my side. Let's ship a great Q4.", 170, 176),
    seg("Priya Nair", "Same here. Excited about the AI features.", 176, 181),
]

M1_SUMMARY = {
    "overview": "The team aligned on three strategic pillars for Q4: AI-powered insights (smart summaries, action item extraction, sentiment analysis), collaboration features (shared workspaces, commenting, team dashboards), and infrastructure hardening (Kubernetes migration, CDN, database upgrade). Q3 ended strong at 94% feature completion with the mobile redesign delivering 28% DAU growth. Key milestones were confirmed: automated follow-up emails in sprint 1, shared workspaces by end of October, real-time commenting in November, and team dashboards in early December. A mid-quarter review is scheduled for early November.",
    "key_topics": ["Q4 Roadmap", "AI Insights", "Collaboration Features", "Infrastructure Migration", "Mobile Redesign", "Onboarding Funnel", "On-call Rotation"],
    "chapters": [
        chapter("Q3 Recap", 0, "Q3 closed at 94% of commitments. Mobile redesign shipped early and drove a 28% week-over-week increase in daily actives."),
        chapter("Q4 Strategic Pillars", 38, "Three pillars defined: AI-powered insights, collaboration features, and infrastructure hardening."),
        chapter("AI Insights Roadmap", 48, "Smart meeting summaries, action item extraction, and speaker sentiment analysis planned. Automated follow-up emails identified as sprint 1 quick win."),
        chapter("Collaboration Features Timeline", 84, "Shared workspaces by end of October, real-time commenting in November, team dashboards in December."),
        chapter("Infrastructure & Risks", 104, "Kubernetes migration with shadow-mode rollout, CDN addition, Postgres upgrade. On-call rotation and migration risk doc flagged as action items."),
    ],
}

M1_ACTION_ITEMS = [
    ("Sarah Chen schedules mid-quarter review for early November", "Sarah Chen", "2024-11-01"),
    ("Tom Reeves drafts on-call rotation and sends to team by Friday", "Tom Reeves", "2024-10-04"),
    ("Tom Reeves sends migration risk doc to team by EOD Wednesday", "Tom Reeves", "2024-10-02"),
    ("James Park finalizes collaboration features spec", "James Park", "2024-10-07"),
    ("Priya Nair defines activation rate targets and funnel OKRs", "Priya Nair", "2024-10-07"),
]

# ── meeting 2: engineering standup ────────────────────────────────────────────

M2_SEGMENTS = [
    seg("Alex Kim", "Good morning team. Let's do a quick standup. I'll start — yesterday I finished the API rate-limiting middleware and it's in PR review.", 0, 9),
    seg("Maria Santos", "Nice work Alex. I was blocked on the auth token refresh logic — found the root cause, it was a race condition in the token cache.", 9, 18),
    seg("Dev Patel", "That race condition bit us in staging last week too. Good catch Maria. I shipped the notification service webhooks yesterday.", 18, 27),
    seg("Alex Kim", "Are the webhooks passing all integration tests?", 27, 31),
    seg("Dev Patel", "95% passing. Two flaky tests in the retry path that I'll fix this morning.", 31, 37),
    seg("Maria Santos", "Today I'm finishing the token refresh fix and writing tests. Should be unblocked by noon.", 37, 44),
    seg("Rachel Osei", "I'm working on the transcript search indexing. The full-text search query is down to 40ms on the benchmark dataset — target was 50ms.", 44, 54),
    seg("Alex Kim", "That's ahead of target, great. Any blockers?", 54, 58),
    seg("Rachel Osei", "No blockers. I'll have the index migration script ready for review by end of day.", 58, 64),
    seg("Dev Patel", "One thing — the staging environment has been flaky since yesterday's deploy. Should we roll back?", 64, 71),
    seg("Alex Kim", "Let's not roll back yet. Can you file a ticket and add the staging issue to today's triage list?", 71, 79),
    seg("Dev Patel", "Already filed it. Ticket FF-892.", 79, 83),
    seg("Maria Santos", "I can take a look at staging after I finish the token fix.", 83, 89),
    seg("Alex Kim", "Thanks Maria. Any other blockers before we close?", 89, 94),
    seg("Rachel Osei", "No blockers from me.", 94, 97),
    seg("Alex Kim", "Great. Let's sync at 4 PM for the PR review queue. Have a productive day everyone.", 97, 104),
]

M2_SUMMARY = {
    "overview": "Quick engineering standup covering yesterday's completions and today's plans. Alex shipped API rate-limiting middleware (in review), Maria fixed a race condition in auth token refresh, Dev delivered notification service webhooks (95% tests passing), and Rachel's transcript search indexing is hitting 40ms (below the 50ms target). A staging environment flakiness issue post-deploy was raised — ticket FF-892 filed. A 4 PM PR review queue sync was scheduled.",
    "key_topics": ["Rate Limiting", "Auth Token Refresh", "Webhooks", "Search Indexing", "Staging Environment", "PR Review"],
    "chapters": [
        chapter("Yesterday's Completions", 0, "Alex: rate-limiting middleware in PR. Dev: webhooks shipped, 95% tests green. Rachel: search indexing at 40ms."),
        chapter("Blockers & Issues", 18, "Maria resolved auth race condition. Dev flagged two flaky webhook retry tests. Staging environment flakiness filed as FF-892."),
        chapter("Today's Plans", 37, "Maria finishes token refresh fix by noon. Rachel ships index migration script by EOD. 4 PM PR review queue sync scheduled."),
    ],
}

M2_ACTION_ITEMS = [
    ("Dev Patel investigates flaky webhook retry tests", "Dev Patel", None),
    ("Maria Santos investigates staging flakiness post token fix", "Maria Santos", None),
    ("Rachel Osei completes index migration script for review", "Rachel Osei", None),
    ("Alex Kim runs 4 PM PR review queue sync", "Alex Kim", None),
]

# ── meeting 3: customer success review ────────────────────────────────────────

M3_SEGMENTS = [
    seg("Linda Walsh", "Thanks for joining today TechCorp. I'm Linda from Customer Success, and I have Marcus from our engineering team.", 0, 9),
    seg("Brandon Cole (TechCorp)", "Great to be here. I'm Brandon, VP of Engineering at TechCorp. This is Nina from our ops team.", 9, 18),
    seg("Nina Torres (TechCorp)", "Hi everyone. We've been using Fireflies for about six months now and have some feedback.", 18, 26),
    seg("Linda Walsh", "Perfect, that's exactly what we're here for. How's the overall experience been?", 26, 33),
    seg("Brandon Cole (TechCorp)", "Overall very positive. The automatic transcription saves my team about 3 hours per week. The accuracy on technical vocabulary is impressive.", 33, 44),
    seg("Nina Torres (TechCorp)", "The action item extraction is where we see room for improvement. We get duplicate action items, and sometimes they're too vague.", 44, 55),
    seg("Marcus Webb", "That's valuable feedback Nina. Can you give me a concrete example of a vague action item?", 55, 63),
    seg("Nina Torres (TechCorp)", "Sure — after a sprint planning meeting it extracted 'discuss database' as an action item. That's not actionable at all.", 63, 73),
    seg("Marcus Webb", "Got it. We're actually releasing an improved extraction model next month that uses meeting context to generate specific tasks with owners.", 73, 83),
    seg("Brandon Cole (TechCorp)", "That would be huge for us. We run about 40 sprint meetings per month and the action item noise is our biggest pain point.", 83, 93),
    seg("Linda Walsh", "Noted. I'll flag this as a priority use case for the product team. What about the integrations?", 93, 101),
    seg("Nina Torres (TechCorp)", "Jira integration works well. The Slack summaries are great. We'd love a Confluence integration to auto-publish meeting notes.", 101, 113),
    seg("Marcus Webb", "Confluence is on our roadmap for Q4. I'll put TechCorp as a design partner for that feature.", 113, 121),
    seg("Brandon Cole (TechCorp)", "That would be very helpful. One more thing — can we get SSO? Our IT team is asking.", 121, 129),
    seg("Linda Walsh", "SSO via SAML is available on the Enterprise plan. I'll send you the details after this call.", 129, 138),
    seg("Brandon Cole (TechCorp)", "We're on Business plan. What's the delta for Enterprise?", 138, 144),
    seg("Linda Walsh", "I'll pull together a comparison and pricing doc for you. Realistically the SSO feature alone usually pays for the upgrade.", 144, 153),
    seg("Nina Torres (TechCorp)", "Fair enough. Can you also set up a technical deep-dive with Marcus for the action item improvements?", 153, 161),
    seg("Marcus Webb", "Happy to do that. Let's find a time next week.", 161, 167),
    seg("Linda Walsh", "I'll coordinate calendars. Anything else before we wrap up?", 167, 174),
    seg("Brandon Cole (TechCorp)", "Just want to say — the product has been genuinely useful. Keep up the great work.", 174, 181),
    seg("Linda Walsh", "Thank you Brandon, that means a lot to the team. We'll follow up with the docs and a calendar invite.", 181, 189),
]

M3_SUMMARY = {
    "overview": "TechCorp 6-month QBR with Brandon Cole (VP Engineering) and Nina Torres (Ops). Overall sentiment very positive — transcription saves 3 hours/week per engineer. Key pain points: action item extraction producing vague/duplicate items and lack of Confluence integration. Opportunities identified: Confluence integration (TechCorp as design partner for Q4), SSO via SAML (Enterprise upgrade path), and improved action item model launching next month. Strong expansion opportunity given positive NPS and strategic need for Enterprise features.",
    "key_topics": ["Customer Satisfaction", "Action Item Quality", "Confluence Integration", "SSO / Enterprise Upgrade", "Sprint Planning Use Case", "Q4 Roadmap"],
    "chapters": [
        chapter("Introduction & Overall Sentiment", 0, "TechCorp has been using Fireflies for 6 months. Strong positive sentiment — transcription saves 3 hours/week per engineer."),
        chapter("Pain Points: Action Items", 44, "Action item extraction produces vague and duplicate items. Improved extraction model with context-aware specificity launching next month."),
        chapter("Integrations Review", 101, "Jira and Slack integrations working well. Confluence integration requested — TechCorp added as design partner for Q4 feature."),
        chapter("Enterprise & SSO Discussion", 121, "SSO via SAML available on Enterprise plan. Linda to send pricing comparison. Technical deep-dive with Marcus scheduled for next week."),
    ],
}

M3_ACTION_ITEMS = [
    ("Linda Walsh sends Enterprise vs Business plan comparison to Brandon", "Linda Walsh", None),
    ("Linda Walsh coordinates calendar for Marcus / TechCorp technical deep-dive", "Linda Walsh", None),
    ("Marcus Webb adds TechCorp as Confluence integration design partner", "Marcus Webb", None),
    ("Product team reviews action item extraction improvements for sprint planning use case", None, None),
]

# ── meeting 4: design system review ──────────────────────────────────────────

M4_SEGMENTS = [
    seg("Yuki Tanaka", "Welcome to our Q4 design system review. Today we're assessing component library coverage, accessibility compliance, and the token migration.", 0, 10),
    seg("Carlos Mendez", "Before we start, I want to flag that the button component family has 18 variants in Figma but only 12 are implemented in code.", 10, 19),
    seg("Aisha Okonkwo", "That delta has been a source of confusion for the engineering team. We shipped a button last sprint that didn't match any Figma variant.", 19, 28),
    seg("Yuki Tanaka", "That's a design-engineering sync issue. Let's create a shared inventory this week and deprecate variants that aren't in active use.", 28, 37),
    seg("Carlos Mendez", "Agreed. For accessibility: we have 43 components and 31 are WCAG 2.1 AA compliant. The remaining 12 need contrast ratio and focus ring fixes.", 37, 47),
    seg("Aisha Okonkwo", "The focus ring issue is straightforward — it's two lines of CSS. I can knock that out today.", 47, 54),
    seg("Yuki Tanaka", "Please do. The contrast ratios on the secondary button and tooltip need design decisions though. Carlos, can you spec those?", 54, 63),
    seg("Carlos Mendez", "I'll have revised specs in Figma by Thursday. We need to be careful not to break the brand color palette.", 63, 71),
    seg("Aisha Okonkwo", "On the token migration: we've converted 60% of hard-coded hex values to design tokens. The remaining 40% is mostly in legacy screens.", 71, 80),
    seg("Yuki Tanaka", "What's the plan for the legacy screens?", 80, 84),
    seg("Aisha Okonkwo", "We're going screen by screen. Three legacy screens per sprint. At that pace we finish by end of Q4.", 84, 92),
    seg("Carlos Mendez", "I'd advocate for moving faster — the inconsistency is noticeable to users. Can we do five per sprint?", 92, 100),
    seg("Aisha Okonkwo", "Five is feasible if we don't have other major feature work. I'll flag it in sprint planning.", 100, 108),
    seg("Yuki Tanaka", "Let's target five and adjust if needed. I'll add a design token progress tracker to our team wiki.", 108, 116),
    seg("Carlos Mendez", "One more item — we need a documentation site for the component library. Figma alone isn't sufficient.", 116, 124),
    seg("Aisha Okonkwo", "We can use Storybook. I have a basic setup already. It needs content but the infrastructure is there.", 124, 132),
    seg("Yuki Tanaka", "Let's make Storybook docs a Q4 deliverable. Carlos, can you lead the content strategy?", 132, 139),
    seg("Carlos Mendez", "Yes, I'll draft the doc framework by next Monday.", 139, 145),
    seg("Yuki Tanaka", "Perfect. Great progress everyone. Next review in two weeks.", 145, 151),
]

M4_SUMMARY = {
    "overview": "Quarterly design system review covering component coverage, accessibility compliance, and design token migration. Key finding: 6-component gap between Figma (18) and code (12) in button family — shared inventory to be created. Accessibility: 31/43 components are WCAG 2.1 AA; 12 need fixes (focus rings and contrast ratios). Token migration is 60% complete; targeting 5 legacy screens per sprint to finish by Q4 end. Storybook documentation site added as Q4 deliverable.",
    "key_topics": ["Component Library", "Accessibility WCAG 2.1", "Design Tokens", "Button Variants", "Storybook Docs", "Legacy Screen Migration"],
    "chapters": [
        chapter("Component Coverage Gap", 0, "18 Figma button variants vs 12 in code. Shared inventory to be created this week; unused variants to be deprecated."),
        chapter("Accessibility Audit", 37, "31/43 components WCAG 2.1 AA. Focus ring fix (2-line CSS) today; contrast ratio specs needed for secondary button and tooltip by Thursday."),
        chapter("Design Token Migration", 71, "60% complete. Targeting 5 legacy screens per sprint (up from 3) to complete by Q4. Token progress tracker to be added to team wiki."),
        chapter("Storybook Documentation", 116, "Storybook infrastructure ready. Q4 deliverable confirmed. Carlos to lead content strategy with doc framework draft by next Monday."),
    ],
}

M4_ACTION_ITEMS = [
    ("Aisha Okonkwo fixes focus ring CSS across all affected components", "Aisha Okonkwo", None),
    ("Carlos Mendez provides revised contrast ratio specs in Figma", "Carlos Mendez", None),
    ("Yuki Tanaka creates component inventory and deprecation list", "Yuki Tanaka", None),
    ("Aisha Okonkwo flags legacy screen sprint target (5/sprint) in sprint planning", "Aisha Okonkwo", None),
    ("Carlos Mendez drafts Storybook documentation content framework", "Carlos Mendez", None),
    ("Yuki Tanaka adds token migration tracker to team wiki", "Yuki Tanaka", None),
]

# ── meeting 5: board presentation prep ────────────────────────────────────────

M5_SEGMENTS = [
    seg("Diana Ross", "Thank you all for joining. We have three weeks until the board meeting and today is our first prep session.", 0, 9),
    seg("Chris Huang", "I've reviewed last quarter's board deck. They'll want to see churn improvement — we were at 4.2% monthly, down from 5.1%.", 9, 18),
    seg("Sandra Bloom", "The ARR growth story is compelling. We're at $12.4M ARR, up 68% year over year. That should lead the narrative.", 18, 27),
    seg("Mike Tran", "From the product side, I'll highlight the AI feature launch — 78% of active users have engaged with summaries in the first two weeks.", 27, 37),
    seg("Diana Ross", "That's an incredible adoption number. Is it defensible? Board will probe.", 37, 43),
    seg("Mike Tran", "Absolutely defensible. We define engagement as opening a summary and spending more than 10 seconds on it. Methodology is clean.", 43, 51),
    seg("Chris Huang", "For the financial section, we need to reconcile the GAAP and non-GAAP numbers. The board is split on which view they prefer.", 51, 60),
    seg("Sandra Bloom", "Let's present both and frame the delta clearly. It's a $340K difference in Q3 operating expenses — mostly stock comp.", 60, 69),
    seg("Diana Ross", "Agreed. Transparency builds trust with the board. Chris, can you build that slide?", 69, 76),
    seg("Chris Huang", "I'll have a draft by Monday. I'll also need Sandra to validate the cap table section.", 76, 83),
    seg("Sandra Bloom", "Already drafted. I'll send it to Chris by Friday.", 83, 89),
    seg("Mike Tran", "What's the ask from the board this meeting? Approval for the Series B extension?", 89, 96),
    seg("Diana Ross", "Yes. We're looking for approval to extend the round by $8M at the same terms. This gets us to 18 months of runway.", 96, 106),
    seg("Chris Huang", "We should stress-test the model with the board's most likely pushback scenarios. Macro headwinds, competition from big players.", 106, 115),
    seg("Diana Ross", "Good point. Let me set up a devil's advocate session next week with just the four of us.", 115, 122),
    seg("Sandra Bloom", "I'll prep three bear-case scenarios for that session.", 122, 128),
    seg("Mike Tran", "Should we include the partnership pipeline in the deck? We have two LOIs that aren't public.", 128, 136),
    seg("Diana Ross", "Include them as a teaser — no names, just categories. Legal will review the final deck.", 136, 143),
    seg("Chris Huang", "Deck structure: exec summary, ARR story, product milestones, team, financials, ask. Does that work for everyone?", 143, 152),
    seg("Diana Ross", "Perfect structure. Let's assign each section and aim for a complete draft by end of next week.", 152, 160),
    seg("Sandra Bloom", "I'll own the ARR story and financials.", 160, 165),
    seg("Mike Tran", "Product milestones section is mine.", 165, 169),
    seg("Chris Huang", "I'll handle the exec summary and the ask.", 169, 174),
    seg("Diana Ross", "I'll write the team section and coordinate the legal review. See you all at the devil's advocate session next Tuesday.", 174, 183),
]

M5_SUMMARY = {
    "overview": "Board presentation prep session with Diana (CEO), Chris (CFO), Sandra (Finance), and Mike (CPO). The board meeting is in three weeks. Key narrative: 68% ARR growth to $12.4M, churn improvement from 5.1% to 4.2%, and AI feature 78% engagement rate. The main ask is approval for an $8M Series B extension at existing terms (18 months runway). Deck structure confirmed: exec summary, ARR story, product milestones, team, financials, ask. GAAP/non-GAAP reconciliation to be included. Devil's advocate session scheduled for next Tuesday.",
    "key_topics": ["Board Meeting", "Series B Extension", "ARR Growth", "Churn Improvement", "AI Feature Adoption", "GAAP vs Non-GAAP", "Deck Structure"],
    "chapters": [
        chapter("Context & Metrics Review", 0, "Board meeting in 3 weeks. ARR at $12.4M (68% YoY), monthly churn down from 5.1% to 4.2%. AI summaries at 78% engagement in first 2 weeks."),
        chapter("Financial Presentation Strategy", 51, "Present both GAAP and non-GAAP clearly. $340K delta is stock comp. Chris to build reconciliation slide with Sandra's cap table validation."),
        chapter("Series B Extension Ask", 89, "Seeking $8M extension at same terms, extending runway to 18 months. Stress-test session scheduled for Tuesday to prep for board pushback."),
        chapter("Deck Ownership & Timeline", 143, "Sections assigned: Sandra owns ARR/financials, Mike owns product milestones, Chris owns exec summary and ask, Diana owns team section. Complete draft by end of next week."),
    ],
}

M5_ACTION_ITEMS = [
    ("Chris Huang drafts financial slide with GAAP/non-GAAP reconciliation", "Chris Huang", None),
    ("Sandra Bloom sends cap table section to Chris by Friday", "Sandra Bloom", None),
    ("Sandra Bloom prepares three bear-case scenarios for devil's advocate session", "Sandra Bloom", None),
    ("Diana Ross schedules devil's advocate session for next Tuesday", "Diana Ross", None),
    ("All section owners submit deck sections by end of next week", None, None),
    ("Diana Ross coordinates legal review of final deck", "Diana Ross", None),
]


# ── seed function ─────────────────────────────────────────────────────────────

MEETINGS_DATA = [
    {
        "title": "Q4 Product Roadmap Planning",
        "date": datetime.now() - timedelta(days=2),
        "duration": 181,
        "participants": ["Sarah Chen", "James Park", "Priya Nair", "Tom Reeves"],
        "tags": ["Product", "Planning", "Q4", "AI"],
        "segments": M1_SEGMENTS,
        "summary": M1_SUMMARY,
        "action_items": M1_ACTION_ITEMS,
    },
    {
        "title": "Weekly Engineering Standup",
        "date": datetime.now() - timedelta(days=0, hours=3),
        "duration": 104,
        "participants": ["Alex Kim", "Maria Santos", "Dev Patel", "Rachel Osei"],
        "tags": ["Engineering", "Standup", "Sprint"],
        "segments": M2_SEGMENTS,
        "summary": M2_SUMMARY,
        "action_items": M2_ACTION_ITEMS,
    },
    {
        "title": "Customer Success Review — TechCorp",
        "date": datetime.now() - timedelta(days=5),
        "duration": 189,
        "participants": ["Linda Walsh", "Marcus Webb", "Brandon Cole", "Nina Torres"],
        "tags": ["Customer Success", "Enterprise", "Integrations"],
        "segments": M3_SEGMENTS,
        "summary": M3_SUMMARY,
        "action_items": M3_ACTION_ITEMS,
    },
    {
        "title": "Design System Q4 Review",
        "date": datetime.now() - timedelta(days=8),
        "duration": 151,
        "participants": ["Yuki Tanaka", "Carlos Mendez", "Aisha Okonkwo"],
        "tags": ["Design", "Accessibility", "Q4"],
        "segments": M4_SEGMENTS,
        "summary": M4_SUMMARY,
        "action_items": M4_ACTION_ITEMS,
    },
    {
        "title": "Board Presentation Prep — Series B",
        "date": datetime.now() - timedelta(days=12),
        "duration": 183,
        "participants": ["Diana Ross", "Chris Huang", "Sandra Bloom", "Mike Tran"],
        "tags": ["Leadership", "Fundraising", "Strategy"],
        "segments": M5_SEGMENTS,
        "summary": M5_SUMMARY,
        "action_items": M5_ACTION_ITEMS,
    },
]


def seed():
    db = SessionLocal()
    try:
        # clear existing data
        from models import SegmentComment
        db.query(SegmentComment).delete()
        db.query(ActionItem).delete()
        db.query(Summary).delete()
        db.query(Transcript).delete()
        db.query(Meeting).delete()
        db.commit()

        for data in MEETINGS_DATA:
            mid = str(uuid.uuid4())

            meeting = Meeting(
                id=mid,
                title=data["title"],
                date=data["date"],
                duration=data["duration"],
                participants=json.dumps(data["participants"]),
                tags=json.dumps(data.get("tags", [])),
                status="processed",
            )
            db.add(meeting)

            transcript = Transcript(
                id=str(uuid.uuid4()),
                meeting_id=mid,
                segments=json.dumps(data["segments"]),
            )
            db.add(transcript)

            s = data["summary"]
            summary = Summary(
                id=str(uuid.uuid4()),
                meeting_id=mid,
                overview=s["overview"],
                key_topics=json.dumps(s["key_topics"]),
                chapters=json.dumps(s["chapters"]),
            )
            db.add(summary)

            for text, assignee, due_date in data["action_items"]:
                ai = ActionItem(
                    id=str(uuid.uuid4()),
                    meeting_id=mid,
                    text=text,
                    assignee=assignee,
                    due_date=due_date,
                    completed=False,
                )
                db.add(ai)

        db.commit()
        print(f"✓ Seeded {len(MEETINGS_DATA)} meetings successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
