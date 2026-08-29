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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
    "items": [
      "Hives, swelling or vomiting after a new food",
      "Breathing difficulty after food—call emergency services",
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
      "title": "Call your doctor if",
      "items": [
        "Hives, swelling or vomiting after a new food",
        "Breathing difficulty after food—call emergency services",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
    "title": "Call your doctor if",
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
      "title": "Call your doctor if",
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
