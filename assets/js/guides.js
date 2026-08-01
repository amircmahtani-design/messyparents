/* ==========================================================================
   The Messy Parents Collection — content + shared UI
   Add a new guide: copy a block in GUIDES and change the fields.
   ========================================================================== */

const AGES = ["0–1 month","2–3 months","4–6 months","7–9 months","10–12 months","12–18 months","18–24 months"];

const ICONS = {
  feeding:     `<img src="assets/img/icons/feeding.webp" alt="" aria-hidden="true">`,
  sleeping:    `<img src="assets/img/icons/sleeping.webp" alt="" aria-hidden="true">`,
  development: `<img src="assets/img/icons/development.webp" alt="" aria-hidden="true">`,
  health:      `<img src="assets/img/icons/health.webp" alt="" aria-hidden="true">`,
  sanity:      `<img src="assets/img/icons/sanity.webp" alt="" aria-hidden="true">`
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

const GUIDES = [
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
  related:["touched-out","splitting-nights"]
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
    const onScroll = () => head.classList.toggle("is-stuck", window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, {passive:true});
  }
});
