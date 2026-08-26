/* ==========================================================================
   The Messy Parents Collection — content + shared UI
   Add a new guide: copy a block in GUIDES and change the fields.
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
  id:"drinking-less-milk", topic:"feeding", icon:"bottle", featured:true,
  title:"Why is my baby drinking less milk?",
  ages:["4–6 months","7–9 months"], read:3,
  summary:"A sudden drop in bottles or feeds is usually distraction, a growth plateau, or teething — not a problem.",
  body:`
<p>You measured it, you wrote it down, and the number went down. That is genuinely unsettling at 2am. It is also, most of the time, completely ordinary.</p>
<h2>The usual suspects</h2>
<ul>
<li><strong>Distraction.</strong> Around four months babies discover the world. A dog, a sibling, a ceiling fan — all more interesting than milk. Feeds get shorter, not smaller: they become efficient.</li>
<li><strong>The growth curve flattens.</strong> Intake per kilo drops steadily through the first year. A baby who drank 900ml at four months may genuinely need less relative to their size at seven.</li>
<li><strong>Teething.</strong> Sucking pressure hurts a sore gum. Expect a few rough days, then a return to normal.</li>
<li><strong>Solids.</strong> Once food arrives, milk gives ground. That is the design, not a fault.</li>
<li><strong>A cold.</strong> A blocked nose makes it impossible to suck and breathe at once. Short, frequent feeds are the workaround.</li>
</ul>
<h2>What to actually watch</h2>
<p>Forget the daily total. Look at the week, and look at the baby.</p>
<ul>
<li>Wet nappies: roughly five or more heavy ones a day.</li>
<li>Mood: alert and interested between feeds, even if grumpier than usual.</li>
<li>Weight: following its own curve at the next check, not necessarily the printed one.</li>
</ul>
<div class="quiet">A baby who is bored of feeding still feeds. A baby who is unwell stops being interested in everything, not just the bottle.</div>
<h2>Things that help</h2>
<ul>
<li>Feed in a dull, dim room. No toys, no TV, no chatty relatives.</li>
<li>Try a dream feed if daytime is a write-off.</li>
<li>Check the teat flow. Too slow is tiring; too fast is alarming. Both end feeds early.</li>
<li>Offer, don't insist. Pushing a bottle teaches a baby to fight it.</li>
</ul>`,
  callout:{title:"Call your doctor if",items:[
    "Fewer than four wet nappies in 24 hours, or dark, strong-smelling urine",
    "Refusing nearly all feeds for more than 8 hours in a young baby",
    "Floppy, unusually sleepy, or hard to rouse",
    "Vomiting after most feeds, or a feed refusal alongside a fever"]},
  panel:{
    eyebrow:"Feeding • 4–9 months",
    normal:{title:"Usually normal",items:[
      "Distraction — the world got interesting","A flattening growth curve",
      "Teething","Solids taking over","A cold or blocked nose"]},
    warn:{title:"Call your doctor if",items:[
      "Fewer than 4 wet nappies a day, or dark urine",
      "Refusing nearly all feeds for 8+ hours","Floppy, very sleepy or hard to rouse",
      "Vomiting most feeds, or refusal with a fever"]},
    helped:{title:"What helped us",items:[
      "Feed in a dim, quiet room","Try a dream feed","Check the teat flow","Offer, don't insist"]},
    quick:"A dip is usually distraction, a growth plateau or teething — watch the baby and the whole week, not the daily total."
  },
  related:["reflux-or-spit-up","starting-solids","teething"]
},
{
  id:"wont-nap", topic:"sleeping", icon:"moon", featured:true,
  title:"Why won't my baby nap?",
  ages:["2–3 months","4–6 months","7–9 months"], read:3,
  summary:"Nine times out of ten it's the wake window — too short and they're not tired, too long and they're wired.",
  body:`
<p>You did the routine. You did the dark room. You did the shushing that makes you sound like a broken radiator. They are still awake, and furious about it.</p>
<h2>Start with the wake window</h2>
<p>The gap between waking and the next sleep matters more than anything else you can control. Rough guide, from the end of one sleep to the start of the next:</p>
<ul>
<li>0–3 months: 45–90 minutes</li>
<li>4–6 months: 1.5–2.5 hours</li>
<li>7–9 months: 2.5–3.5 hours</li>
<li>10–14 months: 3–4 hours</li>
</ul>
<p>Too short and there's no sleep pressure. Too long and you get an overtired baby running on adrenaline, which looks exactly like a baby who isn't tired at all. That is the trap.</p>
<h2>Read the first sign, not the third</h2>
<p>The first yawn or the first glazed stare is your window. By the time you get eye-rubbing and back-arching you are already late, and the nap will be short and hard-won.</p>
<h2>The boring fixes that work</h2>
<ul>
<li><strong>Darker.</strong> Properly dark. Hold your hand up — if you can see your fingers clearly, it's a nightclub in there.</li>
<li><strong>Same three things, same order.</strong> Nappy, sleeping bag, one song. Predictability does the heavy lifting.</li>
<li><strong>Start earlier than feels right.</strong> Begin winding down ten minutes before the window closes.</li>
<li><strong>White noise, continuously.</strong> Not a track that stops after fifteen minutes.</li>
</ul>
<h2>When the nap is 35 minutes and that's it</h2>
<p>That's one sleep cycle. It's normal, especially between three and six months, and it usually resolves on its own. If you want to extend it, be in the room before they surface and settle them at the first stir rather than after the full wake-up.</p>
<div class="quiet">Some days there is no nap. There is only survival, a walk, and an early bedtime. That is a legitimate plan.</div>`,
  callout:{title:"Worth a chat with your doctor or health visitor if",items:[
    "Your baby seems to be in pain when laid flat",
    "Loud snoring, gasping, or long pauses in breathing during sleep",
    "Naps have collapsed alongside feeding refusal or weight concerns"]},
  panel:{
    eyebrow:"Sleeping • 2–9 months",
    normal:{title:"Usually just",items:[
      "Wake window too short (not tired) or too long (overtired)",
      "You caught the third tired sign, not the first","Too much light in the room",
      "A 35-minute single-cycle nap — normal at 3–6 months"]},
    warn:{title:"Chat to your doctor or health visitor if",items:[
      "Your baby seems in pain laid flat","Loud snoring, gasping or pauses in breathing",
      "Naps collapse alongside feeding refusal or weight worries"]},
    helped:{title:"What helped us",items:[
      "Make it properly dark","Same three things, same order",
      "Start winding down early","Continuous white noise"]},
    quick:"Nine times out of ten it's the wake window — too short and they're not tired, too long and they're wired."
  },
  related:["sleep-regression","early-waking","touched-out"]
},
{
  id:"sleep-regression", topic:"sleeping", icon:"baby", featured:true,
  title:"Is this sleep regression?",
  ages:["2–3 months","4–6 months","7–9 months","10–12 months"], read:3,
  summary:"Probably. But 'regression' is a bad word for it — it's usually a permanent change in how your baby sleeps, or a new skill breaking through.",
  body:`
<p>They slept. For weeks, they slept. Now they're up four times a night and you're googling at 3am with one eye open.</p>
<h2>What's actually happening</h2>
<p>At around four months, sleep architecture changes for good. Newborns drop into deep sleep immediately; older babies cycle through lighter stages and surface fully between them. If your baby has always been rocked or fed to sleep, they now notice they've been moved — and call for the thing that got them there.</p>
<p>The later disruptions are usually skills. Rolling, sitting, crawling and pulling to stand all get rehearsed at 2am, enthusiastically, by a baby who cannot yet get back down.</p>
<h2>Rough timing</h2>
<ul>
<li><strong>4 months:</strong> the real one. A permanent change, not a phase to wait out.</li>
<li><strong>6 months:</strong> often teeth, or a nap transition.</li>
<li><strong>8–10 months:</strong> crawling, pulling up, and separation anxiety arriving together.</li>
<li><strong>12 and 18 months:</strong> walking, words, and dropping to one nap.</li>
</ul>
<h2>What helps</h2>
<ul>
<li><strong>Practise the new skill in daylight.</strong> Floor time, lots of it. A baby who can roll both ways confidently stops getting stuck at night.</li>
<li><strong>Put them down drowsy but awake, sometimes.</strong> Even once a day builds the skill you need at 2am.</li>
<li><strong>Hold the schedule.</strong> Bedtimes that drift later make everything worse.</li>
<li><strong>Pick one response and stick to it for a week.</strong> Changing tactics nightly is what actually prolongs it.</li>
</ul>
<div class="quiet">Two weeks is typical. Four is not unusual. It ends — usually right after you've given up and accepted your new life.</div>
<h2>The bit nobody says</h2>
<p>You do not have to sleep train to get through this. You also do not have to refuse to. Both work, both have happy babies at the end, and the only wrong choice is the one you're doing because someone made you feel guilty.</p>`,
  callout:{title:"Check in with a professional if",items:[
    "Night waking comes with fever, pulling at ears, or inconsolable crying",
    "Your baby has stopped feeding well as well as sleeping badly",
    "You are so exhausted that driving or daily tasks feel unsafe — this is a real reason to ask for help"]},
  panel:{
    eyebrow:"Sleeping • 2–12 months",
    normal:{title:"Usually normal",items:[
      "A permanent 4-month change in how they sleep",
      "A new skill (rolling, crawling, standing) rehearsed at 2am",
      "Teeth, or a nap transition","Separation anxiety around 8–10 months"]},
    warn:{title:"Check in with a professional if",items:[
      "Night waking with fever, ear-pulling or inconsolable crying",
      "Feeding has dropped off too, not just sleep",
      "You're so exhausted that driving feels unsafe — a real reason to ask for help"]},
    helped:{title:"What helped us",items:[
      "Practise the new skill in daylight","Put down drowsy but awake, sometimes",
      "Hold the schedule","Pick one response and stick with it a week"]},
    quick:"Usually real — and usually not just a phase, but a permanent change or a new skill breaking through. Two weeks is typical."
  },
  related:["wont-nap","early-waking","splitting-nights"]
},
{
  id:"starting-solids", topic:"feeding", icon:"bottle", featured:false,
  title:"How do I start solids without losing my mind?",
  ages:["4–6 months","7–9 months"], read:3,
  summary:"One food, once a day, after a milk feed. Everything else is detail you can add later.",
  body:`
<p>The internet will tell you solids is a philosophy. It's mostly just mess with a spoon in it.</p>
<h2>When to start</h2>
<p>Around six months, and when your baby can sit with support, hold their head steady, and bring things to their mouth deliberately. Age alone isn't the signal — the three skills are.</p>
<h2>The first two weeks</h2>
<ul>
<li>Milk stays the main meal. Food is practice, not nutrition, at this stage.</li>
<li>Offer food <em>after</em> a milk feed, when they're not desperate.</li>
<li>One new food every couple of days, so you can spot a reaction.</li>
<li>Once a day is plenty. Build to twice around seven months, three times by nine.</li>
</ul>
<h2>Purée or baby-led?</h2>
<p>Either. Both. The research doesn't crown a winner, and most families end up doing a mix because that's what real life looks like. What matters more: a range of textures by nine months, so they don't get stuck on smooth.</p>
<h2>Allergens: earlier, not later</h2>
<p>Current guidance is to introduce common allergens — egg, peanut (as smooth butter thinned with water, never whole nuts), dairy, wheat, fish — from around six months rather than delaying. Introduce them at home, in the daytime, one at a time. If there's eczema or a family history of food allergy, speak to your doctor before you start.</p>
<h2>Choking vs gagging</h2>
<p>Gagging is loud, red-faced and productive. It's a reflex doing its job, and it happens a lot. Choking is silent. Learn the difference, sit them upright, never leave them alone with food, and consider a short infant first-aid course — it's the highest-value two hours you'll spend this year.</p>
<div class="quiet">They will eat about four grams and wear the rest. That is a successful meal.</div>`,
  callout:{title:"Get medical advice if",items:[
    "Hives, swelling around the mouth or eyes, vomiting or wheezing after a new food — call emergency services for breathing difficulty or swelling",
    "Persistent refusal of all textures beyond around nine months",
    "Your baby has significant eczema or an existing allergy — get a plan before introducing allergens"]},
  panel:{
    eyebrow:"Feeding • 4–9 months",
    normal:{title:"Where to start",items:[
      "Around 6 months — when they can sit supported, hold their head steady and reach for food",
      "Milk stays the main meal at first","One new food every couple of days",
      "Purée, baby-led or a mix — all fine"]},
    warn:{title:"Get medical advice if",items:[
      "Hives, swelling, vomiting or wheezing after a food — call emergency services for breathing trouble or swelling",
      "Refusing all textures beyond around 9 months",
      "Significant eczema or an existing allergy — get a plan before allergens"]},
    helped:{title:"What helped us",items:[
      "Offer food after a milk feed","Introduce allergens early, at home, one at a time",
      "Learn choking vs gagging","Expect 4g eaten and the rest worn"]},
    quick:"One food, once a day, after a milk feed. Everything else is detail you can add later."
  },
  related:["drinking-less-milk","reflux-or-spit-up"]
},
{
  id:"bottle-refusal", topic:"feeding", icon:"bottle", featured:false,
  title:"My baby suddenly refuses the bottle",
  ages:["2–3 months","4–6 months","7–9 months"], read:3,
  summary:"Usually flow, temperature, position or a sore mouth. Rarely the bottle itself.",
  body:`
<p>Yesterday: fine. Today: arched back, sealed lips, and a look of profound betrayal.</p>
<h2>Work through the list</h2>
<ul>
<li><strong>Flow rate.</strong> Babies outgrow teats. A newborn-flow teat at five months is exhausting work for a small person.</li>
<li><strong>Temperature.</strong> Fussier than you'd think. Try slightly warmer than you've been doing.</li>
<li><strong>Position.</strong> Try more upright, or facing outward. Some babies hate the cradle hold once they can see the room.</li>
<li><strong>Sore mouth.</strong> Teething, a cold, or thrush (white patches that don't wipe off) all make sucking unpleasant.</li>
<li><strong>Who's holding it.</strong> A breastfed baby often refuses a bottle from the parent who breastfeeds, and takes it happily from someone else. Leave the room entirely.</li>
</ul>
<h2>Don't escalate</h2>
<p>Forcing, or persisting through crying, teaches a baby that bottles are a fight. Stop, reset, try again in 20 minutes. Offer when they're sleepy — half-asleep babies feed on autopilot.</p>
<h2>If it's a nursery deadline</h2>
<p>Start two to three weeks out. Once a day, same time, someone else offering, in a different room from where you feed. If the bottle is losing badly, an open cup or a sippy cup works from around six months and skips the fight completely.</p>`,
  callout:{title:"Call your doctor if",items:[
    "Refusing feeds for more than 8 hours, or fewer than four wet nappies a day",
    "White patches inside the mouth that don't wipe away",
    "Refusal with fever, vomiting, or unusual sleepiness"]},
  panel:{
    eyebrow:"Feeding • 2–9 months",
    normal:{title:"Usually it's",items:[
      "Flow rate — the teat's been outgrown","Temperature — try slightly warmer",
      "Position — more upright, or facing out","A sore mouth (teething, cold or thrush)",
      "Who's holding it — try someone else"]},
    warn:{title:"Call your doctor if",items:[
      "Refusing feeds 8+ hours, or under 4 wet nappies a day",
      "White patches inside the mouth that don't wipe off",
      "Refusal with fever, vomiting or unusual sleepiness"]},
    helped:{title:"What helped us",items:[
      "Don't force — stop and retry in 20 minutes","Offer when they're sleepy",
      "Someone else offers, in another room","From 6 months, a cup skips the fight"]},
    quick:"Usually flow, temperature, position or a sore mouth — rarely the bottle itself."
  },
  related:["drinking-less-milk","teething"]
},
{
  id:"reflux-or-spit-up", topic:"feeding", icon:"bottle", featured:false,
  title:"Spit-up, reflux, or something else?",
  ages:["0–1 month","2–3 months","4–6 months"], read:3,
  summary:"A happy spitter is a laundry problem. A distressed one is worth a conversation with your doctor.",
  body:`
<p>Almost half of babies bring milk back up regularly. The volume looks catastrophic — a tablespoon on a muslin looks like the entire feed. It usually isn't.</p>
<h2>The distinction that matters</h2>
<p><strong>Posseting</strong> is effortless. Milk appears, baby is unbothered, weight gain is fine. Nothing needs treating except your washing machine. It peaks around four months and mostly resolves once they're upright and on solids.</p>
<p><strong>Reflux that's causing problems</strong> looks different: crying during or after feeds, arching away mid-feed, refusing to lie flat, poor weight gain, frequent hiccups and unsettled sleep. That's worth medical advice.</p>
<h2>Things that genuinely help</h2>
<ul>
<li>Smaller feeds, more often.</li>
<li>Upright for 20–30 minutes after a feed. Not in a car seat — the slump makes it worse.</li>
<li>Winding partway through, not just at the end.</li>
<li>Paced bottle feeding: horizontal-ish bottle, breaks, let them set the rhythm.</li>
</ul>
<p>Do not tilt the cot or add anything to the sleep surface. Babies sleep flat on their back, on a firm mattress, with nothing else in the cot. That rule doesn't bend for reflux.</p>`,
  callout:{title:"See a doctor if",items:[
    "Green or yellow vomit, blood in vomit, or forceful projectile vomiting",
    "Poor weight gain, or persistent refusal to feed",
    "Arching and crying with most feeds, or blood in stools",
    "Any vomiting alongside fever or a swollen tummy"]},
  panel:{
    eyebrow:"Feeding • 0–6 months",
    normal:{title:"Usually just posseting",items:[
      "Effortless spit-up, baby unbothered, weight fine",
      "A tablespoon looks like the whole feed — it isn't",
      "Peaks around 4 months, eases with sitting up and solids"]},
    warn:{title:"See a doctor if",items:[
      "Green or yellow vomit, blood, or forceful projectile vomiting",
      "Poor weight gain, or persistent feed refusal",
      "Arching and crying with most feeds, or blood in stools",
      "Vomiting with fever or a swollen tummy"]},
    helped:{title:"What helped us",items:[
      "Smaller feeds, more often","Upright 20–30 min after (not a car seat)",
      "Wind partway through","Keep sleep flat on the back — reflux doesn't change that"]},
    quick:"A happy spitter is a laundry problem. A distressed one is worth a conversation with your doctor."
  },
  related:["drinking-less-milk","bottle-refusal"]
},
{
  id:"early-waking", topic:"sleeping", icon:"moon", featured:false,
  title:"The 5am wake-up",
  ages:["7–9 months","10–12 months","12–18 months","18–24 months"], read:3,
  summary:"Usually bedtime too late, nap timing, or light. Rarely a baby who's finished sleeping.",
  body:`
<p>Anything before 6am is a night waking wearing a disguise. Treat it as one.</p>
<h2>The four causes, in order of likelihood</h2>
<ul>
<li><strong>Overtired at bedtime.</strong> Counterintuitive, but a late bedtime almost always produces an earlier wake-up. Try bedtime 20 minutes earlier for five nights before judging.</li>
<li><strong>Light.</strong> Sunrise creeps forward. Blackout that actually blacks out, taped at the edges if needed.</li>
<li><strong>Nap too close to bedtime, or too long.</strong> The last nap should end at least three hours before bed for an older baby.</li>
<li><strong>Habit.</strong> If 5am means lights on, milk, and downstairs, that's a good deal and they'll keep taking it.</li>
</ul>
<h2>The fix that takes patience</h2>
<p>Keep the room dark and boring until your chosen "morning" time. Don't start the day. Same low voice, same dim light, no getting up. It takes a week or two of holding the line before it moves.</p>
<div class="quiet">Some babies are simply larks. If they wake at 5.30 cheerful and well-rested, you may be fixing a scheduling problem that only exists for you.</div>`,
  callout:null,
  panel:{
    eyebrow:"Sleeping • 7–24 months",
    normal:{title:"Usually just",items:[
      "Bedtime too late — overtired brings the wake-up earlier","Light — sunrise creeping in",
      "Last nap too long, or too close to bedtime","Habit — 5am means lights, milk and downstairs"]},
    warn:{title:"Worth knowing",items:[
      "Anything before 6am is a night waking in disguise — treat it as one",
      "A cheerful, well-rested early riser may simply be a lark"]},
    helped:{title:"What helped us",items:[
      "Keep the room dark and boring until your chosen 'morning'",
      "Try bedtime 20 minutes earlier for five nights","Hold the line for a week or two"]},
    quick:"Usually bedtime too late, nap timing or light — rarely a baby who's finished sleeping."
  },
  related:["wont-nap","sleep-regression"]
},
{
  id:"day-night-confusion", topic:"sleeping", icon:"moon", featured:false,
  title:"Awake all night, asleep all day",
  ages:["0–1 month","2–3 months"], read:3,
  summary:"Newborns have no body clock yet. You build it for them, with light and contrast.",
  body:`
<p>Your baby spent nine months in the dark being rocked to sleep every time you walked around. The moment you lay down was the moment the rocking stopped and the party started. That pattern doesn't switch off at birth.</p>
<h2>Building the body clock</h2>
<ul>
<li><strong>Daylight in the morning.</strong> Curtains open, outside if you can manage it, even for ten minutes. Light is the strongest signal there is.</li>
<li><strong>Make days loud.</strong> Normal noise, normal talking, feeds with eye contact and chat.</li>
<li><strong>Make nights dull.</strong> Dim, quiet, minimal talking, nappy change only if needed. Boring is the whole strategy.</li>
<li><strong>Cap day sleeps.</strong> Wake them after two to two and a half hours in the day so the sleep migrates to the night.</li>
</ul>
<p>It usually starts sorting itself out between six and ten weeks as melatonin production begins. You're not training them so much as giving them the cues to sort it out sooner.</p>
<h2>Meanwhile, survive</h2>
<p>Split the night into shifts with whoever else is there. One person takes until 2am, the other takes after. Four unbroken hours is worth more than eight broken ones, and this is the single most useful thing you can do in the first six weeks.</p>`,
  callout:{title:"Speak to a midwife or doctor if",items:[
    "Your baby is very difficult to wake for feeds",
    "Fewer wet nappies than expected, or weight loss beyond the first week",
    "You feel unable to cope, low, or frightened — this is common, treatable, and worth saying out loud"]},
  panel:{
    eyebrow:"Sleeping • 0–3 months",
    normal:{title:"Usually normal",items:[
      "Newborns have no body clock yet",
      "The womb rocked them by day and stopped at night — that lingers",
      "It starts sorting itself at 6–10 weeks as melatonin kicks in"]},
    warn:{title:"Speak to a midwife or doctor if",items:[
      "Your baby is very hard to wake for feeds",
      "Fewer wet nappies than expected, or weight loss beyond the first week",
      "You feel unable to cope, low or frightened — common, treatable, worth saying out loud"]},
    helped:{title:"What helped us",items:[
      "Morning daylight, curtains open","Loud, chatty days","Dim, dull nights",
      "Cap day sleeps at 2–2.5 hours","Split the night into shifts"]},
    quick:"Newborns have no body clock yet. You build it for them, with light and contrast."
  },
  related:["splitting-nights","sleep-regression"]
},
{
  id:"rolling-sitting-crawling", topic:"development", icon:"blocks", featured:false,
  title:"When will my baby roll, sit and crawl?",
  ages:["4–6 months","7–9 months","10–12 months"], read:3,
  summary:"Ranges are wide and order varies. Some babies skip crawling entirely and are completely fine.",
  body:`
<p>The chart in the app says one thing. Your friend's baby did it two months ago. Your baby is lying there, considering.</p>
<h2>Typical ranges</h2>
<ul>
<li><strong>Rolling front to back:</strong> 3–6 months. Back to front usually follows.</li>
<li><strong>Sitting unsupported:</strong> 5–8 months.</li>
<li><strong>Crawling:</strong> 6–11 months — or never. Bum-shuffling and commando-crawling both count.</li>
<li><strong>Pulling to stand:</strong> 8–11 months.</li>
<li><strong>Walking:</strong> 9–18 months. Eighteen months is still within normal.</li>
</ul>
<p>Skipping crawling is not a red flag on its own. What matters is that a baby is moving somehow, using both sides of their body, and adding new skills over time.</p>
<h2>What actually helps</h2>
<ul>
<li><strong>Floor time.</strong> More than anything else. Babies parked in seats, bouncers and slings don't get to practise.</li>
<li><strong>Tummy time in small doses</strong> — a few minutes, many times a day, on your chest if the floor causes outrage.</li>
<li><strong>Put toys just out of reach.</strong> Motivation is half of motor development.</li>
<li><strong>Skip the walkers.</strong> They don't help walking, and they're a genuine injury risk.</li>
</ul>
<p>If your baby was born prematurely, use their corrected age — from the due date, not the birth date — until at least two years.</p>`,
  callout:{title:"Ask your doctor or health visitor if",items:[
    "No rolling in either direction by 6 months, or not sitting with support by 9 months",
    "Consistently using only one side of the body, or a strongly preferred hand before 12 months",
    "Loss of a skill your baby previously had — always worth checking promptly",
    "Persistently stiff or floppy limbs"]},
  panel:{
    eyebrow:"Development • 4–12 months",
    normal:{title:"Typical ranges",items:[
      "Roll front-to-back: 3–6 months","Sit unsupported: 5–8 months",
      "Crawl: 6–11 months — or never (bum-shuffling counts)",
      "Pull to stand: 8–11 months","Walk: 9–18 months"]},
    warn:{title:"Ask your doctor or health visitor if",items:[
      "No rolling by 6 months, or not sitting with support by 9",
      "Using only one side, or a strong hand preference before 12 months",
      "Loss of a skill they had — check promptly","Persistently stiff or floppy limbs"]},
    helped:{title:"What helped us",items:[
      "Lots of floor time","Tummy time in small, frequent doses",
      "Toys just out of reach","Skip walkers","Use corrected age if premature"]},
    quick:"Ranges are wide and order varies. Some babies skip crawling entirely and are completely fine."
  },
  related:["first-words","sleep-regression"]
},
{
  id:"first-words", topic:"development", icon:"blocks", featured:false,
  title:"Babbling, pointing and first words",
  ages:["7–9 months","10–12 months","12–18 months","18–24 months"], read:3,
  summary:"Understanding comes long before speaking, and gestures matter more than word count.",
  body:`
<p>Word counts are the least useful measure of early language. What professionals actually watch is communication: does your baby try to get your attention, and do they understand you?</p>
<h2>Roughly what to expect</h2>
<ul>
<li><strong>6–9 months:</strong> babbling with consonants — bababa, dadada. Responds to their name.</li>
<li><strong>9–12 months:</strong> pointing, waving, giving you things. This is the big one. Gestures are the foundation of speech.</li>
<li><strong>12 months:</strong> often one or two words used meaningfully. Understands simple requests.</li>
<li><strong>18 months:</strong> commonly 10–50 words, and following simple instructions.</li>
<li><strong>24 months:</strong> putting two words together — "more milk", "daddy gone".</li>
</ul>
<h2>What builds language</h2>
<ul>
<li><strong>Narrate everything.</strong> Boring, out loud, constantly. This is the single strongest driver.</li>
<li><strong>Leave gaps.</strong> Ask, then wait five long seconds. Babies need far more processing time than feels natural.</li>
<li><strong>Follow their attention.</strong> Name what they're already looking at, not what you want them to look at.</li>
<li><strong>Books, daily.</strong> Pointing at pictures beats reading the text.</li>
</ul>
<p>Raising a child with two or more languages does not delay speech. Total words across all languages is what counts — keep each parent consistent in their own language.</p>`,
  callout:{title:"Ask for a hearing check or speech referral if",items:[
    "No babbling by 9 months, or no gestures like pointing or waving by 12 months",
    "No words by 18 months, or no two-word phrases by around 2 years",
    "Loss of words or social skills previously present — check this promptly",
    "Doesn't startle at loud sounds or turn toward voices"]},
  panel:{
    eyebrow:"Development • 7–24 months",
    normal:{title:"Roughly expect",items:[
      "6–9 months: babbling (bababa), responds to name",
      "9–12 months: pointing, waving, giving — the big one",
      "12 months: a word or two, understands simple requests",
      "18 months: 10–50 words","24 months: two-word combos"]},
    warn:{title:"Ask for a hearing or speech check if",items:[
      "No babbling by 9 months, or no gestures by 12",
      "No words by 18 months, or no two-word phrases by ~2 years",
      "Loss of words or social skills — check promptly",
      "Doesn't startle at loud sounds or turn to voices"]},
    helped:{title:"What helped us",items:[
      "Narrate everything, out loud","Ask, then leave a 5-second gap",
      "Follow their attention","Books daily","Two languages don't delay speech"]},
    quick:"Understanding comes long before speaking, and gestures matter more than word count."
  },
  related:["rolling-sitting-crawling","teething"]
},
{
  id:"teething", topic:"health", icon:"cross", featured:false,
  title:"Is teething making my baby miserable?",
  ages:["4–6 months","7–9 months","10–12 months","12–18 months"], read:3,
  summary:"Teething causes drool, gnawing and grumpiness. It does not cause high fever, diarrhoea or rashes elsewhere.",
  body:`
<p>Teething gets blamed for everything between four months and two years, which is convenient but occasionally dangerous — because it means real illness gets waved off as teeth.</p>
<h2>What teething actually looks like</h2>
<ul>
<li>Heavy drooling, and a dribble rash on the chin</li>
<li>Chewing on everything, including your fingers, with intent</li>
<li>Red, swollen gums; sometimes a visible white ridge</li>
<li>Irritability and disrupted sleep for a day or two either side of a tooth</li>
<li>A slightly raised temperature — below 38°C</li>
</ul>
<h2>What it doesn't cause</h2>
<p>A fever of 38°C or more, diarrhoea, vomiting, a rash on the body, or a baby who is genuinely unwell. If those are present, something else is going on and it deserves a proper look.</p>
<h2>What helps</h2>
<ul>
<li>Something cold and firm to chew — a chilled (not frozen) teether, a cold flannel</li>
<li>Firm gum pressure with a clean finger</li>
<li>A barrier cream on the chin for dribble rash</li>
<li>Infant paracetamol or ibuprofen at the correct dose for weight and age, if they're in real pain — check with a pharmacist if unsure</li>
</ul>
<p>Skip amber necklaces: they're a strangulation and choking risk with no evidence behind them. Skip teething gels containing choline salicylate or benzocaine, and any unregulated herbal powders.</p>`,
  callout:{title:"Call your doctor if",items:[
    "Temperature of 38°C or above (any age under 3 months: seek care straight away)",
    "Diarrhoea, vomiting, or a rash on the body",
    "Refusing all feeds, or unusually drowsy and hard to rouse",
    "Pulling at one ear with distress — often an ear infection, not teeth"]},
  panel:{
    eyebrow:"Health • 4–18 months",
    normal:{title:"Usually teething",items:[
      "Heavy drooling, and a dribble rash on the chin","Chewing everything, with intent",
      "Red, swollen gums; sometimes a white ridge","Grumpiness and broken sleep for a day or two",
      "A slightly raised temperature — below 38°C"]},
    warn:{title:"Call your doctor if",items:[
      "38°C or above (any age under 3 months: seek care straight away)",
      "Diarrhoea, vomiting, or a rash on the body","Refusing all feeds, or unusually drowsy and hard to rouse",
      "Pulling at one ear with distress — often an ear infection, not teeth"]},
    helped:{title:"What helped us",items:[
      "Something cold and firm to chew (chilled, not frozen)","Firm gum pressure with a clean finger",
      "Barrier cream on the chin for dribble rash","Correct-dose infant pain relief if they're in real pain — ask a pharmacist",
      "Skip amber necklaces and unregulated gels"]},
    quick:"Teething causes drool, gnawing and grumpiness. It does not cause high fever, diarrhoea or rashes elsewhere."
  },
  related:["first-fever","drinking-less-milk"]
},
{
  id:"first-fever", topic:"health", icon:"cross", featured:false,
  title:"Your baby's first fever",
  ages:["0–1 month","2–3 months","4–6 months","7–9 months","10–12 months","12–18 months","18–24 months"], read:3,
  summary:"The number matters far less than the age of your baby and how they look between temperature spikes.",
  body:`
<p>Fever is the immune system working, not the illness itself. That's true, and it is no comfort at all at midnight with a hot, floppy baby.</p>
<h2>The age rule, first</h2>
<p><strong>Under 3 months, a temperature of 38°C or above needs same-day medical assessment.</strong> Not tomorrow. Young babies show very few signs before becoming seriously unwell, so the threshold for being seen is deliberately low. Under 6 months, get advice for anything at or above 39°C.</p>
<h2>How to take a temperature</h2>
<p>Under the arm with a digital thermometer is reliable enough at home. Forehead strips aren't. Don't add or subtract a correction figure — just report what the thermometer said and how you took it.</p>
<h2>Watch the baby, not the number</h2>
<p>A baby with 39°C who's drinking, alert between spikes and still cross about their nappy is usually less concerning than a baby at 38.2°C who is limp and won't focus on you. Trust that comparison.</p>
<h2>Managing at home</h2>
<ul>
<li>Fluids, offered often and in small amounts. Milk counts.</li>
<li>One light layer. Don't wrap up, don't strip down, don't sponge with cold water.</li>
<li>Infant paracetamol (from 2 months, if over 4kg) or ibuprofen (from 3 months and over 5kg) at the weight-appropriate dose, for discomfort rather than for the number itself. Check the packaging or ask a pharmacist.</li>
</ul>`,
  callout:{title:"Seek urgent medical care if",items:[
    "Under 3 months with a temperature of 38°C or above",
    "A rash that doesn't fade when you press a glass against it",
    "Difficulty breathing, grunting, or drawing in under the ribs",
    "Very drowsy, floppy, hard to wake, or a weak high-pitched cry",
    "A fit or seizure, cold mottled hands and feet, or fewer than four wet nappies in a day",
    "Fever lasting more than 5 days, or your own instinct that something is badly wrong — that instinct is good data"]},
  panel:{
    eyebrow:"Health • 0–24 months",
    normal:{title:"The basics",items:[
      "Fever is the immune system working, not the illness itself",
      "Watch the baby, not the number — how they look between spikes matters most",
      "Take it under the arm with a digital thermometer (forehead strips aren't reliable)",
      "Report what it said and how you took it — don't add a correction"]},
    warn:{title:"Seek urgent medical care if",items:[
      "Under 3 months with a temperature of 38°C or above",
      "A rash that doesn't fade under a pressed glass",
      "Trouble breathing, grunting, or drawing in under the ribs",
      "Very drowsy, floppy, hard to wake, or a weak high-pitched cry",
      "A seizure, cold mottled hands and feet, or fewer than 4 wet nappies a day"]},
    helped:{title:"Managing at home",items:[
      "Fluids often, in small amounts — milk counts","One light layer; don't wrap up or sponge with cold water",
      "Infant paracetamol (from 2 months, over 4kg) or ibuprofen (from 3 months, over 5kg) for discomfort — check the packet"]},
    quick:"The number matters far less than your baby's age and how they look between temperature spikes."
  },
  related:["teething","nappy-rash"]
},
{
  id:"nappy-rash", topic:"health", icon:"cross", featured:false,
  title:"Nappy rash that won't shift",
  ages:["0–1 month","2–3 months","4–6 months","7–9 months","10–12 months","12–18 months"], read:3,
  summary:"Ordinary rash improves in two or three days. If it's spreading, spotty or in the skin creases, it's probably thrush.",
  body:`
<p>Most nappy rash is contact irritation: skin, moisture, and friction. It sits on the raised surfaces and spares the deep creases.</p>
<h2>The basic routine</h2>
<ul>
<li>Change more often than feels necessary, especially after a dirty nappy</li>
<li>Plain water or fragrance-free wipes; pat dry, don't rub</li>
<li>A thick barrier cream — zinc oxide or petroleum-based — as a visible layer, not rubbed in</li>
<li>Nappy-free time on a towel. Air does more than any cream.</li>
</ul>
<h2>When it's thrush instead</h2>
<p>Suspect a yeast infection if the rash is bright red, has a defined edge, sits <em>in</em> the skin folds, or has small satellite spots around the main patch — and if it hasn't budged after three days of good barrier care. It needs an antifungal cream, so it's worth a pharmacist or doctor visit.</p>
<h2>What to avoid</h2>
<p>Talc, fragranced wipes, plastic pants, and steroid creams unless prescribed for this specific rash.</p>`,
  callout:{title:"Get it looked at if",items:[
    "No improvement after 3 days of barrier care, or it's getting worse",
    "Blisters, open sores, pus, or bleeding",
    "Rash spreading beyond the nappy area, or with fever",
    "Your baby seems in significant pain"]},
  panel:{
    eyebrow:"Health • 0–18 months",
    normal:{title:"Usually just irritation",items:[
      "Contact irritation from skin, moisture and friction",
      "Sits on the raised skin, spares the deep creases",
      "Clears in two or three days with good barrier care"]},
    warn:{title:"Get it looked at if",items:[
      "No improvement after 3 days of barrier care, or it's getting worse",
      "Blisters, open sores, pus, or bleeding","Spreading beyond the nappy area, or with a fever",
      "Your baby seems in significant pain"]},
    helped:{title:"What helped us",items:[
      "Change more often, especially after a dirty nappy","Water or fragrance-free wipes; pat dry, don't rub",
      "A thick barrier cream as a visible layer, not rubbed in","Nappy-free time on a towel — air beats any cream",
      "In the creases with satellite spots? Likely thrush — needs an antifungal"]},
    quick:"Ordinary rash improves in two or three days. If it's spreading, spotty or in the skin creases, it's probably thrush."
  },
  related:["first-fever","teething"]
},
{
  id:"touched-out", topic:"sanity", icon:"heart", featured:false,
  title:"When you're completely touched out",
  ages:["0–1 month","2–3 months","4–6 months","7–9 months","10–12 months","12–18 months","18–24 months"], read:3,
  summary:"Wanting your body back for twenty minutes doesn't make you a bad parent. It makes you a mammal.",
  body:`
<p>You've been held, climbed, fed from and slept on for fourteen hours. Someone touches your arm affectionately and you want to leave the country. That reaction has a name, it's extremely common, and it is not a verdict on how much you love anyone.</p>
<h2>What's going on</h2>
<p>Constant physical contact with no gaps is a sensory load, and load without recovery becomes intolerance. It has nothing to do with your feelings for your baby or your partner. It is the nervous system asking for a break in the only language it has.</p>
<h2>What helps, practically</h2>
<ul>
<li><strong>Twenty minutes of no contact, daily, defended.</strong> Not a nap, not chores. A shower, a walk, sitting in the car. Schedule it like a medical appointment.</li>
<li><strong>Hand over completely.</strong> Leave the room. Supervising from the sofa isn't a break.</li>
<li><strong>Say it out loud, early.</strong> "I'm touched out, it's not about you" prevents a partner from reading it as rejection, which is where this quietly damages relationships.</li>
<li><strong>Change the contact, not just the amount.</strong> A carrier with the baby facing out, floor play instead of lap play, sitting side by side rather than being climbed on.</li>
<li><strong>Cut input elsewhere.</strong> Noise, screens, and podcasts all add to the same load. Quiet helps more than distraction.</li>
</ul>
<div class="quiet">You are allowed to love your child enormously and want them off you immediately. Both things, same moment.</div>`,
  callout:{title:"Reach out for support if",items:[
    "The feeling is constant, rather than arriving at the end of long days",
    "You feel persistently low, numb, anxious, or disconnected from your baby",
    "You're having thoughts of harming yourself or your baby — contact your doctor or a crisis line today; this is treatable and you will be taken seriously, not judged"]},
  panel:{
    eyebrow:"Parent Sanity • 0–24 months",
    normal:{title:"What's going on",items:[
      "Constant contact with no gaps is a real sensory load",
      "Load without recovery becomes intolerance — it's your nervous system, not your feelings",
      "Extremely common, and not a verdict on how much you love anyone"]},
    warn:{title:"Reach out for support if",items:[
      "The feeling is constant, not just at the end of long days",
      "You feel persistently low, numb, anxious, or disconnected from your baby",
      "Any thoughts of harming yourself or your baby — contact your doctor or a crisis line today; you'll be taken seriously, not judged"]},
    helped:{title:"What helped us",items:[
      "Twenty minutes of no contact, daily, defended like an appointment",
      "Hand over completely — leave the room","Say it out loud early: \"I'm touched out, it's not about you\"",
      "Change the contact, not just the amount (carrier facing out, side-by-side play)",
      "Cut other input — noise and screens add to the same load"]},
    quick:"Wanting your body back for twenty minutes doesn't make you a bad parent. It makes you a mammal."
  },
  related:["splitting-nights","visitors"]
},
{
  id:"splitting-nights", topic:"sanity", icon:"heart", featured:false,
  title:"Splitting the nights so nobody breaks",
  ages:["0–1 month","2–3 months","4–6 months","7–9 months"], read:3,
  summary:"Both of you half-sleeping is worse than one of you sleeping properly. Shifts beat solidarity.",
  body:`
<p>The instinct is to suffer together. It's romantic and it's a mistake — two people at 40% function badly, where one at 80% can hold a household up.</p>
<h2>The shift system</h2>
<p>Split the night in two. Person A covers from bedtime to roughly 2am. Person B covers 2am until morning. The off-duty person sleeps somewhere else with earplugs, and is genuinely off duty — not a backup, not "just help me with this one".</p>
<p>Four consecutive hours of protected sleep is the target. It's the block that restores function, and it beats seven fragmented hours comfortably.</p>
<h2>If you're breastfeeding</h2>
<p>The other person still does everything except the feed: nappy, settling, resettling, the walking-around bit. One expressed bottle covering the first stretch buys a four-hour block that changes the whole week.</p>
<h2>If you're doing it alone</h2>
<p>Then shifts mean daytime. One protected nap while someone else — a friend, a relative, anyone you can ask — holds the baby for 90 minutes. Ask more directly than feels comfortable. Most people want to help and are waiting for a specific request.</p>
<h2>Rules that stop this collapsing</h2>
<ul>
<li>Swap which shift each person gets, or resentment builds fast.</li>
<li>No scorekeeping conversations after 10pm. Nothing decided at 3am is fair or true.</li>
<li>Review it weekly, out loud, in daylight.</li>
</ul>`,
  callout:null,
  panel:{
    eyebrow:"Parent Sanity • 0–9 months",
    normal:{title:"Why shifts win",items:[
      "Two people at 40% function worse than one at 80%",
      "Four unbroken hours restores you more than seven broken ones",
      "Even breastfeeding: the other person does everything but the feed"]},
    warn:{title:"Rules that stop it collapsing",items:[
      "Swap which shift each person takes, or resentment builds fast",
      "No scorekeeping after 10pm — nothing decided at 3am is fair or true",
      "Review it weekly, out loud, in daylight"]},
    helped:{title:"What helped us",items:[
      "Split the night in two: one covers till ~2am, the other after",
      "Off-duty person sleeps elsewhere with earplugs — genuinely off",
      "One expressed bottle buys the first four-hour block",
      "Alone? Shifts mean daytime — ask someone to hold the baby 90 minutes"]},
    quick:"Both of you half-sleeping is worse than one of you sleeping properly. Shifts beat solidarity."
  },
  related:["touched-out","day-night-confusion"]
},
{
  id:"visitors", topic:"sanity", icon:"heart", featured:false,
  title:"Managing visitors without losing the plot",
  ages:["0–1 month","2–3 months"], read:3,
  summary:"Decide the rules before you're standing in the doorway holding a baby and a wet muslin.",
  body:`
<p>Everyone wants to meet the baby. Almost nobody thinks about what a visit costs the people who haven't slept.</p>
<h2>Agree it in advance</h2>
<p>Between the two of you, before anyone arrives: how long visits run, which days are closed, whether people hold the baby, and who does the saying-no. Written down in a message thread beats remembering at the door.</p>
<h2>Scripts that work</h2>
<ul>
<li>"We'd love to see you — can you do Thursday between 2 and 3?" A window, not an open door.</li>
<li>"We're not doing visitors this week, but we'd love a photo when you get yours."</li>
<li>"She's due a feed, so I'm going to take her." No explanation follows.</li>
<li>"If you're coming, could you bring dinner and put a wash on?" Most people are delighted to have a job.</li>
</ul>
<h2>Non-negotiables you're allowed</h2>
<ul>
<li>Nobody unwell, including "just a cold" — in a newborn that isn't a small thing</li>
<li>Hands washed, no kissing the baby's face or hands</li>
<li>Anyone who wakes a sleeping baby loses baby-holding rights, cheerfully but firmly</li>
</ul>
<div class="quiet">The person who is offended by a boundary in week two has forgotten week two. You won't.</div>`,
  callout:null,
  panel:{
    eyebrow:"Parent Sanity • 0–3 months",
    normal:{title:"Agree it in advance",items:[
      "Decide the rules before anyone's at the door",
      "How long visits run, which days are closed, who holds the baby",
      "Written in a message thread beats remembering in the moment"]},
    warn:{title:"Non-negotiables you're allowed",items:[
      "Nobody unwell — \"just a cold\" isn't a small thing for a newborn",
      "Hands washed; no kissing the baby's face or hands",
      "Wake a sleeping baby and you lose holding rights — cheerfully but firmly"]},
    helped:{title:"Scripts that work",items:[
      "\"We'd love to see you — can you do Thursday 2–3?\" A window, not an open door",
      "\"Not doing visitors this week, but we'd love a photo\"",
      "\"She's due a feed, so I'm taking her\" — no explanation follows",
      "\"If you're coming, could you bring dinner and put a wash on?\""]},
    quick:"Decide the rules before you're standing in the doorway holding a baby and a wet muslin."
  },
  related:["touched-out","splitting-nights"]
},

/* --- Website batch one: the first nights home --------------------------- */

