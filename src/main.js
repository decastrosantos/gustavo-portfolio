import "./styles.css";
import { I18N, detectLang, detectTheme } from "./i18n.js";

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());

let lang = document.documentElement.lang && I18N[document.documentElement.lang]
  ? document.documentElement.lang
  : detectLang();

function lookup(dict, path) {
  return path.split(".").reduce((o, k) => o?.[k], dict);
}

function applyLang(next) {
  if (!I18N[next]) return;
  lang = next;
  localStorage.setItem("gs-lang", next);
  document.documentElement.lang = next;
  const dict = I18N[next];
  document.title = dict.meta.title;
  document.querySelector('meta[name="description"]')?.setAttribute("content", dict.meta.description);
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const val = lookup(dict, el.dataset.i18n);
    if (val == null) return;
    if (el.hasAttribute("data-i18n-html")) el.innerHTML = val;
    else el.textContent = val;
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const val = lookup(dict, el.dataset.i18nAria);
    if (val) el.setAttribute("aria-label", val);
  });
  document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
    const val = lookup(dict, el.dataset.i18nAlt);
    if (val) el.setAttribute("alt", val);
  });
  document.querySelectorAll("[data-sec]").forEach((el) => {
    const label = dict.spine[el.dataset.sec];
    if (label) el.dataset.section = label;
  });
  document.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.lang === next));
  });
  const active = document.querySelector(".expertise__cats [aria-selected='true']");
  paintSkills(active?.dataset.cat || "analytics");
  applyTheme(document.documentElement.dataset.theme || detectTheme());
}

function applyTheme(next) {
  const theme = next === "light" ? "light" : "dark";
  localStorage.setItem("gs-theme", theme);
  document.documentElement.dataset.theme = theme;
  document.getElementById("themeColor")?.setAttribute("content", theme === "light" ? "#f3eee3" : "#07080c");
  const btn = document.getElementById("themeBtn");
  const dict = I18N[lang];
  if (btn && dict) {
    btn.setAttribute("aria-pressed", String(theme === "light"));
    const label = btn.querySelector("[data-i18n]");
    if (label) {
      label.dataset.i18n = theme === "light" ? "theme.toDark" : "theme.toLight";
      label.textContent = theme === "light" ? dict.theme.toDark : dict.theme.toLight;
    }
  }
}

function bindPrefs() {
  document.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => applyLang(btn.dataset.lang));
  });
  document.getElementById("themeBtn")?.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    applyTheme(next);
  });
  applyLang(lang);
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function runLoader() {
  const loader = document.getElementById("loader");
  const num = document.getElementById("loaderN");
  const bar = loader?.querySelector("i");
  if (!loader || !num || !bar) return;
  const page = document.querySelectorAll(".nav, main, .foot");
  page.forEach((element) => {
    element.inert = true;
  });

  const finish = () => {
    loader.classList.add("is-done");
    window.setTimeout(() => {
      page.forEach((element) => {
        element.inert = false;
      });
    }, reduce ? 0 : 720);
  };

  if (reduce) {
    finish();
    return;
  }

  let t = 0;
  const id = setInterval(() => {
    t += Math.random() * 7 + 3;
    if (t >= 100) t = 100;
    num.textContent = pad(Math.round(t));
    bar.style.width = `${t}%`;
    if (t === 100) {
      clearInterval(id);
      setTimeout(finish, 220);
    }
  }, 70);
}

function bindCursorLight() {
  const light = document.getElementById("cursorLight");
  if (!light) return;
  const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let x = targetX;
  let y = targetY;
  let raf = 0;

  const paint = () => {
    const dx = targetX - x;
    const dy = targetY - y;
    x += dx * 0.18;
    y += dy * 0.18;
    light.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    if (Math.abs(dx) + Math.abs(dy) < 0.2) {
      raf = 0;
      return;
    }
    raf = requestAnimationFrame(paint);
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      if (!hoverQuery.matches || reducedQuery.matches) return;
      targetX = event.clientX;
      targetY = event.clientY;
      light.classList.add("is-visible");
      if (!raf) raf = requestAnimationFrame(paint);
    },
    { passive: true },
  );

  document.addEventListener("pointerover", (event) => {
    light.classList.toggle("is-active", Boolean(event.target.closest("a, button, [role='tab']")));
  });
  document.addEventListener("pointerout", (event) => {
    if (!event.relatedTarget) {
      light.classList.remove("is-visible", "is-active");
      cancelAnimationFrame(raf);
      raf = 0;
    }
  });
  const disable = () => {
    light.classList.remove("is-visible", "is-active");
    cancelAnimationFrame(raf);
    raf = 0;
  };
  window.addEventListener("blur", disable);
  hoverQuery.addEventListener("change", ({ matches }) => {
    if (!matches) disable();
  });
  reducedQuery.addEventListener("change", ({ matches }) => {
    if (matches) disable();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else if (light.classList.contains("is-visible") && !raf) {
      raf = requestAnimationFrame(paint);
    }
  });
}

