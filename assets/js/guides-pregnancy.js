/* ==========================================================================
   The Messy Parents Collection — pregnancy add-on
   ---------------------------------------------------------------------------
   Loads AFTER assets/js/guides.js and BEFORE assets/js/mpc-store.js.
   It does not modify the original 16 guides or any existing slug.

   What it does:
     1. Adds four pre-birth stages to the front of AGES.
     2. Adds one new topic, "getting-ready".
     3. Appends this batch of pregnancy guides to GUIDES.

   Adding a batch later: append to PREGNANCY_GUIDES below. Nothing else changes.
   ========================================================================== */
(function () {
  "use strict";

  /* --- 1. Pre-birth stages ------------------------------------------------
     The age pills on guides.html render straight from AGES, and searchGuides
     filters on g.ages.includes(age), so the new stages appear and filter with
     no code changes anywhere else. */
  var PRE_BIRTH = ["Before baby", "First trimester", "Second trimester", "Third trimester"];
  if (typeof AGES !== "undefined" && Array.isArray(AGES) && AGES.indexOf(PRE_BIRTH[0]) === -1) {
    Array.prototype.unshift.apply(AGES, PRE_BIRTH);
  }

  /* --- 2. One new topic ---------------------------------------------------
     Kit, nursery, hospital bags and paperwork genuinely do not belong under
     feeding / sleeping / development / health / sanity. Everything else
     pregnancy-related reuses the five topics that already exist, so the
     taxonomy stays small.

     No icon file exists yet — iconFor() falls back gracefully. Generate
     assets/img/icons/getting-ready.webp in Studio when convenient and this
     picks it up automatically. */
  if (typeof ICONS !== "undefined" && !ICONS["getting-ready"]) {
    ICONS["getting-ready"] =
      '<img src="assets/img/icons/getting-ready.webp" alt="" aria-hidden="true" ' +
      'onerror="this.replaceWith(document.createTextNode(\'\u2b50\'))">';
  }
  if (typeof TOPICS !== "undefined" && Array.isArray(TOPICS) &&
      !TOPICS.some(function (t) { return t.id === "getting-ready"; })) {
    TOPICS.push({ id: "getting-ready", label: "Getting Ready", icon: ICONS["getting-ready"] });
  }

  /* --- 3. The guides ------------------------------------------------------ */

  var PREGNANCY_GUIDES = [

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

  /* --- Append, never overwrite -------------------------------------------- */
  if (typeof GUIDES !== "undefined" && Array.isArray(GUIDES)) {
    var have = {};
    GUIDES.forEach(function (g) { have[g.id] = true; });
    PREGNANCY_GUIDES.forEach(function (g) { if (!have[g.id]) GUIDES.push(g); });
    try { if (typeof window !== "undefined") window.GUIDES = GUIDES; } catch (e) {}
  }
})();