{
  id:"safe-sleep-newborn",
  longform:[{h:"We asked if she could sleep on her side",t:"We did ask. Twice, actually — once as a straight question and once with what we thought was a clever addition: what if one of us is watching her?\n\nThe answer we got back was fair, and it stuck with us. Watching isn't the safeguard it feels like, because sleep is precisely the time nobody is watching. You look at your phone. You doze off yourself. The whole point of the rule is that it has to hold when you're not there.\n\nSo we put her on her back. Every time. It's the one thing in this entire first month we never had a debate about twice."},{h:"The cot stayed flat, even when we badly wanted to tilt it",t:"This was the hard one. When milk came out of her nose one night, and again when she spat up in her sleep, propping the mattress up felt like the obvious kindness. Everything in you says gravity would help.\n\nWe kept reading the same thing from every direction: don't. A small baby on an incline slides down it, and ends up folded into a worse position than the one you were worried about. Wedges and positioners are sold on exactly the instinct we were having, which is what makes them so persuasive at two in the morning.\n\nUnless your own team has written you a specific plan for a specific reason, reflux doesn't change any of this. Ours didn't."},{h:"What our cot actually had in it",t:"Nothing. That still looked wrong to us for about a week — it seemed cold, like we'd forgotten something.\n\nA sleeping bag solved most of that feeling. No blanket to wriggle under, nothing to kick off, and one less thing to think about at three in the morning. Her feet went near the foot of the cot so she couldn't shuffle downwards.\n\nShe was in our room in her own space, which is the usual advice for the first six months and which we'd have done anyway. After a NICU stay you are not in a hurry to put your baby in another room."},{h:"The one that catches people out",t:"Falling asleep on a sofa holding her. It's not a decision anyone makes — it happens at the end of a night feed when you sit down for a second.\n\nWe got into the habit of feeding somewhere we could put her down safely afterwards, rather than somewhere comfortable enough to lose an hour in. Not because we were disciplined. Because we knew exactly how tired we were."}],
  topic:"sleeping",
  icon:"moon",
  featured:true,
  title:"Where does she actually sleep? The rules, plainly",
  ages:["0–1 month","2–3 months","4–6 months"],
  read:3,
  stage:"0–1 month",
  subcategory:"Sleep environment",
  summary:"Flat, on her back, on a firm clear surface. Every single sleep. It's the one thing on this whole site that isn't a judgement call.",
  keywords:["safe sleep","back to sleep","cot setup","newborn sleep safety","incline cot reflux"],
  callout:{title:"Get advice straight away for",items:["Blue, grey or unusually pale colour","Pauses in breathing, or breathing that looks like hard work","Grunting with every breath, nostrils flaring, or the chest pulling in","A baby who is floppy, very hard to wake, or not feeding","Any instinct that something is wrong — you don't need to justify it"]},
  panel:{eyebrow:"Sleeping • Newborn",normal:{title:"Usually it's this simple",items:["On her back, every sleep","Flat — not propped or inclined","Firm mattress, not a sofa or your bed","Nothing else in the cot at all"]},warn:{title:"Call your doctor if",items:["Blue, grey or unusually pale colour","Any pause in breathing","Breathing that looks like hard work — chest pulling in, nostrils flaring","Floppy, very hard to wake, or not feeding","Any instinct that something is wrong"]},helped:{title:"What helped us",items:["A sleeping bag instead of blankets","Feet to the foot of the cot","Her own space in our room","We never tilted the cot, however tempting","Feeding somewhere we could put her down safely"]},dont:{title:"Don't",items:["Don't tilt or prop the cot, for reflux or anything else","No sleep positioners, wedges, bumpers, pillows or loose blankets","Don't put her down to sleep on her side, even if you're watching","Don't fall asleep holding her on a sofa or armchair"]},quick:"Back, flat, firm, clear — every sleep. Reflux doesn't change it, and side sleeping isn't made safe by watching, because sleep is exactly when nobody is watching."},
  originalQuestions:["Is it safe for a newborn to sleep on her side if a parent is actively watching? (24 August 2025)","Whether a light must stay on, and whether she could be put down while making noise (21 August 2025)"],
  sources:["RAW-20250824-68aa5aee-08","RAW-20250821-68a76ce2-27"],
  medical:true,
  related:["newborn-noises-at-night","spit-up-while-asleep","milk-from-the-nose"]
},
{
  id:"newborn-hiccups",
  longform:[{h:"It was just after midnight",t:"Ariadne got hiccups and we started asking questions. What's the best position. Does patting help. Which of those is better. How long before they stop.\n\nWe also managed to ask how long burping takes and then correct ourselves — sorry, I meant hiccups — which tells you roughly what state we were in.\n\nEventually the question came back to us: is anything else going on? And the honest answer, once we actually looked at her, was no. She just hiccups. That was the end of it."},{h:"She wasn't bothered. We were",t:"This is the thing we'd want to hand to anyone standing over a cot at half past midnight. Watch her face rather than the clock.\n\nHiccups look like something happening to a baby. Most of the time they aren't distressing her at all — she's doing it the way she did in the womb, and she has no opinion about it. The distress in the room was entirely ours.\n\nOnce we noticed that, the whole thing deflated."},{h:"You can put her down mid-hiccup",t:"We genuinely didn't know this and had been waiting them out. You don't have to. A comfortable baby goes down flat on her back and hiccups her way into sleep, and it's fine.\n\nThe useful stuff, if you want to do something: hold her upright a while, pause a feed if she seems unsettled by them, one gentle burp if you think she's swallowed air. That's the list. We were cycling through positions like we were tuning a radio, and none of it was doing anything."},{h:"When we'd have asked someone",t:"Not about the hiccups themselves — about what came with them. If she'd been genuinely upset by them rather than indifferent, if they'd been getting in the way of feeding, if there'd been frequent vomiting alongside, or any change in her breathing or colour.\n\nOn their own, at midnight, in a baby who's otherwise happy: they're just hiccups."}],
  topic:"health",
  icon:"cross",
  featured:true,
  title:"Newborn hiccups at midnight",
  ages:["0–1 month","2–3 months"],
  read:2,
  stage:"0–1 month",
  subcategory:"Newborn body",
  summary:"They bother you far more than they bother her. She can be put down to sleep still hiccupping.",
  keywords:["newborn hiccups","baby hiccups","hiccups sleep","how long hiccups baby"],
  callout:{title:"Worth mentioning if",items:["She's genuinely distressed by them rather than indifferent","They come with difficulty feeding, or she keeps stopping mid-feed","Frequent vomiting alongside them","Any change in breathing or colour during an episode","She isn't gaining weight as expected"]},
  panel:{eyebrow:"Health • Newborn",normal:{title:"Usually it's nothing",items:["Very common, several times a day","They did it in the womb too","Stop on their own","Most babies aren't bothered at all"]},warn:{title:"Call your doctor if",items:["She's genuinely distressed","Feeding is affected","Frequent vomiting with them","Breathing or colour changes"]},helped:{title:"What helped us",items:["Hold her upright a while","Pause the feed if she's unsettled","One gentle burp, not six positions","Put her down anyway — she can sleep through them"]},quick:"Common, harmless, and she can go down to sleep still hiccupping. Watch her face, not the clock — if she's unbothered, so are you."},
  originalQuestions:["Asked the best position for hiccups, whether patting helps, how long to keep trying (24 August 2025)",`"No she just hiccups." (24 August 2025)`],
  sources:["RAW-20250824-68aa5aee-01","RAW-20250824-68aa5aee-08"],
  medical:false,
  related:["safe-sleep-newborn","spit-up-while-asleep","newborn-noises-at-night"]
},
{
  id:"blocked-nose-newborn",
  longform:[{h:"How do you even blow a baby's nose",t:"That was the question, more or less word for word. Then: fine, saline drops — and then what?\n\nAnd then, because it was late and it seemed briefly like excellent thinking: what if I just turn her upside down and let gravity do it?\n\nYou can't. Please don't. We're keeping it in because somebody else is going to have the same idea and it deserves to be answered by someone who has already had it."},{h:"Why it matters more than it would in you or me",t:"Her nasal passages are tiny, and a newborn would rather breathe through her nose. So a bit of congestion that wouldn't register in an adult becomes a real problem, because she can't suck and breathe through her mouth at the same time.\n\nWhich gave us the question that actually mattered. Not is she blocked — she often was — but is it stopping her feeding or sleeping. If it wasn't, we left it alone."},{h:"What we ended up doing",t:"Saline drops, a couple per nostril, just before a feed. That was the moment it was worth doing and mostly the only moment.\n\nGentle suction after, if it was genuinely in the way. Emphasis on gentle and on if. We learned quite quickly that going at it repeatedly irritates the lining and swells things up further, so you end up worse off than when you started.\n\nA humidifier at night helped more than we expected, especially with air conditioning running."},{h:"The things we didn't do",t:"No adult decongestant drops. Nothing meant for older children. No tilting the cot, because congestion doesn't change any of the sleep rules.\n\nAnd we stopped squirting saline in just to find out whether she was blocked. It's a treatment, not a test.\n\nWhat we watched for instead was effort. Breathing that looked like work — chest pulling in, nostrils flaring, grunting with each breath — or her not managing to feed. That's a phone call, not a saline drop."}],
  topic:"health",
  icon:"cross",
  featured:true,
  title:"How do you unblock a newborn's nose?",
  ages:["0–1 month","2–3 months","4–6 months"],
  read:3,
  stage:"0–1 month",
  subcategory:"Newborn body",
  summary:"Saline and patience, mostly. And no — you do not turn the baby upside down, however logical that briefly seems at 2am.",
  keywords:["blocked nose baby","newborn congestion","saline drops baby","nasal aspirator","stuffy nose newborn"],
  callout:{title:"Get her seen if",items:["Breathing looks like hard work — chest pulling in, nostrils flaring, grunting","Any pause in breathing, or blue or grey colour","She's not feeding properly because of it","She has a fever, or she's unusually sleepy or hard to rouse","She's under three months and has any fever at all"]},
  panel:{eyebrow:"Health • Newborn",normal:{title:"Usually it's just",items:["Tiny nasal passages block easily","Babies prefer to breathe through the nose","Noisy without being unwell","Worst at feed times"]},warn:{title:"Call your doctor if",items:["Chest pulling in, flaring nostrils, grunting","Pauses, or blue or grey colour","She can't feed properly","Fever, especially under three months"]},helped:{title:"What helped us",items:["Saline drops just before feeds","Gentle suction, not repeated suction","A humidifier at night","Never upside down — we did ask"]},dont:{title:"Don't",items:["Don't turn her upside down to drain it — we did ask","Don't use decongestant drops meant for adults or older children","Don't suction repeatedly — it swells the lining and makes it worse","Don't tilt the cot. Congestion doesn't change safe sleep"]},quick:"Saline before feeds, gentle suction only if it's genuinely in the way, and humidity at night. Don't invert her, don't tilt the cot, don't use adult drops."},
  originalQuestions:[`Asked how to "blow" a baby's nose and what to do after saline drops (20 August 2025)`,"Asked whether gravity could do the job by turning the baby upside down (20 August 2025)"],
  sources:["RAW-20250820-68a61a70-01","RAW-20250820-68a61a70-04"],
  medical:true,
  related:["sleeping-with-mouth-open","fast-breathing-newborn","safe-sleep-newborn"]
},
{
  id:"newborn-noises-at-night",
  longform:[{h:"The first night home",t:"We had spent five weeks visiting a NICU. Then she was home, in a room with us, in the dark, and she would not stop making noise.\n\nWe asked about the little sounds. Whether the kicking and arm-waving was normal. How quickly to change a nappy if you've heard her poo. Whether a light had to stay on. And then, plainly, that she was making a lot of noise and wouldn't settle.\n\nShe was asleep the whole time. It was us who weren't settling."},{h:"Newborn sleep is loud, and nobody warns you",t:"A big chunk of it is an active phase where they grunt, squeak, snuffle, sigh, kick, fling an arm out and pull faces that look like real distress.\n\nIt sounds exactly like a baby about to wake up. It usually isn't. The single most useful thing we changed was waiting — not responding to the first sound. A lot of it resolves itself inside a minute or two, and reaching in mid-cycle is how you turn a noise into an actual waking.\n\nHaving spent weeks next to monitors that beeped for real reasons, learning to sit still through noise took some doing."},{h:"The small answers we needed that night",t:"No, a light doesn't have to stay on. We asked specifically because she'd come from a NICU and we assumed preterm babies might need one. A dim night light is for your benefit, not hers.\n\nPoo gets changed reasonably promptly. A wet nappy can usually wait until the next feed.\n\nAnd you don't need to burp a baby who's settled and asleep. We were waking her up to do it."},{h:"What we were actually listening for",t:"Not volume. Effort.\n\nGrunting with every single breath, rather than now and then. Breathing that looks like hard work. The chest pulling in under the ribs, nostrils flaring wide, any pause, or a change in her colour. Those are different from a baby making a racket while fast asleep, and once you've seen the difference you stop mistaking one for the other.\n\nWhen we weren't sure, we filmed ten seconds on a phone. Far more useful than trying to describe it later, and it stops you second-guessing your own memory at four in the morning."}],
  topic:"sleeping",
  icon:"moon",
  featured:true,
  title:"She makes so much noise — is she even asleep?",
  ages:["0–1 month","2–3 months"],
  read:3,
  stage:"0–1 month",
  subcategory:"First nights",
  summary:"Newborn sleep is astonishingly loud. Grunting, squeaking, kicking and thrashing are usually a baby deeply asleep, not a baby about to wake.",
  keywords:["newborn noisy sleep","grunting baby","baby squeaks at night","first night home","active sleep"],
  callout:{title:"Get advice straight away for",items:["Grunting with every breath, or breathing that looks like hard work","The chest pulling in under the ribs, or nostrils flaring","Any pause in breathing","Blue, grey or unusually pale colour","A baby who is floppy, very hard to rouse, or won't feed"]},
  panel:{eyebrow:"Sleeping • Newborn",normal:{title:"Usually it's active sleep",items:["Grunting, squeaking, snuffling","Kicking and flinging her arms","Faces that look like distress","Sounds exactly like waking, isn't"]},warn:{title:"Call your doctor if",items:["Grunting with every single breath","Chest pulling in, or nostrils flaring","Any pause in breathing","Blue, grey or unusually pale colour","Floppy, very hard to rouse, or won't feed"]},helped:{title:"What helped us",items:["Wait ninety seconds before responding","Dim light — it's for you, not her","Don't burp a settled sleeping baby","Film ten seconds if unsure — better than describing it"]},quick:"Newborn sleep is astonishingly loud and most of it means nothing. Listen for effort rather than volume, and wait before you reach in."},
  originalQuestions:["Asked about little sounds, noisy active sleep, kicking and arm movements (21 August 2025)","Asked how quickly to change a dirty nappy and whether a light must stay on (21 August 2025)","Reported she was making so much noise that she would not settle (21 August 2025)"],
  sources:["RAW-20250821-68a74ea1-07","RAW-20250821-68a76ce2-14","RAW-20250821-68a76ce2-23","RAW-20250821-68a76ce2-25","RAW-20250821-68a76ce2-27"],
  medical:true,
  related:["safe-sleep-newborn","fast-breathing-newborn","nappy-changes-at-night"]
},
{
  id:"milk-from-the-nose",
  longform:[{h:"A bit of milk came out of her nose",t:"She was asleep. It came out of her nose. Our question was six words long and sent immediately.\n\nIt is a genuinely horrible thing to watch. It looks like choking, or drowning, or something having gone badly wrong in a way you can't fix."},{h:"It's mostly plumbing",t:"The mouth and the nasal passages meet at the back of the throat. When milk comes back up it sometimes takes the nasal route instead of the oral one. Small babies do this. It looks far worse than it is.\n\nKnowing that in advance wouldn't have stopped the jolt, but it would have shortened the twenty minutes afterwards where we sat watching her chest go up and down."},{h:"What we'd do again",t:"Pick her up, upright, where we could see her face. Wipe the outside of her nose gently — not poke about, not try to suction it out.\n\nWatch her breathing and her colour for a minute or two until she was clearly fine. Then straight back down, flat, on her back.\n\nThat last part was the hardest. The urge to prop the mattress up after that is enormous, and it's the exact moment people do it. We didn't, and we'd tell anyone else not to either."},{h:"Where it stops being a story you tell later",t:"One episode, with a baby who recovers straight away and carries on as normal, is a story.\n\nMilk coming down her nose at most feeds is worth raising with someone — it can point to reflux, to how she's feeding, or occasionally to something worth looking at properly.\n\nAnd anything with real breathing difficulty, persistent choking, a colour change, or a baby who doesn't recover promptly is not a wait-and-see. We did an infant first aid session before she came home and never needed it, which is the best possible outcome for an evening spent learning something."}],
  topic:"health",
  icon:"cross",
  featured:false,
  title:"Milk came out of her nose while she was asleep",
  ages:["0–1 month","2–3 months","4–6 months"],
  read:2,
  stage:"0–1 month",
  subcategory:"Feeding and spit-up",
  summary:"Alarming to watch, usually harmless. The mouth and nose connect at the back of the throat, so milk occasionally takes the wrong exit.",
  keywords:["milk out of nose baby","nasal regurgitation","baby spit up nose","posseting"],
  callout:{title:"Get help immediately for",items:["Difficulty breathing, or persistent choking or coughing","Blue or grey colour","A baby who doesn't recover promptly, or is floppy or unresponsive","Learn infant choking first aid before you need it — a short course is worth the evening"]},
  panel:{eyebrow:"Health • Newborn",normal:{title:"Usually it's plumbing",items:["Mouth and nose connect at the back of the throat","Milk occasionally takes the wrong route","One episode, quick recovery","Looks far worse than it is"]},warn:{title:"Call for help now if",items:["Breathing difficulty or persistent choking","Blue or grey colour","Doesn't recover promptly","Floppy or unresponsive"]},helped:{title:"What helps",items:["Pick her up, keep her face visible","Wipe outside only, don't suction","Watch breathing and colour for a minute","Back down flat afterwards — don't prop the cot"]},dont:{title:"Don't",items:["Don't try to suction it out of her nose — wipe the outside only","Don't prop the cot afterwards, however strongly you want to","Don't put her back down until you've watched her breathing settle"]},quick:"Milk takes the wrong exit sometimes — it's plumbing. Pick her up, wipe, watch her breathing, then straight back down flat."},
  originalQuestions:["Noticed a little milk coming from her nose while she was asleep (23 August 2025)"],
  sources:["RAW-20250823-68a9590b-01"],
  medical:true,
  related:["spit-up-while-asleep","safe-sleep-newborn","blocked-nose-newborn"]
},
{
  id:"spit-up-while-asleep",
  longform:[{h:"Two hours after a feed",t:"She was asleep and spat up a small amount. Our first thought was that two hours was too long — surely it should have gone somewhere by then.\n\nIt hadn't. Milk sits around for a while, and small spit-ups turning up well after a feed is ordinary."},{h:"We had something to compare it to",t:"This is what made it manageable rather than frightening, and it's the most useful thing we learned that month.\n\nEarlier on she'd had proper projectile vomiting while she was on Alfaré, the hypoallergenic formula. When that stopped, the vomiting stopped with it. So we knew exactly what forceful looked like, and this wasn't that. This was a dribble.\n\nThe word that changes the answer isn't how much. It's force. Milk that shoots out rather than falls out is a different thing, particularly if it keeps happening."},{h:"We watched the weight, not the muslins",t:"She'd gained 90 grams over two days. That number did more to settle us than anything else, because it meant that whatever was landing on the muslin, enough was staying in.\n\nA spit-up always looks like more than it is. Tip a tablespoon of milk onto a cloth some time and see how far it travels — that's usually what you're actually looking at.\n\nA baby who's gaining steadily and behaving normally is almost never a baby with a problem, however much laundry she's generating."},{h:"What would have changed our minds",t:"Green or yellow-green, or anything with blood in it. Forceful vomiting coming back. Her not gaining, or losing. Real distress with feeds, or refusing them. A swollen or firm tummy.\n\nAnd the thing we didn't do, again: prop the cot. It's the obvious response and it isn't the right one."}],
  topic:"feeding",
  icon:"bottle",
  featured:false,
  title:"She spat up two hours after her feed",
  ages:["0–1 month","2–3 months","4–6 months"],
  read:3,
  stage:"0–1 month",
  subcategory:"Feeding and spit-up",
  summary:"Small spit-ups can arrive long after a feed and mean nothing much. The word that changes the answer is forceful.",
  keywords:["spit up baby","posseting","vomit newborn","reflux baby","clear saliva baby"],
  callout:{title:"Get her checked for",items:["Forceful or projectile vomiting, especially if it's repeated","Green, yellow-green, or bloody vomit","Not gaining weight, or losing it","Real distress with feeds, or refusing to feed","A swollen or firm tummy, or unusual sleepiness"]},
  panel:{eyebrow:"Feeding • Newborn",normal:{title:"Usually it's fine",items:["Small amounts, dribbled not launched","Even a couple of hours after a feed","Milky or curdled","A little clear saliva on its own","A baby who isn't bothered by it"]},warn:{title:"Call your doctor if",items:["Forceful or projectile, repeatedly","Green, yellow-green or bloody","Not gaining weight","Distress with feeds, or refusing","Swollen tummy, or unusually sleepy"]},helped:{title:"What helped us",items:["Watching the weight trend, not the muslins","A tablespoon of milk spreads a long way","Comparing it to what forceful actually looked like","Not propping the cot, however tempting"]},dont:{title:"Don't",items:["Don't incline the cot or use a wedge — she slides into a worse position","Don't switch formula or cut foods on your own to fix it","Don't judge it by the muslins — judge it by the weight trend"]},quick:"Small and dribbled is laundry. Forceful, green, bloody, or a baby who isn't gaining — that's the version that gets checked."},
  originalQuestions:["Reported she spat up a small amount while asleep about two hours after a feed, and a 90g weight gain over two days (24 August 2025)","Saw her spit a little saliva, and clarified it was transparent (17 August 2025)"],
  sources:["RAW-20250824-68ab97d7-10","RAW-20250824-68ab97d7-13","RAW-20250817-68a1a61a-01","RAW-20250817-68a1a61a-02"],
  medical:true,
  related:["milk-from-the-nose","safe-sleep-newborn","feeding-on-demand"]
},
{
  id:"fast-breathing-newborn",
  longform:[{h:"Why does she sometimes breathe so fast",t:"Nobody had warned us that newborn breathing looks wrong. It speeds up, slows down, occasionally pauses for a few seconds, then picks up again as if nothing happened.\n\nWatching it for the first time, in the dark, having just brought home a baby born at 33 weeks, is not a relaxing experience."},{h:"How to actually count it",t:"We were counting while she was crying, or feeding, or wriggling — which measures crying, feeding and wriggling.\n\nDo it when she's calm, ideally asleep. And count a full minute rather than fifteen seconds times four, because the rate genuinely isn't steady enough for that to work.\n\nNewborns breathe considerably faster than adults, and a resting rate around forty a minute is unremarkable. Babies born early can have more irregular patterns still, with short pauses that even out."},{h:"Effort matters more than speed",t:"This was the shift that made us calmer, because it's what someone examining her is actually looking at.\n\nIs the chest pulling in under the ribs or at the base of the throat with each breath? Are the nostrils flaring wide? Is she grunting on every single breath out, rather than occasionally? What colour is she, especially around the lips? And is she still feeding — because a baby working hard to breathe stops managing that first.\n\nFast but easy, in a pink, feeding, settled baby, is a very different picture from slower but visibly laboured."},{h:"Film it",t:"Twenty seconds on a phone answers questions that five minutes of description can't, and it means you aren't relying on your own memory of something that frightened you.\n\nThe things that don't wait: blue or grey colour, especially around the lips. A pause that comes with a colour change or with her going floppy. Real effort with every breath. A baby who's stopped feeding or is hard to rouse."}],
  topic:"health",
  icon:"cross",
  featured:false,
  title:"She's breathing really fast — then she isn't",
  ages:["0–1 month","2–3 months"],
  read:3,
  stage:"0–1 month",
  subcategory:"Newborn body",
  summary:"Newborn breathing is genuinely irregular — bursts of fast, then slower, sometimes short pauses. What matters is effort, not speed.",
  keywords:["newborn fast breathing","baby breathing pattern","periodic breathing","rapid breathing baby"],
  callout:{title:"Emergency help for",items:["Blue or grey colour, especially around the lips","A pause in breathing with colour change or floppiness","Chest pulling in hard, nostrils flaring, grunting on every breath","Persistent fast breathing at rest, in a calm baby","A baby who has stopped feeding, or is very hard to rouse"]},
  panel:{eyebrow:"Health • Newborn",normal:{title:"Usually it's normal variation",items:["Faster than adults by a long way","Irregular — bursts, then slower","Short pauses of a few seconds","Common in babies born early"]},warn:{title:"Call for help now if",items:["Blue or grey, especially the lips","A pause with colour change or floppiness","Chest pulling in, flaring, grunting every breath","Fast at rest in a calm baby","Stopped feeding"]},helped:{title:"What helps",items:["Only count when she's calm","Count a full minute, not fifteen seconds","Look at effort, not just speed","Film twenty seconds if unsure"]},dont:{title:"Don't",items:["Don't count while she's crying, feeding or wriggling","Don't count fifteen seconds and multiply — the rate isn't steady","Don't rely on the number alone. Effort matters more than speed"]},quick:"Count for a full minute while she's calm, and judge effort over speed. Chest pulling in, flaring nostrils and grunting matter far more than the number."},
  originalQuestions:["Noticed intermittent quick breathing (24 August 2025)"],
  sources:["RAW-20250824-68ab97d7-01"],
  medical:true,
  related:["newborn-noises-at-night","blocked-nose-newborn","sleeping-with-mouth-open"]
},
{
  id:"newborn-trembles-and-jerks",
  longform:[{h:"Six words, sent immediately",t:"If baby body shakes a bit it's ok. No punctuation, no detail, no context. That's what it looks like when you've just watched something and your brain has stopped working.\n\nIt was sitting in a conversation that also contained a water filter problem and how long milk takes to cool in a Kikka Boo warmer, which is a fair picture of that month."},{h:"Shakes covers several different things",t:"The startle reflex, where her arms fling out and then back in, often at a noise or when you put her down. Dramatic, completely normal, and it fades over the first months.\n\nJitteriness — a fine trembling of the chin or the hands, usually when she's crying, cold, or being undressed.\n\nAnd little jerks of an arm or leg during active sleep, which happen constantly.\n\nThey look similar and they aren't the same, and the difference is learnable in about a minute."},{h:"The thing that tells them apart",t:"Hold the limb that's shaking, gently. Ordinary jitteriness stops when you hold it. Movement that carries on regardless is the kind to report.\n\nThe other question is whether she's there with you. A jittery baby is awake and responsive, and settles when she's comforted, fed or warmed up. Movement that comes with a blank, unresponsive stare is a different report entirely."},{h:"What we'd note if it happened again",t:"Which part of her, and whether it was one side or both. How long. Rhythmic and repetitive, or irregular. What she was doing — awake, asleep, feeding, cold, being moved. Her breathing and her colour during it. Her eyes. And whether touching her stopped it.\n\nAnd film it, if you possibly can. A ten-second video means a doctor is looking at what actually happened rather than at your description of it at two in the morning."}],
  topic:"health",
  icon:"cross",
  featured:false,
  title:"Her body shook for a second — is that okay?",
  ages:["0–1 month","2–3 months"],
  read:3,
  stage:"0–1 month",
  subcategory:"Newborn body",
  summary:"Newborns startle, jitter and twitch constantly. The useful distinction is whether it stops when you hold the limb — and whether she's aware.",
  keywords:["newborn shaking","baby jitters","startle reflex","baby twitching sleep","tremor newborn"],
  callout:{title:"Get urgent help for",items:["Rhythmic, repetitive movement that carries on when you hold the limb","A blank stare, or reduced responsiveness during it","Any change in breathing or colour","Eyes rolling, fixed staring, or flickering","Stiffening of the whole body, or a baby who seems unwell afterwards"]},
  panel:{eyebrow:"Health • Newborn",normal:{title:"Usually it's a startle",items:["The startle reflex — arms out, then in","Jittery chin or hands when crying or cold","Little twitches during active sleep","She's awake, aware and settles"]},warn:{title:"Call for help now if",items:["Rhythmic movement that doesn't stop when held","Blank stare, less responsive","Breathing or colour change","Eyes rolling or flickering","Whole body stiffening"]},helped:{title:"What helps",items:["Hold the limb — jitters stop, seizures don't","Is she aware and responsive?","Does comforting or feeding settle it?","Film ten seconds — it's worth more than words"]},quick:"Hold the limb. If it stops, it's jitteriness. If it carries on, or she's not responsive with it, that's the version needing urgent assessment."},
  originalQuestions:[`"If baby body shakes a bit it's ok" (24 August 2025)`],
  sources:["RAW-20250824-68aaa2d9-09"],
  medical:true,
  related:["newborn-noises-at-night","fast-breathing-newborn","safe-sleep-newborn"]
},
{
  id:"sleeping-with-mouth-open",
  longform:[{h:"She sleeps with her mouth open",t:"We asked this twice, on different nights, in slightly different words. The worry underneath was the same both times: does that mean her nose is blocked?\n\nSometimes. Often it's just a deeply asleep baby with a slack jaw and nothing else going on."},{h:"We stopped looking at the mouth",t:"On its own it doesn't tell you much. What tells you something is everything around it.\n\nIs her breathing easy, or does it look like work? Any snuffling, snorting or whistling from her nose? Nostrils flaring, chest pulling in? What's her colour?\n\nAnd the one that turned out to be our best sensor: is she still feeding normally. A baby who genuinely can't breathe through her nose struggles to feed, because she can't do both at once. A congested baby who's feeding fine is a congested baby you can leave alone."},{h:"The thing we nearly did",t:"We were about to squirt saline up her nose to see whether it came out the other side. Using it as a diagnostic rather than a treatment.\n\nDon't. Saline and suction are for when there's congestion actually getting in her way, not for satisfying a curiosity at midnight. We'd have irritated her nose to answer a question we could have answered by watching her feed."},{h:"When we'd mention it",t:"If it were happening every night rather than now and then. If her breathing stayed noisy or snorting. If feeding started getting harder. Loud snoring, or any pause in her breathing.\n\nAnd any of the effort signs — flaring, chest pulling in, grunting — which stop being an open-mouth question and become a different one."}],
  topic:"sleeping",
  icon:"moon",
  featured:false,
  title:"She sleeps with her mouth open",
  ages:["0–1 month","2–3 months","4–6 months"],
  read:2,
  stage:"0–1 month",
  subcategory:"First nights",
  summary:"On its own, an observation rather than a problem. It's worth a look at the rest of her breathing before you decide it means anything.",
  keywords:["baby sleeps mouth open","mouth breathing baby","blocked nose sleep","newborn breathing sleep"],
  callout:{title:"Mention it if",items:["It's happening every night rather than occasionally","Persistent noisy or snorting breathing","Feeding is becoming harder","Loud snoring, or any pause in breathing","Any sign of increased effort — flaring, chest pulling in, grunting"]},
  panel:{eyebrow:"Sleeping • Newborn",normal:{title:"Usually it's just a slack jaw",items:["A deeply asleep baby with a slack jaw","Mild congestion she's coping with","Occasional rather than constant","Feeding still going fine"]},warn:{title:"Call your doctor if",items:["Every night rather than sometimes","Persistent noisy breathing","Feeding getting harder","Snoring or pauses","Flaring, chest pulling in, grunting"]},helped:{title:"What helped us",items:["Is her breathing easy or effortful?","Is she still feeding well?","Saline only if she's actually blocked","Don't use saline as a test"]},dont:{title:"Don't",items:["Don't squirt saline in to test whether she's blocked","Don't prop her up or tilt the cot to help her breathe","Don't act on the open mouth alone — look at the whole breathing pattern"]},quick:"On its own it's an observation. Check her breathing effort and whether she's still feeding well — feeding is the best sensor you've got."},
  originalQuestions:["Noticed she slept with her mouth open and asked how to tell whether her nose was blocked (24 August 2025)"],
  sources:["RAW-20250824-68aaeaaa-01","RAW-20250824-68aaeaaa-02","RAW-20250825-68abf33f-01"],
  medical:true,
  related:["blocked-nose-newborn","fast-breathing-newborn","newborn-noises-at-night"]
},
{
  id:"nappy-changes-at-night",
  longform:[{h:"She's weed, but she's asleep",t:"That was the three-in-the-morning version of the question. We'd already asked the daytime version — how often do you change a nappy if it's clean — and got a sensible answer we then had to test against an actual sleeping baby.\n\nThere's a second version of this we asked too: she'd pooed but she'd just eaten and was asleep. What's the longest she can sit in it? And then, honestly: I'm not sure she pooed at all."},{h:"What we settled into",t:"Poo gets changed reasonably promptly. That's the one that irritates skin and it's worth the disruption.\n\nA wet nappy can usually wait until the next feed, if she's comfortable and her skin is fine. Nappies are extremely absorbent now, and waking a sleeping newborn for a slightly damp one costs you both more than it gains.\n\nAnd a genuinely clean, dry nappy doesn't need changing to a schedule at all. We'd assumed there was a clock rule. There isn't."},{h:"Except when there isn't a choice",t:"Any sign of soreness or nappy rash, and wet gets changed promptly too. Same if it's leaking, or so full it's swollen, or she's clearly uncomfortable.\n\nShe was born early, and we'd been given routines in the NICU that didn't always match what we read afterwards. Where those two disagreed, we went with what her team had told us."},{h:"They're also your intake monitor",t:"This was the part we nearly missed. In the early weeks the wet nappies are how you know she's getting enough milk, so it's worth noticing them rather than changing on autopilot.\n\nWe were counting hers anyway because we were counting everything. But it's the one number that costs you nothing to collect and tells a midwife something real."}],
  topic:"sleeping",
  icon:"moon",
  featured:false,
  title:"She's wet but asleep — do I wake her?",
  ages:["0–1 month","2–3 months","4–6 months"],
  read:2,
  stage:"0–1 month",
  subcategory:"First nights",
  summary:"Poo gets changed promptly. A wet nappy can usually wait until she's up anyway. Modern nappies are better at this than your anxiety suggests.",
  keywords:["night nappy change","wake baby to change nappy","wet nappy sleeping","how often change nappy"],
  callout:{title:"Worth a call if",items:["A noticeable drop in wet nappies — fewer than expected in 24 hours","Dark, strong-smelling urine","Nappy rash that's raw, blistered, or not settling with cream","Blood or mucus in her poo","No poo at all alongside a swollen tummy or vomiting"]},
  panel:{eyebrow:"Sleeping • Newborn",normal:{title:"Usually it can wait",items:["Poo — change promptly","Wet — can wait for the next feed","Clean and dry — no clock rule at all","Modern nappies hold a lot"]},warn:{title:"Call your doctor if",items:["Fewer wet nappies than you'd expect in 24 hours","Dark, strong-smelling urine","Nappy rash that's raw, blistered, or not settling","Blood or mucus in her poo","No poo at all with a swollen tummy or vomiting"]},helped:{title:"What helped us",items:["We let the wet ones wait until the next feed","Poo changed straight away","Changed before the feed, so she fell asleep after","Dim light, no chat, everything in reach","Counted the wet ones — they're your intake monitor"]},dont:{title:"Don't",items:["Don't wake a sleeping newborn for a slightly damp nappy","Don't leave poo until the next feed — that one gets changed","Don't change on autopilot without noticing how many wet ones there are"]},quick:"Poo promptly, wet can wait. Don't wake a sleeping newborn for a damp nappy — but do keep an eye on how many wet ones she's producing."},
  originalQuestions:["Asked how often to change a nappy if it was clean (24 August 2025)","Clarified she had urinated but was asleep — could the change wait? (24–25 August 2025)"],
  sources:["RAW-20250824-68aaa2d9-10","RAW-20250824-68ab8989-02","RAW-20250825-68acd842-02","RAW-20250825-68acd842-04"],
  medical:true,
  related:["newborn-noises-at-night","safe-sleep-newborn","feeding-on-demand"]
},
{
  id:"feeding-on-demand",
  longform:[{h:"Is on demand right at the beginning",t:"We asked it plainly, and then immediately stress-tested it: what if she wants it more often than every two hours?\n\nThat second question is the one everybody actually has. On demand sounds relaxed until you're living it, and then it sounds like a baby who has never once been satisfied."},{h:"What it actually means",t:"Watching her instead of the clock. The early cues are subtle — rooting, turning her head, hands going to her mouth, stirring and fussing. Crying is a late cue, and a baby who has got to crying is much harder to feed than one you caught earlier.\n\nNewborns feed a lot, and not on any tidy schedule. Bunches of feeds close together, often in the evening, are ordinary and aren't a sign that anything has gone wrong with your milk or your baby.\n\nWanting to feed again ninety minutes later doesn't mean the last one failed. Small stomach, fast digestion, and sometimes she just wants to be near you, which is allowed to be a reason."},{h:"The exception that was ours",t:"On demand assumes a baby who wakes when she's hungry and feeds effectively. Ariadne was born at 33 weeks and came home on a plan, and a sleepy preterm baby who doesn't demand can quietly not get enough.\n\nSo for us the plan won. Minimum frequencies, measured amounts, and waking her when she wasn't asking.\n\nWe're saying this loudly because feed on demand gets handed out as universal advice and it isn't. If you've been given a schedule for a reason, that reason still applies at four in the morning when she's sleeping peacefully through a feed."},{h:"What we watched instead of the clock",t:"Wet nappies daily. Weight over weeks rather than days. Whether she seemed settled after feeds at least some of the time. And whether the feeds were effective rather than just frequent.\n\nWhen any of that slipped, we said so rather than working around it."}],
  topic:"feeding",
  icon:"bottle",
  featured:true,
  title:"Feeding on demand — but she wants it again already",
  ages:["0–1 month","2–3 months"],
  read:3,
  stage:"0–1 month",
  subcategory:"Newborn feeding",
  summary:"Responsive feeding means following her cues, not the clock. But if you've been given a schedule for a reason, that schedule wins.",
  keywords:["feeding on demand","responsive feeding","newborn feeding frequency","cluster feeding","every two hours"],
  callout:{title:"Speak to your midwife or team if",items:["She's too sleepy to wake for feeds, or feeds very briefly and drops off","A drop in wet nappies","She isn't back to birth weight by around two weeks, or isn't gaining","Feeding is painful, or she can't stay latched","You've been given a feeding plan and can't keep to it — say so rather than adjusting it alone"]},
  panel:{eyebrow:"Feeding • Newborn",normal:{title:"Usually it's just how newborns feed",items:["Eight to twelve feeds in 24 hours","Not evenly spaced at all","Cluster feeding, often in the evening","Wanting more after ninety minutes"]},warn:{title:"Call your midwife if",items:["Too sleepy to wake for feeds","Fewer wet nappies","Not back to birth weight by two weeks","Feeding is painful","You can't keep to a plan you've been given"]},helped:{title:"What helped us",items:["Early cues, not crying — crying is late","Wet nappies, daily","Weight over weeks, not days","If there's a plan, the plan wins"]},quick:"Follow her cues, not the clock — but if she was born early or you've been given a schedule, that schedule beats on-demand every time."},
  originalQuestions:["Asked whether a baby should be fed on demand at the beginning (1 August 2025)","Asked what happens if the baby wants to feed more often than every two hours (1 August 2025)"],
  sources:["RAW-20250801-688c98c5-01","RAW-20250801-688c98c5-02"],
  medical:true,
  related:["timing-feeds-start-or-finish","newborn-weight-loss","spit-up-while-asleep"]
},
{
  id:"timing-feeds-start-or-finish",
  longform:[{h:"The smallest question we asked",t:"When you're calculating feeding time, do you count from when she finishes or when she starts?\n\nOne line. No follow-up. And it reorganised more of our week than most of the big questions did."},{h:"From the start",t:"Feeding intervals are counted start to start. A feed that begins at midday, on a three-hour plan, means the next one begins at three. Not half past three because she took thirty minutes.\n\nWe had been counting from the end, and every feed was landing a little later than the one before. Over a day that's an hour or more of drift, and we'd been quietly wondering why the schedule kept sliding away from us and whether something was wrong with her.\n\nIt was us."},{h:"Why it's worth getting right",t:"It changes the number of feeds in twenty-four hours, which is the figure that actually matters. It keeps the night feeds roughly where you planned them. And it makes your notes mean something when someone asks how often she's feeding — which, with a baby home from NICU, people ask a lot."},{h:"What we didn't do",t:"We didn't fix problems by moving the timings.\n\nWhen feeds were taking unusually long, or she wasn't finishing what she was meant to, or she was hard to wake — those went to her team rather than into a quietly adjusted schedule. It was tempting. A schedule is the one thing in those weeks that feels like it's under your control.\n\nAnd if there's a written plan, that plan beats any general rule, including this one."}],
  topic:"feeding",
  icon:"bottle",
  featured:false,
  title:"Every three hours — from when she starts, or finishes?",
  ages:["0–1 month","2–3 months"],
  read:2,
  stage:"0–1 month",
  subcategory:"Newborn feeding",
  summary:"From the start. It's a tiny rule that quietly reorganises your entire day and night, and nobody tells you.",
  keywords:["feed timing","every three hours","feed interval","when does next feed start"],
  callout:{title:"Tell your team rather than adjusting the clock if",items:["Feeds are taking much longer than expected","She isn't finishing the volumes she's meant to","She's very hard to wake for feeds","She's vomiting, or refusing feeds","You're consistently unable to keep to the interval"]},
  panel:{eyebrow:"Feeding • Newborn",normal:{title:"Usually it's start to start",items:["Counted start to start","12:00 feed, next starts 15:00","Not from when she finishes","Your own written plan overrides this"]},warn:{title:"Call your team if",items:["Feeds taking much longer","Not finishing volumes","Very hard to wake","Vomiting or refusing"]},helped:{title:"What helped us",items:["Start to start stopped our whole day drifting","We'd been counting from the end, and slipping an hour","Made our feed records actually mean something","We asked rather than adjusting the plan ourselves"]},dont:{title:"Don't",items:["Don't count from the end of the feed — your whole day will drift later","Don't fix a feeding problem by quietly shifting the timings","Don't override a written plan from your team with a general rule"]},quick:"Start to start. A feed at 12:00 on a three-hour plan means the next begins at 15:00 — otherwise your whole day quietly slides later."},
  originalQuestions:["Asked whether the three-hour interval begins when she starts drinking or when she finishes (22 August 2025)"],
  sources:["RAW-20250822-68a8b9cf-01"],
  medical:false,
  related:["feeding-on-demand","nappy-changes-at-night","newborn-weight-loss"]
},
{
  id:"newborn-weight-loss",
  longform:[{h:"Why does she weigh less than she did",t:"We asked this properly — why does it happen, and how much is too much — because it's one of the first numbers you're handed and it goes in the wrong direction.\n\nOurs was asked from a NICU, in a stretch that also involved her resting temperature reading 32.3 and us learning what an incubator actually does. Weight was the one number we felt we could follow."},{h:"Most of it is fluid",t:"Babies are born with extra fluid on board and shed some of it in the first days. Milk supply is still arriving at the same time, so intake takes a few days to catch up.\n\nSome early loss is expected. It isn't a failure of anything, and it isn't a verdict on how feeding is going. Knowing that doesn't make being handed a smaller number on day three feel any better — everything in you wants that line to go up — but it does stop you reading it as a result."},{h:"The shape matters more than the number",t:"Loss over the first few days, a low point, then it turns around. Back to birth weight somewhere around two weeks. Then steady gain along her own line.\n\nThe turning point is the bit to watch. Any single weighing is noisy — different scales, different clothes, a full nappy weighs something. We were weighing her every second day and learning to ignore the wobbles between the trend."},{h:"We stopped using the internet's percentage",t:"There's a specific figure quoted everywhere for how much loss is too much, and for us it was simply the wrong yardstick.\n\nAriadne was born at 33 weeks weighing 1900 grams. Her team had their own chart and their own expectations, and a general threshold written for term babies didn't describe her at all. We spent a while trying to place her on percentile lines we didn't have before we gave up and asked the people who did.\n\nIf your baby is under any kind of specialist care, ask them what they're expecting and what number would worry them. Then you know what you're watching for instead of comparing her to a stranger's baby."}],
  topic:"feeding",
  icon:"bottle",
  featured:false,
  title:"She's lost weight since birth",
  ages:["0–1 month"],
  read:3,
  stage:"0–1 month",
  subcategory:"Newborn feeding",
  summary:"Expected in the first days, and mostly fluid rather than substance. What matters is when it turns around, not the number itself.",
  keywords:["newborn weight loss","birth weight","back to birth weight","baby not gaining"],
  callout:{title:"Speak to your midwife or team if",items:["She hasn't started gaining by around day five","She's not back to birth weight by around two weeks","Fewer wet nappies than expected","She's very sleepy, hard to wake, or feeding poorly","She looks yellow — jaundice with poor feeding needs checking promptly"]},
  panel:{eyebrow:"Feeding • Newborn",normal:{title:"Usually it's expected",items:["Some loss over the first few days","Mostly fluid, not substance","A low point, then it turns around","Back to birth weight around two weeks"]},warn:{title:"Call your midwife if",items:["No gain by around day five","Not back to birth weight by two weeks","Fewer wet nappies","Very sleepy or feeding poorly","Looking yellow"]},helped:{title:"What helped us",items:["The turning point, not the number","Wet nappies daily","Poo changing through the first week","Her team's chart, not a general percentage"]},dont:{title:"Don't",items:["Don't measure her against a percentage you found online","Don't read anything into a single weighing — scales and nappies vary","Don't wait and see if she isn't gaining by around day five"]},quick:"Early loss is expected and mostly fluid. Watch for the turn-around by about day five and birth weight by two weeks — and get your target from your own team."},
  originalQuestions:["Asked why newborns lose weight and how much loss is too much (20 July 2025)"],
  sources:["RAW-20250720-687cdea6-01"],
  medical:true,
  related:["feeding-on-demand","timing-feeds-start-or-finish","nappy-changes-at-night"]
},
{
  id:"newborns-and-blinking",
  longform:[{h:"Do babies blink less",t:"Three words, sent in the middle of an ordinary afternoon. Once you notice the staring you can't stop noticing it — she'd fix on a face for what felt like minutes without a single blink.\n\nThey do blink far less than adults. Nobody's entirely sure why. The suggestions include that their eyes are less exposed, that they're taking in less visual information, and that tear production is still getting going."},{h:"Don't count them",t:"We tried. A blink rate isn't a useful measurement — it changes with how awake she is, the light, whether she's concentrating, whether her eyes are comfortable.\n\nAll counting does is give you a number to be anxious about, which we can report from experience."},{h:"What's worth looking at instead",t:"The eye itself, rather than the rate. Redness, or discharge that keeps coming back. An eye that looks cloudy, or a pupil that doesn't look properly dark. Eyes that don't move together, or one that seems stuck. An eye that won't close fully. Any sign she's uncomfortable — rubbing, squeezing shut, distress in bright light.\n\nA bit of sticky eye in the early weeks is very common and usually a blocked tear duct rather than an infection, but that's a call for someone who can look at it, not for you at home."},{h:"Her eyes did get checked",t:"A paediatrician shone a light into each eye to see whether she reacted, and she closed each one as it was done. It's a small thing and it isn't a full eye test, but standing there watching her respond was one of the better moments of that week.\n\nAsk when a proper check is due, particularly if she was born early. And in the meantime, enjoy the stare. She's working out what a face is."}],
  topic:"development",
  icon:"blocks",
  featured:false,
  title:"Do newborns blink less than we do?",
  ages:["0–1 month","2–3 months"],
  read:2,
  stage:"0–1 month",
  subcategory:"Newborn senses",
  summary:"Yes, considerably. That unnerving unbroken stare is a real thing and it's completely ordinary.",
  keywords:["newborn blinking","baby staring","does baby blink","newborn eyes"],
  callout:{title:"Get her eyes checked if",items:["Redness, or discharge that keeps returning","An eye that looks cloudy, or a pupil that doesn't look dark","Eyes not moving together, or one that seems fixed","An eye that won't close fully","Staring with reduced responsiveness — that's urgent, not an eye question"]},
  panel:{eyebrow:"Development • Newborn",normal:{title:"Usually it's normal",items:["Newborns blink far less than adults","The long unbroken stare is normal","Rate changes with light and alertness","A little sticky eye is common"]},warn:{title:"Call your doctor if",items:["Redness, or discharge that keeps returning","An eye that looks cloudy, or a pupil that isn't dark","Eyes not moving together, or one that seems fixed","An eye that won't close fully","Staring with reduced responsiveness — that's urgent"]},helped:{title:"What helped us",items:["Don't count blinks — it means nothing","Look at the eye, not the rate","Sticky eye: get it seen, don't self-diagnose","Enjoy the stare. She's learning your face"]},quick:"They genuinely blink far less, and the stare is normal. Look at how the eye itself appears rather than counting anything."},
  originalQuestions:["Asked whether babies genuinely blink less, having noticed long stretches of staring (23 August 2025)"],
  sources:["RAW-20250823-68aa0a45-01"],
  medical:false,
  related:["is-that-a-real-smile","newborn-noises-at-night","sleeping-with-mouth-open"]
},
{
  id:"is-that-a-real-smile",
  longform:[{h:"She smiled several times in the incubator",t:"That's how the question was actually asked. Does she know what she's doing when she's smiling, because she did it several times in the incubator today.\n\nIt was in the middle of a much longer conversation about her weight, about when they'd introduce breast milk, and about everything we needed to know before she came home. And in among all of that, the smile is the thing we stopped to ask about."},{h:"The scientific answer",t:"Early smiles are usually spontaneous rather than social. In the first weeks they tend to happen during sleep, or as movements that aren't yet aimed at anybody.\n\nThe deliberate one — the whole-face, directed-at-you smile you can get her to do again — usually turns up somewhere around six to eight weeks. It's unmistakable when it happens."},{h:"Count from her due date, not her birthday",t:"This is the part that saves a lot of unnecessary worry and nobody explains it well.\n\nAriadne was born on 18 July at 33 weeks. Her due date was 4 September. For milestones like this you count from the second date, not the first — so a baby born seven weeks early might social-smile at thirteen weeks old and be exactly on time.\n\nWe asked whether that gap closes or stays. For the first couple of years it broadly stays, and then it stops mattering. Knowing that in advance would have spared us a few evenings."},{h:"Why the reflex ones counted anyway",t:"Here's what we'd say to anybody arguing with themselves about whether it was real.\n\nYou smiled back. You talked to her. Your voice went up. You leaned in closer to a plastic box to get a better look.\n\nShe may not have meant it. The thing it started was real, and it was happening weeks before she could do anything about it on purpose. That's not sentiment — it's how the whole business gets going."}],
  topic:"development",
  icon:"blocks",
  featured:false,
  title:"Was that a real smile, or just wind?",
  ages:["0–1 month","2–3 months"],
  read:2,
  stage:"0–1 month",
  subcategory:"Newborn senses",
  summary:"Early smiles are usually spontaneous rather than social. Which does not make them count for nothing — and you're allowed to take it personally.",
  keywords:["newborn smile","first smile","social smile","reflex smile baby","when do babies smile"],
  callout:{title:"Worth raising if",items:["No social smiling by around three months, corrected for prematurity","She doesn't seem to make eye contact, or follow your face","She doesn't respond to your voice","Any loss of a skill she previously had","Anything that's been niggling at you — bring it to the next check rather than sitting on it"]},
  panel:{eyebrow:"Development • Newborn",normal:{title:"Usually it's a reflex, early on",items:["Early smiles are spontaneous, often in sleep","Social smile around six to eight weeks","Aimed at you, and repeatable","Count from the due date if she was early"]},warn:{title:"Call your doctor if",items:["No social smile by around three months, corrected","No eye contact, or not following your face","No response to your voice","Any skill she previously had and has lost"]},helped:{title:"What helped us",items:["Smiling back matters even if she didn't mean it","The loop starts before she can do it on purpose","Corrected age causes needless worry — use it","You're allowed to take it personally"]},dont:{title:"Don't",items:["Don't count from her birthday if she was born early — use her due date","Don't compare her to another baby of the same age in weeks","Don't dismiss a niggle because she's 'probably just early' — say it at the next check"]},quick:"Early ones are usually reflex; the real social smile lands around six to eight weeks, or later if she was early. Smile back anyway — it counts."},
  originalQuestions:["Had seen her smile several times in the incubator and asked whether she was doing it deliberately (16 August 2025)"],
  sources:["RAW-20250816-68a057a3-09"],
  medical:false,
  related:["newborns-and-blinking","newborn-noises-at-night","feeding-on-demand"]
}
];


