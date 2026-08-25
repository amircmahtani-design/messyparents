/* ==========================================================================
   The Messy Parents Collection — content + shared UI
   Add a new guide: copy a block in GUIDES and change the fields.
   ========================================================================== */

const AGES = ["Before baby","First trimester","Second trimester","Third trimester","0–1 month","2–3 months","4–6 months","7–9 months","10–12 months","12–18 months","18–24 months"];

const ICONS = {
  feeding:     `<img src="assets/img/icons/feeding.webp" alt="" aria-hidden="true">`,
  sleeping:    `<img src="assets/img/icons/sleeping.webp" alt="" aria-hidden="true">`,
  development: `<img src="assets/img/icons/development.webp" alt="" aria-hidden="true">`,
  health:      `<img src="assets/img/icons/health.webp" alt="" aria-hidden="true">`,
  sanity:      `<img src="assets/img/icons/sanity.webp" alt="" aria-hidden="true">`,
  "getting-ready": `<img src="assets/img/icons/getting-ready.webp" alt="" aria-hidden="true"
                    onerror="this.replaceWith(document.createTextNode('\u2b50'))">`
};

const TOPICS = [
  {id:"feeding",     label:"Feeding",       icon:ICONS.feeding},
  {id:"sleeping",    label:"Sleeping",      icon:ICONS.sleeping},
  {id:"development", label:"Development",   icon:ICONS.development},
  {id:"health",      label:"Health",        icon:ICONS.health},
  {id:"sanity",      label:"Parent Sanity", icon:ICONS.sanity},
  {id:"getting-ready", label:"Getting Ready", icon:ICONS["getting-ready"]}
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

/* --- Pregnancy, batch 01 ------------------------------------------------ */

{
  id:"pregnancy-belly-pain", topic:"health", icon:"cross", featured:false,
  title:"Is belly pain during pregnancy normal?",
  ages:["Second trimester","Third trimester"], read:3,
  stage:"Second trimester", subcategory:"Pregnancy pain",
  summary:"Some of it is stretching and digestion. But \u201cbelly pain\u201d is far too broad a phrase to reassure yourself with \u2014 the details decide.",
  keywords:["belly pain","stomach pain pregnancy","abdominal pain","round ligament","is it normal"],
  body:`
<p>This is the question almost everyone asks first, and it is almost useless on its own. We know, because we asked it exactly like that: <em>"Feeling pain on my belly while pregnant normal"</em>. Within a few days it had become a much more specific question, and the specific version was the one worth answering.</p>
<h2>Why the broad version can't be answered</h2>
<p>A pregnant belly is doing several things at once. Muscles and ligaments are stretching, digestion has slowed down, organs are being rearranged, and later on there is a whole person moving around in there. Any of those can hurt.</p>
<p>But the same region also produces pain that needs a doctor today. The difference is almost never in the word "pain" \u2014 it's in where, how badly, how long, and what else is happening.</p>
<h2>Answer these four before you Google</h2>
<ul>
<li><strong>Where exactly.</strong> One side, both sides, low down, up under the ribs, across the whole bump.</li>
<li><strong>What kind.</strong> Sharp, aching, tightening, burning, or a heavy pressure.</li>
<li><strong>What pattern.</strong> Brief and triggered by moving, or constant, or coming and going at regular intervals.</li>
<li><strong>What else.</strong> Any bleeding, any watery fluid, fever, vomiting, pain passing urine, or a change in movement once you're feeling it regularly.</li>
</ul>
<div class="quiet">Round-ligament pain is the usual reassuring answer, and often the right one \u2014 a sharp pull on one side when you stand up, roll over or sneeze, gone in seconds. It does not sit there all day.</div>
<h2>Carry your dates with you</h2>
<p>Whoever you ask needs to know how many weeks you are, and whether it's one baby or more. We learned this the annoying way: an early answer we got mentioned ectopic pregnancy, which was completely irrelevant to an established twin pregnancy well past the point where that was possible. Reassurance built on the wrong assumptions isn't reassurance.</p>`,
  callout:{title:"Call your maternity team if",items:[
    "The pain is severe, persistent, worsening, regular, or all on one side",
    "There's bleeding, or watery fluid, or a change in discharge",
    "Fever, vomiting, faintness, or pain when passing urine",
    "Significant downward pelvic pressure, or anything that makes you wonder about early labour",
    "Movements have reduced or changed, once you're feeling them regularly"]},
  panel:{
    eyebrow:"Health \u2022 Pregnancy",
    normal:{title:"Often just",items:[
      "Ligaments and muscles stretching","Slower digestion, gas and bloating",
      "The uterus growing","Braxton Hicks tightenings","A baby with sharp elbows"]},
    warn:{title:"Call your team if",items:[
      "Severe, constant, worsening or regular pain","Bleeding or watery fluid",
      "Fever, vomiting or faintness","Marked pelvic pressure before term"]},
    helped:{title:"What to note down first",items:[
      "Exactly where it is","Sharp, aching, tightening or pressure",
      "How long it lasts and what sets it off","Your gestation \u2014 say it every time you ask"]},
    quick:"Ordinary stretching pain is brief and moves with you. Pain that stays, worsens, comes in a rhythm or arrives with bleeding or fluid needs your maternity team, not a search bar."
  },
  originalQuestions:["Feeling pain on my belly while pregnant normal (19 May 2025)"],
  sources:["RAW-20250519-682afa2a-01"],
  medical:true,
  related:["pelvic-pressure-pregnancy","pregnancy-hip-pain","waters-breaking-without-pain"]
},

{
  id:"pelvic-pressure-pregnancy", topic:"health", icon:"cross", featured:true,
  title:"Pelvic pressure so heavy it feels like the baby is coming",
  ages:["Second trimester","Third trimester"], read:4,
  stage:"Second trimester", subcategory:"Pregnancy pain",
  summary:"Pubic and groin pressure is common and often mechanical. But new, heavy pressure before term is one of the few things that genuinely shouldn't wait.",
  keywords:["pelvic pressure","pubic bone pain","spd","symphysis pubis","pressure 25 weeks","feels like giving birth"],
  body:`
<p>Ours started as pain in one small spot just above the pubic bone. Then it was a bruise-like feeling. Then, at 25 weeks with twins, it was enough pressure that it genuinely felt as though birth was about to happen. Two weeks later, at 27 weeks, it came back and stayed at about 5 out of 10 all day.</p>
<p>We asked, in various desperate phrasings, whether all of that was normal. Here is the honest answer we wish we'd had first.</p>
<h2>The mechanical explanation is real</h2>
<p>The pelvic joints soften and loosen in pregnancy. That can produce genuine, sometimes severe pain over the pubic bone, in the groin, or across the back of the pelvis \u2014 often called pelvic girdle pain, or SPD when it's centred on the pubic joint. It's typically worse when you part your legs: getting out of a car, turning in bed, climbing stairs, standing on one leg to dress.</p>
<p>It's common, it's mechanical, and it responds to being handled properly rather than endured.</p>
<h2>What actually helps with the mechanical kind</h2>
<ul>
<li><strong>Keep your knees together</strong> for anything that involves turning or getting up. Swing both legs out of the car as one unit. Roll in bed like a log.</li>
<li><strong>A pillow between the knees</strong> at night, and one under the bump.</li>
<li><strong>Sit down to dress.</strong> Standing on one leg is often the single worst movement of the day.</li>
<li><strong>Shorter steps.</strong> Long strides open the pelvis further.</li>
<li><strong>Ask for pelvic-health physiotherapy.</strong> This is the referral worth pushing for \u2014 a support belt fitted properly by someone who has examined you beats anything bought online on a guess.</li>
</ul>
<div class="quiet">We asked whether an inversion might relieve the pressure. Don't improvise positional tricks from the internet in a high-risk or late pregnancy. Ask the team first \u2014 that's what the physio referral is for.</div>
<h2>Where the reassurance has to stop</h2>
<p>Everything above assumes a mechanical problem. New or markedly increased pelvic pressure before term can also be a sign of something else entirely \u2014 cervical change, preterm labour, or a urinary problem. That cannot be sorted out from a description typed into a phone at midnight, and with twins the threshold for checking should be lower, not higher.</p>
<p>If you find yourself repeatedly asking whether it's still normal \u2014 as we did, four separate times in one evening \u2014 that repetition is itself the answer. Call them.</p>`,
  callout:{title:"Call your maternity unit promptly if",items:[
    "The pressure is new or markedly worse, and you're not yet at term",
    "Regular tightenings, or period-like cramps, or low backache that comes and goes",
    "Bleeding, watery fluid, or a noticeable change in discharge",
    "Pain or burning when passing urine, or a fever",
    "You can't walk or bear weight, or the pain is severe"]},
  panel:{
    eyebrow:"Health \u2022 Pregnancy",
    normal:{title:"Often pelvic girdle pain",items:[
      "Worse parting your legs \u2014 cars, stairs, turning in bed",
      "Centred over the pubic bone or in the groin",
      "Eases when you keep your knees together",
      "Common, mechanical, and treatable"]},
    warn:{title:"Call promptly if",items:[
      "New or markedly heavier pressure before term",
      "Regular tightenings or cramps","Bleeding or watery fluid",
      "Burning urine or fever","You can't bear weight"]},
    helped:{title:"What helped us",items:[
      "Knees together for every turn and transfer",
      "Pillow between the knees at night","Sitting down to get dressed",
      "Asking for a pelvic-health physio referral"]},
    quick:"Pelvic pain is usually mechanical and manageable. New heavy pressure before term is not something to keep re-checking online \u2014 ring the unit."
  },
  originalQuestions:[
    "Hurts my pregnant wife in a spot just above her vagina on right side (22 May 2025, asked twice)",
    "Is it normal to feel discomfort when pregnant near the vagina above (23 May 2025)",
    "Pregnant wife has a bruise like feeling near the vagina area is this normal (24 May 2025)",
    "At 25 weeks pregnant with twins my wife feels she's going to give birth coz she feels the pressure is this normal (24 May 2025)",
    "My wife is feeling a lot of pressure she is 27 weeks pregnant with twins (6 June 2025)",
    "So it's normal to feel pelvic pressure then of pain 5/10 (6 June 2025)",
    "Is it normal the whole day to feel this pressure (6 June 2025)"],
  sources:["RAW-20250522-682f78db-01","RAW-20250522-682f78db-02","RAW-20250523-6830a885-04",
           "RAW-20250524-6831aee5-01","RAW-20250524-6831aee5-04","RAW-20250606-68432069-01",
           "RAW-20250606-68432069-03","RAW-20250606-68432069-09"],
  medical:true,
  related:["pregnancy-belly-pain","pregnancy-hip-pain","waters-breaking-without-pain"]
},

{
  id:"pregnancy-hip-pain", topic:"health", icon:"cross", featured:false,
  title:"My hip hurts a lot in pregnancy \u2014 is that still normal?",
  ages:["Second trimester","Third trimester"], read:3,
  stage:"Second trimester", subcategory:"Pregnancy pain",
  summary:"Hip pain is common. \u201cA lot\u201d is the word that changes the answer \u2014 severity deserves an examination, not an automatic reassurance.",
  keywords:["hip pain pregnancy","severe hip pain","pelvic girdle","sciatica pregnancy","sleeping with hip pain"],
  body:`
<p>Our question was four words longer than it needed to be and still contained the important bit: <em>"My pregnant wife hip hurts a lot is this normal"</em>. The answer we got opened with reassurance. It shouldn't have \u2014 not before asking a single thing about <em>a lot</em>.</p>
<h2>Common, yes. Automatically fine, no.</h2>
<p>Hip and pelvic pain in pregnancy is genuinely common. Loosened joints, a shifting centre of gravity, more weight, and a lot of hours spent lying on one side all contribute. Most of it is muscular or pelvic-girdle related.</p>
<p>But "common" and "severe" are different words. Severe pain earns an examination, because the treatment depends on which structure is actually involved \u2014 muscular, joint, or nerve \u2014 and you can't tell those apart from a sentence.</p>
<h2>Worth trying while you wait for an appointment</h2>
<ul>
<li><strong>Change position often.</strong> The hip that hurts is usually the one you've been lying on for six hours.</li>
<li><strong>Pillow between the knees,</strong> and one supporting the bump, so the top leg isn't dragging the pelvis forward all night.</li>
<li><strong>Stop doing the one movement that clearly triggers it.</strong> There's usually one.</li>
<li><strong>Ask about pain relief</strong> with your maternity clinician or a pharmacist rather than guessing from the box.</li>
<li><strong>Ask about pelvic-health physiotherapy.</strong> This is the referral that actually changes things.</li>
</ul>
<div class="quiet">If you can't put weight on it, that isn't a pillow problem. That's a phone call.</div>`,
  callout:{title:"Get it assessed promptly if",items:[
    "The pain is severe or came on suddenly",
    "You can't bear weight on that leg",
    "There's been a fall or any injury",
    "Fever, or weakness or numbness in the leg",
    "One-sided leg swelling, calf pain, or breathlessness",
    "Tightenings, bleeding or fluid leakage alongside it"]},
  panel:{
    eyebrow:"Health \u2022 Pregnancy",
    normal:{title:"Usually",items:[
      "Loosened pelvic joints","A shifted centre of gravity",
      "Hours spent lying on one side","Muscular strain from carrying more weight"]},
    warn:{title:"Assess promptly if",items:[
      "Severe or sudden onset","Can't bear weight","After a fall",
      "Fever, weakness or numbness","One-sided leg swelling or calf pain"]},
    helped:{title:"Worth trying meanwhile",items:[
      "Pillow between the knees","Switch sides more often",
      "Drop the one movement that triggers it","Push for a physio referral"]},
    quick:"Common doesn't mean ignore it. If it hurts a lot, get it looked at \u2014 the fix depends on what's actually causing it."
  },
  originalQuestions:["My pregnant wife hip hurts a lot is this normal (24 May 2025)"],
  sources:["RAW-20250524-6831a218-01"],
  medical:true,
  related:["pelvic-pressure-pregnancy","pregnancy-belly-pain","hungry-and-full"]
},

{
  id:"hungry-and-full", topic:"feeding", icon:"bottle", featured:false,
  title:"Hungry and full at the same time \u2014 how?",
  ages:["Second trimester","Third trimester"], read:3,
  stage:"Second trimester", subcategory:"Pregnancy nutrition",
  summary:"Pregnancy raises appetite while shrinking the space and slowing digestion. Both signals are real, and they arrive together.",
  keywords:["hungry and full","appetite pregnancy","full quickly","reflux pregnancy","small meals"],
  body:`
<p>It sounded contradictory enough that we checked: hungry, and full, simultaneously. It isn't a contradiction. It's two separate systems disagreeing.</p>
<h2>What's going on</h2>
<ul>
<li><strong>Appetite goes up.</strong> There's more demand, and the hunger signal reflects that honestly.</li>
<li><strong>The space goes down.</strong> The uterus pushes upward on the stomach, so it fills sooner than it used to. Twins accelerate this considerably.</li>
<li><strong>Digestion slows.</strong> Food sits around longer, which means the last meal may still be there when the next hunger signal arrives.</li>
<li><strong>Bloating and reflux</strong> add a feeling of fullness that has nothing to do with how much you've actually eaten.</li>
</ul>
<h2>What tends to work</h2>
<ul>
<li>Smaller meals, more often, rather than three big ones you can't finish.</li>
<li>Foods that are worth the limited space \u2014 nutrient-dense beats voluminous.</li>
<li>Drinking <em>between</em> meals rather than with them, if fluid makes the fullness worse.</li>
<li>Not lying flat straight after eating, if reflux is part of it.</li>
</ul>
<div class="quiet">Pregnancy asking for food while simultaneously announcing there's nowhere to put it. That is roughly the whole experience.</div>
<h2>Where it stops being ordinary</h2>
<p>Feeling full quickly is one thing. Not being able to eat or drink enough is another. If meals are consistently being abandoned, or there's persistent vomiting, real pain, or weight going the wrong way, that's worth raising rather than working around.</p>`,
  callout:{title:"Worth mentioning to your team if",items:[
    "Persistent vomiting, or you can't keep fluids down",
    "Significant abdominal pain",
    "Weight loss, or consistently not meeting intake needs",
    "Difficulty swallowing",
    "Black or bloody stools, or feeling generally unwell"]},
  panel:{
    eyebrow:"Feeding \u2022 Pregnancy",
    normal:{title:"Usually",items:[
      "Higher appetite","Less stomach room","Slower digestion",
      "Bloating and reflux faking fullness"]},
    warn:{title:"Mention it if",items:[
      "Persistent vomiting or dehydration","Real pain","Weight loss",
      "Trouble swallowing","Black or bloody stools"]},
    helped:{title:"What tends to work",items:[
      "Small meals, spaced out","Nutrient-dense over bulky",
      "Fluids between meals, not with them","Stay upright after eating"]},
    quick:"Two honest signals arriving at once. Eat smaller and more often, and flag it only if you genuinely can't keep intake up."
  },
  originalQuestions:["My pregnant wife feels hungry and full at the same time is this normal (23 May 2025)"],
  sources:["RAW-20250523-6830a885-01"],
  medical:false,
  related:["heartburn-and-burping","pregnancy-belly-pain","dark-stool-on-iron"]
},

{
  id:"low-blood-pressure-pregnancy", topic:"health", icon:"cross", featured:false,
  title:"Is a blood pressure of 102/55 okay in pregnancy?",
  ages:["Second trimester","Third trimester"], read:3,
  stage:"Second trimester", subcategory:"Pregnancy monitoring",
  summary:"A single reading can't be judged on its own. How she feels matters more than either number.",
  keywords:["low blood pressure pregnancy","102/55","dizzy pregnancy","blood pressure reading","home monitor"],
  body:`
<p>We had one reading and six words of question: <em>"Blood pressure of 102 55 when pregnant is ok"</em>. It's a good example of how a home monitor turns two numbers into a full diagnostic crisis in about four seconds.</p>
<h2>Why the number alone doesn't answer it</h2>
<p>Readings in that range are unremarkable for plenty of people in pregnancy, particularly in the middle trimester when blood pressure often runs lower than usual. But whether <em>this</em> reading matters depends on things the number doesn't contain:</p>
<ul>
<li>What her readings usually are \u2014 a drop from her own baseline means more than a comparison to a chart.</li>
<li>Whether she feels well, or dizzy, faint, weak or breathless.</li>
<li>Whether the measurement was any good \u2014 right cuff size, arm supported at heart height, sitting quietly first.</li>
<li>Hydration, when she last ate, and whether she'd just stood up.</li>
</ul>
<div class="quiet">The real question isn't "is 102/55 low". It's "is she dizzy, faint, unwell, dehydrated or bleeding". Those you can actually answer.</div>
<h2>If it reads low and she feels fine</h2>
<ul>
<li>Rest quietly for five minutes and repeat it, if home monitoring is something your team has asked you to do.</li>
<li>Write down the reading, the pulse, and how she felt. A pattern is worth far more than one snapshot.</li>
<li>Stand up slowly. No driving or walking unsupported while dizzy.</li>
<li>Keep fluids going.</li>
</ul>
<p>And follow whatever monitoring instructions your obstetric team has actually given you. Those beat any general range, including this one.</p>`,
  callout:{title:"Contact your maternity team if",items:[
    "Repeated low readings alongside dizziness, faintness or weakness",
    "Palpitations or breathlessness",
    "Any bleeding, or vomiting and an inability to keep fluids down",
    "A marked change from her usual pattern",
    "Collapse, chest pain or severe breathlessness \u2014 that's urgent help, now"]},
  panel:{
    eyebrow:"Health \u2022 Pregnancy",
    normal:{title:"Often fine if",items:[
      "She feels well","It matches her usual readings",
      "Mid-pregnancy, when BP often runs lower","One-off after standing or a warm room"]},
    warn:{title:"Contact the team if",items:[
      "Low readings with dizziness or faintness","Palpitations or breathlessness",
      "Bleeding or persistent vomiting","A clear change from her baseline"]},
    helped:{title:"Do this first",items:[
      "Rest 5 minutes, repeat the reading","Check cuff size and arm position",
      "Log the number, the pulse and the symptoms","Stand up slowly"]},
    quick:"One reading isn't an assessment. Judge how she feels, log the pattern, and follow your team's instructions over any published range."
  },
  originalQuestions:["Blood pressure of 102 55 when pregnant is ok (3 June 2025)"],
  sources:["RAW-20250603-683e96f0-01"],
  medical:true,
  related:["pregnancy-belly-pain","flying-late-pregnancy","dark-stool-on-iron"]
},

{
  id:"flying-late-pregnancy", topic:"health", icon:"cross", featured:false,
  title:"Numbness and pulling pain after a flight at 29 weeks",
  ages:["Third trimester"], read:4,
  stage:"Third trimester", subcategory:"Pregnancy travel",
  summary:"Flying can genuinely make swelling, pressure and aching worse. It doesn't get to explain every symptom that turns up afterwards.",
  keywords:["flying pregnant","numbness above belly button","pulling pain","travel third trimester","29 weeks flying"],
  body:`
<p>Off the plane at 29 weeks and 5 days with twins, Lia had numbness above her belly button, then a pulling pain. We asked two things at once: was that normal, and what does flying at this stage feel like anyway.</p>
<p>The second question got answered enthusiastically. The first one \u2014 the one that mattered \u2014 got buried under a general list. Don't let that happen to you.</p>
<h2>What travel does legitimately worsen</h2>
<ul>
<li>Swelling in the feet, ankles and hands, from hours of sitting still.</li>
<li>Muscular aching and back discomfort from cramped seats.</li>
<li>Dehydration, which cabin air is very good at causing.</li>
<li>Plain exhaustion, which makes everything else feel worse.</li>
<li>Pelvic pressure, from sitting in one position too long.</li>
</ul>
<h2>The bit worth internalising</h2>
<div class="quiet">A symptom that appears after a flight is not automatically caused by the flight. New numbness or new pain late in pregnancy is a symptom first and a travel story second.</div>
<p>Skin numbness over a stretched bump is often mechanical and unremarkable. But numbness that spreads, or arrives with weakness, is a different thing. And "pulling pain" in a late twin pregnancy needs its location and pattern pinned down before anyone reassures anyone.</p>
<h2>What to do</h2>
<ul>
<li>Note when it started and whether resting or changing position helps.</li>
<li>Check specifically for tightenings, pelvic pressure, backache, any discharge change, any fluid, and fetal movement.</li>
<li>Drink properly and stop doing anything strenuous while you sort it out.</li>
<li>Follow your own team's travel and compression advice rather than a generic week cut-off from the internet \u2014 airline rules and medical advice are two different things, and yours may differ from both.</li>
</ul>`,
  callout:{title:"Contact your maternity team promptly for",items:[
    "Persistent or worsening pain, or regular tightenings",
    "Bleeding, watery fluid, or reduced or changed movement",
    "Breathlessness, chest pain, faintness",
    "Severe headache or visual changes",
    "One-sided leg pain or swelling, or calf tenderness",
    "Sudden weakness, or numbness that is spreading"]},
  panel:{
    eyebrow:"Health \u2022 Third trimester",
    normal:{title:"Travel can worsen",items:[
      "Swelling in feet, ankles, hands","Muscular aching and backache",
      "Dehydration","Fatigue","Pelvic pressure from sitting still"]},
    warn:{title:"Contact promptly for",items:[
      "Persistent pain or regular tightenings","Bleeding or watery fluid",
      "Reduced movement","Breathlessness or chest pain",
      "One-sided leg pain or swelling"]},
    helped:{title:"Sort out first",items:[
      "When it started, what eases it","Tightenings? Fluid? Movement?",
      "Hydrate and rest","Ring your team, not the airline policy page"]},
    quick:"Flying explains swelling and aching. It does not get to explain new numbness or new pain \u2014 those get assessed on their own merits."
  },
  originalQuestions:[
    "Is it normal to feel numb above belly button after flying when pregnant (24 June 2025)",
    "My wife has just flown with twins and she now feels pulling pain. She is 29 weeks and 5 days (24 June 2025)",
    "What does flying when pregnant after the 29th week feel like (24 June 2025)"],
  sources:["RAW-20250624-685a9b57-01","RAW-20250624-685a9b57-07","RAW-20250624-685a9b57-08"],
  medical:true,
  related:["pelvic-pressure-pregnancy","low-blood-pressure-pregnancy","hospital-bag-csection-nicu"]
},

{
  id:"waters-breaking-without-pain", topic:"health", icon:"cross", featured:true,
  title:"Watery discharge with no pain \u2014 could that be my waters?",
  ages:["Third trimester"], read:2,
  stage:"Third trimester", subcategory:"Signs of labour",
  summary:"Yes. Waters can break with no contractions and no pain at all. This is a ring-them-now, not a look-it-up.",
  keywords:["waters breaking","watery discharge","no pain","ruptured membranes","third trimester leaking"],
  body:`
<p>This is the shortest guide here, deliberately.</p>
<p>Watery fluid in late pregnancy can be several things \u2014 increased normal discharge, urine leakage, or the waters. Only one of those needs urgent action, and the absence of pain does not rule it out. <strong>Waters can break without any contractions.</strong></p>
<h2>What to do now</h2>
<ul>
<li><strong>Call your maternity unit.</strong> Not later. Now.</li>
<li>Put on a pad so you can see the amount, the colour and whether it keeps coming.</li>
<li>Note the time it started, and whether there's any smell.</li>
<li><strong>Don't put anything inside the vagina</strong> \u2014 no tampons, no checking.</li>
<li>Then do exactly what the unit tells you.</li>
</ul>
<div class="quiet">We asked this one at a point where threatened preterm labour was already in the recent history. If that's your situation too, the threshold for calling should be lower, not higher.</div>
<p>If the fluid is green, brown or bloodstained, if you have a fever, or if movements have reduced, say so on the phone straight away rather than waiting to be asked.</p>`,
  callout:{title:"Ring the maternity unit immediately",items:[
    "Any watery fluid in late pregnancy, with or without pain",
    "Say so straight away if it's green, brown or bloodstained",
    "Mention any fever, or any reduction in movements",
    "Don't wait to see whether it happens again"]},
  panel:{
    eyebrow:"Health \u2022 Third trimester",
    normal:{title:"It could be",items:[
      "Normal discharge, which does increase late on",
      "A small urine leak","Or the waters \u2014 which is why you call"]},
    warn:{title:"Say this on the phone",items:[
      "Time it started, amount, colour","Green, brown or bloodstained fluid",
      "Any fever","Any change in movements"]},
    helped:{title:"While you call",items:[
      "Put on a pad, not a tampon","Nothing inside the vagina",
      "Note the colour and smell","Follow the unit's instructions exactly"]},
    quick:"No pain doesn't mean not your waters. Call the unit, use a pad, put nothing inside, and let them decide."
  },
  originalQuestions:["Third trimester water came out like a discharge but no pain (15 July 2025)"],
  sources:["RAW-20250715-687630c1-01"],
  medical:true,
  related:["pelvic-pressure-pregnancy","hospital-bag-csection-nicu","pregnancy-belly-pain"]
},

{
  id:"itchy-hands-pregnancy", topic:"health", icon:"cross", featured:false,
  title:"Itchy, red hands in pregnancy",
  ages:["Second trimester","Third trimester"], read:2,
  stage:"Third trimester", subcategory:"Pregnancy skin",
  summary:"Usually irritation. But itchy palms in pregnancy is one of the specific things worth reporting rather than treating with moisturiser.",
  keywords:["itchy hands pregnancy","itchy palms","cholestasis","red hands","itching at night pregnant"],
  body:`
<p>Our question was five words: <em>"Itchy and red hands pregnancy normal"</em>. Most of the time the answer is yes \u2014 irritation, eczema, heat, soap, or hands that are simply drier than usual.</p>
<h2>The one thing worth ruling out</h2>
<p>Itching that involves the <strong>palms of the hands or the soles of the feet</strong>, particularly when it's worse at night and there's no obvious rash to explain it, is the pattern associated with obstetric cholestasis \u2014 a liver condition of pregnancy. It's uncommon, it's diagnosed with a blood test, and it's managed. It just needs to be looked for rather than moisturised over.</p>
<div class="quiet">The distinguishing detail is usually the palms and soles, and no visible rash. Itchy red knuckles after washing up is a different story.</div>
<h2>Worth mentioning at your next contact</h2>
<ul>
<li>Whether the palms or soles are involved.</li>
<li>Whether it's worse at night.</li>
<li>Whether there's a visible rash, or just itching.</li>
<li>How long it's been going on.</li>
<li>Any yellowing of the eyes or skin, dark urine or pale stools.</li>
</ul>
<p>For ordinary irritation, the boring measures do work: a fragrance-free emollient, gloves for cleaning products, cooler water, and keeping the room from getting too warm at night.</p>`,
  callout:{title:"Report to your maternity team if",items:[
    "Itching on the palms or the soles of the feet",
    "Itching that's persistent, severe, or worse at night",
    "Itching without any rash to explain it",
    "Yellowing of the skin or eyes, dark urine, or pale stools",
    "Facial swelling or breathing difficulty \u2014 that's urgent, now"]},
  panel:{
    eyebrow:"Health \u2022 Pregnancy",
    normal:{title:"Usually",items:[
      "Dry skin or irritation","Contact with soaps or cleaning products",
      "Heat","Eczema flaring in pregnancy"]},
    warn:{title:"Report it if",items:[
      "Palms or soles involved","Worse at night","No rash, just itching",
      "Jaundice, dark urine or pale stools"]},
    helped:{title:"For plain irritation",items:[
      "Fragrance-free emollient","Gloves for cleaning",
      "Cooler water","A cooler bedroom"]},
    quick:"Palms and soles, worse at night, no rash \u2014 that combination gets reported. Everything else is usually just dry, cross skin."
  },
  originalQuestions:["Itchy and red hands pregnancy normal (16 July 2025)"],
  sources:["RAW-20250716-68773be3-01"],
  medical:true,
  related:["pregnancy-belly-pain","dark-stool-on-iron","nosebleed-in-pregnancy"]
},

{
  id:"dark-stool-on-iron", topic:"health", icon:"cross", featured:false,
  title:"Very dark poo on iron \u2014 side effect or warning sign?",
  ages:["Second trimester","Third trimester"], read:3,
  stage:"Third trimester", subcategory:"Pregnancy digestion",
  summary:"Iron darkens stool, routinely. Black and tarry is a different description, and it's the one that needs a doctor.",
  keywords:["dark stool iron","black poo pregnancy","iron supplement side effects","tarry stool","sideral"],
  body:`
<p>Ours arrived as three words in the middle of a completely different conversation: <em>"Poop is very dark"</em>. No colour chart, no other detail. And yet the distinction it needed turned out to matter quite a lot.</p>
<h2>The ordinary explanation</h2>
<p>Iron supplements very commonly turn stool dark green to near-black. It's harmless, it's expected, and it usually shows up within a few days of starting. Constipation often comes along with it.</p>
<h2>The description that changes things</h2>
<p>The word doing the work here isn't "dark". It's <strong>tarry</strong>.</p>
<ul>
<li><strong>Dark, but normal texture</strong> \u2014 typically the iron.</li>
<li><strong>Black, sticky, tarry, unusually foul-smelling</strong> \u2014 that can indicate bleeding higher up in the gut, and needs assessing rather than assuming.</li>
</ul>
<div class="quiet">Iron being the obvious explanation is exactly what makes this worth checking. The convenient answer is right most of the time, which is precisely why it shouldn't be assumed.</div>
<h2>Before you call</h2>
<ul>
<li>Note the colour <em>and</em> the texture and smell.</li>
<li>List every supplement and medicine currently being taken \u2014 the exact products, not "the pregnancy ones".</li>
<li>Note any abdominal pain, vomiting, dizziness, weakness, or visible blood.</li>
</ul>
<p>For plain iron-related darkness with constipation, more fluids, more fibre, and asking your team whether the dose, the timing or the preparation can be adjusted are all reasonable next steps.</p>`,
  callout:{title:"Get medical advice promptly for",items:[
    "Black, tarry or sticky stool, especially if foul-smelling",
    "Visible blood in stool, or vomiting blood",
    "Significant abdominal pain",
    "Faintness, marked weakness, or feeling unwell",
    "Anything where bleeding is suspected \u2014 that's an urgent assessment"]},
  panel:{
    eyebrow:"Health \u2022 Pregnancy",
    normal:{title:"Usually the iron",items:[
      "Dark green to near-black colour","Normal texture",
      "Starts within days of the supplement","Often with constipation"]},
    warn:{title:"Get advice for",items:[
      "Black, sticky or tarry stool","Foul-smelling","Visible blood",
      "Abdominal pain, faintness or weakness"]},
    helped:{title:"Note before calling",items:[
      "Colour, texture and smell","Every exact supplement and medicine",
      "Any pain, vomiting or dizziness","When it started"]},
    quick:"Dark is the iron. Black and tarry is a phone call \u2014 don't let the obvious explanation do the diagnosing."
  },
  originalQuestions:["Poop is very dark (1 July 2025)"],
  sources:["RAW-20250701-68638aae-02"],
  medical:true,
  related:["heartburn-and-burping","hungry-and-full","itchy-hands-pregnancy"]
},

{
  id:"nosebleed-in-pregnancy", topic:"health", icon:"cross", featured:false,
  title:"A nosebleed in pregnancy",
  ages:["First trimester","Second trimester","Third trimester"], read:2,
  stage:"Third trimester", subcategory:"Pregnancy symptoms",
  summary:"More common in pregnancy than out of it. The first-aid technique matters more than the cause \u2014 and most people do it wrong.",
  keywords:["nosebleed pregnancy","nose bleed pregnant","first aid nosebleed","epistaxis pregnancy"],
  body:`
<p>The entire history we supplied was: pregnant wife, nosebleed, first time, small amount. That turned out to be enough, which doesn't happen often.</p>
<h2>Why they're more common now</h2>
<p>Blood volume increases in pregnancy and the lining of the nose becomes more congested and more fragile. Add air conditioning, dry air or a bit of enthusiastic nose-blowing during a cold, and vessels give way more easily than they used to.</p>
<h2>The first aid, done properly</h2>
<ul>
<li><strong>Sit up and lean slightly forward.</strong> Not back \u2014 tilting back sends blood down the throat.</li>
<li><strong>Pinch the soft part of the nose,</strong> below the bony bridge. Not the bridge itself.</li>
<li><strong>Hold for a full 10 to 15 minutes without letting go to check.</strong> This is the step nearly everyone gets wrong. Releasing at three minutes to see how it's going restarts the clock.</li>
<li>Breathe through the mouth.</li>
<li>Afterwards, avoid blowing or picking the nose for a while.</li>
</ul>
<div class="quiet">If they keep coming back, dry air is often the culprit. Saline spray and a humidifier do more than you'd expect.</div>`,
  callout:{title:"Seek medical advice if",items:[
    "The bleeding is heavy, or won't stop after 15 minutes of sustained pressure",
    "It followed a head injury",
    "Nosebleeds keep returning",
    "There's faintness, breathing difficulty, or unusual bruising elsewhere",
    "Severe bleeding or feeling unwell \u2014 that's emergency help"]},
  panel:{
    eyebrow:"Health \u2022 Pregnancy",
    normal:{title:"Usually",items:[
      "Increased blood volume","A more congested, fragile nasal lining",
      "Dry air or air conditioning","A cold, and a lot of nose-blowing"]},
    warn:{title:"Get advice if",items:[
      "Heavy, or not stopping after 15 minutes","After a head injury",
      "Recurring","Faintness, or unusual bruising"]},
    helped:{title:"The technique",items:[
      "Sit up, lean slightly forward","Pinch the soft part, not the bridge",
      "10\u201315 minutes, no peeking","Mouth-breathe, then leave the nose alone"]},
    quick:"Lean forward, pinch the soft part, hold it for the full quarter of an hour. Checking early is what makes them last."
  },
  originalQuestions:[
    "Reported that Lia had a nosebleed (8 July 2025)",
    "Clarified that it was the first time and only a small amount (8 July 2025)"],
  sources:["RAW-20250708-686d7c38-01","RAW-20250708-686d7c38-02"],
  medical:true,
  related:["itchy-hands-pregnancy","pregnancy-belly-pain","low-blood-pressure-pregnancy"]
},

{
  id:"heartburn-and-burping", topic:"health", icon:"cross", featured:false,
  title:"More toilet trips, more acidity, more burping",
  ages:["Third trimester"], read:3,
  stage:"Third trimester", subcategory:"Pregnancy digestion",
  summary:"A late-pregnancy digestive cluster is usually mechanical. \u201cEverything else is the same\u201d is genuinely useful information \u2014 just not a diagnosis.",
  keywords:["heartburn pregnancy","burping","frequent bowel movements","acidity third trimester","twins digestion"],
  body:`
<p>Third trimester, twins. Since the day before: more trips to the toilet, more acidity, more burping. Our entire follow-up history was the sentence <em>"Everything else is the same"</em> \u2014 concise, actually useful, and still not quite enough to run a gastroenterology clinic on.</p>
<h2>The mechanical explanation</h2>
<ul>
<li><strong>Reflux and burping:</strong> the valve at the top of the stomach relaxes in pregnancy, and there's a great deal of upward pressure. Twins make both worse.</li>
<li><strong>Bowel changes:</strong> hormones alter gut transit, and a heavy uterus presses on the bowel. Late on, things can also loosen as the body prepares.</li>
<li><strong>Everything at once</strong> is common in the third trimester precisely because it's all the same underlying cause.</li>
</ul>
<h2>What helps</h2>
<ul>
<li>Smaller meals, and nothing substantial within a couple of hours of lying down.</li>
<li>Sleeping propped up rather than flat.</li>
<li>Identifying the triggers \u2014 usually fatty, spicy, or very acidic food, and it's usually obvious which.</li>
<li>Keeping fluids up, especially if trips to the toilet have increased.</li>
<li><strong>Ask which antacid</strong> is appropriate rather than picking one off the shelf. Some interfere with iron absorption, which matters a lot if she's on iron.</li>
</ul>
<div class="quiet">Worth tracking: whether stools are actually loose, and whether any of the tightening sensations are becoming regular. Late-pregnancy digestive upset and early labour can overlap more than you'd like.</div>`,
  callout:{title:"Seek advice for",items:[
    "Persistent diarrhoea, or an inability to keep fluids down",
    "Fever, or blood in stool",
    "Severe abdominal pain, or vomiting",
    "Reduced movements, regular tightenings, bleeding or fluid leakage",
    "Signs of dehydration"]},
  panel:{
    eyebrow:"Health \u2022 Third trimester",
    normal:{title:"Usually",items:[
      "A relaxed valve at the top of the stomach","Upward pressure from the uterus",
      "Hormonal changes to gut transit","All three arriving together"]},
    warn:{title:"Seek advice for",items:[
      "Persistent diarrhoea or dehydration","Fever or blood",
      "Severe pain or vomiting","Regular tightenings, bleeding or fluid"]},
    helped:{title:"What helps",items:[
      "Smaller meals, none before lying down","Sleep propped up",
      "Find the trigger foods","Ask which antacid \u2014 some block iron"]},
    quick:"Usually one mechanical cause producing three symptoms. Track whether stools are truly loose and whether tightenings turn regular."
  },
  originalQuestions:[
    "Asked whether frequent bowel movements, more acidity and burping were normal in the third trimester with twins (27 June 2025)",
    "Everything else is the same (27 June 2025)"],
  sources:["RAW-20250627-685ec3ef-01","RAW-20250627-685ec3ef-02"],
  medical:true,
  related:["dark-stool-on-iron","hungry-and-full","pelvic-pressure-pregnancy"]
},

{
  id:"hospital-bag-csection-nicu", topic:"getting-ready", icon:"heart", featured:true,
  title:"The hospital bag when a C-section \u2014 or NICU \u2014 is on the cards",
  ages:["Third trimester"], read:5,
  stage:"Third trimester", subcategory:"Preparing for birth",
  summary:"One list becomes four the moment you actually think about it. Here's the version that accounts for surgery and for a baby who may not be in the room with you.",
  keywords:["hospital bag","c-section bag","nicu bag","what to pack","maternity pads","partner bag"],
  body:`
<p>We asked for "a C-section bag for wife and husband" and then immediately had to ask three more questions: how many maternity pads, how many nappies, and what changes if the baby goes to NICU. It began as one list and needed a mother version, a father version, a surgery version, a nappy calculation and a NICU rewrite. Naturally.</p>
<h2>Start here, before you buy anything</h2>
<p><strong>Ask the hospital what's included.</strong> Packages vary enormously \u2014 some supply pads, nappies, gowns and formula; some supply nothing. Buying quantities before you've asked is how you end up with sixty nappies you don't need and no phone charger.</p>
<h2>For the mother, after a C-section</h2>
<ul>
<li><strong>High-waisted knickers,</strong> several pairs, dark, sized well above the incision line. This is the single most-recommended item and the most commonly forgotten.</li>
<li>Loose clothing that doesn't sit on the scar. Nothing with a waistband.</li>
<li>Maternity pads \u2014 confirm the quantity with the hospital, but plan for more than you think.</li>
<li>Slip-on shoes. Bending is not on the menu.</li>
<li>Toiletries, lip balm, hair ties.</li>
<li>Documents, insurance paperwork, and a written list of current medications.</li>
<li>A long phone charging cable. Hospital sockets are never where the bed is.</li>
</ul>
<h2>For the supporting parent</h2>
<p>Pack an actual bag rather than assuming you'll pop home. With surgery and a possible NICU admission, "popping home" may not happen for a while.</p>
<ul>
<li>Change of clothes, toiletries, and something comfortable to sleep in a chair in.</li>
<li>Your own charger and cable.</li>
<li>Snacks and a water bottle \u2014 hospital catering does not include you.</li>
<li>Cash and cards, including small change for parking and machines.</li>
<li>The documents, if you're the one doing the admin.</li>
</ul>
<h2>What changes if the baby goes to NICU</h2>
<div class="quiet">This is the rewrite people don't see coming. A NICU admission reduces some of what you'd pack and makes other things far more important.</div>
<ul>
<li><strong>Less newborn clothing and fewer nappies</strong> immediately \u2014 the unit typically handles this, and tiny babies may not be dressed at first.</li>
<li><strong>Pumping supplies become the priority.</strong> Ask the unit what it supplies, what it requires, and how expressed milk must be labelled and stored.</li>
<li><strong>Labels.</strong> For bottles, for containers, for everything.</li>
<li><strong>A notebook.</strong> You'll be given numbers, times and names constantly, and you will not remember them.</li>
<li>Ask about visiting hours, who is allowed in, and what the unit needs from you.</li>
<li>Comfortable clothing for long sitting, and layers \u2014 units are often kept warm.</li>
</ul>
<p>Ask the NICU directly what they supply and what they want from you. They answer this question several times a week and they'd much rather answer it before than after.</p>`,
  callout:{title:"Ask the hospital these, in advance",items:[
    "What does the package include \u2014 pads, nappies, gowns, formula?",
    "How long is the standard stay after a C-section, and what does extending cost?",
    "If the baby goes to NICU, what does the unit supply?",
    "What are the rules for expressed milk \u2014 labelling, storage, transport?",
    "Visiting hours, and who is permitted in the unit"]},
  panel:{
    eyebrow:"Getting Ready \u2022 Third trimester",
    normal:{title:"Mother \u2014 C-section",items:[
      "High-waisted knickers, several pairs","Loose clothes, no waistbands",
      "Maternity pads","Slip-on shoes","Documents and medication list",
      "A long charging cable"]},
    warn:{title:"Supporting parent",items:[
      "A real overnight bag, not an optimistic one","Own charger",
      "Snacks and water","Cash for parking and machines"]},
    helped:{title:"If NICU is possible",items:[
      "Fewer clothes and nappies at first","Pumping supplies and labels",
      "A notebook for numbers and names","Ask the unit what it supplies"]},
    quick:"Confirm what the hospital provides before buying quantities. Pack a genuine bag for the partner. If NICU is a possibility, swap baby clothes for pumping kit, labels and a notebook."
  },
  originalQuestions:[
    "Requested a C-section bag for wife and husband (15 July 2025)",
    "Asked how many maternity pads and nappies were needed (15 July 2025)",
    "Asked what changed if the baby was in NICU and requested a revised list (15 July 2025)"],
  sources:["RAW-20250715-68768350-01","RAW-20250715-68768350-05"],
  medical:false,
  related:["waters-breaking-without-pain","flying-late-pregnancy","pelvic-pressure-pregnancy"]
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

function cardHTML(g){
  return `<a class="card" href="guide.html?id=${g.id}">
    <div class="card-icon" aria-hidden="true">${iconFor(g)}</div>
    <div class="card-text">
      <h3>${g.title}</h3>
      <p class="card-meta"><span class="topic">${topicById(g.topic).label}</span><span class="dot">•</span><span>${g.read} min read</span></p>
    </div>
  </a>`;
}

function guideById(id){ return GUIDES.find(g => g.id === id); }

/* Expose data + helpers for the Studio and data layer (non-breaking:
   pages still use the lexical globals; this just mirrors them on window). */
try{
  if(typeof window !== "undefined"){
    window.GUIDES = GUIDES; window.AGES = AGES; window.TOPICS = TOPICS;
    window.ICONS = ICONS; window.topicById = topicById;
    window.guideById = guideById; window.cardHTML = cardHTML;
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