function paintSkills(key) {
  const cloud = document.getElementById("skillCloud");
  const blurb = document.getElementById("skillBlurb");
  const data = I18N[lang].skills[key];
  if (!cloud || !blurb || !data) return;
  blurb.textContent = data.blurb;
  cloud.innerHTML = data.items.map((item, i) => `<li style="animation-delay:${i * 45}ms">${item}</li>`).join("");
}

function bindExpertise() {
  const tabs = document.querySelectorAll(".expertise__cats [role='tab']");
  paintSkills("analytics");
  tabs.forEach((tab) => {
    const activate = () => {
      tabs.forEach((t) => t.setAttribute("aria-selected", "false"));
      tab.setAttribute("aria-selected", "true");
      paintSkills(tab.dataset.cat);
    };
    tab.addEventListener("click", activate);
    tab.addEventListener("mouseenter", activate);
  });
}

function bindNav() {
  const btn = document.getElementById("menuBtn");
  const drawer = document.getElementById("drawer");
  const progress = document.getElementById("progress");
  const spine = document.getElementById("spineLabel");
  const links = document.querySelectorAll(".nav__links a");

  btn?.addEventListener("click", () => {
    const open = drawer.hasAttribute("hidden");
    drawer.toggleAttribute("hidden", !open);
    btn.setAttribute("aria-expanded", String(open));
    document.body.style.overflowY = open ? "hidden" : "";
  });

  drawer?.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      drawer.setAttribute("hidden", "");
      btn?.setAttribute("aria-expanded", "false");
      document.body.style.overflowY = "";
    });
  });

  const sections = [...document.querySelectorAll("[data-section]")];

  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    if (progress) progress.style.width = `${p * 100}%`;

    let current = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top < window.innerHeight * 0.42) current = section;
    }
    if (spine && current) {
      const key = current.dataset.sec;
      spine.textContent = (key && I18N[lang].spine[key]) || current.dataset.section;
    }

    const id = current?.id;
    links.forEach((link) => {
      const href = link.getAttribute("href")?.slice(1);
      link.classList.toggle("is-on", href && (href === id || (href === "work" && current?.id === "legend")));
    });

    document.body.classList.toggle("is-legend", current?.id === "legend");
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function fieldCanvas() {
  const canvas = document.getElementById("field");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: true });
  const mobile = window.matchMedia("(max-width: 760px)").matches;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const count = mobile ? 42 : 88;
  const tokens = mobile
    ? ["SQL", "BRONZE", "GOLD", "RAG"]
    : ["SELECT", "JOIN", "BRONZE", "SILVER", "GOLD", "FEATURE", "TRAIN", "EVAL", "RAG", "AGENT"];
  const medal = [
    { label: "Bronze", note: "raw", color: [196, 122, 72] },
    { label: "Silver", note: "conformed", color: [196, 204, 214] },
    { label: "Gold", note: "curated", color: [212, 175, 55] },
  ];
  let w = 0;
  let h = 0;
  let points = [];
  let mx = 0.5;
  let my = 0.5;
  let t = 0;
  let raf = 0;

  const cluster = (i) => {
    const hubs = [
      { x: 0.18, y: 0.28 },
      { x: 0.78, y: 0.22 },
      { x: 0.72, y: 0.68 },
      { x: 0.22, y: 0.74 },
    ];
    const hub = hubs[i % hubs.length];
    return {
      x: hub.x + (Math.random() - 0.5) * 0.22,
      y: hub.y + (Math.random() - 0.5) * 0.18,
      z: Math.random() * 0.8 + 0.2,
      v: (Math.random() - 0.5) * 0.00022,
      u: (Math.random() - 0.5) * 0.00022,
    };
  };

  const resize = () => {
    w = canvas.width = Math.floor(window.innerWidth * dpr);
    h = canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    points = Array.from({ length: count }, (_, i) => cluster(i));
  };

  const drawGrid = () => {
    const step = 80 * dpr;
    ctx.strokeStyle = "rgba(232,226,212,0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= w; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = 0; y <= h; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();
  };

  const drawCurve = () => {
    ctx.beginPath();
    ctx.strokeStyle = "rgba(200,255,77,0.38)";
    ctx.lineWidth = 1.2 * dpr;
    const y0 = h * 0.62;
    for (let i = 0; i <= 48; i += 1) {
      const x = (i / 48) * w;
      const y = y0 + Math.sin(i * 0.38 + t * 0.012) * (28 * dpr) + Math.cos(i * 0.17) * (10 * dpr);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  };

  const drawMedal = () => {
    const y = h * 0.145;
    const left = w * 0.18;
    const right = w * 0.82;
    ctx.strokeStyle = "rgba(232,226,212,0.2)";
    ctx.lineWidth = 1 * dpr;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();
    medal.forEach((layer, i) => {
      const x = left + ((right - left) * i) / (medal.length - 1);
      const pulse = 0.5 + 0.5 * Math.abs(Math.sin(t * 0.018 + i * 0.9));
      const [r, g, b] = layer.color;
      ctx.fillStyle = `rgba(${r},${g},${b},${0.4 + pulse * 0.4})`;
      ctx.beginPath();
      ctx.arc(x, y, (3.6 + i * 0.6) * dpr, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(${r},${g},${b},0.78)`;
      ctx.font = `${11 * dpr}px "IBM Plex Mono", monospace`;
      ctx.textAlign = "center";
      ctx.fillText(layer.label, x, y - 14 * dpr);
      if (!mobile) {
        ctx.fillStyle = `rgba(${r},${g},${b},0.42)`;
        ctx.font = `${9 * dpr}px "IBM Plex Mono", monospace`;
        ctx.fillText(layer.note, x, y + 16 * dpr);
      }
    });
  };

  const drawTokens = () => {
    ctx.font = `${10 * dpr}px "IBM Plex Mono", monospace`;
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(232,226,212,0.28)";
    tokens.forEach((word, i) => {
      const x = w * (0.08 + (i % 3) * 0.3);
      const y = h * (0.42 + Math.floor(i / 3) * 0.16);
      ctx.fillText(word, x + (mx - 0.5) * 8 * dpr, y + (my - 0.5) * 8 * dpr);
    });
  };

  const drawSchema = () => {
    if (mobile) return;
    const x = w * 0.78;
    const y = h * 0.34;
    const bw = 150 * dpr;
    const bh = 88 * dpr;
    ctx.strokeStyle = "rgba(232,226,212,0.18)";
    ctx.strokeRect(x, y, bw, bh);
    ctx.fillStyle = "rgba(232,226,212,0.22)";
    ctx.font = `${9 * dpr}px "IBM Plex Mono", monospace`;
    ctx.textAlign = "left";
    ["id  pk", "event_ts", "user_key", "metric"].forEach((row, i) => {
      ctx.fillText(row, x + 10 * dpr, y + (20 + i * 16) * dpr);
    });
  };

  const drawLayers = () => {
    if (mobile) return;
    const x = w * 0.08;
    const y = h * 0.3;
    ctx.strokeStyle = "rgba(200,255,77,0.2)";
    for (let i = 0; i < 4; i += 1) {
      ctx.strokeRect(x + i * 7 * dpr, y + i * 9 * dpr, 92 * dpr, 18 * dpr);
    }
    ctx.fillStyle = "rgba(200,255,77,0.28)";
    ctx.font = `${9 * dpr}px "IBM Plex Mono", monospace`;
    ctx.textAlign = "left";
    ctx.fillText("layers", x, y - 8 * dpr);
  };

  const drawPoints = (scroll) => {
    const coords = points.map((p) => {
      p.x += p.v + (mx - 0.5) * 0.00008;
      p.y += p.u + (my - 0.5) * 0.00008;
      if (p.x < 0.04 || p.x > 0.96) p.v *= -1;
      if (p.y < 0.08 || p.y > 0.92) p.u *= -1;
      return {
        x: (p.x + (0.62 - p.x) * scroll * 0.12) * w,
        y: (p.y + (0.5 - p.y) * scroll * 0.08) * h,
        z: p.z,
      };
    });

    if (!mobile) {
      ctx.strokeStyle = "rgba(232,226,212,0.07)";
      ctx.lineWidth = 1;
      for (let i = 0; i < coords.length; i += 3) {
        const a = coords[i];
        const b = coords[(i + 7) % coords.length];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        if (dx * dx + dy * dy < (160 * dpr) ** 2) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (const p of coords) {
      ctx.fillStyle = `rgba(200,255,77,${0.14 + p.z * 0.32})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, (0.7 + p.z * 1.4) * dpr, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const frame = () => {
    ctx.clearRect(0, 0, w, h);
    const scroll = Math.min(1, window.scrollY / (window.innerHeight * 1.6));
    drawGrid();
    drawMedal();
    drawCurve();
    drawTokens();
    drawSchema();
    drawLayers();
    drawPoints(scroll);
    t += 1;
    if (!reduce) raf = requestAnimationFrame(frame);
  };

  window.addEventListener(
    "pointermove",
    (e) => {
      mx = e.clientX / window.innerWidth;
      my = e.clientY / window.innerHeight;
    },
    { passive: true },
  );
  window.addEventListener("resize", resize, { passive: true });
  resize();
  frame();
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else if (!reduce) raf = requestAnimationFrame(frame);
  });
}

function graphCanvas() {
  const canvas = document.getElementById("graph");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const nodes = [
    { id: "DATA", r: 1 },
    { id: "Python", r: 0.72 },
    { id: "SQL", r: 0.7 },
    { id: "Power BI", r: 0.68 },
    { id: "BigQuery", r: 0.64 },
    { id: "AWS", r: 0.6 },
    { id: "ML", r: 0.66 },
    { id: "AI", r: 0.7 },
    { id: "GenAI", r: 0.62 },
  ];
  let mx = 0;
  let my = 0;
  let w = 0;
  let h = 0;

  const place = () => {
    const rect = canvas.getBoundingClientRect();
    w = canvas.width = rect.width * devicePixelRatio;
    h = canvas.height = rect.height * devicePixelRatio;
    nodes.forEach((n, i) => {
      if (i === 0) {
        n.x = 0.5;
        n.y = 0.52;
        return;
      }
      const a = ((i - 1) / (nodes.length - 1)) * Math.PI * 2 - Math.PI / 2;
      n.x = 0.5 + Math.cos(a) * 0.28;
      n.y = 0.5 + Math.sin(a) * 0.3;
    });
  };

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.scale(devicePixelRatio, devicePixelRatio);
    const W = w / devicePixelRatio;
    const H = h / devicePixelRatio;
    const ox = mx * 10;
    const oy = my * 10;

    nodes.forEach((n, i) => {
      if (i === 0) return;
      ctx.strokeStyle = "rgba(232,226,212,0.16)";
      ctx.beginPath();
      ctx.moveTo(nodes[0].x * W + ox, nodes[0].y * H + oy);
      ctx.lineTo(n.x * W + ox * n.r, n.y * H + oy * n.r);
      ctx.stroke();
    });

    nodes.forEach((n, i) => {
      const x = n.x * W + ox * (i === 0 ? 1 : n.r);
      const y = n.y * H + oy * (i === 0 ? 1 : n.r);
      ctx.fillStyle = i === 0 ? "#c8ff4d" : "#e8e2d4";
      ctx.beginPath();
      ctx.arc(x, y, i === 0 ? 5 : 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = `${i === 0 ? 13 : 11}px "IBM Plex Mono", monospace`;
      ctx.fillStyle = i === 0 ? "#c8ff4d" : "rgba(232,226,212,0.78)";
      ctx.textAlign = "center";
      ctx.fillText(n.id, x, y - 12);
    });
    ctx.restore();
    requestAnimationFrame(draw);
  };

  canvas.addEventListener(
    "pointermove",
    (e) => {
      const r = canvas.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width - 0.5;
      my = (e.clientY - r.top) / r.height - 0.5;
    },
    { passive: true },
  );

  window.addEventListener("resize", place, { passive: true });
  place();
  if (!reduce) requestAnimationFrame(draw);
  else {
    mx = 0;
    my = 0;
    draw();
  }
}

runLoader();
bindCursorLight();
bindExpertise();
bindNav();
bindPrefs();
fieldCanvas();
graphCanvas();