/* --- Search ranking -------------------------------------------------------
   Scores a guide against a query. Whole-word title hits beat partial ones,
   and guides matching more of the typed words rank higher — so results
   sharpen as you keep typing rather than just shrinking. */

const _plain = g => (g._text || (g._text = g.body.replace(/<[^>]+>/g, " ").toLowerCase()));
const _esc = t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* "naps" should still find "nap"; "feeding" should still find "feed" */
function _stems(t){
  const out = [t];
  if(t.length > 4 && /(ies)$/.test(t)) out.push(t.slice(0,-3) + "y");
  if(t.length > 4 && /(es|ed)$/.test(t)) out.push(t.slice(0,-2));
  if(t.length > 3 && /s$/.test(t)) out.push(t.slice(0,-1));
  if(t.length > 5 && /ing$/.test(t)) out.push(t.slice(0,-3));
  return out;
}

function _termScore(term, title, summary, topic, body){
  const word = new RegExp("\\b" + _esc(term) + "\\b");
  const pre  = new RegExp("\\b" + _esc(term));
  let s = 0;
  if(word.test(title))        s += 20;
  else if(pre.test(title))    s += 10;
  else if(title.includes(term)) s += 4;

  if(word.test(summary))      s += 7;
  else if(summary.includes(term)) s += 3;

  if(topic.includes(term))    s += 4;

  if(word.test(body))         s += 2;
  else if(body.includes(term)) s += 1;
  return s;
}

