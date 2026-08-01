/* ============================================================
   MESSY PARENTS COLLECTION — CONTENT FILE
   ------------------------------------------------------------
   This is the ONLY file you need to edit to add your writing.
   Everything on the site is rendered from what is below.

   Each age period accepts:

     headline    short title for the section
     summary     1–3 sentence opening paragraph
     atAGlance   [{ label: 'Feeds per day', value: '8–12+' }]  (0–4 items)
     blocks      the body of the section (see block types below)
     redFlags    ['...'] — rendered as a red "when to get help" card
     status      'todo' | 'draft' | 'done'   (todo shows a placeholder)

   Block types:

     { type:'text',      heading:'', body:'para one\n\npara two' }
     { type:'list',      heading:'', items:['a','b'] }
     { type:'steps',     heading:'', items:['first','second'] }
     { type:'checklist', heading:'', items:['pack this','pack that'] }
     { type:'callout',   variant:'tip'|'note'|'warn', heading:'', body:'' }
     { type:'quote',     body:'', attribution:'' }
     { type:'image',     src:'assets/img/your-file.png', caption:'' }

   Feeding → Month 1 is filled in as a worked example. Copy its
   shape. Set status to 'draft' or 'done' once you write a section.
   ============================================================ */

window.MPC = {
  "periods": [
    {
      "id": "m01",
      "label": "Month 1",
      "short": "1",
      "range": "0–1 months",
      "stage": "Newborn",
      "year": "Year one"
    },
    {
      "id": "m02",
      "label": "Month 2",
      "short": "2",
      "range": "1–2 months",
      "stage": "Newborn",
      "year": "Year one"
    },
    {
      "id": "m03",
      "label": "Month 3",
      "short": "3",
      "range": "2–3 months",
      "stage": "Newborn",
      "year": "Year one"
    },
    {
      "id": "m04",
      "label": "Month 4",
      "short": "4",
      "range": "3–4 months",
      "stage": "Settling in",
      "year": "Year one"
    },
    {
      "id": "m05",
      "label": "Month 5",
      "short": "5",
      "range": "4–5 months",
      "stage": "Settling in",
      "year": "Year one"
    },
    {
      "id": "m06",
      "label": "Month 6",
      "short": "6",
      "range": "5–6 months",
      "stage": "Settling in",
      "year": "Year one"
    },
    {
      "id": "m07",
      "label": "Month 7",
      "short": "7",
      "range": "6–7 months",
      "stage": "On the move",
      "year": "Year one"
    },
    {
      "id": "m08",
      "label": "Month 8",
      "short": "8",
      "range": "7–8 months",
      "stage": "On the move",
      "year": "Year one"
    },
    {
      "id": "m09",
      "label": "Month 9",
      "short": "9",
      "range": "8–9 months",
      "stage": "On the move",
      "year": "Year one"
    },
    {
      "id": "m10",
      "label": "Month 10",
      "short": "10",
      "range": "9–10 months",
      "stage": "Almost one",
      "year": "Year one"
    },
    {
      "id": "m11",
      "label": "Month 11",
      "short": "11",
      "range": "10–11 months",
      "stage": "Almost one",
      "year": "Year one"
    },
    {
      "id": "m12",
      "label": "Month 12",
      "short": "12",
      "range": "11–12 months",
      "stage": "Almost one",
      "year": "Year one"
    },
    {
      "id": "m13_15",
      "label": "13–15 months",
      "short": "13–15",
      "range": "13–15 months",
      "stage": "Toddler",
      "year": "Year two"
    },
    {
      "id": "m16_18",
      "label": "16–18 months",
      "short": "16–18",
      "range": "16–18 months",
      "stage": "Toddler",
      "year": "Year two"
    },
    {
      "id": "m19_21",
      "label": "19–21 months",
      "short": "19–21",
      "range": "19–21 months",
      "stage": "Toddler",
      "year": "Year two"
    },
    {
      "id": "m22_24",
      "label": "22–24 months",
      "short": "22–24",
      "range": "22–24 months",
      "stage": "Toddler",
      "year": "Year two"
    }
  ],
  "tabs": [
    {
      "id": "feeding",
      "label": "Feeding",
      "file": "feeding.html",
      "tagline": "Milk, solids and everything sticky in between.",
      "intro": "Every feeding question you had at 3am, sorted by exactly how old your baby is right now."
    },
    {
      "id": "sleeping",
      "label": "Sleeping",
      "file": "sleeping.html",
      "tagline": "Naps, nights, and the regressions nobody warned you about.",
      "intro": "What sleep actually looks like at each age — and what to do when it stops looking like that."
    },
    {
      "id": "development",
      "label": "Development & Play",
      "file": "development.html",
      "tagline": "Milestones, motor skills and things to do together.",
      "intro": "What your baby is learning this month, and simple ways to play along with it."
    },
    {
      "id": "health",
      "label": "Health & Care",
      "file": "health.html",
      "tagline": "Bath time, teeth, jabs and knowing when to call someone.",
      "intro": "The practical care stuff, plus clear signs for when something needs a professional."
    }
  ],
  "content": {
    "feeding": {
      "m01": {
        "headline": "Feeding a brand new baby",
        "summary": "The first month is about frequency, not schedule. Newborn stomachs hold very little, so they empty fast and refill often. Your only real jobs are: feed on demand, watch nappies, and get weight checks.",
        "atAGlance": [
          {
            "label": "Feeds per day",
            "value": "8–12+"
          },
          {
            "label": "Typical gap",
            "value": "2–3 hours"
          },
          {
            "label": "Wet nappies",
            "value": "6+ by day 5"
          },
          {
            "label": "Solids",
            "value": "None — milk only"
          }
        ],
        "blocks": [
          {
            "type": "text",
            "heading": "What is happening",
            "body": "Newborns cluster feed, especially in the evenings. This looks alarming and is normal — it is how supply gets established.\n\nCap this section at whatever length you like; blank lines become separate paragraphs."
          },
          {
            "type": "list",
            "heading": "Signs the feed is going well",
            "items": [
              "Deep, rhythmic sucking with audible swallows",
              "Baby releases the breast or bottle on their own",
              "Body is relaxed and hands unclench by the end",
              "Steady weight gain after the initial drop"
            ]
          },
          {
            "type": "callout",
            "variant": "tip",
            "heading": "Quick win",
            "body": "Keep a bottle of water and a snack wherever you usually feed. Dehydration is the most common avoidable reason a feed goes badly."
          },
          {
            "type": "steps",
            "heading": "If the latch hurts",
            "items": [
              "Break the seal gently with a clean finger — do not pull off.",
              "Reposition so baby’s nose is level with the nipple, not their mouth.",
              "Wait for a wide open mouth before bringing them on.",
              "If pain continues past the first few seconds, get a feeding assessment."
            ]
          }
        ],
        "redFlags": [
          "Fewer than 6 wet nappies a day after day 5",
          "Baby has not regained birth weight by 2 weeks",
          "Consistently too sleepy to wake for feeds",
          "Cracked or bleeding nipples that are not improving"
        ],
        "status": "example"
      },
      "m02": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m03": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m04": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m05": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m06": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m07": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m08": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m09": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m10": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m11": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m12": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m13_15": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m16_18": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m19_21": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m22_24": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      }
    },
    "sleeping": {
      "m01": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m02": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m03": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m04": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m05": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m06": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m07": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m08": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m09": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m10": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m11": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m12": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m13_15": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m16_18": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m19_21": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m22_24": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      }
    },
    "development": {
      "m01": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m02": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m03": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m04": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m05": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m06": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m07": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m08": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m09": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m10": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m11": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m12": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m13_15": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m16_18": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m19_21": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m22_24": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      }
    },
    "health": {
      "m01": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m02": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m03": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m04": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m05": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m06": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m07": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m08": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m09": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m10": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m11": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m12": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m13_15": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m16_18": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m19_21": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      },
      "m22_24": {
        "headline": "",
        "summary": "",
        "atAGlance": [],
        "blocks": [],
        "redFlags": [],
        "status": "todo"
      }
    }
  }
};
