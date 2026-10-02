const STORAGE_KEY = "ib-prep-done-v2";

/** @type {{id:string,title:string,section:string,mins:number}[]} */
let lessons = [];
let currentId = null;

const $ = (sel) => document.querySelector(sel);

function loadDone() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function saveDone(set) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

function updateProgress() {
  const done = loadDone();
  const pct = lessons.length ? Math.round((done.size / lessons.length) * 100) : 0;
  $("#progress-text").textContent = `${pct}%`;
  $("#progress-fill").style.width = `${pct}%`;
  document.querySelectorAll(".nav a").forEach((a) => {
    a.classList.toggle("done", done.has(a.dataset.id));
  });
  const mark = $("#mark-done");
  if (currentId) {
    const isDone = done.has(currentId);
    mark.textContent = isDone ? "✓ Done" : "Mark done";
    mark.classList.toggle("done-state", isDone);
  }
}

function renderNav() {
  const nav = $("#nav");
  nav.innerHTML = "";
  let lastSection = null;
  for (const lesson of lessons) {
    if (lesson.section !== lastSection) {
      const h = document.createElement("div");
      h.className = "nav-section";
      h.textContent = lesson.section;
      nav.appendChild(h);
      lastSection = lesson.section;
    }
    const a = document.createElement("a");
    a.href = `#/${lesson.id}`;
    a.dataset.id = lesson.id;
    a.innerHTML = `<span class="dot"></span><span>${lesson.title}<span class="nav-meta">${lesson.mins} min</span></span>`;
    if (lesson.id === currentId) a.classList.add("active");
    nav.appendChild(a);
  }
  updateProgress();
}

function decorateCallouts(root) {
  root.querySelectorAll("blockquote").forEach((bq) => {
    const text = bq.textContent || "";
    if (/^\s*ELI5:/i.test(text) || bq.querySelector("strong")?.textContent?.match(/^ELI5/i)) {
      bq.classList.add("eli5");
    } else if (/Interview tip/i.test(text)) {
      bq.classList.add("tip");
    } else if (/On your resume/i.test(text)) {
      bq.classList.add("resume");
    }
  });
}

async function loadLesson(id) {
  currentId = id;
  const meta = lessons.find((l) => l.id === id);
  $("#crumbs").textContent = meta
    ? `${meta.section} · ${meta.title} · ~${meta.mins} min`
    : id;

  renderNav();
  closeSidebar();

  const article = $("#lesson");
  article.innerHTML = `<p class="muted">Loading…</p>`;

  try {
    const res = await fetch(`/content/${id}.md`, { cache: "no-cache" });
    if (!res.ok) throw new Error(`Missing ${id}.md`);
    const md = await res.text();
    article.innerHTML = marked.parse(md);
    decorateCallouts(article);
    article.querySelectorAll("a[href^='#/']").forEach((a) => {
      a.addEventListener("click", () => {});
    });
  } catch (e) {
    article.innerHTML = `<h1>Could not load lesson</h1><p>${e.message}</p>`;
  }

  const idx = lessons.findIndex((l) => l.id === id);
  const prev = $("#prev");
  const next = $("#next");
  if (idx > 0) {
    prev.href = `#/${lessons[idx - 1].id}`;
    prev.classList.remove("disabled");
    prev.textContent = `← ${lessons[idx - 1].title}`;
  } else {
    prev.classList.add("disabled");
    prev.textContent = "← Previous";
  }
  if (idx >= 0 && idx < lessons.length - 1) {
    next.href = `#/${lessons[idx + 1].id}`;
    next.classList.remove("disabled");
    next.textContent = `${lessons[idx + 1].title} →`;
  } else {
    next.classList.add("disabled");
    next.textContent = "Next →";
  }

  window.scrollTo(0, 0);
  updateProgress();
}

function route() {
  const hash = location.hash.replace(/^#\/?/, "");
  const id = hash || lessons[0]?.id || "00-start-here";
  loadLesson(id);
}

function openSidebar() {
  $("#sidebar").classList.add("open");
  $("#overlay").classList.add("open");
}
function closeSidebar() {
  $("#sidebar").classList.remove("open");
  $("#overlay").classList.remove("open");
}

async function main() {
  marked.setOptions({ gfm: true, breaks: false });
  const res = await fetch("/content/manifest.json");
  lessons = await res.json();

  $("#menu-btn").addEventListener("click", openSidebar);
  $("#overlay").addEventListener("click", closeSidebar);
  $("#mark-done").addEventListener("click", () => {
    if (!currentId) return;
    const done = loadDone();
    if (done.has(currentId)) done.delete(currentId);
    else done.add(currentId);
    saveDone(done);
    updateProgress();
  });
  $("#reset-progress").addEventListener("click", () => {
    if (confirm("Reset all study progress?")) {
      localStorage.removeItem(STORAGE_KEY);
      updateProgress();
    }
  });

  window.addEventListener("hashchange", route);
  route();
}

main();