function searchScore(g, query){
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if(!terms.length) return 1;

  const title = g.title.toLowerCase();
  const summary = g.summary.toLowerCase();
  const topic = topicById(g.topic).label.toLowerCase();
  const body = _plain(g);

  let total = 0, matched = 0;
  for(const t of terms){
    let best = 0;
    for(const v of _stems(t)) best = Math.max(best, _termScore(v, title, summary, topic, body));
    if(best > 0){ matched++; total += best; }
  }
  if(!matched) return 0;
  return total * Math.pow(matched / terms.length, 2);   // reward matching more of the query
}

function searchGuides(query, opts){
  const {topic=null, age=null} = opts || {};
  return GUIDES
    .map(g => ({g, score: searchScore(g, query)}))
    .filter(x => x.score > 0
      && (!topic || x.g.topic === topic)
      && (!age || x.g.ages.includes(age)))
    .sort((a,b) => b.score - a.score || a.g.title.localeCompare(b.g.title))
    .map(x => x.g);
}

/* --- Shared rendering ---------------------------------------------------- */

const iconFor = g => ICONS[g.topic] || ICONS.feeding;

/* The permanent public URL for a guide. Every link on the site goes through
   this one function, so changing the URL shape is a one-line change and no
   page can be left pointing at the old one. `slug` is optional and defaults to
   the Firestore document id, which is what every existing URL already uses —
   so nothing moves unless a slug is deliberately changed in Studio. */
