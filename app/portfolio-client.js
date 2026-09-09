"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MdApi,
  MdAutoFixHigh,
  MdBugReport,
  MdCode,
  MdDataObject,
  MdDataset,
  MdDevices,
  MdFactCheck,
  MdGroups,
  MdHub,
  MdInsights,
  MdChecklist,
  MdMiscellaneousServices,
  MdRocketLaunch,
  MdTaskAlt,
  MdScience,
  MdSpeed
} from "react-icons/md";
import { FaGithub, FaLinkedinIn } from "react-icons/fa";

const contactField =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 shadow-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200";

const pillButton =
  "inline-flex min-h-10 items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5";
const primaryButton = `${pillButton} border-emerald-700 bg-emerald-700 text-white shadow-[0_10px_26px_rgba(11,110,79,0.3)] hover:bg-emerald-800`;
const outlineButton = `${pillButton} border-emerald-700/45 bg-white/90 text-emerald-800 shadow-[0_8px_20px_rgba(16,21,37,0.08)] hover:border-emerald-700`;
const cardSurface = "rounded-2xl border border-slate-300 bg-white shadow-[0_14px_35px_rgba(16,21,37,0.08)]";
const heroSectionClass = "reveal scroll-mt-24 flex min-h-[calc(100svh-84px)] flex-col items-center justify-center py-10 text-center";

function SkillIcon({ type }) {
  const iconClass = "text-2xl text-emerald-700";
  if (type === "api") {
    return <MdApi className={iconClass} aria-hidden="true" />;
  }
  if (type === "database") {
    return <MdDataObject className={iconClass} aria-hidden="true" />;
  }
  if (type === "devops") {
    return <MdHub className={iconClass} aria-hidden="true" />;
  }
  if (type === "manual") {
    return <MdScience className={iconClass} aria-hidden="true" />;
  }
  if (type === "mobile") {
    return <MdDevices className={iconClass} aria-hidden="true" />;
  }
  if (type === "collaboration") {
    return <MdGroups className={iconClass} aria-hidden="true" />;
  }
  if (type === "performance") {
    return <MdSpeed className={iconClass} aria-hidden="true" />;
  }
  if (type === "automation") {
    return <MdAutoFixHigh className={iconClass} aria-hidden="true" />;
  }
  if (type === "code") {
    return <MdCode className={iconClass} aria-hidden="true" />;
  }
  return <MdMiscellaneousServices className={iconClass} aria-hidden="true" />;
}

function PillarIcon({ type }) {
  const iconClass = "text-xl text-emerald-700";
  if (type === "insights") return <MdInsights className={iconClass} aria-hidden="true" />;
  if (type === "quality") return <MdFactCheck className={iconClass} aria-hidden="true" />;
  if (type === "optimization") return <MdRocketLaunch className={iconClass} aria-hidden="true" />;
  return <MdTaskAlt className={iconClass} aria-hidden="true" />;
}

function CompetencyIcon({ type }) {
  const iconClass = "text-3xl text-emerald-700";
  if (type === "planning") return <MdChecklist className={iconClass} aria-hidden="true" />;
  if (type === "bugs") return <MdBugReport className={iconClass} aria-hidden="true" />;
  if (type === "quality") return <MdFactCheck className={iconClass} aria-hidden="true" />;
  if (type === "agile") return <MdGroups className={iconClass} aria-hidden="true" />;
  if (type === "optimization") return <MdRocketLaunch className={iconClass} aria-hidden="true" />;
  if (type === "data") return <MdDataset className={iconClass} aria-hidden="true" />;
  return <MdTaskAlt className={iconClass} aria-hidden="true" />;
}

