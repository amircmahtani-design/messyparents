/* ----------------------------------------------------------------------------
   Illustration generator UI — hooks into the 4-stage server pipeline.
   Nothing here decides what a good image looks like; the server does that.
   This UI job:
     • Kick off the pipeline
     • Poll Firestore for job status
     • Show the pending image, the QA verdict, and the editable brief
     • Approve/Reject/Regenerate/Edit-brief actions
     • On Approve: copy from guides-pending/ to the guide's real hero URL
--------------------------------------------------------------------------- */

let genState = { jobId: null, url: null, brief: null, qa: null, unsub: null };

function genShowStage(stage) {
  // stage: "idle" | "working" | "review"
  const isReview = stage === "review";
  $("#genEditBriefBtn").classList.toggle("hidden", stage !== "review");
  $("#genRegenBtn").classList.toggle("hidden",    stage !== "review");
  $("#genApproveBtn").classList.toggle("hidden",  stage !== "review");
  $("#genRejectBtn").classList.toggle("hidden",   stage !== "review");
  $("#genBtn").disabled = (stage === "working");
  $("#genPreviewWrap").classList.toggle("hidden", stage !== "review");
  $("#genBriefWrap").classList.toggle("hidden",   stage !== "review");
}

function genRenderReview(d) {
  genState = { ...genState, url: d.url, brief: d.brief, qa: d.qa };
  $("#genPreviewImg").src = d.url;
  $("#genQAPre").textContent = JSON.stringify(d.qa || {}, null, 2);
  $("#genBriefTA").value      = JSON.stringify(d.brief || {}, null, 2);
  const flag = d.status === "awaiting-approval-with-issues"
    ? "⚠ QA flagged issues — review carefully before approving."
    : "✓ Ready for your approval.";
  $("#genMsg").textContent = flag + " Attempts: " + (d.attempts || 1);
  genShowStage("review");
}

async function startGeneration(briefOverride) {
  const g = draftGuide();
  const msg = $("#genMsg");
  const refsBase = location.origin + "/assets/img/refs";
  const { fs, db } = state.fb;

  // Persist guide content so the planner has real text to work from
  try { await fs.setDoc(fs.doc(db, "guides", g.id), g, { merge: true }); } catch(_) {}

  genShowStage("working");
  msg.textContent = "Planning the scene…";

  // Subscribe to job status
  const jobRef = fs.doc(db, "illustration_jobs", g.id);
  if (genState.unsub) { try { genState.unsub(); } catch(_) {} }
  let first = true;
  genState.unsub = fs.onSnapshot(jobRef, snap => {
    const d = snap.data(); if (!d) return;
    if (first) { first = false; if (!["planning","generating","reviewing"].includes(d.status)) return; }
    if (d.status === "planning")   msg.textContent = "Planning the scene…";
    if (d.status === "generating") msg.textContent = "Drawing (attempt " + (d.attempt || 1) + ")…";
    if (d.status === "reviewing")  msg.textContent = "Reviewing for brand fidelity…";
    if (d.status === "awaiting-approval" || d.status === "awaiting-approval-with-issues") {
      try { genState.unsub(); } catch(_) {}
      genRenderReview(d);
    }
    if (d.status === "error") {
      try { genState.unsub(); } catch(_) {}
      msg.textContent = "Failed: " + (d.error || "generation error");
      genShowStage("idle");
    }
  });

  try {
    await fetch("/.netlify/functions/generate-illustration-background", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ guideId: g.id, refsBase, briefOverride: briefOverride || null })
    });
  } catch (e) {
    msg.textContent = "Could not start: " + (e.message || e);
    genShowStage("idle");
  }

  // Safety timeout — if nothing happens for 6 minutes, unstick the UI
  setTimeout(() => {
    if (!genState.url) {
      try { genState.unsub && genState.unsub(); } catch(_) {}
      if ($("#genBtn").disabled) {
        msg.textContent = "Still working after 6 min. Reopen this guide shortly — the job may finish in the background.";
        genShowStage("idle");
      }
    }
  }, 360000);
}

async function approvePendingIllustration() {
  const msg = $("#genMsg");
  if (!genState.url) return;
  msg.textContent = "Approving…";
  try {
    // Simply set the guide's hero to the pending URL. It's already public in Storage.
    $("#f_hero").value = genState.url;
    pushPreview();
    msg.textContent = "Approved ✓ — click Save at the top to keep it on the guide.";
    // Once approved, hide the review controls; the pending image is now the guide hero.
    genShowStage("idle");
  } catch (e) {
    msg.textContent = "Approve failed: " + (e.message || e);
  }
}

function rejectPendingIllustration() {
  genState.url = null; genState.brief = null; genState.qa = null;
  $("#genPreviewImg").removeAttribute("src");
  $("#genQAPre").textContent = "";
  $("#genBriefTA").value = "";
  $("#genMsg").textContent = "Rejected. Nothing was attached to the guide.";
  genShowStage("idle");
}

/* Wire up buttons — call once at boot, or paste inline after existing listeners */
function wireIllustrationButtons() {
  const b = document.getElementById("genBtn"); if (!b) return;
  b.addEventListener("click", () => startGeneration(null));
  $("#genRegenBtn").addEventListener("click", () => startGeneration(genState.brief));
  $("#genEditBriefBtn").addEventListener("click", () => {
    try {
      const edited = JSON.parse($("#genBriefTA").value);
      startGeneration(edited);
    } catch (e) {
      $("#genMsg").textContent = "Brief is not valid JSON: " + (e.message || e);
    }
  });
  $("#genApproveBtn").addEventListener("click", approvePendingIllustration);
  $("#genRejectBtn").addEventListener("click", rejectPendingIllustration);
}
wireIllustrationButtons();