const guideUrl = g => "/guides/" + ((g && (g.slug || g.id)) || "") + "/";

function cardHTML(g){
  return `<a class="card" href="${guideUrl(g)}">
    <div class="card-icon" aria-hidden="true">${iconFor(g)}</div>
    <div class="card-text">
      <h3>${g.title}</h3>
      <p class="card-meta"><span class="topic">${topicById(g.topic).label}</span><span class="dot">•</span><span>${g.read} min read</span></p>
    </div>
  </a>`;
}

function guideById(id){ return GUIDES.find(g => g.id === id); }

/* --- Server-rendered grids ------------------------------------------------
   The Netlify build writes real guide cards into the card grids, so a crawler
   (and the reader) gets them in the HTML rather than after a round trip to
   Firestore. It stamps a hash of that list onto the grid.

   Before a page rebuilds a grid it asks this: is what you were served already
   the right list? If so, leave the DOM alone — no flash, no layout shift, and
   no work. The hash is cleared afterwards so any later render (a filter, a
   search, a Studio edit) always applies normally.

   Must match bakedHash() in scripts/build.js. */
function bakedHash(list){
  const s = list.map(g => g.id + ":" + g.title).join("|");
  let h = 5381;
  for(let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}
function gridAlreadyCorrect(el, list){
  if(!el) return false;
  const baked = el.getAttribute("data-baked-hash");
  if(!baked) return false;
  el.removeAttribute("data-baked-hash");      // one-shot: only the first paint
  return baked === bakedHash(list);
}

/* Expose data + helpers for the Studio and data layer (non-breaking:
   pages still use the lexical globals; this just mirrors them on window). */
try{
  if(typeof window !== "undefined"){
    window.GUIDES = GUIDES; window.AGES = AGES; window.TOPICS = TOPICS;
    window.ICONS = ICONS; window.topicById = topicById;
    window.guideById = guideById; window.cardHTML = cardHTML;
    window.guideUrl = guideUrl; window.iconFor = iconFor;
    window.searchGuides = searchGuides;
    window.gridAlreadyCorrect = gridAlreadyCorrect;
  }
}catch(e){}

/* header: mobile nav + stuck border */
document.addEventListener("DOMContentLoaded", () => {
  const head = document.querySelector(".site-head");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  if(toggle && nav){
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }
  if(head){
    const setH = () => document.documentElement.style
      .setProperty("--head-h", head.offsetHeight + "px");
    setH();
    window.addEventListener("resize", setH);
    if(document.fonts && document.fonts.ready) document.fonts.ready.then(setH);
  }
});