export default function PortfolioClient({ content, projects = [], projectsStatus = "" }) {
  const {
    profile,
    highlights: experienceHighlights,
    competencies: competencyItems,
    pillars,
    skillFilters,
    skills: skillItems,
    experience,
    education: educationItems,
    sections
  } = content;
  const job = experience[0];

  const [menuOpen, setMenuOpen] = useState(false);
  const [navSolid, setNavSolid] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [activeFilter, setActiveFilter] = useState("automation");
  const [contactState, setContactState] = useState("idle");
  const [contactNotice, setContactNotice] = useState("");
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

      const scrollY = window.scrollY;
      setShowNav(scrollY > 20);
      setNavSolid(scrollY > 20);
    };

    window.addEventListener("scroll", onScroll);
    revealOnScroll();
    setActiveNav();
    onScroll();

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
      const isBackgroundArea =
        target === document.body ||
        target === document.documentElement ||
        (target instanceof Element &&
          Boolean(target.closest("main")) === false &&
          Boolean(target.closest("header")) === false &&
          Boolean(target.closest("footer")) === false);

      // Keep native cursor on interactive elements; use custom modes elsewhere.
      const useNativeCursor = overInteractive;
      setNativeCursorZone(useNativeCursor);
      if (!useNativeCursor) {
        lens.classList.toggle("mode-bg", isBackgroundArea);
        lens.classList.toggle("mode-v", !isBackgroundArea);
        lens.classList.add("is-visible");
        lens.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      }
    };

    const onMouseLeaveWindow = () => {
      lens.classList.remove("is-visible");
      lens.classList.remove("mode-bg");
      lens.classList.remove("mode-v");
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

  const handleContactSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    if (!payload.name?.trim() || !payload.email?.trim() || !payload.message?.trim()) {
      setContactState("error");
      setContactNotice("Please fill in every field.");
      return;
    }

    setContactState("sending");
    setContactNotice("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.ok) {
        setContactState("error");
        setContactNotice(result.error ?? "Something went wrong. Please email me directly.");
        return;
      }

      form.reset();
      setContactState("sent");
      setContactNotice("Thanks -- your message is on its way.");
    } catch {
      setContactState("error");
      setContactNotice("Network error. Please email me directly.");
    }
  };

  return (
    <>
      <canvas id="particles-canvas" aria-hidden="true" />
      <div ref={cursorLensRef} className="qa-cursor-lens" aria-hidden="true" />
      <div className="bg-shape bg-shape-1" />
      <div className="bg-shape bg-shape-2" />

      <header
        className={`sticky top-0 z-50 flex items-center justify-between px-[6vw] py-4 transition-all duration-300 ${
          showNav ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
        } ${
          navSolid
            ? "border-b border-slate-300 bg-slate-100/95 shadow-[0_10px_30px_rgba(16,21,37,0.12)] backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <a href="#home" className="text-xl font-bold text-slate-900">
          {profile.name.split(" ")[0]}{" "}
          <span className="text-emerald-700">{profile.name.split(" ").slice(1).join(" ")}</span>
        </a>

        <button
          className="rounded border border-slate-300 bg-white px-2 py-1 text-xl text-slate-700 md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMenuOpen((v) => !v)}
        >
          &#9776;
        </button>

        <nav
          id="primary-navigation"
          className={`absolute right-[6vw] top-full w-[min(260px,80vw)] flex-col gap-3 rounded-xl border border-slate-300 bg-white p-4 shadow-lg md:static md:flex md:w-auto md:flex-row md:border-0 md:bg-transparent md:p-0 md:shadow-none ${
            menuOpen ? "flex" : "hidden"
          }`}
        >
          {[
            ["about", "About Me"],
            ["skills", "Skills"],
            ["projects", "Projects"],
            ["experience", "Experience"],
            ["education", "Education"],
            ["download", "Download CV"],
            ["contact", "Contact"]
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`} className="nav-link" onClick={() => setMenuOpen(false)}>
              {label}
            </a>
          ))}
        </nav>
      </header>

      <main id="home" className="mx-auto w-[min(1100px,94vw)] pb-16 pt-8">
        <section className={heroSectionClass}>
          <p className="mb-2 text-sm font-bold text-emerald-700">{profile.role}</p>
          <h1 className="mx-auto text-4xl font-bold leading-tight md:text-6xl">{profile.name}</h1>
          
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">{profile.tagline}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a href="#contact" className={primaryButton}>
              Hire Me
            </a>
            <a
              href={profile.github}
              className={outlineButton}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              title="GitHub"
            >
              <FaGithub className="text-lg" aria-hidden="true" />
            </a>
            <a
              href={profile.linkedin}
              className={outlineButton}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              title="LinkedIn"
            >
              <FaLinkedinIn className="text-lg" aria-hidden="true" />
            </a>
            <a href="/cv.pdf" className={outlineButton} download>
              Download CV
            </a>
          </div>
        </section>

        <section id="about" className="reveal py-11">
          <h2 className="mb-4 text-3xl font-semibold">About Me</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5 md:grid-rows-6">
            <div className={`${cardSurface} bg-gradient-to-br from-white to-emerald-50/45 p-6 md:col-span-3 md:row-span-3`}>
              <p>{profile.about}</p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:col-span-3 md:row-span-3 md:grid-cols-3">
              {experienceHighlights.map((highlight) => (
                <article
                  key={highlight.metric}
                  className="rounded-xl border border-emerald-200 bg-white/90 px-4 py-3 shadow-[0_14px_35px_rgba(16,21,37,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(16,21,37,0.15)]"
                >
                  <p className="text-lg font-bold text-emerald-700">{highlight.metric}</p>
                  <p className="text-sm text-slate-600">{highlight.label}</p>
                </article>
              ))}
            </div>

            <div className="flex items-center justify-center p-4 md:col-span-2 md:row-span-6 md:col-start-4 md:row-start-1">
              <img
                src="/profile.jpg"
                alt="Raymond Maharjan profile"
                width={460}
                height={460}
                fetchPriority="high"
                className="h-44 w-44 rounded-2xl border border-emerald-200 object-cover shadow-sm md:h-[92%] md:w-full md:max-w-[260px]"
              />
            </div>
          </div>
        </section>

        <section id="skills" className="reveal py-11">
          <h2 className="mb-4 text-3xl font-semibold">Skills</h2>
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {competencyItems.map((item) => (
              <article
                key={item.title}
                className={`${cardSurface} group bg-gradient-to-br from-white to-slate-50 px-4 py-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(16,21,37,0.15)]`}
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 transition-colors duration-300 group-hover:bg-emerald-100">
                    <CompetencyIcon type={item.icon} />
                  </div>
                  <h3 className="pt-1 font-semibold">{item.title}</h3>
                </div>
                <div className="mt-3 h-1.5 w-full rounded-full bg-slate-200">
                  <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-300 group-hover:w-5/6" />
                </div>
              </article>
            ))}
          </div>

          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {pillars.map((pillar) => (
              <article
                key={pillar.label}
                className={`${cardSurface} group flex items-start gap-3 px-4 py-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(16,21,37,0.15)]`}
              >
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 transition-colors duration-300 group-hover:bg-emerald-100">
                  <PillarIcon type={pillar.icon} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{pillar.label}</p>
                  <p className="mt-1 text-sm text-slate-600">{pillar.desc}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-2xl font-semibold">Technical Skills</h3>
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Skill filters">
              {skillFilters.map((filter) => (
                <button
                  key={filter.key}
                  role="tab"
                  id={`skill-filter-${filter.key}`}
                  aria-selected={activeFilter === filter.key}
                  aria-controls="skill-list"
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

          <div
            id="skill-list"
            role="tabpanel"
            aria-labelledby={`skill-filter-${activeFilter}`}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filteredSkills.map((skill) => (
              <article
                key={skill.name}
                className={`${cardSurface} group p-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(16,21,37,0.15)]`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 transition-colors duration-300 group-hover:bg-emerald-100">
                      <SkillIcon type={skill.icon} />
                    </div>
                    <h3 className="font-semibold">{skill.name}</h3>
                  </div>
                  <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
                    {skill.group}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="projects" className="reveal py-11">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-3xl font-semibold">Projects</h2>
            <p className="text-sm text-slate-600">{sections.projectsSubtitle}</p>
          </div>

          {projectsStatus ? <div className="mb-3 text-slate-600">{projectsStatus}</div> : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <article
                className="grid gap-3 rounded-xl border border-slate-300 bg-white p-4 shadow-[0_14px_35px_rgba(16,21,37,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(16,21,37,0.15)]"
                key={project.url}
              >
                <h3 className="font-semibold">{project.name}</h3>
                <p className="text-slate-600">{project.summary}</p>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-slate-600">{project.language}</span>
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
          <h2 className="mb-4 text-3xl font-semibold">Work Experience</h2>
          <article className={`${cardSurface} overflow-hidden`}>
            <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white px-6 py-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                {job.company} · {job.location}
              </p>
              <h3 className="mt-2 text-xl font-semibold">{job.role}</h3>
              <p className="text-sm text-slate-600">{job.period}</p>
            </div>
            <div className="p-6">
              <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                {experienceHighlights.map((highlight) => (
                  <article key={`exp-${highlight.metric}`} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="font-semibold text-emerald-700">{highlight.metric}</p>
                    <p className="text-sm text-slate-600">{highlight.label}</p>
                  </article>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {job.responsibilities.map((item) => (
                  <p key={item} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </article>
        </section>

        <section id="education" className="reveal py-11">
          <h2 className="mb-4 text-3xl font-semibold">Education</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {educationItems.map((item) => (
              <article key={item.school} className={`${cardSurface} border-l-4 border-l-emerald-700 px-5 py-4`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold">{item.school}</h3>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{item.period}</span>
                </div>
                <p className="mt-2 text-slate-800">{item.program}</p>
                <p className="text-sm text-slate-600">{item.location}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="download" className="reveal py-11">
          <h2 className="mb-4 text-3xl font-semibold">Download CV</h2>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-300 bg-white p-5 shadow-[0_14px_35px_rgba(16,21,37,0.08)]">
            <p>{sections.cvIntro}</p>
            <a href="/cv.pdf" className={primaryButton} download>
              Download PDF
            </a>
          </div>
        </section>

        <section id="contact" className="reveal py-11">
          <h2 className="mb-4 text-3xl font-semibold">Get in Touch</h2>
          <div className="grid gap-5 rounded-2xl border border-slate-300 bg-white p-5 shadow-[0_14px_35px_rgba(16,21,37,0.08)] md:grid-cols-[1fr_1.2fr]">
            <div className="grid content-start gap-3">
              <p>{sections.contactIntro}</p>
              <p className="text-sm text-slate-600">
                Prefer email?{" "}
                <a
                  className="font-semibold text-emerald-700 hover:underline"
                  href={`mailto:${profile.email}?subject=QA%20Engineer%20Opportunity`}
                >
                  {profile.email}
                </a>
              </p>
              <p className="text-sm text-slate-600">
                {profile.location} &middot; {profile.availability}
              </p>
              <a
                className="text-sm font-semibold text-emerald-700 hover:underline"
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                Connect on LinkedIn
              </a>
            </div>

            <form className="grid gap-3" onSubmit={handleContactSubmit} noValidate>
              <div className="grid gap-1">
                <label className="text-sm font-semibold text-slate-700" htmlFor="contact-name">
                  Name
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  maxLength={100}
                  autoComplete="name"
                  className={contactField}
                />
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-semibold text-slate-700" htmlFor="contact-email">
                  Email
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  maxLength={200}
                  autoComplete="email"
                  className={contactField}
                />
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-semibold text-slate-700" htmlFor="contact-message">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={5}
                  minLength={10}
                  maxLength={5000}
                  className={contactField}
                />
              </div>

              {/* Honeypot -- hidden from people, catches naive bots. */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="contact-company">Company</label>
                <input id="contact-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button type="submit" className={primaryButton} disabled={contactState === "sending"}>
                  {contactState === "sending" ? "Sending..." : "Send Message"}
                </button>
                {contactNotice ? (
                  <p
                    role="status"
                    aria-live="polite"
                    className={`text-sm font-semibold ${
                      contactState === "error" ? "text-red-700" : "text-emerald-700"
                    }`}
                  >
                    {contactNotice}
                  </p>
                ) : null}
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-300 py-5 text-center text-slate-600">
        <p>&copy; {new Date().getFullYear()} {profile.name}</p>
      </footer>
    </>
  );
}
