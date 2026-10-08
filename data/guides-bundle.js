/* ============================================================================
   BUILD-TIME GUIDE FALLBACK — data only, no UI, never sent to a reader.

   This is the bundled copy of the guide content. It exists for ONE reason:
   scripts/build.js reads Firestore on every deploy, and if that read fails
   (network, quota, a bad key, Firestore down mid-deploy) the build must still
   produce a complete site rather than failing and taking the live site with
   it. See SEO_AI_ARCHITECTURE.md → "The build cannot fail a deploy".

   It used to live at assets/js/guides.js and was loaded by EVERY public page —
   113KB of full guide bodies downloaded to display one guide. It is now a
   build-time input only. Nothing in the public site references it, and
   tests/verify.js fails the build if anything starts to.

   Public pages get /data/guide-index.json instead: the same guides, metadata
   only, roughly a tenth of the size.
   ========================================================================== */

const AGES = ["0–1 month","2–3 months","4–6 months","7–9 months","10–12 months","12–18 months","18–24 months"];

/* Root-absolute on purpose. Guides now live at /guides/<slug>/ and the browse
   pages at /topics/<id>/ and /ages/<slug>/, so a relative "assets/..." path
   would resolve against the wrong directory and silently 404. */
const ICONS = {
  feeding:     `<img src="/assets/img/icons/feeding.webp" alt="" aria-hidden="true">`,
  sleeping:    `<img src="/assets/img/icons/sleeping.webp" alt="" aria-hidden="true">`,
  development: `<img src="/assets/img/icons/development.webp" alt="" aria-hidden="true">`,
  health:      `<img src="/assets/img/icons/health.webp" alt="" aria-hidden="true">`,
  sanity:      `<img src="/assets/img/icons/sanity.webp" alt="" aria-hidden="true">`
};

const TOPICS = [
  {id:"feeding",     label:"Feeding",       icon:ICONS.feeding},
  {id:"sleeping",    label:"Sleeping",      icon:ICONS.sleeping},
  {id:"development", label:"Development",   icon:ICONS.development},
  {id:"health",      label:"Health",        icon:ICONS.health},
  {id:"sanity",      label:"Parent Sanity", icon:ICONS.sanity}
];

const topicById = id => TOPICS.find(t => t.id === id) || TOPICS[0];

/* --- The guides --------------------------------------------------------- */

var GUIDES = [
{
  "id": "drinking-less-milk",
  "topic": "feeding",
  "icon": "bottle",
  "featured": true,
  "title": "Why is my baby drinking less milk?",
  "ages": [
    "4–6 months",
    "7–9 months"
  ],
  "read": 3,
  "summary": "A sudden drop in bottles or feeds is usually distraction, a growth plateau, or teething — not a problem.",
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "lead": "A floppy baby you cannot wake — call your local emergency number now.",
    "items": [
      "Fewer wet nappies than usual, or dark urine",
      "Refusing most feeds",
      "Floppy, unusually sleepy or hard to wake",
      "Vomiting with fever or obvious illness"
    ]
  },
  "panel": {
    "eyebrow": "Feeding • 4–9 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Distraction or teething",
        "A cold or blocked nose",
        "Feeds becoming quicker",
        "More interest in solids"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Try a dim, quiet room",
        "Check the teat flow",
        "Look at the whole day",
        "Offer calmly; do not insist"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "lead": "A floppy baby you cannot wake — call your local emergency number now.",
      "items": [
        "Fewer wet nappies than usual, or dark urine",
        "Refusing most feeds",
        "Floppy, unusually sleepy or hard to wake",
        "Vomiting with fever or obvious illness"
      ]
    },
    "dont": null,
    "quick": "A temporary dip is often distraction, teething or a cold; wet nappies, energy and the pattern across the day matter more than one feed."
  },
  "related": [
    "reflux-or-spit-up",
    "starting-solids",
    "teething"
  ],
  "seo": {
    "description": "A sudden drop in bottles or feeds is usually distraction, a growth plateau, or teething — not a problem."
  },
  "longform": [
    {
      "h": "The number went down and you noticed",
      "t": "You measured it, wrote it down and saw less than yesterday. Of course your mind went straight to: is something wrong?\n\nOften, a baby is simply distracted, teething, getting over a cold or becoming more interested in solids. Sometimes feeds also get shorter because they have become quicker at drinking."
    },
    {
      "h": "Look at the baby, not one bottle",
      "t": "One smaller feed does not tell you much. The whole day, wet nappies, energy and weight over time give you a clearer picture.\n\nA quiet, dim room helped when Ari suddenly found everything more interesting than milk. We also checked the teat flow. Too slow can make a feed tiring; too fast can make it overwhelming."
    },
    {
      "h": "Offer, pause and try again later",
      "t": "We found that pushing usually made everyone more upset. Offering calmly, then stopping and trying again later, took some of the pressure out of it.\n\nA sudden bottle refusal can also be about the bottle itself. That happened to us, but it belongs in the bottle-refusal guide rather than being squeezed into this one.\n\nIf wet nappies drop, your baby is hard to wake, or they are refusing almost everything, speak quickly to your baby’s doctor or nurse."
    }
  ],
  "batch": "2"
},
{
  "id": "wont-nap",
  "topic": "sleeping",
  "icon": "moon",
  "featured": true,
  "title": "Why won't my baby nap?",
  "ages": [
    "2–3 months",
    "4–6 months",
    "7–9 months"
  ],
  "read": 3,
  "summary": "Nine times out of ten it's the wake window — too short and they're not tired, too long and they're wired.",
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Your baby seems to be in pain when laid flat",
      "Loud snoring, gasping, or long pauses in breathing during sleep",
      "Naps have collapsed alongside feeding refusal or weight concerns"
    ]
  },
  "panel": {
    "eyebrow": "Sleeping • 2–9 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Wake window too short (not tired) or too long (overtired)",
        "You caught the third tired sign, not the first",
        "Too much light in the room",
        "A 35-minute single-cycle nap — normal at 3–6 months"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Make it really dark",
        "Same three things, same order: nappy, white noise, love to dream sack",
        "Start winding down early",
        "Continuous white noise"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Your baby seems to be in pain when laid flat",
        "Loud snoring, gasping, or long pauses in breathing during sleep",
        "Naps have collapsed alongside feeding refusal or weight concerns"
      ]
    },
    "dont": null,
    "quick": "Nap trouble is often a timing problem: too early and they are not tired, too late and they are overtired."
  },
  "related": [
    "sleep-regression",
    "early-waking",
    "touched-out"
  ],
  "seo": {
    "description": "Nine times out of ten it's the wake window — too short and they're not tired, too long and they're overtired."
  },
  "longform": [
    {
      "h": "You did the routine. They are still awake.",
      "t": "You changed the nappy, darkened the room and made enough shushing noises to lose your mind. The baby is still wide awake.\n\nFor us, nap trouble was often about timing. Too early and Ari was not tired. Too late and she was overtired and much harder to settle."
    },
    {
      "h": "Watch your baby before the clock",
      "t": "Wake windows can be a useful starting point, but babies do not read them. We got better results when we noticed Ari’s first quiet stare or yawn and started the routine then.\n\nOur routine stayed very simple: nappy, white noise and her Love to Dream sleeping bag. Doing the same few things in the same order made sleep feel familiar."
    },
    {
      "h": "When the nap lasted one sleep cycle",
      "t": "Some naps were only about half an hour. We sometimes went in at the first stir and rested a warm palm gently on her chest while she stayed flat on her back. Sometimes it helped her settle; sometimes the nap was simply over.\n\nAnd on the days when nothing worked, a walk and an earlier bedtime were enough. That was not a failed day. It was just a hard nap day."
    }
  ],
  "batch": "2"
},
{
  "id": "sleep-regression",
  "topic": "sleeping",
  "icon": "baby",
  "featured": true,
  "title": "Is this sleep regression?",
  "ages": [
    "2–3 months",
    "4–6 months",
    "7–9 months",
    "10–12 months"
  ],
  "read": 3,
  "summary": "Probably. But 'regression' is a bad word for it — it's usually a permanent change in how your baby sleeps, or a new skill breaking through.",
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Night waking comes with fever, pulling at ears, or inconsolable crying",
      "Your baby has stopped feeding well as well as sleeping badly",
      "You are so exhausted that driving or daily tasks feel unsafe — this is a real reason to ask for help"
    ]
  },
  "panel": {
    "eyebrow": "Sleeping • 2–12 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Sleep changes around four months",
        "New skills practised at night",
        "Teething or a nap change",
        "Separation anxiety"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Practise new skills by day",
        "Keep the bedtime routine familiar",
        "Choose one response for a few nights",
        "Share the nights if you can"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Night waking comes with fever, pulling at ears, or inconsolable crying",
        "Your baby has stopped feeding well as well as sleeping badly",
        "You are so exhausted that driving or daily tasks feel unsafe — this is a real reason to ask for help"
      ]
    },
    "dont": null,
    "quick": "It may be a sleep change or a new skill, and there can be several of these—not just one famous regression."
  },
  "related": [
    "wont-nap",
    "early-waking",
    "splitting-nights"
  ],
  "seo": {
    "description": "Probably. But 'regression' is a bad word for it — it's usually a permanent change in how your baby sleeps, or a new skill breaking through."
  },
  "longform": [
    {
      "h": "They slept. Now they do not.",
      "t": "You finally thought sleep was improving, and suddenly you are awake four times a night again. We had more than one stretch like this.\n\nA “regression” often comes with a real change: lighter sleep, a new skill, teething, separation anxiety or a nap change. Babies are learning constantly, so there is not only one regression."
    },
    {
      "h": "New skills do not clock off at bedtime",
      "t": "Rolling, sitting, crawling and standing can all be practised in the cot at ridiculous hours. Ari could be exhausted and still seem determined to rehearse something new.\n\nFloor time during the day helped. So did keeping the bedtime routine familiar instead of changing everything after one bad night."
    },
    {
      "h": "Choose one gentle response for a few nights",
      "t": "We tried to agree how we would respond before bedtime, because inventing a new plan at three in the morning never brought out our best thinking.\n\nYou do not have to follow somebody else’s sleep method. Pick what feels workable and safe for your family, then give it a little time before deciding it has failed.\n\nIf poor sleep arrives with fever, pain, feeding changes or unusual crying, it may be more than a sleep phase. Ask your baby’s doctor or nurse."
    }
  ],
  "batch": "2"
},
{
  "id": "starting-solids",
  "topic": "feeding",
  "icon": "bottle",
  "featured": false,
  "title": "How do I start solids without losing my mind?",
  "ages": [
    "4–6 months",
    "7–9 months"
  ],
  "read": 3,
  "summary": "One food, once a day, after a milk feed. Everything else is detail you can add later.",
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "lead": "A struggle to breathe — call your local emergency number now.",
    "items": [
      "Hives, swelling or vomiting after a new food",
      "Breathing difficulty after food",
      "Feeding or swallowing is not progressing",
      "You need an allergy plan before starting"
    ]
  },
  "panel": {
    "eyebrow": "Feeding • 4–9 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Mess and tiny tastes",
        "Milk still doing most of the work",
        "Readiness around six months",
        "Premature babies taking longer"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Let them touch and smell food",
        "Try a small taste before milk",
        "Use safe textures and sit upright",
        "Give it time"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "lead": "A struggle to breathe — call your local emergency number now.",
      "items": [
        "Hives, swelling or vomiting after a new food",
        "Breathing difficulty after food",
        "Feeding or swallowing is not progressing",
        "You need an allergy plan before starting"
      ]
    },
    "dont": null,
    "quick": "Start with small, safe tastes when your baby seems ready, and expect practice and mess rather than a proper meal."
  },
  "related": [
    "drinking-less-milk",
    "reflux-or-spit-up"
  ],
  "seo": {
    "description": "Starting solids can be slow and messy; readiness, safe textures and gentle practice matter more than a perfect timetable."
  },
  "longform": [
    {
      "h": "It is mostly mess with a spoon in it",
      "t": "Starting solids can look like a whole new parenting exam. For us, it was mainly tiny tastes, sticky hands and food in places food should never reach.\n\nAround six months is a guide, but readiness matters too: steady head control, sitting with support and bringing things to the mouth."
    },
    {
      "h": "Let food be interesting first",
      "t": "We let Ari sit near us while we ate. She could look, smell, touch and play. That exploration mattered, even when almost nothing went into her mouth.\n\nAri was premature and, even after her first birthday, solids were still slow. Her doctor was happy for us to keep offering food gently and give her time. We still worried and occasionally felt as if we were losing our minds."
    },
    {
      "h": "Before milk worked better for us",
      "t": "Ari was often too full to care about food after milk, so we offered a small taste before her usual milk feed. Another baby may prefer a different rhythm. Milk still did most of the work at the beginning.\n\nPurées, finger foods or a mixture can all fit. We cared more about safe textures, sitting upright and staying beside her than choosing a camp.\n\nGagging is noisy; choking can be silent. Knowing the difference and learning infant first aid gave us more confidence.\n\nPremature babies may follow their own pace. If feeding feels stuck, growth is a concern or you are worried about swallowing, ask your baby’s doctor or nurse."
    }
  ],
  "batch": "2"
},
{
  "id": "bottle-refusal",
  "topic": "feeding",
  "icon": "bottle",
  "featured": false,
  "title": "Why is my baby suddenly refusing the bottle?",
  "ages": [
    "2–3 months",
    "4–6 months",
    "7–9 months"
  ],
  "read": 3,
  "summary": "Usually flow, temperature, position or a sore mouth. Rarely the bottle itself.",
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Refusing most feeds or fewer wet nappies",
      "White mouth patches that do not wipe away",
      "Fever, vomiting or unusual sleepiness"
    ]
  },
  "panel": {
    "eyebrow": "Feeding • 2–9 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "The teat flow has changed",
        "Milk temperature or position",
        "A sore mouth or blocked nose",
        "The bottle itself"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Pause instead of forcing",
        "Try another person or room",
        "Offer when calm or sleepy",
        "Consider a different bottle"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Refusing most feeds or fewer wet nappies",
        "White mouth patches that do not wipe away",
        "Fever, vomiting or unusual sleepiness"
      ]
    },
    "dont": null,
    "quick": "Check the flow, temperature, position and sore mouth—but yes, sometimes your baby has simply rejected that bottle."
  },
  "related": [
    "drinking-less-milk",
    "teething"
  ],
  "seo": {
    "description": "A sudden bottle refusal may be the flow, temperature, position, a sore mouth — or simply the bottle itself."
  },
  "longform": [
    {
      "h": "Yesterday the bottle was fine. Today it is betrayal.",
      "t": "This one happened to us with no warning. Ari had used the same Perfect Match bottle from the beginning. Then one day she decided it was absolutely not acceptable."
    },
    {
      "h": "We checked the usual things",
      "t": "The teat flow, milk temperature, feeding position, a blocked nose, teething and who was holding the bottle can all change a feed. Sometimes the bottle itself is the answer.\n\nWe bought bottle after bottle over three very long days. While trying to make sure Ari was fed, we used a pipette. That was something we did in a stressful moment, not advice for another parent to copy without help from their baby’s doctor or nurse."
    },
    {
      "h": "Then she accepted a Dr Brown’s bottle",
      "t": "There was no grand logic to it. She simply accepted that bottle, and we never switched back. When she had thicker AR formula, we also needed a teat that could handle the thicker milk.\n\nWhat helped most was stopping the fight. We offered calmly, paused when she became upset and tried again later. Forcing it only made the bottle feel like a battle.\n\nIf you have a nursery deadline, start practising before the last few days if you can. A different person, a different room or a sleepy feed may help.\n\nIf your baby is refusing most feeds, has fewer wet nappies, seems unusually sleepy or has signs of illness, speak quickly to your baby’s doctor or nurse."
    }
  ],
  "batch": "2"
},
{
  "id": "reflux-or-spit-up",
  "topic": "feeding",
  "icon": "bottle",
  "featured": false,
  "title": "Is my baby’s spit-up reflux or something else?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 3,
  "summary": "A happy spitter is a laundry problem. A distressed one is worth a conversation with your doctor.",
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Green, yellow, bloody or forceful vomit",
      "Poor weight gain or repeated feed refusal",
      "Pain and arching with most feeds",
      "Vomiting with fever or a swollen tummy"
    ]
  },
  "panel": {
    "eyebrow": "Feeding • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Easy spit-up with no distress",
        "Small amounts looking enormous",
        "Reflux easing as babies grow"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Try smaller, more frequent feeds",
        "Pause to burp",
        "Hold upright after feeds",
        "Use prescribed thicker milk only if advised"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Green, yellow, bloody or forceful vomit",
        "Poor weight gain or repeated feed refusal",
        "Pain and arching with most feeds",
        "Vomiting with fever or a swollen tummy"
      ]
    },
    "dont": null,
    "quick": "Comfortable spit-up is often harmless; pain, feeding trouble or poor growth deserves a conversation with your baby’s doctor or nurse."
  },
  "related": [
    "drinking-less-milk",
    "bottle-refusal"
  ],
  "seo": {
    "description": "A happy spitter is a laundry problem. A distressed one is worth a conversation with your doctor."
  },
  "longform": [
    {
      "h": "It always looks like the whole feed",
      "t": "Milk spreads dramatically across a muslin. It can look as though the entire bottle has come back when the real amount is much smaller.\n\nIf your baby spits up easily, seems comfortable and is growing, it is often more of a washing problem than a medical one."
    },
    {
      "h": "Our reflux story was not quite that simple",
      "t": "Ari was premature and reflux made feeding harder for her. Her doctor prescribed AR formula, which was thicker and stayed down better for her. It helped us, but it was a plan made for Ari, not something every baby needs.\n\nSmaller feeds, pauses to burp and keeping her upright after a feed also helped. We avoided leaving her slumped in a car seat after feeding."
    },
    {
      "h": "Yes, we did tilt the cot",
      "t": "We raised one end of Ari’s cot a little because gravity seemed as though it should help. We later learned that current safe-sleep advice is a flat, firm mattress, even with reflux.\n\nSo we are not going to rewrite our story and pretend we never did it. We did. We just would not suggest it now, and we did not add wedges, towels or positioners to the cot.\n\nIf vomiting is green, yellow, bloody or forceful, or your baby is distressed, feeding poorly or not gaining weight, call your baby’s doctor or nurse."
    }
  ],
  "batch": "2"
},
{
  "id": "early-waking",
  "topic": "sleeping",
  "icon": "moon",
  "featured": false,
  "title": "Why is my baby waking at 5am?",
  "ages": [
    "7–9 months",
    "10–12 months",
    "12–18 months",
    "18–24 months"
  ],
  "read": 3,
  "summary": "Usually bedtime too late, nap timing, or light. Rarely a baby who's finished sleeping.",
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Early waking comes with pain, fever or feeding changes",
      "Loud snoring, gasping or pauses in breathing",
      "Exhaustion is making everyday care feel unsafe"
    ]
  },
  "panel": {
    "eyebrow": "Sleeping • 7–24 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Bedtime too late — overtired brings the wake-up earlier",
        "Light — sunrise creeping in",
        "Last nap too long, or too close to bedtime",
        "Habit — 5am means lights, milk and downstairs"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Keep the room dark and boring until your chosen 'morning'",
        "Try bedtime 20 minutes earlier for five nights",
        "Hold the line for a week or two"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Early waking comes with pain, fever or feeding changes",
        "Loud snoring, gasping or pauses in breathing",
        "Exhaustion is making everyday care feel unsafe"
      ]
    },
    "dont": null,
    "quick": "Early waking is often linked to light, bedtime or the last nap, though some babies really are tiny morning roosters."
  },
  "related": [
    "wont-nap",
    "sleep-regression"
  ],
  "seo": {
    "description": "Usually bedtime too late, nap timing, or light. Rarely a baby who's finished sleeping."
  },
  "longform": [
    {
      "h": "Five in the morning still feels like night",
      "t": "If your baby wakes ready for the day while you can barely open your eyes, it is reasonable to want to shift things later.\n\nFor us, the first things to check would be light, bedtime and the last nap. Oddly, a later bedtime can create an even earlier wake-up when a baby is overtired."
    },
    {
      "h": "Keep early morning boring",
      "t": "A dark room, a quiet voice and no cheerful trip downstairs can help five o’clock stay part of the night. It usually takes more than one morning to see a change.\n\nWe would try one small change at a time, such as moving bedtime a little earlier or ending the last nap sooner. Changing everything together makes it hard to know what helped."
    },
    {
      "h": "Sometimes you simply have a tiny rooster",
      "t": "If your baby wakes early, cheerful and rested, that may be their natural pattern for now. It can still be exhausting for you, but it does not automatically mean something is wrong.\n\nIf early waking comes with pain, feeding changes, breathing problems or unusual tiredness, ask your baby’s doctor or nurse."
    }
  ],
  "batch": "2"
},
{
  "id": "day-night-confusion",
  "topic": "sleeping",
  "icon": "moon",
  "featured": false,
  "title": "Why is my newborn awake all night and asleep all day?",
  "ages": [
    "0–1 month",
    "2–3 months"
  ],
  "read": 3,
  "summary": "Newborns have no body clock yet. You build it for them, with light and contrast.",
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "lead": "A floppy baby you cannot wake — call your local emergency number now.",
    "items": [
      "Your baby is very difficult to wake for feeds",
      "Fewer wet nappies than expected, or weight loss beyond the first week",
      "You feel unable to cope, low, or frightened — this is common, treatable, and worth saying out loud"
    ]
  },
  "panel": {
    "eyebrow": "Sleeping • 0–3 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Newborns have no body clock yet",
        "Day and night taking time to settle",
        "Short, broken sleep in the early weeks"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Open curtains in the morning",
        "Keep nights dim and quiet",
        "Follow the feeding plan",
        "Split the night into shifts"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "lead": "A floppy baby you cannot wake — call your local emergency number now.",
      "items": [
        "Your baby is very difficult to wake for feeds",
        "Fewer wet nappies than expected, or weight loss beyond the first week",
        "You feel unable to cope, low, or frightened — this is common, treatable, and worth saying out loud"
      ]
    },
    "dont": null,
    "quick": "Newborns need time to learn day from night; morning light, quiet nights and shared shifts can make the wait easier."
  },
  "related": [
    "splitting-nights",
    "sleep-regression"
  ],
  "seo": {
    "description": "Newborns have no body clock yet. You build it for them, with light and contrast."
  },
  "longform": [
    {
      "h": "Your newborn is not doing it on purpose",
      "t": "In the womb, movement through the day often rocked them to sleep. Then you lay down at night, the movement stopped and the party began. That pattern can follow them home.\n\nNewborns need time to learn the difference between day and night. Morning light and ordinary daytime noise can help give the day a clear shape."
    },
    {
      "h": "Make nights wonderfully boring",
      "t": "We kept lights low, voices quiet and nappy changes practical. There was no need to entertain Ari at three in the morning, even when she looked delighted to see us.\n\nLong daytime sleeps can sometimes be broken gently for a feed if that matches the plan from your baby’s doctor or nurse, especially for a premature or very young baby."
    },
    {
      "h": "The shift that saved us",
      "t": "One of us covered the first part of the night until about four. The other took over from four until nine. It still took time to fall asleep, but a protected block was far better than both of us waking for everything.\n\nIt did not make the nights easy. It made them survivable while Ari slowly worked out where sleep belonged.\n\nIf your newborn is hard to wake for feeds, has fewer wet nappies or is not gaining as expected, speak to your baby’s doctor or nurse."
    }
  ],
  "batch": "2"
},
{
  "id": "rolling-sitting-crawling",
  "topic": "development",
  "icon": "blocks",
  "featured": false,
  "title": "When will my baby roll, sit and crawl?",
  "ages": [
    "4–6 months",
    "7–9 months",
    "10–12 months"
  ],
  "read": 3,
  "summary": "Ranges are wide and order varies. Some babies skip crawling entirely and are completely fine.",
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "A skill your baby had disappears",
      "One side is used much more than the other",
      "Your baby seems very stiff or floppy",
      "You are worried progress has stopped"
    ]
  },
  "panel": {
    "eyebrow": "Development • 4–12 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Wide milestone ranges",
        "Skills arriving in a different order",
        "Commando crawling or shuffling",
        "Corrected age after premature birth"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Offer plenty of floor time",
        "Try short bursts of tummy time",
        "Put toys just out of reach",
        "Notice progress, not comparison"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "A skill your baby had disappears",
        "One side is used much more than the other",
        "Your baby seems very stiff or floppy",
        "You are worried progress has stopped"
      ]
    },
    "dont": null,
    "quick": "Milestone ranges are wide and the order varies, so look for steady progress rather than a perfect month on a chart."
  },
  "related": [
    "first-words",
    "sleep-regression"
  ],
  "seo": {
    "description": "Ranges are wide and order varies. Some babies skip crawling entirely and are completely fine."
  },
  "longform": [
    {
      "h": "The chart says one thing. Your baby says another.",
      "t": "Milestone ranges are wide, and babies do not always learn things in the same order. One child crawls early; another sits and watches the world for longer.\n\nThe useful question is not whether your baby copied somebody else’s timetable. It is whether they are gaining skills, moving in different ways and using both sides of their body."
    },
    {
      "h": "Tiny amounts of practice still count",
      "t": "We started tummy time from the early days in very short bursts. With Ari, one minute felt like a win. Then it became two, then three, and eventually we stopped counting.\n\nOne day we noticed she was simply comfortable on her tummy, as if she had always known how. That is how many milestones arrived for us: slowly, then suddenly."
    },
    {
      "h": "Floor time helped more than equipment",
      "t": "We used toys just out of reach and gave Ari space to move. Commando crawling, shuffling or finding another way across the floor still counts as movement.\n\nBecause Ari was premature, we used corrected age rather than comparing everything with her birthday. That removed a lot of worry.\n\nIf your baby loses a skill, uses one side much more than the other, or seems very stiff or floppy, ask your baby’s doctor or nurse."
    }
  ],
  "batch": "2"
},
{
  "id": "first-words",
  "topic": "development",
  "icon": "blocks",
  "featured": false,
  "title": "When should my baby babble, point and say first words?",
  "ages": [
    "7–9 months",
    "10–12 months",
    "12–18 months",
    "18–24 months"
  ],
  "read": 3,
  "summary": "Understanding comes long before speaking, and gestures matter more than word count.",
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Babbling or gestures are not developing",
      "Words or communication are not progressing",
      "A word or social skill disappears",
      "Your baby does not respond to sounds or voices"
    ]
  },
  "panel": {
    "eyebrow": "Development • 7–24 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Babbling before clear words",
        "Gestures counting as communication",
        "Understanding coming first",
        "More than one language"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Talk through ordinary life",
        "Pause and let them answer",
        "Follow what interests them",
        "Share books without pressure"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Babbling or gestures are not developing",
        "Words or communication are not progressing",
        "A word or social skill disappears",
        "Your baby does not respond to sounds or voices"
      ]
    },
    "dont": null,
    "quick": "Communication starts with sounds, looks and gestures long before clear words, and all of your baby’s languages count."
  },
  "related": [
    "rolling-sitting-crawling",
    "teething"
  ],
  "seo": {
    "description": "Understanding comes long before speaking, and gestures matter more than word count."
  },
  "longform": [
    {
      "h": "Communication starts before clear words",
      "t": "Babbling, pointing, waving, looking at you and handing you things are all part of language. Understanding usually arrives before speaking.\n\nWe tried to talk through ordinary life: nappy on, bottle here, Papa is coming back. It felt repetitive to us, but it was all new to Ari."
    },
    {
      "h": "Pause long enough for an answer",
      "t": "Babies need time to process. Asking a question and leaving a quiet gap gave Ari a chance to make a sound, look or gesture before we filled the silence for her.\n\nBooks did not need to be read perfectly. Pointing at a picture and naming what interested her was enough."
    },
    {
      "h": "Our multilingual home",
      "t": "Ari hears two languages now, and we plan to bring in our third language later. That timing is simply what feels manageable for our family.\n\nLearning more than one language does not cause a speech delay. Words and communication across all the languages count together, even if one language has fewer words on its own.\n\nIf babbling, gestures or words are not developing, or a skill disappears, bring it up with your baby’s doctor or nurse. Hearing is worth checking too."
    }
  ],
  "batch": "2"
},
{
  "id": "teething",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "Is teething making my baby miserable?",
  "ages": [
    "4–6 months",
    "7–9 months",
    "10–12 months",
    "12–18 months"
  ],
  "read": 3,
  "summary": "Teething causes drool, gnawing and grumpiness. It does not cause high fever, diarrhoea or rashes elsewhere.",
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Under three months with 38°C or more",
      "Fever, vomiting, diarrhoea or a body rash",
      "Refusing feeds or hard to wake",
      "Ear pulling with fever or strong pain"
    ]
  },
  "panel": {
    "eyebrow": "Health • 4–18 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Drooling and chewing",
        "Sore-looking gums",
        "A grumpy day or broken sleep",
        "Ear pulling can happen"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Offer a chilled teether",
        "Try gentle gum pressure",
        "Protect dribble-sore skin",
        "Check products with a pharmacist"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Under three months with 38°C or more",
        "Fever, vomiting, diarrhoea or a body rash",
        "Refusing feeds or hard to wake",
        "Ear pulling with fever or strong pain"
      ]
    },
    "dont": null,
    "quick": "Drool, chewing and sore gums can be teething; fever or a baby who seems unwell needs another explanation."
  },
  "related": [
    "first-fever",
    "drinking-less-milk"
  ],
  "seo": {
    "description": "Teething causes drool, gnawing and grumpiness. It does not cause high fever, diarrhoea or rashes elsewhere."
  },
  "longform": [
    {
      "h": "Teething gets blamed for everything",
      "t": "Drool, chewing, sore-looking gums and a grumpy night can all come with a tooth. A baby who seems properly unwell needs a different explanation.\n\nA high temperature, vomiting, diarrhoea or a body rash should not be brushed off as “just teething”."
    },
    {
      "h": "The ear pulling fooled us too",
      "t": "Ari often pulled at her ear when teeth were on the way. Most times, for us, it was teeth. But ear pulling with strong pain, fever or a very unhappy baby can also be an ear problem, so it is worth checking."
    },
    {
      "h": "What soothed Ari",
      "t": "Chilled teethers, gentle pressure on the gums and barrier cream for the dribble rash were simple things we used.\n\nCamilia drops and Zammies teething gel also seemed to help Ari. That is our experience, not a promise that they will suit every baby. Check medicines and teething products with your baby’s doctor or pharmacist.\n\nWe would skip anything worn around the neck and anything that is not clearly made and approved for babies.\n\nIf your baby has a temperature of 38°C or more, refuses feeds, is hard to wake or seems genuinely unwell, call your baby’s doctor or nurse."
    }
  ],
  "batch": "2"
},
{
  "id": "first-fever",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "What should I know about my baby’s first fever?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months",
    "7–9 months",
    "10–12 months",
    "12–18 months",
    "18–24 months"
  ],
  "read": 3,
  "summary": "The number matters far less than the age of your baby and how they look between temperature spikes.",
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "lead": "A struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now.",
    "items": [
      "Under three months with 38°C or more",
      "Three to six months with 39°C or more",
      "A rash that does not fade under a glass",
      "Hard to wake, floppy or struggling to breathe",
      "A seizure, very few wet nappies or your instinct says something is wrong"
    ]
  },
  "panel": {
    "eyebrow": "Health • 0–24 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "A mild fever in an older baby",
        "Being alert between temperature spikes",
        "Drinking and wet nappies continuing",
        "The number changing through the day"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Use a digital underarm thermometer",
        "Offer small, frequent drinks",
        "Keep clothing light and comfortable",
        "Ask before giving medicine"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "lead": "A struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now.",
      "items": [
        "Under three months with 38°C or more",
        "Three to six months with 39°C or more",
        "A rash that does not fade under a glass",
        "Hard to wake, floppy or struggling to breathe",
        "A seizure, very few wet nappies or your instinct says something is wrong"
      ]
    },
    "dont": null,
    "quick": "Your baby’s age and how they look matter as much as the number, so a young baby with fever needs quick medical advice."
  },
  "related": [
    "teething",
    "nappy-rash"
  ],
  "seo": {
    "description": "The number matters far less than the age of your baby and how they look between temperature spikes."
  },
  "longform": [
    {
      "h": "The age rule comes first",
      "t": "A temperature of 38°C or above in a baby under three months needs urgent medical advice. Do not wait until morning to see whether it settles.\n\nFor babies aged three to six months, 39°C or above is a reason to get urgent advice. At any age, how your baby looks and acts matters as much as the number."
    },
    {
      "h": "How we check a temperature",
      "t": "A digital thermometer in the armpit is the usual home method for a young child. We report the number and where we took it rather than adding or subtracting anything."
    },
    {
      "h": "Watch the baby between the spikes",
      "t": "Are they looking at you, drinking and reacting normally? Or are they floppy, unusually quiet, hard to wake or struggling to breathe? Those changes matter.\n\nAt home, small frequent drinks and one comfortable light layer can help. A cool cloth may feel soothing, as it did for Ari, but it does not treat the fever.\n\nFor pain or discomfort, use only medicine suitable for your child and follow advice from your baby’s doctor, nurse or pharmacist. We are leaving exact dosing out because age, weight and the product all matter.\n\nTrust the part of you that knows your baby. If something looks wrong, ask for help quickly even if the thermometer has not reached a neat threshold."
    }
  ],
  "batch": "2"
},
{
  "id": "nappy-rash",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "Why won’t my baby’s nappy rash clear up?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months",
    "7–9 months",
    "10–12 months",
    "12–18 months"
  ],
  "read": 3,
  "summary": "Ordinary rash improves in two or three days. If it's spreading, spotty or in the skin creases, it's probably thrush.",
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "No improvement after a few days",
      "Blisters, open sores, pus or bleeding",
      "Rash spreading beyond the nappy area",
      "Fever or significant pain"
    ]
  },
  "panel": {
    "eyebrow": "Health • 0–18 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Moisture and rubbing",
        "Rash on raised skin",
        "Improvement with barrier care"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Change nappies often",
        "Use water or fragrance-free wipes",
        "Pat dry; do not rub",
        "Leave barrier cream visible"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "No improvement after a few days",
        "Blisters, open sores, pus or bleeding",
        "Rash spreading beyond the nappy area",
        "Fever or significant pain"
      ]
    },
    "dont": null,
    "quick": "Simple nappy rash often improves with gentle cleaning, dry skin and barrier cream; spreading or persistent rash needs checking."
  },
  "related": [
    "first-fever",
    "teething"
  ],
  "seo": {
    "description": "Simple nappy rash often improves with gentle cleaning, dry skin and barrier cream; spreading or persistent rash needs another look."
  },
  "longform": [
    {
      "h": "Most nappy rash is moisture plus rubbing",
      "t": "A sore bottom can appear quickly when skin stays wet or rubs against a nappy. Ordinary irritation often sits on the raised skin rather than deep in the creases."
    },
    {
      "h": "Our simple routine",
      "t": "We changed Ari often, especially after a dirty nappy. Fragrance-free 99.9% water wipes were gentler for us, and washing under running water worked even better when she was very sore.\n\nWe patted dry instead of rubbing, then left a visible layer of barrier cream. Frezyderm Baby Bottom Cream was the one we liked for Ari, though another baby may suit something else.\n\nA little nappy-free time on a towel also helped. It was messy, but her skin got a break."
    },
    {
      "h": "When it needs another look",
      "t": "If the rash reaches the skin folds, spreads, develops little spots or does not improve after a few days of careful barrier care, ask your baby’s doctor or pharmacist.\n\nBlisters, open sores, bleeding, pus, fever or a baby in a lot of pain also deserve medical advice.\n\nWe would avoid talc, fragranced products and leftover medicated creams that were prescribed for something else."
    }
  ],
  "batch": "2"
},
{
  "id": "touched-out",
  "topic": "sanity",
  "icon": "heart",
  "featured": false,
  "title": "Is it normal to feel like I can’t handle one more person touching me?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months",
    "7–9 months",
    "10–12 months",
    "12–18 months",
    "18–24 months"
  ],
  "read": 3,
  "summary": "Wanting your body back for twenty minutes doesn't make you a bad parent. It makes you a mammal.",
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "The feeling is constant, not only after long days",
      "You feel low, numb, anxious or disconnected",
      "You may harm yourself or your baby—seek urgent help now"
    ]
  },
  "panel": {
    "eyebrow": "Parent Sanity • 0–24 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Feeling overloaded by touch",
        "Needing space at the end of the day",
        "Loving your family and wanting quiet"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Take a real no-contact break",
        "Hand over and leave the room",
        "Say “I need a time-out”",
        "Reduce noise and screens"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "The feeling is constant, not only after long days",
        "You feel low, numb, anxious or disconnected",
        "You may harm yourself or your baby—seek urgent help now"
      ]
    },
    "dont": null,
    "quick": "Wanting twenty minutes without anybody touching you does not make you a bad parent; it means you need a real break."
  },
  "related": [
    "splitting-nights",
    "visitors"
  ],
  "seo": {
    "description": "Wanting your body back for twenty minutes doesn't make you a bad parent. It makes you a mammal."
  },
  "longform": [
    {
      "h": "You love them. You also need everybody off you.",
      "t": "After a whole day of feeding, holding and being climbed on, one more touch can feel unbearable. That does not mean you love your baby or partner any less.\n\nFor us, it helped to see this as overload rather than guilt. A nervous system that has had no quiet space eventually asks for one."
    },
    {
      "h": "Ask for a real break",
      "t": "Twenty minutes without holding anyone can make a difference. A shower, a short walk or sitting alone counts. Chores do not.\n\nHanding the baby over while still supervising from the sofa did not feel like a break. Leaving the room did."
    },
    {
      "h": "The sentence that helped",
      "t": "“I need a time-out. It is not about you.” Saying it early was kinder than waiting until we were angry.\n\nTurning down other noise helped too. Sometimes the answer was not more entertainment. It was less sound, fewer screens and nobody asking another question.\n\nIf this feeling is constant, or comes with low mood, panic, numbness or feeling disconnected from your baby, tell your doctor or nurse. You deserve support."
    }
  ],
  "batch": "2"
},
{
  "id": "splitting-nights",
  "topic": "sanity",
  "icon": "heart",
  "featured": false,
  "title": "How do we split the nights so nobody breaks?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months",
    "7–9 months"
  ],
  "read": 3,
  "summary": "Both of you half-sleeping is worse than one of you sleeping properly. Shifts beat solidarity.",
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Exhaustion is making driving or baby care feel unsafe",
      "You feel persistently low, anxious or unable to cope",
      "Either parent has thoughts of harming themselves or the baby"
    ]
  },
  "panel": {
    "eyebrow": "Parent Sanity • 0–9 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Both parents feeling exhausted",
        "Broken sleep feeling worse",
        "Needing help even when you feel guilty"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Split the night into shifts",
        "Let off-duty mean off-duty",
        "Accept specific offers of help",
        "Review the plan in daylight"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Exhaustion is making driving or baby care feel unsafe",
        "You feel persistently low, anxious or unable to cope",
        "Either parent has thoughts of harming themselves or the baby"
      ]
    },
    "dont": null,
    "quick": "Protected sleep shifts usually help more than both parents waking for everything, even if the split is not perfectly equal."
  },
  "related": [
    "touched-out",
    "day-night-confusion"
  ],
  "seo": {
    "description": "Both of you half-sleeping is worse than one of you sleeping properly. Shifts beat solidarity."
  },
  "longform": [
    {
      "h": "Both awake and exhausted was not helping anyone",
      "t": "At first it can feel more loving to get up together. In practice, it left both of us shattered and nobody properly rested."
    },
    {
      "h": "The split that worked for us",
      "t": "One of us covered bedtime until about four in the morning. The other took over from four until nine. The off-duty parent was allowed to be properly off duty.\n\nIt takes time to fall asleep, even when you are exhausted, so the shift had to be long enough to give us a real block of sleep."
    },
    {
      "h": "If one parent is breastfeeding",
      "t": "The other person can still do the nappy, lifting, winding and settling. An expressed bottle may work for some families, but it is not the only way to share the load.\n\nIf you are doing nights alone, the shift may need to happen in daylight. A relative or friend holding the baby while you sleep can still be the thing that gets you through.\n\nWhen somebody offered help, we learned to say, “Yes, please,” instead of automatically being polite. We all need help. Taking it is not failing.\n\nReview the plan in daylight, not during an argument at three in the morning. If tiredness is making driving or baby care feel unsafe, ask for help now."
    }
  ],
  "batch": "2"
},
{
  "id": "visitors",
  "topic": "sanity",
  "icon": "heart",
  "featured": false,
  "title": "How do we manage visitors after the baby arrives?",
  "ages": [
    "0–1 month",
    "2–3 months"
  ],
  "read": 3,
  "summary": "Decide the rules before you're standing in the doorway holding a baby and a wet muslin.",
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "lead": "A struggle to breathe — call your local emergency number now.",
    "items": [
      "Your newborn has a temperature of 38°C or more",
      "Your baby feeds much less or is hard to wake",
      "Breathing looks difficult or your baby seems very unwell"
    ]
  },
  "panel": {
    "eyebrow": "Parent Sanity • 0–3 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Setting limits before visits",
        "Keeping visits short",
        "Closing some days to visitors"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Give visitors a time window",
        "Ask unwell people to stay away",
        "Wash hands and avoid kissing",
        "Ask people to bring dinner"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "lead": "A struggle to breathe — call your local emergency number now.",
      "items": [
        "Your newborn has a temperature of 38°C or more",
        "Your baby feeds much less or is hard to wake",
        "Breathing looks difficult or your baby seems very unwell"
      ]
    },
    "dont": null,
    "quick": "Decide your visitor rules before the doorbell rings, then keep the message short, kind and firm."
  },
  "related": [
    "touched-out",
    "splitting-nights"
  ],
  "seo": {
    "description": "Decide the rules before you're standing in the doorway holding a baby and a wet muslin."
  },
  "longform": [
    {
      "h": "Everybody wants to meet the baby",
      "t": "Almost nobody remembers what a visit costs when you have barely slept. People are excited. You are still allowed to protect your home and your energy."
    },
    {
      "h": "Decide the rules before the doorbell rings",
      "t": "We agreed how long visits would be, which days were closed and who would say no. Putting it in a message was much easier than making it up at the door.\n\nBecause Ari was premature, we were extra careful. We asked visitors to wash their hands, not kiss her face or hands, and stay away if they felt unwell. At times, especially during flu season, we also asked people to wear a mask.\n\nThose were our boundaries for our baby. If you are unsure what precautions your newborn needs, ask your baby’s doctor or nurse."
    },
    {
      "h": "Simple words are enough",
      "t": "“We would love to see you. Can you come between two and three?”\n\n“We are not doing visitors this week.”\n\n“She is due a feed, so I am taking her now.”\n\n“If you are coming, could you bring dinner?”\n\nYou do not owe anyone a long explanation. A short visit, a closed week or no baby-holding can all be the right choice for your family."
    }
  ],
  "batch": "2"
},
{
  "id": "safe-sleep-newborn",
  "topic": "sleeping",
  "icon": "moon",
  "featured": true,
  "title": "Where should my newborn sleep?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 3,
  "stage": "0–1 month",
  "subcategory": "Sleep environment",
  "summary": "Flat, on her back, on a firm clear surface. Every single sleep. It's the one thing on this whole site that isn't a judgement call.",
  "keywords": [
    "safe sleep",
    "back to sleep",
    "cot setup",
    "newborn sleep safety",
    "incline cot reflux"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "lead": "Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now.",
    "items": [
      "Blue, grey or unusually pale colour",
      "Pauses in breathing, or breathing that looks like hard work",
      "Grunting with every breath, nostrils flaring, or the chest pulling in",
      "A baby who is floppy, very hard to wake, or not feeding",
      "Any instinct that something is wrong — you don't need to justify it"
    ]
  },
  "panel": {
    "eyebrow": "Sleeping • Newborn",
    "normal": {
      "title": "Usually normal",
      "items": [
        "On her back, every sleep",
        "Flat — not propped or inclined",
        "Firm mattress, not a sofa or your bed",
        "Nothing else in the cot at all"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "A Love to Dream swaddle",
        "White noise for settling",
        "Sleeping in the room beside her",
        "An intercom when we left the room",
        "Feeding near the cot for an easier transfer"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "lead": "Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now.",
      "items": [
        "Blue, grey or unusually pale colour",
        "Any pause in breathing",
        "Breathing that looks like hard work — chest pulling in, nostrils flaring",
        "Floppy, very hard to wake, or not feeding",
        "Any instinct that something is wrong"
      ]
    },
    "dont": null,
    "quick": "The safest place is on their back, on a firm, flat, completely clear sleep surface, for every sleep."
  },
  "originalQuestions": [
    "Is it safe for a newborn to sleep on her side if a parent is actively watching? (24 August 2025)",
    "Whether a light must stay on, and whether she could be put down while making noise (21 August 2025)"
  ],
  "sources": [
    "RAW-20250824-68aa5aee-08",
    "RAW-20250821-68a76ce2-27"
  ],
  "medical": true,
  "related": [
    "newborn-noises-at-night",
    "spit-up-while-asleep",
    "milk-from-the-nose"
  ],
  "seo": {
    "description": "The safest place for a newborn to sleep is on their back, on a firm, flat and completely clear sleep surface."
  },
  "longform": [
    {
      "h": "We asked if she could sleep on her side",
      "t": "We did ask. Twice, actually — once as a straight question and once with what we thought was a clever addition: what if one of us is watching her?\n\nThe answer we got back was fair, and it stuck with us. Watching isn't the safeguard it feels like, because sleep is precisely the time nobody is watching. You look at your phone. You doze off yourself. The whole point of the rule is that it has to hold when you're not there.\n\nSo we put her on her back. Every time. It's the one thing in this entire first month we never had a debate about twice."
    },
    {
      "h": "We did tilt the cot",
      "t": "This was the hard one. When milk came out of Ari’s nose one night, and again when she spat up in her sleep, gravity felt like the obvious answer.\n\nOur cot had adjustable height settings, so we raised one end. Honestly, the fact that it could tilt made us assume that was partly what the feature was for. At two in the morning, with milk coming out of your baby’s nose, it felt like perfectly logical exhausted-parent problem-solving.\n\nWe later learned that the general safe-sleep guidance is still to keep the mattress firm and completely flat, even with reflux. A small baby can slide down an incline and end up in a worse position than the one you were trying to prevent. So yes, we tilted ours. Knowing what we know now, we would keep it flat unless Ari’s doctor or nurse had given us a specific reason and plan to do otherwise."
    },
    {
      "h": "What our cot actually had in it",
      "t": "Almost nothing. That still looked wrong to us for about a week. It seemed cold, as though we had forgotten something.\n\nA Love to Dream swaddle solved most of that feeling for us. This is not sponsored; it is simply the one we used, and it worked brilliantly for Ari. There was no loose blanket to wriggle under, nothing to kick off, and one less thing to think about at three in the morning. Once she showed signs of rolling, the arms-in swaddle had to go.\n\nAri slept in her own cot in her room, and Mama slept on the single bed beside her. We also had an intercom for the times we were outside the room and used white noise, which worked wonders for settling her."
    },
    {
      "h": "The one that catches people out",
      "t": "Falling asleep on a sofa holding her. It's not a decision anyone makes — it happens at the end of a night feed when you sit down for a second.\n\nWe got into the habit of feeding somewhere we could put her down safely afterwards, rather than somewhere comfortable enough to lose an hour in. Not because we were disciplined. Because we knew exactly how tired we were."
    }
  ],
  "batch": "1"
},
{
  "id": "newborn-hiccups",
  "topic": "health",
  "icon": "cross",
  "featured": true,
  "title": "Are newborn hiccups normal?",
  "ages": [
    "0–1 month",
    "2–3 months"
  ],
  "read": 2,
  "stage": "0–1 month",
  "subcategory": "Newborn body",
  "summary": "They bother you far more than they bother her. She can be put down to sleep still hiccupping.",
  "keywords": [
    "newborn hiccups",
    "baby hiccups",
    "hiccups sleep",
    "how long hiccups baby"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "She is genuinely upset by them rather than carrying on normally",
      "They come with difficulty feeding, or she keeps stopping mid-feed",
      "Frequent vomiting alongside them",
      "Any change in breathing or colour during an episode",
      "She isn't gaining weight as expected"
    ]
  },
  "panel": {
    "eyebrow": "Health • Newborn",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Very common, several times a day",
        "They did it in the womb too",
        "Stop on their own",
        "Most babies aren't bothered at all"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Hold her upright a while",
        "Pause the feed if she's unsettled",
        "One gentle burp, not six positions",
        "Put her down anyway — she can sleep through them"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "She's genuinely distressed",
        "Feeding is affected",
        "Frequent vomiting with them",
        "Breathing or colour changes"
      ]
    },
    "dont": null,
    "quick": "Newborn hiccups are very common and usually bother parents more than babies; a comfortable baby can still be put down to sleep."
  },
  "originalQuestions": [
    "Asked the best position for hiccups, whether patting helps, how long to keep trying (24 August 2025)",
    "\"No she just hiccups.\" (24 August 2025)"
  ],
  "sources": [
    "RAW-20250824-68aa5aee-01",
    "RAW-20250824-68aa5aee-08"
  ],
  "medical": false,
  "related": [
    "safe-sleep-newborn",
    "spit-up-while-asleep",
    "newborn-noises-at-night"
  ],
  "seo": {
    "description": "Newborn hiccups are very common, usually bother parents more than babies and do not normally stop a comfortable baby from sleeping."
  },
  "longform": [
    {
      "h": "It was just after midnight",
      "t": "Ari got hiccups and we started asking questions. What's the best position. Does patting help. Which of those is better. How long before they stop.\n\nWe also managed to ask how long burping takes and then correct ourselves — sorry, I meant hiccups — which tells you roughly what state we were in.\n\nEventually the question came back to us: is anything else going on? And the honest answer, once we actually looked at her, was no. She just hiccups. That was the end of it."
    },
    {
      "h": "She wasn't bothered. We were",
      "t": "This is the thing we'd want to hand to anyone standing over a cot at half past midnight. Watch her face rather than the clock.\n\nHiccups look like something happening to a baby. Most of the time they aren't distressing her at all — she's doing it the way she did in the womb, and she has no opinion about it. The distress in the room was entirely ours.\n\nOnce we noticed that, the whole thing deflated."
    },
    {
      "h": "You can put her down mid-hiccup",
      "t": "We genuinely didn't know this and had been waiting them out. You don't have to. A comfortable baby goes down flat on her back and hiccups her way into sleep, and it's fine.\n\nThe useful stuff, if you want to do something: hold her upright a while, pause a feed if she seems unsettled by them, one gentle burp if you think she's swallowed air. That's the list. We were cycling through positions like we were tuning a radio, and none of it was doing anything."
    },
    {
      "h": "When we'd have asked someone",
      "t": "Not about the hiccups themselves — about what came with them. If she'd been genuinely upset by them rather than indifferent, if they'd been getting in the way of feeding, if there'd been frequent vomiting alongside, or any change in her breathing or colour.\n\nOn their own, at midnight, in a baby who's otherwise happy: they're just hiccups."
    }
  ],
  "batch": "1"
},
{
  "id": "blocked-nose-newborn",
  "topic": "health",
  "icon": "cross",
  "featured": true,
  "title": "How do you unblock a newborn's nose?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 3,
  "stage": "0–1 month",
  "subcategory": "Newborn body",
  "summary": "Saline and patience, mostly. And no — you do not turn the baby upside down, however logical that briefly seems at 2am.",
  "keywords": [
    "blocked nose baby",
    "newborn congestion",
    "saline drops baby",
    "nasal aspirator",
    "stuffy nose newborn"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "lead": "Blue or grey, or a pause or struggle to breathe — call your local emergency number now.",
    "items": [
      "Breathing looks like hard work — chest pulling in, nostrils flaring, grunting",
      "Any pause in breathing, or blue or grey colour",
      "She's not feeding properly because of it",
      "She has a fever, or she is unusually sleepy or hard to wake",
      "She's under three months and has any fever at all"
    ]
  },
  "panel": {
    "eyebrow": "Health • Newborn",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Tiny nasal passages block easily",
        "Babies prefer to breathe through the nose",
        "Noisy without being unwell",
        "Worst at feed times"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Saline before feeds, the way we were shown",
        "A humidifier at night",
        "Never upside down — we did ask"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "lead": "Blue or grey, or a pause in breathing — call your local emergency number now.",
      "items": [
        "Chest pulling in, flaring nostrils, grunting",
        "Pauses, or blue or grey colour",
        "She can't feed properly",
        "Fever, especially under three months"
      ]
    },
    "dont": null,
    "quick": "Saline before feeds and humidity at night helped Ari. We never used suction ourselves, although gentle suction is another option parents may be shown."
  },
  "originalQuestions": [
    "Asked how to \"blow\" a baby's nose and what to do after saline drops (20 August 2025)",
    "Asked whether gravity could do the job by turning the baby upside down (20 August 2025)"
  ],
  "sources": [
    "RAW-20250820-68a61a70-01",
    "RAW-20250820-68a61a70-04"
  ],
  "medical": true,
  "related": [
    "sleeping-with-mouth-open",
    "fast-breathing-newborn",
    "safe-sleep-newborn"
  ],
  "seo": {
    "description": "Saline, humidity and patience can help a blocked newborn nose, but turning your baby upside down is not the answer, even at 2am."
  },
  "longform": [
    {
      "h": "How do you even blow a baby's nose",
      "t": "That was the question, more or less word for word. Then: fine, saline drops — and then what?\n\nAnd then, because it was late and it seemed briefly like excellent thinking: what if I just turn her upside down and let gravity do it?\n\nYou can't. Please don't. We're keeping it in because somebody else is going to have the same idea and it deserves to be answered by someone who has already had it."
    },
    {
      "h": "Why it matters more than it would in you or me",
      "t": "Her nasal passages are tiny, and a newborn would rather breathe through her nose. So a bit of congestion that wouldn't register in an adult becomes a real problem, because she can't suck and breathe through her mouth at the same time.\n\nWhich gave us the question that actually mattered. Not is she blocked — she often was — but is it stopping her feeding or sleeping. If it wasn't, we left it alone."
    },
    {
      "h": "What we ended up doing",
      "t": "We used saline just before feeds, gently flushing one nostril and then the other, the way we had been shown. It worked for Ari, but this is something to ask your baby’s doctor or nurse to show you rather than copying a technique from a paragraph online.\n\nWe never used suction ourselves. Gentle suction is another option some parents are shown, but repeated suction can irritate the inside of the nose. If you want to try it, ask your baby’s doctor or nurse to show you how.\n\nA humidifier at night helped more than we expected, especially with air conditioning running."
    },
    {
      "h": "The things we didn't do",
      "t": "No adult decongestant drops and nothing meant for older children. We did tilt the cot, but later learned that the safer general guidance is to keep it flat.\n\nAnd we stopped squirting saline in just to find out whether she was blocked. It's a treatment, not a test.\n\nWhat we watched for instead was effort. Breathing that looked like work — chest pulling in, nostrils flaring, grunting with each breath — or her not managing to feed. That's a phone call, not a saline drop."
    }
  ],
  "batch": "1"
},
{
  "id": "newborn-noises-at-night",
  "topic": "sleeping",
  "icon": "moon",
  "featured": true,
  "title": "Why is my newborn so noisy while sleeping?",
  "ages": [
    "0–1 month",
    "2–3 months"
  ],
  "read": 3,
  "stage": "0–1 month",
  "subcategory": "First nights",
  "summary": "Newborn sleep is astonishingly loud. Grunting, squeaking, kicking and thrashing are usually a baby deeply asleep, not a baby about to wake.",
  "keywords": [
    "newborn noisy sleep",
    "grunting baby",
    "baby squeaks at night",
    "first night home",
    "active sleep"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "lead": "Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now.",
    "items": [
      "Grunting with every breath, or breathing that looks like hard work",
      "The chest pulling in under the ribs, or nostrils flaring",
      "Any pause in breathing",
      "Blue, grey or unusually pale colour",
      "A baby who is floppy, very hard to wake, or won’t feed"
    ]
  },
  "panel": {
    "eyebrow": "Sleeping • Newborn",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Grunting, squeaking, snuffling",
        "Kicking and flinging her arms",
        "Faces that look like distress",
        "Sounds exactly like waking, isn't"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Wait ninety seconds before responding",
        "Lowering her slowly so the startle reflex did not wake her",
        "A dim red light for us, not her",
        "Not waking a settled baby just to burp",
        "A short video with flash off and brightness down"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "lead": "Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now.",
      "items": [
        "Grunting with every single breath",
        "Chest pulling in, or nostrils flaring",
        "Any pause in breathing",
        "Blue, grey or unusually pale colour",
        "Floppy, very hard to wake, or won’t feed"
      ]
    },
    "dont": null,
    "quick": "Newborn sleep can be astonishingly loud; we learned to notice breathing effort and colour rather than reacting to every grunt or squeak."
  },
  "originalQuestions": [
    "Asked about little sounds, noisy active sleep, kicking and arm movements (21 August 2025)",
    "Asked how quickly to change a dirty nappy and whether a light must stay on (21 August 2025)",
    "Reported she was making so much noise that she would not settle (21 August 2025)"
  ],
  "sources": [
    "RAW-20250821-68a74ea1-07",
    "RAW-20250821-68a76ce2-14",
    "RAW-20250821-68a76ce2-23",
    "RAW-20250821-68a76ce2-25",
    "RAW-20250821-68a76ce2-27"
  ],
  "medical": true,
  "related": [
    "safe-sleep-newborn",
    "fast-breathing-newborn",
    "nappy-changes-at-night"
  ],
  "seo": {
    "description": "Grunting, squeaking, kicking and arm-waving can all happen during normal newborn sleep, even when your baby is deeply asleep."
  },
  "longform": [
    {
      "h": "The first night home",
      "t": "We had spent five weeks visiting a NICU. Then she was home, in a room with us, in the dark, and she would not stop making noise.\n\nWe asked about the little sounds. Whether the kicking and arm-waving was normal. How quickly to change a nappy if you've heard her poo. Whether a light had to stay on. And then, plainly, that she was making a lot of noise and wouldn't settle.\n\nShe was asleep the whole time. It was us who weren't settling."
    },
    {
      "h": "Newborn sleep is loud, and nobody warns you",
      "t": "A big chunk of it is an active phase where they grunt, squeak, snuffle, sigh, kick, fling an arm out and pull faces that look like real distress.\n\nIt sounds exactly like a baby about to wake up. It usually isn't. The single most useful thing we changed was waiting — not responding to the first sound. A lot of it resolves itself inside a minute or two, and reaching in mid-cycle is how you turn a noise into an actual waking.\n\nHaving spent weeks next to monitors that beeped for real reasons, learning to sit still through noise took some doing."
    },
    {
      "h": "The small answers we needed that night",
      "t": "No, a light doesn't have to stay on. We asked specifically because she'd come from a NICU and we assumed preterm babies might need one. A dim night light is for your benefit, not hers.\n\nPoo gets changed reasonably quickly. A wet nappy can usually wait until the next feed.\n\nAnd you don't need to burp a baby who's settled and asleep. We were waking her up to do it."
    },
    {
      "h": "What we were actually listening for",
      "t": "Not volume. Effort.\n\nGrunting with every single breath, rather than now and then. Breathing that looks like hard work. The chest pulling in under the ribs, nostrils flaring wide, any pause, or a change in her colour. Those are different from a baby making a racket while fast asleep, and once you've seen the difference you stop mistaking one for the other.\n\nWhen we weren't sure, we filmed ten seconds on a phone. Far more useful than trying to describe it later, and it stops you second-guessing your own memory at four in the morning."
    }
  ],
  "batch": "1"
},
{
  "id": "milk-from-the-nose",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "Why did milk come out of my baby's nose?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 2,
  "stage": "0–1 month",
  "subcategory": "Feeding and spit-up",
  "summary": "Alarming to watch, usually harmless. The mouth and nose connect at the back of the throat, so milk occasionally takes the wrong exit.",
  "keywords": [
    "milk out of nose baby",
    "nasal regurgitation",
    "baby spit up nose",
    "posseting"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "lead": "Blue or grey, a struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now.",
    "items": [
      "Difficulty breathing, or persistent choking or coughing",
      "Blue or grey colour",
      "A baby who doesn't recover quickly, or is floppy or unresponsive"
    ]
  },
  "panel": {
    "eyebrow": "Health • Newborn",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Mouth and nose connect at the back of the throat",
        "Milk occasionally takes the wrong route",
        "One episode, quick recovery",
        "Looks far worse than it is"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Pick her up, keep her face visible",
        "Wipe outside only, don't suction",
        "Watch breathing and colour for a minute",
        "Back on her back once she had settled"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "lead": "Blue or grey, a struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now.",
      "items": [
        "Breathing difficulty or persistent choking",
        "Blue or grey colour",
        "Doesn’t recover quickly",
        "Floppy or unresponsive"
      ]
    },
    "dont": null,
    "quick": "Milk can sometimes travel through a baby's nose during spit-up; it looks frightening, but a baby who recovers quickly is often fine."
  },
  "originalQuestions": [
    "Noticed a little milk coming from her nose while she was asleep (23 August 2025)"
  ],
  "sources": [
    "RAW-20250823-68a9590b-01"
  ],
  "medical": true,
  "related": [
    "spit-up-while-asleep",
    "safe-sleep-newborn",
    "blocked-nose-newborn"
  ],
  "seo": {
    "description": "Milk can sometimes come through a baby’s nose during spit-up because the mouth and nose connect at the back of the throat."
  },
  "longform": [
    {
      "h": "A bit of milk came out of her nose",
      "t": "She was asleep. It came out of her nose. Our message was short and sent immediately.\n\nIt is a genuinely horrible thing to watch. It looks like choking, or drowning, or something having gone badly wrong in a way you can't fix."
    },
    {
      "h": "It's mostly plumbing",
      "t": "The mouth and the nasal passages meet at the back of the throat. When milk comes back up it sometimes takes the nasal route instead of the oral one. Small babies do this. It looks far worse than it is.\n\nKnowing that in advance wouldn't have stopped the jolt, but it would have shortened the twenty minutes afterwards where we sat watching her chest go up and down."
    },
    {
      "h": "What we'd do again",
      "t": "Pick her up, upright, where we could see her face. Wipe the outside of her nose gently — not poke about, not try to suction it out.\n\nWatch her breathing and her colour for a minute or two until she was clearly fine. Then straight back down, flat, on her back.\n\nThat last part was the hardest. The urge to raise the mattress after seeing milk come through your baby’s nose is enormous. We did prop ours and it seemed to help, but we later learned that the safer general guidance is to keep it flat. It is one of those things that made complete sense to us at the time, but we would not do again without a specific plan from Ari’s doctor or nurse."
    },
    {
      "h": "Where it stops being a story you tell later",
      "t": "One episode, with a baby who recovers straight away and carries on as normal, is a story.\n\nIf milk comes through your baby’s nose during most feeds, mention it to your baby’s doctor or nurse. It may be linked to reflux or the way your baby is feeding, and it is worth having someone look properly.\n\nAnd anything with real breathing difficulty, persistent choking, a colour change, or a baby who doesn't recover quickly is not a wait-and-see. We did an infant first aid session before she came home and never needed it, which is the best possible outcome for an evening spent learning something."
    }
  ],
  "batch": "1"
},
{
  "id": "spit-up-while-asleep",
  "topic": "feeding",
  "icon": "bottle",
  "featured": false,
  "title": "Why did my baby spit up hours after a feed?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 3,
  "stage": "0–1 month",
  "subcategory": "Feeding and spit-up",
  "summary": "Small spit-ups can arrive long after a feed and mean nothing much. The word that changes the answer is forceful.",
  "keywords": [
    "spit up baby",
    "posseting",
    "vomit newborn",
    "reflux baby",
    "clear saliva baby"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Forceful or projectile vomiting, especially if it's repeated",
      "Green, yellow-green, or bloody vomit",
      "Not gaining weight, or losing it",
      "Real distress with feeds, or refusing to feed",
      "A swollen or firm tummy, or unusual sleepiness"
    ]
  },
  "panel": {
    "eyebrow": "Feeding • Newborn",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Small amounts, dribbled not launched",
        "Even a couple of hours after a feed",
        "Milky or curdled",
        "A little clear saliva on its own",
        "A baby who isn't bothered by it"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Watching the weight trend, not the muslins",
        "A tablespoon of milk spreads a long way",
        "Knowing that forceful means milk shoots out",
        "Checking how she seemed after each episode"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Forceful or projectile, repeatedly",
        "Green, yellow-green or bloody",
        "Not gaining weight",
        "Distress with feeds, or refusing",
        "Swollen tummy, or unusually sleepy"
      ]
    },
    "dont": null,
    "quick": "Spit-up can appear well after a feed because milk moves slowly through a tiny stomach; how your baby seems matters more than the clock."
  },
  "originalQuestions": [
    "Reported she spat up a small amount while asleep about two hours after a feed, and a 90g weight gain over two days (24 August 2025)",
    "Saw her spit a little saliva, and clarified it was transparent (17 August 2025)"
  ],
  "sources": [
    "RAW-20250824-68ab97d7-10",
    "RAW-20250824-68ab97d7-13",
    "RAW-20250817-68a1a61a-01",
    "RAW-20250817-68a1a61a-02"
  ],
  "medical": true,
  "related": [
    "milk-from-the-nose",
    "safe-sleep-newborn",
    "feeding-on-demand"
  ],
  "seo": {
    "description": "Small spit-ups can happen hours after a feed, while repeated forceful vomiting is the version worth getting checked."
  },
  "longform": [
    {
      "h": "Two hours after a feed",
      "t": "She was asleep and spat up a small amount. Our first thought was that two hours was too long — surely it should have gone somewhere by then.\n\nIt hadn't. Milk sits around for a while, and small spit-ups turning up well after a feed is ordinary."
    },
    {
      "h": "We had something to compare it to",
      "t": "This is what made it manageable rather than frightening, and it's the most useful thing we learned that month.\n\nDuring one period, Ari had proper projectile vomiting while drinking Alfaré, a hypoallergenic formula. The vomiting stopped after her milk was changed. That timing was our experience; it does not prove that the formula caused it. What it did give us was a clear picture of forceful vomiting, and this later episode was nothing like that. It was a dribble.\n\nThe word that changes the answer isn't how much. It's force. Milk that shoots out rather than falls out is a different thing, particularly if it keeps happening."
    },
    {
      "h": "We watched the weight, not the muslins",
      "t": "Her weight was moving in the right direction over the next few days. That reassured us more than anything else, because it meant that whatever was landing on the muslin, enough was staying in.\n\nA spit-up always looks like more than it is. Tip a tablespoon of milk onto a cloth some time and see how far it travels — that's usually what you're actually looking at.\n\nAri was gaining steadily and behaving normally, which reassured us far more than the amount of laundry she was creating."
    },
    {
      "h": "What would have changed our minds",
      "t": "Green or yellow-green, or anything with blood in it. Forceful vomiting coming back. Her not gaining, or losing. Real distress with feeds, or refusing them. A swollen or firm tummy."
    }
  ],
  "batch": "1"
},
{
  "id": "fast-breathing-newborn",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "Why does my newborn breathe fast and then slow down?",
  "ages": [
    "0–1 month",
    "2–3 months"
  ],
  "read": 3,
  "stage": "0–1 month",
  "subcategory": "Newborn body",
  "summary": "Newborn breathing is genuinely irregular — bursts of fast, then slower, sometimes short pauses. What matters is effort, not speed.",
  "keywords": [
    "newborn fast breathing",
    "baby breathing pattern",
    "periodic breathing",
    "rapid breathing baby"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "lead": "Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now.",
    "items": [
      "Blue or grey colour, especially around the lips",
      "A pause in breathing with colour change or floppiness",
      "Chest pulling in hard, nostrils flaring, grunting on every breath",
      "Persistent fast breathing at rest, in a calm baby",
      "A baby who has stopped feeding, or is very hard to wake"
    ]
  },
  "panel": {
    "eyebrow": "Health • Newborn",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Faster than adults by a long way",
        "Irregular — bursts, then slower",
        "Short pauses of a few seconds",
        "Common in babies born early"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Only count when she's calm",
        "Count a full minute, not fifteen seconds",
        "Look at effort, not just speed",
        "Film twenty seconds if unsure"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "lead": "Blue or grey, or a pause or struggle to breathe — call your local emergency number now.",
      "items": [
        "Blue or grey, especially the lips",
        "A pause with colour change or floppiness",
        "Chest pulling in, flaring, grunting every breath",
        "Fast at rest in a calm baby",
        "Stopped feeding"
      ]
    },
    "dont": null,
    "quick": "Brief changes between faster and slower breathing can happen in newborns; breathing effort, colour changes or pauses mean calling your baby’s doctor or nurse."
  },
  "originalQuestions": [
    "Noticed intermittent quick breathing (24 August 2025)"
  ],
  "sources": [
    "RAW-20250824-68ab97d7-01"
  ],
  "medical": true,
  "related": [
    "newborn-noises-at-night",
    "blocked-nose-newborn",
    "sleeping-with-mouth-open"
  ],
  "seo": {
    "description": "Newborn breathing can switch between faster and slower bursts, but breathing effort and colour matter more than speed alone."
  },
  "longform": [
    {
      "h": "Why does she sometimes breathe so fast",
      "t": "Nobody had warned us that newborn breathing looks wrong. It speeds up, slows down, occasionally pauses for a few seconds, then picks up again as if nothing happened.\n\nWatching it for the first time, in the dark, having just brought home a baby born at 33 weeks, is not a relaxing experience."
    },
    {
      "h": "How to actually count it",
      "t": "We were counting while she was crying, or feeding, or wriggling — which measures crying, feeding and wriggling.\n\nDo it when she's calm, ideally asleep. And count a full minute rather than fifteen seconds times four, because the rate genuinely isn't steady enough for that to work.\n\nNewborns breathe much faster than adults, often around 30 to 60 breaths a minute while calm. Forty may sound slow, but it is still one breath every second and a half. Their breathing can also speed up and slow down, especially if they were born early, with short pauses that settle again."
    },
    {
      "h": "Effort matters more than speed",
      "t": "This was the shift that made us calmer, because it's what someone examining her is actually looking at.\n\nIs the chest pulling in under the ribs or at the base of the throat with each breath? Are the nostrils flaring wide? Is she grunting on every single breath out, rather than occasionally? What colour is she, especially around the lips? And is she still feeding — because a baby working hard to breathe stops managing that first.\n\nFast but easy, in a pink, feeding, settled baby, is a very different picture from slower but visibly laboured."
    },
    {
      "h": "Film it",
      "t": "Twenty seconds on a phone answers questions that five minutes of description can't, and it means you aren't relying on your own memory of something that frightened you.\n\nThe things that don't wait: blue or grey colour, especially around the lips. A pause that comes with a colour change or with her going floppy. Real effort with every breath. A baby who's stopped feeding or is hard to wake."
    }
  ],
  "batch": "1"
},
{
  "id": "newborn-trembles-and-jerks",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "Why did my newborn's body shake for a second?",
  "ages": [
    "0–1 month",
    "2–3 months"
  ],
  "read": 3,
  "stage": "0–1 month",
  "subcategory": "Newborn body",
  "summary": "Newborns startle, jitter and twitch constantly. The useful distinction is whether it stops when you hold the limb — and whether she's aware.",
  "keywords": [
    "newborn shaking",
    "baby jitters",
    "startle reflex",
    "baby twitching sleep",
    "tremor newborn"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Rhythmic, repetitive movement that carries on when you hold the limb",
      "A blank stare, or being less responsive during it",
      "Any change in breathing or colour",
      "Eyes rolling, fixed staring, or flickering",
      "Stiffening of the whole body, or a baby who seems unwell afterwards"
    ]
  },
  "panel": {
    "eyebrow": "Health • Newborn",
    "normal": {
      "title": "Usually normal",
      "items": [
        "The startle reflex — arms out, then in",
        "Jittery chin or hands when crying or cold",
        "Little twitches during active sleep",
        "She's awake, aware and settles"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Notice whether the movement stops when gently held",
        "Is she aware and responsive?",
        "Does comforting or feeding settle it?",
        "Film ten seconds — it's worth more than words"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Repeated movement that continues when gently held",
        "Blank stare, less responsive",
        "Breathing or colour change",
        "Eyes rolling or flickering",
        "Whole body stiffening"
      ]
    },
    "dont": null,
    "quick": "Brief trembling or sleep jerks can happen in newborns, but repeated movements or a baby who seems unwell should be checked."
  },
  "originalQuestions": [
    "\"If baby body shakes a bit it's ok\" (24 August 2025)"
  ],
  "sources": [
    "RAW-20250824-68aaa2d9-09"
  ],
  "medical": true,
  "related": [
    "newborn-noises-at-night",
    "fast-breathing-newborn",
    "safe-sleep-newborn"
  ],
  "seo": {
    "description": "Newborns often startle, tremble or twitch, but repeated movement or reduced awareness is worth getting checked."
  },
  "longform": [
    {
      "h": "Eight words, sent immediately",
      "t": "If baby body shakes a bit it's ok. No punctuation, no detail, no context. That's what it looks like when you've just watched something and your brain has stopped working.\n\nIt was sitting in a conversation that also contained a water filter problem and how long milk takes to cool in a Kikka Boo warmer, which is a fair picture of that month."
    },
    {
      "h": "Shakes covers several different things",
      "t": "The startle reflex, also called the Moro reflex, is where her arms fling out and then come back in, often after a noise or when you put her down. It looks dramatic, is very common, and fades over the first few months.\n\nJitteriness — a fine trembling of the chin or the hands, usually when she's crying, cold, or being undressed.\n\nAnd little jerks of an arm or leg during active sleep, which happen constantly.\n\nThey can look similar, but there are a few useful differences to watch for."
    },
    {
      "h": "The thing that tells them apart",
      "t": "Hold the limb that's shaking, gently. Ordinary jitteriness stops when you hold it. Movement that carries on regardless is the kind to report.\n\nThe other question is whether she's there with you. A jittery baby is awake and responsive, and settles when she's comforted, fed or warmed up. Movement that comes with a blank, unresponsive stare is a different report entirely."
    },
    {
      "h": "What we'd note if it happened again",
      "t": "Which part of her, and whether it was one side or both. How long. Rhythmic and repetitive, or irregular. What she was doing — awake, asleep, feeding, cold, being moved. Her breathing and her colour during it. Her eyes. And whether touching her stopped it.\n\nAnd film it, if you possibly can. A ten-second video means a doctor is looking at what actually happened rather than at your description of it at two in the morning."
    }
  ],
  "batch": "1"
},
{
  "id": "sleeping-with-mouth-open",
  "topic": "sleeping",
  "icon": "moon",
  "featured": false,
  "title": "Why does my baby sleep with their mouth open?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 2,
  "stage": "0–1 month",
  "subcategory": "First nights",
  "summary": "On its own, an observation rather than a problem. It's worth a look at the rest of her breathing before you decide it means anything.",
  "keywords": [
    "baby sleeps mouth open",
    "mouth breathing baby",
    "blocked nose sleep",
    "newborn breathing sleep"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "It's happening every night rather than occasionally",
      "Persistent noisy or snorting breathing",
      "Feeding is becoming harder",
      "Loud snoring, or any pause in breathing",
      "Any sign of increased effort — flaring, chest pulling in, grunting"
    ]
  },
  "panel": {
    "eyebrow": "Sleeping • Newborn",
    "normal": {
      "title": "Usually normal",
      "items": [
        "A deeply asleep baby with a slack jaw",
        "Mild congestion she's coping with",
        "Occasional rather than constant",
        "Feeding still going fine"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Does her breathing look easy or hard?",
        "Is she still feeding well?",
        "Saline only if she's actually blocked",
        "Don't use saline as a test"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Every night rather than sometimes",
        "Persistent noisy breathing",
        "Feeding getting harder",
        "Snoring or pauses",
        "Flaring, chest pulling in, grunting"
      ]
    },
    "dont": null,
    "quick": "An open mouth during sleep can follow mild congestion, but persistent mouth breathing is worth mentioning to your baby’s doctor or nurse."
  },
  "originalQuestions": [
    "Noticed she slept with her mouth open and asked how to tell whether her nose was blocked (24 August 2025)"
  ],
  "sources": [
    "RAW-20250824-68aaeaaa-01",
    "RAW-20250824-68aaeaaa-02",
    "RAW-20250825-68abf33f-01"
  ],
  "medical": true,
  "related": [
    "blocked-nose-newborn",
    "fast-breathing-newborn",
    "newborn-noises-at-night"
  ],
  "seo": {
    "description": "Sleeping with an open mouth can be harmless, but persistent mouth breathing is worth checking alongside feeding and breathing effort."
  },
  "longform": [
    {
      "h": "She sleeps with her mouth open",
      "t": "We asked this twice, on different nights, in slightly different words. The worry underneath was the same both times: does that mean her nose is blocked?\n\nSometimes. Often it's just a deeply asleep baby with a slack jaw and nothing else going on."
    },
    {
      "h": "We stopped looking at the mouth",
      "t": "On its own it doesn't tell you much. What tells you something is everything around it.\n\nIs her breathing easy, or does it look like work? Any snuffling, snorting or whistling from her nose? Nostrils flaring, chest pulling in? What's her colour?\n\nAnd the one that turned out to be our best sensor: is she still feeding normally. A baby who genuinely can't breathe through her nose struggles to feed, because she can't do both at once. A congested baby who's feeding fine is a congested baby you can leave alone."
    },
    {
      "h": "The thing we nearly did",
      "t": "We were about to squirt saline up her nose to see whether it came out the other side. Using it as a diagnostic rather than a treatment.\n\nDon't. Saline and suction are for when there's congestion actually getting in her way, not for satisfying a curiosity at midnight. We'd have irritated her nose to answer a question we could have answered by watching her feed."
    },
    {
      "h": "When we'd mention it",
      "t": "If it were happening every night rather than now and then. If her breathing stayed noisy or snorting. If feeding started getting harder. Loud snoring, or any pause in her breathing.\n\nAnd any of the effort signs — flaring, chest pulling in, grunting — which stop being an open-mouth question and become a different one."
    }
  ],
  "batch": "1"
},
{
  "id": "nappy-changes-at-night",
  "topic": "sleeping",
  "icon": "moon",
  "featured": false,
  "title": "Should I wake my baby to change a wet nappy?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 2,
  "stage": "0–1 month",
  "subcategory": "First nights",
  "summary": "Poo gets changed promptly. A wet nappy can usually wait until she's up anyway. Modern nappies are better at this than your anxiety suggests.",
  "keywords": [
    "night nappy change",
    "wake baby to change nappy",
    "wet nappy sleeping",
    "how often change nappy"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "A noticeable drop in wet nappies — fewer than expected in 24 hours",
      "Dark, strong-smelling urine",
      "Nappy rash that's raw, blistered, or not settling with cream",
      "Blood or mucus in her poo",
      "No poo at all alongside a swollen tummy or vomiting"
    ]
  },
  "panel": {
    "eyebrow": "Sleeping • Newborn",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Poo — change quickly because it irritates skin",
        "Wet — can wait for the next feed",
        "Clean and dry — no clock rule at all",
        "Modern nappies hold a lot"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "We let the wet ones wait until the next feed",
        "Poo changed straight away",
        "Changed before the feed, so she fell asleep after",
        "Dim light, no chat, everything in reach",
        "Counted the wet ones — they're your intake monitor"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Fewer wet nappies than you'd expect in 24 hours",
        "Dark, strong-smelling urine",
        "Nappy rash that's raw, blistered, or not settling",
        "Blood or mucus in her poo",
        "No poo at all with a swollen tummy or vomiting"
      ]
    },
    "dont": null,
    "quick": "We usually left a comfortable sleeping baby in a wet nappy until the next feed, but changed a poo nappy, a leaking nappy or one irritating sore skin sooner."
  },
  "originalQuestions": [
    "Asked how often to change a nappy if it was clean (24 August 2025)",
    "Clarified she had urinated but was asleep — could the change wait? (24–25 August 2025)"
  ],
  "sources": [
    "RAW-20250824-68aaa2d9-10",
    "RAW-20250824-68ab8989-02",
    "RAW-20250825-68acd842-02",
    "RAW-20250825-68acd842-04"
  ],
  "medical": true,
  "related": [
    "newborn-noises-at-night",
    "safe-sleep-newborn",
    "feeding-on-demand"
  ],
  "seo": {
    "description": "Poo gets changed quickly. A wet nappy can usually wait until she's up anyway. Modern nappies are better at this than your anxiety suggests."
  },
  "longform": [
    {
      "h": "She’s peed, but she’s asleep",
      "t": "That was the three-in-the-morning version of the question. We'd already asked the daytime version — how often do you change a nappy if it's clean — and got a sensible answer we then had to test against an actual sleeping baby.\n\nThere's a second version of this we asked too: she'd pooed but she'd just eaten and was asleep. What's the longest she can sit in it? And then, honestly: I'm not sure she pooed at all."
    },
    {
      "h": "What we settled into",
      "t": "We changed poo nappies quickly because poo can irritate the skin. That was worth the disruption.\n\nA wet nappy could usually wait until the next feed if Ari was comfortable and her skin looked fine. Modern nappies hold a lot, and waking a sleeping newborn for a slightly damp one often creates more trouble than it solves.\n\nAnd a genuinely clean, dry nappy doesn't need changing to a schedule at all. We'd assumed there was a clock rule. There isn't."
    },
    {
      "h": "Except when there isn't a choice",
      "t": "Any sign of soreness or nappy rash, and wet gets changed quickly too. Same if it's leaking, or so full it's swollen, or she's clearly uncomfortable.\n\nShe was born early, and we'd been given routines in the NICU that didn't always match what we read afterwards. Where those two disagreed, we went with what her doctor or nurse had told us."
    },
    {
      "h": "They're also your intake monitor",
      "t": "This was the part we nearly missed. In the early weeks the wet nappies are how you know she's getting enough milk, so it's worth noticing them rather than changing on autopilot.\n\nWe were counting hers anyway because we were counting everything. But it's the one number that costs you nothing to collect and tells a midwife something real."
    }
  ],
  "batch": "1"
},
{
  "id": "feeding-on-demand",
  "topic": "feeding",
  "icon": "bottle",
  "featured": true,
  "title": "Why does my newborn want milk again so soon?",
  "ages": [
    "0–1 month",
    "2–3 months"
  ],
  "read": 3,
  "stage": "0–1 month",
  "subcategory": "Newborn feeding",
  "summary": "Responsive feeding means following her cues, not the clock. But if you've been given a schedule for a reason, that schedule wins.",
  "keywords": [
    "feeding on demand",
    "responsive feeding",
    "newborn feeding frequency",
    "cluster feeding",
    "every two hours"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "She's too sleepy to wake for feeds, or feeds very briefly and drops off",
      "A drop in wet nappies",
      "She isn't back to birth weight by around two weeks, or isn't gaining",
      "Feeding is painful, or she can't stay latched",
      "You've been given a feeding plan and can't keep to it — say so rather than adjusting it alone"
    ]
  },
  "panel": {
    "eyebrow": "Feeding • Newborn",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Eight to twelve feeds in 24 hours",
        "Not evenly spaced at all",
        "Cluster feeding, often in the evening",
        "Wanting more after ninety minutes"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Early cues, not crying — crying is late",
        "Wet nappies, daily",
        "Weight over weeks, not days",
        "If there's a plan, the plan wins"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Too sleepy to wake for feeds",
        "Fewer wet nappies",
        "Not back to birth weight by two weeks",
        "Feeding is painful",
        "You can't keep to a plan you've been given"
      ]
    },
    "dont": null,
    "quick": "Wanting milk again soon can be normal, especially during cluster feeding, but feeding plans for premature or medically monitored babies come first."
  },
  "originalQuestions": [
    "Asked whether a baby should be fed on demand at the beginning (1 August 2025)",
    "Asked what happens if the baby wants to feed more often than every two hours (1 August 2025)"
  ],
  "sources": [
    "RAW-20250801-688c98c5-01",
    "RAW-20250801-688c98c5-02"
  ],
  "medical": true,
  "related": [
    "timing-feeds-start-or-finish",
    "newborn-weight-loss",
    "spit-up-while-asleep"
  ],
  "seo": {
    "description": "Responsive feeding follows your baby’s cues, but a feeding plan given for a medical reason always comes first."
  },
  "longform": [
    {
      "h": "Is on demand right at the beginning",
      "t": "We asked it plainly, and then immediately stress-tested it: what if she wants it more often than every two hours?\n\nThat second question is the one everybody actually has. On demand sounds relaxed until you're living it, and then it sounds like a baby who has never once been satisfied."
    },
    {
      "h": "What it actually means",
      "t": "Watching her instead of the clock. The early cues are subtle — rooting, turning her head, hands going to her mouth, stirring and fussing. Crying is a late cue, and a baby who has got to crying is much harder to feed than one you caught earlier.\n\nNewborns feed a lot, and not on any tidy schedule. Bunches of feeds close together, often in the evening, are ordinary and aren't a sign that anything has gone wrong with your milk or your baby.\n\nWanting to feed again ninety minutes later doesn't mean the last one failed. Small stomach, fast digestion, and sometimes she just wants to be near you, which is allowed to be a reason."
    },
    {
      "h": "The exception that was ours",
      "t": "On demand assumes a baby who wakes when she's hungry and feeds effectively. Ari was born at 33 weeks and came home on a plan, and a sleepy preterm baby who doesn't demand can quietly not get enough.\n\nSo for us the plan won. Minimum frequencies, measured amounts, and waking her when she wasn't asking.\n\nWe're saying this loudly because feed on demand gets handed out as universal advice and it isn't. If you've been given a schedule for a reason, that reason still applies at four in the morning when she's sleeping peacefully through a feed."
    },
    {
      "h": "What we watched instead of the clock",
      "t": "Wet nappies each day. Weight over several days, not every tiny change on the scale. Papa was constantly asking whether Ari had gained enough, then explaining away a lower number because she had just done a poo. A feed, a wet nappy or a poo can all move such a small number, so the trend mattered more than one weighing. We also watched whether she seemed settled after at least some feeds and whether the feeds were effective, not just frequent.\n\nWhen any of that slipped, we said so rather than working around it."
    }
  ],
  "batch": "1"
},
{
  "id": "timing-feeds-start-or-finish",
  "topic": "feeding",
  "icon": "bottle",
  "featured": false,
  "title": "Do I time the next feed from the start or end of the last one?",
  "ages": [
    "0–1 month",
    "2–3 months"
  ],
  "read": 2,
  "stage": "0–1 month",
  "subcategory": "Newborn feeding",
  "summary": "From the start. It's a tiny rule that quietly reorganises your entire day and night, and nobody tells you.",
  "keywords": [
    "feed timing",
    "every three hours",
    "feed interval",
    "when does next feed start"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "lead": "A floppy baby you cannot wake — call your local emergency number now.",
    "items": [
      "Feeds are taking much longer than expected",
      "She isn't finishing the volumes she's meant to",
      "She's very hard to wake for feeds",
      "She's vomiting, or refusing feeds",
      "You're consistently unable to keep to the interval"
    ]
  },
  "panel": {
    "eyebrow": "Feeding • Newborn",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Counted start to start",
        "12:00 feed, next starts 15:00",
        "Not from when she finishes",
        "Your baby’s feeding plan comes first"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Start to start stopped our whole day drifting",
        "We'd been counting from the end, and slipping an hour",
        "A pen-and-paper feeding journal beside the cot",
        "Made our feed records actually mean something",
        "We asked rather than adjusting the plan ourselves"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "lead": "A floppy baby you cannot wake — call your local emergency number now.",
      "items": [
        "Feeds taking much longer",
        "Not finishing volumes",
        "Very hard to wake",
        "Vomiting or refusing"
      ]
    },
    "dont": null,
    "quick": "We counted from the start of one feed to the start of the next, but our baby’s own feeding plan always came first."
  },
  "originalQuestions": [
    "Asked whether the three-hour interval begins when she starts drinking or when she finishes (22 August 2025)"
  ],
  "sources": [
    "RAW-20250822-68a8b9cf-01"
  ],
  "medical": false,
  "related": [
    "feeding-on-demand",
    "nappy-changes-at-night",
    "newborn-weight-loss"
  ],
  "seo": {
    "description": "Feeding intervals are usually counted from the start of one feed to the start of the next, unless your baby has a different plan."
  },
  "longform": [
    {
      "h": "The smallest question we asked",
      "t": "When you're calculating feeding time, do you count from when she finishes or when she starts?\n\nOne line. No follow-up. And it reorganised more of our week than most of the big questions did."
    },
    {
      "h": "From the start",
      "t": "Feeding intervals are counted start to start. A feed that begins at midday, on a three-hour plan, means the next one begins at three. Not half past three because she took thirty minutes.\n\nWe had been counting from the end, and every feed was landing a little later than the one before. Over a day that's an hour or more of drift, and we'd been quietly wondering why the schedule kept sliding away from us and whether something was wrong with her.\n\nIt was us."
    },
    {
      "h": "Why it's worth getting right",
      "t": "It changes the number of feeds in 24 hours, which is what actually matters. It keeps the night feeds roughly where you planned them and makes your notes useful when someone asks how often your baby is feeding.\n\nWe kept a physical pen-and-paper feeding journal beside the cot. If Papa took over, he could see exactly when the last feed started without waking Mama or relying on a half-asleep memory. Very basic. Completely worth it."
    },
    {
      "h": "What we didn't do",
      "t": "We didn't fix problems by moving the timings.\n\nWhen feeds were taking unusually long, Ari wasn’t finishing them, or she was hard to wake, we spoke to her doctor or nurse instead of quietly changing the schedule ourselves. It was tempting. In those early weeks, the schedule felt like one of the few things we could actually control.\n\nAnd if there's a written plan, that plan beats any general rule, including this one."
    }
  ],
  "batch": "1"
},
{
  "id": "newborn-weight-loss",
  "topic": "feeding",
  "icon": "bottle",
  "featured": false,
  "title": "Is it normal for a newborn to lose weight after birth?",
  "ages": [
    "0–1 month"
  ],
  "read": 3,
  "stage": "0–1 month",
  "subcategory": "Newborn feeding",
  "summary": "Expected in the first days, and mostly fluid rather than substance. What matters is when it turns around, not the number itself.",
  "keywords": [
    "newborn weight loss",
    "birth weight",
    "back to birth weight",
    "baby not gaining"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "She hasn't started gaining by around day five",
      "She's not back to birth weight by around two weeks",
      "Fewer wet nappies than expected",
      "She's very sleepy, hard to wake, or feeding poorly",
      "She looks yellow — jaundice with poor feeding needs checking quickly"
    ]
  },
  "panel": {
    "eyebrow": "Feeding • Newborn",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Some loss over the first few days",
        "Mostly fluid, not substance",
        "A low point, then it turns around",
        "Back to birth weight around two weeks"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "The turning point, not the number",
        "Wet nappies daily",
        "Poo changing through the first week",
        "Her doctor’s chart, not a general number"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "No gain by around day five",
        "Not back to birth weight by two weeks",
        "Fewer wet nappies",
        "Very sleepy or feeding poorly",
        "Looking yellow"
      ]
    },
    "dont": null,
    "quick": "Some early weight loss is expected; the important part is whether weight begins turning around and your baby is feeding and producing wet nappies."
  },
  "originalQuestions": [
    "Asked why newborns lose weight and how much loss is too much (20 July 2025)"
  ],
  "sources": [
    "RAW-20250720-687cdea6-01"
  ],
  "medical": true,
  "related": [
    "feeding-on-demand",
    "timing-feeds-start-or-finish",
    "nappy-changes-at-night"
  ],
  "seo": {
    "description": "Some newborn weight loss is expected in the first days, and the turning point matters more than one number on the scale."
  },
  "longform": [
    {
      "h": "Why does she weigh less than she did",
      "t": "We asked this properly — why does it happen, and how much is too much — because it's one of the first numbers you're handed and it goes in the wrong direction.\n\nWe asked this while Ari was in NICU, when every number felt enormous. Weight was the one number we felt we could follow."
    },
    {
      "h": "Most of it is fluid",
      "t": "Babies are born with extra fluid on board and shed some of it in the first days. Milk supply is still arriving at the same time, so intake takes a few days to catch up.\n\nSome early loss is expected. It isn't a failure of anything, and it isn't a verdict on how feeding is going. Knowing that doesn't make being handed a smaller number on day three feel any better — everything in you wants that line to go up — but it does stop you reading it as a result."
    },
    {
      "h": "The shape matters more than the number",
      "t": "Loss over the first few days, a low point, then it turns around. Back to birth weight somewhere around two weeks. Then steady gain along her own line.\n\nThe turning point is the bit to watch. Any single weighing is noisy — different scales, different clothes, a full nappy weighs something. We were weighing her every second day and learning to ignore the wobbles between the trend."
    },
    {
      "h": "We stopped using the internet's percentage",
      "t": "There's a specific figure quoted everywhere for how much loss is too much, and for us it was simply the wrong measure.\n\nAri was born at 33 weeks, weighing under 2 kg. Her doctor and nurses had their own chart and expectations, and a general number written for full-term babies did not describe her. We spent a while trying to place her on growth lines we did not have before we finally asked the people who did.\n\nIf your baby is under specialist care, ask your baby’s doctor or nurse what they expect and what would worry them. Then you know what you are watching for instead of comparing your baby with a stranger’s baby."
    }
  ],
  "batch": "1"
},
{
  "id": "newborns-and-blinking",
  "topic": "development",
  "icon": "blocks",
  "featured": false,
  "title": "Do newborn babies blink less than adults?",
  "ages": [
    "0–1 month",
    "2–3 months"
  ],
  "read": 2,
  "stage": "0–1 month",
  "subcategory": "Newborn senses",
  "summary": "Yes, considerably. That unnerving unbroken stare is a real thing and it's completely ordinary.",
  "keywords": [
    "newborn blinking",
    "baby staring",
    "does baby blink",
    "newborn eyes"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Redness, or discharge that keeps returning",
      "An eye that looks cloudy, or a pupil that doesn't look dark",
      "One eye regularly turns or seems fixed",
      "An eye that won't close fully",
      "Staring while being less responsive needs medical help quickly; it is not just an eye question"
    ]
  },
  "panel": {
    "eyebrow": "Development • Newborn",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Newborns blink far less than adults",
        "The long unbroken stare is normal",
        "Rate changes with light and alertness",
        "A little sticky eye is common",
        "Eyes may occasionally wander or cross early on"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Don't count blinks — it means nothing",
        "Look at the eye, not the rate",
        "Sticky eye: get it seen, don't self-diagnose",
        "Enjoy the stare. She's learning your face"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Redness, or discharge that keeps returning",
        "An eye that looks cloudy, or a pupil that isn't dark",
        "One eye regularly turns or seems fixed",
        "An eye that won't close fully",
        "Staring while being less responsive — get medical help quickly"
      ]
    },
    "dont": null,
    "quick": "Newborns really do blink less than adults, so the long stare can be ordinary; the appearance and movement of the eyes matter more."
  },
  "originalQuestions": [
    "Asked whether babies genuinely blink less, having noticed long stretches of staring (23 August 2025)"
  ],
  "sources": [
    "RAW-20250823-68aa0a45-01"
  ],
  "medical": false,
  "related": [
    "is-that-a-real-smile",
    "newborn-noises-at-night",
    "sleeping-with-mouth-open"
  ],
  "seo": {
    "description": "Newborns blink far less than adults, so a long unbroken stare can be completely ordinary."
  },
  "longform": [
    {
      "h": "Do babies blink less",
      "t": "Three words, sent in the middle of an ordinary afternoon. Once you notice the staring you can't stop noticing it — she'd fix on a face for what felt like minutes without a single blink.\n\nThey do blink far less than adults. Nobody's entirely sure why. The suggestions include that their eyes are less exposed, that they're taking in less visual information, and that tear production is still getting going."
    },
    {
      "h": "Don't count them",
      "t": "We tried. A blink rate isn't a useful measurement — it changes with how awake she is, the light, whether she's concentrating, whether her eyes are comfortable.\n\nAll counting does is give you a number to be anxious about, which we can report from experience."
    },
    {
      "h": "What's worth looking at instead",
      "t": "The eye itself, rather than the blink rate. A newborn’s eyes can occasionally wander or cross while they are learning to work together. What is worth checking is an eye that regularly turns in or out, seems stuck, looks cloudy, will not close fully, or has redness or discharge that keeps coming back.\n\nA bit of sticky eye in the early weeks is very common and usually a blocked tear duct rather than an infection, but that's a call for someone who can look at it, not for you at home."
    },
    {
      "h": "Her eyes did get checked",
      "t": "A paediatrician shone a light into each eye to see whether she reacted, and she closed each one as it was done. It's a small thing and it isn't a full eye test, but standing there watching her respond was one of the better moments of that week.\n\nAsk when a proper check is due, particularly if she was born early. And in the meantime, enjoy the stare. She's working out what a face is."
    }
  ],
  "batch": "1"
},
{
  "id": "is-that-a-real-smile",
  "topic": "development",
  "icon": "blocks",
  "featured": false,
  "title": "Was that a real baby smile or just wind?",
  "ages": [
    "0–1 month",
    "2–3 months"
  ],
  "read": 2,
  "stage": "0–1 month",
  "subcategory": "Newborn senses",
  "summary": "Early smiles are usually spontaneous rather than social. Which does not make them count for nothing — and you're allowed to take it personally.",
  "keywords": [
    "newborn smile",
    "first smile",
    "social smile",
    "reflex smile baby",
    "when do babies smile"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "No social smiling by around three months, corrected for prematurity",
      "She doesn't seem to make eye contact, or follow your face",
      "She doesn't respond to your voice",
      "Any loss of a skill she previously had",
      "Anything that's been niggling at you — bring it to the next check rather than sitting on it"
    ]
  },
  "panel": {
    "eyebrow": "Development • Newborn",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Early smiles are spontaneous, often in sleep",
        "Social smile around six to eight weeks",
        "Aimed at you, and repeatable",
        "Count from the due date if she was early"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Smiling back matters even if she didn't mean it",
        "The loop starts before she can do it on purpose",
        "We used corrected age, not only her birth date",
        "You're allowed to take it personally"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "No social smile by around three months, corrected",
        "No eye contact, or not following your face",
        "No response to your voice",
        "Any skill she previously had and has lost"
      ]
    },
    "dont": null,
    "quick": "Early smiles are often spontaneous; social smiles usually arrive later, and corrected age matters for babies born early."
  },
  "originalQuestions": [
    "Had seen her smile several times in the incubator and asked whether she was doing it deliberately (16 August 2025)"
  ],
  "sources": [
    "RAW-20250816-68a057a3-09"
  ],
  "medical": false,
  "related": [
    "newborns-and-blinking",
    "newborn-noises-at-night",
    "feeding-on-demand"
  ],
  "seo": {
    "description": "Early baby smiles are usually spontaneous rather than social, but you are still allowed to take them personally."
  },
  "longform": [
    {
      "h": "She smiled several times in the incubator",
      "t": "That's how the question was actually asked. Does she know what she's doing when she's smiling, because she did it several times in the incubator today.\n\nIt was in the middle of a much longer conversation about her weight, about when they'd introduce breast milk, and about everything we needed to know before she came home. And in among all of that, the smile is the thing we stopped to ask about."
    },
    {
      "h": "The scientific answer",
      "t": "Early smiles are usually spontaneous rather than social. In the first weeks they tend to happen during sleep, or as movements that aren't yet aimed at anybody.\n\nThe deliberate one — the whole-face, directed-at-you smile you can get her to do again — usually turns up somewhere around six to eight weeks. It's unmistakable when it happens."
    },
    {
      "h": "Count from her due date, not her birthday",
      "t": "This is the part that saves a lot of unnecessary worry and nobody explains it well.\n\nAri was born in July at 33 weeks and was due in September. For early milestones like this, corrected age is counted from the due date rather than the birth date. A baby born seven weeks early may reach a milestone seven weeks later and still be right on track.\n\nWe asked whether that gap closes or stays. Corrected age can remain useful for the first two years, then it gradually stops mattering. Knowing that earlier would have spared us a few worried evenings."
    },
    {
      "h": "Why the reflex ones counted anyway",
      "t": "Here's what we'd say to anybody arguing with themselves about whether it was real.\n\nYou smiled back. You talked to her. Your voice went up. You leaned in closer to a plastic box to get a better look.\n\nShe may not have meant it. The thing it started was real, and it was happening weeks before she could do anything about it on purpose. That's not sentiment — it's how the whole business gets going."
    }
  ],
  "batch": "1"
},
{
  "id": "when-does-milk-come-in",
  "topic": "feeding",
  "icon": "bottle",
  "featured": false,
  "title": "When does the milk actually come in?",
  "ages": [
    "0–1 month"
  ],
  "read": 2,
  "summary": "Thick, yellow colostrum is expected at first; fuller milk volume often arrives between days two and five and can be later after a caesarean.",
  "keywords": [],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Milk has not started changing after several days and you are worried",
      "Your baby isn't producing wet nappies as expected",
      "You're in real pain, or there's a hot, red, painful area",
      "Your midwife or NICU is concerned about supply or feeding"
    ]
  },
  "panel": {
    "eyebrow": "Feeding • Newborn",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Thick, yellow, and only drops of it",
        "That's the right substance, not a failed attempt",
        "Fuller volume usually arrives day two to five",
        "Often a little later after a caesarean"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Counting drops rather than millilitres at first",
        "Starting to express early, before it felt worth it",
        "Getting the hospital's own targets rather than an internet number",
        "Frequency mattered more than how long each session ran",
        "Very gentle massage on a tight area",
        "Microwavable heat pads for comfort before pumping",
        "Ice packs for after pumping",
        "Silver nipple cups for soreness",
        "Medela nipple cream"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Milk has not started changing after several days and you are worried",
        "Your baby isn't producing wet nappies as expected",
        "You're in real pain, or there's a hot, red, painful area",
        "Your midwife or NICU is concerned about supply or feeding"
      ]
    },
    "quick": "Colostrum is thick, yellow and measured in drops, and that's exactly right. Fuller volume usually turns up between days two and five, often later after a caesarean."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "pumping-schedule",
    "milk-supply-dropped",
    "blocked-duct-or-mastitis"
  ],
  "seo": {
    "description": "Thick, yellow colostrum is expected at first; fuller milk volume often arrives between days two and five and can be later after a caesarean."
  },
  "longform": [
    {
      "h": "We thought something had gone wrong",
      "t": "Mama had delivered by caesarean at 33 weeks, Ari was in NICU, and we were already staring at a few yellow drops wondering how that could possibly be enough. It felt as though the milk had not arrived. In fact, this was the milk.\n\nColostrum is thick, yellow and made in tiny amounts. When you are measuring drops rather than bottles, it is easy to think your body is failing. It is not. Those first drops are exactly what a newborn needs."
    },
    {
      "h": "The fuller milk takes a little time",
      "t": "The fuller, paler milk often arrives between days two and five. It can take a little longer after a caesarean or a difficult birth. Knowing that earlier would have saved us a great deal of staring at the pump in despair.\n\nVery gentle massage helped when Mama felt a tight area. Brief warmth before an ordinary pumping session felt soothing, and an ice pack afterwards helped with soreness. Pumping is hard work and, especially at the beginning, it can hurt.\n\nPortable pumps gave Mama more freedom, but for her the suction felt more robotic and hurt more. The sit-down pump was far less convenient, but the suction felt more natural and was easier on her body. Freedom is wonderful; pain-free is better.\n\nSilver nipple cups were amazing for Mama’s soreness, and Medela nipple cream helped too. That was our experience rather than a promise for every skin type, so stop if something irritates the area and ask for feeding support if pain continues.\n\nIf your baby is in NICU, the nurses may collect even the smallest amount. Nothing feels more ridiculous than proudly carrying over a syringe containing what looks like almost nothing. But almost nothing is still something."
    },
    {
      "h": "Why pumping mattered for us",
      "t": "Ari could not feed directly at first, so expressing did two jobs: it gave her the colostrum Mama was making and told Mama’s body to keep making more. The pump was not replacing Ari. It was standing in for her until she could feed herself.\n\nWhat helped most was asking the NICU nurses what they wanted from us, rather than comparing every session with numbers online. If you are getting very little, are in pain or are worried that nothing is changing, ask your midwife, lactation support or baby’s nurse."
    }
  ],
  "order": 31,
  "batch": "3"
},
{
  "id": "pumping-schedule",
  "topic": "feeding",
  "icon": "bottle",
  "featured": false,
  "title": "How often should I pump around the clock?",
  "ages": [
    "0–1 month",
    "2–3 months"
  ],
  "read": 2,
  "summary": "Roughly eight sessions in twenty-four hours, and one longer gap at night that you plan for rather than fall into.",
  "keywords": [],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Supply is dropping and you can't work out why",
      "There's a hot, red, painful area, or you feel flu-like",
      "You're in so much pain you're avoiding sessions",
      "You're not coping — say it early rather than at breaking point"
    ]
  },
  "panel": {
    "eyebrow": "Feeding • 0–3 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Roughly every three hours, day and night",
        "Frequency matters more than session length",
        "Your support person can help plan a realistic night gap",
        "It's genuinely, physically tiring — that's not you failing"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Counting from when the session starts, not when it ends",
        "Writing out the actual clock times for the whole day",
        "Planning any longer night gap with feeding support",
        "Alarms, because nobody remembers at 4am"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Supply is dropping and you can't work out why",
        "There's a hot, red, painful area, or you feel flu-like",
        "You're in so much pain you're avoiding sessions",
        "You're not coping — say it early rather than at breaking point"
      ]
    },
    "quick": "Early pumping often means frequent sessions across day and night; writing down the real times made it much easier for us to manage."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "when-does-milk-come-in",
    "milk-supply-dropped",
    "blocked-duct-or-mastitis"
  ],
  "seo": {
    "description": "Roughly eight sessions in twenty-four hours, and one longer gap at night that you plan for rather than fall into."
  },
  "longform": [
    {
      "h": "The schedule looked slightly unhinged",
      "t": "When we were told to pump around every three hours, our first reaction was basically: so nobody sleeps now? It was a joke, but only just.\n\nEarly on, many parents are advised to aim for roughly eight sessions across twenty-four hours. Your own plan may be different, especially after a premature birth, so use the schedule given by your midwife, lactation support or NICU.If Mama produced more than Ari needed, we froze it in smaller amounts. We liked milk-storage bags with a little pouring spout: fill them from the top, then pour through the spout without covering the kitchen in liquid gold. Smaller portions also meant we thawed only what we expected to use. Once milk had been fully thawed, we followed the storage limit we had been given, never refroze it and used warmed milk promptly."
    },
    {
      "h": "Write the real times down",
      "t": "‘Every three hours’ sounds simple until it is three in the morning and nobody can remember whether the last session started at midnight or finished at midnight. Papa tried several apps because Papa always tries an app first. In the end, pen, a paper journal and alarms worked better.While Ari was in NICU, Papa also woke up for moral support. Once she came home, that became impossible. One of us had to sleep, and moral support is considerably less useful when both parents are barely functioning.\n\nThat tiny bit of organisation removed one decision from an already exhausting day. A shared note also meant Mama did not have to carry the whole schedule in her head."
    },
    {
      "h": "It is genuinely tiring",
      "t": "Producing milk takes energy. Doing it with a machine around the clock, while recovering from birth and visiting a baby in hospital, is hard work. Feeling exhausted does not mean you are doing it badly. It means it is exhausting.\n\nIf the plan is breaking you, say so. Ask where a longer sleep gap can safely sit for your situation instead of quietly missing alarms and feeling guilty afterwards."
    }
  ],
  "order": 32,
  "batch": "3"
},
{
  "id": "milk-supply-dropped",
  "topic": "feeding",
  "icon": "bottle",
  "featured": false,
  "title": "Why has my milk supply dropped on one side?",
  "ages": [
    "0–1 month",
    "2–3 months"
  ],
  "read": 2,
  "summary": "Sides are rarely equal, and supply follows demand. The most common answer is the least satisfying one: missed sessions.",
  "keywords": [],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "There's a hot, red or painful area, or a hard lump",
      "You feel flu-like, shivery or feverish",
      "Supply drops sharply and stays down despite regular sessions",
      "There's blood, or a cracked nipple that isn't healing"
    ]
  },
  "panel": {
    "eyebrow": "Feeding • 0–3 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Sides are almost never equal",
        "Supply follows how often milk is removed",
        "Missed or shortened sessions show up within days",
        "Stress, illness and exhaustion all feed in"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Being honest that we'd been missing the three-hour gaps",
        "Checking the pump parts before blaming the body",
        "Adding a session back rather than making sessions longer",
        "Not weighing every single expression"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "There's a hot, red or painful area, or a hard lump",
        "You feel flu-like, shivery or feverish",
        "Supply drops sharply and stays down despite regular sessions",
        "There's blood, or a cracked nipple that isn't healing"
      ]
    },
    "quick": "Sides are rarely equal and supply follows demand, so missed sessions are the usual culprit. Heat, pain, a hard lump or feeling flu-like is a different conversation."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "when-does-milk-come-in",
    "pumping-schedule",
    "blocked-duct-or-mastitis"
  ],
  "seo": {
    "description": "Sides are rarely equal, and supply follows demand. The most common answer is the least satisfying one: missed sessions."
  },
  "longform": [
    {
      "h": "One side suddenly did much less",
      "t": "One side had been producing well and then seemed to stop cooperating. No dramatic pain. No obvious red patch. Just a much smaller number and two worried parents staring at it.\n\nThe first reassuring thing we learned was that breasts are rarely perfectly equal. One side often makes more than the other, and the total over time matters more than matching bottles."
    },
    {
      "h": "We checked what was actually happening",
      "t": "When the whole supply later dropped, we looked at the real pumping record rather than the schedule we thought we were following. Sessions had slipped because there was a baby to hold, a hospital to visit and a day to survive. Supply had followed demand.\n\nThat was not laziness. It was life. Once we saw the pattern, the problem felt less mysterious and more fixable."
    },
    {
      "h": "Check the simple things first",
      "t": "We would first check the last few days of sessions, then the pump parts and the cone or flange fit. Worn valves or a poor fit can make a surprising difference. Food, fluids, sleep and illness matter too.\n\nA hot or red area, a painful lump, fever or feeling flu-like is different. Speak to a doctor, midwife or breastfeeding specialist, especially if you feel unwell or things are getting worse."
    }
  ],
  "order": 33,
  "batch": "3"
},
{
  "id": "blocked-duct-or-mastitis",
  "topic": "feeding",
  "icon": "bottle",
  "featured": false,
  "title": "Is this a blocked milk duct or mastitis?",
  "ages": [
    "0–1 month",
    "2–3 months"
  ],
  "read": 2,
  "summary": "A tender lump usually clears with milk moving through it. Heat, redness or feeling unwell changes the answer and shouldn't wait.",
  "keywords": [],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "A red or hot area, especially a wedge-shaped patch",
      "Fever, shivering, aching, or feeling flu-like",
      "A lump that isn't shifting after about a day",
      "Cracked skin, bleeding, or pain that's getting worse"
    ]
  },
  "panel": {
    "eyebrow": "Feeding • 0–3 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "A tender lump that moves or changes with a session",
        "Often after a missed or rushed session",
        "No fever, and you feel otherwise well",
        "Usually settles once milk is moving through it again"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Warmth before a session, cool afterwards",
        "Gentle massage towards the nipple while expressing",
        "Not skipping the next session out of soreness",
        "Silver nipple cups for pumping soreness",
        "Checking the cone or flange size — the wrong fit can add pain"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "A red or hot area, especially a wedge-shaped patch",
        "Fever, shivering, aching, or feeling flu-like",
        "A lump that isn't shifting after about a day",
        "Cracked skin, bleeding, or pain that's getting worse"
      ]
    },
    "quick": "A tender area without fever may be inflammation; redness, worsening pain or flu-like symptoms are reasons to seek same-day advice."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "when-does-milk-come-in",
    "pumping-schedule",
    "milk-supply-dropped"
  ],
  "seo": {
    "description": "A tender lump usually clears with milk moving through it. Heat, redness or feeling unwell changes the answer and shouldn't wait."
  },
  "longform": [
    {
      "h": "The word mastitis frightened us",
      "t": "We asked about bumps, swelling and soreness on different days, and mastitis appeared in every search result. Neither episode became mastitis, but the word was enough to send us into a small panic.\n\nA tender lump can happen when milk is not moving well. Mastitis is inflammation of the breast, and infection can sometimes develop. A hot, swollen or very painful area with fever, shivering or feeling generally unwell needs medical advice."
    },
    {
      "h": "Gentle was better",
      "t": "We tried pressing much harder than necessary because it felt logical that a blockage needed to be forced out. It mostly made an already sore breast angrier.\n\nVery light touch helped Mama feel more comfortable, but this is not the place for deep, muscle-style massage or trying to force a “knot” out. Continuing normal milk removal, using a cool pack, checking the pump fit and getting feeding support were more useful. If feeding or pumping is painful, ask someone to check the latch, cone and schedule rather than battling through it."
    },
    {
      "h": "When to ask for help",
      "t": "If Mama feels unwell, the breast is hot or red, or the pain is worsening, get same-day advice. If a lump is not improving, ask for help even without a fever.\n\nThis is common and treatable. It is also not a test of toughness. Nobody gets a prize for waiting until it is unbearable."
    }
  ],
  "order": 34,
  "batch": "3"
},
{
  "id": "storing-expressed-milk",
  "topic": "feeding",
  "icon": "bottle",
  "featured": false,
  "title": "How long can expressed milk sit out?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 2,
  "summary": "Room temperature buys you a few hours, and a warm room buys you fewer. If your baby is in hospital, their rules override every chart online.",
  "keywords": [],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Your baby is premature, in hospital, or unwell — the rules are stricter",
      "Milk smells sour or looks unusual",
      "You've had a power cut or a freezer failure",
      "You're unsure whether milk has been out too long"
    ]
  },
  "panel": {
    "eyebrow": "Feeding • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "A cool room buys longer than a warm one",
        "Fresh milk can keep for days at home; NICU limits may be shorter",
        "Defrost in the fridge, not on the counter",
        "Freshly expressed keeps longer than previously frozen"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Labelling every bottle with date, time and quantity in ml",
        "Checking the actual room temperature, not guessing",
        "Defrosting overnight in the fridge and planning ahead",
        "Following the NICU's rules over anything we read"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Your baby is premature, in hospital, or unwell — the rules are stricter",
        "Milk smells sour or looks unusual",
        "You've had a power cut or a freezer failure",
        "You're unsure whether milk has been out too long"
      ]
    },
    "quick": "Fresh breast milk can keep for up to four days in a cold home fridge, but NICU rules may be much shorter—ours used a 24-hour limit."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "when-does-milk-come-in",
    "pumping-schedule",
    "milk-supply-dropped"
  ],
  "seo": {
    "description": "Room temperature buys you a few hours, and a warm room buys you fewer. If your baby is in hospital, their rules override every chart online."
  },
  "longform": [
    {
      "h": "The room temperature changed the answer",
      "t": "Our first question was whether breast milk left out for ninety minutes was still usable. Then we added the important detail: the room was warm. That detail mattered more than the clock alone.Freshly expressed breast milk can generally sit at room temperature for up to four hours when the room is 25°C or cooler. Prepared formula follows a different rule: use it within two hours of making it and within one hour once feeding begins. A hotter room shortens the comfortable safety margin, so we chilled milk early rather than stretching the limit.\n\nStorage times assume certain temperatures. A hot room shortens the safe window, so when in doubt we chilled the milk sooner instead of trying to win an argument with a chart."
    },
    {
      "h": "The practical bits caught us out",
      "t": "Frozen milk takes hours to thaw in the fridge, not the few minutes you imagine when a hungry baby is already waiting. Labelling every bottle with the date and time also saved us from making tired guesses.\n\nWe never microwaved milk. We started with a Kikka Boo warmer, then changed to the Baby Brezza warmer, which worked much better for us. We did not refreeze thawed milk or keep reheating the same bottle. Once Ari started drinking, we followed the shorter leftover-bottle limit we had been given."
    },
    {
      "h": "NICU rules come first",
      "t": "Hospital rules can be stricter than general home guidance, particularly for premature or unwell babies. Our NICU told us exactly how to label, store and transport Mama’s milk.\n\nIf your baby is in hospital, ask the unit for its written rules and follow those. It is much easier than trying to combine five different internet charts at two in the morning."
    }
  ],
  "order": 35,
  "batch": "3"
},
{
  "id": "warming-milk-out-and-about",
  "topic": "feeding",
  "icon": "bottle",
  "featured": false,
  "title": "How do I keep expressed milk ready when we are out?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 2,
  "summary": "Carry it cold and warm it when you need it. Holding milk at feeding temperature for hours is the thing to avoid.",
  "keywords": [],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Your baby is premature or has feeding difficulties",
      "You've been told to give milk at a specific temperature",
      "Milk has been warm for longer than you intended",
      "You're unsure whether a bottle is still safe to use"
    ]
  },
  "panel": {
    "eyebrow": "Feeding • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Carry it chilled in a cool bag, warm it on demand",
        "Portable warmers run from a battery",
        "A formula dispenser with measured scoops and a pouring spout",
        "Body temperature is a comfort thing, not a requirement",
        "Some babies take milk cool without complaint"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Cold bag out, warm at the last minute",
        "The Baby Brezza portable warmer was fast and easy for us",
        "Testing the temperature on our wrist every time",
        "Working out how long our warmer actually took",
        "Not trying to hold a bottle at 37 for hours"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Your baby is premature or has feeding difficulties",
        "You've been told to give milk at a specific temperature",
        "Milk has been warm for longer than you intended",
        "You're unsure whether a bottle is still safe to use"
      ]
    },
    "quick": "Take it cold and warm it when she's ready. Holding milk at 37 degrees for hours is the thing to avoid, and a microwave is never the answer."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "when-does-milk-come-in",
    "pumping-schedule",
    "milk-supply-dropped"
  ],
  "seo": {
    "description": "Carry it cold and warm it when you need it. Holding milk at feeding temperature for hours is the thing to avoid."
  },
  "longform": [
    {
      "h": "We were trying to keep it warm for hours",
      "t": "Our original plan was to hold milk at feeding temperature while we were out so it would be instantly ready. It sounded efficient. It was also the wrong way round.\n\nWe learned to carry the milk cold and warm it when Ari needed it. That was safer and, once we stopped overcomplicating it, easier."
    },
    {
      "h": "Test the warmer before leaving home",
      "t": "We used a cool bag and a portable warmer. The surprise was how long our first warmer took when the bottle started fridge-cold. A baby who has decided she is hungry is not impressed by a device that needs another fifteen minutes.The Baby Brezza portable warmer was much faster for us. By then Ari was on formula, and the measured powder dispenser with a spout made outings far less messy. One important correction to what we did: current guidance for standard powdered formula is to mix it with fresh water that is still at least 70°C, because formula powder is not sterile. Reheating previously boiled cold water in a bottle warmer may not reach that temperature. For travel, use the method advised for your formula and baby—for example, a clean flask keeping fresh water above 70°C, or ready-to-feed liquid formula—then cool the finished bottle before feeding.\n\nWe tested ours at home and checked the milk before feeding rather than trusting the screen alone. We also carried a simple backup plan for days when technology behaved like technology."
    },
    {
      "h": "Your baby may not need it warm",
      "t": "Some babies happily drink cool or room-temperature milk. Finding that out early can remove the whole warming problem.\n\nFollow the storage and transport advice for your milk, and use any extra instructions from your NICU or baby’s doctor. We treated warming as a one-time job and did not microwave or repeatedly reheat a bottle."
    }
  ],
  "order": 36,
  "batch": "3"
},
{
  "id": "nicu-stages",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "What do the different NICU stages mean?",
  "ages": [
    "0–1 month"
  ],
  "read": 2,
  "summary": "The numbers describe how much support your baby needs, not how she's doing overall. And they don't only go one way.",
  "keywords": [],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "You don't understand why she's moved, in either direction",
      "The plan has changed and nobody has explained it",
      "You're being given different answers by different people",
      "You want a second opinion — asking is normal and allowed"
    ]
  },
  "panel": {
    "eyebrow": "Health • Newborn",
    "normal": {
      "title": "Usually normal",
      "items": [
        "The number reflects how much help she needs",
        "Moving between stages can happen in either direction",
        "Timelines are estimates, not promises",
        "Units name and number their stages differently"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Asking what specifically has to change before she moves",
        "Writing down names, numbers and times at every round",
        "Asking what would trigger going back a stage",
        "Treating estimates as estimates"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "You don't understand why she's moved, in either direction",
        "The plan has changed and nobody has explained it",
        "You're being given different answers by different people",
        "You want a second opinion — asking is normal and allowed"
      ]
    },
    "quick": "The stage number describes how much support she needs right now, not how she's doing overall — and units number them differently, so ask what yours mean."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "incubator-temperature",
    "nicu-discharge",
    "preemie-feeding-stamina"
  ],
  "seo": {
    "description": "The numbers describe how much support your baby needs, not how she's doing overall. And they don't only go one way."
  },
  "longform": [
    {
      "h": "We wanted the stages to be a countdown",
      "t": "We were told Ari would move through different NICU stages, so naturally we wanted to know exactly when stage one became stage two and when stage two meant home. We asked more than once because the first answer did not satisfy our need for a timetable.\n\nThe stages were not a countdown. They described how much support she needed at that moment."
    },
    {
      "h": "Every NICU uses its own language",
      "t": "Some units number stages in opposite directions. That makes an online chart wonderfully useless if your hospital means the reverse.\n\nAsk what each stage means in your unit and write it down. The better question for us was not ‘When will she move?’ but ‘What does she need to manage before she moves?’"
    },
    {
      "h": "A step backwards is still care",
      "t": "Ari moved forward and later went back a stage when feeding stopped going well. It felt awful. It did not mean everything had failed. It meant the nurses noticed she needed more support and gave it to her.\n\nNICU progress is rarely a neat straight line. A backwards step can still be the team doing exactly what your baby needs that day."
    }
  ],
  "order": 37,
  "batch": "3"
},
{
  "id": "incubator-temperature",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "Why does the incubator show such a low temperature?",
  "ages": [
    "0–1 month"
  ],
  "read": 2,
  "summary": "A NICU screen may show the incubator setting rather than your baby’s temperature, so ask what the number is measuring before interpreting it.",
  "keywords": [],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Nobody has explained a reading that's worrying you",
      "She feels cold, mottled or unusually pale to you",
      "You're at home and her temperature is low or high",
      "Anything about her has changed and you can't get an answer"
    ]
  },
  "panel": {
    "eyebrow": "Health • Newborn",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Small babies lose heat very fast",
        "Incubators warm gradually and deliberately",
        "Holding her own temperature is a discharge milestone",
        "The number on the screen isn't always what you think"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Asking what the number was measuring, and where",
        "Asking what they wanted it to be, and by when",
        "Skin-to-skin when the unit said we could",
        "Not looking things up before asking someone"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Nobody has explained a reading that's worrying you",
        "She feels cold, mottled or unusually pale to you",
        "You're at home and her temperature is low or high",
        "Anything about her has changed and you can't get an answer"
      ]
    },
    "quick": "A low-looking number may be the incubator setting rather than your baby’s temperature, so ask the NICU nurse or doctor what it measures."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "nicu-stages",
    "nicu-discharge",
    "preemie-feeding-stamina"
  ],
  "seo": {
    "description": "A NICU screen may show the incubator setting rather than your baby’s temperature, so ask what the number is measuring before interpreting it."
  },
  "longform": [
    {
      "h": "We frightened ourselves with one number",
      "t": "We saw a low number on the incubator screen, searched it before asking anyone and scared ourselves badly. The number was not what we thought it was.\n\nA NICU display may show the incubator setting, a skin reading or something else entirely. The first question should be: what is this number measuring?"
    },
    {
      "h": "The incubator is doing a job for them",
      "t": "Babies born early lose heat easily and may not yet hold their own temperature. The incubator takes over that job while their body catches up.\n\nThe nurses adjust it gradually while checking the baby. From outside, slow changes can look worrying. Inside the plan, slow and controlled may be exactly the point."
    },
    {
      "h": "Eventually the screen looked like progress",
      "t": "Once we understood what we were seeing, changes to the incubator stopped feeling like random danger signals. They showed Ari slowly taking over more of the work herself.\n\nAsk what the number means, what range the nurses want and what change they are waiting for. Thirty seconds with the nurse is kinder to your nerves than an hour with a search engine."
    }
  ],
  "order": 38,
  "batch": "3"
},
{
  "id": "nicu-discharge",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "Is there a minimum weight before she can come home?",
  "ages": [
    "0–1 month"
  ],
  "read": 2,
  "summary": "Almost everyone asks about the number. Readiness is really about three things she has to be doing herself, and weight is not one of them.",
  "keywords": [],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "What would delay discharge, and what would bring it forward",
      "Which follow-up appointments are already booked",
      "What signs should bring her back, and who to ring",
      "Feeding volumes, and what to do if she won't take them"
    ]
  },
  "panel": {
    "eyebrow": "Health • Newborn",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Holding her own temperature outside an incubator",
        "Breathing steadily without support",
        "Taking all her feeds by mouth and gaining",
        "Weight matters, but not as a single magic number"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Asking which of the three she still had left",
        "Asking what to look for at home before we needed it",
        "Doing infant first aid before she came home",
        "Writing everything down, because we forgot it all"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "What would delay discharge, and what would bring it forward",
        "Which follow-up appointments are already booked",
        "What signs should bring her back, and who to ring",
        "Feeding volumes, and what to do if she won't take them"
      ]
    },
    "quick": "Discharge usually depends more on stable breathing, temperature and feeding than one magic weight, but each NICU has its own criteria."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "nicu-stages",
    "incubator-temperature",
    "preemie-feeding-stamina"
  ],
  "seo": {
    "description": "Almost everyone asks about the number. Readiness is really about three things she has to be doing herself, and weight is not one of them."
  },
  "longform": [
    {
      "h": "We kept asking for the magic weight",
      "t": "A minimum weight felt comforting because it gave us a finish line. We asked what Ari had to weigh before she could come home more than once.\n\nThere was no magic number. Her NICU cared about what she could do safely, not simply what appeared on the scales."
    },
    {
      "h": "Three jobs mattered most for us",
      "t": "Ari needed to breathe steadily, hold her temperature and take enough milk by mouth while growing. Weight moved alongside those skills, but it did not unlock the door by itself.\n\nThe useful question became: which job is she still working on? That gave us something real to understand without pretending anyone could promise a date."
    },
    {
      "h": "Feeding was the slow final stretch",
      "t": "Ari could take only part of each feed herself before getting tired, with the rest given through her tube. Some days the amount rose and the next day it dropped. Watching every millilitre made us slightly cuckoo.\n\nBefore discharge, ask for the feeding plan, warning signs, follow-up appointments and a number to call after hours. We also took an infant first-aid course. Happily, the best thing we ever did with that knowledge was not need it."
    }
  ],
  "order": 39,
  "batch": "3"
},
{
  "id": "preemie-feeding-stamina",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "Why can my premature baby only manage a little milk?",
  "ages": [
    "0–1 month"
  ],
  "read": 2,
  "summary": "Not appetite — stamina. Sucking, swallowing and breathing in sequence is genuinely hard work, and it comes with time rather than encouragement.",
  "keywords": [],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "She's taking noticeably less by mouth than she was",
      "She goes pale, or her breathing changes during feeds",
      "She's not gaining weight as expected",
      "She's very sleepy and hard to wake for feeds"
    ]
  },
  "panel": {
    "eyebrow": "Health • Newborn",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Sucking, swallowing and breathing must happen in order",
        "That coordination matures around 34 weeks and improves after",
        "Progress is uneven — good days and worse days",
        "The rest going by tube isn't a failure"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Counting the millilitres she took by mouth, not the total",
        "Noticing when she was most alert, and discussing feed timing with the NICU nurses",
        "Letting her pause, and not rushing her back on",
        "Asking about a slower teat"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "She's taking noticeably less by mouth than she was",
        "She goes pale, or her breathing changes during feeds",
        "She's not gaining weight as expected",
        "She's very sleepy and hard to wake for feeds"
      ]
    },
    "quick": "Premature babies often tire before finishing a feed, but a clear drop, colour change or breathing change needs the NICU nurse or doctor."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "nicu-stages",
    "incubator-temperature",
    "nicu-discharge"
  ],
  "seo": {
    "description": "Not appetite — stamina. Sucking, swallowing and breathing in sequence is genuinely hard work, and it comes with time rather than encouragement."
  },
  "longform": [
    {
      "h": "It looked like she was refusing",
      "t": "Ari was offered a full feed but could manage only a small part by mouth before she stopped. We thought she needed to become hungrier. What she actually needed was stamina.\n\nSucking, swallowing and breathing in the right order is hard work for a baby born early. She was not being difficult. She was tired."
    },
    {
      "h": "The daily numbers bounced around",
      "t": "One day she took more and we celebrated. The next day she took less and we felt crushed. Looking across a week told us far more than staring at one feed.\n\nTests, baths and busy days also used energy she might otherwise have spent feeding. Once we understood that, a smaller feed did not automatically feel like a disaster."
    },
    {
      "h": "We followed her cues",
      "t": "Within the NICU plan, feeding when she was alert helped. So did letting her stop when she showed she was finished rather than turning every last millilitre into a battle.\n\nWhen Papa first fed Ari, he was very excited—and then she suddenly went still and seemed to switch off. Papa thought she had lost consciousness. The NICU nurses stepped in, explained that she had become exhausted and showed him how to pace the feed: let her drink, lower or remove the teat for a breathing break, then continue only when she was ready.That was normal for Ari in that supervised NICU moment, not something to assume is harmless at home. If a baby becomes unresponsive, changes colour or struggles to breathe during a feed, stop and get urgent help.\n\nWe asked about teat flow and positioning too. Premature feeding is individual, so the NICU nurses and doctors are the right people to guide volumes, pacing and when a tube is still needed."
    }
  ],
  "order": 40,
  "batch": "3"
},
{
  "id": "preemie-bloated-tummy",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "Why is my premature baby’s tummy firm and bloated?",
  "ages": [
    "0–1 month"
  ],
  "read": 2,
  "summary": "A swollen, firm abdomen in a small baby is one to raise straight away rather than watch. In hospital it is taken seriously fast, and there are good reasons for that.",
  "keywords": [],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "lead": "A floppy baby you cannot wake — call your local emergency number now.",
    "items": [
      "The abdomen is firm, swollen, or shiny",
      "Vomiting, especially green or bloody",
      "Blood in the stool, or she stops passing anything",
      "She's unusually sleepy, floppy, or her colour changes",
      "You're at home and any of this appears — same day, not tomorrow"
    ]
  },
  "panel": {
    "eyebrow": "Health • Newborn",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Premature digestive systems mature slowly",
        "Some bloating and slow tolerance is expected",
        "Feeds are often paused and reintroduced gradually",
        "Pausing feeds is a precaution, not a punishment"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Asking what specifically they were watching for",
        "Asking what would change the plan, in either direction",
        "Writing down what we were told, every single time",
        "Saying out loud that we were frightened"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "lead": "A floppy baby you cannot wake — call your local emergency number now.",
      "items": [
        "The abdomen is firm, swollen, or shiny",
        "Vomiting, especially green or bloody",
        "Blood in the stool, or she stops passing anything",
        "She's unusually sleepy, floppy, or her colour changes",
        "You're at home and any of this appears — same day, not tomorrow"
      ]
    },
    "quick": "A firm, swollen tummy in a premature or small baby needs quick medical advice, especially with green vomit, blood or colour changes."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "nicu-stages",
    "incubator-temperature",
    "nicu-discharge"
  ],
  "seo": {
    "description": "A swollen, firm abdomen in a small baby is one to raise straight away rather than watch. In hospital it is taken seriously fast, and there are good reasons for that."
  },
  "longform": [
    {
      "h": "She went back a stage",
      "t": "A few weeks into NICU, Ari’s tummy became firm and she was not digesting feeds properly. Her feeds were paused while the doctors worked out what was happening. That night was frightening.\n\nShe recovered and later came home. But while we were in it, we wanted someone to explain why everyone was moving so quickly without making the situation sound even scarier."
    },
    {
      "h": "Why the NICU acts quickly",
      "t": "Premature digestion is still developing, and mild bloating can happen. A firm or swollen tummy can also be an early sign of something that needs urgent attention. That is why NICU staff do not casually watch and wait.\n\nPausing feeds can give the bowel a rest while the team checks what is happening. It does not automatically mean surgery or the worst outcome. It means they are being careful."
    },
    {
      "h": "Ask the frightening questions",
      "t": "We asked what they were watching, what would change the plan and whether surgery was genuinely expected or simply being prepared for. Those direct answers helped more than trying to decode every expression around the incubator.\n\nIf a newborn at home has a firm, swollen tummy—especially with green vomit, blood, poor feeding or unusual sleepiness—get urgent medical advice. This is not one to monitor quietly overnight."
    }
  ],
  "order": 41,
  "batch": "3"
},
{
  "id": "corrected-age",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "What is corrected age and when should I use it?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months",
    "7–9 months",
    "10–12 months"
  ],
  "read": 2,
  "summary": "Count from the due date, not the birthday. It's a small arithmetic change that removes an enormous amount of unnecessary worry.",
  "keywords": [],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "You're unsure which age applies to vaccinations or a check",
      "A milestone is well outside range even corrected",
      "She's lost a skill she previously had",
      "Anything has been niggling at you between appointments"
    ]
  },
  "panel": {
    "eyebrow": "Health • 0–12 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Corrected age = count development from the due date",
        "Use it for milestones, feeding and sleep expectations",
        "The gap matters most in the first two years",
        "Vaccinations usually go by actual birth date — check yours"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Writing both dates on the fridge",
        "Recalculating before panicking about a milestone",
        "Telling relatives, so their comparisons stopped landing",
        "Asking which age each appointment was using"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "You're unsure which age applies to vaccinations or a check",
        "A milestone is well outside range even corrected",
        "She's lost a skill she previously had",
        "Anything has been niggling at you between appointments"
      ]
    },
    "quick": "Count milestones from the due date rather than the birthday. Vaccinations usually follow actual age, so check which age each appointment is using."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "nicu-stages",
    "incubator-temperature",
    "nicu-discharge"
  ],
  "seo": {
    "description": "Count from the due date, not the birthday. It's a small arithmetic change that removes an enormous amount of unnecessary worry."
  },
  "longform": [
    {
      "h": "Two ages can make everything look confusing",
      "t": "Ari was born in July at 33 weeks and was due in September. For development, those missing weeks matter.\n\nWithout corrected age, a premature baby can look behind on every chart while actually progressing exactly as expected. Understanding that removed a huge amount of worry for us."
    },
    {
      "h": "Count from the due date",
      "t": "Corrected age is the age your baby would be if they had been born around their due date. A baby born seven weeks early may reach a milestone roughly seven weeks later than a term baby and still be on track.\n\nWe used corrected age for things such as milestones, early feeding expectations and sleep. It helped us compare Ari with the right stage rather than with babies who had seven extra weeks to practise."
    },
    {
      "h": "It does not apply to everything",
      "t": "Vaccinations are usually based on actual age, not corrected age. Other medical appointments may use one or the other depending on what is being assessed.\n\nWe learned to ask which age was being used instead of assuming. Corrected age usually becomes less important over the first two years, until one day you realise you have stopped doing the maths."
    }
  ],
  "order": 42,
  "batch": "3"
},
{
  "id": "preemie-growth-charts",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "Which growth chart should a premature baby use?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 2,
  "summary": "Percentiles are close to meaningless for a baby born early unless you're using the right chart and the right age. Her own trend is the number that matters.",
  "keywords": [],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Her weight is flat or falling across more than a few days",
      "She's dropping across the chart rather than following her line",
      "She's feeding much less than usual",
      "You've been given a target you can't meet"
    ]
  },
  "panel": {
    "eyebrow": "Health • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Her own line matters more than the percentile",
        "Preterm babies are plotted differently early on",
        "Corrected age changes the answer completely",
        "Weight, length and head are read together, not alone"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Asking which chart the NICU nurses and doctors were using",
        "Plotting corrected age, not her birthday",
        "Watching the direction over weeks, not the position",
        "Weighing on the same scales, roughly the same time"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Her weight is flat or falling across more than a few days",
        "She's dropping across the chart rather than following her line",
        "She's feeding much less than usual",
        "You've been given a target you can't meet"
      ]
    },
    "quick": "Percentiles mean little without the right chart and corrected age. Watch her own line over weeks — direction beats position every time."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "nicu-stages",
    "incubator-temperature",
    "nicu-discharge"
  ],
  "seo": {
    "description": "Percentiles are close to meaningless for a baby born early unless you're using the right chart and the right age. Her own trend is the number that matters."
  },
  "longform": [
    {
      "h": "We wanted one reassuring percentile",
      "t": "We kept asking where Ari sat on the chart. A neat percentile felt as though it would tell us whether she was doing well.\n\nWith a premature baby, the answer changes if you use the wrong chart or the wrong age. The same baby can look tiny on one chart and completely expected on another."
    },
    {
      "h": "The right chart and the right age",
      "t": "Babies born early may start on a premature growth chart and later move to a standard chart using corrected age. Your baby’s doctor or nurse can show you which chart they are using and why.\n\nWe stopped trying to replot Ari ourselves after realising how easy it was to frighten ourselves with the wrong comparison—including the apps Papa always likes to use."
    },
    {
      "h": "Her own line mattered most",
      "t": "One weigh-in can move because of different scales, clothing, timing or a full nappy. The trend across several measurements tells a better story.\n\nFor us, the useful question was whether Ari was following her own curve and growing steadily. Feeding more does not automatically mean gaining more, especially for a premature baby, so volumes stayed with her NICU nurses and doctors—not our midnight maths."
    }
  ],
  "order": 43,
  "batch": "3"
},
{
  "id": "newborn-immune-and-going-out",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "When can I take my newborn out?",
  "ages": [
    "0–1 month",
    "2–3 months"
  ],
  "read": 2,
  "summary": "The forty days thing is custom more than medicine. The real answer depends on her, and for a baby born early it depends more.",
  "keywords": [],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "She's under three months with any fever",
      "She's feeding less, unusually sleepy, or breathing differently",
      "You're planning to fly and she was born early or has had lung problems",
      "Anyone she's been near has a significant infection"
    ]
  },
  "panel": {
    "eyebrow": "Health • 0–3 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Newborn immune systems are still developing",
        "The forty days idea is largely custom",
        "Crowds and unwell visitors matter more than fresh air",
        "Babies born early are more vulnerable for longer"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Asking our baby’s doctor rather than settling it by arithmetic",
        "Asking our baby’s doctor what was safe for her",
        "Quiet walks early on rather than crowded places",
        "Being firm with visitors who had 'just a cold'"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "She's under three months with any fever",
        "She's feeding less, unusually sleepy, or breathing differently",
        "You're planning to fly and she was born early or has had lung problems",
        "Anyone she's been near has a significant infection"
      ]
    },
    "quick": "There is no magic waiting date; your baby’s health and the type of outing matter more, especially after a premature birth."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "nicu-stages",
    "incubator-temperature",
    "nicu-discharge"
  ],
  "seo": {
    "description": "The forty days thing is custom more than medicine. The real answer depends on her, and for a baby born early it depends more."
  },
  "longform": [
    {
      "h": "We tried to solve it with a calendar",
      "t": "We kept asking when the waiting period started for a baby born early: from birth, from the due date, or from some mysterious point in between? We were trying to turn a worrying decision into arithmetic.\n\nThere is no universal forty-day medical rule. What matters more is your baby’s health, age, prematurity and the kind of outing you mean."
    },
    {
      "h": "Outside is not the same as a crowd",
      "t": "A quiet walk outdoors is very different from a packed room full of people wanting to touch the baby. For a young or premature baby, we cared more about exposure than about crossing off a particular date.\n\nWe asked anyone unwell to stay away, insisted on clean hands and did not allow kissing Ari’s face or hands. It felt awkward for about thirty seconds. Protecting her mattered longer.We were smack in the middle of flu season, so we went extra cautious. For the first six months, anyone coming close to Ari wore a mask and sanitised their hands. That may sound excessive to somebody else. We were happy with our decision. Do not let people push you into boundaries you are not comfortable with. Your baby, your rules."
    },
    {
      "h": "Travel needed a real conversation",
      "t": "We also tried to calculate when flying would be safe. In the end, the calendar could not answer questions about Ari’s lungs, feeding, weight or NICU history.\n\nIf your baby was born early or has been unwell, ask their doctor before booking travel or planning crowded outings. The answer belongs to your baby, not to a general internet countdown."
    }
  ],
  "order": 44,
  "batch": "3"
},
{
  "id": "father-not-feeling-it",
  "topic": "sanity",
  "icon": "heart",
  "featured": false,
  "title": "Is it normal not to feel an instant bond with my baby?",
  "ages": [
    "0–1 month",
    "2–3 months"
  ],
  "read": 2,
  "summary": "Common, rarely said out loud, and not a verdict on the kind of father you'll be. It usually arrives later and through doing rather than feeling.",
  "keywords": [],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "You feel persistently low, numb or hopeless",
      "You're withdrawing from your partner or the baby",
      "You're drinking more, or not sleeping even when you can",
      "Any thoughts of harming yourself or the baby — seek urgent help now"
    ]
  },
  "panel": {
    "eyebrow": "Parent Sanity • 0–3 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Bonding often builds over weeks or months",
        "Responsibility usually arrives long before the feeling",
        "Very common in fathers, and rarely admitted",
        "A NICU stay makes it harder — less holding, less doing"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Doing the practical things — feeds, changes, carrying",
        "Skin-to-skin whenever the unit allowed it",
        "Saying it out loud to one person",
        "Not waiting to feel it before acting like it"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "You feel persistently low, numb or hopeless",
        "You're withdrawing from your partner or the baby",
        "You're drinking more, or not sleeping even when you can",
        "Any thoughts of harming yourself or the baby — seek urgent help now"
      ]
    },
    "quick": "An instant rush of love is not the only way bonding begins; it can grow through ordinary care, time and getting to know your baby."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "touched-out",
    "splitting-nights",
    "visitors"
  ],
  "seo": {
    "description": "Common, rarely said out loud, and not a verdict on the kind of father you'll be. It usually arrives later and through doing rather than feeling."
  },
  "longform": [
    {
      "h": "Papa felt responsibility before love",
      "t": "Papa eventually said the quiet part out loud: he felt responsible for Ari and would do anything she needed, but he had not yet felt the huge rush of love everyone talks about. That came later.\n\nSaying it felt uncomfortable. It also made the feeling much less frightening. An instant bond is not the only way a bond begins."
    },
    {
      "h": "NICU made bonding harder",
      "t": "When your baby is behind plastic and somebody else controls when you can hold or feed her, ordinary bonding is interrupted. You can love the idea of your baby and still feel strangely separate from the actual tiny person in front of you.\n\nSkin-to-skin helped when the NICU allowed it. So did asking to take part in the small jobs instead of waiting silently beside the incubator."
    },
    {
      "h": "The feeling grew through doing",
      "t": "For Papa, feeding Ari, carrying her, learning her preferences and getting up at night created familiarity. The bond and the love grew inside those ordinary jobs. There was no single film-scene moment.\n\nIf the distance comes with ongoing low mood, numbness, hopelessness, anger, withdrawing or thoughts of harm, tell a doctor. Fathers can experience postnatal depression too, and asking for help does not make the bond less real."
    }
  ],
  "order": 45,
  "batch": "3"
},
{
  "id": "newborn-poo-colours",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "What colour should my baby’s poo be?",
  "ages": [
    "0–1 month",
    "2–3 months"
  ],
  "read": 2,
  "summary": "From mustard yellow to alarming green, baby poo has a much wider colour chart than anyone warns you about.",
  "keywords": [
    "newborn poo colour",
    "green baby poo",
    "yellow seedy poo",
    "abnormal baby poo"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "White or chalky-pale poo",
      "Red streaks or blood",
      "Black poo after the first newborn days",
      "Watery poo with fewer wet nappies",
      "Fever, vomiting or a firm swollen tummy"
    ]
  },
  "panel": {
    "eyebrow": "Health • 0–3 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Mustard yellow, seedy and loose on breast milk",
        "Yellow, orange, brown or green; some formula can make it dark green",
        "Darker and firmer with formula or mixed feeding",
        "One big poo plus smaller stains"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Photographing anything that looked unusual",
        "Checking wet nappies as well as dirty ones",
        "Remembering that mixed feeding changes the colour",
        "Watching her pattern rather than one nappy"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "White or chalky-pale poo",
        "Red streaks or blood",
        "Black poo after the first newborn days",
        "Watery poo with fewer wet nappies",
        "Fever, vomiting or a firm swollen tummy"
      ]
    },
    "quick": "Mustard yellow and seedy is the classic, but yellow, orange, brown and green can all be normal. White, red or black needs checking."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "first-fever",
    "nappy-rash",
    "newborn-hiccups"
  ],
  "seo": {
    "description": "A simple guide to normal newborn poo colours, what changes with feeding, and the three colours worth calling about."
  },
  "longform": [
    {
      "h": "Nobody warns you how much you will discuss poo",
      "t": "Before Ari, we did not imagine photographing nappies and debating shades of yellow. Then she arrived and suddenly one green nappy felt like breaking news.\n\nBreastfed poo is often mustard yellow, loose and seedy. Formula or mixed feeding usually makes it darker and firmer. Ari had both breast milk and Alfaré, so her nappies did not always match the classic breastfed picture."
    },
    {
      "h": "The pattern matters more than one nappy",
      "t": "Ari often did one proper poo and then left smaller yellow stains through the day. We wondered whether those counted. What mattered more was that the poo stayed soft, she fed well and wet nappies continued.\n\nGreen can look alarming and still be ordinary. A change in milk, digestion or the type of formula can change the colour without anything being wrong. Some formulas can make poo dark green."
    },
    {
      "h": "The three colours worth remembering",
      "t": "White or chalky-pale poo, visible blood or red, and black poo after the first newborn days are the ones to show your baby’s doctor or nurse.\n\nOur most practical discovery was also the easiest: take a photo. Trying to describe ‘mustard, but slightly greener than yesterday’ over the phone helps nobody."
    }
  ],
  "order": 46,
  "batch": "4"
},
{
  "id": "baby-not-pooping",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "How long can a baby go without pooing?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 2,
  "summary": "A long gap can feel dramatic, but soft poo and plenty of wet nappies usually tell the calmer story.",
  "keywords": [
    "baby not pooping",
    "newborn constipation",
    "breastfed baby no poo",
    "hard baby poo"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Hard, dry or pellet-like poo",
      "Blood in the nappy",
      "A firm swollen tummy or vomiting",
      "A young newborn suddenly pooing much less",
      "Poor feeding or seeming genuinely unwell"
    ]
  },
  "panel": {
    "eyebrow": "Health • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Longer gaps as babies grow",
        "Breastfed babies sometimes going days",
        "Grunting and going red before a soft poo",
        "Soft poo when it finally arrives"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Checking wet nappies instead of only the clock",
        "Gentle bicycle legs",
        "A warm bath when she seemed uncomfortable",
        "Waiting before trying to fix it",
        "A Windi device used carefully and only occasionally"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Hard, dry or pellet-like poo",
        "Blood in the nappy",
        "A firm swollen tummy or vomiting",
        "A young newborn suddenly pooing much less",
        "Poor feeding or seeming genuinely unwell"
      ]
    },
    "quick": "A gap alone is not constipation. If the poo is soft when it arrives, wet nappies continue and your baby seems well, waiting is often enough."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "nappy-rash",
    "blocked-nose-newborn",
    "milk-from-the-nose"
  ],
  "seo": {
    "description": "Babies can have surprisingly long gaps between poos; softness, feeding and wet nappies matter more than the clock alone."
  },
  "longform": [
    {
      "h": "The countdown started at three in the morning",
      "t": "Ari had last pooed in the early morning. By the afternoon we were behaving as though a deadline had been missed.\n\nThat is what happens when you are new, tired and recording everything. A normal gap becomes a countdown simply because you know the exact time it started."
    },
    {
      "h": "Straining does not always mean constipation",
      "t": "Babies grunt, go red, pull their knees up and look as though they are attempting something heroic. They are still learning how to push while relaxing the right muscles.\n\nThe better clue is what comes out. Soft poo after a dramatic performance is usually not constipation. Hard, dry or pellet-like poo is different."
    },
    {
      "h": "What we did while waiting",
      "t": "Gentle bicycle legs, a warm bath and tummy time while Ari was awake sometimes helped her feel more comfortable. Mostly, we waited and watched the wet nappies. We also used a Frida Baby Windi occasionally when she seemed full of trapped gas. It sometimes helped her pass wind and poo.We also added chamomile granules to her milk once a day when a day or two had passed without a poo. It seemed to work wonders for Ari. Knowing what we know now, we would not tell another parent to copy that without asking their baby’s doctor or pharmacist first.\n\nWe did not give water, juice, tea or anything rectally unless a doctor had specifically advised it. If a very young baby’s pattern changes sharply, or the gap comes with poor feeding, vomiting or a swollen tummy, ask your baby’s doctor or nurse."
    }
  ],
  "order": 47,
  "batch": "4"
},
{
  "id": "colic-and-witching-hour",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "Why does my baby cry every evening?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 2,
  "summary": "The evening crying can feel endless, even when it arrives like clockwork and eventually passes.",
  "keywords": [
    "baby crying every evening",
    "witching hour baby",
    "newborn evening crying",
    "colic crying"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "lead": "A floppy baby you cannot wake — call your local emergency number now.",
    "items": [
      "A weak, high-pitched or unusual cry",
      "Fever, vomiting or blood in the nappy",
      "Refusing feeds or being unusually floppy",
      "Crying that is constant rather than patterned",
      "You feel close to losing control"
    ]
  },
  "panel": {
    "eyebrow": "Health • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Crying clustering in late afternoon or evening",
        "Starting in the early weeks",
        "Often peaking around six weeks",
        "Gradually easing over the following months"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Planning for the difficult part of the day",
        "Walking, carrying, the pram or a drive",
        "White noise and a darker room",
        "Swapping before either parent reached the end"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "lead": "A floppy baby you cannot wake — call your local emergency number now.",
      "items": [
        "A weak, high-pitched or unusual cry",
        "Fever, vomiting or blood in the nappy",
        "Refusing feeds or being unusually floppy",
        "Crying that is constant rather than patterned",
        "You feel close to losing control"
      ]
    },
    "quick": "Predictable evening crying can be common and still be awful. Movement and less stimulation may help; if you are at your limit, put baby down safely and step away."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "blocked-nose-newborn",
    "milk-from-the-nose",
    "corrected-age"
  ],
  "seo": {
    "description": "Predictable evening crying is common and exhausting; movement, less stimulation and swapping parents can make it more manageable."
  },
  "longform": [
    {
      "h": "There must be something else we can do",
      "t": "That was not really a question. It was two exhausted parents saying: surely the answer cannot be that we simply listen to our baby cry every evening.\n\nThere was no magic fix. There were things that softened it, and there was the fact that it eventually ended. Neither felt very comforting while it was happening."
    },
    {
      "h": "Once we saw the pattern, it felt less random",
      "t": "The crying arrived at roughly the same part of the day. Movement helped more than stillness: walking, carrying, the pram and sometimes a drive. White noise and a darker room also took some of the edge off.\n\nWe stopped cycling through five new remedies in ten minutes. An overstimulated baby did not need two panicked parents adding more stimulation."
    },
    {
      "h": "Hand over before you are finished",
      "t": "The most useful thing we learned was to swap before either of us reached breaking point. That decision belongs in the afternoon, not after an hour of crying.\n\nIf you feel yourself losing control, put your baby safely on their back in the cot, leave the room for a few minutes and call someone. A crying baby in a safe cot is safer than a baby being held by somebody who has nothing left."
    }
  ],
  "order": 48,
  "batch": "4"
},
{
  "id": "wind-and-gas",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "Why does my baby have so much wind?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 2,
  "summary": "Babies are tiny wind machines; slowing feeds and gentle movement can make the noisy aftermath easier.",
  "keywords": [
    "baby wind and gas",
    "newborn trapped wind",
    "winding baby bottle",
    "baby gas pain"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "A firm, swollen or shiny tummy",
      "Green or bloody vomit",
      "Poor feeding or weight concerns",
      "Blood or mucus in the nappy",
      "A new pattern of inconsolable crying"
    ]
  },
  "panel": {
    "eyebrow": "Health • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Air swallowed during feeding or crying",
        "Grunting and pulling knees up",
        "Worse discomfort in the evening",
        "A gut still learning to move things along"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Stopping partway through feeds",
        "Gentle bicycle legs and knees towards the tummy",
        "Tummy time while awake and watched",
        "A slower, paced bottle feed",
        "A Windi device used carefully and only occasionally"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "A firm, swollen or shiny tummy",
        "Green or bloody vomit",
        "Poor feeding or weight concerns",
        "Blood or mucus in the nappy",
        "A new pattern of inconsolable crying"
      ]
    },
    "quick": "Wind is usually swallowed air plus a gut still learning its job. Stopping partway through and slowing the feed helped us; a firm swollen tummy is different."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "milk-from-the-nose",
    "corrected-age",
    "preemie-growth-charts"
  ],
  "seo": {
    "description": "Swallowed air and an immature gut make wind common; pacing, winding and gentle movement helped us more than rushing feeds."
  },
  "longform": [
    {
      "h": "Ours was not only during the feed",
      "t": "We asked how to get rid of Ari’s gas and were given feeding advice. The important detail was that she was uncomfortable between feeds too.\n\nSome wind comes from feeding, some from crying, and some from a digestive system that is still very new at its job. None of that means you have done something wrong."
    },
    {
      "h": "Slow worked better than fast",
      "t": "Stopping halfway through the bottle helped more than waiting until the end. So did a slower teat, keeping the bottle roughly horizontal and building in pauses so Ari could set the rhythm.\n\nGentle bicycle legs, knees towards the tummy and watched tummy time also helped. Nothing needed to be vigorous. She was a baby, not a stubborn jar lid. We also used a Frida Baby Windi occasionally, and it sometimes helped her release trapped wind."
    },
    {
      "h": "When it is not ordinary wind",
      "t": "A soft round tummy can be normal. A firm, tight, swollen or shiny tummy—especially with green vomit, blood, unusual sleepiness or poor feeding—needs medical advice.\n\nWe had an evening when Ari’s tummy was firm and bloated and she was extra sleepy. We went to the hospital. Those signs together were not something we wanted to explain away as gas."
    }
  ],
  "order": 49,
  "batch": "4"
},
{
  "id": "colic-drops",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "Do colic drops actually help?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 2,
  "summary": "Drops may help a little, a lot or not at all—which is annoyingly less definite than tired parents would like.",
  "keywords": [
    "colic drops baby",
    "Infacol baby",
    "BioGaia baby",
    "baby gas drops"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Your baby was born early",
      "A rash, reaction or increased vomiting",
      "Medication is already prescribed",
      "Your baby remains in real distress",
      "You are unsure about dose or timing"
    ]
  },
  "panel": {
    "eyebrow": "Health • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Some babies improving and others not",
        "Simeticone products used around feeds",
        "Probiotic drops usually given daily",
        "Modest results rather than a miracle"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Following the pack rather than guessing the timing",
        "Trying one product at a time",
        "Infacol seeming to help",
        "Gocce Gas Bimbi making the clearest difference",
        "Asking a pharmacist before starting"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Your baby was born early",
        "A rash, reaction or increased vomiting",
        "Medication is already prescribed",
        "Your baby remains in real distress",
        "You are unsure about dose or timing"
      ]
    },
    "quick": "Colic drops help some babies and do very little for others. Try one thing at a time, follow the product instructions and keep tea or water out of a young baby’s milk."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "corrected-age",
    "preemie-growth-charts",
    "baby-not-pooping"
  ],
  "seo": {
    "description": "Infacol and probiotic drops help some babies modestly; try one thing at a time and avoid homemade additions to a young baby’s milk."
  },
  "longform": [
    {
      "h": "We wanted a plain answer about timing",
      "t": "Our question about Infacol became increasingly specific: an hour before, immediately before, or after? We did not need a lecture. We needed to know when to give the drops.\n\nThe answer depends on the product, so follow the label and ask a pharmacist if it is unclear. Giving something consistently tells you far more than giving it randomly whenever the evening goes badly.\n\nWe tried Infacol, BioGaia and Gocce Gas Bimbi at different points. Infacol seemed to help. With BioGaia, honestly, we never knew whether it changed anything or simply made us feel that we were doing something. Gocce Gas Bimbi made the clearest difference for Ari."
    },
    {
      "h": "The evidence is not dramatic",
      "t": "Simeticone and probiotic drops work in different ways, and some parents feel they help. Others see no change at all. We tried to remember that colic drops are a possible small help, not a switch that turns crying off.\n\nStarting Infacol, BioGaia and a formula change together leaves you with no idea what helped. We know because that is approximately how our first attempt at problem-solving looked."
    },
    {
      "h": "We also tried chamomile granules",
      "t": "We first asked whether Mama drinking chamomile tea might help. We then went further and added chamomile granules directly to Ari’s formula once a day. It seemed to help her poo and pass gas, which made the colic easier.\n\nThat is honestly what we did, but it is not something we would now tell another parent to copy. Young babies should not have herbal additions unless their baby’s doctor or pharmacist specifically advises it."
    }
  ],
  "order": 50,
  "batch": "4"
},
{
  "id": "newborn-skin-bumps",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "What are the little bumps on my newborn’s face?",
  "ages": [
    "0–1 month",
    "2–3 months"
  ],
  "read": 2,
  "summary": "Those little newborn bumps often look far worse to us than they feel to the baby.",
  "keywords": [
    "newborn face bumps",
    "baby milia",
    "newborn acne",
    "baby facial rash"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "A rash that does not fade under a glass",
      "Blisters, weeping or crusting",
      "Fever or seeming unwell",
      "Cold-sore-like spots near eyes or mouth",
      "A rash spreading quickly"
    ]
  },
  "panel": {
    "eyebrow": "Health • 0–3 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Tiny white spots on nose or cheeks",
        "Red pimply patches on cheeks and forehead",
        "Looking worse with heat, crying or drool",
        "Settling without treatment"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Doing less rather than adding products",
        "Plain water and patting dry",
        "Keeping her comfortably cool",
        "Taking photos to track change"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "A rash that does not fade under a glass",
        "Blisters, weeping or crusting",
        "Fever or seeming unwell",
        "Cold-sore-like spots near eyes or mouth",
        "A rash spreading quickly"
      ]
    },
    "quick": "Milia and newborn acne are common and usually clear by themselves. A non-fading rash, blisters or any rash with fever is different."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "fast-breathing-newborn",
    "newborn-trembles-and-jerks",
    "corrected-age"
  ],
  "seo": {
    "description": "Milia and newborn acne are common and usually clear alone; fever, blisters or a non-fading rash need medical advice."
  },
  "longform": [
    {
      "h": "Newborn skin does a lot of strange things",
      "t": "Ari developed little bumps across her face and up towards her forehead. They looked far more dramatic to us than they seemed to bother her.\n\nTiny white milia and red newborn-acne patches are common in the early weeks. Heat, crying and drool can make them look angrier for a while."
    },
    {
      "h": "Doing nothing was surprisingly difficult",
      "t": "The urge to put a cream, oil or special baby product on every mark is strong. For ordinary newborn bumps, plain water and gentle patting dry were enough for us.\n\nWe once got soap on Ari’s face while washing her and then felt guilty about the redness. We rinsed it with water, it settled, and everybody survived the scandal."
    },
    {
      "h": "The rashes that need a different response",
      "t": "A rash that does not fade when pressed with a clear glass needs urgent medical advice. So does a rash with fever, fast spreading, blisters, weeping or crusting.\n\nCold-sore-like spots around a young baby’s eyes or mouth also deserve same-day advice. Photographing a changing rash can help your baby’s doctor or nurse see what you are seeing."
    }
  ],
  "order": 51,
  "batch": "4"
},
{
  "id": "is-my-baby-in-pain",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "How can I tell if my newborn is actually in pain?",
  "ages": [
    "0–1 month",
    "2–3 months"
  ],
  "read": 2,
  "summary": "Newborns make alarming noises in their sleep; the trick is learning which ones actually need you.",
  "keywords": [
    "newborn pain signs",
    "noisy newborn sleep",
    "baby grunting sleep",
    "unusual baby cry"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "lead": "Blue or grey, a struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now.",
    "items": [
      "A weak, high-pitched or unusual cry",
      "Pale, blue or grey colour",
      "Choking or struggling to breathe",
      "Crying that cannot be settled",
      "Floppy, hard to wake or refusing feeds"
    ]
  },
  "panel": {
    "eyebrow": "Health • 0–3 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Groaning and fidgeting in active sleep",
        "Grunting while passing wind or poo",
        "Throat-clearing sounds",
        "Faces that look distressed for a moment"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Pausing before picking her up",
        "Watching colour and breathing",
        "Learning her normal noises",
        "Waiting to see whether she settled again"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "lead": "Blue or grey, a struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now.",
      "items": [
        "A weak, high-pitched or unusual cry",
        "Pale, blue or grey colour",
        "Choking or struggling to breathe",
        "Crying that cannot be settled",
        "Floppy, hard to wake or refusing feeds"
      ]
    },
    "quick": "Groaning, fidgeting and throat clearing can all happen in normal newborn sleep. Watch colour, breathing and whether the sound is truly different."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "newborn-trembles-and-jerks",
    "corrected-age",
    "preemie-growth-charts"
  ],
  "seo": {
    "description": "Newborns groan, fidget and clear their throats in normal sleep; colour, breathing and a genuinely different cry tell you more than noise alone."
  },
  "longform": [
    {
      "h": "Mama was right",
      "t": "Papa kept picking Ari up whenever she groaned or cleared her throat. Mama said to wait. Mama was right.\n\nThe slightly painful realisation came afterwards: many times Ari had been asleep, made one of her normal noises, and Papa had helpfully woken her up. Then Ari was tired but wide awake, while Papa slowly lost his mind trying to settle her again."
    },
    {
      "h": "Newborn sleep is unbelievably noisy",
      "t": "Babies grunt, sigh, fidget, pull faces and clear normal secretions while still asleep. The sound alone does not tell you they are in pain.\n\nWe learned to watch her colour, breathing and what happened next. If she settled again without help, the noise had usually been part of sleep rather than a request for rescue."
    },
    {
      "h": "Waiting is not ignoring",
      "t": "Our fear underneath all of this was choking, especially after NICU alarms had trained us to react. We settled on pausing briefly before reaching in while still watching her properly.\n\nA cry that is weak, unusually high-pitched or genuinely different, colour changes, breathing difficulty, being hard to wake or refusing feeds are not ‘wait and see’ noises. Those need help."
    }
  ],
  "order": 52,
  "batch": "4"
},
{
  "id": "sterilising-baby-bottles",
  "topic": "feeding",
  "icon": "bottle",
  "featured": false,
  "title": "How long should I sterilise baby bottles?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months",
    "7–9 months",
    "10–12 months"
  ],
  "read": 2,
  "summary": "Clean bottles matter, but you do not need to sterilise the baby, the sofa and half the house.",
  "keywords": [
    "sterilising baby bottles",
    "how long sterilise bottles",
    "sterilising pump parts",
    "formula bottle hygiene"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Your baby was born premature",
      "Your baby has reduced immunity",
      "Your water supply may not be safe",
      "Your formula machine may not reach 70°C",
      "Your unit gave different instructions"
    ]
  },
  "panel": {
    "eyebrow": "Feeding • 0–12 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Bottles and teats sterilised after washing",
        "Pump parts handled as instructed",
        "UK guidance continuing to twelve months",
        "Ordinary toys not needing sterilising"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Rinsing bottles before milk dried",
        "A brush used only for feeding equipment",
        "Sterilising in batches",
        "Following the NICU instructions first"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Your baby was born premature",
        "Your baby has reduced immunity",
        "Your water supply may not be safe",
        "Your formula machine may not reach 70°C",
        "Your unit gave different instructions"
      ]
    },
    "quick": "Wash feeding equipment first, then sterilise it. UK guidance continues to twelve months, while a premature baby may be given stricter rules."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "feeding-on-demand",
    "timing-feeds-start-or-finish",
    "pumping-schedule"
  ],
  "seo": {
    "description": "Wash feeding equipment thoroughly and sterilise it for the first year under UK guidance; premature babies may need stricter instructions."
  },
  "longform": [
    {
      "h": "We were trying to sterilise the entire world",
      "t": "At first, ‘keep things clean’ somehow became ‘everything near the baby must be sterilised’. That is an exhausting standard and not what the guidance means.\n\nThe focus is feeding equipment: bottles, teats and the pump parts that need sterilising. Toys, muslins and the whole house are a different question."
    },
    {
      "h": "Washing comes before sterilising",
      "t": "Steam does not magically remove dried milk. Rinsing straight after a feed, washing properly with a bottle brush, then sterilising saved far more effort than attacking yesterday’s bottle the next morning.\n\nUK guidance says to sterilise bottles and teats until at least twelve months. We stopped at six months and washed them thoroughly instead, because Ari was moving around and putting everything in her mouth anyway. That was our choice, not the UK recommendation."
    },
    {
      "h": "Formula preparation is a separate safety job",
      "t": "Powdered formula is not sterile. Current guidance uses fresh water that is still at least 70°C when mixed with standard formula, then cools the made bottle before feeding.\n\nAri was premature, so when NICU instructions were stricter than general advice, their rules won. If your baby was born early or has an immune concern, ask rather than assuming the standard version applies."
    }
  ],
  "order": 53,
  "batch": "4"
},
{
  "id": "is-baby-too-hot",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "Is my baby too hot, and is air conditioning safe?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 2,
  "summary": "Cool hands can be misleading; your baby’s chest and neck tell you much more about temperature.",
  "keywords": [
    "baby too hot",
    "air conditioning baby room",
    "baby room temperature",
    "check baby temperature"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "lead": "A floppy baby you cannot wake — call your local emergency number now.",
    "items": [
      "A fever, especially under three months",
      "Floppy, unusually sleepy or hard to wake",
      "Poor feeding or fewer wet nappies",
      "Fast breathing with flushed skin",
      "Unwell after being somewhere very hot"
    ]
  },
  "panel": {
    "eyebrow": "Health • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Cool hands and feet",
        "Checking chest or back of neck",
        "A cooler room being safer than overheating",
        "Using air conditioning without direct airflow"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "A room thermometer",
        "Checking her chest rather than guessing",
        "Air conditioning not aimed at the cot",
        "Matching layers to the actual room"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "lead": "A floppy baby you cannot wake — call your local emergency number now.",
      "items": [
        "A fever, especially under three months",
        "Floppy, unusually sleepy or hard to wake",
        "Poor feeding or fewer wet nappies",
        "Fast breathing with flushed skin",
        "Unwell after being somewhere very hot"
      ]
    },
    "quick": "Check the chest or back of the neck, not cool hands and feet. Air conditioning is fine when it keeps the room comfortable and does not blow directly on baby."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "wind-and-gas",
    "colic-drops",
    "flat-head"
  ],
  "seo": {
    "description": "Check your baby’s chest or neck rather than cool hands; air conditioning is useful when the room stays comfortable and airflow is not direct."
  },
  "longform": [
    {
      "h": "We worried about cold hands and the air conditioner",
      "t": "Ari’s hands felt cool, the air conditioning was on, and we immediately wondered whether we were freezing the baby. Her chest was comfortable. The hands had simply lied to us again.\n\nHands and feet often feel cooler than the rest of a baby. The chest, tummy or back of the neck gives you a better idea of how warm they really are."
    },
    {
      "h": "A room thermometer ended the debate",
      "t": "A comfortably cool room is safer for sleep than an overheated one. UK safe-sleep guidance uses roughly 16–20°C, with lighter sleeping bags for warmer rooms. Ari actually settled best around 22–24°C. Sixteen to twenty felt far too cold to us, so we matched her sleepwear to the room and checked her chest and neck.\n\nAri was home from NICU during a Greek summer. Air conditioning made the room safer and more comfortable. We kept the airflow away from the cot instead of treating the machine itself as dangerous."
    },
    {
      "h": "Signs baby may be too warm",
      "t": "Sweating, hot skin on the chest or back, damp hair, flushing and faster breathing can mean too much heat or too many layers. Remove a layer and check again.\n\nA measured fever is different from simply feeling warm. If a young baby has a fever, seems unusually sleepy, feeds poorly or has breathing changes, ask your baby’s doctor or nurse."
    }
  ],
  "order": 54,
  "batch": "4"
},
{
  "id": "head-control",
  "topic": "development",
  "icon": "blocks",
  "featured": false,
  "title": "When will my baby hold their head up?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 2,
  "summary": "Head control arrives bit by bit, with plenty of wobbling before it starts to look convincing.",
  "keywords": [
    "baby head control",
    "tummy time head lifting",
    "premature baby corrected age",
    "when babies hold head up"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Always turning to one side",
      "Control going backwards",
      "Very floppy or unusually stiff",
      "No progress with lifting the head",
      "Any skill that has been lost"
    ]
  },
  "panel": {
    "eyebrow": "Development • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Very brief lifts in early tummy time",
        "Steadier control over the first months",
        "Corrected age after premature birth",
        "Some wobble while strength is building"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Short, frequent tummy time",
        "Tummy time on our chest",
        "Supporting her head for every lift",
        "Using corrected age for milestones, without delaying tummy time"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Always turning to one side",
        "Control going backwards",
        "Very floppy or unusually stiff",
        "No progress with lifting the head",
        "Any skill that has been lost"
      ]
    },
    "quick": "Head control builds over months, not overnight. Corrected age matters for milestones after an early birth, but tummy time still starts gently from the beginning."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "is-that-a-real-smile",
    "rolling-sitting-crawling",
    "first-words"
  ],
  "seo": {
    "description": "Head control builds gradually through short tummy-time practice; use corrected age after premature birth and keep supporting the head until control is reliable."
  },
  "longform": [
    {
      "h": "We worried about every wobble",
      "t": "The question underneath ‘when can she hold her head?’ was really: what happens if we support it badly once? Newborn neck muscles are weak, so the head needs support—but one small wobble is not automatically a catastrophe.\n\nA hand behind the head and neck on every lift and transfer quickly became automatic for us."
    },
    {
      "h": "It arrives little by little",
      "t": "Early tummy time may mean one tiny lift and immediate outrage. Over the next months, the head becomes steadier upright and stronger on the tummy.\n\nAri was born at 33 weeks, so we used corrected age. Comparing her with a baby who had several extra weeks to practise would have created worry for no useful reason."
    },
    {
      "h": "Tummy time without the heroics",
      "t": "Short and frequent worked better than one long miserable session. On our chest counted. Across a lap counted. Ten calm seconds counted.\n\nIf your baby always looks one way, seems unusually floppy or stiff, loses a skill, or head control is not progressing, mention it to your baby’s doctor or nurse. Neck tightness is much easier to help early."
    }
  ],
  "order": 55,
  "batch": "4"
},
{
  "id": "flat-head",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "Will sleeping with the head to one side cause a flat head?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 2,
  "summary": "A favourite sleeping side can flatten one spot, but safe sleep stays exactly the same.",
  "keywords": [
    "baby flat head",
    "baby sleeps head one side",
    "plagiocephaly baby",
    "prevent flat head baby"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Always turning one way and resisting the other",
      "A tight or painful-looking neck",
      "Flattening becoming more obvious",
      "Uneven ears or face",
      "You want an early assessment"
    ]
  },
  "panel": {
    "eyebrow": "Health • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "A preferred side in early months",
        "Mild flattening from repeated pressure",
        "Improvement as movement increases",
        "Back sleeping remaining safest"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Changing which end of the cot she faced",
        "Alternating carrying and feeding sides",
        "More watched tummy time",
        "Moving the interesting view"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Always turning one way and resisting the other",
        "A tight or painful-looking neck",
        "Flattening becoming more obvious",
        "Uneven ears or face",
        "You want an early assessment"
      ]
    },
    "quick": "Flat spots are common and often improve. Vary pressure while baby is awake, but safe sleep stays unchanged: on the back, flat and with nothing added to the cot."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "is-baby-too-hot",
    "baby-vaccine-side-effects",
    "overfed-big-tummy"
  ],
  "seo": {
    "description": "Flat spots are common and often improve as babies move more; vary awake positioning but never change safe back sleeping to fix head shape."
  },
  "longform": [
    {
      "h": "We were already doing the useful part",
      "t": "Ari kept turning her head towards the same side in her sleep, and we worried about her head shape. We were already changing which direction she faced. That was useful—as long as she still started every sleep on her back.\n\nA baby’s skull is soft because it is growing quickly. Repeated pressure on one area can create a flat spot without anybody having done something wrong."
    },
    {
      "h": "Change the view, not the sleep position",
      "t": "We changed which end of the cot Ari’s head went at, alternated carrying and feeding sides, and moved the interesting thing she wanted to look at.\n\nTummy time while awake and watched also removed pressure from the back of her head. As babies roll, sit and turn more, many mild flat spots improve."
    },
    {
      "h": "Safe sleep does not change for head shape",
      "t": "We did not use a head-shaping pillow, wedge or positioner. Nothing went into the cot to hold Ari in place.\n\nIf your baby always turns one way, resists the other side, has neck tightness or the flattening is worsening, ask early. Physiotherapy can help when neck tightness is part of the problem."
    }
  ],
  "order": 56,
  "batch": "4"
},
{
  "id": "swaddling",
  "topic": "sleeping",
  "icon": "moon",
  "featured": false,
  "title": "Should I swaddle my baby or let them kick?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 2,
  "summary": "Swaddling can calm the startle reflex while awake kicking gives those little legs room to work.",
  "keywords": [
    "swaddling baby",
    "baby kicking legs",
    "when to stop swaddling",
    "Love to Dream swaddle"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Any sign of rolling",
      "Legs held straight and pressed together",
      "Overheating",
      "Restricted-looking breathing",
      "Known hip concerns"
    ]
  },
  "panel": {
    "eyebrow": "Sleeping • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Swaddling helping the startle reflex",
        "Plenty of free kicking while awake",
        "Loose hips and legs inside a swaddle",
        "Moving to an arms-free sleeping bag"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Snug around the arms, roomy around the hips",
        "Unswaddled floor time while awake",
        "Watching for early rolling signs",
        "Changing to a sleeping bag",
        "A Love to Dream swaddle, which gave her more freedom"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Any sign of rolling",
        "Legs held straight and pressed together",
        "Overheating",
        "Restricted-looking breathing",
        "Known hip concerns"
      ]
    },
    "quick": "Swaddling may help sleep and free kicking builds strength. Keep hips loose, avoid overheating and stop swaddling at the first signs of rolling."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "wont-nap",
    "sleep-regression",
    "day-night-confusion"
  ],
  "seo": {
    "description": "Swaddling may settle a newborn while free awake movement builds strength; keep hips loose and stop at the first signs of rolling."
  },
  "longform": [
    {
      "h": "They are for different parts of the day",
      "t": "We asked whether swaddling was better than letting Ari kick. The answer was both: free movement while awake, and swaddling only as a settling tool for a young baby who startled herself awake. The Love to Dream swaddle worked brilliantly for Ari because she felt less pinned down. That is not sponsorship; it is simply the one that suited her.\n\nKicking on the floor builds strength. A swaddle is not exercise equipment; it is temporary sleep equipment."
    },
    {
      "h": "Can a swaddled baby still poo?",
      "t": "Yes, we genuinely asked this. We worried that if Ari could not fold herself in half, perhaps nothing would come out.\n\nA hip-healthy swaddle leaves the legs able to bend up and out, so there is room to strain, pass wind and poo. Snug arms do not mean straight, pinned legs."
    },
    {
      "h": "It stops before rolling",
      "t": "Swaddling stops at the first signs of trying to roll, not after rolling becomes reliable. A baby who rolls while their arms are trapped cannot use them to reposition.\n\nWe moved to an arms-free sleeping bag. No loose fabric near the face, no extra blanket piled on top, and no swaddle if breathing or chest movement looks restricted."
    }
  ],
  "order": 57,
  "batch": "4"
},
{
  "id": "baby-vaccine-side-effects",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "How long do vaccine side effects last in babies?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months",
    "7–9 months",
    "10–12 months",
    "12–18 months",
    "18–24 months"
  ],
  "read": 2,
  "summary": "A grumpy day after vaccines is common; symptoms that persist or feel wrong deserve a separate look.",
  "keywords": [
    "baby vaccine side effects",
    "vaccine fever baby",
    "rotavirus side effects",
    "baby sleepy after vaccines"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "lead": "A floppy baby you cannot wake — call your local emergency number now.",
    "items": [
      "Vomiting repeatedly or unable to keep feeds down",
      "Fewer wet nappies",
      "A non-fading rash",
      "Very hard to wake or unusually unresponsive",
      "A swollen painful tummy or blood in poo after rotavirus vaccine"
    ]
  },
  "panel": {
    "eyebrow": "Health • 0–24 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Irritability or extra sleepiness",
        "A mild temperature",
        "Reduced appetite for a short time",
        "A small sore lump at the injection site",
        "Mild loose nappies after oral rotavirus vaccine"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Expecting a difficult evening",
        "Offering smaller feeds more often",
        "Keeping the next day quiet",
        "Asking about suitable pain relief beforehand"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "lead": "A floppy baby you cannot wake — call your local emergency number now.",
      "items": [
        "Vomiting repeatedly or unable to keep feeds down",
        "Fewer wet nappies",
        "A non-fading rash",
        "Very hard to wake or unusually unresponsive",
        "A swollen painful tummy or blood in poo after rotavirus vaccine"
      ]
    },
    "quick": "A grumpy day or two, sleepiness and a sore injection site can be expected. Repeated vomiting, dehydration or a baby who is difficult to wake needs advice."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "flat-head",
    "overfed-big-tummy",
    "newborn-hiccups"
  ],
  "seo": {
    "description": "A day or two of irritability, sleepiness or reduced appetite can be expected; persistent vomiting, dehydration or unusual sleepiness needs advice."
  },
  "longform": [
    {
      "h": "We kept blaming the vaccines",
      "t": "After Ari’s vaccines, she was unsettled and later started bringing milk back after feeds. We wanted a neat answer for when the side effects would stop.\n\nMost common reactions are mild and short: irritability, sleepiness, less appetite, a temperature or soreness where the injection went in."
    },
    {
      "h": "There is a point where it needs its own explanation",
      "t": "Vomiting after every feed for days should not be dismissed simply because a vaccine happened recently. If your baby cannot keep feeds down, has fewer wet nappies, seems very sleepy or is not recovering, ask your baby’s doctor or nurse.\n\nAfter the oral rotavirus vaccine, mild loose nappies can happen. Repeated vomiting, a swollen painful tummy, severe episodes of crying or blood in the poo needs urgent advice."
    },
    {
      "h": "Make the next day easier",
      "t": "We learned to keep the following day quiet when possible and offer smaller feeds more often if Ari’s appetite was off.\n\nAsk about pain relief, the correct product and the dose for your baby’s age and weight before the evening gets difficult. Premature babies are usually vaccinated by actual age, but confirm the schedule with your baby’s doctor or nurse."
    }
  ],
  "order": 58,
  "batch": "4"
},
{
  "id": "overfed-big-tummy",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "Is my baby’s big round tummy normal?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 2,
  "summary": "Baby tummies are gloriously round; soft and settled is very different from firm, swollen and painful.",
  "keywords": [
    "baby big tummy",
    "newborn swollen stomach",
    "overfed baby tummy",
    "firm baby belly"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Firm, tight or shiny tummy",
      "Green, bloody or forceful vomit",
      "Obvious pain or inconsolable crying",
      "Not passing wind or poo",
      "Premature baby with new swelling"
    ]
  },
  "panel": {
    "eyebrow": "Health • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "A round middle",
        "A fuller tummy after feeding",
        "Softness when touched gently",
        "Some spit-up after a larger feed"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Feeling gently rather than judging by sight",
        "Watching whether she settled",
        "Slowing the bottle and pausing",
        "Stopping when she turned away"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Firm, tight or shiny tummy",
        "Green, bloody or forceful vomit",
        "Obvious pain or inconsolable crying",
        "Not passing wind or poo",
        "Premature baby with new swelling"
      ]
    },
    "quick": "Round and soft after a feed is ordinary baby shape. Firm, tight or shiny—especially with vomiting, pain or unusual sleepiness—needs checking."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "newborn-hiccups",
    "fast-breathing-newborn",
    "newborn-trembles-and-jerks"
  ],
  "seo": {
    "description": "A soft round tummy after feeding is usually normal baby shape; a firm shiny tummy with pain or vomiting needs checking."
  },
  "longform": [
    {
      "h": "Babies are built round in the middle",
      "t": "Ari’s tummy looked enormous after a feed, but she was comfortable and not crying. We worried we had somehow stretched her stomach.\n\nBabies have short torsos, weak abdominal muscles and a middle full of milk and gas. Compared with an adult, the shape looks very round because it is supposed to."
    },
    {
      "h": "Soft versus firm is the useful difference",
      "t": "A soft tummy and a settled baby is usually reassuring. We learned more by placing a flat hand gently on Ari’s tummy than by staring at it from different angles.\n\nA firm, tight, shiny or increasingly swollen tummy is different, especially with vomiting, poor feeding, pain or unusual sleepiness. We had that combination once and went in."
    },
    {
      "h": "Let baby finish the feed",
      "t": "A bottle can keep flowing after a baby is full, especially if the teat is fast. The usual result of taking too much is spit-up and discomfort, not permanent damage.\n\nPaced feeding helped: bottle more horizontal, breaks built in, and stopping when Ari turned away. The difficult part was accepting that the measured amount left in the bottle did not need to be defeated."
    }
  ],
  "order": 59,
  "batch": "4"
},
{
  "id": "overwhelmed-new-parent",
  "topic": "sanity",
  "icon": "heart",
  "featured": false,
  "title": "Is it normal to regret having a baby sometimes?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 2,
  "summary": "Sometimes parenthood feels crushingly heavy; saying that aloud does not make you a bad parent.",
  "keywords": [
    "regret having a baby",
    "overwhelmed new parent",
    "postnatal depression fathers",
    "parent burnout baby"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Low mood or hopelessness that does not lift",
      "Withdrawing from your partner or baby",
      "Unable to sleep even when given the chance",
      "Drinking more or feeling constantly on edge",
      "Thoughts of harming yourself or the baby"
    ]
  },
  "panel": {
    "eyebrow": "Parent Sanity • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Overwhelmed thoughts after little sleep",
        "Responsibility feeling relentless",
        "The thought arriving during an argument",
        "Feeling better when some rest returns"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Telling one trusted person",
        "Protecting one real block of sleep",
        "Naming the hardest specific problem",
        "Accepting help without earning it first"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Low mood or hopelessness that does not lift",
        "Withdrawing from your partner or baby",
        "Unable to sleep even when given the chance",
        "Drinking more or feeling constantly on edge",
        "Thoughts of harming yourself or the baby"
      ]
    },
    "quick": "Overload can produce thoughts like this without making them true. Say it to one person early; persistent numbness, hopelessness or thoughts of harm need help."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "visitors",
    "father-not-feeling-it",
    "touched-out"
  ],
  "seo": {
    "description": "Overload can produce frightening thoughts without making them true; saying it early and protecting real sleep can stop shame making everything heavier."
  },
  "longform": [
    {
      "h": "The sentence came out during an argument",
      "t": "Papa said it plainly: sometimes I am so overwhelmed that I think, what did I do having this baby? It did not arrive as a calm confession. It arrived alongside being told he was constantly negative.\n\nThat matters because thoughts like this often appear as frustration before anybody recognises the exhaustion underneath."
    },
    {
      "h": "It was not only the baby",
      "t": "For us there was NICU, travel, work, a household and endless decisions. Papa was also operating in Greek while still learning it. Doing ordinary life in another language is manageable; doing it exhausted while worried about a baby is something else entirely.\n\nHaving the thought did not mean Papa did not love Ari. It meant the whole system was overloaded."
    },
    {
      "h": "Make the problem smaller and say it aloud",
      "t": "One real block of sleep helped more than a night of lying down while still listening for everything. Naming the specific thing—another hospital run, another broken night—made it something we could share.\n\nIf low mood, numbness, panic, hopelessness or withdrawal continues, tell a doctor. Postnatal depression and anxiety can affect either parent. If you might harm yourself or the baby, seek urgent help now."
    }
  ],
  "order": 60,
  "batch": "4"
},
{
  "id": "how-much-should-she-eat",
  "topic": "feeding",
  "icon": "bottle",
  "featured": false,
  "title": "How much milk should my baby have?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 3,
  "summary": "The calculator feels reassuring until one unfinished bottle makes everybody panic again.",
  "keywords": [
    "how much milk baby",
    "ml per feed",
    "feeding amounts newborn",
    "how many feeds a day"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "She's consistently taking much less than usual",
      "Fewer wet nappies than you'd expect",
      "She's not gaining weight, or is losing it",
      "She's very sleepy and hard to wake for feeds",
      "You've been given a target and can't get near it"
    ]
  },
  "panel": {
    "eyebrow": "Feeding • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Around 150–200ml per kilo per day is a general guide after the first week",
        "Divided across about eight feeds",
        "Appetite varies feed to feed and day to day",
        "Premature babies often need a different calculation"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Watching the day's total rather than each individual feed",
        "Counting wet nappies as the real check",
        "Letting her stop when she turned away",
        "Getting her numbers from her baby’s doctor, not a chart"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "She's consistently taking much less than usual",
        "Fewer wet nappies than you'd expect",
        "She's not gaining weight, or is losing it",
        "She's very sleepy and hard to wake for feeds",
        "You've been given a target and can't get near it"
      ]
    },
    "quick": "Around 150–200ml per kilo per day is a general guide after the first week. Wet nappies, growth and your baby’s cues matter more than one feed."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "how-much-from-the-breast",
    "constantly-hungry",
    "weight-gain-per-day"
  ],
  "seo": {
    "description": "A practical guide to how much milk babies may need, why feeds vary and why nappies and growth matter more than one unfinished bottle."
  },
  "longform": [
    {
      "h": "The number everyone wants",
      "t": "How many ml should she be eating. We asked it repeatedly, in different weeks, with different weights, and each time we wanted a single figure.\n\nThe common guide is roughly 150–200ml per kilogram of body weight per day, spread across about eight feeds. So a 3kg baby lands somewhere near 450–600ml a day, which is roughly 55–75ml across eight feeds.\n\nThat's a starting point rather than a prescription, and the moment we started treating it as a target we made things harder.\n\nAppetite isn't steady. She'll take 40ml at one feed and 90ml at the next, and both are fine. Averaging across the day is the only version of the number that means anything.\n\nIt also assumes a term baby. Ari was born at 33 weeks and the calculation her doctor or nurse used was different from the standard one — smaller stomach, different needs, different targets.\n\nAnd once she's growing well and feeding effectively, she becomes a better judge of it than the arithmetic. We asked at one point whether 500ml a day was too much, and the answer was that a baby with a good appetite who isn't fussing or vomiting is generally getting it about right."
    },
    {
      "h": "What we watched instead",
      "t": "Wet nappies. Roughly five or more heavy ones a day was the daily signal that things were fine, and it costs nothing to notice.\n\nWeight, over weeks rather than days. Scales vary, nappies weigh something, and a single reading tells you very little.\n\nAnd her behaviour. Settled at least some of the time after feeds, alert when awake, and interested in the next one."
    },
    {
      "h": "Letting her stop",
      "t": "This was the hardest part. When you've measured out what she's supposed to have and she turns away with 20ml left, everything in you wants to get it in.\n\nWe learned not to force it. That last bit is where the discomfort comes from, and it teaches her to fight the bottle rather than to trust it.\n\nIf she's consistently leaving a lot, that's worth mentioning rather than pushing through — but one feed she didn't finish is just one feed she didn't finish."
    }
  ],
  "order": 61,
  "batch": "5"
},
{
  "id": "how-much-from-the-breast",
  "topic": "feeding",
  "icon": "bottle",
  "featured": false,
  "title": "How can I tell how much milk my breastfed baby is getting?",
  "ages": [
    "0–1 month",
    "2–3 months"
  ],
  "read": 2,
  "summary": "Breasts do not come with millilitre markings, which is deeply inconvenient when the NICU taught you to measure everything.",
  "keywords": [
    "how much breastfed baby drinks",
    "breastfeeding intake",
    "weighted feeds",
    "is she getting enough milk"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Fewer wet nappies than expected",
      "She is not back to birth weight when your baby's doctor or nurse expected",
      "She feeds for very long stretches and never seems satisfied",
      "She's very sleepy and hard to wake for feeds",
      "Feeding is painful, or she can't stay latched"
    ]
  },
  "panel": {
    "eyebrow": "Feeding • 0–3 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "No way to see what she's taken",
        "Feed length tells you very little",
        "Swallowing sounds and a softer breast are signs",
        "Weighed feeds are a rough tool, not a precise one"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Counting wet nappies instead of minutes",
        "Listening for swallowing rather than watching the clock",
        "Watching the weekly weight, not the daily",
        "Accepting we'd never have the number we wanted"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Fewer wet nappies than expected",
        "She is not back to birth weight when your baby's doctor or nurse expected",
        "She feeds for very long stretches and never seems satisfied",
        "She's very sleepy and hard to wake for feeds",
        "Feeding is painful, or she can't stay latched"
      ]
    },
    "quick": "You cannot measure it directly, so watch the useful signs: wet nappies, swallowing and weekly weight. Feed length tells you very little."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "how-much-should-she-eat",
    "when-does-milk-come-in",
    "weight-gain-per-day"
  ],
  "seo": {
    "description": "You cannot measure a breastfeed directly, but swallowing, wet nappies and steady growth can show whether your baby is getting enough milk."
  },
  "longform": [
    {
      "h": "The question with no clean answer",
      "t": "How do you calculate how much she ate when breastfeeding.\n\nYou can't, really. That's the honest answer and it's the thing that makes breastfeeding harder for people who like numbers — which, after weeks in the NICU where everything was measured in millilitres, we very much did.\n\nGoing from a chart with exact volumes to a breast with no display on it is a genuine adjustment.\n\nA baby can take a substantial feed in eight minutes or dawdle for forty and take less. Efficiency changes as they get older, and it changes between feeds.\n\nSo feed length tells you very little. We spent a while logging every minute before realising the numbers were not helping us at all."
    },
    {
      "h": "The signs that helped",
      "t": "Swallowing. Not sucking — swallowing. A rhythmic suck-swallow pattern with audible gulps means milk is moving. Fluttery sucking with no swallows means comfort rather than feeding.\n\nHow the breast feels before and after. Softer afterwards means something came out.\n\nWet nappies, which remain the most reliable everyday signal you have.\n\nAnd weight over weeks. That's the one that actually answers the question, just slowly."
    },
    {
      "h": "Weighed feeds",
      "t": "Weighing before and after a feed can give a rough figure, and professionals sometimes use it for a reason.\n\nPapa tried it at home. Clever idea in theory. In practice, Ari would not stay still, and sometimes she peed mid-feed, so the numbers made absolutely no sense.\n\nAt home it tends to create more anxiety than information. Scale variation, clothing, a nappy that changed weight — the error can be as big as the feed. Doing it repeatedly turns every feed into an exam.\n\nIf you genuinely need the number, ask a midwife or lactation consultant to do it properly once, rather than doing it yourself eight times a day."
    }
  ],
  "order": 62,
  "batch": "5"
},
{
  "id": "constantly-hungry",
  "topic": "feeding",
  "icon": "bottle",
  "featured": false,
  "title": "Why does my baby always seem hungry?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 3,
  "summary": "A baby can ask for milk with the confidence of someone who has not just finished a full feed.",
  "keywords": [
    "baby always hungry",
    "underfeeding",
    "screaming for food",
    "cluster feeding"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Fewer wet nappies than expected",
      "She's not gaining weight, or is losing it",
      "She feeds constantly and never seems satisfied at all",
      "She's very sleepy and hard to wake between feeds",
      "She's crying inconsolably in a way that isn't her usual"
    ]
  },
  "panel": {
    "eyebrow": "Feeding • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Small stomach, fast digestion, frequent feeds",
        "Cluster feeding, often in the evening",
        "Comfort, tiredness and closeness look like hunger",
        "Growth spurts genuinely increase appetite for a few days"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Checking wet nappies before assuming she was short",
        "Burping her properly before deciding she wanted more",
        "Offering closeness rather than another bottle",
        "Trusting the weekly weight over the hourly panic"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Fewer wet nappies than expected",
        "She's not gaining weight, or is losing it",
        "She feeds constantly and never seems satisfied at all",
        "She's very sleepy and hard to wake between feeds",
        "She's crying inconsolably in a way that isn't her usual"
      ]
    },
    "quick": "Frequent feeding is normal and rarely means underfeeding. Check the nappies and the weekly weight before adding more milk — and burp her before deciding."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "cluster-feeding",
    "how-much-should-she-eat",
    "feeding-on-demand"
  ],
  "seo": {
    "description": "Frequent feeding can mean growth, comfort, tiredness or trapped air rather than underfeeding; nappies and growth tell the clearer story."
  },
  "longform": [
    {
      "h": "The two questions we asked in one breath",
      "t": "Ari is constantly hungry. And then: if she's eating and not burping and still wants food, do I keep feeding her? And then, straight after: does that mean I'm underfeeding her?\n\nThat third question is the one doing the damage. It's the fear underneath the other two.\n\nIf she's producing plenty of heavy wet nappies and gaining weight over the weeks, she is not being underfed. Whatever the crying suggests.\n\nThat's worth holding onto, because a baby who screams for food an hour after a full feed is extremely convincing. Ours screamed for food like a mad person, in our exact words, and we asked whether that was normal when she'd just eaten.\n\nIt was. And she was gaining well throughout."
    },
    {
      "h": "What else looks like hunger",
      "t": "Trapped air. This was the big one for us. A baby with trapped air feels uncomfortable, and sucking can briefly soothe her, so she asks for more and then feels worse. Burping partway through and again afterwards often changed the picture more than adding milk did.\n\nTiredness. An overtired baby is hard to distinguish from a hungry one, and the answer to one is not the answer to the other.\n\nWanting to be close. Sucking is comforting, and sometimes the request is for contact rather than calories.\n\nAnd genuine growth spurts, where appetite really does jump for a few days and then settles."
    },
    {
      "h": "So do you keep feeding?",
      "t": "Not indefinitely, and not automatically.\n\nWhat worked for us: burp her properly. Then try holding, movement or a change of scene for a few minutes. If she settles, it wasn't hunger. If she's still asking and rooting properly after that, offer more.\n\nWhat we never did, and what's worth being firm about: never dilute or stretch formula to make it go further. That's dangerous, not economical.\n\nAnd if the pattern is constant, with poor weight gain or fewer wet nappies, that's a conversation with a doctor rather than a puzzle to solve at 3am."
    }
  ],
  "order": 63,
  "batch": "5"
},
{
  "id": "feeding-too-fast",
  "topic": "feeding",
  "icon": "bottle",
  "featured": false,
  "title": "Why does my baby drink too fast and then vomit?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 3,
  "summary": "Some babies drink as though the bottle may be taken away at any moment; slowing the whole feed can help.",
  "keywords": [
    "baby drinks too fast",
    "paced bottle feeding",
    "slow flow teat",
    "baby sick after feed"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "lead": "Blue or grey, or a floppy baby you cannot wake — call your local emergency number now.",
    "items": [
      "She goes pale, blue or limp during feeds",
      "She coughs, splutters or chokes at most feeds",
      "Vomiting is forceful, or green, or has blood in it",
      "She's not gaining weight despite feeding well",
      "Her breathing changes while feeding"
    ]
  },
  "panel": {
    "eyebrow": "Feeding • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "The sucking reflex keeps going past full",
        "Gravity does the work if the bottle is upright",
        "Fast feeds bring in more air",
        "Even the slowest teat can be too fast for some babies"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Holding the bottle more horizontally, teat just full",
        "Deliberate pauses every ten to fifteen sucks",
        "Sitting her more upright rather than reclined",
        "Letting her come off, then offering again"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "lead": "Blue or grey, or a floppy baby you cannot wake — call your local emergency number now.",
      "items": [
        "She goes pale, blue or limp during feeds",
        "She coughs, splutters or chokes at most feeds",
        "Vomiting is forceful, or green, or has blood in it",
        "She's not gaining weight despite feeding well",
        "Her breathing changes while feeding"
      ]
    },
    "quick": "Hold the bottle more horizontally, sit her upright, and pause deliberately every ten to fifteen sucks. Pacing beats any slow-flow teat."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "reflux-or-spit-up",
    "wind-and-gas",
    "overfed-big-tummy"
  ],
  "seo": {
    "description": "Paced bottle feeding can slow a fast drinker, reduce swallowed air and help your baby notice when she has had enough."
  },
  "longform": [
    {
      "h": "We already had the slowest bottle",
      "t": "That was our frustration, more or less word for word. We had the slowest teat available, on NUK Perfect Match, and she was still drinking far too quickly and making herself sick.\n\nSo the teat wasn't the problem. The way we were feeding her was.\n\nHold a bottle upright and milk flows whether she's sucking or not. She then has to keep swallowing to keep up, which means she can't pause to breathe properly and takes in air along the way.\n\nHolding the bottle closer to horizontal — just tilted enough that the teat stays full — puts her back in charge. She has to actively draw the milk, which is much closer to how breastfeeding works.\n\nWe asked whether a horizontal bottle would make her swallow more air, which is the obvious worry. It does not, as long as the teat stays full of milk rather than half air. That is the bit to watch. Some newer bottles also have vents designed to reduce swallowed air."
    },
    {
      "h": "Stopping on purpose",
      "t": "The advice that sounded strangest was to interrupt her — to actually stop feeding her mid-feed, let her have a break, and then start again.\n\nEvery ten to fifteen sucks, tip the bottle down or gently break the seal for a few seconds. She breathes, catches up and has a chance to notice she is full. It sometimes worked beautifully. Other times she treated the pause as the end of the meal and refused to restart. Papa quickly learned that paced feeding helped, but it was not a magic trick every time.\n\nA baby draining a bottle in four minutes hasn't had time to register any of that, which is exactly how you end up with an overfed, uncomfortable baby and a lot of laundry."
    },
    {
      "h": "The rest of the setup",
      "t": "Sit her more upright rather than reclined. Flat on her back with a bottle is the worst version of all of this.\n\nLet her come off when she wants to, then offer again. If she's done, she's done.\n\nAnd never widen a teat hole. People do it to speed things up and it turns a controlled flow into an uncontrolled one, which is genuinely unsafe."
    }
  ],
  "order": 64,
  "batch": "5"
},
{
  "id": "cluster-feeding",
  "topic": "feeding",
  "icon": "bottle",
  "featured": false,
  "title": "What is cluster feeding?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 2,
  "summary": "Cluster feeding is a feeding marathon squeezed into one part of the day, usually when everyone is already tired.",
  "keywords": [
    "cluster feeding",
    "feeding every hour evening",
    "baby feeding constantly",
    "evening feeding"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Fewer wet nappies than expected",
      "She isn't gaining weight",
      "She feeds constantly and is never settled at any point",
      "She seems weak, or is hard to wake",
      "Feeding is painful for you"
    ]
  },
  "panel": {
    "eyebrow": "Feeding • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Several feeds bunched close together",
        "Most often late afternoon into evening",
        "Common in the first months and around growth spurts",
        "Not a sign your supply has failed"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Planning the evening around it rather than fighting it",
        "Food, drink and a phone within reach before it starts",
        "Swapping over so one of us got a break",
        "Knowing it had a name made it far less frightening"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Fewer wet nappies than expected",
        "She isn't gaining weight",
        "She feeds constantly and is never settled at any point",
        "She seems weak, or is hard to wake",
        "Feeding is painful for you"
      ]
    },
    "quick": "Feeds bunched together, usually in the evening. Normal, exhausting, and not evidence that your milk has run out."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "constantly-hungry",
    "feeding-on-demand",
    "when-does-milk-come-in"
  ],
  "seo": {
    "description": "Cluster feeding means several feeds close together, often in the evening, and does not automatically mean your milk supply is low."
  },
  "longform": [
    {
      "h": "It has a name, which helps",
      "t": "We asked what cluster feeding actually means, in the middle of a week where the evenings had become one continuous feed.\n\nKnowing it was a recognised pattern with a name changed how it felt. It stopped being evidence that something had gone wrong and became a thing that happens.\n\nSeveral feeds close together — sometimes almost continuously — usually late afternoon into evening. She feeds, comes off, seems settled for ten minutes, then wants more.\n\nIt turns up most in the early months, around growth spurts, and often alongside the general evening fussiness that everything else in that stretch produces.\n\nIt's also very common right before a longer stretch of sleep, which is some consolation if you can hold on."
    },
    {
      "h": "It is not proof your supply has failed",
      "t": "This is the thing that causes the most damage, because it's the obvious conclusion. She's feeding constantly, therefore she isn't getting enough, therefore my milk isn't enough.\n\nUsually none of that follows. Frequent feeding is one of the ways supply is driven up, so a cluster-feeding evening is often the system working rather than failing.\n\nThe honest check is the same as always — wet nappies, and weight over weeks. If those are fine, the evening is just an evening."
    },
    {
      "h": "How to survive it rather than fix it",
      "t": "There isn't a fix. There's setting yourself up before it starts.\n\nFood, a large drink and something to watch or read within arm's reach by five o'clock. A comfortable place to sit that you don't mind being in for two hours.\n\nAnd swapping over if there's someone to swap with, even for twenty minutes. It's a long stretch to do alone every night."
    }
  ],
  "order": 65,
  "batch": "5"
},
{
  "id": "growth-spurt-signs",
  "topic": "development",
  "icon": "blocks",
  "featured": false,
  "title": "Why does my baby get sleepy during feeds?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 2,
  "summary": "A suddenly sleepy feeder may simply be catching up after a busy few days, but sometimes the change deserves a closer look.",
  "keywords": [
    "growth spurt baby",
    "extra sleepy baby",
    "baby sleeping more",
    "growth spurt signs"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "lead": "A floppy baby you cannot wake — call your local emergency number now.",
    "items": [
      "She's hard to wake, or floppy when awake",
      "She's feeding poorly as well as sleeping more",
      "Fewer wet nappies",
      "She has a fever, or seems unwell",
      "The sleepiness carries on beyond a few days"
    ]
  },
  "panel": {
    "eyebrow": "Development • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "More sleep, alongside good feeding",
        "Alert and responsive when she is awake",
        "Often a few days, then back to normal",
        "Sometimes more feeding rather than more sleeping"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Checking she was alert when awake, not just asleep more",
        "Letting the extra sleep happen",
        "Keeping an eye on wet nappies through it",
        "Waiting a few days before reading anything into it"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "lead": "A floppy baby you cannot wake — call your local emergency number now.",
      "items": [
        "She's hard to wake, or floppy when awake",
        "She's feeding poorly as well as sleeping more",
        "Fewer wet nappies",
        "She has a fever, or seems unwell",
        "The sleepiness carries on beyond a few days"
      ]
    },
    "quick": "Sleepier but alert when awake and feeding well is usually growth. Sleepy plus feeding badly is the combination that gets checked."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "weight-gain-per-day",
    "feeding-on-demand",
    "timing-feeds-start-or-finish"
  ],
  "seo": {
    "description": "Babies often become sleepier after a growth spurt, but being unusually hard to wake or taking much less milk needs checking."
  },
  "longform": [
    {
      "h": "Two things at once",
      "t": "She was eating very well and was noticeably sleepier than usual. Our question was whether that meant she was about to grow.\n\nThe follow-up mattered more than the question: she's very alert when awake, and eating well — just sleepy.\n\nThat detail is what separates a growth spurt from something worth checking.\n\nMore sleep, or more feeding, or both, for a few days, in a baby who is otherwise herself.\n\nSome babies do it by feeding constantly. Others do it by sleeping. Ours went sleepy, and then the weight showed up afterwards.\n\nThe pattern is a few days, not a few weeks. And they don't run to a timetable, whatever the lists say about weeks three, six and twelve."
    },
    {
      "h": "The distinction that matters",
      "t": "Sleepier but alert, responsive and feeding well is growth.\n\nSleepy and feeding badly is not, and those two get looked at together rather than separately. So does sleepiness with fewer wet nappies, or a fever, or floppiness when she is awake.\n\nWith a premature baby the threshold is lower, because a sleepy preemie can quietly miss feeds she needed. If she was born early and is sleeping through feeds, that's worth raising rather than enjoying."
    },
    {
      "h": "What we did",
      "t": "Let it happen. Kept an eye on nappies through it. Didn't wake her out of anxiety.\n\nAnd waited a few days before drawing any conclusion, which is the hardest part and almost always the right one."
    }
  ],
  "order": 66,
  "batch": "5"
},
{
  "id": "weight-gain-per-day",
  "topic": "development",
  "icon": "blocks",
  "featured": false,
  "title": "Is my baby gaining enough weight?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 3,
  "summary": "One weigh-in can ruin an afternoon; the trend over weeks tells a much calmer and more useful story.",
  "keywords": [
    "baby weight gain",
    "grams per day",
    "weight gain newborn",
    "how much should baby gain"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Weight is flat or falling across more than a few days",
      "She's crossing downwards through the chart, not following her line",
      "Fewer wet nappies, or poor feeding alongside",
      "She is not back to birth weight when your baby's doctor or nurse expected",
      "You've been given a target and she's well short of it"
    ]
  },
  "panel": {
    "eyebrow": "Development • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Gain per day varies enormously between weighings",
        "Weekly is the meaningful unit, not daily",
        "Rates slow as she gets bigger, which is expected",
        "Premature babies are assessed against their own targets"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Weighing weekly instead of every couple of days",
        "Same scales, same time, same amount of clothing",
        "Watching the direction rather than the number",
        "Getting her expected range from her own baby’s doctor"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Weight is flat or falling across more than a few days",
        "She's crossing downwards through the chart, not following her line",
        "Fewer wet nappies, or poor feeding alongside",
        "She is not back to birth weight when your baby's doctor or nurse expected",
        "You've been given a target and she's well short of it"
      ]
    },
    "quick": "Daily gain is mostly noise — weigh weekly, same scales, and watch the direction. Rates slowing as she grows is expected, not a warning."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "newborn-weight-loss",
    "how-much-should-she-eat",
    "preemie-growth-charts"
  ],
  "seo": {
    "description": "Daily weights jump around; growth over time, wet nappies and how your baby feeds give a more useful picture."
  },
  "longform": [
    {
      "h": "The daily number became an obsession",
      "t": "Two weigh-ins a few days apart suggested she was gaining around 30 grams a day. We immediately did the arithmetic and asked whether that was good.\n\nIt was. But the maths was less reliable than it looked. Papa became obsessed with the scales. One day Ari had just done a poo and weighed about 75 grams less, and he immediately thought she was losing weight. That was when we understood why daily weighing can create more panic than useful information. The trend matters, not one day's number."
    },
    {
      "h": "Why daily gain is noisy",
      "t": "Three days is a short window and a lot of things move within it. Different scales, different clothes, a full or empty nappy, a feed that just went in — any of those can be forty or fifty grams on their own.\n\nSo a daily figure from two weighings a few days apart is mostly scale noise, with a little growth mixed in.\n\nWeekly is the unit that means something. Same scales, roughly the same time of day, roughly the same amount of clothing.\n\nWe assumed a bigger baby should gain more each day. It sounds sensible, but it is the other way round.\n\nGain per day is fastest early on and slows as she grows. A rate that would be excellent at one month would be unusual at six. So a slowing rate isn't a warning sign — it's the expected shape.\n\nWhat matters is that she keeps following her own line rather than sliding downwards across the chart."
    },
    {
      "h": "The premature version",
      "t": "Ari was born at 33 weeks and was due in September, so when we were doing this arithmetic she had only just reached the point when she should have been born.\n\nWe asked whether she was still on preterm expectations or had switched to term ones, and honestly that's a question for the people following her rather than a calculation. Her baby’s doctor had her own targets and they were the ones that counted.\n\nIf your baby is under any kind of follow-up, ask what they expect and what number would concern them. Then you're watching for something real instead of comparing her to a stranger."
    }
  ],
  "order": 67,
  "batch": "5"
},
{
  "id": "choosing-a-formula",
  "topic": "feeding",
  "icon": "bottle",
  "featured": false,
  "title": "Which baby formula is best?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 3,
  "summary": "The most expensive tin is not automatically the best one, however persuasive the packaging looks at 2am.",
  "keywords": [
    "best baby formula",
    "goat milk formula",
    "kendamil",
    "which formula to choose"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Using any specialist, hypoallergenic or anti-reflux formula",
      "Switching because you suspect an allergy or intolerance",
      "Using goat formula if cow's milk protein allergy is suspected",
      "Changing formula for a premature or unwell baby"
    ]
  },
  "panel": {
    "eyebrow": "Feeding • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "First infant formula is regulated to a common standard",
        "Cow's milk based, whey dominant, is the usual starting point",
        "Goat milk versions are an alternative, not a hypoallergenic one",
        "Price differences are largely branding"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Choosing a formula available in both places we live",
        "Letting her doctor decide when reflux needed anti-reflux formula",
        "Giving each formula time to settle before judging it",
        "Judging by how she took it, not by the label"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Using any specialist, hypoallergenic or anti-reflux formula",
        "Switching because you suspect an allergy or intolerance",
        "Using goat formula if cow's milk protein allergy is suspected",
        "Changing formula for a premature or unwell baby"
      ]
    },
    "quick": "First infant formulas meet the same regulated standard, so choose on availability and how she takes it. Specialist formulas are a medical decision, not a shopping one."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "making-up-formula",
    "formula-side-effects",
    "breast-milk-to-formula"
  ],
  "seo": {
    "description": "Standard first infant formulas are nutritionally complete; availability, preparation and your baby’s medical needs matter more than price."
  },
  "longform": [
    {
      "h": "We wanted the best one, not the fanciest tin",
      "t": "That was the question, twice, once for Greece and once for Greece and Dubai together.\n\nAnd the answer is less exciting than we wanted. First infant formula is regulated to a common nutritional standard, so the floor is high everywhere. The differences between a mid-range tin and a premium one are real but small, and a lot of what you're paying for is packaging and story.\n\nWhether it's whey-dominant or casein-dominant. Whey-dominant is the usual first infant formula and the one to start with — casein-based tins marketed as being for hungrier babies aren't necessary and often aren't helpful.\n\nWhat fat sources are used, and whether certain optional ingredients are added.\n\nWhether it is cow or goat based. We looked hard at goat formula. It is a genuine alternative and some babies seem to tolerate it better. But it is not hypoallergenic and it is not suitable when cow's milk protein allergy is suspected. That is an important difference.\n\nPapa did the research and decided goat formula looked like the better choice, so we tried Kendamil. Then Ari's reflux entered the conversation and she kept bringing it back up. What followed was a stressful few days of changing formula, changing poo patterns and feeling as though every decision made something else wobble. Her doctor eventually advised an anti-reflux formula. We needed a brand available in both standard and AR versions, then followed her doctor's plan for how to use them. That was the point where formula stopped being a shopping decision and became a medical one."
    },
    {
      "h": "The practical criteria",
      "t": "Availability where you live, and where you travel. We move between Greece and Dubai, and a formula you can't buy in both places creates a problem you don't need.\n\nWhether she takes it and tolerates it.\n\nAnd then stop looking. Switching repeatedly in search of a better one causes more unsettled days than it solves, because each change takes time to settle and you never learn anything from any of them."
    },
    {
      "h": "Where it becomes a medical decision",
      "t": "Hypoallergenic, extensively hydrolysed, anti-reflux and preterm formulas are prescribed for reasons, not chosen from a shelf.\n\nAri had been on Alfaré in the NICU, and it caused projectile vomiting until it was stopped. That's the kind of thing that gets decided and monitored by a doctor.\n\nIf you suspect an allergy or intolerance, that's a conversation before a purchase. Buying a specialist tin to test a theory is how you end up masking something that needed diagnosing."
    }
  ],
  "order": 68,
  "batch": "5"
},
{
  "id": "breast-milk-to-formula",
  "topic": "feeding",
  "icon": "bottle",
  "featured": false,
  "title": "How do I move from breast milk to formula?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 3,
  "summary": "Moving to formula is a change for the baby and for the person producing the milk, so slow usually feels kinder.",
  "keywords": [
    "switching to formula",
    "weaning off breastfeeding",
    "combination feeding",
    "introducing formula"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "A rash, swelling, or breathing change after a feed",
      "Forceful vomiting, or blood or mucus in the nappy",
      "She refuses feeds altogether for a prolonged stretch",
      "You develop a hot, red, painful area or feel flu-like",
      "She's premature or has known allergies — ask before starting"
    ]
  },
  "panel": {
    "eyebrow": "Feeding • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Replace a single feed, then wait several days",
        "Two to three weeks is a comfortable pace",
        "Nappies change colour and consistency — expected",
        "She may take a few tries to accept the taste"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Starting with a mid-morning feed rather than a night one",
        "Mixing gradually rather than swapping outright",
        "Someone else offering the first bottles",
        "Going slower than the plan when either of them needed it"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "A rash, swelling, or breathing change after a feed",
        "Forceful vomiting, or blood or mucus in the nappy",
        "She refuses feeds altogether for a prolonged stretch",
        "You develop a hot, red, painful area or feel flu-like",
        "She's premature or has known allergies — ask before starting"
      ]
    },
    "quick": "Replace one feed at a time and wait several days before the next. Two to three weeks is comfortable for her and for you."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "choosing-a-formula",
    "weaning-off-pumping",
    "formula-side-effects"
  ],
  "seo": {
    "description": "A gradual move from breast milk to formula can be easier on your baby’s tummy and kinder to your own milk supply."
  },
  "longform": [
    {
      "h": "Slow for her, slow for you",
      "t": "For her, it's a new taste, a new consistency and a different way of digesting. Nappies change — firmer, darker, often less frequent — and that's expected rather than a problem.\n\nFor whoever is breastfeeding or pumping, dropping feeds suddenly leaves the breasts overfull, which is uncomfortable and carries a real risk of blocked ducts and mastitis. Supply comes down gradually if you let it, and painfully if you don't.\n\nThe main reason we introduced formula was simple: Mama was not producing enough milk. The days were long and the nights were even longer. Milk supply rises and falls with how often milk is removed, but exhaustion does not care about a pumping schedule. Miss a session because you desperately need sleep, or have a baby who is not sucking effectively, and supply can drop. It can come back, but that takes work. Stilltee tea, breast massage and hot or cold compresses helped Mama feel more comfortable, but regular milk removal was the part that mattered most for supply.\n\nSo the pace serves both of them. Replace one feed, hold there for several days, then replace another. Two to three weeks is comfortable. Faster is possible but you'll feel it."
    },
    {
      "h": "Which feed to start with",
      "t": "A mid-morning or early afternoon one, where nobody is desperate and there's time for it to go badly.\n\nNot the night feed, and not the one she's most attached to. Those go last.\n\nWe kept breast milk and formula in separate bottles. It made it easier to see how much of each she had taken, and it meant precious breast milk was not wasted if she stopped early.\n\nIt also often works better when someone other than the breastfeeding parent offers the first bottles. Being held by the person who normally breastfeeds you and being offered something else is a hard sell. Papa offered more of the early formula bottles because Ari did not smell him and immediately think, ooh, breast milk."
    },
    {
      "h": "Watch for two things",
      "t": "The nappies, because they will change and you need to know that's normal rather than assume something has gone wrong. There's a whole separate guide on the constipation that often follows.\n\nAnd genuine allergy signs, which are different from a bit of unsettledness — a rash, swelling, breathing changes, forceful vomiting, or blood in the nappy. Those are a call rather than a wait.\n\nIf she was premature, or there's a family history of allergy, have the conversation with your doctor before you start rather than after."
    }
  ],
  "order": 69,
  "batch": "5"
},
{
  "id": "how-long-does-breast-milk-matter",
  "topic": "feeding",
  "icon": "bottle",
  "featured": false,
  "title": "Does breastfeeding for three months still count?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 3,
  "summary": "Three months of breastfeeding does not disappear simply because it was not six.",
  "keywords": [
    "how long to breastfeed",
    "stopping at 3 months",
    "breast milk benefits",
    "combination feeding"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "You're stopping because of pain or difficulty that could be fixed",
      "You feel guilty or low about it — that's worth saying out loud",
      "You're unsure which formula suits her",
      "Feeding decisions are causing conflict at home"
    ]
  },
  "panel": {
    "eyebrow": "Feeding • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Benefits build over time rather than switching on",
        "The earliest weeks still matter",
        "Any amount counts — it isn't all or nothing",
        "Combination feeding is a legitimate answer"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Stopping the countdown and looking at what she'd already had",
        "Treating combination feeding as a plan, not a compromise",
        "Being honest about what was sustainable",
        "Not asking the question again once we'd answered it"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "You're stopping because of pain or difficulty that could be fixed",
        "You feel guilty or low about it — that's worth saying out loud",
        "You're unsure which formula suits her",
        "Feeding decisions are causing conflict at home"
      ]
    },
    "quick": "Breastfeeding for three months still counts. Every week adds something, and stopping before six months does not erase what you have already done."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "breast-milk-to-formula",
    "weaning-off-pumping",
    "milk-supply-dropped"
  ],
  "seo": {
    "description": "Breastfeeding for three months still matters; there is no cliff edge where the time and effort suddenly stop counting."
  },
  "longform": [
    {
      "h": "The negotiation",
      "t": "This one is in the archive as a conversation with himself, and it's worth quoting because a lot of people have it.\n\nShe'll probably have breast milk for three months, maybe four, but that's it. What if it's only three? We can't make it to six months — how about three to four? Four to five? And then, at the end: so we need to do it all to make it to three months.\n\nThat's someone trying to work out whether what he can manage is enough."
    },
    {
      "h": "It isn't a threshold",
      "t": "The six-month figure is a public health recommendation, not a pass mark. Nothing switches on at six months and nothing is forfeited at five.\n\nThe benefits accumulate. They start on day one, they're weighted towards the early period, and every week adds something. Three months of breast milk is a real and substantial contribution — not a failed attempt at six.\n\nCombination feeding counts too. Milk from both sources isn't a compromise position; it's what a great many families actually do, and it's often what makes continuing possible at all.\n\nPapa was fed entirely on formula, so we wondered what would have been different. Then came the guilt question: were his food allergies caused by that?\n\nHonestly, no — not in the way that question implies. Allergy risk is complicated, involves genetics and environment, and you cannot trace one adult's allergies back to one infant feeding decision. Nobody can.\n\nIt's worth saying because that particular guilt spiral — working backwards from yourself to your parents' choices, and forwards to your own — doesn't lead anywhere useful."
    },
    {
      "h": "What actually matters more",
      "t": "That she's fed, and gaining, and that the people feeding her are able to keep going.\n\nA parent running on empty, in pain, or drowning in guilt is a worse outcome than a formula bottle. That trade-off is real and it's allowed to be part of the decision.\n\nAnd if you're stopping because of pain, difficulty or supply problems that might be fixable, that's worth one conversation with a midwife or lactation consultant first. Not to talk you out of it — to make sure it is a choice rather than a defeat. Mama felt that Stilltee tea and breast massage helped, but the biggest things were rest and removing milk regularly enough to protect her supply."
    }
  ],
  "order": 70,
  "batch": "5"
},
{
  "id": "weaning-off-pumping",
  "topic": "feeding",
  "icon": "bottle",
  "featured": false,
  "title": "How do I stop pumping without it hurting?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 2,
  "summary": "Stopping pumping works best as a slow goodbye, not an overnight disappearance.",
  "keywords": [
    "stop pumping",
    "weaning off pump",
    "reducing pumping",
    "drop a pump session"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "A hot, red or painful area, or a hard lump",
      "Fever, shivering or feeling flu-like",
      "Pain that's getting worse rather than easing",
      "Any lump that doesn't shift after a day or so"
    ]
  },
  "panel": {
    "eyebrow": "Feeding • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Drop a single session and hold for several days",
        "Shorten sessions rather than skipping them outright",
        "Supply falls as demand falls — gradually",
        "A few weeks is a comfortable timeline"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Writing the plan out with actual clock times",
        "Dropping the session with the smallest yield first",
        "Expressing just enough for comfort when it hurt",
        "Adjusting the plan when it turned out to be too fast"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "A hot, red or painful area, or a hard lump",
        "Fever, shivering or feeling flu-like",
        "Pain that's getting worse rather than easing",
        "Any lump that doesn't shift after a day or so"
      ]
    },
    "quick": "Drop one session at a time, hold for several days, and express just enough for comfort in between. Stopping abruptly is what causes blocked ducts."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "pumping-schedule",
    "blocked-duct-or-mastitis",
    "breast-milk-to-formula"
  ],
  "seo": {
    "description": "Reduce pumping gradually, dropping one session at a time, so your body can adjust without painful fullness or blocked ducts."
  },
  "longform": [
    {
      "h": "How the reduction actually works",
      "t": "Supply follows demand, so removing demand reduces supply — but it needs a few days to catch up at each step.\n\nDrop one session. Hold there for three to five days while your body adjusts. Then drop the next.\n\nThe alternative is shortening each session by a few minutes at a time, which some people find gentler. Both work. What doesn't work is stopping several at once, which leaves you overfull, in pain, and at real risk of a blocked duct turning into mastitis."
    },
    {
      "h": "Which one to drop first",
      "t": "The session with the smallest yield, usually. For most people that's mid-afternoon or late evening.\n\nThe first morning session tends to be the biggest and is usually the last to go.\n\nWe went through several versions of the timetable — moving sessions, worrying that one gap was too long, then rearranging everything again. That back-and-forth is normal. Write the times down, try the plan for a few days and change it if it is not working.\n\nIn the end, exhaustion made the decision for us. The first session Mama dropped was the 4am one. It may not be the usual place to start, but getting one stretch of four or five hours' sleep made all the difference at the beginning."
    },
    {
      "h": "Managing the in-between",
      "t": "When you're uncomfortable between sessions, express just enough for comfort rather than emptying fully. Emptying signals your body to make more, which restarts the whole thing.\n\nCool compresses help. So does a well-fitting, non-compressing bra.\n\nDon't bind or wrap the breasts to suppress supply — it's an old piece of advice and it causes blocked ducts.\n\nAnd if a hard lump appears with heat, redness or a fever, that's a same-day call rather than something to push through."
    }
  ],
  "order": 71,
  "batch": "5"
},
{
  "id": "making-up-formula",
  "topic": "feeding",
  "icon": "bottle",
  "featured": false,
  "title": "How do I make up a formula bottle safely?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months",
    "7–9 months"
  ],
  "read": 3,
  "summary": "Formula preparation rules feel fussy until you understand that the powder itself is not sterile.",
  "keywords": [
    "making formula",
    "formula water temperature",
    "storing made up formula",
    "boiled water formula"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Your baby was premature, or has a weakened immune system",
      "You're unsure what temperature your machine uses",
      "You need to make bottles in advance and transport them",
      "You're unsure about your water supply"
    ]
  },
  "panel": {
    "eyebrow": "Feeding • 0–9 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Formula powder is not sterile",
        "Freshly boiled water must still be at least 70°C when it meets the powder",
        "Fresh for each feed is the safest option",
        "Machines vary — check what yours actually does"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Making it fresh rather than storing bottles",
        "Checking what temperature our heating machine really reached",
        "Cooling under a running tap rather than waiting",
        "Asking our baby’s doctor about our specific setup"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Your baby was premature, or has a weakened immune system",
        "You're unsure what temperature your machine uses",
        "You need to make bottles in advance and transport them",
        "You're unsure about your water supply"
      ]
    },
    "quick": "Powder isn't sterile, which is why water temperature matters. Fresh for each feed is safest — and check what your machine actually does rather than assuming."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "sterilising-baby-bottles",
    "storing-expressed-milk",
    "warming-milk-out-and-about"
  ],
  "seo": {
    "description": "Use freshly boiled water and let it cool to reduce bacteria in formula powder, follow the tin exactly and make feeds fresh whenever possible."
  },
  "longform": [
    {
      "h": "Why the rules seem fussy",
      "t": "Because formula powder is not a sterile product. It can contain bacteria, in very small numbers, and the reason official guidance specifies hot water is to deal with that rather than to be difficult.\n\nOnce we understood that, the rest of it made sense — and so did the fact that different countries and different formula heating machines take slightly different approaches to the same problem."
    },
    {
      "h": "The temperature question",
      "t": "We asked this repeatedly, from several angles. Whether to make it with room-temperature water and heat it afterwards, or use water at 37 degrees. Whether 40 degrees was enough. What our machine actually heated to.\n\nThat last one is the useful question. Formula preparation machines vary in what they do, and some do not heat water to the temperature that official guidance specifies. Check the manual for yours, and if it doesn't say clearly, ask.\n\nAnd don't reboil water that's already been boiled once — reboiling concentrates minerals.\n\nFresh for each feed is the safest option, and it's what most guidance recommends.\n\nIf you do need to make bottles ahead — and we did, for going out — that changes the rules. It needs cooling quickly, going into the back of the fridge promptly, and being used within a limited window. Ask your own midwife or baby’s doctor what they'd advise for your situation rather than assuming, because this is one where local guidance genuinely differs.\n\nWhat's consistent everywhere: don't leave a made-up bottle standing warm, don't rewarm one twice, and throw away what's left after a feed rather than keeping it."
    },
    {
      "h": "Getting the mix right",
      "t": "Follow the scoop and water instructions on the tin exactly. Level scoops, not heaped, and the water first.\n\nAdding extra powder to make it richer, or extra water to make it go further, are both genuinely dangerous. That isn't a cautious warning — the concentration matters to her kidneys and her hydration.\n\nAnd if she was premature or has any medical follow-up, check with her doctor before changing anything about how it is made.\n\nFor warming an already-prepared refrigerated bottle, we tried several warmers before settling on the Baby Brezza bottle warmer. The others ran too hot or too cool, and judging the water level felt like another small test nobody had warned us about. Once Ari was drinking fairly regular amounts, we marked the outside of the warmer with different colours for different bottle sizes. It took a few attempts to get the water displacement right, but once the marks were there, warming a bottle became one less thing to calculate while half asleep."
    }
  ],
  "order": 72,
  "batch": "5"
},
{
  "id": "formula-and-constipation",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "Is it normal for my baby not to poo after switching to formula?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 3,
  "summary": "The formula switch can turn every missed poo into a countdown, even when the baby is perfectly comfortable.",
  "keywords": [
    "formula constipation",
    "not pooping after formula",
    "switching formula poop",
    "constipated baby formula"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Hard, dry or pellet-like poo when it comes",
      "Blood in the nappy, or on the outside of the poo",
      "A firm, swollen tummy, or vomiting",
      "She's in obvious pain, or feeding poorly",
      "Your own doctor's limit has been reached — ask what it is"
    ]
  },
  "panel": {
    "eyebrow": "Health • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Formula poo is firmer, darker and less frequent",
        "Gaps often stretch during the switch",
        "Still weeing and passing gas is reassuring",
        "A soft tummy matters more than the number of days"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Checking her tummy was soft rather than counting days",
        "Noticing she was weeing a lot and passing gas",
        "Ringing the baby’s doctor rather than guessing the limit",
        "Gentle tummy massage and asking her doctor before using any gas-relief aid",
        "Slowing the transition down"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Hard, dry or pellet-like poo when it comes",
        "Blood in the nappy, or on the outside of the poo",
        "A firm, swollen tummy, or vomiting",
        "She's in obvious pain, or feeding poorly",
        "Your own doctor's limit has been reached — ask what it is"
      ]
    },
    "quick": "Longer gaps are expected when switching. Soft when it arrives, a soft tummy, and plenty of wet nappies means waiting is reasonable — but get your limit from your own doctor."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "baby-not-pooping",
    "newborn-poo-colours",
    "formula-side-effects"
  ],
  "seo": {
    "description": "Longer gaps and firmer poo can happen after switching to formula; a soft tummy and a comfortable baby are reassuring signs."
  },
  "longform": [
    {
      "h": "Day two, then three, then four",
      "t": "We asked this several times over several days, and the question kept getting more precise. Is it normal on day two with formula. What if she's on day three. What about day four. Do I wait until the end of day four or ring on day five.\n\nWe also asked, quite pointedly, what a five-day figure was even based on. Which was a fair challenge, and the honest answer is that these thresholds are rules of thumb rather than hard science.\n\nWe rang our baby's doctor. She told us that, during the move from breast milk to formula, five or six days without a poo could be okay for Ari as long as she was otherwise well.\n\nThat's her advice for our baby, and it's the version we followed. Which is rather the point — the number that matters is the one your own doctor gives you, not the one you find online.\n\nWhat we'd say to anyone in the same spot: ring and ask what your limit is, before you're at it. Then you're waiting with a plan instead of waiting with a countdown."
    },
    {
      "h": "Why it happens",
      "t": "Breast milk is very efficiently absorbed and leaves little behind. Formula leaves more, and it's digested differently, so poo becomes firmer, darker and usually less frequent.\n\nDuring the change, her tummy is adjusting to both kinds of milk. Poo gaps can stretch before a new pattern settles. Ours was more complicated because Ari kept bringing different formulas back up. Just as she started getting used to one, we had to change it again. Her doctor eventually advised an anti-reflux formula. It was a stressful little loop: new milk, new tummy, new poo pattern, then start again.\n\nThat's a transition effect rather than constipation, and constipation is about what arrives rather than how long it took. Soft is fine, however many days it's been. Hard, dry or pellet-like is not."
    },
    {
      "h": "What told us she was fine",
      "t": "She was weeing a lot. She was passing gas. Her belly was soft. She was eating very well.\n\nAll four of those together made waiting reasonable. Any one of them going the other way — particularly a firm or swollen tummy, or vomiting, or obvious pain — would have changed it.\n\nShe was also very fussy through it, which we assumed was the constipation and was probably just her age. Both things were happening at once, which is usually the case."
    }
  ],
  "order": 73,
  "batch": "5"
},
{
  "id": "formula-side-effects",
  "topic": "feeding",
  "icon": "bottle",
  "featured": false,
  "title": "What changes when my baby starts formula?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 3,
  "summary": "New nappies, more gas and different feeding gaps can all arrive with formula before things settle down.",
  "keywords": [
    "formula side effects",
    "formula gassy",
    "formula fed baby changes",
    "does formula fill baby longer"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "A rash, swelling, or any breathing change after feeds",
      "Forceful vomiting, or blood or mucus in the nappy",
      "Diarrhoea that keeps going, or she seems unwell",
      "She's refusing feeds, or not gaining weight",
      "She was premature, or there's a family history of allergy"
    ]
  },
  "panel": {
    "eyebrow": "Feeding • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Firmer, darker, less frequent nappies",
        "More gas for the first week or two",
        "Often longer between feeds",
        "Some spitting up while she settles into it"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Giving it a fortnight before judging it",
        "Burping her more thoroughly than we had been",
        "Changing one thing at a time",
        "Watching her over days rather than after one feed"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "A rash, swelling, or any breathing change after feeds",
        "Forceful vomiting, or blood or mucus in the nappy",
        "Diarrhoea that keeps going, or she seems unwell",
        "She's refusing feeds, or not gaining weight",
        "She was premature, or there's a family history of allergy"
      ]
    },
    "quick": "Firmer nappies, more gas and longer gaps between feeds are common while she adjusts. Rash, swelling or blood is a different matter."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "formula-and-constipation",
    "choosing-a-formula",
    "breast-milk-to-formula"
  ],
  "seo": {
    "description": "Formula can change nappies, gas and feeding gaps while your baby adjusts; allergy signs and repeated vomiting need separate advice."
  },
  "longform": [
    {
      "h": "How do I know if she's accepted it?",
      "t": "That was the question after the first Kendamil feed, and then again, more insistently: is there really no way to know after one feed?\n\nNo. And that's genuinely the answer rather than an evasion.\n\nAn immediate allergic reaction would show within minutes to an hour — a rash, swelling, breathing changes, forceful vomiting. That you would see. But tolerance, in the ordinary sense of whether it suits her, shows over days rather than at the first bottle."
    },
    {
      "h": "What usually changes",
      "t": "Nappies, most obviously. Firmer, darker, often less frequent. That's the biggest visible difference and it has its own guide, because the gaps can get long enough to be alarming.\n\nMore gas for a week or two while her gut adjusts. It generally settles.\n\nOften longer between feeds — we asked whether formula keeps a baby full for longer, and it does tend to, because it's digested more slowly.\n\nAnd some spitting up while she gets used to it, which usually calms down.\n\nShe spat up milk with foam in it and we wanted to know what that meant.\n\nUsually it's air mixed into the milk — from a fast feed, from shaking the bottle vigorously, or from swallowing air while feeding. Letting a made-up bottle stand for a minute so the bubbles settle helps, and so does slowing the feed down.\n\nOn its own, with a comfortable baby who's gaining, it isn't something to act on."
    },
    {
      "h": "Give it a fortnight",
      "t": "The instinct when a formula seems not to suit is to try another one. We felt it strongly.\n\nBut each switch resets the adjustment period, so a run of changes produces a permanently unsettled baby and no information at all. Two weeks on one formula tells you far more than four days each on three.\n\nThe exceptions are the allergy signs — rash, swelling, breathing changes, blood in the nappy, forceful vomiting. Those don't get a fortnight. Those get a phone call."
    }
  ],
  "order": 74,
  "batch": "5"
},
{
  "id": "yellow-vomit",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "Why was my baby’s vomit yellow?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 2,
  "summary": "‘Yellow’ covers several very different colours, and this is one time when the exact shade genuinely matters.",
  "keywords": [
    "yellow vomit baby",
    "curdled milk vomit",
    "green vomit baby",
    "baby sick after feed"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "lead": "A floppy baby you cannot wake — call your local emergency number now.",
    "items": [
      "True yellow, yellow-green or green vomit",
      "Blood or anything like coffee grounds",
      "Forceful or repeated projectile vomiting",
      "A firm or swollen tummy",
      "Floppy, unusually sleepy or refusing feeds"
    ]
  },
  "panel": {
    "eyebrow": "Health • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Creamy or vanilla-coloured curdled milk",
        "Small amounts that simply roll back out",
        "Thicker spit-up after moving to formula",
        "A comfortable baby who is feeding and growing"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Describing the exact shade rather than saying 'yellow'",
        "Photographing it instead of trying to remember",
        "Noting whether it was forceful or just came back up",
        "Asking about medication doses rather than guessing"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "lead": "A floppy baby you cannot wake — call your local emergency number now.",
      "items": [
        "True yellow, yellow-green or green vomit",
        "Blood or anything like coffee grounds",
        "Forceful or repeated projectile vomiting",
        "A firm or swollen tummy",
        "Floppy, unusually sleepy or refusing feeds"
      ]
    },
    "quick": "Creamy curdled milk can look pale yellow. True yellow, yellow-green or green vomit, blood or repeated forceful vomiting needs urgent medical advice."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "reflux-or-spit-up",
    "feeding-too-fast",
    "is-my-baby-in-pain"
  ],
  "seo": {
    "description": "Curdled milk can look creamy or pale yellow, but true yellow, yellow-green or green vomit in a baby needs urgent medical advice."
  },
  "longform": [
    {
      "h": "Yellow is not one colour",
      "t": "We reported yellow vomit twice, weeks apart, and both times the useful part was the follow-up description.\n\nThe first time: it wasn't forceful, it just all came back out of her mouth like it didn't go down. The second: it was darker curdled milk, not actually yellow — vanilla colour yellow.\n\nThose descriptions changed the answer entirely, and neither of them was the thing we'd been afraid of."
    },
    {
      "h": "Curdled milk",
      "t": "Milk that's been sitting in the stomach meets acid and curdles. When it comes back up it looks creamy, sometimes lumpy, often described as vanilla or cream coloured.\n\nThat can be ordinary when your baby is comfortable, feeding and growing. If you are unsure whether the colour is cream or genuinely yellow, take a photo and ask rather than guessing. Formula spit-up tends to look thicker and more solid than breast milk spit-up, which catches people out after a switch.\n\nWhat matters alongside it is whether she's comfortable, gaining, and otherwise herself."
    },
    {
      "h": "The colour that doesn't wait",
      "t": "True yellow, yellow-green or green vomit is different. That suggests bile, which means something further down, and it needs seeing the same day rather than the next morning.\n\nSo does blood, or anything that looks like coffee grounds. So does forceful, repeated, projectile vomiting — particularly with a firm or swollen tummy, or if she's stopped passing anything.\n\nThat's not a long list, and it's worth knowing it precisely so the rest of it doesn't frighten you.\n\nWe asked about specific doses of things she'd been prescribed — how much, how often, whether an amount was safe.\n\nThat one goes to your doctor or pharmacist, every time, with her current weight. Doses for infants are weight-based and they change as she grows, so a figure that was right a month ago may not be right now.\n\nWe won't put numbers here for that reason. Ring and ask — it takes two minutes and it's the right two minutes."
    }
  ],
  "order": 75,
  "batch": "5"
},
{
  "id": "how-much-sleep-newborn",
  "topic": "sleeping",
  "icon": "moon",
  "featured": false,
  "title": "How much should my baby be sleeping?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 2,
  "summary": "Somewhere around fourteen to seventeen hours across the day, in pieces. Adding it up is harder than anyone admits.",
  "keywords": [
    "newborn sleep hours",
    "how much sleep baby",
    "14 to 17 hours",
    "baby sleep total",
    "sleep needs newborn"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "lead": "Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now.",
    "items": [
      "She's floppy, or you can't wake her properly",
      "She's pale, grey or blue, even briefly",
      "Breathing is fast, laboured, or has pauses",
      "A fever, if she's under three months old"
    ]
  },
  "panel": {
    "eyebrow": "Sleeping • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Roughly fourteen to seventeen hours across the day",
        "Broken into stretches, not one long block",
        "Big variation between babies at the same age",
        "Short wakings in the middle still count as sleep"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Counting across the whole day, not the night alone",
        "Remembering that short wakings inside a stretch still count",
        "Accepting a range instead of chasing a number",
        "Logging roughly, not to the minute",
        "Leaving a well baby asleep instead of checking on her"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "lead": "Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now.",
      "items": [
        "She's floppy, or you can't wake her properly",
        "She's pale, grey or blue, even briefly",
        "Breathing is fast, laboured, or has pauses",
        "A fever, if she's under three months old"
      ]
    },
    "quick": "Most newborns sleep for about fourteen to seventeen hours across the whole day. Count naps too, and look at feeding, wet nappies and alertness rather than chasing one exact number."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "when-do-they-sleep-through",
    "short-naps-long-nights",
    "sleeping-more-than-usual"
  ],
  "seo": {
    "description": "Newborns often sleep for fourteen to seventeen hours in short stretches; feeding, wet nappies and alertness matter more than one exact total."
  },
  "longform": [
    {
      "h": "The counting problem",
      "t": "We asked how to calculate how much she was sleeping, and then immediately hit the complication: she wakes up with discomfort partway through, settles, and goes back to sleep. Does that stretch count as one sleep or two?\n\nIt counts. Brief wakings inside a longer stretch are normal and they don't reset the clock. If you only count unbroken blocks you'll end up with a total that looks alarming and isn't.\n\nAri at the beginning was only sleeping between 11 and 13 hours a day. We asked her doctor, and whilst it was on the lower side, she had wet diapers, was alert, and was eating and gaining well, she told us its ok. More hours awake so more work for us, but it was ok."
    },
    {
      "h": "The range is wide on purpose",
      "t": "Fourteen to seventeen hours in twenty-four is the usual figure for a newborn, and the range is that broad because babies genuinely differ.\n\nWe asked whether around fourteen to sixteen hours was all right, and it was. We also asked whether that changed because she was premature and weighed three kilos, and the honest answer is that a premature baby often sleeps more, and that her feeding pattern matters more than her sleep total.\n\nThe number is a guide, not a target. You can't make her hit it and you shouldn't try."
    },
    {
      "h": "What we watched instead",
      "t": "Whether she was alert and responsive when awake. Whether she was feeding well. Whether the nappies were keeping up.\n\nA baby sleeping at the lower end who is bright, feeding and gaining is fine. A baby at the higher end who is hard to wake and missing feeds is not — and that's a different conversation, particularly if she was born early.\n\nThe total matters less than those other signs and it's the one everyone counts."
    }
  ],
  "order": 76,
  "batch": "6"
},
{
  "id": "she-wont-sleep-at-all",
  "topic": "sleeping",
  "icon": "moon",
  "featured": false,
  "title": "Why won't my baby sleep? Is she just not tired?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 4,
  "summary": "Almost never. A baby who won't go down is usually past the point where she could, not short of the point where she'd need to.",
  "keywords": [
    "baby won't sleep",
    "overtired baby",
    "not sleepy",
    "baby fighting sleep",
    "can't settle baby"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "lead": "A floppy baby you cannot wake — call your local emergency number now.",
    "items": [
      "The cry is high-pitched, weak, or unlike her usual cry",
      "She's unable to stop crying for hours and nothing reaches her",
      "A fever, if she's under three months old",
      "She's floppy, or refusing feeds entirely",
      "You feel close to your limit — put her down safely and ring someone now"
    ]
  },
  "panel": {
    "eyebrow": "Sleeping • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Overtiredness looks exactly like not being tired",
        "Newborns can't stay awake long before it turns",
        "Evenings are harder than the rest of the day",
        "Some days simply go badly"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Going earlier than felt right, before the window shut",
        "Dark room and continuous white noise",
        "Go through the list: is she hungry, has she pooped, simply overtired (check when she last slept if you keeping a journal), useful when both parents are hands on. You know whats happening without asking the other parent.",
        "Movement — carrying, rocking, the pram",
        "Sticking with one approach instead of trying six in ten minutes",
        "Handing over before either of us reached the end"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "lead": "A floppy baby you cannot wake — call your local emergency number now.",
      "items": [
        "The cry is high-pitched, weak, or unlike her usual cry",
        "She's unable to stop crying for hours and nothing reaches her",
        "A fever, if she's under three months old",
        "She's floppy, or refusing feeds entirely",
        "You feel close to your limit — put her down safely and ring someone now"
      ]
    },
    "quick": "A baby who will not settle is often overtired, not wide awake. Try starting earlier, keeping the room dark and handing over before you reach your limit."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "wont-nap",
    "it-was-the-nappy",
    "building-a-sleep-schedule"
  ],
  "seo": {
    "description": "A baby who fights sleep may be overtired rather than wide awake; learn the early signs and what can make settling easier."
  },
  "longform": [
    {
      "h": "Is it possible she's simply not sleepy?",
      "t": "That was our question, on a day she'd barely slept since nine in the morning. She was feeding well and completely awake, and it seemed reasonable to conclude she just didn't need it.\n\nShe did need sleep. We had simply missed the easy settling window, and by then her whole body was on high alert."
    },
    {
      "h": "Overtired looks like wide awake",
      "t": "This is the strange bit and it catches everyone. Past a certain point, a tired baby doesn't get sleepier — she gets wired. Alert, jerky, hard to settle, and furious about all of it.\n\nSo the evidence you're reading as \"not tired\" is often the evidence that she's badly overtired.\n\nThe fix isn't more awake time. It's going earlier next time, at the first yawn or glazed stare rather than at the point where she's arching and crying."
    },
    {
      "h": "What happens if she doesn't sleep",
      "t": "We asked this directly, and the answer was less frightening than the question felt.\n\nA baby who has a bad day catches up. Sleep debt gets repaid, usually that night or the following day. One bad sleep day does not mean you have harmed her.\n\nWhat it does mean is that the following few hours will be harder, and that an earlier bedtime is the correct response rather than a later one.\n\nAn hour in a dark room with white noise. Picking her up made her cry harder. A breastfeed lasted two minutes and changed nothing.\n\nAt that point we asked whether we should just let her cry until she passed out. The honest answer for a baby that young is no — leaving a newborn to cry it out isn't appropriate, and it doesn't work anyway. We obviously didn’t want to do this but we were at nerves end, and had no idea what else to do.\n\nWhat we should have done, and eventually did, was swap over. One person at the end of their patience with an unable to stop crying baby is a much worse combination than a fresh person with the same baby. Handing over isn't giving up.\n\nGo through a list, have it printed if necessary. You are tired, you probably have checked the diapers 16 times that day, and then the moment you haven’t is the time you should have. It always happens. We had a mental list, check when she last ate, her diaper, when she last woke up and when she last played. Once we got that we had a clear idea of what to do next.\n\nPapa always did the exact same thing. The NICU nurses and doctors taught him so many ways to carry the baby, and yet, he was always comfortable holding Ari only one way. It became the way to put Ari to sleep. Feed her always the same way, rock her always the same way, put her to sleep always the same way. Sometimes, rather than adapting and learning all possible ways, if there is one you are really comfortable with mastering that is much better than knowing 5 different ways to hold her. Mama learnt all the others. As a team it worked.\n\nAnd there's a guide next to this one about what we found when we finally checked the nappy."
    }
  ],
  "order": 77,
  "batch": "6"
},
{
  "id": "it-was-the-nappy",
  "topic": "sleeping",
  "icon": "moon",
  "featured": false,
  "title": "Could my baby's nappy be stopping her from settling?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 3,
  "summary": "Before the dark room and white noise, run the simple checklist. Very often, something physical is bothering her.",
  "keywords": [
    "baby crying nappy",
    "nappy too small",
    "why is baby crying",
    "checklist crying baby",
    "uncomfortable baby"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "A hair or thread is wrapped tightly around a finger or toe",
      "Swelling, or a tender spot she reacts sharply to",
      "She's unable to stop crying for hours and nothing reaches her",
      "A fever, if she's under three months old"
    ]
  },
  "panel": {
    "eyebrow": "Sleeping • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Physical discomfort is the commonest cause",
        "A nappy a size too small presses and rubs",
        "Labels, seams and a twisted sleeve all count",
        "Too warm is more common than too cold"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Running the physical checks before the settling routine",
        "Taking the nappy off entirely to test it",
        "Checking the size each time she moved up a weight band",
        "Feeling for a damp vest, not just looking",
        "Undressing her completely when nothing else worked"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "A hair or thread is wrapped tightly around a finger or toe",
        "Swelling, or a tender spot she reacts sharply to",
        "She's unable to stop crying for hours and nothing reaches her",
        "A fever, if she's under three months old"
      ]
    },
    "quick": "Check the simple physical things first: the nappy, seams, labels, temperature and even a hair around a toe. Sometimes the smallest thing is the whole problem."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "nappy-changes-at-night",
    "she-wont-sleep-at-all",
    "nappy-rash"
  ],
  "seo": {
    "description": "A wet, tight or uncomfortable nappy can keep a tired baby awake; this simple checklist helps you rule out the physical things first."
  },
  "longform": [
    {
      "h": "What actually happened",
      "t": "She was crying because she was tired and wouldn't sleep. We'd fed her fifteen minutes earlier. We tried everything suggested and none of it worked.\n\nThen: her crying stopped as soon as I took off her nappy.\n\nAnd the follow-up question, which was the right one — is it possible the nappies are too small?\n\nThey were."
    },
    {
      "h": "Why this is worth its own guide",
      "t": "Because the entire internet sends you towards technique. Dark room, white noise, swaddle, rocking, wake windows.\n\nAll of that is useful and none of it will work on a baby who is physically uncomfortable. We spent an hour applying sleep advice to a problem that was solved by a different sized nappy.\n\nSo the order is wrong in most of what you'll read. Physical first, technique second."
    },
    {
      "h": "The checklist we now run first",
      "t": "Nappy — not just wet or dirty, but the fit. Too tight at the waist or legs, red marks, or a size she's outgrown. Babies move up sizes faster than you'd think and the packet weight ranges are generous.\n\nTemperature — feel her chest or the back of her neck, not her hands. Too warm is more common than too cold.\n\nClothing — a label scratching, a seam under her back, a sleeve twisted, a popper done up wrong.\n\nA hair or thread wrapped around a finger or toe. It sounds far-fetched and it genuinely happens, and it's painful.\n\nAnd trapped air, which is worth checking by burping her before trying another sleep trick.\n\nIf none of those, undress her completely and look at all of her. It takes two minutes and it has ended more evenings than any technique we know.\n\nA baby who can't tell you what's wrong will use the same cry for all of it.\n\nThe cry cannot tell you exactly what is wrong, but the order of your checks can help. Start with what you can see and feel, then try the settling routine.\n\nWe've lost whole evenings to this. It is the single most practical thing in this batch."
    }
  ],
  "order": 78,
  "batch": "6"
},
{
  "id": "putting-her-down-awake",
  "topic": "sleeping",
  "icon": "moon",
  "featured": false,
  "title": "How can I put my sleeping baby down without waking her?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 3,
  "summary": "The transfer is where it usually falls apart. Slow, feet first, and hands on for a few seconds afterwards.",
  "keywords": [
    "putting baby down",
    "transfer to cot",
    "baby wakes when put down",
    "drowsy but awake",
    "settling baby"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "lead": "Blue or grey, a pause in breathing, or a floppy baby you cannot wake — call your local emergency number now.",
    "items": [
      "Her breathing changes or pauses when you lay her down",
      "She goes pale, grey or blue",
      "She's floppy, or very hard to wake",
      "She's unable to stop crying for hours in a way that isn't her usual"
    ]
  },
  "panel": {
    "eyebrow": "Sleeping • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Waking on the way down is extremely common, moro reflex",
        "Deep sleep takes a while to arrive",
        "Being put down is a change she can feel",
        "Drowsy but awake works better over time than asleep in arms"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Waiting for limp arms rather than closed eyes, usually pacifier out of mouth followed.",
        "Going down bottom and feet first, head last",
        "Keeping a hand on her chest for a few seconds after (this one is key)",
        "Warming the sheet with a hand beforehand"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "lead": "Blue or grey, a pause in breathing, or a floppy baby you cannot wake — call your local emergency number now.",
      "items": [
        "Her breathing changes or pauses when you lay her down",
        "She goes pale, grey or blue",
        "She's floppy, or very hard to wake",
        "She's unable to stop crying for hours in a way that isn't her usual"
      ]
    },
    "quick": "Wait until her arms feel heavy, lower her bottom and feet first, then keep a hand on her chest for a moment. The transfer is often the hardest part."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "she-wakes-herself-up",
    "safe-sleep-newborn",
    "swaddling"
  ],
  "seo": {
    "description": "Waiting for deeper sleep and lowering your baby gently can make cot transfers easier without starting the whole settling routine again."
  },
  "longform": [
    {
      "h": "Asleep in your arms, awake in the cot",
      "t": "We asked about skills for putting a baby to sleep, and most of the answer turned out to be about the last twenty seconds rather than the previous twenty minutes.\n\nGetting her to sleep was rarely the problem. Getting her from us to the mattress without her noticing was."
    },
    {
      "h": "Wait longer than you think",
      "t": "Eyes closing isn't asleep. Early sleep is light and easily interrupted, and moving her at that point almost guarantees starting over.\n\nThe test we used: shuffle a bit, if she barely moved she was deeply asleep. If her head moved side to side even with eyes closed, wait.\n\nUsually it's another five to ten minutes beyond the point where she looks asleep. Those minutes feel unbearable and they save you the next half hour."
    },
    {
      "h": "How to go down",
      "t": "Bottom and feet first, head last. Lowering head first triggers the startle/moro reflex — she feels like she's falling backwards, and everything in her responds.\n\nKeep her close as you go down, then hold a hand on her chest for a few seconds once she's on the mattress. That pause is doing real work; letting go immediately is what often wakes her.\n\nWarm the sheet with your hand first. A cold surface against a warm baby is a very effective alarm clock.\n\nPutting her down sleepy rather than fully asleep is the thing that eventually makes all of this easier, because she learns the last bit herself. This however, is for later, after the first month.\n\nIt doesn't need to be every time. Once a day is enough to build it, and there's no obligation to do it at three in the morning when you just want the night back.\n\nAnd the sleep rules don't move for any of this. Flat, on her back, firm mattress, nothing in the cot."
    }
  ],
  "order": 79,
  "batch": "6"
},
{
  "id": "she-wakes-herself-up",
  "topic": "sleeping",
  "icon": "moon",
  "featured": false,
  "title": "Why does my baby suddenly open her eyes while sleeping?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 3,
  "summary": "Usually the startle reflex or the end of a sleep cycle. Both settle with time, and both have something you can do meanwhile.",
  "keywords": [
    "baby wakes herself",
    "startle reflex sleep",
    "eyes open sleeping",
    "short sleep cycles",
    "baby jolts awake"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "lead": "Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now.",
    "items": [
      "Rhythmic movement that doesn't stop when you hold the limb",
      "She goes pale, grey or blue, even briefly",
      "She's very hard to wake afterwards",
      "Breathing pauses, or breathing that looks like hard work",
      "She's floppy, or unusually unresponsive"
    ]
  },
  "panel": {
    "eyebrow": "Sleeping • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "The startle reflex jolting her awake",
        "Surfacing at the end of a sleep cycle",
        "Eyes opening briefly during light sleep",
        "Fades over the first few months"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "The love to dream swaddle was very useful",
        "Stopping the swaddle at the first sign of rolling",
        "Being in the room before she surfaced",
        "Waiting rather than reacting to the first flutter. Many times she would open eyes, look like she was awake and then close the eyes.",
        "A sleeping bag once the swaddle stopped"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "lead": "Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now.",
      "items": [
        "Rhythmic movement that doesn't stop when you hold the limb",
        "She goes pale, grey or blue, even briefly",
        "She's very hard to wake afterwards",
        "Breathing pauses, or breathing that looks like hard work",
        "She's floppy, or unusually unresponsive"
      ]
    },
    "quick": "This is usually the startle reflex or a normal change between sleep cycles. A safe swaddle in the early months and waiting a moment can help."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "newborn-noises-at-night",
    "putting-her-down-awake",
    "newborn-trembles-and-jerks"
  ],
  "seo": {
    "description": "The startle reflex and normal sleep cycles can make a baby suddenly open her eyes; learn what usually helps and when to ask for advice."
  },
  "longform": [
    {
      "h": "She seems to wake herself up",
      "t": "That was our description and it was a good one. Not stirring, not fussing — asleep, and then suddenly eyes wide open and properly awake.\n\nTwo things cause most of it, and they're worth telling apart because they need different responses."
    },
    {
      "h": "The startle/moro reflex",
      "t": "Arms fling out, then back in. It's a newborn reflex, it happens at the slightest change, and it is extremely good at waking a baby who was almost asleep.\n\nA snug swaddle around the arms helps a great deal while she still needs it. Hips loose, arms firm — the hips part matters, and there's a whole guide on getting that right.\n\nIt fades over the first months on its own. Until then it's the commonest reason a perfectly settled baby is suddenly awake and cross."
    },
    {
      "h": "Surfacing between cycles",
      "t": "Sleep comes in cycles, and at the end of each one she comes up close to waking. Adults do this too and roll over without noticing.\n\nA young baby often opens her eyes, looks around, and then either goes back down or decides she's up. That's why naps so often end at around forty minutes — it's one cycle.\n\nPapa kept getting this wrong at the beginning. He was always in alert mode, so the moment he would see Ari eyes open, he would be like, ok shes awake time to go. More often than not, Ari was actually moving to another sleep cycle, and when Papa intervened would infact wake her up and then she would start to cry. Most of the times, don’t be impulsive. Wait. Shes probably transitioning.\n\nIf you can be in the room just before she surfaces, a hand on her chest at the first stir often carries her through into the next cycle. That only works if you're there before she's fully awake, which means knowing roughly how long her cycles run.\n\nOrdinary jolts stop if you gently hold the limb. Rhythmic, repetitive movement that carries on regardless, especially with a blank stare or a change in colour, is different and needs urgent assessment.\n\nWe've written that check up properly in its own guide. It takes a few seconds and it's worth knowing before you need it."
    }
  ],
  "order": 80,
  "batch": "6"
},
{
  "id": "six-hour-stretch",
  "topic": "sleeping",
  "icon": "moon",
  "featured": false,
  "title": "My baby slept for six hours. Should I have woken her?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 3,
  "summary": "Once she's gaining steadily and past the early weeks, usually not. Before that, and for a premature baby, the answer changes.",
  "keywords": [
    "long stretch at night",
    "should I wake baby to feed",
    "6 hours sleep newborn",
    "sleeping through feeds"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "lead": "Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now.",
    "items": [
      "You can't wake her for a feed at all",
      "She's floppy, pale or grey",
      "Breathing is fast, laboured, or has pauses",
      "A fever, if she's under three months old"
    ]
  },
  "panel": {
    "eyebrow": "Sleeping • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Longer stretches appear as she grows",
        "Gaining weight steadily is the key condition",
        "Night stretches lengthen before daytime naps do",
        "Waking to feed is for a reason, not a rule"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Asking her paediatrician where our limit was",
        "Watching the weekly weight rather than each night",
        "Counting the day's total feeds, not the size of the gap",
        "Keeping to her feeding plan while she was still on one",
        "Letting her sleep once we'd been told it was fine"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "lead": "Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now.",
      "items": [
        "You can't wake her for a feed at all",
        "She's floppy, pale or grey",
        "Breathing is fast, laboured, or has pauses",
        "A fever, if she's under three months old"
      ]
    },
    "quick": "If she is feeding and growing well and is past the early weeks, a long sleep is usually a gift. If she has a feeding plan, follow that instead."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "when-do-they-sleep-through",
    "sleeping-more-than-usual",
    "how-much-sleep-newborn"
  ],
  "seo": {
    "description": "A six-hour sleep can be fine once a baby is feeding and growing well, but babies on a feeding plan may still need to be woken."
  },
  "longform": [
    {
      "h": "The question nobody answers cleanly",
      "t": "Is it all right for a newborn to sleep a six-hour stretch at night if she's gaining weight regularly.\n\nWe gave her doctor the full picture: she was around 4kg, about three weeks corrected and born at 33 weeks. Those details changed the answer, which is why one general rule did not work."
    },
    {
      "h": "What the answer hangs on",
      "t": "Weight gain, first. A baby who is gaining steadily is getting enough across the day, and where those calories arrive in the twenty-four hours matters less.\n\nHow far past the early weeks she is. In the first fortnight, and while regaining birth weight, regular feeding is the priority and waking is often advised.\n\nAnd whether she's under a feeding plan. Ours had been, and a plan overrides everything in this guide. If you've been told to feed every three hours, that instruction stands until the person who gave it changes it.\n\nFor us, with steady gain and a paediatrician who was following her, the long stretch was fine."
    },
    {
      "h": "Night before day",
      "t": "One thing surprised us: longer night sleep often comes before longer daytime naps.\n\nSo a baby who sleeps six hours at night and then refuses to nap for more than an hour in the day isn't confused — she's doing it in the order it normally happens.\n\nWe asked whether it was too soon for her to have figured out nights, and whether it meant something. It doesn't mean anything beyond her body clock starting to sort itself out, which is exactly what you want.\n\nTotal feeds across the day, rather than the size of the gap. If the day's intake holds up, a long night is just a long night.\n\nWet nappies.\n\nAnd whether she woke herself when hungry, which ours usually did. That was another useful sign that her appetite was doing its job.\n\nIf you're unsure, ring and ask where your own limit is — before you're lying awake at four in the morning doing arithmetic. Papa did this very often."
    }
  ],
  "order": 81,
  "batch": "6"
},
{
  "id": "short-naps-long-nights",
  "topic": "sleeping",
  "icon": "moon",
  "featured": false,
  "title": "Why does my baby nap briefly but sleep for hours at night?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 2,
  "summary": "It is not backwards. Longer night sleep often comes first, while daytime naps stay short for a while.",
  "keywords": [
    "short naps",
    "forty minute nap",
    "day sleep vs night sleep",
    "baby naps badly",
    "sleep cycles"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "lead": "Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now.",
    "items": [
      "She's floppy, or very hard to wake",
      "She's pale, grey or blue",
      "Breathing is fast, laboured, or has pauses",
      "A fever, if she's under three months old"
    ]
  },
  "panel": {
    "eyebrow": "Sleeping • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Night sleep often lengthens before daytime naps",
        "Forty-minute naps are one full sleep cycle",
        "Daytime is brighter, noisier and more interesting",
        "Naps lengthen gradually over months"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Treating short naps as normal rather than a fault",
        "Darkening the room for day sleeps too",
        "Going earlier when the wake window had clearly stretched",
        "Leaving night sleep alone rather than capping it",
        "Judging her by how she was awake, not by nap length"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "lead": "Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now.",
      "items": [
        "She's floppy, or very hard to wake",
        "She's pale, grey or blue",
        "Breathing is fast, laboured, or has pauses",
        "A fever, if she's under three months old"
      ]
    },
    "quick": "Night sleep often lengthens before daytime naps do. A forty-minute nap can be one complete sleep cycle, even when it feels far too short."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "wont-nap",
    "how-much-sleep-newborn",
    "building-a-sleep-schedule"
  ],
  "seo": {
    "description": "Short daytime naps and longer night stretches can be normal because night sleep often settles before daytime sleep does."
  },
  "longform": [
    {
      "h": "It looked the wrong way round",
      "t": "One month and a week corrected, sleeping no more than an hour at a time during the day but going six hours straight at night.\n\nWe assumed we'd got something backwards. She was alert during the day, not cranky, and gaining weight — and still it felt like a problem that needed solving."
    },
    {
      "h": "That's the usual order",
      "t": "Night sleep often stretches out first. Daytime naps may take much longer.\n\nSo a baby with long nights and short days isn't confused. She's ahead on the harder half of it.\n\nThe daytime is also working against her. Light, noise, people, things to look at, and a body clock that is designed to keep her more alert when it's bright. A forty-minute nap is one complete sleep cycle, and surfacing at the end of it into a bright interesting room is a perfectly reasonable decision on her part."
    },
    {
      "h": "What we tried, and what was worth it",
      "t": "Darkening the room for daytime naps helped a little. So did noticing when the wake window had clearly stretched too long — short naps often follow a baby who went down overtired.\n\nWhat didn't help, and made things worse, was keeping her up longer hoping she'd sleep more deeply.\n\nWe never shortened her night sleep to try to force more daytime naps. That usually makes a tired baby even more tired.\n\nWhen we lined up the actual evidence rather than the feeling. Alert when awake. Not cranky. Feeding well. Gaining.\n\nThat combination means the sleep is working, whatever shape it's in.\n\nNaps do lengthen — slowly, unevenly, and usually around the time you've stopped expecting them to."
    }
  ],
  "order": 82,
  "batch": "6"
},
{
  "id": "sleeping-through-noise",
  "topic": "sleeping",
  "icon": "moon",
  "featured": false,
  "title": "Why does my baby sleep through every noise?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 3,
  "summary": "Probably not, and that's development rather than a habit you broke. Consistent background noise is more useful than silence.",
  "keywords": [
    "baby sleeps through noise",
    "white noise",
    "tiptoeing around baby",
    "noisy house baby sleep"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "lead": "Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now.",
    "items": [
      "She goes floppy or unresponsive",
      "She's pale, grey or blue",
      "Breathing pauses, or looks like hard work",
      "A fever, if she's under three months old"
    ]
  },
  "panel": {
    "eyebrow": "Sleeping • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Newborns can sleep through a lot of noise",
        "Sensitivity to noise increases over the first months",
        "Deeper newborn sleep gives way to more cycling",
        "Consistent background noise beats silence"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Carrying on normally rather than tiptoeing",
        "Continuous white noise instead of a track that times out",
        "Keeping it across the room and at a sensible volume",
        "Using the same sound at home and away"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "lead": "Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now.",
      "items": [
        "She goes floppy or unresponsive",
        "She's pale, grey or blue",
        "Breathing pauses, or looks like hard work",
        "A fever, if she's under three months old"
      ]
    },
    "quick": "Newborns can sleep through an impressive amount of noise, but that often changes. Steady background sound is easier to live with than trying to keep the whole house silent."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "she-wakes-herself-up",
    "how-much-sleep-newborn",
    "newborn-noises-at-night"
  ],
  "seo": {
    "description": "Many newborns sleep through noise at first; learn why that changes and how steady background sound may help later."
  },
  "longform": [
    {
      "h": "A doctor told us it changes after the first month",
      "t": "She slept through everything — conversation, television, doors, the lot. And we were told it wouldn't last past the first month or so. It was lovely.\n\nThat's broadly right, and the reason is development rather than anything you do."
    },
    {
      "h": "Why it changes",
      "t": "Newborn sleep is deep and less organised, so a young baby can ignore a surprising amount of noise. As she grows, she spends more time in lighter sleep and notices more around her.\n\nSo a baby who becomes noise-sensitive at two months hasn't been spoiled by quiet, and one who stays unbothered hasn't been toughened up. Both are ordinary.\n\nIt also means the window where you can hoover next to a sleeping baby is finite, and worth enjoying."
    },
    {
      "h": "What we'd do from the start",
      "t": "Carry on normally. Don't build a silent house you'll then have to maintain, because you won't be able to.\n\nUse consistent background noise rather than silence. White noise, a fan, or just the ordinary sound of a household. It masks the sudden noises — a door, a dog, a delivery — which are what actually wake babies, rather than steady sound.\n\nIf you use a machine, one that runs continuously rather than stopping after fifteen minutes. A track that cuts out mid-nap is worse than no track at all. Papa was putting Ari to bed, she was about to sleep, he had everything ready, it had taken him 30 minutes to put her to sleep this time, and the moment she was just about to nod off the white nosie machine stopped. Ari woke up. Papa had forgotten to change the setting to continuous and he had to start all over again.\n\nAnd keep it at a sensible volume, across the room rather than beside her head.\n\nA baby who sleeps through everything is almost always just a good sleeper.\n\nBut if she never startles at a sudden loud sound, or doesn't turn towards your voice as she gets older, that's worth mentioning — particularly if she was premature or spent time in neonatal care and you're not certain her hearing has been formally checked.\n\nIt's a two-minute question and it's better asked than assumed."
    }
  ],
  "order": 83,
  "batch": "6"
},
{
  "id": "when-to-worry-she-wont-wake",
  "topic": "sleeping",
  "icon": "moon",
  "featured": false,
  "title": "My baby won't wake up. When should I worry?",
  "ages": [
    "0–1 month",
    "2–3 months"
  ],
  "read": 2,
  "summary": "A long sleep in a well baby is fine. Difficult to wake is a different thing entirely, and it's the distinction that matters.",
  "keywords": [
    "baby won't wake",
    "hard to rouse",
    "sleepy baby concern",
    "unresponsive baby",
    "when to worry sleepy"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "lead": "Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now.",
    "items": [
      "She's floppy, or doesn't wake fully when you try",
      "She's pale, mottled, blue or grey",
      "Breathing is fast, laboured, or has pauses",
      "She's unusually cool or hot to touch",
      "A fever, if she's under three months old"
    ]
  },
  "panel": {
    "eyebrow": "Sleeping • 0–3 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Long sleeps after a busy day, or a growth spurt",
        "Sleepy after vaccinations for a day or so",
        "Waking slowly but fully when you try",
        "Alert and feeding normally once awake"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Trying properly to wake her before deciding anything",
        "Checking colour, breathing and temperature together",
        "Noting when she last fed and last had a wet nappy",
        "Looking at the whole baby rather than the thermometer"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "lead": "Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now.",
      "items": [
        "She's floppy, or doesn't wake fully when you try",
        "She's pale, mottled, blue or grey",
        "Breathing is fast, laboured, or has pauses",
        "She's unusually cool or hot to touch",
        "A fever, if she's under three months old"
      ]
    },
    "quick": "A long sleep can be fine if she wakes fully and feeds well. If she is hard to wake, floppy, pale or missing feeds, get medical help now."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "sleeping-more-than-usual",
    "six-hour-stretch",
    "how-much-sleep-newborn"
  ],
  "seo": {
    "description": "Long sleep can be normal, but a baby who is hard to wake, floppy, pale or missing feeds needs urgent medical advice."
  },
  "longform": [
    {
      "h": "The question worth asking properly",
      "t": "When should I be worried that she isn't waking up.\n\nIt's a good question and it has a clean answer, which is unusual. The answer isn't about how long she's slept. It's about what happens when you try to wake her."
    },
    {
      "h": "Sleepy versus difficult to wake",
      "t": "A sleepy baby takes some getting going. Unwrap her, change her nappy, talk to her, a hand on her chest — and she comes round, opens her eyes, and is properly there. She might be cross about it. That's fine.\n\nA baby who is difficult to wake doesn't come round properly. She stays limp, doesn't focus, doesn't respond, or drifts straight back regardless of what you do.\n\nThose two look similar for the first ten seconds and they are not the same thing at all. The second one is a call, whatever time it is."
    },
    {
      "h": "What to check while you're trying",
      "t": "Colour — around the lips especially. Pale, mottled, blue or grey is urgent.\n\nBreathing — fast, laboured, or pausing.\n\nTemperature, and whether she feels unusually cool or hot.\n\nWhen she last fed, and when the last wet nappy was.\n\nMuscle tone. A floppy baby feels different in your hands and you'll know it if you feel it.\n\nIf she wakes fully, feeds, and is herself — a long sleep is a long sleep, and you're allowed to enjoy it.\n\nIf anything in the list above feels wrong, call. Out-of-hours services are there for the parent standing over a cot at 2am, unsure whether this is normal.\n\nAnd if she was premature, the threshold is lower. A sleepy preemie who quietly misses feeds is a real situation rather than a theoretical one."
    }
  ],
  "order": 84,
  "batch": "6"
},
{
  "id": "when-do-they-sleep-through",
  "topic": "sleeping",
  "icon": "moon",
  "featured": false,
  "title": "When will my baby sleep through the night?",
  "ages": [
    "2–3 months",
    "4–6 months",
    "7–9 months",
    "10–12 months"
  ],
  "read": 3,
  "summary": "Later than you've been told, and less neatly. The definition most people are using isn't the one they mean.",
  "keywords": [
    "sleeping through the night",
    "when do babies sleep through",
    "10 hours straight",
    "night waking age"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "lead": "Blue or grey, or a floppy baby you cannot wake — call your local emergency number now.",
    "items": [
      "Gasping, choking, or pauses in her breathing at night",
      "She goes pale, grey or blue",
      "She's floppy, or very hard to wake",
      "Any thoughts of harming yourself or her — ring your doctor or a crisis line now"
    ]
  },
  "panel": {
    "eyebrow": "Sleeping • 2–12 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Longer stretches build gradually over months",
        "Many babies still wake at a year and that's normal",
        "It isn't linear — it goes backwards regularly",
        "'Sleeping through' often means five or six hours, not twelve"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Dropping the expectation of a date",
        "Measuring progress in months rather than nights",
        "Expecting illness and teeth to reset it",
        "Protecting one adult's sleep rather than both",
        "Ignoring other people's accounts of their own babies"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "lead": "Blue or grey, or a floppy baby you cannot wake — call your local emergency number now.",
      "items": [
        "Gasping, choking, or pauses in her breathing at night",
        "She goes pale, grey or blue",
        "She's floppy, or very hard to wake",
        "Any thoughts of harming yourself or her — ring your doctor or a crisis line now"
      ]
    },
    "quick": "Longer stretches arrive slowly, not on one magic date. When people say a baby sleeps through, they often mean five or six hours, not the whole night."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "sleep-regression",
    "early-waking",
    "how-much-sleep-newborn"
  ],
  "seo": {
    "description": "Sleeping through the night usually develops slowly, and often means five or six hours rather than a full ten-hour night."
  },
  "longform": [
    {
      "h": "How long before ten hours straight?",
      "t": "That was the question, followed by: so nine months to sleep twelve hours straight?\n\nThe honest answer is that there isn't a date, and that the question contains an assumption worth unpicking first.\n\nPapa had heard of the 4 months sleep regression. He was prepared for it, little did he know that there was a 6 months sleep regression and an 8 months sleep regression too. Noone told him that. It seemed for the little we had moved forward, it was all crashing back. All normal."
    },
    {
      "h": "What 'sleeping through' actually means",
      "t": "In most of the research it means around five or six consecutive hours. Not twelve. Not from seven in the evening to seven in the morning.\n\nSo when somebody tells you their baby slept through at eight weeks, they may well mean six hours, which is a very different claim from the one you heard.\n\nThat mismatch causes an enormous amount of unnecessary despair, and it's worth knowing before you compare yourself to anybody."
    },
    {
      "h": "The rough shape",
      "t": "Stretches lengthen over the first year. Some babies reach long unbroken nights in the middle of the first year, and a substantial proportion still wake at twelve months and beyond.\n\nAri at 14 months still wakes up middle of the night to feed.\n\nBoth of those are normal. Night waking at a year isn't a failure of method.\n\nIt also does not improve in a straight line. Illness, teething, a new skill (a lot of these happen in the first two years, rolling, learning how to sit, learning how to crawl, b ababing, learning how to eat, walk, talk), travel or a house move can interrupt a good run. Sleep often settles again afterwards.\n\nProtecting one adult's sleep rather than both of ours being wrecked. Splitting the night into shifts so somebody got four unbroken hours.\n\nAnd giving up on the date. Once we stopped asking when and started assuming it would take months, it became something to manage rather than something to be failing at.\n\nIf her sleep changes suddenly and stays that way, or there is snoring, gasping or breathing pauses, speak to her doctor. Ordinary night waking is different."
    }
  ],
  "order": 85,
  "batch": "6"
},
{
  "id": "sleep-and-the-premature-baby",
  "topic": "sleeping",
  "icon": "moon",
  "featured": false,
  "title": "For a premature baby, does sleep or feeding matter more?",
  "ages": [
    "0–1 month",
    "2–3 months"
  ],
  "read": 3,
  "summary": "Early on, feeding wins, and that's not a close call. Later it flips — and knowing when is a question for her baby's doctor or NICU nurse.",
  "keywords": [
    "premature baby sleep",
    "wake preemie to feed",
    "preterm sleep needs",
    "corrected age sleep"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "lead": "Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now.",
    "items": [
      "You can't wake her for a feed at all",
      "Her breathing pauses, or looks like hard work",
      "She's pale, grey or blue",
      "She's floppy, or unusually unresponsive",
      "A fever, at any point in the first three months"
    ]
  },
  "panel": {
    "eyebrow": "Sleeping • 0–3 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Premature babies sleep more than term babies",
        "They also tire quickly during feeds",
        "Early on, feeding takes priority over uninterrupted sleep",
        "Corrected age is what sleep expectations follow"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Following the feeding plan over any sleep advice",
        "Using corrected age for everything we read",
        "Waking her when the plan said to, without guilt",
        "Asking her baby's doctor or NICU nurse when we could stop waking her"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "lead": "Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now.",
      "items": [
        "You can't wake her for a feed at all",
        "Her breathing pauses, or looks like hard work",
        "She's pale, grey or blue",
        "She's floppy, or unusually unresponsive",
        "A fever, at any point in the first three months"
      ]
    },
    "quick": "In the early weeks, feeding comes first and you may need to wake her. Use corrected age and follow the plan from your baby's doctor or NICU nurse."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "corrected-age",
    "preemie-feeding-stamina",
    "how-much-sleep-newborn"
  ],
  "seo": {
    "description": "Premature babies may tire quickly while feeding, so early feeding plans and corrected age matter more than general sleep advice."
  },
  "longform": [
    {
      "h": "The simple answer",
      "t": "For a premature baby, what's more important — food or sleep?\n\nEarly on it's food, and it isn't close. A preemie who sleeps through feeds can quietly fall behind, because she hasn't got reserves and she doesn't reliably wake when hungry the way a term baby does.\n\nThat's why units set feeding schedules, and why those schedules involve waking a peacefully sleeping baby, which feels wrong every single time."
    },
    {
      "h": "Why she sleeps more and feeds worse",
      "t": "Both come from the same place. She's using energy on things a term baby has already sorted out — temperature, breathing, digestion — and there's less left over.\n\nSo she slept more and got tired half way through a feed. Sometimes she managed only a small part of it by mouth. The problem was not appetite. It was stamina.\n\nThat combination is why the schedule matters. Left to her own rhythm she'd have slept and under-fed, and both would have looked peaceful."
    },
    {
      "h": "Corrected age, for everything you read",
      "t": "Sleep charts, wake windows, nap guidance — all of it assumes a term baby, and all of it should be read against her due date rather than her birthday.\n\nOurs was born at 33 weeks with a due date seven weeks later, which meant that at ten weeks old she was around three weeks corrected. Every sleep article we read described a different baby until we made that adjustment.\n\nIt does flip. Once she's gaining steadily, feeding effectively, and past the point her baby's doctor or NICU nurse is watching for, the waking stops and sleep becomes the priority it is for any baby.\n\nAsk when. Specifically: at what point can we stop waking her, and what would tell you she's ready?\n\nWe asked, the clear answer was she was gaining weight consistently and had passed the 3.5kg mark (this was the figure our doctor gave for Ari specifically, it is not this number for everyone). Once we could stop waking her up it felt like a massive achievement and a gift, we could let our little one sleep."
    }
  ],
  "order": 86,
  "batch": "6"
},
{
  "id": "building-a-sleep-schedule",
  "topic": "sleeping",
  "icon": "moon",
  "featured": false,
  "title": "Does my baby need a sleep schedule?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 3,
  "summary": "Not one you impose. What you can do is watch for the shape she's already making and support it.",
  "keywords": [
    "baby sleep schedule",
    "newborn routine",
    "wake windows",
    "baby timings",
    "sleep routine"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "lead": "Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now.",
    "items": [
      "She's floppy, or very hard to wake",
      "She's pale, grey or blue",
      "Breathing is fast, laboured, or has pauses",
      "A fever, if she's under three months old"
    ]
  },
  "panel": {
    "eyebrow": "Sleeping • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Newborns don't follow a clock",
        "Patterns emerge before schedules do",
        "Wake windows are a better tool than set times",
        "It shifts every few weeks as she grows"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Writing down what she actually did for a week",
        "Building the routine around her pattern, not a template",
        "Keeping the order of events fixed and letting times move",
        "Rewriting it whenever it stopped matching",
        "Giving any change five nights before judging it"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "lead": "Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now.",
      "items": [
        "She's floppy, or very hard to wake",
        "She's pale, grey or blue",
        "Breathing is fast, laboured, or has pauses",
        "A fever, if she's under three months old"
      ]
    },
    "quick": "Do not force a strict clock. Notice the pattern she is already making, keep the order familiar and let the times move as she grows."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "day-night-confusion",
    "short-naps-long-nights",
    "when-do-they-sleep-through"
  ],
  "seo": {
    "description": "A flexible routine can help without forcing a strict clock; keep the order familiar and let the times change as your baby grows."
  },
  "longform": [
    {
      "h": "We wrote hers down and it helped",
      "t": "At one point her pattern was roughly: nine in the evening until three, then four until half past seven. Naps around eleven to twelve, three to half four, and six to half six.\n\nWriting it out like that changed how it felt. It had looked like chaos and it turned out to be a pattern — not a tidy one, but a real one. Once we could see it, we could work with it.\n\nPapa learnt the hard way though that the patterns don’t stay for long. The moment you have figured out the patterns and feel you are on top of things, it changes. It was Ari afternoon nap. Papa offered to take over and proceeded to do everything exactly as he had done the last two weeks. After 40 minutes trying he failed to put her to sleep, gave her to mama and in 5 seconds she was asleep. Patterns change, habits changed. Mama adapted, Papa mastered his way of putting her to sleep."
    },
    {
      "h": "Wake windows beat clock times",
      "t": "The useful tool early on isn't what time she goes down. It's how long she's been awake.\n\nRoughly forty-five to ninety minutes for a newborn, stretching as she grows. Go beyond it and you get an overtired baby who looks wide awake and won't settle.\n\nWhich means the schedule moves every day, because a nap that ended late pushes everything after it. Fixing the times instead of the windows is how people end up fighting their own routine."
    },
    {
      "h": "Fix the order, not the hours",
      "t": "What we kept constant was the sequence rather than the clock. Feed, a bit of awake time, nappy, sleeping bag, dark room, white noise, down.\n\nThe same order every time is what she was learning. The times could move by an hour and it still worked, because the pattern of events was the signal.\n\nThe bedtime version is worth being especially consistent about, because that's the one doing the most work for the night ahead.\n\nWhatever you land on will stop fitting within a few weeks. Wake windows lengthen, naps drop, and the schedule that was perfect in September is wrong by October.\n\nThat isn't the routine failing. It's her growing.\n\nWrite down what she's actually doing again, find the new shape, rebuild around it. We did that several times and it was quicker every round."
    }
  ],
  "order": 87,
  "batch": "6"
},
{
  "id": "night-walks-with-the-pram",
  "topic": "sleeping",
  "icon": "moon",
  "featured": false,
  "title": "Is it okay to take my baby for a walk at night?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 2,
  "summary": "Fine, and often the thing that works. Two small cautions about the pram itself rather than the outing.",
  "keywords": [
    "night walk baby",
    "pram to sleep",
    "evening walk newborn",
    "vibration reflux pram"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "lead": "Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now.",
    "items": [
      "Her breathing changes or pauses when she's reclined",
      "She goes pale, grey or blue",
      "She's choking or struggling to breathe",
      "She's floppy, or very hard to wake"
    ]
  },
  "panel": {
    "eyebrow": "Sleeping • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Movement and fresh air settle many babies",
        "A change of scene helps the adults too",
        "Evening walks are a legitimate strategy",
        "Rough ground is uncomfortable rather than harmful"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Walking when nothing indoors was working",
        "Dressing her for standing still, not for walking",
        "A proper pram cover rather than a blanket over the top",
        "Smoother routes, and twenty minutes upright after a feed",
        "Moving her to a flat firm surface once we were home"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "lead": "Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now.",
      "items": [
        "Her breathing changes or pauses when she's reclined",
        "She goes pale, grey or blue",
        "She's choking or struggling to breathe",
        "She's floppy, or very hard to wake"
      ]
    },
    "quick": "A night walk is usually fine and can help her settle. Keep the pram uncovered, dress her for the weather and move her to a flat sleep surface when you get home."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "safe-sleep-newborn",
    "putting-her-down-awake",
    "is-baby-too-hot"
  ],
  "seo": {
    "description": "A night walk can help a baby settle when the pram stays uncovered, she is dressed safely and she moves to a flat sleep surface at home."
  },
  "longform": [
    {
      "h": "Is it all right to go out at night?",
      "t": "Yes, and on the evenings when nothing indoors is working it's often the thing that does.\n\nMovement, fresh air, a change of scene. It also gets you out of a room you've been failing in for an hour, which is worth something on its own."
    },
    {
      "h": "The vibration question",
      "t": "We asked whether a bumpy road could cause reflux, which is a more sensible question than it sounds.\n\nJostling straight after a full feed can make posseting more likely — the same reason you'd avoid vigorous bouncing after a bottle. It isn't causing reflux as a condition; it's making an existing tendency more visible.\n\nIf you're going out after a feed, a smoother route and twenty minutes upright first makes a noticeable difference."
    },
    {
      "h": "Dressing her for it",
      "t": "The mistake we made repeatedly: dressing her based on how hot we felt while walking.\n\nShe's sitting still. You're moving. She needs more than you and you'll be too warm to judge it.\n\nBut don't cover the pram with a blanket to her warm — it traps heat badly, and overheating is the thing worth avoiding. A proper pram cover designed for it, or a footmuff, rather than something draped over the top.\n\nThe awkward bit. She's finally asleep, and a pram seat isn't a safe place for unsupervised sleep.\n\nMove her to a flat firm surface, on her back. There's a guide next to this one on doing that transfer without starting the whole evening again.\n\nAnd if she'll only sleep in a pram or car seat and hates lying flat, that's worth mentioning — it sometimes points at reflux rather than preference. We used to tilt the cot a bit to control the reflux, something we learnt at a later stage we shouldn’t do but it worked wonders for her reflux."
    }
  ],
  "order": 88,
  "batch": "6"
},
{
  "id": "parent-sleep-deprivation",
  "topic": "sanity",
  "icon": "heart",
  "featured": false,
  "title": "What does months of broken sleep do to parents?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 3,
  "summary": "Worse judgement, shorter temper, and a flatter mood — none of which is a character flaw. Protecting one block of sleep is the whole strategy.",
  "keywords": [
    "sleep deprivation parents",
    "new parent exhaustion",
    "broken sleep effects",
    "surviving newborn nights"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Any thoughts of harming yourself or the baby — ring your doctor or a crisis line now",
      "You feel unable to keep yourself or her safe",
      "You're hearing or seeing things others don't",
      "You can't function at all, or feel you're losing touch with reality"
    ]
  },
  "panel": {
    "eyebrow": "Parent Sanity • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Broken sleep hits harder than short sleep",
        "Judgement, mood and patience all get worse",
        "Recovery takes longer than one good night",
        "Everyone underestimates how impaired they are"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Four unbroken hours each, in shifts",
        "Sleeping in separate rooms without guilt",
        "No serious conversations after ten at night",
        "Saying yes when someone offered to hold her",
        "Not driving when we knew we were too tired"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Any thoughts of harming yourself or the baby — ring your doctor or a crisis line now",
        "You feel unable to keep yourself or her safe",
        "You're hearing or seeing things others don't",
        "You can't function at all, or feel you're losing touch with reality"
      ]
    },
    "quick": "Broken sleep can affect your mood and judgement before you notice it. Protected blocks of sleep, taking turns and asking for help matter."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "splitting-nights",
    "touched-out",
    "overwhelmed-new-parent"
  ],
  "seo": {
    "description": "Broken sleep can affect mood, patience and judgement; protected blocks of sleep and asking for help can make a real difference."
  },
  "longform": [
    {
      "h": "The question we asked about ourselves",
      "t": "What happens when you're awake for days and then finally sleep — does it take long to drop off, and how do you feel when you wake up?\n\nIt's a small question and it was really about whether any of this was recoverable."
    },
    {
      "h": "Broken is worse than short",
      "t": "This is the part that surprised us. Six hours broken into four pieces is considerably worse than four hours in one go.\n\nSleep does its repair work in cycles, and being interrupted partway through means you keep restarting rather than completing. Which is why you can be in bed for eight hours and feel like you haven't slept at all.\n\nThat is why one unbroken stretch can feel so much better. It is not only the number of hours. It is getting them without being woken."
    },
    {
      "h": "What it actually does",
      "t": "Reaction time and judgement can slip before you notice. That is why driving when you are this tired can be dangerous, not just unpleasant.\n\nMood flattens. Patience shortens. Small things become enormous. Arguments at three in the morning are not real arguments and shouldn't be treated as if they were.\n\nOne good night may not fix months of broken sleep. Your body may need several better nights before you feel more like yourself. It happened to Papa, mama took over one full night because Papa was also working. He slept 8 hours straight and woke up even more exhausted. He was given a gift and he felt he had wasted it, since he was going to do that night all night. We learnt later, splitting the night vs one night mama one night papa was a much better solution.\n\nShifts helped most. One person covered until about 4am, then the other took over until morning. The person off duty slept in another room and was truly off duty. Even the living room sofa was better than bedroom if it’s a one bedroom flat.\n\nFour unbroken hours each beats seven broken ones between you, comfortably.\n\nSeparate rooms for a stretch doesn’t mean anything is wrong. Accepting when people ask if they can help isn’t weakness either or that you are doing something wrong. We turned a lot of those down early on out of some idea that we ought to be managing, which achieved nothing except making us worse at managing.\n\nAnd if the low mood doesn't lift once the sleep improves, it isn’t immediate, it takes a little bit of time but if it doesn’t improve at all — that's worth a conversation with a doctor rather than waiting it out."
    }
  ],
  "order": 89,
  "batch": "6"
},
{
  "id": "sleeping-more-than-usual",
  "topic": "sleeping",
  "icon": "moon",
  "featured": false,
  "title": "My baby has slept most of today. Is that okay?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 2,
  "summary": "One sleepy day in a baby who feeds well and is bright when awake is usually growth. The company it keeps is what matters.",
  "keywords": [
    "baby sleeping a lot",
    "extra sleepy day",
    "slept all afternoon",
    "growth spurt sleep"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "lead": "Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now.",
    "items": [
      "She's floppy, or you can't wake her properly",
      "She's pale, grey or blue",
      "Breathing is fast, laboured, or has pauses",
      "A fever, if she's under three months old"
    ]
  },
  "panel": {
    "eyebrow": "Sleeping • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "A sleepier day or two, then back to normal",
        "Often around a growth spurt",
        "Alert and hungry when she does wake",
        "Common after vaccinations, or a busy day out"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Checking she woke herself when hungry",
        "Watching how she was awake, not how long she slept",
        "Counting wet nappies through the day",
        "Giving it two days before reading anything into it",
        "Keeping to her feeding plan while she was still on one"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "lead": "Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now.",
      "items": [
        "She's floppy, or you can't wake her properly",
        "She's pale, grey or blue",
        "Breathing is fast, laboured, or has pauses",
        "A fever, if she's under three months old"
      ]
    },
    "quick": "One sleepy day can be normal if she still feeds well and is bright when awake. Sleepiness with poor feeding or difficulty waking needs medical advice."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "when-to-worry-she-wont-wake",
    "growth-spurt-signs",
    "six-hour-stretch"
  ],
  "seo": {
    "description": "A sleepy day can be normal during a growth spurt, but sleepiness with poor feeding or difficulty waking needs medical advice."
  },
  "longform": [
    {
      "h": "Since three thirty, and it's now eight",
      "t": "That was the situation. She had fed normally, then slept for most of the afternoon. She was still very young, and we wondered whether it was a growth spurt.\n\nThe detail that answered it wasn't the length of the sleep. It was that when she woke she was hungry and ate well, and she'd been waking herself when she needed to."
    },
    {
      "h": "What makes a sleepy day ordinary",
      "t": "She wakes properly and is alert when awake. She feeds well when she does. Wet nappies are keeping up. And it lasts a day or two rather than settling in.\n\nGrowth spurts can do this. Some babies feed constantly and others sleep more. The weight gain may show up afterwards.\n\nA busy day out, a round of vaccinations, or simply a badly-slept night before will all produce the same thing."
    },
    {
      "h": "What makes it not ordinary",
      "t": "Sleepiness on its own is rarely the problem. It's what comes with it.\n\nHard to wake rather than just sleepy. Floppy when awake. Feeding poorly, or missing feeds entirely. Fewer wet nappies. A fever, or generally seeming unwell.\n\nAny of those alongside the sleep changes the picture completely, and they're worth checking deliberately rather than assuming the sleep explains itself.\n\nIf she was born early, the threshold is lower and it's worth being stricter with yourself.\n\nA preemie who sleeps through feeds can fall behind quietly, and she may not reliably wake when hungry the way a term baby does. If there's a feeding plan, the plan wins over a peaceful afternoon.\n\nWe stopped waking ours only once her paediatrician said we could — which is the right way round."
    }
  ],
  "order": 90,
  "batch": "6"
},
{
  "id": "hands-to-mouth",
  "topic": "development",
  "icon": "blocks",
  "featured": false,
  "title": "Why does my baby keep putting her hands in her mouth?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 3,
  "summary": "Hands to mouth and fingers interlaced is real progress, even though it looks like fidgeting. She's working out where she ends.",
  "keywords": [
    "baby hands to mouth",
    "interlacing fingers",
    "hand awareness",
    "midline baby",
    "body awareness"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "She goes floppy, or won't wake properly",
      "One side of her body isn't moving at all",
      "She's pale, grey or blue",
      "A fever, if she's under three months old"
    ],
    "lead": "Blue or grey, or a floppy baby you cannot wake — call your local emergency number now."
  },
  "panel": {
    "eyebrow": "Development • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Hands to mouth from the first weeks",
        "Fingers interlaced at the middle of her body",
        "At first accidental, then increasingly deliberate",
        "Sucking hands isn't always hunger"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Leaving her hands free instead of covering them",
        "Letting her suck on them without treating it as a feeding cue",
        "Holding her upright so she could see them",
        "Giving her something light to grip once she reached"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "She goes floppy, or won't wake properly",
        "One side of her body isn't moving at all",
        "She's pale, grey or blue",
        "A fever, if she's under three months old"
      ],
      "lead": "Blue or grey, or a floppy baby you cannot wake — call your local emergency number now."
    },
    "quick": "Hands to mouth and interlaced fingers is her mapping her own body, and it's a real step. Sucking hands isn't always hunger. Persistent one-sided movement or a hand that stays fisted past a few months is worth raising at her next check."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "eyes-dont-coordinate",
    "flash-photos-and-her-eyes",
    "tummy-time-after-eating"
  ],
  "seo": {
    "description": "Hands in the mouth and fingers meeting in the middle are early signs that your baby is discovering her body, not always signs of hunger."
  },
  "longform": [
    {
      "h": "Does she know she's doing it?",
      "t": "That was our question, because she'd started interlacing her fingers and it looked far too deliberate for someone who'd been alive a few weeks.\n\nThe honest answer is partly. Early on it's more reflex than plan. But the sensation of one hand touching the other is information, and she's using it."
    },
    {
      "h": "What's actually happening",
      "t": "She's building a map of her own body, and it starts at the middle. Bringing both hands together at the centre of her chest is called working at the midline, and it's a genuine developmental step rather than fidgeting.\n\nHands to mouth comes early too, and it does two jobs. It's exploration — her mouth is the most sensitive part of her, so it's the best tool she has for finding out what a hand is. And it's self-soothing, which is why she does more of it when she's unsettled.\n\nThat second part caught us out. We kept reading hands in the mouth as hunger and offering a feed. Sometimes it was. Often she was just comforting herself. Papa kept thinking we were underfeeding her for a while. He relaxed when he asked the pediatrician and she said Ari is just exploring the world now."
    },
    {
      "h": "How it progresses",
      "t": "Accidental contact first. Then bringing them together on purpose. Then looking at them — which is a lovely thing to watch, because she'll stare at her own hand like it's arrived from somewhere else.\n\nThen reaching, then grabbing, then getting it to her mouth reliably. Each of those builds on the last.\n\nCorrected age applies. Ours was born at 33 weeks, so all of this ran later than the charts suggested and was exactly on time for her.\n\nLeft her hands out rather than covered by sleeves or a swaddle during awake time. She can't explore what she can't reach.\n\nHeld her upright some of the time so her hands were in her field of view, rather than always flat on her back.\n\nAnd once she was reaching, gave her something light and easy to hold — a soft ring or a muslin. Nothing complicated.\n\nWhat's worth mentioning at a check, rather than in a panic: a hand that stays tightly fisted well past a few months, or consistently only using one side."
    }
  ],
  "order": 91,
  "batch": "7"
},
{
  "id": "eyes-dont-coordinate",
  "topic": "development",
  "icon": "blocks",
  "featured": false,
  "title": "Why don't my baby's eyes move together yet?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 2,
  "summary": "Very common in the early months and usually sorts itself out. There's an age past which it should be looked at, and one situation that shouldn't wait.",
  "keywords": [
    "baby eyes not coordinated",
    "cross eyed baby",
    "squint",
    "eye crossing",
    "when do eyes align"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "One eye suddenly turns and stays turned",
      "A white or cloudy appearance in the pupil",
      "She's floppy, or won't wake properly"
    ],
    "lead": "A floppy baby you cannot wake — call your local emergency number now."
  },
  "panel": {
    "eyebrow": "Development • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Eye muscles are still developing in the early months",
        "Occasional crossing or drifting, especially when tired",
        "More noticeable when she's focusing up close",
        "Usually settles by around four months corrected"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Noticing when it happened — tired, close up, or all the time",
        "Using corrected age rather than her birthday",
        "Taking a photo when it was obvious",
        "Raising it at a scheduled check rather than worrying between them"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "One eye suddenly turns and stays turned",
        "A white or cloudy appearance in the pupil",
        "She's floppy, or won't wake properly"
      ],
      "lead": "A floppy baby you cannot wake — call your local emergency number now."
    },
    "quick": "Eyes drifting or crossing in the early months is common and usually settles by around four months corrected. A turn that's constant, or a white reflex in the pupil, needs seeing rather than waiting."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "flash-photos-and-her-eyes",
    "tummy-time-after-eating",
    "head-tilt-in-tummy-time"
  ],
  "seo": {
    "description": "Occasional eye crossing can be common in young babies, but a constant turn or white reflection in the pupil needs medical advice."
  },
  "longform": [
    {
      "h": "Two questions, months apart",
      "t": "First, at a few days corrected: why don't her eyes coordinate yet, and is that all right for a preemie.\n\nThen again at three months: she's crossing her eyes a lot today, why.\n\nBoth ordinary questions, and the answers differ mainly because of her age."
    },
    {
      "h": "Why it happens early on",
      "t": "The muscles that move the eyes and the coordination between them are still developing. Early on she can't reliably aim both at the same point, so they drift, cross, or occasionally do different things.\n\nIt's most noticeable when she's tired, when something is close to her face, or when she's trying hard to focus.\n\nNewborn vision is also short range — roughly the distance from your arms to your face, which is not a coincidence. She isn't trying to track something across the room, so the misalignment matters less than it looks."
    },
    {
      "h": "When it should have settled",
      "t": "Broadly by around four months, and for a baby born early that means four months corrected rather than four months old.\n\nThat distinction matters. Ours was born seven weeks early, so measuring from her birthday would have had us worrying two months before there was anything to worry about.\n\nPast that point, persistent crossing or drifting is worth having looked at properly. Not urgently — but it's one of the things where early assessment genuinely helps, so it shouldn't drift on for months.\n\nAn eye that turns and stays turned, rather than drifting now and then is something that should be checked.\n\nAnd a white or cloudy appearance in the pupil — including in a photograph, where one eye shows white instead of the usual red-eye reflex. That one gets checked quickly, and it's worth knowing about because a photo is often how it's first noticed.\n\nAlso worth mentioning: a sudden turn in a baby whose eyes had been straight."
    }
  ],
  "order": 92,
  "batch": "7"
},
{
  "id": "flash-photos-and-her-eyes",
  "topic": "development",
  "icon": "blocks",
  "featured": false,
  "title": "Is camera flash safe for my baby's eyes?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 2,
  "summary": "A few flashes from a normal distance won't have damaged her eyes. It's unpleasant rather than harmful.",
  "keywords": [
    "flash photography baby",
    "camera flash newborn eyes",
    "passport photo baby",
    "is flash bad for babies"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "A white or cloudy appearance in her pupil, in life or in a photo",
      "One eye turns and stays turned",
      "She stops responding to faces or light",
      "She's floppy, or won't wake properly"
    ],
    "lead": "A floppy baby you cannot wake — call your local emergency number now."
  },
  "panel": {
    "eyebrow": "Development • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "A camera flash is brief and diffuse",
        "Ordinary flashes at normal distance aren't considered harmful",
        "She'll blink, startle or cry — that's discomfort, not damage",
        "Passport and clinic photos happen to everyone"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Keeping the camera at arm's length rather than close up",
        "Turning the flash off where the light allowed",
        "Using a bright window instead for ordinary photos",
        "Not repeating flash shots over and over"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "A white or cloudy appearance in her pupil, in life or in a photo",
        "One eye turns and stays turned",
        "She stops responding to faces or light",
        "She's floppy, or won't wake properly"
      ],
      "lead": "A floppy baby you cannot wake — call your local emergency number now."
    },
    "quick": "A few flashes at normal distance are not thought to cause harm — she'll dislike it rather than be damaged by it. Keep the camera back, and use daylight where you can."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "tummy-time-after-eating",
    "head-tilt-in-tummy-time",
    "choosing-toys"
  ],
  "seo": {
    "description": "An ordinary camera flash is unlikely to harm a baby's eyes; learn what to avoid and why a white reflection in photos should be checked."
  },
  "longform": [
    {
      "h": "The question after the fact",
      "t": "We'd had to take flash photographs for a passport, and afterwards wondered how bad that was for a one-month-corrected baby's eyes.\n\nThe follow-up detail was the useful one: it was about a metre away."
    },
    {
      "h": "What a flash actually does",
      "t": "It's very brief and it spreads out quickly with distance. At a normal photographing distance it isn't considered a risk to a baby's eyes.\n\nWhat it does do is startle her. Bright, sudden, unexpected — she'll blink hard, flinch, and quite possibly object loudly. That reaction is discomfort rather than evidence of harm, though it certainly feels like harm when you're the one who caused it.\n\nA laser pointer or a direct beam is a completely different thing and genuinely dangerous. A camera flash isn't in that category."
    },
    {
      "h": "What we'd do differently",
      "t": "Keep the camera back rather than close to her face. Distance does most of the work.\n\nUse available light for ordinary photos — a bright window gives better pictures of a baby anyway, and no flash.\n\nAnd don't repeat it. Passport photos often take several attempts, and the sensible approach is to get the framing right first with the flash off, then take the one that needs it.\n\nOfficial photos are compulsory and everyone has to do them. It isn't something to feel guilty about.\n\nWorth knowing: the red-eye effect in a flash photograph is the light reflecting off the back of the eye, and it's normal.\n\nWhat isn't normal is one eye showing white instead. That's a reason to get her eyes checked quickly, and photographs are quite often how it's first spotted.\n\nSo the flash has a genuine use, even if it isn't a pleasant one for her."
    }
  ],
  "order": 93,
  "batch": "7"
},
{
  "id": "when-to-start-playing",
  "topic": "development",
  "icon": "blocks",
  "featured": false,
  "title": "When should I start playing with my newborn?",
  "ages": [
    "0–1 month",
    "2–3 months"
  ],
  "read": 3,
  "summary": "Straight away, and it looks nothing like play. Your face at close range is the whole activity.",
  "keywords": [
    "playing with newborn",
    "when to start playing",
    "newborn stimulation",
    "tummy time",
    "baby activities"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "She's floppy, or won't wake properly",
      "She stops responding to your voice or face altogether",
      "She's pale, grey or blue",
      "A fever, if she's under three months old"
    ],
    "lead": "Blue or grey, or a floppy baby you cannot wake — call your local emergency number now."
  },
  "panel": {
    "eyebrow": "Development • 0–3 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Newborn play is faces, voices and movement",
        "Short bursts of a few minutes are plenty",
        "She'll look away when she's had enough",
        "Corrected age sets the pace, not her birthday"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Holding her at about the distance from our arms to our face",
        "Talking constantly, narrating whatever we were doing",
        "Stopping when she looked away instead of pushing on",
        "Tummy time in short bursts, several times a day"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "She's floppy, or won't wake properly",
        "She stops responding to your voice or face altogether",
        "She's pale, grey or blue",
        "A fever, if she's under three months old"
      ],
      "lead": "Blue or grey, or a floppy baby you cannot wake — call your local emergency number now."
    },
    "quick": "Play starts immediately and it's mostly your face and voice at close range. Short bursts, stop when she looks away, and count from her due date if she was early."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "tummy-time-after-eating",
    "head-tilt-in-tummy-time",
    "choosing-toys"
  ],
  "seo": {
    "description": "Newborn play is simple and brief: faces, talking, cuddles and short tummy-time sessions are already enough stimulation."
  },
  "longform": [
    {
      "h": "When she was nearly one month corrected",
      "t": "That was the point we asked, and the question had a second half: how do we keep her more awake and engaged during the day.\n\nBoth reasonable. And the answer to the first is earlier than we expected, while the answer to the second turned out to matter less than we thought."
    },
    {
      "h": "Newborn play doesn't look like play",
      "t": "There are no toys involved and nothing to buy.\n\nIt's your face, held at roughly the distance from your arms to your eyes, which is about as far as she can focus. It's your voice. It's slow movement she can follow. It's being held and carried and talked to.\n\nHigh contrast helps early — black and white patterns, strong edges — because colour vision is still developing. But a face beats any card you can buy, and it's free.\n\nThat's the entire curriculum for the first weeks."
    },
    {
      "h": "Short, and stopped early",
      "t": "A few minutes is a session. Newborns tire fast, and an overstimulated baby is much harder to settle afterwards.\n\nThe signal is easy once you know it: she looks away. Turning her head, glazing over, going fussy, hiccupping. That's her asking for a break, and the right response is to stop rather than to work harder at engaging her.\n\nPapa got this wrong at first and tried to hold her attention. He kept trying to bond with Ari and was trying to make her laugh, play with her, show her images…Mama worked it out before papa did and said plainly not to overstimulate her, which was the single most useful piece of advice we got that month.\n\nShort and often — a minute or two, several times a day, building up.\n\nOn your chest while you're reclined counts, and it's the version most newborns tolerate first. Across your lap works too.\n\nAlways while she's awake and watched, and not straight after a feed.\n\nAnd all of this runs on corrected age. Ours was born at 33 weeks, so at two months old she was around two weeks corrected, and every activity chart we read described a different baby until we adjusted."
    }
  ],
  "order": 94,
  "batch": "7"
},
{
  "id": "tummy-time-after-eating",
  "topic": "development",
  "icon": "blocks",
  "featured": false,
  "title": "How long should I wait after a feed before tummy time?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 2,
  "summary": "Twenty to thirty minutes is a reasonable gap. And the order of the day matters more than the gap does.",
  "keywords": [
    "tummy time after feeding",
    "how long after eating",
    "feed play sleep",
    "tummy time timing"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "She chokes, or struggles to breathe during tummy time",
      "She goes pale, grey or blue",
      "Forceful vomiting, or vomit that's green or bloody",
      "She's floppy, or won't wake properly"
    ],
    "lead": "Blue or grey, a struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now."
  },
  "panel": {
    "eyebrow": "Development • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Waiting until the milk has settled after a feed",
        "Some spit-up even so, especially early on",
        "Feed, then play, then sleep is the usual order",
        "Short sessions suit a full baby better than long ones"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Waiting about half an hour rather than watching the clock",
        "Keeping her upright in between",
        "Doing it when she woke, before she got hungry",
        "Cutting it short if she was clearly uncomfortable"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "She chokes, or struggles to breathe during tummy time",
        "She goes pale, grey or blue",
        "Forceful vomiting, or vomit that's green or bloody",
        "She's floppy, or won't wake properly"
      ],
      "lead": "Blue or grey, a struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now."
    },
    "quick": "There is no exact timer. Wait until she seems comfortable after a feed. If she spits up easily, give her longer or try before the next feed."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "choosing-toys",
    "when-to-start-playing",
    "first-laugh"
  ],
  "seo": {
    "description": "Tummy time is usually more comfortable before a feed or after allowing time for milk to settle, especially for babies who spit up."
  },
  "longform": [
    {
      "h": "Twenty-five minutes — is that enough?",
      "t": "That was the actual question, and the answer is yes, roughly.\n\nTwenty to thirty minutes after a feed gives her stomach a chance to settle. Less than that and you'll get more spit-up than you wanted, particularly in the early months when posseting is at its peak anyway."
    },
    {
      "h": "The order matters more than the gap",
      "t": "The follow-up was the better question: should I wake her, let her play, feed her, then settle her to sleep?\n\nSo we not sure what the correct order is, but we used to wake her up, do tummy time, then feed, then play a bit then downtime and then sleep. Sometimes if the gap was big enough a little top up of food before sleep would work as well."
    },
    {
      "h": "When she's just woken and hasn't eaten for hours",
      "t": "Then feed her first. A hungry baby is a bad tummy-time participant and you'll get thirty seconds of protest rather than anything useful.\n\nThe gap is a guideline, not a rule that overrides an actual hungry baby at five in the morning.\n\nShe will sometimes, and it doesn't mean you got the timing wrong.\n\nShorter sessions work better on a fullish stomach. So does keeping her upright in the gap rather than laying her flat and then flipping her over.\n\nAnd if she's genuinely uncomfortable, stop and try again later. There's no quota to hit which papa learnt. He kept trying to beat Ari record of tummy time each time. There were some days she could hold for 30 seconds and then other days where she was struggling with 10."
    }
  ],
  "order": 95,
  "batch": "7"
},
{
  "id": "head-tilt-in-tummy-time",
  "topic": "development",
  "icon": "blocks",
  "featured": false,
  "title": "Why does my baby's head control seem worse?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 3,
  "summary": "Usually a heavier head and a bad day rather than going backwards. Consistently tilting the same way is the bit worth raising.",
  "keywords": [
    "head tilt tummy time",
    "head control gone backwards",
    "torticollis",
    "baby leans one side"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "She's floppy, or won't wake properly",
      "She's lost a skill entirely and isn't using one side at all",
      "She's pale, grey or blue",
      "A fever, if she's under three months old"
    ],
    "lead": "Blue or grey, or a floppy baby you cannot wake — call your local emergency number now."
  },
  "panel": {
    "eyebrow": "Development • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Progress is uneven rather than steady",
        "Her head gets heavier faster than the neck strengthens",
        "Tired, hungry or fed-up all look like weakness",
        "Tilting varies day to day"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Trying again when she was alert rather than tired",
        "Alternating which side we approached her from",
        "Moving the interesting thing to her less-favoured side",
        "Raising the one-sided pattern at her next check"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "She's floppy, or won't wake properly",
        "She's lost a skill entirely and isn't using one side at all",
        "She's pale, grey or blue",
        "A fever, if she's under three months old"
      ],
      "lead": "Blue or grey, or a floppy baby you cannot wake — call your local emergency number now."
    },
    "quick": "Uneven progress is normal and a heavier head makes it look like going backwards. Always tilting to the same side, or a neck that resists turning, is worth raising at her next check."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "when-to-start-playing",
    "first-laugh",
    "when-do-babies-talk"
  ],
  "seo": {
    "description": "Head control can look uneven while a baby is learning, but a lasting tilt, stiffness or reduced movement should be checked."
  },
  "longform": [
    {
      "h": "It looked like going backwards",
      "t": "She used to hold her head up better, and now she tilted more during tummy time. That's genuinely unsettling to watch — everything is supposed to be improving.\n\nWe were told it wasn't a red flag unless it was persistent and always to one side, and then asked for that to be expanded, which was the right instinct because that sentence is doing a lot of work."
    },
    {
      "h": "Why it can look worse before it gets better",
      "t": "Her head is getting heavier faster than her neck is getting stronger. So a baby who managed a decent lift at six weeks can look worse at ten, having gained a considerable amount of head to lift.\n\nAnd motor development isn't a smooth line. It stalls, dips, and jumps. A bad week often comes right before something new.\n\nOn top of that, tired, hungry, recently fed, or simply fed up with the whole exercise all look exactly like weakness. Trying again at a different point in the day frequently produces a different baby."
    },
    {
      "h": "The pattern worth noticing",
      "t": "Not how well she lifts. Which way she goes.\n\nIf she consistently turns or tilts to the same side, and resists turning the other way, that's the thing to mention. It can be tightness in the neck muscles, which is common, treatable, and responds much better to early physiotherapy than to waiting.\n\nIt also links to head shape — a baby who always looks one way puts pressure on the same spot.\n\nWhat we watched for: does she turn both ways when something interesting is there, or does one side clearly cost her more?\n\nApproaching her from alternate sides rather than always the same one, which sounds trivial and isn't — we were both right-handed and had unconsciously standardised.\n\nMoving whatever she wanted to look at to her less-favoured side.\n\nAlternating which end of the cot her head went., the window was to her left, and we saw she always lay that way, so the moment we changed the cribs direction in the room to have the window to the right it actually helped. It made the room an obstacle course but it helped.\n\nAnd trying tummy time when she was alert and content, rather than fitting it in whenever we remembered. We started tummy time late. We thought a month or so had to pass before you could start. You can start pretty much the same day your baby comes home, unless the doctor mentions otherwise."
    }
  ],
  "order": 96,
  "batch": "7"
},
{
  "id": "first-laugh",
  "topic": "development",
  "icon": "blocks",
  "featured": false,
  "title": "When do babies start laughing?",
  "ages": [
    "2–3 months",
    "4–6 months"
  ],
  "read": 3,
  "summary": "Usually somewhere around three to four months, and often at something ridiculous rather than at you.",
  "keywords": [
    "first laugh baby",
    "when do babies laugh",
    "baby giggle",
    "social development"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "She's floppy, or won't wake properly",
      "She stops responding to faces or voices altogether",
      "She's pale, grey or blue",
      "A fever, if she's under three months old"
    ],
    "lead": "Blue or grey, or a floppy baby you cannot wake — call your local emergency number now."
  },
  "panel": {
    "eyebrow": "Development • 2–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Somewhere around three to four months, corrected",
        "Often preceded by weeks of chuckles and squeaks",
        "Frequently at an object rather than a person",
        "Some babies laugh earlier, some later"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Repeating whatever caused it, immediately and often",
        "Noticing what she was actually looking at",
        "Writing down the date, because we nearly didn't",
        "Not competing to be the one who got it"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "She's floppy, or won't wake properly",
        "She stops responding to faces or voices altogether",
        "She's pale, grey or blue",
        "A fever, if she's under three months old"
      ],
      "lead": "Blue or grey, or a floppy baby you cannot wake — call your local emergency number now."
    },
    "quick": "Usually around three to four months corrected, often at an object rather than a person. No laugh by around six months corrected, alongside little eye contact or response to your voice, is worth raising at her next check."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "rolling-back-to-tummy",
    "hand-preference",
    "playing-with-a-three-month-old"
  ],
  "seo": {
    "description": "Most babies begin laughing in the early months, often at an unexpected sound, face or toy rather than anything carefully planned."
  },
  "longform": [
    {
      "h": "It was the giraffe",
      "t": "Her first real laugh wasn't at either of us. It was at Gina the giraffe. She was simply holding it and bounced up and down and the giraffe wobbled her head and Ari proceeded to laugh. The very first time either Mama and Papa heard her laugh. It was one of the cutest things and yet we didn’t quite get why she was laughing. The giraffe was the same as always, and yet she just began to laugh.\n\nWhich is the correct and traditional outcome, and every parent should be warned about it in advance."
    },
    {
      "h": "When it usually turns up",
      "t": "Somewhere around three to four months, counted from her due date if she was born early.\n\nBefore that there's usually a run-up — chuckles, squeaks, breathy sounds that are almost a laugh and then aren't. Those count as the same thing arriving in pieces.\n\nSome babies laugh at two months. Some are closer to five. Both are ordinary, and it doesn't predict anything about temperament, however much you'd like it to."
    },
    {
      "h": "Why an object and not a person",
      "t": "Early laughter is often triggered by something surprising and repeatable rather than by social connection — a sudden movement, an odd noise, a face doing something unexpected.\n\nA toy that moves or makes a sound hits that mark reliably. A parent trying very hard to be entertaining often doesn't, papa makes adults laugh and was adement in making his daughter laugh, partly because trying hard makes you less surprising, humor and understanding comes later.\n\nSo it isn't a verdict on you. It's a verdict on the giraffe, who has excellent comic timing and no idea.\n\nDo the exact thing again. Immediately, and then repeatedly, for far longer than is dignified.\n\nRepetition is how she learns the connection between what happened and the feeling, and it's the fastest way to get the second laugh.\n\nAlso write down the date. We nearly didn't, and it's one of the few milestones you'll genuinely want to remember precisely.\n\nWhat's worth raising at a check rather than worrying about: no laughing at all by around six months corrected, especially alongside limited eye contact or little response to your voice. Those get looked at together."
    }
  ],
  "order": 97,
  "batch": "7"
},
{
  "id": "when-do-babies-talk",
  "topic": "development",
  "icon": "blocks",
  "featured": false,
  "title": "When do babies start talking?",
  "ages": [
    "2–3 months",
    "4–6 months",
    "7–9 months",
    "10–12 months"
  ],
  "read": 3,
  "summary": "Long before words. Cooing, babbling and taking turns are the real milestones, and they start in the first few months.",
  "keywords": [
    "when do babies talk",
    "first words",
    "babbling",
    "baby sounds",
    "speech milestones"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "She stops responding to your voice altogether",
      "She's lost sounds or babbling she previously had",
      "She's floppy, or won't wake properly",
      "She's pale, grey or blue"
    ],
    "lead": "Blue or grey, or a floppy baby you cannot wake — call your local emergency number now."
  },
  "panel": {
    "eyebrow": "Development • 2–12 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Cooing and vowel sounds from around two months corrected",
        "Babbling with consonants from around six months",
        "First words often somewhere around a year",
        "Understanding runs well ahead of speaking"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Narrating everything out loud, constantly",
        "Leaving five long seconds after asking her something",
        "Naming what she was already looking at",
        "Reading daily, pointing rather than reading the text"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "She stops responding to your voice altogether",
        "She's lost sounds or babbling she previously had",
        "She's floppy, or won't wake properly",
        "She's pale, grey or blue"
      ],
      "lead": "Blue or grey, or a floppy baby you cannot wake — call your local emergency number now."
    },
    "quick": "Cooing from around two months, babbling from around six, words often near a year — all corrected if she was early. No babbling by nine months corrected, or little response to your voice, is worth raising at her next check."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "tummy-time-after-eating",
    "head-tilt-in-tummy-time",
    "first-laugh"
  ],
  "seo": {
    "description": "Talking develops through coos, babbling, gestures and understanding before first words arrive; corrected age matters for premature babies."
  },
  "longform": [
    {
      "h": "The question skips most of the milestones",
      "t": "When do babies usually start speaking. It's the natural question and it points at the wrong target, because by the time words arrive most of the work has already happened.\n\nThe things worth watching for come much earlier and look nothing like talking."
    },
    {
      "h": "The actual sequence",
      "t": "Cooing and vowel sounds from around two months corrected — the long aaah and ooh noises that turn up when she's content.\n\nTaking turns not long after. You speak, she makes a sound, you respond. That back-and-forth is conversation before either of you is saying anything.\n\nBabbling with consonants from around six months — bababa, dadada. Repetitive, and it doesn't mean anything yet.\n\nGestures from around nine to twelve months. Pointing, waving, holding things out to show you. This is the big one, and it predicts language better than any word count.\n\nAnd then words, often somewhere around a year, with an enormous range either side."
    },
    {
      "h": "Understanding comes first",
      "t": "She'll understand a great deal before she says anything, and that gap is normal rather than a delay.\n\nSo the useful question isn't how many words she has. It's whether she's communicating — trying to get your attention, responding to her name, following your gaze, and reacting when you talk to her. Ari learnt her name quite early in the game, and would turn whenever she heard her name. There were 2 languages happening at the time, we still don’t know if that matters or not. We are waiting until she is 2 to add the third language in to not slow down her speech. This is old wives tale and probably not scientifically proven but as parents we want our daughter to be able to communicate with us fster rather than slower so we doing this anyways.\n\nNarrating out loud, constantly, in a way that feels faintly ridiculous. It's the single strongest thing you can do and it costs nothing.\n\nLeaving gaps. Ask, then wait five seconds. Far longer than feels natural, and most of us fill the silence long before she's had a chance to answer.\n\nFollowing her attention rather than directing it — naming what she's already looking at.\n\nAnd books daily, pointing at pictures rather than reading the words.\n\nIf you're raising her with more than one language, that does not cause delay. It's a persistent myth and people will repeat it confidently. Count her words across all her languages."
    }
  ],
  "order": 98,
  "batch": "7"
},
{
  "id": "rolling-back-to-tummy",
  "topic": "development",
  "icon": "blocks",
  "featured": false,
  "title": "Why does my baby roll one way but not the other?",
  "ages": [
    "2–3 months",
    "4–6 months",
    "7–9 months"
  ],
  "read": 3,
  "summary": "Back to tummy usually comes first and it's the harder one. Getting back again takes weeks longer, and it changes your sleep setup immediately.",
  "keywords": [
    "baby rolling",
    "back to tummy",
    "tummy to back",
    "rolling milestone",
    "when do babies roll"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "She's floppy, or won't wake properly",
      "She isn't moving one side of her body at all",
      "She's pale, grey or blue",
      "She rolls into a position she can't breathe well in and stays there"
    ],
    "lead": "Blue or grey, a struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now."
  },
  "panel": {
    "eyebrow": "Development • 2–9 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Back to tummy often comes first, though not always",
        "Tummy back to back can take several more weeks",
        "One side is usually easier than the other",
        "Wide range — anywhere from three to seven months corrected"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Plenty of floor time, out of seats and bouncers",
        "Toys just out of reach to the side she rolled towards",
        "Practising the return roll during the day",
        "Stopping the swaddle the moment she first rolled"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "She's floppy, or won't wake properly",
        "She isn't moving one side of her body at all",
        "She's pale, grey or blue",
        "She rolls into a position she can't breathe well in and stays there"
      ],
      "lead": "Blue or grey, a struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now."
    },
    "quick": "Back to tummy usually comes first and the return roll can take weeks more. Once she rolls at all, the swaddle stops and the cot stays empty — she'll roll in her sleep before she can roll back."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "first-laugh",
    "learning-to-sit",
    "playing-with-a-three-month-old"
  ],
  "seo": {
    "description": "Babies often learn to roll in one direction before the other; once rolling begins, sleep and changing safety need to change too."
  },
  "longform": [
    {
      "h": "Rolling at four months, one direction only",
      "t": "She was rolling from back to tummy easily, both sides, and couldn't get back again.\n\nWe asked how long that usually takes, and the honest answer is that it's normal and it can be several weeks. Sometimes longer."
    },
    {
      "h": "The harder one comes first",
      "t": "That seems backwards and it isn't. Back to tummy uses a push and a twist that babies develop earlier. Tummy to back needs a different set of muscles and a bit of weight-shifting that takes longer to work out.\n\nSo the common pattern is: she learns to roll onto her front, immediately does it in her cot at two in the morning, and then lies there furious because she can't undo it.\n\nThat phase is genuinely annoying and it passes."
    },
    {
      "h": "What changes the moment she rolls at all",
      "t": "Swaddling stops. Not when she rolls reliably — at the first sign. A swaddled baby who ends up on her front can't use her arms, and that's the situation to avoid entirely.\n\nThe cot stays completely empty. No positioners, no rolled towels, nothing to stop her turning.\n\nAnd you still put her down on her back every time. Once she can roll herself, you don't need to keep turning her back over through the night — but she goes down on her back.\n\nA sleeping bag rather than a blanket makes all of this simpler.\n\nPractise it in daylight. Lay her on her front, put something interesting off to one side, and let her work at it. Guide her hip gently if she's stuck, rather than doing it for her.\n\nFloor time, more of it than feels necessary. Babies parked in seats and bouncers simply don't get the reps.\n\nAnd expect one side to come before the other. Ours rolled beautifully to one side and hopeless to the other for a while, which is entirely usual."
    }
  ],
  "order": 99,
  "batch": "7"
},
{
  "id": "learning-to-sit",
  "topic": "development",
  "icon": "blocks",
  "featured": false,
  "title": "Do I need to teach my baby to sit?",
  "ages": [
    "4–6 months",
    "7–9 months"
  ],
  "read": 2,
  "summary": "She works it out. What you provide is floor time and opportunity — propping her upright early does more harm than good.",
  "keywords": [
    "baby sitting",
    "how to teach baby to sit",
    "sitting milestone",
    "propping baby up",
    "when do babies sit"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "She's floppy, or won't wake properly",
      "She isn't using one side of her body at all",
      "She's pale, grey or blue",
      "She's lost a skill she previously had"
    ],
    "lead": "Blue or grey, or a floppy baby you cannot wake — call your local emergency number now."
  },
  "panel": {
    "eyebrow": "Development • 4–9 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Unsupported sitting around five to eight months corrected",
        "Tripod sitting on hands comes first",
        "Lots of toppling, which is part of the learning",
        "Straight legs and poor balance early on"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Floor time instead of propping her in seats",
        "Sitting her between our legs so she could wobble safely",
        "Cushions around her rather than behind her",
        "Letting her topple rather than catching every time"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "She's floppy, or won't wake properly",
        "She isn't using one side of her body at all",
        "She's pale, grey or blue",
        "She's lost a skill she previously had"
      ],
      "lead": "Blue or grey, or a floppy baby you cannot wake — call your local emergency number now."
    },
    "quick": "She works it out herself — floor time and opportunity are what you provide. Not sitting unsupported by around nine months corrected is worth raising at her next check."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "head-tilt-in-tummy-time",
    "first-laugh",
    "playing-with-a-three-month-old"
  ],
  "seo": {
    "description": "Babies usually learn to sit through floor play and practice rather than formal training; steady support and time do most of the work."
  },
  "longform": [
    {
      "h": "The question, asked plainly",
      "t": "Do you train a baby to sit, or does she figure it out herself?\n\nShe figures it out. What you can do is give her the conditions, and the most useful of those is time on the floor."
    },
    {
      "h": "How it actually arrives",
      "t": "It builds out of tummy time. Pushing up on her arms develops the back and neck strength that sitting needs, so the two aren't separate projects.\n\nThen comes tripod sitting — propped forward on her own hands, wobbling, lasting a few seconds. Then longer. Then hands free. Then being able to get into sitting on her own, which is a later and separate skill.\n\nRoughly five to eight months corrected for unsupported sitting, with a wide range either side.\n\nWe watched ours rolling well and not moving towards sitting at all, and asked why. The answer is that rolling and sitting develop in parallel rather than in sequence, and one doesn't lead to the other."
    },
    {
      "h": "The thing not to do",
      "t": "Propping her upright in seats and supports for long stretches.\n\nIt looks like practice and it isn't — she's being held in position by the chair rather than by her own muscles, so she gets the appearance of sitting without building any of the strength. It also takes away floor time, which is where the actual work happens.\n\nStraight legs, poor balance, and toppling sideways are all normal parts of learning. Toppling is how she learns to correct.\n\nCushions around her rather than behind her, so a fall is soft in any direction. And let her fall. Catching her every time removes the lesson.\n\nNot sitting unsupported by around nine months corrected, check with a doctor.\n\nA strong and consistent preference for one side, or one side not being used.\n\nLegs that are very stiff or very floppy compared to the other.\n\nAnd a skill that's been lost rather than not yet gained. That one always gets mentioned, whatever it is."
    }
  ],
  "order": 100,
  "batch": "7"
},
{
  "id": "hand-preference",
  "topic": "development",
  "icon": "blocks",
  "featured": false,
  "title": "Why does my baby favour one hand?",
  "ages": [
    "2–3 months",
    "4–6 months",
    "7–9 months"
  ],
  "read": 3,
  "summary": "A mild preference can happen. A strong, consistent preference before eighteen months is worth raising.",
  "keywords": [
    "hand preference baby",
    "left or right handed baby",
    "favouring one side",
    "baby stronger side"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "She isn't using one arm or one side at all",
      "She's floppy, or won't wake properly",
      "One arm or leg is held stiffly or oddly",
      "She's lost the use of a hand she was using before"
    ],
    "lead": "A floppy baby you cannot wake — call your local emergency number now."
  },
  "panel": {
    "eyebrow": "Development • 2–9 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Mild swapping preference through the first year",
        "True handedness usually settles much later",
        "Reaching more with the nearer hand",
        "Using both hands in most activities"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Offering things at her midline rather than to one side",
        "Noticing whether she could use the other hand, not just whether she chose to",
        "Alternating how we carried and held her",
        "Raising it at a scheduled check rather than between them"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "She isn't using one arm or one side at all",
        "She's floppy, or won't wake properly",
        "One arm or leg is held stiffly or oddly",
        "She's lost the use of a hand she was using before"
      ],
      "lead": "A floppy baby you cannot wake — call your local emergency number now."
    },
    "quick": "A mild preference can happen, but she should still use both hands. A strong, consistent preference before eighteen months is worth raising at her next check."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "playing-with-a-three-month-old",
    "independent-play",
    "when-to-start-playing"
  ],
  "seo": {
    "description": "A small preference can happen, but consistently avoiding one hand or one side before eighteen months is worth discussing with a professional."
  },
  "longform": [
    {
      "h": "She grabs with both, but there's a favourite",
      "t": "That was the observation, and the question underneath it — asked outright — was whether it could be scoliosis.\n\nIt's worth taking that question seriously rather than dismissing it, because the reasoning is sound: a consistently stronger side does sometimes mean something. It's just that at this age it usually doesn't."
    },
    {
      "h": "What's ordinary",
      "t": "Babies use both hands and swap which one they favour, often from week to week and depending on what they're doing.\n\nTrue handedness generally settles much later than people expect — often well into the second or third year.\n\nSo a baby who reaches more often with one hand, or seems more confident with it, is ordinary. She's also more likely to use whichever hand is nearer to the thing she wants, which makes a preference look stronger than it is depending on where you sit."
    },
    {
      "h": "The distinction that matters",
      "t": "Not which hand she chooses. Whether she can use the other one.\n\nA baby with a mild preference still uses both — bringing both to the midline, transferring objects between them, bearing weight on both arms in tummy time.\n\nA strong, consistent preference before eighteen months, or an arm she genuinely doesn't use, is different and worth raising. Early assessment is much more useful than waiting to see.\n\nSo the test we used: offer something at her midline, where neither hand is closer, and see what happens. And watch whether the less-favoured hand does anything at all.\n\nThere was a second one tucked in alongside it: when we hold her in one position she cries, and stops the moment we change it — is she in pain? She wasn’t. She simply had a preference. After all she is a little human being that has wants and likes too.\n\nThat's worth asking about directly, particularly alongside a one-sided preference, because a position that reliably causes distress can point at neck or hip discomfort rather than preference.\n\nIt isn't an emergency. It is something to mention rather than work around."
    }
  ],
  "order": 101,
  "batch": "7"
},
{
  "id": "playing-with-a-three-month-old",
  "topic": "development",
  "icon": "blocks",
  "featured": false,
  "title": "What can I do with my three-month-old?",
  "ages": [
    "2–3 months",
    "4–6 months"
  ],
  "read": 2,
  "summary": "Less than you think, and more repetitively. She's learning that things happen, and that you respond.",
  "keywords": [
    "playing with 3 month old",
    "baby activities 3 months",
    "what to do with baby",
    "baby play ideas"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "She's floppy, or won't wake properly",
      "She stops responding to faces or voices altogether",
      "She's pale, grey or blue",
      "She's lost a skill she previously had"
    ],
    "lead": "Blue or grey, or a floppy baby you cannot wake — call your local emergency number now."
  },
  "panel": {
    "eyebrow": "Development • 2–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Short bursts, several times a day",
        "Enormous repetition of the same simple thing",
        "Looking away when she's had enough",
        "Some days she isn't interested at all"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Repeating one thing rather than rotating through five",
        "Narrating whatever we were doing, out loud, constantly",
        "Leaving pauses so she could answer",
        "Following what she was already looking at"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "She's floppy, or won't wake properly",
        "She stops responding to faces or voices altogether",
        "She's pale, grey or blue",
        "She's lost a skill she previously had"
      ],
      "lead": "Blue or grey, or a floppy baby you cannot wake — call your local emergency number now."
    },
    "quick": "Short bursts, heavy repetition, and following what she's already interested in. Stop when she looks away — pushing through it makes the next hour harder."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "learning-to-sit",
    "independent-play",
    "head-control"
  ],
  "seo": {
    "description": "Simple, repeated play is enough for a three-month-old: talking, faces, floor time, reaching and stopping when she has had enough."
  },
  "longform": [
    {
      "h": "The dos are shorter than you'd expect",
      "t": "We asked for the dos and don'ts of playing with a three-month-old, half expecting a curriculum.\n\nIt's mostly four things: your face, your voice, something to look at, and time on the floor. Everything else is variation."
    },
    {
      "h": "Repetition is the point",
      "t": "This is the counterintuitive bit. The instinct is to keep things varied so she doesn't get bored.\n\nShe doesn't get bored the way you do. Doing the same small thing over and over is how she learns that an action has a result — and the twentieth repetition is doing more than the first.\n\nSo: the same silly noise. The same rattle in the same spot. The same peekaboo. Long past the point where you're tired of it.\n\nLeave gaps too. Say something, then wait five long seconds. It feels like an eternity and it's how conversation gets built — she needs far more processing time than feels natural, and most of us fill the silence before she's had a chance. Papa once talked like he does normally, and Ari simply started to cry. It was too quick and too much to process all in one go. Their mind is still developing. He was overexcited and ti backfired."
    },
    {
      "h": "Follow rather than direct",
      "t": "Name what she's already looking at instead of redirecting her to what you'd prefer.\n\nIt sounds like a small thing and it's one of the more consistent findings in early language development. Her attention is already somewhere; putting words on that is worth more than moving it.\n\nDon't push past the point where she looks away. Turning her head, glazing, fussing, hiccupping — that's a break request, and overriding it produces an overstimulated baby you'll then spend an hour settling.\n\nDon't fill the room with noise and lights at once. Several things competing means none of them land.\n\nDon't prop her in seats for long stretches instead of floor time.\n\nAnd don't measure a day by how much you did. Some days she isn't interested, and that's a day, not a failure."
    }
  ],
  "order": 102,
  "batch": "7"
},
{
  "id": "choosing-toys",
  "topic": "development",
  "icon": "blocks",
  "featured": false,
  "title": "Which baby toys are actually worth buying?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months",
    "7–9 months"
  ],
  "read": 2,
  "summary": "Very few. Simple, open-ended and slightly ahead of where she is beats anything with batteries.",
  "keywords": [
    "baby toys",
    "montessori toys",
    "best toys for babies",
    "toys by month",
    "what toys to buy"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "She chokes, or struggles to breathe",
      "Anything small enough to swallow has gone missing",
      "She's floppy, or won't wake properly",
      "She's pale, grey or blue"
    ],
    "lead": "Blue or grey, a struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now."
  },
  "panel": {
    "eyebrow": "Development • 0–9 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Babies need remarkably few toys",
        "Household objects often beat bought ones",
        "One or two things out at a time works better",
        "Interest in a toy comes and goes"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Rotating a small set rather than having everything out",
        "Choosing things she could do something to",
        "Play gym and kicking toys before anything complicated",
        "Keeping the ones she actually returned to"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "She chokes, or struggles to breathe",
        "Anything small enough to swallow has gone missing",
        "She's floppy, or won't wake properly",
        "She's pale, grey or blue"
      ],
      "lead": "Blue or grey, a struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now."
    },
    "quick": "Simple, open-ended and a little ahead of where she is. Rotate a small set rather than filling the floor, and check everything for parts small enough to swallow."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "independent-play",
    "head-control",
    "growth-spurt-signs"
  ],
  "seo": {
    "description": "The most useful baby toys are simple, safe and suited to the stage; you do not need a room full of expensive equipment."
  },
  "longform": [
    {
      "h": "We asked for a list and got a philosophy",
      "t": "The question was which toys to buy, Montessori style, and then a list for the whole year rather than just for sitting.\n\nWhat came back was less about brands than about a principle, and the principle turned out to be the useful part: the toy should do less so she does more."
    },
    {
      "h": "Roughly what suits when",
      "t": "Early on — high contrast cards, something to look at overhead, and your face, which remains unbeaten.\n\nAround two to four months, a play gym. Things hanging where she can bat at them, which is how batting becomes reaching. Anything she can kick is excellent value, because feet get going before hands are reliable.\n\nAround four to six months, things she can grip and get to her mouth. Rings, rattles, soft blocks, a wooden spoon. Texture matters more than complexity.\n\nFrom around six months, containers and objects — things to put in, take out, bang together, and drop repeatedly while watching you pick them up.\n\nAll of that runs on corrected age if she was born early."
    },
    {
      "h": "What we found didn't earn its place",
      "t": "Anything that does the playing for her. A toy that lights up and sings when touched gets attention for a week and teaches very little, because the toy is the active one.\n\nToo many things out at once. Two or three available, the rest put away, rotated every so often — she engages far more with a small set.\n\nAnd anything bought for a stage she's nowhere near. It sits there, you feel guilty, and she reaches it three months later having forgotten it exists.\n\nNothing small enough to pass through a toilet roll tube. Nothing with cords or ribbons long enough to wrap. Nothing with parts that could come loose.\n\nCheck seams and joins periodically, particularly on soft toys, because everything ends up in her mouth.\n\nAnd nothing in the cot. Whatever she plays with during the day, the sleep surface stays empty."
    }
  ],
  "order": 103,
  "batch": "7"
},
{
  "id": "independent-play",
  "topic": "development",
  "icon": "blocks",
  "featured": false,
  "title": "When will my baby play independently?",
  "ages": [
    "4–6 months",
    "7–9 months",
    "10–12 months"
  ],
  "read": 2,
  "summary": "Sooner than you'd think, if you resist interrupting. Watching without joining in is a skill worth building — for both of you.",
  "keywords": [
    "independent play",
    "baby entertain herself",
    "playing alone",
    "when can baby play alone"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "She's floppy, or won't wake properly",
      "She stops responding to faces or voices altogether",
      "She's pale, grey or blue",
      "She's lost a skill she previously had"
    ],
    "lead": "Blue or grey, or a floppy baby you cannot wake — call your local emergency number now."
  },
  "panel": {
    "eyebrow": "Development • 4–12 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "A few minutes at a time from around four to six months",
        "Stretches lengthen through the first year",
        "She'll check you're still there and carry on",
        "Interest comes in bursts, not steadily"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Staying nearby without joining in",
        "Not interrupting her when she was absorbed",
        "Fewer toys out rather than more",
        "Starting when she was fed, changed and not tired"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "She's floppy, or won't wake properly",
        "She stops responding to faces or voices altogether",
        "She's pale, grey or blue",
        "She's lost a skill she previously had"
      ],
      "lead": "Blue or grey, or a floppy baby you cannot wake — call your local emergency number now."
    },
    "quick": "A few minutes from around four to six months, lengthening through the year. Stay nearby, don't interrupt when she's absorbed, and put fewer toys out rather than more."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "rolling-sitting-crawling",
    "first-words",
    "head-control"
  ],
  "seo": {
    "description": "Independent play starts in very short bursts and grows slowly; staying nearby and making the space safe can help it develop."
  },
  "longform": [
    {
      "h": "Two questions in the same conversation",
      "t": "When do babies learn to entertain themselves for a long time. And then, separately: is it all right to watch your baby without interacting with her the whole time?\n\nThose belong together, because the second one is how you get the first."
    },
    {
      "h": "Yes, and it's necessary",
      "t": "Constant interaction isn't required and isn't ideal. A baby who is always being engaged never gets to find out what happens when she's the one doing the deciding.\n\nWhat she needs is you nearby and available — she'll look over, check you're there, and carry on. That glance is the whole mechanism. Presence rather than performance.\n\nSo watching her without joining in isn't neglect. It's giving her room."
    },
    {
      "h": "Roughly when",
      "t": "A few minutes at a time from around four to six months corrected. Longer stretches build through the first year and beyond.\n\nIt comes in bursts rather than steadily, and it collapses entirely when she's tired, hungry, teething or working on a new skill.\n\nThe biggest single thing you can do is not interrupt. When she's absorbed in something, the urge to comment, praise or improve it is strong — and it ends the stretch. Concentration is the thing being built, and every interruption resets it.\n\nFewer toys out. A floor covered in options produces two seconds on each.\n\nStarting when she was fed, changed and reasonably rested, rather than using it to buy time when she was already getting upset.\n\nSitting where she could see us and doing something else — not on a phone right next to her, which she notices and finds far more interesting than any toy.\n\nAnd accepting that some days there's no independent play at all, and that's a day rather than a regression."
    }
  ],
  "order": 104,
  "batch": "7"
},
{
  "id": "checklist-mode",
  "topic": "sanity",
  "icon": "heart",
  "featured": false,
  "title": "Why am I caring for my baby but not enjoying it?",
  "ages": [
    "2–3 months",
    "4–6 months",
    "7–9 months"
  ],
  "read": 3,
  "summary": "Being on duty is not the same as being present, and months of the first makes the second very hard. It's a workload problem more often than a feelings problem.",
  "keywords": [
    "not enjoying parenthood",
    "checklist mode",
    "parental burnout",
    "going through the motions",
    "new parent exhaustion"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Any thoughts of harming yourself or the baby — ring your doctor or a crisis line now",
      "You feel unable to keep yourself or her safe",
      "You're losing touch with what's real",
      "You can't function at all"
    ]
  },
  "panel": {
    "eyebrow": "Parent Sanity • 2–9 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Long stretches of being on duty flatten enjoyment",
        "Very common and rarely admitted out loud",
        "Often worse when the load is unevenly split",
        "It usually shifts when the workload does, not when you try harder"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Naming the specific thing that was hardest that week",
        "Splitting nights properly rather than both being wrecked",
        "Taking help when it was offered, without earning it first",
        "One short stretch with her where nothing had to be achieved"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Any thoughts of harming yourself or the baby — ring your doctor or a crisis line now",
        "You feel unable to keep yourself or her safe",
        "You're losing touch with what's real",
        "You can't function at all"
      ]
    },
    "quick": "Being on duty for months flattens enjoyment, and it's usually a workload problem rather than a feelings one. Persistent low mood, numbness or hopelessness is worth a doctor's appointment — don't leave it."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "overwhelmed-new-parent",
    "parent-sleep-deprivation",
    "visitors"
  ],
  "seo": {
    "description": "Going through the motions can be a sign of exhaustion rather than a lack of love; practical help and honest support matter."
  },
  "longform": [
    {
      "h": "The sentence that describes it best",
      "t": "The funny thing is I'm with her but not enjoying her, because I'm on checklist mode.\n\nThat's a precise description of something a lot of parents live in and very few say out loud. You're present. You're doing everything. And you're not really there."
    },
    {
      "h": "What checklist mode actually is",
      "t": "When you're the one holding the schedule — feeds, naps, nappies, bottles, laundry, the next appointment — your attention is permanently ahead of the moment.\n\nYou can't enjoy the thing you're managing. Those two states use the same part of you, and the managing wins because it has deadlines.\n\nIt gets worse when the load is uneven, when there's no help, and when the parts of the day that aren't baby are chores rather than rest. If your time off consists of the house rather than yourself, there's no off."
    },
    {
      "h": "It's usually a workload problem",
      "t": "That's the most useful reframe we found. The instinct is to treat it as a feelings problem — something wrong with how you feel about your child — and to try to feel differently.\n\nThat doesn't work, and it adds guilt on top.\n\nWhat shifts it is changing the load. Splitting nights properly. Taking the help that's offered instead of declining it out of some idea that you should be coping. Getting one stretch of time where nothing has to be achieved.\n\nWe turned down a great deal of help early on and it achieved nothing except making us worse at managing.\n\nA short period each day with her where there was no task attached. Not a feed, not a change, not tummy time with a purpose. Ten minutes on the floor with no objective.\n\nIt sounds like nothing. But checklist mode is a habit of attention, and the only way out is occasionally putting the checklist down.\n\nIf the flatness doesn't lift when the load eases — if it's persistent low mood, numbness, or no enjoyment in anything — that's worth taking to a doctor. Postnatal depression can affect either parent. It can be missed in fathers because fewer people ask how they are doing."
    }
  ],
  "order": 105,
  "batch": "7"
},
{
  "id": "her-first-cold",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "What should I do when my baby has her first cold?",
  "ages": [
    "2–3 months",
    "4–6 months",
    "7–9 months",
    "10–12 months"
  ],
  "read": 3,
  "summary": "The first one is a shock. Most of it is nursing her through it rather than treating it — and you will probably never work out where it came from.",
  "keywords": [
    "cold",
    "snot",
    "mucus",
    "congestion",
    "saline",
    "suction",
    "cough",
    "runny nose",
    "first illness"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "She's working hard to breathe — ribs pulling in, nostrils flaring, grunting with each breath",
      "She pauses in her breathing, or goes pale, grey or blue",
      "She's floppy, hard to wake, or her cry is nothing like her usual one",
      "She's under three months with a temperature of 38°C or above"
    ],
    "lead": "Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now."
  },
  "panel": {
    "eyebrow": "Health • 2–12 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "A blocked or runny nose, sneezing and a mild cough",
        "Symptoms often feel worse before they start improving",
        "Shorter feeds, because she can't breathe through her nose and suck at the same time",
        "A cough that comes along with it and outstays the rest"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Saline just before feeds rather than on a schedule — feeding got easier",
        "Gentle suction only when her blocked nose was stopping a feed",
        "Smaller feeds more often, and counting wet nappies instead of millilitres",
        "Writing down the day it started, so we weren't guessing by day five whether it was improving"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "She's working hard to breathe — ribs pulling in, nostrils flaring, grunting with each breath",
        "She pauses in her breathing, or goes pale, grey or blue",
        "She's floppy, hard to wake, or her cry is nothing like her usual one",
        "She's under three months with a temperature of 38°C or above"
      ],
      "lead": "Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now."
    },
    "quick": "Most baby colds need comfort, saline and time. Watch her breathing, feeding and wet nappies more closely than the amount of mucus."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "blocked-nose-newborn",
    "a-slightly-raised-temperature",
    "newborn-immune-and-going-out"
  ],
  "seo": {
    "description": "Simple ways to help a baby through her first cold, plus the breathing, feeding and fever signs that need medical help."
  },
  "longform": [
    {
      "h": "Where did the cold come from?",
      "t": "This was the question we kept coming back to, and it is almost always unanswerable. Cold viruses spread on hands and surfaces as much as through the air, the incubation period is a couple of days, and a baby who has been nowhere can still catch one from an adult who felt perfectly fine when they held her.\n\nWe spent a day working backwards through who had visited and what we had touched. It changed nothing. The useful version of that question is forward-looking — hands washed before she's picked up, nobody unwell holding her — not backwards into an investigation.\n\nKnowing the arc made it much less frightening. Sneezing and a clear runny nose first. By the second or third day the mucus thickens and she sounds much worse, which is the part that makes you panic.\n\nSo the worst day is usually not the first day, and getting worse on day three is not the same as getting ill. We found it far easier once we stopped reassessing the whole situation every two hours and instead looked at where we were against that curve."
    },
    {
      "h": "What helped her breathe and feed",
      "t": "A small baby breathes through her nose, so a blocked one shows up most at feeds. Saline drops soften things so she can clear them herself, and the timing that worked for us was just before a feed rather than at set intervals through the day.\n\nWe didn’t use suction that much, we were mostly using saline solution. Once or twice when it is genuinely blocking a feed is reasonable. Repeatedly, through the day, irritates the lining and leaves her more congested than she started.\n\nFeeds get shorter and more frequent, because she has to stop and breathe. That is not a feeding problem to be solved, it is a nose problem showing up at the bottle.\n\nWe stopped tracking volumes and tracked wet nappies instead, which is the number that actually tells you whether she is getting enough. Smaller amounts more often, upright, with patience for the pauses, got us through it."
    },
    {
      "h": "What we watched",
      "t": "The thermometer felt like the thing to reach for and it was the least useful piece of information we had. What mattered was her breathing and how she looked between the bad moments.\n\nBreathing is the one to learn properly. Fast is common with a cold. Working hard is different — the skin pulling in under the ribs or at the base of the throat, nostrils flaring, a grunt at the end of each breath.\n\nIf she was born early"
    }
  ],
  "order": 106,
  "batch": "8"
},
{
  "id": "a-slightly-raised-temperature",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "Is 37.2°C or 37.7°C a fever in a baby?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months",
    "7–9 months",
    "10–12 months"
  ],
  "read": 3,
  "summary": "Temperatures in the 37s are often normal variation. A reading of 38°C or higher is a fever, and under three months it needs urgent advice.",
  "keywords": [
    "temperature",
    "37.2",
    "37.4",
    "low grade",
    "febricola",
    "thermometer",
    "fever",
    "bath"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "She's under three months with any temperature of 38°C or above",
      "She's floppy, very hard to wake, or her cry has changed",
      "A rash that doesn't fade when pressed under a glass",
      "Working hard to breathe, grunting, or pauses in her breathing"
    ],
    "lead": "A pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now."
  },
  "panel": {
    "eyebrow": "Health • 0–12 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "A normal temperature can move slightly through the day",
        "Crying, feeding, a warm room or extra layers can raise a reading",
        "A fever is 38°C or higher",
        "How she looks and behaves matters too"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "One thermometer, under the arm, used the same way every time — so readings were comparable",
        "Taking the layers off and waiting twenty minutes before deciding anything",
        "Reporting the number and the method, without adding a correction to it ourselves",
        "Looking at her between readings — feeding, alert, playing — rather than at the screen"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "She's under three months with any temperature of 38°C or above",
        "She's floppy, very hard to wake, or her cry has changed",
        "A rash that doesn't fade when pressed under a glass",
        "Working hard to breathe, grunting, or pauses in her breathing"
      ],
      "lead": "A pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now."
    },
    "quick": "A fever is 38°C or higher. If she is under three months, that needs urgent medical advice even if she otherwise seems well."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "first-fever",
    "her-first-cold",
    "baby-vaccine-side-effects"
  ],
  "seo": {
    "description": "Learn what temperatures in the 37s usually mean, how to check them properly and when a baby's fever needs urgent advice."
  },
  "longform": [
    {
      "h": "What do the numbers mean?",
      "t": "Everyone tells you 38°C. Nobody tells you what to do with 37.4. We got readings in the 37s constantly, and the first few times we treated each one as the beginning of something.\n\nA baby's temperature is not a fixed number. It drifts through the day, rises after a feed or a long cry, and goes up with an extra layer or a warm room. Most of what we recorded in that band resolved by taking a blanket off.\n\nWe used a Philips baby thermometer. At first we used an ear thermometer. As she got older, we moved to a forehead thermometer made for babies. For useful comparisons, we used the same thermometer in the same way each time."
    },
    {
      "h": "How we took her temperature",
      "t": "This is the part worth knowing before you need it. In the first three months a fever is taken much more seriously, because a small baby can be unwell without looking dramatically unwell, and the usual reassurance from a happy, feeding baby does not apply in the same way.\n\nSo 38°C under three months is a call now, not in the morning, even if she seems fine. If she was born early, ask her doctor which age they want you to count from for this — we asked, and were told plainly.\n\nWe asked whether to bath her with a reading of 37.4, and the honest answer is that a bath is neither the treatment nor the danger.\n\nA normal warm bath is fine if she seems comfortable and will enjoy it. A cool bath or a cold sponge-down to bring a temperature down is not something to do — it makes a baby shiver, which is uncomfortable and counterproductive. And if she's miserable, the bath can simply wait a day. We used a cool compress on her forehead because it seemed gentler and made her more comfortable. We did not treat it as a replacement for medical advice."
    },
    {
      "h": "When we stopped guessing",
      "t": "Between readings, is she feeding? Is she alert when she's awake? Does she look at you and respond?\n\nThat set of answers was more informative than every number we wrote down. A baby at 38.2 who is drinking and smiling between spikes was a different situation from a baby at 37.6 who had gone quiet and floppy — and it is the second one that gets a phone call.\n\nBefore you need it"
    }
  ],
  "order": 107,
  "batch": "8"
},
{
  "id": "anti-reflux-milk",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "Does anti-reflux milk help with reflux?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months",
    "7–9 months"
  ],
  "read": 3,
  "summary": "Anti-reflux milk is thicker, not medicine. It may reduce spit-up, but the preparation and teat still matter.",
  "keywords": [
    "anti-reflux",
    "AR milk",
    "thickener",
    "spit up",
    "formula",
    "changing milk",
    "reflux"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Forceful vomiting, or vomit that is green or has blood in it",
      "A swollen, hard tummy, or she's unable to stop crying and unlike herself",
      "She refuses feeds altogether, or wet nappies drop away",
      "She's floppy, very hard to wake, or her breathing has changed"
    ],
    "lead": "A floppy baby you cannot wake — call your local emergency number now."
  },
  "panel": {
    "eyebrow": "Health • 0–9 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Some spit-up can continue even with thicker milk",
        "Less comes back up, which is a laundry improvement more than a medical one",
        "It won't fix a baby who is distressed, in pain or not gaining",
        "It can make stools firmer or change their pattern"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Writing down the date we changed the milk",
        "Changing one thing at a time, and giving it a week before judging",
        "Checking the teat flow, because a thicker milk through the same teat is a harder feed"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Forceful vomiting, or vomit that is green or has blood in it",
        "A swollen, hard tummy, or she's unable to stop crying and unlike herself",
        "She refuses feeds altogether, or wet nappies drop away",
        "She's floppy, very hard to wake, or her breathing has changed"
      ],
      "lead": "A floppy baby you cannot wake — call your local emergency number now."
    },
    "quick": "Anti-reflux milk is thicker milk, not medicine. It may reduce spit-up, but use it only as directed and check that the teat still flows comfortably."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "reflux-medicine",
    "reflux-or-spit-up",
    "could-it-be-the-milk"
  ],
  "seo": {
    "description": "Anti-reflux milk may reduce spit-up, but it needs the right teat, careful preparation and guidance from your baby's doctor or nurse."
  },
  "longform": [
    {
      "h": "What is anti-reflux milk?",
      "t": "Anti-reflux formula is standard infant formula with a thickening agent in it — usually a starch or a gum. The milk is heavier, so less of it comes straight back up. That is the whole mechanism.\n\nIt is sold on a shelf, not prescribed, and it is not treating anything. We found that framing useful, because once we stopped thinking of it as medicine we also stopped expecting it to tell us whether something was wrong with her.\n\nIt reduced the volume of what came back up noticeably. Fewer full changes of clothes, fewer soaked muslins, and less of that feeling that an entire feed had gone onto the sofa. More of the feed also seemed to stay down.\n\nIt did not stop spit-up, and it did not change her mood or her weight curve. She still spat up on AR milk. On the days when we had hoped it was the answer to everything, that was deflating — which is exactly why it is worth knowing in advance that it is a laundry intervention."
    },
    {
      "h": "What changed for us",
      "t": "Thicker milk through the same teat is a harder feed. We spent a stretch convinced she had gone off her milk when the real problem was that she was working too hard to get it out.\n\nIf a baby starts fighting the bottle shortly after you change to a thicker milk, look at the teat before you look at the milk again. A slightly faster flow, or a teat rated for the thicker formulas, is often the whole fix.\n\nWe went through several milks in a fortnight at one point, chasing an improvement, and by the end we genuinely could not say what she was reacting to. That is the trap.\n\nOne change at a time. Give it about a week unless something is clearly wrong. Write down the date and what changed."
    },
    {
      "h": "Change one thing at a time",
      "t": "We did ask about giving part of a feed as ordinary milk and part as AR, to get some of the effect without all of it. The right answer was to ask her doctor rather than work out a ratio ourselves, and that is what we did.\n\nThe same goes for mixing in a thickener of your own, adding cereal to a bottle, or making an AR milk up more concentrated than the tin says. Formula is made to a specific dilution for a reason."
    }
  ],
  "order": 108,
  "batch": "8"
},
{
  "id": "reflux-medicine",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "What should I ask about my baby's reflux medicine?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months",
    "7–9 months"
  ],
  "read": 4,
  "summary": "A prescription is not the end of the conversation. These are the questions we wish we'd asked in the room rather than in the car park afterwards.",
  "keywords": [
    "reflux medicine",
    "antacid",
    "prescription",
    "acid suppression",
    "dose",
    "review",
    "questions for the doctor"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Forceful vomiting, or vomit that is green or has blood in it",
      "Blood in her stools, or a swollen, hard tummy",
      "She's refusing all feeds, or wet nappies have dropped away",
      "She's floppy, very hard to wake, or her breathing has changed"
    ],
    "lead": "A floppy baby you cannot wake — call your local emergency number now."
  },
  "panel": {
    "eyebrow": "Health • 0–9 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Reflux medicine is usually offered for pain and distress, not for the amount of spit-up",
        "Most prescriptions come with a dose that changes as she grows",
        "A trial period and a review date are a normal part of it",
        "Improvement is often gradual, over a week or two, not overnight"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Asking what the medicine is for — the spitting, or the pain — so we knew what success looked like",
        "Asking how long the trial runs and when it's reviewed, before leaving the room",
        "Writing the dose down in the room — how much, how often",
        "Asking whether the dose changes as she gains weight, and who recalculates it"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Forceful vomiting, or vomit that is green or has blood in it",
        "Blood in her stools, or a swollen, hard tummy",
        "She's refusing all feeds, or wet nappies have dropped away",
        "She's floppy, very hard to wake, or her breathing has changed"
      ],
      "lead": "A floppy baby you cannot wake — call your local emergency number now."
    },
    "quick": "Ask what the medicine is treating, how long the trial lasts, when it will be reviewed and whether the dose changes as she grows."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "anti-reflux-milk",
    "reflux-or-spit-up",
    "yellow-vomit"
  ],
  "seo": {
    "description": "Useful questions to ask about reflux medicine, including what it treats, how the dose is checked and when the trial is reviewed."
  },
  "longform": [
    {
      "h": "Why we asked questions",
      "t": "We were handed a prescription for Ari's reflux and left the appointment without really understanding what it was meant to achieve. Then we sat in the car reading about it on a phone, which is the worst possible order to do these things in.\n\nAsking is not doubting the doctor. We found that the questions were welcomed, and that the answers made us much calmer about giving it to her. We are not doctors and we were not trying to second-guess one.\n\nWhat is this for — the spitting, or the pain?\n\nThat one question reorganised everything for us. If the answer is pain and distress, then the measure of whether it is working is her comfort, not the number of muslins. We had been watching the laundry, which meant we were measuring the wrong thing and would have called it a failure."
    },
    {
      "h": "What we wrote down",
      "t": "Doses for babies are usually tied to weight, and a baby's weight changes faster than anything else about her. A dose that was right at 3kg may not be right at 6kg.\n\nSo: how much, how often, for how long, and who adjusts it as she grows? We wrote the answers down in the room on a phone note. We also asked whether it goes before or after a feed, because that detail was easy to get wrong at home and nobody had volunteered it.\n\nThe thing that made us most comfortable was treating it as a trial rather than a new permanent fact. We asked how long before we should expect to see a difference, what we should be looking for, and when it would be reviewed.\n\nA review date matters because babies get better on their own. Reflux tends to improve as they spend more time upright and start solids. Without a review, a medicine started at six weeks for a problem that resolved at four months can carry on for a long time simply because nobody revisited it."
    },
    {
      "h": "How we judged the trial",
      "t": "We kept something very simple: feed times, roughly how much, and a word about how she was. Not a spreadsheet. Enough that at the review we could say what the fortnight had actually looked like instead of recalling the last bad night.\n\nThat turned the follow-up appointment into a real conversation. It also, more than once, showed us that a week we had experienced as a disaster had in fact contained two difficult days and five normal ones.\n\nWrite these down in the room. We kept a pen and paper ready because leaving the room and trying to remember later did not work. Something always needed us, we got distracted, and the answer was gone."
    }
  ],
  "order": 109,
  "batch": "8"
},
{
  "id": "could-it-be-the-milk",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "Could my baby's milk be causing bloating or discomfort?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months",
    "7–9 months"
  ],
  "read": 4,
  "summary": "Milk is easy to blame, but bloating and discomfort can have other causes. Change one thing at a time and ask what is being tested.",
  "keywords": [
    "allergy",
    "intolerance",
    "cow's milk protein",
    "hypoallergenic",
    "bloating",
    "elimination diet",
    "breast milk"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Swelling of the lips, face or tongue, hives spreading quickly, or any difficulty breathing after a feed",
      "Blood or mucus in her stools",
      "Forceful vomiting, or vomit that is green or has blood in it",
      "A hard, swollen, painful tummy, or crying that is completely unlike her"
    ],
    "lead": "A struggle to breathe — call your local emergency number now."
  },
  "panel": {
    "eyebrow": "Health • 0–9 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "A bloated, gassy tummy is extremely common and usually not an allergy",
        "Gaining weight, feeding and settling is reassuring — unless her tummy is hard",
        "Swallowed air from a fast feed can look exactly like a reaction to milk",
        "An immature gut — particularly after an early birth — handles volume less smoothly for a while"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Asking for the plan before accepting the explanation — what is being tested, and how will anyone know",
        "Slowing the feed down and burping partway through, which solved more than any change of milk did",
        "Not cutting foods out of a diet on a hunch, and asking before removing anything",
        "Writing down symptoms with times, so a pattern could be seen rather than argued about"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Swelling of the lips, face or tongue, hives spreading quickly, or any difficulty breathing after a feed",
        "Blood or mucus in her stools",
        "Forceful vomiting, or vomit that is green or has blood in it",
        "A hard, swollen, painful tummy, or crying that is completely unlike her"
      ],
      "lead": "A struggle to breathe — call your local emergency number now."
    },
    "quick": "Bloating is often swallowed air or an immature gut. Before changing milk, ask what is being tested and how you will know whether it helped."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "anti-reflux-milk",
    "formula-and-constipation",
    "wind-and-gas"
  ],
  "seo": {
    "description": "Bloating and discomfort do not always mean milk allergy; learn what to notice before changing formula or removing foods."
  },
  "longform": [
    {
      "h": "Why milk gets blamed",
      "t": "Milk is the only variable, so milk is the suspect. It's the one thing a baby takes in, it changes in brand and type, and if a mother is breastfeeding then her entire diet becomes a suspect list too.\n\nWe had a stretch where Ari was bloated and the explanation offered was the milk. It had not been the milk the week before, when she was fine on the same milk. That inconsistency is what made us start asking for the reasoning rather than the conclusion.\n\nAir, mostly, and a gut still learning its job.\n\nA baby who drinks fast swallows air. A baby born early has a digestive system that is doing the work of a term baby's before it is quite ready — and ours was pushed on volume faster than she was comfortable with at one point. The result looked dramatic and was not an allergy."
    },
    {
      "h": "Bloating, allergy and intolerance",
      "t": "Worth knowing, because the words get used interchangeably and they point to very different situations.\n\nA true allergic reaction to cow's milk protein is an immune response. The urgent version is fast and obvious — swelling, hives, breathing trouble — and belongs in the red column above. The slower version shows up over days and weeks, often with eczema, blood or mucus in the stools, poor weight gain, and persistent distress."
    },
    {
      "h": "Change one thing at a time",
      "t": "Ari spent a period on a hypoallergenic milk, in small amounts, with breast milk reintroduced gradually afterwards. That was done by a hospital with a plan, and the plan was the important part.\n\nThese milks are not simply a gentler formula to try at random. Ari's hospital used one as part of a clear plan, including how breast milk would be reintroduced and how they would judge the result.\n\nThere was a point where the explanation did not match what we could see. Ari was gaining weight, feeding well and passing stool, but her tummy was hard and bloated. The NICU doctors explained that they were checking for a blockage and watching how it settled. We were told she had been fed too much too soon and her tummy had become inflamed. A few days later, it softened again.\n\nWhat worked was writing the questions down in advance and asking them calmly. Why are you keeping her. What specifically are you checking.\n\nIt was scary because she had been one step from coming home, then we arrived and found her back in intensive care. NICU progress is not always a straight line. We learned that through stress and panic, while the NICU nurses and doctors knew how to handle the setback."
    }
  ],
  "order": 110,
  "batch": "8"
},
{
  "id": "bumps-on-her-body",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "Why are small bumps spreading across my baby's body?",
  "ages": [
    "2–3 months",
    "4–6 months",
    "7–9 months",
    "10–12 months"
  ],
  "read": 3,
  "summary": "Face bumps in the first weeks are one thing. Small bumps appearing on her thighs and creeping towards her tummy are a different question — and the one thing worth doing is a photograph.",
  "keywords": [
    "rash",
    "bumps",
    "thighs",
    "spreading",
    "heat rash",
    "eczema",
    "photograph",
    "glass test"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "A rash that does not fade when pressed under a clear glass",
      "She's floppy, very hard to wake, or her cry has changed",
      "A rash with a temperature of 38°C or above, or any fever under three months",
      "Rapidly spreading swelling, hives, or any difficulty breathing"
    ],
    "lead": "A struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now."
  },
  "panel": {
    "eyebrow": "Health • 2–12 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Small bumps in warm, covered areas — thighs, back, neck creases — are often heat and friction",
        "Baby skin reacts to almost everything and settles again without treatment",
        "A rash can spread over a day or two and then simply go",
        "Dry patches on cheeks, knees and elbows are common from a few months"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Taking one daylight photo each day so we could compare it properly",
        "Learning the glass test properly before we needed it: press a clear glass on the rash and see whether the marks fade",
        "Fewer layers and a cooler room, which cleared more than any cream did",
        "Plain water and patting dry, with nothing new introduced while we were trying to work it out"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "A rash that does not fade when pressed under a clear glass",
        "She's floppy, very hard to wake, or her cry has changed",
        "A rash with a temperature of 38°C or above, or any fever under three months",
        "Rapidly spreading swelling, hives, or any difficulty breathing"
      ],
      "lead": "A struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now."
    },
    "quick": "Take one clear photo each day and notice how she is behaving. A rash that does not fade under pressure needs urgent medical help."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "newborn-skin-bumps",
    "nappy-rash",
    "a-slightly-raised-temperature"
  ],
  "seo": {
    "description": "Small spreading bumps are often harmless, but photographs, the glass test and your baby's behaviour help show when to seek help."
  },
  "longform": [
    {
      "h": "Why spreading looks frightening",
      "t": "A rash that stays put is easy to live with. One that was on her thighs yesterday and is creeping towards her stomach today feels like it is going somewhere, and that is the thing that gets you looking at your phone at two in the morning.\n\nMost of the time the spread is the rash doing its normal thing. Heat rash appears where skin is warm and covered and then shows up in the next warm covered place. A mild irritation follows wherever the thing irritating it has been."
    },
    {
      "h": "Photographs and the glass test",
      "t": "This was the single most practical habit we picked up. Once a day, same light, same bit of skin, in a photo.\n\nIt does two things. It tells you whether the rash is genuinely spreading or whether you have simply been looking at it more closely each time. And it gives a doctor something real to look at, which matters because rashes have a habit of fading on the way to an appointment and reappearing in the car home.\n\nPress a clear glass or tumbler firmly onto the rash and look through it. Most rashes blanch — the colour fades under pressure and comes back when you lift the glass. A rash that stays visible does not blanch, and that needs urgent medical help.\n\nIt is worth doing this once on an ordinary harmless rash, just so you know what blanching looks like when you're calm. Learning it for the first time at 3am on a baby with a temperature is not when you want to be squinting at a glass and wondering what you're looking for."
    },
    {
      "h": "Change one thing at a time",
      "t": "Our instinct when a rash appeared was to change everything at once — new detergent, different soap, a cream, fewer clothes. Then it got better and we had no idea why, and when something similar appeared a month later we were back to nothing.\n\nSo: cool her down first, because heat is the most common cause and costs nothing to remove. Plain water and pat dry. And then genuinely change nothing else for a few days."
    }
  ],
  "order": 111,
  "batch": "8"
},
{
  "id": "marks-from-the-nicu",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "Will the marks from the NICU fade?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 2,
  "summary": "Cannula marks on her hands, heel pricks on her feet, a patch where the tape was. We wanted them gone. Mostly they go on their own, and slowly.",
  "keywords": [
    "NICU",
    "cannula",
    "IV marks",
    "heel prick",
    "tape marks",
    "scars",
    "premature"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "A mark becomes hot, swollen, spreading or weeping",
      "Pus, a crust spreading outwards, or a red line running away from the site",
      "She has a temperature of 38°C or above, or any fever under three months",
      "She's floppy, very hard to wake, or unusually unlike herself"
    ],
    "lead": "A floppy baby you cannot wake — call your local emergency number now."
  },
  "panel": {
    "eyebrow": "Health • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Small bruise-coloured marks where a cannula or drip sat, on hands, feet or scalp",
        "Tiny dots on heels from repeated blood tests",
        "Red or slightly shiny patches where tape and dressings were",
        "Most fades over weeks to months — slowly enough that photographs show it"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Doing nothing to them, which is the advice and the hard part",
        "Keeping the skin plainly moisturised with something unscented, if anything at all",
        "Keeping fresh marks out of direct sun, and covered rather than creamed",
        "Photographing them monthly instead of inspecting them daily — the change only shows over weeks"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "A mark becomes hot, swollen, spreading or weeping",
        "Pus, a crust spreading outwards, or a red line running away from the site",
        "She has a temperature of 38°C or above, or any fever under three months",
        "She's floppy, very hard to wake, or unusually unlike herself"
      ],
      "lead": "A floppy baby you cannot wake — call your local emergency number now."
    },
    "quick": "Most NICU marks fade slowly over weeks or months. Keep the skin comfortable, protect it from strong sun and compare monthly rather than daily."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "nicu-stages",
    "nicu-discharge",
    "newborn-skin-bumps"
  ],
  "seo": {
    "description": "NICU cannula, tape and heel-prick marks usually fade slowly; learn what may help and which changes are worth showing a doctor."
  },
  "longform": [
    {
      "h": "Why the marks upset us",
      "t": "She came home with small marks on her hands and feet from everything that had kept her alive, and we wanted them gone quickly. Looking back, that urge was not really about her skin.\n\nIt is worth saying, because the honest version is useful: the marks were a visible record of a month we had found very hard, and making them disappear felt like it would close something. They faded on their own schedule and the closing happened separately."
    },
    {
      "h": "What actually helps",
      "t": "Very little, and that was our experience rather than a shrug.\n\nTime does most of it. Keeping the skin moisturised with something plain and unscented is reasonable. Keeping fresh marks out of direct sunlight matters, because new skin pigments unevenly in sun and a mark that would have faded can be set darker.\n\nWe looked at them constantly, which meant we never saw them change. A monthly photograph in the same light was what finally showed us they were fading.\n\nThat shift — from daily inspection to monthly comparison — applies to most things about her skin, and it took the heat out of it. The marks were going. They were just going at the speed skin goes at."
    },
    {
      "h": "Look monthly, not daily",
      "t": "A few left a faint paler patch that is still faintly there. For a while that bothered us more than it should have.\n\nShe doesn't know about them. Nobody who meets her notices. And they are from a hospital that looked after her when she needed it."
    }
  ],
  "order": 112,
  "batch": "8"
},
{
  "id": "itchy-eyes",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "Why does my baby have sticky or itchy eyes?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months",
    "7–9 months",
    "10–12 months"
  ],
  "read": 3,
  "summary": "A sticky eye in the first months is usually a blocked tear duct, not an infection. And the drops in your bathroom cupboard are not for a baby.",
  "keywords": [
    "eyes",
    "eye drops",
    "sticky eye",
    "blocked tear duct",
    "conjunctivitis",
    "rubbing eyes",
    "itchy"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "The white of the eye is red, or the eyelid is swollen, hot or puffy",
      "Redness or swelling spreading onto the skin around the eye or towards the cheek",
      "She won't open the eye, or seems in real pain",
      "A temperature of 38°C or above with it, or any fever under three months"
    ]
  },
  "panel": {
    "eyebrow": "Health • 0–12 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "A watery or sticky eye in the first months is commonly a blocked tear duct",
        "Often one eye, worst on waking, with the white of the eye still white",
        "Most blocked ducts clear on their own during the first year",
        "Eye rubbing is often tiredness rather than irritation"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Cooled boiled water on clean cotton, a fresh piece per eye, inner corner outwards",
        "Noting whether the white of the eye was white — always the first question",
        "Photographing it — a sticky morning eye is clean by the appointment"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "The white of the eye is red, or the eyelid is swollen, hot or puffy",
        "Redness or swelling spreading onto the skin around the eye or towards the cheek",
        "She won't open the eye, or seems in real pain",
        "A temperature of 38°C or above with it, or any fever under three months"
      ]
    },
    "quick": "A sticky, watery eye with no redness is often a blocked tear duct. A red eye, swollen lid or redness spreading onto the face needs medical advice."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "her-first-cold",
    "bumps-on-her-body",
    "newborn-skin-bumps"
  ],
  "seo": {
    "description": "Sticky eyes are often caused by a blocked tear duct, while redness, swelling or pain can mean your baby needs medical advice."
  },
  "longform": [
    {
      "h": "Why we looked for drops",
      "t": "Her eyes looked a little itchy. Nothing dramatic — no redness, no swelling, she was perfectly happy. There are allergies in the family, so our assumption was allergic and our instinct was to find something gentle at the pharmacy.\n\nA baby's eye is not the place to try something mild and see. Many pharmacy eye drops are not made for infants. We were told we could use sterile saline or cooled boiled water for gentle cleaning, but we asked before putting anything in her eye."
    },
    {
      "h": "The blocked tear duct clue",
      "t": "This is the common one and it is reassuring once you know the picture. The tear duct that drains into the nose is very narrow in a baby and often not fully open. Tears pool, the eye waters, and overnight the discharge dries into a sticky lid.\n\nThe giveaway is that the white of the eye stays white. One eye, worse in the morning, clean and happy baby, white eye — that is usually a duct, and most clear up on their own somewhere in the first year.\n\nEverything in this guide comes down to one distinction: is the white of the eye white?\n\nA white eye with sticky discharge is the common, dull, self-resolving situation. A red eye, a swollen or hot lid, redness creeping onto the skin around the eye or towards the cheek, an eye she won't open, or real pain — that is a different thing entirely and it goes in the red column above. Infection around the eye in a small baby is taken seriously and quickly, and rightly so."
    },
    {
      "h": "When the eye needs checking",
      "t": "Ari rubbed her face constantly for a stretch and we read it as irritation. Mostly it was tiredness, sometimes it was hunger, and quite a lot of it was simply having discovered that her hands reached her face.\n\nWhat separated them was timing. Rubbing at the end of a wake window, with yawning, was sleep. Rubbing with a blocked nose during a cold was congestion."
    }
  ],
  "order": 113,
  "batch": "8"
},
{
  "id": "vitamin-d-and-iron-drops",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "What if I forget my baby's vitamin D or iron drops?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months",
    "7–9 months",
    "10–12 months"
  ],
  "read": 3,
  "summary": "Missing a few days is not the disaster it feels like at 11pm. Doubling up to catch up is the actual mistake.",
  "keywords": [
    "vitamin D",
    "iron drops",
    "supplements",
    "missed dose",
    "premature",
    "too much iron",
    "probiotic"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "She may have had more than the prescribed dose — call straight away with the bottle nearby",
      "Repeated vomiting, severe tummy pain, or blood in her vomit or stool",
      "She's very hard to wake, very pale, or completely unlike herself",
      "You are unsure how much iron or vitamin D she has swallowed"
    ],
    "lead": "A floppy baby you cannot wake — call your local emergency number now."
  },
  "panel": {
    "eyebrow": "Health • 0–12 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "A short gap does not usually need a catch-up dose",
        "Iron is often prescribed for babies born early, who build smaller stores",
        "Missing days happens in every household and is not an emergency",
        "Most of the dose on her chin and your sleeve is normal"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Same point in the same feed every day — routine rather than a decision",
        "Keeping them visibly next to the bottles instead of in a cupboard",
        "Restarting at the normal dose after a gap, never doubling up for missed days",
        "Asking whether vitamin D and iron needed separating, instead of guessing at the order"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "She may have had more than the prescribed dose — call straight away with the bottle nearby",
        "Repeated vomiting, severe tummy pain, or blood in her vomit or stool",
        "She's very hard to wake, very pale, or completely unlike herself",
        "You are unsure how much iron or vitamin D she has swallowed"
      ],
      "lead": "A floppy baby you cannot wake — call your local emergency number now."
    },
    "quick": "After missed drops, restart the usual dose unless your baby's doctor or nurse says otherwise. Never double up to catch up."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "giving-her-medicine",
    "preemie-growth-charts",
    "corrected-age"
  ],
  "seo": {
    "description": "Missing a few vitamin or iron doses is usually not fixed by doubling up; learn how to restart safely and avoid two people dosing."
  },
  "longform": [
    {
      "h": "Missing a dose",
      "t": "There was a period where we were in survival mode, and we simply forgot the vitamin D drops for a stretch. By the time we noticed, the question in our heads was how much damage we had done.\n\nThe honest answer: very little. Vitamin D works on stores built over weeks and months, not day to day. A gap of days, or even a couple of weeks, is made up by starting again — not by making up the arithmetic.\n\nThis is the one real mistake available here. Missing five days and then giving a larger dose to catch up is worse than missing five days.\n\nVitamin D and iron are both things where too much matters. With iron in particular, an excess is taken seriously — it is one of the more common causes of accidental overdose in small children, which is why prescriptions are weight-based and the bottle comes with its own syringe."
    },
    {
      "h": "Never double up",
      "t": "We had an episode where we thought Ari might have had more iron than she should, and she was sick afterwards. What we got right was ringing straight away rather than watching to see what happened.\n\nThat is the correct instinct and worth stating plainly: a possible overdose of iron is a call now, with the bottle in your hand so you can read out the strength and the dose. Not a search, not a wait-and-see, not a morning call. Vomiting after too much iron is a reason to be on the phone, not a reason to assume it has sorted itself out.\n\nWe asked whether vitamin D and iron needed to be given separately or whether one interfered with the other, because we were guessing at it daily.\n\nThis depends on what your baby has been prescribed, so ask rather than guessing. We gave vitamin D before her milk. We were told to wait about 40 minutes after the feed before giving iron because milk could affect how it was absorbed. That was Ari's plan; follow the instructions for your own baby. Giving each one at the same point every day also turned it into a habit rather than another decision."
    },
    {
      "h": "One simple system",
      "t": "With a night nurse, a grandparent or two parents on shifts, the real risk is not the missed dose. It is the dose given twice because nobody wrote it down.\n\nWe ended up with a note where the bottles lived, with the date ticked off. Unglamorous, and it removed an entire category of argument at 7am."
    }
  ],
  "order": 114,
  "batch": "8"
},
{
  "id": "giving-her-medicine",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "How do I give medicine to my baby?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months",
    "7–9 months",
    "10–12 months"
  ],
  "read": 3,
  "summary": "The dose is the easy part. Getting it in, knowing whether it went in, and not putting it in a bottle she doesn't finish — that's the part nobody explains.",
  "keywords": [
    "medicine",
    "syringe",
    "dose",
    "half tablet",
    "dissolve",
    "spat out",
    "before or after feed"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "She may have had significantly more than her dose — ring immediately with the bottle in your hand",
      "Swelling of the lips, face or tongue, hives, or any difficulty breathing after a dose",
      "She coughs, chokes or goes blue during a dose",
      "Repeated vomiting after doses, or she can't keep anything down"
    ],
    "lead": "Blue or grey, or a struggle to breathe — call your local emergency number now."
  },
  "panel": {
    "eyebrow": "Health • 0–12 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Doses for babies are worked out by weight, so they change as she grows",
        "Liquid medicines come with their own syringe or dropper, calibrated to that bottle",
        "Some go before a feed, some after — and for a few it matters",
        "A good share of the first few doses ends up on her chin"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Asking for the dose in millilitres for her weight, written down",
        "Keeping the syringe from the bottle, and asking the pharmacy for a spare",
        "Small amounts into the side of her mouth, not the back of her throat",
        "Upright, supported, never lying flat, and never while she was crying hard"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "She may have had significantly more than her dose — ring immediately with the bottle in your hand",
        "Swelling of the lips, face or tongue, hives, or any difficulty breathing after a dose",
        "She coughs, chokes or goes blue during a dose",
        "Repeated vomiting after doses, or she can't keep anything down"
      ],
      "lead": "Blue or grey, or a struggle to breathe — call your local emergency number now."
    },
    "quick": "Use the correct syringe, keep her upright and give small amounts into the side of her cheek. Ask before mixing medicine into milk."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "vitamin-d-and-iron-drops",
    "a-slightly-raised-temperature",
    "reflux-medicine"
  ],
  "seo": {
    "description": "Practical tips for giving baby medicine safely, using the correct syringe and avoiding missed, repeated or incomplete doses."
  },
  "longform": [
    {
      "h": "Get the instructions in writing",
      "t": "Not \"a bit twice a day\". The number of millilitres, how many times a day, for how many days, and whether it is before or after a feed. Written down, in the room, while the person who prescribed it is still in front of you.\n\nBaby doses are calculated from weight, and a baby's weight moves quickly. A dose that was right two months ago may not be right now. So the other question is who recalculates it, and when.\n\nThe dropper or syringe that comes in the box is calibrated for that medicine at that concentration. A kitchen spoon isn't a measure, and another bottle's syringe may be marked differently.\n\nIf you lose it, ask the pharmacy for the right one rather than improvising. We asked for a spare one and were simply given one, which was easier than we expected."
    },
    {
      "h": "How we gave it",
      "t": "What worked: upright and supported, never flat on her back. Small amounts at a time rather than the whole dose in one go. Aimed at the inside of her cheek, not the back of her throat, which triggers a gag and sends the lot back out.\n\nWhat did not work was trying while she was crying hard. That was often when she seemed to need it most, but it was also when she was most likely to cough and least likely to swallow. Waiting for a calmer moment, when the medicine allowed it, got more of the dose in.\n\nPutting it in a bottle looks like the elegant solution (if the medicine permitted it) and it creates a specific problem: if she drinks 90ml of a 120ml bottle, how much of the dose did she have?\n\nFor some medicines mixing is fine and for others it isn't — a few interact with milk, and for others it is simply the accounting that fails. So the question to ask is whether this one can go in milk, and if so, into how much."
    },
    {
      "h": "Stop two people dosing",
      "t": "The genuine risk in a house with help, or two parents on shifts, is a double dose rather than a missed one.\n\nA note next to where the medicines live, with the date and a tick, solved it. Written down beats remembered, especially at four in the morning when nobody is sure who did what.\n\nWhen changing shifts, we gave the next person a quick rundown and checked the medicine notebook. It took a minute and prevented missed or repeated doses."
    }
  ],
  "order": 115,
  "batch": "8"
},
{
  "id": "vaccines-and-a-premature-baby",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "Do premature babies follow the normal vaccine schedule?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months",
    "7–9 months"
  ],
  "read": 3,
  "summary": "Almost everything about a premature baby gets counted from the due date. Vaccines are the exception, and that catches parents out.",
  "keywords": [
    "vaccines",
    "premature",
    "corrected age",
    "actual age",
    "RSV",
    "Synagis",
    "schedule",
    "side effects"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "She's under three months with a temperature of 38°C or above, unless her doctor has given you specific post-vaccine advice",
      "She's floppy, very hard to wake, or unusually unresponsive",
      "Working hard to breathe, grunting, or pauses in her breathing",
      "Swelling of the face or lips, or hives spreading quickly"
    ],
    "lead": "A pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now."
  },
  "panel": {
    "eyebrow": "Health • 0–9 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Routine vaccines usually follow actual age, not corrected age",
        "She may be vaccinated at a smaller size than a term baby",
        "Several can be given at the same appointment, including an oral one",
        "A rough evening, a mild temperature and a small lump are the usual pattern"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Asking explicitly which age the schedule follows, instead of assuming corrected age like everything else",
        "Writing down the names of what she was given, for later questions",
        "Asking about side effects before the appointment rather than at 10pm afterwards",
        "Clearing the next day entirely, and expecting a difficult evening rather than being surprised by it",
        "If you live in two countries, comparing both vaccine schedules with your baby's doctor or nurse"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "She's under three months with a temperature of 38°C or above, unless her doctor has given you specific post-vaccine advice",
        "She's floppy, very hard to wake, or unusually unresponsive",
        "Working hard to breathe, grunting, or pauses in her breathing",
        "Swelling of the face or lips, or hives spreading quickly"
      ],
      "lead": "A pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now."
    },
    "quick": "Routine vaccines usually follow actual age, not corrected age. Ask your baby's doctor about the schedule, side effects and RSV protection."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "baby-vaccine-side-effects",
    "corrected-age",
    "nicu-discharge"
  ],
  "seo": {
    "description": "Premature babies usually receive routine vaccines by actual age, while RSV protection and side effects need individual advice."
  },
  "longform": [
    {
      "h": "Actual age, not corrected age",
      "t": "By the time we reached vaccines we had thoroughly learned to count from the due date. Feeding, milestones, sleep expectations, how much she should weigh — all corrected age.\n\nSo it was genuinely surprising to find that routine vaccines generally go by actual age, from her birthday. They don't adjust the schedule for prematurity in the way everything else is adjusted.\n\nHers came as a set at one appointment, including one given by mouth rather than by injection. That sounds like a lot and it is standard.\n\nWe found it worth knowing which were injections and which was oral, because the oral one can loosen nappies for a few days afterwards and we would otherwise have been counting that as a separate problem."
    },
    {
      "h": "The day afterwards",
      "t": "Ours was crying constantly within hours, had a raised temperature, and was miserable for a day. That is the usual shape and it was much easier because we had asked what to expect.\n\nWhat helped: clearing the following day completely, offering smaller feeds more often, and having already asked whether pain relief was appropriate and what the dose was for her weight. Looking that up at 10pm with a crying baby is the version to avoid.\n\nThis was the question we got most tangled in. If a mother has an RSV vaccine during pregnancy, does the baby still need protection directly?\n\nThey are not the same intervention. A vaccine given in pregnancy works by passing antibodies across to the baby before birth, and a baby born early has had less time to receive them. Protection given directly to a baby afterwards is a different product, with its own eligibility criteria that usually depend on gestational age, birth weight, lung problems and the season."
    },
    {
      "h": "Ask about RSV early",
      "t": "One genuinely practical thing. If you are collecting a vaccine from a pharmacy yourself and taking it to the doctor, it has a temperature range and a time limit.\n\nAsk the pharmacy for the specific window and how to transport it — a cool bag, how long it can be out, whether a car with air conditioning counts. Don't estimate. A vaccine that has been warm for too long may be no good, and nobody can tell by looking at it."
    }
  ],
  "order": 116,
  "batch": "8"
},
{
  "id": "is-she-choking",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "Is my baby choking or just gagging?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months",
    "7–9 months",
    "10–12 months"
  ],
  "read": 3,
  "summary": "Gagging and coughing are usually noisy because air is still moving. Choking may be silent and needs immediate action.",
  "keywords": [
    "choking",
    "gagging",
    "milk",
    "coughing",
    "fast flow",
    "paced feeding",
    "first aid",
    "silent"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "She cannot breathe, cry or cough",
      "She goes pale, grey or blue, even briefly",
      "She stops breathing, or pauses in her breathing",
      "She's floppy, limp, or very hard to wake"
    ],
    "lead": "Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now."
  },
  "panel": {
    "eyebrow": "Health • 0–12 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Gagging, coughing and spluttering are noisy",
        "A gag reflex sits far forward in a baby's mouth, so it triggers easily",
        "Choking on milk is usually flow, not capability — too much arriving too fast",
        "Pulling off the bottle, spluttering and then carrying on is a baby managing it"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Doing an infant first aid course, in person, and then doing a refresher — this is the one thing we'd tell everyone to do",
        "Pacing the feed: holding her more upright, bottle more horizontal, and taking breaks before she needed them",
        "Going down a teat size when she was gulping and spluttering, which fixed it almost entirely",
        "Watching for the pull-off and the splutter as her signal, and stopping then instead of pushing on"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "She cannot breathe, cry or cough",
        "She goes pale, grey or blue, even briefly",
        "She stops breathing, or pauses in her breathing",
        "She's floppy, limp, or very hard to wake"
      ],
      "lead": "Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now."
    },
    "quick": "Gagging and coughing are noisy. Choking may be silent. If she cannot breathe, cry or cough, treat it as an emergency and call for help."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "fast-breathing-newborn",
    "milk-from-the-nose",
    "going-to-hospital"
  ],
  "seo": {
    "description": "Gagging is noisy and protective, while silent choking is an emergency; learn the difference and why infant first aid matters."
  },
  "longform": [
    {
      "h": "Noisy and silent are different",
      "t": "This is the one that kept us up. Ari made throat-clearing sounds constantly and both of us were braced for her to choke.\n\nGagging and coughing are noisy, and noise means air is moving past the vocal cords. It is unpleasant to watch and it is the airway doing exactly what it is built to do. A baby who coughs, splutters, goes red, and then carries on is a baby who has handled it."
    },
    {
      "h": "When milk flow is the problem",
      "t": "A baby's gag reflex sits much further forward in the mouth than an adult's. It moves back over the first year.\n\nThat is why she gags on things that seem to be nowhere near her throat, and why the gag is so dramatic and so frequent. It is a protective reflex working early and often — which is the opposite of a warning sign.\n\nThis was ours. She would gulp, splutter, pull off the bottle and cough, and we read it as something wrong with her.\n\nIt was the bottle. Milk arriving faster than she could coordinate swallowing and breathing, so she had to choose, and chose air. Three things fixed it:"
    },
    {
      "h": "Do the first aid course",
      "t": "We did an infant first aid course and it is the single recommendation in this guide we would press hardest.\n\nNot a video, not a page like this one. An in-person course with a doll, where somebody watches you do it and corrects your hands. The back blows and the chest thrusts for a baby are not the same as for an adult, the positions are specific, and a page of text does not transfer into your hands under pressure.\n\nDo this before you need it"
    }
  ],
  "order": 117,
  "batch": "8"
},
{
  "id": "coming-home-from-a-flight",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "How long should I wait after a flight before seeing my baby?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months"
  ],
  "read": 3,
  "summary": "There is no clean number of days. What we worked out was how to ask relatives to wait without it becoming an argument.",
  "keywords": [
    "airport",
    "flight",
    "visitors",
    "infection",
    "mask",
    "exposure",
    "premature",
    "forty days"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "She's under three months with a temperature of 38°C or above",
      "Working hard to breathe — ribs pulling in, nostrils flaring, grunting",
      "Pauses in her breathing, or she goes pale, grey or blue",
      "She's floppy, very hard to wake, or her cry has changed"
    ],
    "lead": "Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now."
  },
  "panel": {
    "eyebrow": "Health • 0–6 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Airports and planes put a lot of people in recycled air together — exposure is genuinely higher",
        "Most respiratory infections show themselves within a few days of being caught",
        "Someone who feels completely fine can still be carrying something",
        "Hands and surfaces carry as much as air does"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Asking her doctor what they wanted, rather than settling it between ourselves",
        "Giving relatives a date rather than a rule — \"come over on Thursday\"",
        "Saying it warmly and in advance, by message, so nobody was turned away at a door",
        "Washing hands properly on arrival rather than relying on sanitiser, and doing it before picking her up every time"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "She's under three months with a temperature of 38°C or above",
        "Working hard to breathe — ribs pulling in, nostrils flaring, grunting",
        "Pauses in her breathing, or she goes pale, grey or blue",
        "She's floppy, very hard to wake, or her cry has changed"
      ],
      "lead": "Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now."
    },
    "quick": "There is no single safe waiting period after a flight. Ask your baby's doctor, then focus on illness, handwashing and sensible distance."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "newborn-immune-and-going-out",
    "her-first-cold",
    "a-slightly-raised-temperature"
  ],
  "seo": {
    "description": "There is no perfect waiting period after a flight; careful hygiene and advice for your own baby matter more than a fixed number."
  },
  "longform": [
    {
      "h": "There is no magic number",
      "t": "We spent real effort trying to pin down when the forty days started — from her birthday, or from her due date, since she arrived early. We did the arithmetic several times.\n\nThe forty days is custom rather than medicine. It's a reasonable instinct dressed up as a deadline, and the arithmetic doesn't produce an answer because there wasn't one to find. What it points at is true — a newborn's immune system is still developing, and a baby born early is more vulnerable for longer. Plus once her 40 days were up we entered flu season which again messed up our calculations."
    },
    {
      "h": "How we said it",
      "t": "A flight is not the same as a walk outside. Hundreds of people, shared air for hours, and every surface touched by everyone.\n\nMost respiratory infections declare themselves within a few days of being caught, which is why a few days of distance between a flight and a newborn is the common-sense version of the advice. The honest position is that this is reasonable rather than precisely calibrated — nobody is going to hand you the correct number.\n\nThis was the hard part. Telling someone who has flown to meet your baby to wait a few days is a difficult message, and the way we found to do it was to give a date rather than a rule. Papa had to fly for work and come back, and whilst the help was really needed, he wore a mask, and for the first two days didn’t get close to little Ari.\n\n\"Let's not do it now — come over on Thursday and stay a while\" works. \"We're not having visitors until forty days after her due date\" invites a negotiation about the number. A date is warm and specific."
    },
    {
      "h": "What mattered in the house",
      "t": "Once someone is in the house, the mechanics are more important than the waiting period.\n\nHands washed with soap and water before picking her up — every time, not once on arrival. We had an argument about sanitiser versus washing at one point, and the honest answer is that washing properly is better and that doing either reliably beats doing the better one occasionally. Nobody unwell holds her, and \"just a cold\" is not a small thing for a newborn."
    }
  ],
  "order": 118,
  "batch": "8"
},
{
  "id": "a-small-fall-or-bump",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "What should I do after my baby bumps her head?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months",
    "7–9 months",
    "10–12 months"
  ],
  "read": 2,
  "summary": "What to watch for after a small knock, and what to do with the guilt afterwards — because that part lasts much longer.",
  "keywords": [
    "head bump",
    "fall",
    "dropped",
    "bruise",
    "guilt",
    "concussion",
    "frustration"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "She was knocked out, has a seizure, or is hard to wake",
      "She vomits repeatedly or behaves very differently",
      "She has weakness, trouble balancing, or problems with her vision",
      "Clear fluid or blood comes from her ears or nose"
    ],
    "lead": "A floppy baby you cannot wake — call your local emergency number now."
  },
  "panel": {
    "eyebrow": "Health • 0–12 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "A cry straight away, then settling with comfort, is reassuring",
        "A short bump from a low height onto something soft very rarely causes harm",
        "A bruise can appear hours later and look worse the next day",
        "Babies bump themselves constantly once they start moving"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Noting the time, the height, and what she landed on — those are the questions you get asked",
        "Watching her over the following hours rather than examining the spot repeatedly",
        "Asking rather than deciding ourselves, because a reassuring phone call cost nothing",
        "Saying out loud what had happened instead of hiding it, including the part where frustration was involved"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "She was knocked out, has a seizure, or is hard to wake",
        "She vomits repeatedly or behaves very differently",
        "She has weakness, trouble balancing, or problems with her vision",
        "Clear fluid or blood comes from her ears or nose"
      ],
      "lead": "A floppy baby you cannot wake — call your local emergency number now."
    },
    "quick": "After a head bump, note the height, surface and time. Watch how she behaves, and get urgent help for serious warning signs."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "going-to-hospital",
    "flat-head",
    "is-my-baby-in-pain"
  ],
  "seo": {
    "description": "What to watch after a baby bumps her head, when to seek urgent help and how to handle the guilt that often follows."
  },
  "longform": [
    {
      "h": "What matters after a bump",
      "t": "Three facts, and they are the ones you'll be asked for: how far, onto what, and what she did immediately afterwards.\n\nA short drop onto something soft, followed by an immediate cry that settles with comfort, is the reassuring picture. A baby who cries straight away is a baby who is responding normally."
    },
    {
      "h": "Watch her, not the bruise",
      "t": "Our instinct was to keep looking at the place where she'd hit, pressing it, comparing it to ten minutes ago. That tells you almost nothing.\n\nWhat matters is her. Is she feeding? Is she alert when she's awake and settling when she should be?\n\nOne of ours happened because of frustration. She would not stay still during a nappy change, it had been a long night, and she was pushed down into the mattress harder than intended. She cried, she was fine, and Papa was not fine for days.\n\nAnother was a slip while putting her down. Barely a drop at all. Same aftermath — the conviction that something had been broken that wouldn't show up for years."
    },
    {
      "h": "The guilt and the setup",
      "t": "The frequency goes up enormously and the stakes mostly go down. A baby learning to sit topples over. A baby learning to crawl bumps her head on everything at her height.\n\nThat shift is normal and doesn't need the same reaction every time. What stays the same is the list in the red column, and the rule about height — a fall from a bed, a sofa, a changing table, or a lap in a chair, is a different category from toppling over on a carpet, and worth a call.\n\nIf frustration was part of it"
    }
  ],
  "order": 119,
  "batch": "8"
},
{
  "id": "going-to-hospital",
  "topic": "health",
  "icon": "cross",
  "featured": false,
  "title": "What should I take when my baby needs to go to hospital?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months",
    "7–9 months",
    "10–12 months"
  ],
  "read": 3,
  "summary": "What to take, what to say, and the questions that turn being kept in for observation from a mystery into a conversation.",
  "keywords": [
    "hospital",
    "emergency",
    "observation",
    "second opinion",
    "questions",
    "discharge",
    "paediatrician"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Working hard to breathe, grunting, pauses in her breathing, or she goes pale, grey or blue",
      "She's floppy, very hard to wake, or her cry is nothing like her usual one",
      "A rash that doesn't fade when pressed under a glass",
      "A temperature of 38°C or above under three months"
    ],
    "lead": "Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now."
  },
  "panel": {
    "eyebrow": "Health • 0–12 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Being kept for observation is common and is often precaution rather than bad news",
        "You will be asked the same questions several times by different people",
        "Tests get ordered to rule things out, not because someone expects to find them",
        "A doctor who won't give a timeframe often genuinely doesn't have one yet"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "A note on a phone with her weight, her medicines and doses, her birth details and her corrected age — asked for every single time",
        "Writing symptoms with times before going in — the story is what they use",
        "Taking photographs of anything that might have faded by the time we arrived",
        "Writing our questions down in advance and asking them calmly, rather than in the corridor as someone walked away"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Working hard to breathe, grunting, pauses in her breathing, or she goes pale, grey or blue",
        "She's floppy, very hard to wake, or her cry is nothing like her usual one",
        "A rash that doesn't fade when pressed under a glass",
        "A temperature of 38°C or above under three months"
      ],
      "lead": "Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now."
    },
    "quick": "Take one phone note with her weight, medicines and symptoms. At hospital, ask what is being checked, what would reassure them and when it will be reviewed."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "a-slightly-raised-temperature",
    "is-she-choking",
    "a-small-fall-or-bump"
  ],
  "seo": {
    "description": "A simple hospital checklist covering symptoms, medicines, questions, observation, second opinions and discharge planning."
  },
  "longform": [
    {
      "h": "The note on our phone",
      "t": "Kept on a phone, updated when anything changed. Her current weight. Every medicine with the dose and how often.\n\nWe were asked for all of it, by several different people, every time we went anywhere. Having it written down meant we weren't doing arithmetic about gestational age while a nurse waited, and it meant both of us gave the same answer.\n\nThis was our hardest stretch. Ari was gaining weight, feeding well and passing stool, and was being kept on the basis of a bloated tummy with an explanation that kept changing. We found ourselves asking why they were keeping her at all, which is where frustration takes you and is the wrong question.\n\nThe right questions, which we eventually wrote down and asked calmly, were these. Why specifically are you keeping her. Is this precaution or is there something you've seen."
    },
    {
      "h": "Questions when they keep her in",
      "t": "There was a point where the explanation we were given did not match the baby in front of us, and we asked a baby's doctor from outside the hospital to come and look at her.\n\nNobody objected. It is a normal thing to do and it is not an accusation. What made it work was doing it in writing and doing it politely — a short message explaining the situation, what we had been told, and asking for an assessment.\n\nAsk the discharge questions before discharge day. We asked what we should be watching for, what would bring us back, what the follow-up was and who was arranging it, who to ring out of hours, and what the medicines were and for how long.\n\nAsked on the day, in the rush of leaving, you get half answers and a feeling of being pushed out of a door. Asked two days earlier, you get real ones and time to think of the next question."
    },
    {
      "h": "Before you go home",
      "t": "A small thing that helped more than it should have: deciding in advance which of us would ask the questions.\n\nTwo frightened parents both talking at a doctor produces a worse conversation than one asking and one holding the baby and listening. We swapped depending on who was holding it together better that day. The one listening often caught what the one asking missed."
    }
  ],
  "order": 120,
  "batch": "8"
},
{
  "id": "tired-even-with-help",
  "topic": "sanity",
  "icon": "heart",
  "featured": false,
  "title": "Why am I exhausted even though I have help?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months",
    "7–9 months",
    "10–12 months"
  ],
  "read": 3,
  "summary": "Having help and still being wrecked feels hard to justify, so most people don't say it. The tiredness isn't only about hours of sleep.",
  "keywords": [
    "exhausted",
    "help",
    "night nurse",
    "guilt",
    "irritable",
    "burnout",
    "constant alertness"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Any thought of harming yourself or her — ring your doctor or a crisis line today",
      "You are seeing or hearing things that are not there",
      "You are very confused or losing touch with what is real",
      "You cannot keep yourself safe, manage daily tasks, or care safely for her"
    ]
  },
  "panel": {
    "eyebrow": "Parent Sanity • 0–12 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Being on call is tiring even when you're not the one getting up",
        "Broken sleep over months accumulates in a way one good night doesn't undo",
        "Managing other people's work is its own load, on top of the baby",
        "Irritability is usually the first thing to show, before you notice the tiredness itself"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Naming it as load, not sleep — that stopped the arithmetic about hours",
        "One block of genuinely off-duty time, out of earshot, nobody asking us anything",
        "Handing over a whole decision, not a task — not being the one consulted",
        "Saying it out loud to one person instead of carrying the guilt about having help at all"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Any thought of harming yourself or her — ring your doctor or a crisis line today",
        "You are seeing or hearing things that are not there",
        "You are very confused or losing touch with what is real",
        "You cannot keep yourself safe, manage daily tasks, or care safely for her"
      ]
    },
    "quick": "Having help does not switch off the mental load. What often helps most is a block of time when you are truly off duty."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "parent-sleep-deprivation",
    "awake-when-you-could-be-sleeping",
    "i-need-a-proper-break"
  ],
  "seo": {
    "description": "Why having help does not always remove new-parent exhaustion, and how real off-duty time can make a difference."
  },
  "longform": [
    {
      "h": "Why help does not always fix the tiredness",
      "t": "There is a version of this that goes: I have help, grandma has moved in with us, I don't do the full night alone, I work and I handle her for a few hours a day, and I am exhausted. Most parents don't have any of that. So what exactly is my complaint?\n\nThat comparison is the reason nobody says it, and it is also why it doesn't get dealt with. Being more fortunate than someone else doesn't make you less tired. It just makes you quieter about it, which is worse."
    },
    {
      "h": "What made a real difference",
      "t": "Because the thing that exhausts you isn't only the hours.\n\nBeing on call is tiring in itself. Some part of your attention stays with her whether or not you're the one holding her — you hear the monitor, you register the pause, you half-wake. A night where you slept through is still a night you were available.\n\nOff-duty time that was genuinely off. Not in the house, available if needed. Out of earshot, with nobody able to ask us anything, for a defined block.\n\nThe word that mattered was \"genuinely\". Lying down in the next room while still being the person who would be woken is not rest. This was hard at first, so we started with twenty minutes nearby, even just sitting on the balcony. Then we slowly increased the time and distance. When someone you trust offers to help and feels comfortable with the baby, take the help. Grandparents and other people who have cared for babies can be wonderful for this."
    },
    {
      "h": "Irritability was our warning sign",
      "t": "Ours showed up as being short with people rather than as feeling tired. Snapping at small things, impatience with the people helping, finding ordinary requests unreasonable.\n\nThat is worth knowing because it misdirects you. It feels like a problem with the people around you, so you start adjusting them, when the actual variable is how depleted you are."
    }
  ],
  "order": 121,
  "batch": "9"
},
{
  "id": "awake-when-you-could-be-sleeping",
  "topic": "sanity",
  "icon": "heart",
  "featured": false,
  "title": "Why can't I sleep when someone else has the baby?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months",
    "7–9 months",
    "10–12 months"
  ],
  "read": 3,
  "summary": "Someone else has the baby, the house is quiet, and you're staring at the ceiling at two in the morning. The constant alertness doesn't switch off on command.",
  "keywords": [
    "can't sleep",
    "insomnia",
    "night nurse",
    "constant alertness",
    "feeling stuck on alert",
    "two in the morning"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Any thought of harming yourself or her — ring your doctor or a crisis line today",
      "You are seeing or hearing things that are not there",
      "You are very confused or losing touch with what is real",
      "You cannot keep yourself safe, manage daily tasks, or care safely for her"
    ]
  },
  "panel": {
    "eyebrow": "Parent Sanity • 0–12 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Months of being woken trains you to stay alert — it fades slowly",
        "Being woken once and then unable to get back to sleep is extremely common",
        "The quiet can itself be alerting, because you're listening into it",
        "Knowing it's your one chance to sleep is the least restful thought available"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Getting up and doing something dull, rather than lying there fighting the night",
        "Monitor out of the room on an off-duty night — nothing to listen to",
        "Sleeping somewhere else in the house on the nights someone else was covering",
        "Earplugs, which felt irresponsible and were the single biggest change"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Any thought of harming yourself or her — ring your doctor or a crisis line today",
        "You are seeing or hearing things that are not there",
        "You are very confused or losing touch with what is real",
        "You cannot keep yourself safe, manage daily tasks, or care safely for her"
      ]
    },
    "quick": "Your body may be resting while your mind stays on watch. Regular off-duty nights and a calmer sleep routine can help it relearn how to switch off."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "tired-even-with-help",
    "parent-sleep-deprivation",
    "splitting-nights"
  ],
  "seo": {
    "description": "Why you may stay wide awake when someone else has the baby, plus gentle ways to help your mind switch off."
  },
  "longform": [
    {
      "h": "The night we were meant to sleep",
      "t": "We had night cover. The baby was being looked after. The house was quiet.\n\nThere is something particularly demoralising about that, because the thing you have been desperate for has been handed to you and you can't use it. It's easy to read it as ingratitude, or as evidence that you're broken in some way."
    },
    {
      "h": "Why the mind stays switched on",
      "t": "You have spent months being woken repeatedly, and your body has sensibly adapted by never going all the way down. That adaptation was useful. It doesn't know the arrangement has changed.\n\nIt takes longer to unlearn than it took to learn, and it unlearns over weeks of consistent opportunity rather than in the first night someone covers for you. Which means the first few off-duty nights being wasted is the normal shape of this, not a sign it isn't going to work.\n\nRemoving the thing to listen to. On a night someone else was covering, the monitor went out of the room entirely. Earplugs as well — which felt like an abdication and was the single biggest change either of us made.\n\nSleeping somewhere else in the house, where the usual sounds did not reach, worked better than staying in the room where we normally got woken. Even sleeping on the living-room sofa helped. The point was to be properly out of earshot, not only out of arm's reach."
    },
    {
      "h": "What helped us switch off",
      "t": "\"This is my one chance, I have to sleep now.\" It is the least restful sentence in the language and it guarantees the outcome it fears.\n\nWhat helped was lowering the stakes out loud. The night is already partly lost. Resting without sleeping is still worth something."
    }
  ],
  "order": 122,
  "batch": "9"
},
{
  "id": "loving-her-and-resenting-it",
  "topic": "sanity",
  "icon": "heart",
  "featured": false,
  "title": "Can I love my baby and still resent how hard this is?",
  "ages": [
    "2–3 months",
    "4–6 months",
    "7–9 months",
    "10–12 months"
  ],
  "read": 4,
  "summary": "Regret, anger and love are not alternatives. They turn up together under enough load, and holding all three doesn't mean the love is the false one.",
  "keywords": [
    "resentment",
    "regret",
    "anger",
    "ambivalence",
    "overload",
    "guilt",
    "honesty"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Any thought of harming yourself or her — ring your doctor or a crisis line today",
      "You are seeing or hearing things that are not there",
      "You are very confused or losing touch with what is real",
      "You cannot keep yourself safe, manage daily tasks, or care safely for her"
    ]
  },
  "panel": {
    "eyebrow": "Parent Sanity • 2–12 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Love and resentment coexist — neither cancels the other out",
        "Relentless load produces anger, and the anger attaches to whatever is in front of you",
        "Thinking life was easier before her is about the load, not a verdict",
        "Extremely common, almost never said out loud, which is what makes it feel rare"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Saying the whole sentence to one person, including the part that sounded unforgivable",
        "Treating it as a load problem — what was relentless, and could it move",
        "Separating thought from verdict — having it once is not a position you hold",
        "Noticing that the resentment attached to whoever was nearest, which usually meant it wasn't about them"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Any thought of harming yourself or her — ring your doctor or a crisis line today",
        "You are seeing or hearing things that are not there",
        "You are very confused or losing touch with what is real",
        "You cannot keep yourself safe, manage daily tasks, or care safely for her"
      ]
    },
    "quick": "You can love your baby and still resent how relentless parenting feels. The thought does not cancel the love or make you a bad parent."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "still-feels-like-meh",
    "overwhelmed-new-parent",
    "checklist-mode"
  ],
  "seo": {
    "description": "Love and resentment can exist together when parenting feels relentless; learn what may help and when to ask for support."
  },
  "longform": [
    {
      "h": "The sentence nobody wants to say",
      "t": "Here is roughly how it came out, at the worst of it: I signed up to be a hands-on father and this is insane. She is getting on my nerves. How do you know I love her deeply.\n\nAnd separately, a few weeks earlier: why do I sometimes think life was easier without her? Was I happy before her? Sure, but Ari filled my world in a completely different way. I was simply exhausted. Some fathers take longer to feel that connection. It is not always an instant overflow of love. Sometimes the bond comes through time, repetition and showing up every day.\n\nBecause they're answers to different questions.\n\nLove is about her. Resentment is about the load — the relentlessness, the loss of your own time, the fact that it does not stop and cannot be put down. Those are separate inputs, so they can both be full volume at once."
    },
    {
      "h": "A thought is not a verdict",
      "t": "This was the most useful thing anyone told us, so it goes here plainly.\n\nHaving the thought \"life was easier without her\" does not mean you believe it, want it, or will act on it. Intrusive thoughts of exactly this kind are extremely common in new parents and the research on them is reassuring. The thought arriving says something about how depleted you are.\n\nNot a softened version. Not \"it's been a bit tough\". The actual sentence, including the part that sounds unforgivable.\n\nOne person. A partner if that's safe, a friend, a sibling, a doctor. The relief is not in being told you're a good parent — it's in discovering that saying it out loud doesn't cause the catastrophe you expected, and often gets a \"yes, me too\" you weren't anticipating."
    },
    {
      "h": "Look at the load, not your character",
      "t": "Once it's said, the question that produces change is not \"what's wrong with me\" but \"what specifically was relentless this week, and can any of it move\".\n\nFor us the answers were usually unglamorous and solvable. A stretch with no gap at all. Nights not properly split.\n\nWe are not doctors, and this is the one place in the guide where we want to be direct rather than reassuring.\n\nIf the low mood, the numbness or the hopelessness doesn't lift when the load lifts — if it's there on the good days too, or has been constant for weeks — that's worth a doctor's appointment. The same goes for anger you can't bring down, feeling disconnected from her over weeks rather than hours, drinking more, or not being able to sleep even when you can."
    }
  ],
  "order": 123,
  "batch": "9"
},
{
  "id": "i-need-a-proper-break",
  "topic": "sanity",
  "icon": "heart",
  "featured": false,
  "title": "Is it wrong to need a proper break from my baby?",
  "ages": [
    "2–3 months",
    "4–6 months",
    "7–9 months",
    "10–12 months"
  ],
  "read": 2,
  "summary": "There's a point where small rests stop touching it and what you need is a real gap. Asking for that out loud is better than reaching it by accident.",
  "keywords": [
    "break",
    "reset",
    "resentment",
    "time off",
    "handover",
    "guilt"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Any thought of harming yourself or her — ring your doctor or a crisis line today",
      "You are seeing or hearing things that are not there",
      "You are very confused or losing touch with what is real",
      "You cannot keep yourself safe, manage daily tasks, or care safely for her"
    ]
  },
  "panel": {
    "eyebrow": "Parent Sanity • 2–12 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Twenty minutes helps early on and stops being enough after months",
        "Needing a real gap is a load signal, not a failure of devotion",
        "Resentment building towards whoever is nearest usually means the gap is overdue",
        "Both parents can hit this, including the one who looks like they're coping"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Asking for it as a plan with a date, not after a bad day",
        "Being specific: how long, where, and what either of us would not be contacted about",
        "Leaving the house, because being in it means being available",
        "Taking the whole handover off — not being the person consulted while away"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Any thought of harming yourself or her — ring your doctor or a crisis line today",
        "You are seeing or hearing things that are not there",
        "You are very confused or losing touch with what is real",
        "You cannot keep yourself safe, manage daily tasks, or care safely for her"
      ]
    },
    "quick": "Needing a proper break is not a failure. Ask for a clear block of time before you reach the point where everything feels unbearable."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "touched-out",
    "tired-even-with-help",
    "parent-sleep-deprivation"
  ],
  "seo": {
    "description": "Why short rests sometimes stop being enough, and how to ask for a proper break without guilt or scorekeeping."
  },
  "longform": [
    {
      "h": "How we knew a short rest was not enough",
      "t": "The signal for us wasn't tiredness. It was resentment arriving at things that didn't deserve it — an ordinary request, a small noise, someone asking a reasonable question.\n\nThe other signal was that the small fixes had stopped working. Twenty minutes with the door shut genuinely helps in the early months. There's a point where you take the twenty minutes, come back, and nothing has changed."
    },
    {
      "h": "Ask for a real break as a plan",
      "t": "The worst time to ask is the moment you most need it, because by then it comes out as an announcement at the end of a terrible day and lands as an accusation.\n\nWhat worked was asking in daylight, in advance, as a specific proposal. A date. A length.\n\nThree things made the difference between a break and a longer version of being on duty.\n\nLeave the house. Being in it means being findable, and being findable means you're still working. Hand over the decisions, not just the tasks — being rung to approve something is not time off."
    },
    {
      "h": "Make it fair for both parents",
      "t": "A break one parent takes and the other doesn't becomes a grievance within about a fortnight, however generously it was given.\n\nSo the version that held for us was both people getting it, scheduled, not traded. Not \"I covered for you so you owe me\" — just the same thing for each of us, on the calendar, swapped around."
    }
  ],
  "order": 124,
  "batch": "9"
},
{
  "id": "still-feels-like-meh",
  "topic": "sanity",
  "icon": "heart",
  "featured": false,
  "title": "What if bonding with my baby still hasn't clicked?",
  "ages": [
    "4–6 months",
    "7–9 months",
    "10–12 months"
  ],
  "read": 3,
  "summary": "Everyone said it would click. She reaches for you every morning and you still feel oddly flat about it. That's more common than the silence suggests.",
  "keywords": [
    "bonding",
    "clicked",
    "flat",
    "father",
    "comparison",
    "guilt",
    "slow"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Any thought of harming yourself or her — ring your doctor or a crisis line today",
      "You are seeing or hearing things that are not there",
      "You are very confused or losing touch with what is real",
      "You cannot keep yourself safe, manage daily tasks, or care safely for her"
    ]
  },
  "panel": {
    "eyebrow": "Parent Sanity • 4–12 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Bonding often builds over many months, not in a moment",
        "Comparing yourself to a visibly besotted partner makes it look worse than it is",
        "Saying \"I love her\" partly to convince yourself — a lot of parents do",
        "It tends to arrive through doing rather than through trying to feel it"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Carrying on with the caring without waiting to feel it first",
        "Noticing the small specific moments rather than auditing the overall feeling",
        "Saying it out loud to one person, which was far less dramatic than expected",
        "Stopping the comparison with the parent who fell in love instantly — different wiring, not a scoreboard"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Any thought of harming yourself or her — ring your doctor or a crisis line today",
        "You are seeing or hearing things that are not there",
        "You are very confused or losing touch with what is real",
        "You cannot keep yourself safe, manage daily tasks, or care safely for her"
      ]
    },
    "quick": "Bonding can grow slowly through feeding, holding and showing up each day. It does not have to arrive as one huge feeling."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "loving-her-and-resenting-it",
    "father-not-feeling-it",
    "are-we-bonding-if-shes-asleep"
  ],
  "seo": {
    "description": "Bonding does not always happen instantly; it can grow slowly through everyday care, time and small moments together."
  },
  "longform": [
    {
      "h": "The honest version",
      "t": "She's nearly six months. Her mother is head over heels. I definitely love her, and I'm fairly relaxed about not seeing her — and I don't understand that, because she reaches for me every morning.\n\nAnd a blunter one from earlier: when does it click that I have a daughter? I love her, but half the time I say it to trick my own mind. I know I do love her."
    },
    {
      "h": "Bonding can take time",
      "t": "The feeling often follows the doing rather than preceding it, and the doing accumulates at different rates for different people.\n\nThe parent who carried her and feeds her has had a head start measured in months and hormones. That isn't a moral difference and it isn't a sign of how either of you will be as a parent in five years. But it does mean that standing next to someone who was besotted from the first hour is a terrible place to assess yourself from.\n\nFor us it wasn't gradual and then complete. It was a specific moment — kissing the top of her head — after which things started connecting that hadn't before. Before that, honestly, not much.\n\nWhich is worth saying for two reasons. It can arrive suddenly and late, so a flat six months is not a forecast. And it arrived during ordinary contact rather than during an attempt to feel something."
    },
    {
      "h": "What slowly helped it move",
      "t": "It came from her mother, and it reframed the whole thing: you can do less, but be present and actually want to be there, rather than treating it as a chore.\n\nThat landed because the instinct when you do not feel it is to compensate with volume — more hours, more tasks, trying harder. But hours done only as a duty do not build much. One hour where you are genuinely present can do more than three spent working through a list. That change in perspective helped enormously. I started seeing Ari as a little person, rather than another task to finish before someone took over and I could rest."
    }
  ],
  "order": 125,
  "batch": "9"
},
{
  "id": "are-we-bonding-if-shes-asleep",
  "topic": "sanity",
  "icon": "heart",
  "featured": false,
  "title": "Does holding my sleeping baby count as bonding?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months",
    "7–9 months"
  ],
  "read": 3,
  "summary": "Hours of her asleep on your chest can feel like nothing is happening. It is the most bonding thing in the day and it looks like doing nothing.",
  "keywords": [
    "contact sleep",
    "bonding",
    "chest",
    "holding",
    "asleep",
    "connection"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "She goes pale, grey or blue",
      "She is struggling to breathe or has pauses in her breathing",
      "She is floppy, very hard to wake or completely unlike herself",
      "You think you may fall asleep while holding her"
    ],
    "lead": "Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now."
  },
  "panel": {
    "eyebrow": "Parent Sanity • 0–9 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Babies settle best on a person — it's not a bad habit she's learned",
        "Contact while she's asleep does the same work as contact while she's awake",
        "She's taking in your smell, heartbeat and voice the whole time",
        "Feeling like nothing is happening is about you, not a measure of her"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Taking it as the bonding rather than as the waiting room before the bonding",
        "Awake and upright while holding her — never on a sofa or in bed",
        "Putting her down for the long stretch and keeping contact naps for when one of us was properly awake",
        "Using the time for something quiet rather than scrolling, which made it feel like time rather than limbo"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "She goes pale, grey or blue",
        "She is struggling to breathe or has pauses in her breathing",
        "She is floppy, very hard to wake or completely unlike herself",
        "You think you may fall asleep while holding her"
      ],
      "lead": "Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now."
    },
    "quick": "Yes. Holding her while she sleeps can be warm, familiar bonding time, as long as you stay awake and keep her sleep space safe."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "still-feels-like-meh",
    "father-not-feeling-it",
    "safe-sleep-newborn"
  ],
  "seo": {
    "description": "Quiet contact still counts as bonding, with simple reminders for holding a sleeping baby as safely as possible."
  },
  "longform": [
    {
      "h": "Quiet contact still counts",
      "t": "She's comfortable, she's asleep on your chest, and it's lovely — and there's still a nagging sense that no bonding is occurring, because bonding feels like it should involve something happening.\n\nIt is the opposite. She is taking in your smell, heartbeat, breathing and voice, and she does not need to be awake for that closeness to matter. Papa realised quite early that Ari being comfortable enough to sleep on him meant a bond was already growing. She felt safe with her father. The protectiveness and pride he felt became the beginning of their father-daughter relationship: she feels safe with me, she loves me, this is good."
    },
    {
      "h": "Stay awake while she sleeps on you",
      "t": "This is the part to get right, and it's narrow.\n\nHolding her while you are awake and upright is fine, and is one of the better things in the day. The danger is falling asleep with her — on a sofa or armchair especially, where she can slip into a gap or against your body, and in a bed with soft bedding."
    },
    {
      "h": "The free-time problem",
      "t": "There is an honest complication here. For a stretch, the only real free time Papa had was while she slept on him. That made the contact nap both the nicest part of the day and his only gap, and those two things pulled against each other.\n\nWhat helped was not pretending that was fine. It isn't a substitute for actual time off, and treating it as one means you never ask for the real thing. We ended up protecting both separately: contact naps because they were worth having, and a genuine break because a nap with a baby on you is not rest."
    }
  ],
  "order": 126,
  "batch": "9"
},
{
  "id": "does-it-get-easier",
  "topic": "sanity",
  "icon": "heart",
  "featured": false,
  "title": "Does having a baby ever get easier?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months",
    "7–9 months",
    "10–12 months"
  ],
  "read": 3,
  "summary": "It changes more than it eases, and the hardest phase is whichever one you're in. But some specific things genuinely do get better, and knowing which helps.",
  "keywords": [
    "easier",
    "hardest phase",
    "stages",
    "phase",
    "frustrating",
    "when does it end"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Any thought of harming yourself or her — ring your doctor or a crisis line today",
      "You are seeing or hearing things that are not there",
      "You are very confused or losing touch with what is real",
      "You cannot keep yourself safe, manage daily tasks, or care safely for her"
    ]
  },
  "panel": {
    "eyebrow": "Parent Sanity • 0–12 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "There's no single hardest phase that everyone agrees on",
        "The work changes shape rather than simply reducing",
        "Sleep becoming more settled is the change most parents feel most",
        "Being able to read her, and her being able to tell you things, makes it feel easier even when it isn't lighter"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Asking what was hard this month, rather than whether it was hard generally",
        "Writing it down occasionally, because looking back a month was the only reliable way to see change",
        "Expecting travel, illness and teeth to interrupt progress rather than reverse it",
        "Not taking anyone's \"it gets easier at X\" as a date to hold out for"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Any thought of harming yourself or her — ring your doctor or a crisis line today",
        "You are seeing or hearing things that are not there",
        "You are very confused or losing touch with what is real",
        "You cannot keep yourself safe, manage daily tasks, or care safely for her"
      ]
    },
    "quick": "It changes more than it simply gets easier. Sleep, communication and confidence often improve, even while new problems appear."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "parent-sleep-deprivation",
    "overwhelmed-new-parent",
    "tired-even-with-help"
  ],
  "seo": {
    "description": "An honest look at what changes as babies grow, what may become easier and why every difficult stage feels permanent."
  },
  "longform": [
    {
      "h": "There is no single hardest stage",
      "t": "There is no agreed hardest phase. Ask ten parents and you'll get the first six weeks, four months, teething, the point where she becomes mobile, and one person who found the newborn stage the easy bit.\n\nThat's not evasion — it's because what's hard depends on what you personally find hard. Broken sleep wrecks some people and not others. Relentless physical contact is the worst part for some and the best part for others."
    },
    {
      "h": "What genuinely gets easier",
      "t": "Sleep is the big one. Nights becoming more settled from fragments into longer stretches is the single change most parents report as transformative, and it happens somewhere in the first year for most babies, with wide variation and plenty of interruptions.\n\nLegibility is the underrated one. Early on she's a set of signals you're guessing at. Later you know what the different cries mean, you can predict the day roughly, and she starts communicating deliberately.\n\nWorth saying, because \"it gets easier\" sets people up.\n\nMobility is more work, not less. Once she moves you can't put her down and expect her to be where you left her, and the supervision becomes continuous in a way it wasn't. Solids add a whole category of work."
    },
    {
      "h": "The phase that feels permanent",
      "t": "We had a stretch in Greece where everything was hard and she seemed to be going through something, and the question we kept asking was how long a phase like this can last.\n\nWhat we learned is that a bad phase feels like the new normal while you are in it, but usually is not. Travel, illness, teething and developmental jumps can all interrupt progress without undoing it. Papa also realised that Ari was almost always in one phase or another. During the first year, babies learn to feed, communicate, sit, crawl and walk, all while growing, teething and having sleep disrupted. So when someone says, ‘It is a phase,’ do not pin all your hopes on one magical age when everything becomes easy. It becomes easier in some ways and harder in others. Mostly, it keeps changing.The lovely part is that your confidence grows too. At first, Papa struggled to hold Ari and keep the bottle at the right angle. Now he does it without thinking while already preparing what she will need for sleep. Repetition does not make parenting perfect, but it does make you much better at handling the next change."
    }
  ],
  "order": 127,
  "batch": "9"
},
{
  "id": "hiring-night-help",
  "topic": "sanity",
  "icon": "heart",
  "featured": false,
  "title": "What should I agree before hiring overnight help?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months",
    "7–9 months"
  ],
  "read": 3,
  "summary": "What the job actually is, what to specify before anyone starts, and the cheaper arrangements people use when a night nurse isn't on the table.",
  "keywords": [
    "night nurse",
    "night nanny",
    "overnight",
    "hiring",
    "cost",
    "duties",
    "handover"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "She's floppy, very hard to wake, or her cry is nothing like her usual one",
      "Working hard to breathe, grunting, or pauses in her breathing, or she goes pale, grey or blue",
      "A temperature of 38°C or above under three months",
      "You're told about an injury, a fall, or a dose given twice — ring rather than wait"
    ],
    "lead": "Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now."
  },
  "panel": {
    "eyebrow": "Parent Sanity • 0–9 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Rates vary enormously by city, by hours, and by whether the person is live-in",
        "A night shift is usually a fixed block — commonly around twelve hours",
        "The job is normally feeds, changes and settling, not housework",
        "Agencies cost more and do the vetting; direct hire is cheaper and the vetting is yours"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Writing the shift down first — hours, each waking, what not to do",
        "Specifying how we wanted her settled, not just that she should be settled",
        "Being explicit about no overstimulation at night, however awake she seems",
        "Naming who gives medicines and supplements, and keeping that with one person"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "She's floppy, very hard to wake, or her cry is nothing like her usual one",
        "Working hard to breathe, grunting, or pauses in her breathing, or she goes pale, grey or blue",
        "A temperature of 38°C or above under three months",
        "You're told about an injury, a fall, or a dose given twice — ring rather than wait"
      ],
      "lead": "Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now."
    },
    "quick": "Agree the hours, duties, settling, medicines and morning handover in writing before the first overnight shift."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "briefing-whoever-helps",
    "finding-help-without-an-agency",
    "letting-help-go"
  ],
  "seo": {
    "description": "What to agree before overnight help starts, including duties, medicines, settling, handovers and a clear trial period."
  },
  "longform": [
    {
      "h": "Write down what the job includes",
      "t": "A night shift is usually a defined block — ours was essentially twelve hours — where the person is responsible for her through the night: feeding her when she wakes, changing her, and settling her back down without the household being involved.\n\nThe things worth being explicit about, because they aren't obvious:\n\nThis is the one we'd insist on. Vitamins, iron, anything prescribed: one named person is responsible, and it is written down with a tick.\n\nWith overnight help, a grandparent and two parents, the risk is not only a missed dose. It is also a dose being given twice because everyone assumes nobody else has done it. After that happened to us, we made one person responsible for every medicine and supplement. That simple change was worth the awkward conversation."
    },
    {
      "h": "Keep medicines with one person",
      "t": "A short written handover each morning — waking times, how much she took, anything unusual — changed how much we could rely on the arrangement.\n\nIt does three things. It gives you a record if a doctor asks. It makes patterns visible that nobody would remember verbally.\n\nThe paid overnight option is expensive and in many places it simply isn't available at a price that makes sense. The alternatives people actually use:\n\nSplitting the night properly between two parents, which is covered in `splitting-nights` and is the single highest-value thing available if there are two of you. One person sleeping properly beats both half-sleeping."
    },
    {
      "h": "Agree the trial and handover",
      "t": "Say at the start that the first couple of weeks are a trial for both sides, and that you'll talk at the end of it.\n\nIt costs nothing and it changes everything about how an ending goes. Without it, deciding it isn't working becomes a confrontation and people avoid having it, which is how unsatisfactory arrangements run for months. The guide on ending one is `letting-help-go`."
    }
  ],
  "order": 128,
  "batch": "9"
},
{
  "id": "briefing-whoever-helps",
  "topic": "sanity",
  "icon": "heart",
  "featured": false,
  "title": "How do I explain our baby-care rules to someone helping?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months",
    "7–9 months",
    "10–12 months"
  ],
  "read": 3,
  "summary": "Most problems with help are briefing problems wearing a disguise. Written, specific and early beats correcting someone kindly for six weeks.",
  "keywords": [
    "instructions",
    "nanny",
    "night nurse",
    "standards",
    "hygiene",
    "handover",
    "feedback"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "You're told about a fall, an injury, or a dose given twice — call rather than wait and see",
      "She's floppy, very hard to wake, or her cry is nothing like her usual one",
      "Working hard to breathe, or she goes pale, grey or blue",
      "A temperature of 38°C or above under three months"
    ],
    "lead": "Blue or grey, a struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now."
  },
  "panel": {
    "eyebrow": "Parent Sanity • 0–12 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Someone experienced will default to how they've always done it, not how you do",
        "What feels obvious to you is genuinely not obvious to anyone else",
        "Most friction is a missing instruction rather than a bad attitude",
        "Standards slip over weeks unless they're written down somewhere"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Writing it down once as standards for everyone, rather than correcting people individually",
        "Being specific about hygiene — hands washed before every pick-up, not sanitised once on arrival",
        "Saying no perfume or strong scent, which mattered a great deal and would never have been guessed",
        "Masks worn properly over the nose rather than resting on a chin, said once and kindly"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "You're told about a fall, an injury, or a dose given twice — call rather than wait and see",
        "She's floppy, very hard to wake, or her cry is nothing like her usual one",
        "Working hard to breathe, or she goes pale, grey or blue",
        "A temperature of 38°C or above under three months"
      ],
      "lead": "Blue or grey, a struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now."
    },
    "quick": "Write the important rules down once, keep them specific and explain why they matter. Clear instructions are kinder than weeks of corrections."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "hiring-night-help",
    "letting-help-go",
    "safe-sleep-newborn"
  ],
  "seo": {
    "description": "How to give baby-care instructions clearly and kindly so everyone follows the same hygiene, safety and medicine rules."
  },
  "longform": [
    {
      "h": "Written rules are easier to follow",
      "t": "We started by correcting things as they came up, kindly, one at a time. Six weeks in we were still correcting the same things and had become the difficult household.\n\nWhat worked was writing it down once — a single message with the standards for anyone who looks after her, including us. Not a response to an incident. Just how this house does it.\n\nWe had a genuine disagreement about this and it's worth laying out, because the detail matters.\n\nWe asked for hands to be washed before picking her up. What we observed was sanitising when someone noticed we were watching, and we weren't convinced the hands had been done before that. Separately, the person's position was that she preferred washing to sanitiser — which is correct, and not the same as doing either reliably."
    },
    {
      "h": "Be clear about hygiene and safety",
      "t": "No perfume or strong scent. This mattered enormously for us because her breathing had needed help early on, and strong scents were a real irritant. It is also something no one would think to ask about — and we had a situation where a night person was certain she wasn't wearing any while the room said otherwise.\n\nMasks worn properly. If you've asked for a mask at all, it's worth saying once that over the nose is the point. On the chin is theatre.\n\nThis is the thing we'd most want to pass on. Every instruction that stuck had a reason attached; every instruction that quietly eroded didn't.\n\n\"One toy at a time\" sounds arbitrary and gets forgotten. \"One toy at a time, because she gets overstimulated and loses interest in toys quickly\" survives, because now the person can apply the principle to situations you didn't anticipate."
    },
    {
      "h": "Give the reason once",
      "t": "Two practical notes.\n\nMedicines and supplements belong to one named person, with every dose ticked off in writing. Do not spread this across Mama, Papa, Grandma and anyone else helping with the baby."
    }
  ],
  "order": 129,
  "batch": "9"
},
{
  "id": "letting-help-go",
  "topic": "sanity",
  "icon": "heart",
  "featured": false,
  "title": "How do I let a nanny or night nurse go?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months",
    "7–9 months",
    "10–12 months"
  ],
  "read": 3,
  "summary": "Trust has gone but you can't prove anything, and she's in your house with your baby. You don't need proof to end an arrangement.",
  "keywords": [
    "dismissal",
    "trust",
    "night nurse",
    "nanny",
    "ending",
    "notice",
    "handover"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "You believe she's been hurt, dropped, or given the wrong medicine — call your doctor now",
      "She's floppy, very hard to wake, or her cry is nothing like her usual one",
      "Unexplained bruising or marks you can't account for",
      "Working hard to breathe, or she goes pale, grey or blue"
    ],
    "lead": "Blue or grey, a struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now."
  },
  "panel": {
    "eyebrow": "Parent Sanity • 0–12 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "A gut feeling about whoever cares for her is reason enough to end it",
        "You do not need proof of wrongdoing to end an arrangement",
        "Most endings are about fit rather than wrongdoing",
        "Dreading the conversation more than the gap is very common"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Deciding on fit rather than building a case — we stopped waiting for proof",
        "Writing down what we'd observed, with dates, before deciding anything",
        "Keeping it short and non-accusatory — the arrangement isn't working, thank you, here's the notice",
        "Not raising suspicions we couldn't support, which would have invited a dispute and changed nothing"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "You believe she's been hurt, dropped, or given the wrong medicine — call your doctor now",
        "She's floppy, very hard to wake, or her cry is nothing like her usual one",
        "Unexplained bruising or marks you can't account for",
        "Working hard to breathe, or she goes pale, grey or blue"
      ],
      "lead": "Blue or grey, a struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now."
    },
    "quick": "You do not need proof of wrongdoing to end an arrangement that no longer feels right. Keep the conversation calm, short and fair."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "hiring-night-help",
    "briefing-whoever-helps",
    "finding-help-without-an-agency"
  ],
  "seo": {
    "description": "How to end a childcare arrangement calmly when trust or fit has gone, while keeping your baby's safety separate."
  },
  "longform": [
    {
      "h": "You do not need to build a case",
      "t": "Trust had gone. There were things we'd noticed that didn't add up — small inconsistencies, a sense that standards were different depending on whether anyone was watching, one episode where something was handled badly. None of it was provable, and some of it we genuinely couldn't be certain about.\n\nSo we waited, because it felt as though ending it required proof. That's the trap, and it cost us weeks.\n\nThe reframing that got us out of it: this arrangement isn't working for our household. That's it. It's true, it's sufficient, and it's not an allegation.\n\nIt is also fairer to the other person. Saying the arrangement no longer works leaves their reputation intact. Making an accusation you cannot support risks harming them and starting a dispute that changes nothing."
    },
    {
      "h": "Keep the conversation short",
      "t": "Short. Specific about the practical facts, vague about nothing that matters.\n\nThe arrangement isn't working for us. Your last night will be X. We'll pay the notice in full.\n\nArrange the replacement, or work out how you'll manage the gap, before the conversation happens.\n\nWe nearly didn't, and the reason the arrangement had already run too long was precisely the fear of the gap. Having cover in place means you're choosing between two workable options rather than between a bad fit and a crisis — and that's what finally made the decision easy."
    },
    {
      "h": "Keep safety as a separate question",
      "t": "Keep two things apart.\n\nWhether to continue employing someone is a judgement call and gut feeling is enough. Whether your baby has been harmed is a medical question, and it goes to a doctor now, not into the employment conversation."
    }
  ],
  "order": 130,
  "batch": "9"
},
{
  "id": "finding-help-without-an-agency",
  "topic": "sanity",
  "icon": "heart",
  "featured": false,
  "title": "How do I find childcare help without an agency?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months",
    "7–9 months",
    "10–12 months"
  ],
  "read": 3,
  "summary": "Agency lists run out fast. What to do next, how to check someone properly yourself, and the admin nobody warns you about.",
  "keywords": [
    "nanny",
    "live-in",
    "agency",
    "recruiting",
    "references",
    "visa",
    "flexible hours"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "You believe she's been hurt, dropped, or given the wrong medicine — call your doctor now",
      "She's floppy, very hard to wake, or her cry is nothing like her usual one",
      "Unexplained bruising or marks you can't account for",
      "Working hard to breathe, or she goes pale, grey or blue"
    ],
    "lead": "Blue or grey, a struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now."
  },
  "panel": {
    "eyebrow": "Parent Sanity • 0–12 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "A single agency's list is usually smaller than it sounds, and you'll exhaust it quickly",
        "Most good arrangements come through word of mouth rather than a database",
        "Direct hire means the checking is yours to do, not that it's worse",
        "Flexible patterns — a few nights plus a few daytime hours — are often easier to fill than a fixed full-time post"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Using several agencies at once rather than waiting on one to come up with someone",
        "Asking other parents locally, which produced better candidates than any list",
        "Writing the role out before advertising — hours, nights, days off, what's included",
        "Being honest in the advert about the flexible pattern instead of describing a tidier job than it was"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "You believe she's been hurt, dropped, or given the wrong medicine — call your doctor now",
        "She's floppy, very hard to wake, or her cry is nothing like her usual one",
        "Unexplained bruising or marks you can't account for",
        "Working hard to breathe, or she goes pale, grey or blue"
      ],
      "lead": "Blue or grey, a struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now."
    },
    "quick": "Try several agencies and local parent recommendations, then check references yourself and use a paid trial before making anything permanent."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "hiring-night-help",
    "briefing-whoever-helps",
    "letting-help-go"
  ],
  "seo": {
    "description": "Practical ways to find and check childcare help beyond one agency, including references, paid trials and paperwork."
  },
  "longform": [
    {
      "h": "When one agency runs out of names",
      "t": "We went to an agency, were given a database to look through, and got to the end of the plausible candidates in an afternoon. That's the normal experience rather than bad luck — a single agency's pool at any moment is smaller than the pitch suggests.\n\nWhat worked instead was running several routes at once. More than one agency, simultaneously, rather than politely waiting for one to produce someone. And asking other parents locally, which produced the best candidates we saw by a wide margin."
    },
    {
      "h": "Check people properly yourself",
      "t": "The temptation is to describe a neater job than the one you have. It wastes everyone's time, because the person takes it and then discovers the real shape of it.\n\nOurs was genuinely awkward at one point: a few nights a week, not the same nights, plus some hours in the morning on the days without nights. Flexible rather than regular. We put that in the advert as it was, and the people who replied were people for whom that pattern worked.\n\nIf you're hiring directly, the vetting is yours. It isn't difficult, it's just work.\n\nSpeak to references on the phone, not by message. The question that produced the most useful answers was not \"was she good\" but \"what did she find hard, and what would you tell the next family\". People will tell you something real in response to that."
    },
    {
      "h": "Start the paperwork early",
      "t": "Finding the person is often the quick part.\n\nIf they need a visa, a work permit, or permission to travel with you, start it long before you need them. We needed a Schengen visa for a live-in to come with us for a summer and the process was slower and more particular than expected. Whoever sponsors the person — you, or a company — matters to how it's done, and the paperwork depends on their nationality as much as yours."
    }
  ],
  "order": 131,
  "batch": "9"
},
{
  "id": "travelling-with-her",
  "topic": "sanity",
  "icon": "heart",
  "featured": false,
  "title": "Why is travelling with a baby so stressful?",
  "ages": [
    "2–3 months",
    "4–6 months",
    "7–9 months",
    "10–12 months"
  ],
  "read": 3,
  "summary": "Yes, most parents find it stressful. Worth it and stressful are not alternatives, and expecting the second makes the first easier to reach.",
  "keywords": [
    "travel",
    "flight",
    "stress",
    "bassinet",
    "formula",
    "jet lag",
    "worth it"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Working hard to breathe, grunting, or pauses in her breathing, or she goes pale, grey or blue",
      "She's floppy, very hard to wake, or her cry is nothing like her usual one",
      "A temperature of 38°C or above under three months",
      "She's refusing all feeds, or wet nappies have dropped away"
    ],
    "lead": "Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now."
  },
  "panel": {
    "eyebrow": "Parent Sanity • 2–12 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Most parents find travelling with a baby stressful, including ones who do it often",
        "The stress is logistics and lack of control, not a sign you've made a mistake",
        "Sleep and feeding go off for a few days either side, then reset",
        "Longer or more broken sleep after a hard journey is common catch-up"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Ringing the airline in advance with written questions, not finding out at the gate",
        "Booking the bassinet specifically, and confirming it rather than assuming the booking held",
        "Solving the feed before leaving — a thermos of hot water, a portable warmer, and bottled water low in minerals",
        "Pre-measured formula in individual portions, so nothing had to be weighed on a tray table"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Working hard to breathe, grunting, or pauses in her breathing, or she goes pale, grey or blue",
        "She's floppy, very hard to wake, or her cry is nothing like her usual one",
        "A temperature of 38°C or above under three months",
        "She's refusing all feeds, or wet nappies have dropped away"
      ],
      "lead": "Blue or grey, a pause or struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now."
    },
    "quick": "Most parents find baby travel stressful. Plan the feed, sleep and airport questions early, then expect the routine to wobble for a few days."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "an-hour-out-with-her",
    "newborn-immune-and-going-out",
    "visitors"
  ],
  "seo": {
    "description": "Why baby travel feels so difficult, plus simple planning for flights, feeds, sleep and the unsettled days afterwards."
  },
  "longform": [
    {
      "h": "Yes, travelling with a baby is hard",
      "t": "We asked outright whether parents generally hate travelling with babies, because we had just done it and wanted to know whether we were the problem.\n\nThe answer is that most find it stressful, including people who do it regularly and people whose babies travel well. What makes it hard isn't the baby — it's the combination of no control, no privacy, a schedule you can't move, and an audience.\n\nThe single highest-value thing we did was write out the questions for the airline before the first flight and ring them.\n\nWhat we needed to know: how the bassinet is booked and whether it's confirmed or requested, the weight and length limit for it, whether a doctor's letter is needed and from when, what can be carried beyond the normal allowance, how the pram is handled and where it's returned, what liquids are allowed for a baby through security control, and what the seating rules are."
    },
    {
      "h": "Solve the awkward parts before leaving",
      "t": "This was the thing that caused us most anxiety and had the most practical answer.\n\nThe problem with formula on a plane is water: you do not want to rely on whatever is available. Baby milk and food can be exempt from the usual 100ml liquid limit, but the exact security rules depend on the airport and journey, so check before flying. What worked for us was a thermos of hot boiled water, a portable warmer and bottled water chosen for its low mineral content rather than the brand.\n\nWe flew two days in a row at one point and she ate noticeably less than usual — several hundred millilitres below her normal — while being perfectly awake and cheerful. And after a difficult night flight where she didn't sleep at all, she then slept six hours straight once we landed.\n\nBoth of those are the normal shape of it. A dip in appetite for a day or two, and catch-up sleep that looks excessive. Neither needed anything done about it."
    },
    {
      "h": "Expect a few unsettled days",
      "t": "A smaller thing worth saying. One of us went away for work and video-called her, and the moment she saw his face on the screen she started crying.\n\nThat's not rejection and it isn't damage. A familiar face in an unfamiliar form, without the smell or the voice-in-the-room or the being-picked-up, is confusing rather than comforting at that age. It resolves the moment you're actually back."
    }
  ],
  "order": 132,
  "batch": "9"
},
{
  "id": "your-phone-in-her-room",
  "topic": "sanity",
  "icon": "heart",
  "featured": false,
  "title": "Is it bad to use my phone while my baby sleeps on me?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months",
    "7–9 months",
    "10–12 months"
  ],
  "read": 3,
  "summary": "Using your phone while she sleeps on you is fine. The guidance is about her screen time, not about yours — with one real caveat.",
  "keywords": [
    "phone",
    "screen time",
    "television",
    "guilt",
    "attention",
    "while she sleeps"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "She's floppy, very hard to wake, or her cry is nothing like her usual one",
      "Working hard to breathe, or she goes pale, grey or blue",
      "She stops responding to your face or voice at all, having previously done so",
      "She's stopped feeding, or wet nappies have dropped away"
    ],
    "lead": "Blue or grey, a struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now."
  },
  "panel": {
    "eyebrow": "Parent Sanity • 0–12 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Using your phone while she sleeps is not the same as putting a screen in front of her",
        "A phone in her room while she sleeps is not doing her harm",
        "A few minutes of television in the background has not damaged anything",
        "Almost every parent does this and almost every parent feels bad about it"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "Separating the two questions — is this bad for her, or is it stopping me being present",
        "Screen face-down for one short stretch a day where she had all the attention",
        "Notifications off so the phone wasn't pulling us out of the room mentally",
        "Using the phone deliberately rather than reflexively, which halved it without any rule"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "She's floppy, very hard to wake, or her cry is nothing like her usual one",
        "Working hard to breathe, or she goes pale, grey or blue",
        "She stops responding to your face or voice at all, having previously done so",
        "She's stopped feeding, or wet nappies have dropped away"
      ],
      "lead": "Blue or grey, a struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now."
    },
    "quick": "Using your phone while she sleeps is not the same as giving her screen time. The useful question is whether it keeps pulling you away when she is awake."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "are-we-bonding-if-shes-asleep",
    "checklist-mode",
    "safe-sleep-newborn"
  ],
  "seo": {
    "description": "What baby screen guidance means for a parent's phone use, and how to protect regular face-to-face time without guilt."
  },
  "longform": [
    {
      "h": "There are two different questions",
      "t": "We asked whether it was reasonable to use a phone in her room, and separately how bad it was to be on it while she slept on us. Both times what we actually wanted was permission.\n\nIt helps to split it. Is this harmful to her? Mostly no."
    },
    {
      "h": "What screen advice is really about",
      "t": "The screen-time guidance for babies concerns screens directed at her — content she watches, a device put in front of her to occupy her. The concern is about what it displaces: the back-and-forth of faces, voices and responses that's how she learns at this age.\n\nA screen you are looking at in the same room is different. A phone while she sleeps on your chest is not replacing interaction with her. One thing that helped Papa was using dark mode with the brightness turned right down. A few minutes of television in the background is not something to panic about — and we asked that question ourselves after it happened.\n\nThe thing worth taking seriously is displacement over a whole day.\n\nIf large parts of the time you're with her are also time you're on a phone, what she loses isn't a measured dose of screen exposure — it's the interaction. She looks at you and you don't look back. That's the mechanism, and it's about your attention, not her retina."
    },
    {
      "h": "Protect some phone-free attention",
      "t": "One practical exception: bright screens at night are worth avoiding because they can make settling harder for both of you. We found a soft red night-light worked best for us. We could see what we were doing without lighting the room enough to wake Ari fully.\n\nSo a dim room, no bright screen, and the phone face-down. That's about getting her back to sleep, not about her brain."
    }
  ],
  "order": 133,
  "batch": "9"
},
{
  "id": "an-hour-out-with-her",
  "topic": "sanity",
  "icon": "heart",
  "featured": false,
  "title": "What do I really need for a few hours out of the house with my baby?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months",
    "7–9 months",
    "10–12 months"
  ],
  "read": 2,
  "summary": "You're carrying a bag packed for a week because leaving the house became an operation. Most of it isn't needed, and the weight is part of why you stop going out.",
  "keywords": [
    "changing bag",
    "short outing",
    "essentials",
    "overpacking",
    "walk",
    "going out"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "She's floppy, very hard to wake, or her cry is nothing like her usual one",
      "Working hard to breathe, or she goes pale, grey or blue",
      "A temperature of 38°C or above under three months",
      "She's refusing feeds, or wet nappies have dropped away"
    ],
    "lead": "Blue or grey, a struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now."
  },
  "panel": {
    "eyebrow": "Parent Sanity • 0–12 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Overpacking is the universal first-year habit, and it comes from one bad experience",
        "For an hour close to home you need very little",
        "Most of what's in the bag has never been used on a short outing",
        "The weight of it is one of the reasons short outings stop happening"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "A small permanently packed bag for short trips, separate from the full one",
        "Two nappies, wipes, one change of clothes, a muslin, and whatever she feeds from",
        "Keeping it restocked on the way back in, not on the way out",
        "A spare set left in the car, which replaced about half the bag"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "She's floppy, very hard to wake, or her cry is nothing like her usual one",
        "Working hard to breathe, or she goes pale, grey or blue",
        "A temperature of 38°C or above under three months",
        "She's refusing feeds, or wet nappies have dropped away"
      ],
      "lead": "Blue or grey, a struggle to breathe, or a floppy baby you cannot wake — call your local emergency number now."
    },
    "quick": "For a short outing, pack for the likely problems rather than every possible disaster. A small bag makes leaving home much easier."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "travelling-with-her",
    "newborn-immune-and-going-out",
    "visitors"
  ],
  "seo": {
    "description": "A simple packing list for a few hours out of the house with a baby, so leaving home does not feel like preparing for a week away."
  },
  "longform": [
    {
      "h": "Why the bag became so heavy",
      "t": "Almost always one bad experience. A nappy situation with no spare clothes, or a feed you weren't ready for, and from then on the bag contains everything that might ever be needed.\n\nThe cost isn't the carrying. It's that leaving the house becomes a twenty-minute operation, and a twenty-minute operation for a forty-minute walk means the walk often doesn't happen. We noticed we were going out less and assumed it was tiredness."
    },
    {
      "h": "The short-trip list",
      "t": "What we settled on for an hour near home: two nappies, a travel pack of wipes, one full change of clothes, a muslin, and whatever she feeds from if a feed might land.\n\nThat's it. No changing mat — a muslin or a coat does the job. No spare for the spare."
    },
    {
      "h": "Make the next outing easier",
      "t": "A spare set in the car — nappies, wipes, clothes, a blanket — replaced about half of what we'd been carrying, because the bag no longer had to cover the worst case.\n\nAnd a reframe that helped: for a short trip close to home, most emergencies are solvable at the destination or by going home. The bag is insurance against a problem that usually has another solution. That's a different calculation from a day out or a flight, where the bag genuinely is the only option."
    }
  ],
  "order": 134,
  "batch": "9"
},
{
  "id": "the-fights-about-her",
  "topic": "sanity",
  "icon": "heart",
  "featured": false,
  "title": "Why are we arguing so much since having a baby?",
  "ages": [
    "0–1 month",
    "2–3 months",
    "4–6 months",
    "7–9 months",
    "10–12 months"
  ],
  "read": 3,
  "summary": "Almost none of them are about what they appear to be about. The useful move is interrupting the pattern, not winning the argument.",
  "keywords": [
    "arguing",
    "partner",
    "relationship",
    "blame",
    "defensive",
    "resentment",
    "repair"
  ],
  "body": "",
  "callout": {
    "title": "Call your doctor immediately if",
    "items": [
      "Any thought of harming yourself or her — ring your doctor or a crisis line today",
      "You are seeing or hearing things that are not there",
      "You are very confused or losing touch with what is real",
      "You are frightened of your partner or feel controlled — tell someone you trust and seek help"
    ]
  },
  "panel": {
    "eyebrow": "Parent Sanity • 0–12 months",
    "normal": {
      "title": "Usually normal",
      "items": [
        "Arguments go up sharply in the first year, in most relationships",
        "The subject is usually really about exhaustion or an uneven load",
        "Nothing decided at 3am is accurate or fair",
        "Defensiveness is the normal response to feeling blamed, and it escalates reliably"
      ]
    },
    "helped": {
      "title": "What helped us",
      "items": [
        "\"Please don't be angry, let's talk\" instead of defending — hard, but it worked",
        "Having the conversation in daylight, not at the moment it flares",
        "Naming the load rather than the behaviour: what was relentless this week, and what could move",
        "Agreeing not to keep score"
      ]
    },
    "warn": {
      "title": "Call your doctor immediately if",
      "items": [
        "Any thought of harming yourself or her — ring your doctor or a crisis line today",
        "You are seeing or hearing things that are not there",
        "You are very confused or losing touch with what is real",
        "You are frightened of your partner or feel controlled — tell someone you trust and seek help"
      ]
    },
    "quick": "More arguments after a baby are common because both parents are tired and stretched. Talk about the load in daylight, not during the 3am explosion."
  },
  "originalQuestions": [],
  "sources": [],
  "medical": false,
  "related": [
    "splitting-nights",
    "touched-out",
    "overwhelmed-new-parent"
  ],
  "seo": {
    "description": "Why arguments often increase after a baby, how tiredness and an uneven load feed them, and when outside help matters."
  },
  "longform": [
    {
      "h": "What our arguments looked like",
      "t": "A mistake, then anger about it, then defending the mistake, then a back-and-forth, then making up later and agreeing calmly on exactly what we'd have agreed in the first five minutes.\n\nThe thing one of us eventually wanted was to be able to say, in the moment: please don't be angry — let's talk about this. Rather than getting defensive and fighting back. Because the calm conversation always happened eventually, just two hours later and after considerable damage.\n\nOurs were about bottles, timings, who did what, whether something had been done properly. None of them were about those things.\n\nThey were about being depleted, and about the load not feeling even. That's what makes them unresolvable on their own terms — you can settle the bottle question and have the same argument about something else within three days, because the actual input hasn't changed."
    },
    {
      "h": "The subject is often not the problem",
      "t": "Worth looking at, because it was a live one for us.\n\nWhen one person feels they're always the one at fault, two things are usually happening at once. One is real — the mistakes may genuinely be concentrated, often because one person is doing more of a particular kind of task and more tasks means more errors. The other is that the pattern of blame has become the habit, and both people are now reading neutral events through it.\n\nNothing decided late at night, when both of you are wrecked, is accurate or fair. We stopped keeping score, and that helped far more than it should have.\n\nThe conversations that actually changed anything happened in daylight, not during a flare, and usually not about a specific incident. Reviewing how the week had gone, out loud, once, was better than addressing each thing as it arose."
    },
    {
      "h": "Talk in daylight, not at 3am",
      "t": "Everything above is about ordinary conflict between two exhausted people who are on the same side.\n\nIf you're being made to feel frightened, controlled, or unable to make decisions — if the arguments involve threats, or you're changing your behaviour to avoid someone's anger — that is a different situation and none of the advice here applies to it. Tell someone outside the relationship: a doctor, a midwife or health visitor, a friend. Those conversations are had more often than you'd think and you'll be taken seriously."
    }
  ],
  "order": 135,
  "batch": "9"
}
];

/* Two consumers, both legitimate:

   - scripts/lib/data.js, the Netlify build, which uses this as the fallback
     when the Firestore read fails so a deploy can never take the site down.
   - Studio and the Editor, which are editing surfaces and are allowed to load
     the complete content (SEO_AI_ARCHITECTURE.md). Studio uses it to seed
     Firestore and to work in local-preview mode.

   No public page loads it, and tests/verify.js fails the build if one does. */
if (typeof module === "object" && module.exports) {
  module.exports = { AGES, TOPICS, ICONS, GUIDES, topicById };
}
if (typeof window !== "undefined") {
  window.GUIDES = GUIDES; window.AGES = AGES;
  window.TOPICS = TOPICS; window.ICONS = ICONS;
  window.topicById = topicById;
}
