"use client";

import { useCallback, useEffect, useState } from "react";

const field =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200";
const label = "text-xs font-semibold uppercase tracking-wide text-slate-500";
const card = "rounded-2xl border border-slate-300 bg-white p-5 shadow-sm";
const btn =
  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";
const primary = `${btn} border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800`;
const ghost = `${btn} border-slate-300 bg-white text-slate-700 hover:border-slate-400`;

const PROFILE_FIELDS = [
  ["name", "Name", "input"],
  ["role", "Role", "input"],
  ["location", "Location", "input"],
  ["availability", "Availability", "input"],
  ["email", "Email", "input"],
  ["github", "GitHub URL", "input"],
  ["linkedin", "LinkedIn URL", "input"],
  ["tagline", "Hero tagline", "textarea"],
  ["about", "About paragraph", "textarea"]
];

const SECTION_FIELDS = [
  ["projectsSubtitle", "Projects subtitle"],
  ["contactIntro", "Contact intro"],
  ["cvIntro", "CV section intro"]
];

export default function AdminPage() {
  const [content, setContent] = useState(null);
  const [sha, setSha] = useState(null);
  const [branch, setBranch] = useState("");
  const [status, setStatus] = useState({ kind: "loading", text: "Loading content..." });

  const load = useCallback(async () => {
    setStatus({ kind: "loading", text: "Loading content..." });
    try {
      const response = await fetch("/api/content", { headers: { accept: "application/json" } });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        setStatus({ kind: "error", text: result.error ?? `Couldn't load content (${response.status}).` });
        return;
      }
      setContent(result.content);
      setSha(result.sha);
      setBranch(result.branch ?? "");
      setStatus({ kind: "idle", text: "" });
    } catch {
      setStatus({ kind: "error", text: "Network error loading content." });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setStatus({ kind: "saving", text: "Saving..." });
    try {
      const response = await fetch("/api/content", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content, sha })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        setStatus({ kind: "error", text: result.error ?? `Save failed (${response.status}).` });
        return;
      }
      setSha(result.sha);
      setStatus({
        kind: "saved",
        text: `${result.message}${result.commit ? ` (commit ${result.commit})` : ""}`
      });
    } catch {
      setStatus({ kind: "error", text: "Network error while saving." });
    }
  };

  // Immutable updates keyed by path so every editor below stays a one-liner.
  const setPath = (path, value) =>
    setContent((prev) => {
      const next = structuredClone(prev);
      let node = next;
      for (const key of path.slice(0, -1)) node = node[key];
      node[path[path.length - 1]] = value;
      return next;
    });

  const setList = (key, updater) =>
    setContent((prev) => {
      const next = structuredClone(prev);
      next[key] = updater(next[key]);
      return next;
    });

  if (!content) {
    return (
      <main className="mx-auto grid min-h-screen w-[min(760px,92vw)] place-items-center">
        <p className={status.kind === "error" ? "text-red-700" : "text-slate-600"}>{status.text}</p>
      </main>
    );
  }

  const dirty = status.kind === "idle" || status.kind === "error";

  return (
    <main className="mx-auto w-[min(980px,94vw)] py-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Site content</h1>
          <p className="mt-1 text-sm text-slate-600">
            Saving commits <code className="rounded bg-slate-100 px-1">app/content.json</code>
            {branch ? (
              <>
                {" "}
                to <code className="rounded bg-slate-100 px-1">{branch}</code>
              </>
            ) : null}{" "}
            and rebuilds the site.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className={ghost} onClick={load} disabled={status.kind === "saving"}>
            Reload
          </button>
          <button type="button" className={primary} onClick={save} disabled={status.kind === "saving"}>
            {status.kind === "saving" ? "Saving..." : "Save & publish"}
          </button>
        </div>
      </header>

      {status.text ? (
        <p
          role="status"
          aria-live="polite"
          className={`mb-6 rounded-xl border px-4 py-3 text-sm font-medium ${
            status.kind === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {status.text}
        </p>
      ) : null}

      <div className="grid gap-5">
        {/* ---------------- profile ---------------- */}
        <section className={card}>
          <h2 className="mb-4 text-lg font-semibold">Profile</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {PROFILE_FIELDS.map(([key, text, kind]) => (
              <div key={key} className={`grid gap-1 ${kind === "textarea" ? "sm:col-span-2" : ""}`}>
                <label className={label} htmlFor={`profile-${key}`}>
                  {text}
                </label>
                {kind === "textarea" ? (
                  <textarea
                    id={`profile-${key}`}
                    className={field}
                    rows={key === "about" ? 5 : 3}
                    value={content.profile[key]}
                    onChange={(e) => setPath(["profile", key], e.target.value)}
                  />
                ) : (
                  <input
                    id={`profile-${key}`}
                    className={field}
                    value={content.profile[key]}
                    onChange={(e) => setPath(["profile", key], e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- highlights ---------------- */}
        <section className={card}>
          <h2 className="mb-1 text-lg font-semibold">Highlights</h2>
          <p className="mb-4 text-xs text-slate-500">
            Shown in About and Work Experience. Numbers you can defend beat vague labels.
          </p>
          <div className="grid gap-3">
            {content.highlights.map((item, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[180px_1fr_auto]">
                <input
                  aria-label={`Highlight ${i + 1} metric`}
                  className={field}
                  value={item.metric}
                  onChange={(e) => setPath(["highlights", i, "metric"], e.target.value)}
                />
                <input
                  aria-label={`Highlight ${i + 1} label`}
                  className={field}
                  value={item.label}
                  onChange={(e) => setPath(["highlights", i, "label"], e.target.value)}
                />
                <button
                  type="button"
                  className={ghost}
                  onClick={() => setList("highlights", (l) => l.filter((_, j) => j !== i))}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          {content.highlights.length < 6 ? (
            <button
              type="button"
              className={`${ghost} mt-3`}
              onClick={() => setList("highlights", (l) => [...l, { metric: "", label: "" }])}
            >
              Add highlight
            </button>
          ) : null}
        </section>

        {/* ---------------- experience ---------------- */}
        <section className={card}>
          <h2 className="mb-4 text-lg font-semibold">Experience</h2>
          <div className="grid gap-5">
            {content.experience.map((job, i) => (
              <div key={i} className="grid gap-3 rounded-xl border border-slate-200 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ["company", "Company"],
                    ["location", "Location"],
                    ["role", "Role"],
                    ["period", "Period"]
                  ].map(([key, text]) => (
                    <div key={key} className="grid gap-1">
                      <label className={label} htmlFor={`exp-${i}-${key}`}>
                        {text}
                      </label>
                      <input
                        id={`exp-${i}-${key}`}
                        className={field}
                        value={job[key]}
                        onChange={(e) => setPath(["experience", i, key], e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                <div className="grid gap-2">
                  <span className={label}>Responsibilities</span>
                  {job.responsibilities.map((line, j) => (
                    <div key={j} className="grid gap-2 sm:grid-cols-[1fr_auto]">
                      <textarea
                        aria-label={`Responsibility ${j + 1}`}
                        className={field}
                        rows={2}
                        value={line}
                        onChange={(e) =>
                          setPath(["experience", i, "responsibilities", j], e.target.value)
                        }
                      />
                      <button
                        type="button"
                        className={ghost}
                        onClick={() =>
                          setList("experience", (l) => {
                            l[i].responsibilities = l[i].responsibilities.filter((_, k) => k !== j);
                            return l;
                          })
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className={ghost}
                    onClick={() =>
                      setList("experience", (l) => {
                        l[i].responsibilities = [...l[i].responsibilities, ""];
                        return l;
                      })
                    }
                  >
                    Add responsibility
                  </button>
                </div>

                {content.experience.length > 1 ? (
                  <button
                    type="button"
                    className={ghost}
                    onClick={() => setList("experience", (l) => l.filter((_, j) => j !== i))}
                  >
                    Remove this role
                  </button>
                ) : null}
              </div>
            ))}
          </div>
          <button
            type="button"
            className={`${ghost} mt-3`}
            onClick={() =>
              setList("experience", (l) => [
                ...l,
                { company: "", location: "", role: "", period: "", responsibilities: [""] }
              ])
            }
          >
            Add role
          </button>
        </section>

        {/* ---------------- skills ---------------- */}
        <section className={card}>
          <h2 className="mb-1 text-lg font-semibold">Technical skills</h2>
          <p className="mb-4 text-xs text-slate-500">
            Group must match a filter key: {content.skillFilters.map((f) => f.key).join(", ")}
          </p>
          <div className="grid gap-2">
            {content.skills.map((skill, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[1fr_140px_140px_auto]">
                <input
                  aria-label={`Skill ${i + 1} name`}
                  className={field}
                  value={skill.name}
                  onChange={(e) => setPath(["skills", i, "name"], e.target.value)}
                />
                <input
                  aria-label={`Skill ${i + 1} group`}
                  className={field}
                  value={skill.group}
                  onChange={(e) => setPath(["skills", i, "group"], e.target.value)}
                />
                <input
                  aria-label={`Skill ${i + 1} icon`}
                  className={field}
                  value={skill.icon}
                  onChange={(e) => setPath(["skills", i, "icon"], e.target.value)}
                />
                <button
                  type="button"
                  className={ghost}
                  onClick={() => setList("skills", (l) => l.filter((_, j) => j !== i))}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className={`${ghost} mt-3`}
            onClick={() =>
              setList("skills", (l) => [...l, { name: "", group: "automation", icon: "automation" }])
            }
          >
            Add skill
          </button>
        </section>

        {/* ---------------- competencies & pillars ---------------- */}
        <section className={card}>
          <h2 className="mb-4 text-lg font-semibold">Competencies</h2>
          <div className="grid gap-2">
            {content.competencies.map((item, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[1fr_160px_auto]">
                <input
                  aria-label={`Competency ${i + 1} title`}
                  className={field}
                  value={item.title}
                  onChange={(e) => setPath(["competencies", i, "title"], e.target.value)}
                />
                <input
                  aria-label={`Competency ${i + 1} icon`}
                  className={field}
                  value={item.icon}
                  onChange={(e) => setPath(["competencies", i, "icon"], e.target.value)}
                />
                <button
                  type="button"
                  className={ghost}
                  onClick={() => setList("competencies", (l) => l.filter((_, j) => j !== i))}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className={`${ghost} mt-3`}
            onClick={() => setList("competencies", (l) => [...l, { title: "", icon: "planning" }])}
          >
            Add competency
          </button>

          <h2 className="mb-3 mt-6 text-lg font-semibold">Pillars</h2>
          <div className="grid gap-3">
            {content.pillars.map((pillar, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[160px_1fr_140px]">
                <input
                  aria-label={`Pillar ${i + 1} label`}
                  className={field}
                  value={pillar.label}
                  onChange={(e) => setPath(["pillars", i, "label"], e.target.value)}
                />
                <input
                  aria-label={`Pillar ${i + 1} description`}
                  className={field}
                  value={pillar.desc}
                  onChange={(e) => setPath(["pillars", i, "desc"], e.target.value)}
                />
                <input
                  aria-label={`Pillar ${i + 1} icon`}
                  className={field}
                  value={pillar.icon}
                  onChange={(e) => setPath(["pillars", i, "icon"], e.target.value)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- education ---------------- */}
        <section className={card}>
          <h2 className="mb-4 text-lg font-semibold">Education</h2>
          <div className="grid gap-4">
            {content.education.map((item, i) => (
              <div key={i} className="grid gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
                {[
                  ["school", "School"],
                  ["period", "Period"],
                  ["program", "Program"],
                  ["location", "Location"]
                ].map(([key, text]) => (
                  <div key={key} className="grid gap-1">
                    <label className={label} htmlFor={`edu-${i}-${key}`}>
                      {text}
                    </label>
                    <input
                      id={`edu-${i}-${key}`}
                      className={field}
                      value={item[key]}
                      onChange={(e) => setPath(["education", i, key], e.target.value)}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  className={`${ghost} sm:col-span-2 sm:justify-self-start`}
                  onClick={() => setList("education", (l) => l.filter((_, j) => j !== i))}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className={`${ghost} mt-3`}
            onClick={() =>
              setList("education", (l) => [...l, { school: "", period: "", program: "", location: "" }])
            }
          >
            Add education
          </button>
        </section>

        {/* ---------------- section copy ---------------- */}
        <section className={card}>
          <h2 className="mb-4 text-lg font-semibold">Section copy</h2>
          <div className="grid gap-3">
            {SECTION_FIELDS.map(([key, text]) => (
              <div key={key} className="grid gap-1">
                <label className={label} htmlFor={`sections-${key}`}>
                  {text}
                </label>
                <textarea
                  id={`sections-${key}`}
                  className={field}
                  rows={2}
                  value={content.sections[key]}
                  onChange={(e) => setPath(["sections", key], e.target.value)}
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 flex items-center gap-2">
        <button type="button" className={primary} onClick={save} disabled={status.kind === "saving"}>
          {status.kind === "saving" ? "Saving..." : "Save & publish"}
        </button>
        <a className={ghost} href="/">
          View site
        </a>
      </div>
      {dirty ? null : <p className="mt-2 text-xs text-slate-500">Reload to fetch the latest saved copy.</p>}
    </main>
  );
}
