"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const GITHUB_USERNAME = "rays63";
const PROJECT_LIMIT = 6;

const skillItems = [
  { name: "Selenium + Cypress", level: "90%", group: "automation" },
  { name: "API Testing (Postman/REST Assured)", level: "85%", group: "automation" },
  { name: "Test Case Design", level: "92%", group: "manual" },
  { name: "Exploratory Testing", level: "88%", group: "manual" },
  { name: "Jira + TestRail", level: "87%", group: "tools" },
  { name: "CI/CD (GitHub Actions/Jenkins)", level: "80%", group: "tools" }
];

const extractReadmeSummary = (readmeText, fallback) => {
  if (!readmeText) return fallback;

  const lines = readmeText.split("\n").map((line) => line.trim());
  const cleanLines = lines.filter((line) => {
    if (!line) return false;
    if (line.startsWith("#")) return false;
    if (line.startsWith("![")) return false;
    if (line.startsWith("[") && line.includes("]:")) return false;
    if (line.startsWith("---")) return false;
    return true;
  });

  const summary = cleanLines.find((line) => /[a-zA-Z]/.test(line));
  if (!summary) return fallback;
  return summary.length > 160 ? `${summary.slice(0, 157)}...` : summary;
};

const fetchReadmeSummary = async (owner, repoName, fallback) => {
  try {
    const readmeResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/readme`, {
      headers: { Accept: "application/vnd.github.raw+json" }
    });

    if (!readmeResponse.ok) return fallback;
    const rawReadme = await readmeResponse.text();
    return extractReadmeSummary(rawReadme, fallback);
  } catch {
    return fallback;
  }
};

const pillButton =
  "inline-flex min-h-10 items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5";
const primaryButton = `${pillButton} border-emerald-700 bg-emerald-700 text-white shadow-[0_10px_26px_rgba(11,110,79,0.3)] hover:bg-emerald-800`;
const outlineButton = `${pillButton} border-emerald-700/45 bg-white/90 text-emerald-800 shadow-[0_8px_20px_rgba(16,21,37,0.08)] hover:border-emerald-700`;

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [projects, setProjects] = useState([]);
  const [projectsStatus, setProjectsStatus] = useState("Loading projects...");
  const cursorLensRef = useRef(null);

  const filteredSkills = useMemo(() => {
    if (activeFilter === "all") return skillItems;
    return skillItems.filter((item) => item.group === activeFilter);
  }, [activeFilter]);

  useEffect(() => {
    const revealEls = document.querySelectorAll(".reveal");
    const navLinks = document.querySelectorAll(".nav-link");

    const revealOnScroll = () => {
      const threshold = window.innerHeight * 0.88;
      revealEls.forEach((el, index) => {
        const top = el.getBoundingClientRect().top;
        if (top < threshold) {
          window.setTimeout(() => el.classList.add("visible"), index * 70);
        }
      });
    };

    const setActiveNav = () => {
      const scrollY = window.scrollY;
      navLinks.forEach((link) => {
        const href = link.getAttribute("href") || "";
        if (!href.startsWith("#")) return;
        const target = document.querySelector(href);
        if (!target) return;
        const start = target.offsetTop - 120;
        const end = start + target.offsetHeight;
        const active = scrollY >= start && scrollY < end;
        link.classList.toggle("active", active);
      });
    };

    const onScroll = () => {
      revealOnScroll();
      setActiveNav();
    };

    window.addEventListener("scroll", onScroll);
    revealOnScroll();
    setActiveNav();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const canvas = document.getElementById("particles-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dots = [];
    let animationFrameId = null;
    const cursor = { x: null, y: null, radius: 140 };
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const density = Math.max(55, Math.floor((canvas.width * canvas.height) / 11000));

      dots = Array.from({ length: density }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 1.8 + 1.2
      }));
    };

    const drawLine = (x1, y1, x2, y2, opacity) => {
      ctx.strokeStyle = `rgba(11, 110, 79, ${opacity})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    };

    const drawBug = (x, y, scale = 1) => {
      const bodyW = 6 * scale;
      const bodyH = 8 * scale;
      const headR = 2.1 * scale;
      const leg = 3.5 * scale;

      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = "#b45309";
      ctx.strokeStyle = "#92400e";
      ctx.lineWidth = 1;

      // Body
      ctx.beginPath();
      ctx.ellipse(0, 0.5 * scale, bodyW / 2, bodyH / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Head
      ctx.beginPath();
      ctx.arc(0, -4.8 * scale, headR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Legs
      for (let i = -1; i <= 1; i += 1) {
        const yOffset = i * 2 * scale;
        ctx.beginPath();
        ctx.moveTo(-2.3 * scale, yOffset);
        ctx.lineTo(-2.3 * scale - leg, yOffset - 1.5 * scale);
        ctx.moveTo(2.3 * scale, yOffset);
        ctx.lineTo(2.3 * scale + leg, yOffset - 1.5 * scale);
        ctx.stroke();
      }

      // Antennae
      ctx.beginPath();
      ctx.moveTo(-0.7 * scale, -6.2 * scale);
      ctx.lineTo(-2.2 * scale, -8.4 * scale);
      ctx.moveTo(0.7 * scale, -6.2 * scale);
      ctx.lineTo(2.2 * scale, -8.4 * scale);
      ctx.stroke();

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      dots.forEach((dot, i) => {
        dot.x += dot.vx;
        dot.y += dot.vy;

        if (dot.x <= 0 || dot.x >= canvas.width) dot.vx *= -1;
        if (dot.y <= 0 || dot.y >= canvas.height) dot.vy *= -1;

        let drawAsBug = false;
        if (cursor.x !== null && cursor.y !== null) {
          const hx = dot.x - cursor.x;
          const hy = dot.y - cursor.y;
          const hoverDist = Math.sqrt(hx * hx + hy * hy);
          drawAsBug = hoverDist < 14;
        }

        if (drawAsBug) {
          drawBug(dot.x, dot.y, 0.9);
        } else {
          ctx.fillStyle = "rgba(11, 110, 79, 0.65)";
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
          ctx.fill();
        }

        for (let j = i + 1; j < dots.length; j += 1) {
          const other = dots[j];
          const dx = dot.x - other.x;
          const dy = dot.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 110;
          if (dist < maxDist) {
            drawLine(dot.x, dot.y, other.x, other.y, ((maxDist - dist) / maxDist) * 0.35);
          }
        }

        if (cursor.x !== null && cursor.y !== null) {
          const cx = dot.x - cursor.x;
          const cy = dot.y - cursor.y;
          const cDist = Math.sqrt(cx * cx + cy * cy);
          if (cDist < cursor.radius) {
            drawLine(dot.x, dot.y, cursor.x, cursor.y, ((cursor.radius - cDist) / cursor.radius) * 0.55);
          }
        }
      });

      animationFrameId = window.requestAnimationFrame(animate);
    };

    const onResize = () => setCanvasSize();
    const onMouseMove = (event) => {
      cursor.x = event.clientX;
      cursor.y = event.clientY;
    };
    const onMouseOut = () => {
      cursor.x = null;
      cursor.y = null;
    };

    setCanvasSize();
    if (!prefersReducedMotion) animate();

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseout", onMouseOut);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseout", onMouseOut);
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadGitHubProjects = async () => {
      if (!GITHUB_USERNAME || GITHUB_USERNAME === "your-github-username") {
        if (isMounted) {
          setProjectsStatus("Set your GitHub username in app/page.js to load projects here.");
        }
        return;
      }

      try {
        const reposResponse = await fetch(
          `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100&type=owner`
        );

        if (!reposResponse.ok) {
          if (isMounted) setProjectsStatus("Unable to load GitHub projects right now.");
          return;
        }

        const repos = await reposResponse.json();
        const selectedRepos = repos.filter((repo) => !repo.fork).slice(0, PROJECT_LIMIT);

        if (!selectedRepos.length) {
          if (isMounted) setProjectsStatus("No public repositories found for this user.");
          return;
        }

        const loadedProjects = await Promise.all(
          selectedRepos.map(async (repo) => {
            const fallback = repo.description || "No description provided yet.";
            const summary = await fetchReadmeSummary(repo.owner.login, repo.name, fallback);
            return {
              name: repo.name,
              summary,
              url: repo.html_url,
              language: repo.language || "Mixed stack"
            };
          })
        );

        if (isMounted) {
          setProjects(loadedProjects);
          setProjectsStatus("");
        }
      } catch {
        if (isMounted) setProjectsStatus("Failed to load projects. Please try again later.");
      }
    };

    loadGitHubProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!cursorLensRef.current) return;
    const finePointer = window.matchMedia("(any-pointer: fine)").matches;
    if (!finePointer) return;

    const lens = cursorLensRef.current;
    document.body.classList.add("custom-cursor-enabled");
    const interactiveSelector = "a, button, input, textarea, select, [role='button']";

    const setNativeCursorZone = (active) => {
      document.body.classList.toggle("cursor-native-zone", active);
      if (active) {
        lens.classList.remove("is-visible");
      }
    };

    const onMouseMove = (event) => {
      const target = event.target;
      const overInteractive = target instanceof Element && Boolean(target.closest(interactiveSelector));
      setNativeCursorZone(overInteractive);
      if (!overInteractive) {
        lens.classList.add("is-visible");
        lens.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      }
    };

    const onMouseLeaveWindow = () => {
      lens.classList.remove("is-visible");
      setNativeCursorZone(false);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeaveWindow);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeaveWindow);
      document.body.classList.remove("cursor-native-zone");
      document.body.classList.remove("custom-cursor-enabled");
    };
  }, []);

  return (
    <>
      <canvas id="particles-canvas" aria-hidden="true" />
      <div ref={cursorLensRef} className="qa-cursor-lens" aria-hidden="true" />
      <div className="bg-shape bg-shape-1" />
      <div className="bg-shape bg-shape-2" />

      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-300 bg-slate-100/85 px-[6vw] py-4 backdrop-blur-md">
        <a href="#home" className="text-xl font-bold text-slate-900">
          QA<span className="text-emerald-700">Portfolio</span>
        </a>

        <button
          className="rounded border border-slate-300 bg-white px-2 py-1 text-xl text-slate-700 md:hidden"
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen((v) => !v)}
        >
          &#9776;
        </button>

        <nav
          className={`absolute right-[6vw] top-full w-[min(260px,80vw)] flex-col gap-3 rounded-xl border border-slate-300 bg-white p-4 shadow-lg md:static md:flex md:w-auto md:flex-row md:border-0 md:bg-transparent md:p-0 md:shadow-none ${
            menuOpen ? "flex" : "hidden"
          }`}
        >
          {[
            ["about", "About"],
            ["skills", "Skills"],
            ["projects", "Projects"],
            ["experience", "Experience"],
            ["download", "Download CV"],
            ["contact", "Contact"]
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`} className="nav-link" onClick={() => setMenuOpen(false)}>
              {label}
            </a>
          ))}
        </nav>
      </header>

      <main id="home" className="mx-auto w-[min(1000px,92vw)] pb-16 pt-8">
        <section className="reveal py-12">
          <p className="mb-2 font-mono text-sm text-emerald-700">QA Engineer Portfolio</p>
          <h1 className="max-w-[15ch] text-4xl font-bold leading-tight md:text-5xl">Building quality into every release.</h1>
          <p className="mt-4 max-w-2xl text-slate-600">
            I design test strategies, automate regression suites, and keep software stable across fast delivery cycles.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#contact" className={primaryButton}>
              Hire Me
            </a>
            <a href="/cv.pdf" className={outlineButton} download>
              Download CV
            </a>
          </div>
        </section>

        <section id="about" className="reveal py-11">
          <h2 className="mb-4 text-3xl font-semibold">About</h2>
          <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-[0_14px_35px_rgba(16,21,37,0.08)]">
            <p>
              I am a QA Engineer focused on test planning, automation, API validation, and end-to-end product quality. I
              work closely with developers and product teams to catch issues early and deliver reliable user experiences.
            </p>
          </div>
        </section>

        <section id="skills" className="reveal py-11">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-3xl font-semibold">Skills</h2>
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Skill filters">
              {[
                { label: "All", key: "all" },
                { label: "Automation", key: "automation" },
                { label: "Manual QA", key: "manual" },
                { label: "Tools", key: "tools" }
              ].map((filter) => (
                <button
                  key={filter.key}
                  className={`${pillButton} ${
                    activeFilter === filter.key
                      ? "border-transparent bg-emerald-700 text-white shadow-[0_10px_22px_rgba(11,110,79,0.28)]"
                      : "border-slate-300 bg-white text-slate-600 shadow-sm"
                  }`}
                  onClick={() => setActiveFilter(filter.key)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSkills.map((skill) => (
              <article
                className="rounded-xl border border-slate-300 bg-white p-4 shadow-[0_14px_35px_rgba(16,21,37,0.08)]"
                key={skill.name}
              >
                <h3 className="font-semibold">{skill.name}</h3>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-emerald-700 to-amber-500"
                    style={{ width: skill.level }}
                  />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="projects" className="reveal py-11">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-3xl font-semibold">Projects</h2>
            <p className="text-sm text-slate-600">Pulled from GitHub repositories</p>
          </div>

          {projectsStatus ? <div className="mb-3 text-slate-600">{projectsStatus}</div> : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <article
                className="grid gap-3 rounded-xl border border-slate-300 bg-white p-4 shadow-[0_14px_35px_rgba(16,21,37,0.08)]"
                key={project.url}
              >
                <h3 className="font-semibold">{project.name}</h3>
                <p className="text-slate-600">{project.summary}</p>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs text-slate-600">{project.language}</span>
                  <a
                    className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Repo
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="experience" className="reveal py-11">
          <h2 className="mb-4 text-3xl font-semibold">Experience</h2>
          <div className="grid gap-4">
            {[
              {
                time: "2023 - Present",
                title: "Senior QA Engineer",
                desc: "Led automation strategy, reduced regression time by 45%, and improved defect leakage metrics through risk-based testing."
              },
              {
                time: "2021 - 2023",
                title: "QA Engineer",
                desc: "Built API and UI test suites, integrated tests into CI, and collaborated in Agile ceremonies to keep release quality high."
              },
              {
                time: "2019 - 2021",
                title: "Junior Test Analyst",
                desc: "Created manual test cases, executed test cycles, and logged clear bug reports that accelerated issue triage."
              }
            ].map((item) => (
              <article
                key={item.time}
                className="rounded-r-xl border-l-4 border-emerald-700 bg-white px-4 py-3 shadow-[0_14px_35px_rgba(16,21,37,0.08)]"
              >
                <span className="font-mono text-sm text-slate-600">{item.time}</span>
                <h3 className="my-1 font-semibold">{item.title}</h3>
                <p>{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="download" className="reveal py-11">
          <h2 className="mb-4 text-3xl font-semibold">Download CV</h2>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-300 bg-white p-5 shadow-[0_14px_35px_rgba(16,21,37,0.08)]">
            <p>Get my complete CV in PDF format with detailed project and testing experience.</p>
            <a href="/cv.pdf" className={primaryButton} download>
              Download PDF
            </a>
          </div>
        </section>

        <section id="contact" className="reveal py-11">
          <h2 className="mb-4 text-3xl font-semibold">Contact Me</h2>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-300 bg-white p-5 shadow-[0_14px_35px_rgba(16,21,37,0.08)]">
            <p>If you&apos;d like to discuss QA roles or collaboration, send me an email.</p>
            <a className={outlineButton} href="mailto:yourgmail@gmail.com?subject=QA%20Engineer%20Opportunity">
              Open Mail App
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-300 py-5 text-center text-slate-600">
        <p>&copy; {new Date().getFullYear()} QA Engineer Portfolio</p>
      </footer>
    </>
  );
}
