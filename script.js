/**
 * ============================================================================
 * سناك الضيعة (Snack El Day3a) — المحرك التفاعلي الرئيسي (script.js)
 * ============================================================================
 * إعدادات سريعة لوكالة التصميم (Quick Agency Config Override):
 * جميع البيانات التفصيلية موجودة في ملف menu.js، ويمكنك أيضاً تعديل الخيارات
 * السريعة أدناه لإعادة تخصيص القالب لأي مطعم سناك خلال دقائق.
 * ============================================================================
 */
const AGENCY_QUICK_CONFIG = {
  enableConfetti: true,
  comboDiscountRate: 0.15,    // خصم 15% عند بناء وجبة كاملة
  surpriseDiscountRate: 0.10, // خصم 10% في ماكينة "فاجئني"
  storageKeyCart: "snack_day3a_cart_v1",
  storageKeyCurrency: "snack_day3a_curr_v1",
  storageKeyTheme: "snack_day3a_theme_v1"
};

/**
 * ============================================================================
 * Safe Storage Helper (محرك تخزين آمن يدعم العمل دون خادم ومع حظر التخزين)
 * ============================================================================
 * يوفر حماية كاملة عند فتح الموقع عبر بروتوكول file:// أو عند حظر localStorage
 * مع الاحتفاظ بالبيانات في الذاكرة (Memory Fallback) لضمان استمرار عمل السلة والثيم والعملة.
 */
const safeStore = (function () {
  const memoryFallback = Object.create(null);

  function isLocalStorageAvailable() {
    try {
      if (typeof window === "undefined") return false;
      const storage = window.localStorage;
      if (!storage) return false;
      const testKey = "__snack_storage_probe__";
      storage.setItem(testKey, "1");
      storage.removeItem(testKey);
      return true;
    } catch (_) {
      return false;
    }
  }

  let isAvailable = isLocalStorageAvailable();

  return {
    get: function (key) {
      if (isAvailable) {
        try {
          const val = window.localStorage.getItem(key);
          if (val !== null && val !== undefined) {
            return val;
          }
        } catch (_) {
          isAvailable = false;
        }
      }
      return key in memoryFallback ? memoryFallback[key] : null;
    },
    set: function (key, value) {
      const strVal = String(value);
      memoryFallback[key] = strVal;
      if (isAvailable) {
        try {
          window.localStorage.setItem(key, strVal);
        } catch (_) {
          isAvailable = false;
        }
      }
    },
    remove: function (key) {
      delete memoryFallback[key];
      if (isAvailable) {
        try {
          window.localStorage.removeItem(key);
        } catch (_) {
          isAvailable = false;
        }
      }
    }
  };
})();

if (typeof window !== "undefined") {
  window.safeStore = safeStore;
}

(function () {
  "use strict";

  const CFG = window.SNACK_CONFIG || {
    brandName: "سناك الضيعة",
    brandNameAr: "سناك الضيعة",
    brandPhone: "96171074246",
    brandPhoneDisplay: "+961 71 074 246",
    whatsappNumber: "96171074246",
    whatsappDisplay: "+961 71 074 246",
    defaultCurrency: "LBP",
    exchangeRate: 90000,
    deliveryZones: [
      { id: "tripoli-azmi", nameAr: "طرابلس — شارع عزمي", feeLbp: 50000, feeUsd: 0.55, etaMin: 25, tier: 1 }
    ]
  };
  const CATEGORIES = window.MENU_CATEGORIES || [];
  const ITEMS = window.MENU_ITEMS || [];
  const CUSTOMIZER = window.MENU_CUSTOMIZER || {};

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

  // صمام أمان لتوليد بطاقة صورة احتياطية ناعمة تحمل اسم الصنف بالخط العربي الأنيق
  function generateFallbackDishSvg(dishName) {
    const safeName = (dishName || "سناك الضيعة")
      .replace(/[<>&"']/g, "")
      .trim()
      .slice(0, 40);
    return (
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 450'%3E" +
      "%3Cdefs%3E%3ClinearGradient id='bgGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E" +
      "%3Cstop offset='0%25' stop-color='%232B1D16'/%3E" +
      "%3Cstop offset='50%25' stop-color='%233A1030'/%3E" +
      "%3Cstop offset='100%25' stop-color='%231E1410'/%3E" +
      "%3C/linearGradient%3E" +
      "%3CradialGradient id='warmGlow' cx='50%25' cy='45%25' r='55%25'%3E" +
      "%3Cstop offset='0%25' stop-color='%23FF4B2B' stop-opacity='0.25'/%3E" +
      "%3Cstop offset='60%25' stop-color='%23FF9F1C' stop-opacity='0.12'/%3E" +
      "%3Cstop offset='100%25' stop-color='%231E1410' stop-opacity='0'/%3E" +
      "%3C/radialGradient%3E%3C/defs%3E" +
      "%3Crect width='600' height='450' fill='url(%23bgGrad)'/%3E" +
      "%3Crect width='600' height='450' fill='url(%23warmGlow)'/%3E" +
      "%3Ccircle cx='300' cy='200' r='90' fill='%23FFD84D' fill-opacity='0.08' stroke='%23FFD84D' stroke-width='1.5' stroke-dasharray='4 4'/%3E" +
      "%3Ctext x='300' y='205' text-anchor='middle' fill='%23FFF6E6' font-family='Cairo,Tajawal,sans-serif' font-weight='700' font-size='24'%3E" +
      encodeURIComponent(safeName) +
      "%3C/text%3E" +
      "%3Ctext x='300' y='250' text-anchor='middle' fill='%23FFD84D' font-family='Cairo,Tajawal,sans-serif' font-weight='600' font-size='16'%3E" +
      encodeURIComponent("سناك الضيعة — طرابلس والشمال") +
      "%3C/text%3E%3C/svg%3E"
    );
  }

  // صورة احتياطية عامة
  const FALLBACK_FOOD_SVG = generateFallbackDishSvg("سناك الضيعة");

  // أيقونات SVG موحدة بسمك خط 2px لجميع أقسام المنيو وعناصر الواجهة
  const CATEGORY_SVG_MAP = {
    all: `<svg class="ui-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
    sandwiches: `<svg class="ui-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11c0-4.4 4-8 9-8s9 3.6 9 8H3Z"/><path d="M2 14h20"/><path d="M4 17c0 2.2 3.6 4 8 4s8-1.8 8-4H4Z"/></svg>`,
    manakish: `<svg class="ui-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="1"/><circle cx="14" cy="9" r="1"/><circle cx="11" cy="14" r="1"/><circle cx="15" cy="13" r="1"/></svg>`,
    burgers: `<svg class="ui-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11a8 8 0 0 1 16 0H4Z"/><path d="M2 14h20"/><path d="M4 17h16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/></svg>`,
    meals: `<svg class="ui-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="3"/><circle cx="9" cy="12" r="3"/><path d="M15 9h4M15 12h4M15 15h3"/></svg>`,
    appetizers: `<svg class="ui-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 11h14l-1.5 10h-11L5 11Z"/><path d="M7 11V4m3 7V3m4 8V3m3 8V5"/></svg>`,
    salads: `<svg class="ui-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`,
    crepes: `<svg class="ui-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 3 20h18L12 3Z"/><path d="M7.5 12h9M6 16h12"/></svg>`,
    drinks: `<svg class="ui-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 8h10l-1 13H8L7 8Z"/><path d="M6 8h12"/><path d="M12 8V4l3-2"/></svg>`,
    desserts: `<svg class="ui-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c2.5 0 4.5 2 4.5 4.5S14.5 12 12 12 7.5 10 7.5 7.5 9.5 3 12 3Z"/><path d="M6 12h12l-2 9H8l-2-9Z"/></svg>`
  };

  function getCategorySvgIcon(catId) {
    return CATEGORY_SVG_MAP[catId] || CATEGORY_SVG_MAP.sandwiches;
  }

  // صمام أمان شامل للصور في مرحلة الالتقاط (Capture-phase fallback handler)
  window.addEventListener(
    "error",
    function (e) {
      const target = e.target;
      if (!target || target.tagName !== "IMG") return;

      const retries = Number(target.dataset.imgFallbackRetry || 0);
      if (retries === 0) {
        target.dataset.imgFallbackRetry = "1";
        const src = target.getAttribute("src") || "";
        if (src.indexOf("images/menu/") !== -1) {
          target.src = "./" + src.split("/").pop();
          return;
        }
        if (src.startsWith("./")) {
          target.src = "images/menu/" + src.slice(2);
          return;
        }
        if (!src.startsWith("http") && !src.startsWith("data:") && !src.startsWith("/")) {
          target.src = "./" + src;
          return;
        }
      }

      target.onerror = null;
      const dishTitle = target.getAttribute("alt") || target.dataset.name || "سناك الضيعة";
      target.src = generateFallbackDishSvg(dishTitle);
    },
    true
  );

  // حالة التطبيق المركزية
  const state = {
    currency: safeStore.get(AGENCY_QUICK_CONFIG.storageKeyCurrency) || (CFG && CFG.defaultCurrency) || "LBP",
    theme: safeStore.get(AGENCY_QUICK_CONFIG.storageKeyTheme) || "light",
    soundEnabled: false,
    isEnDemo: false,
    activeCategory: "all",
    expandedCategories: new Set(),
    categoryChunkLimits: {},
    searchQuery: "",
    activeFilters: new Set(),
    cart: loadSavedCart(),
    orderMode: "delivery", // "delivery" | "pickup"
    selectedZoneId: (CFG && CFG.deliveryZones && CFG.deliveryZones[0]?.id) || "tripoli-azmi",
    appliedPromo: null,
    driverTipLbp: 0,
    lastConfirmedOrderId: "#DY-4829",
    // حالة نافذة تخصيص الطبق
    modalDish: null,
    modalQty: 1,
    modalSizeId: "regular",
    modalAddons: new Set(),
    modalSauces: new Set(["toum"]),
    // حالة بناء الكومبو
    comboStep: 0,
    comboSelection: { main: null, side: null, drink: null, dessert: null },
    // حالة ماكينة فاجئني
    surpriseCombo: { main: null, side: null, drink: null },
    // حالة الحجز
    guestCount: 4,
    lastReservation: null
  };

  window.state = state;

  function loadSavedCart() {
    try {
      const raw = safeStore.get(AGENCY_QUICK_CONFIG.storageKeyCart);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }

  function saveCart() {
    try {
      safeStore.set(AGENCY_QUICK_CONFIG.storageKeyCart, JSON.stringify(state.cart));
    } catch (_) {}
  }

  // ==========================================================================
  // تنسيق الأسعار المعزول اتجاهياً (BiDi-Safe Price Formatting — Part 1.3)
  // ==========================================================================
  function formatPrice(lbpAmount) {
    const num = Number(lbpAmount) || 0;
    if (state.currency === "USD") {
      const usd = (num / (CFG.exchangeRate || 90000)).toFixed(2);
      return `<span class="price"><bdi dir="ltr">$${usd}</bdi></span>`;
    }
    return `<span class="price"><bdi dir="ltr">${num.toLocaleString("en-US")}</bdi>&nbsp;<span class="cur">ل.ل.</span></span>`;
  }

  function formatPricePlain(lbpAmount) {
    const num = Number(lbpAmount) || 0;
    if (state.currency === "USD") {
      const usd = (num / (CFG.exchangeRate || 90000)).toFixed(2);
      return "$" + usd;
    }
    return num.toLocaleString("en-US") + " ل.ل.";
  }

  function formatDualPrice(lbpAmount) {
    const num = Number(lbpAmount) || 0;
    const usd = (num / (CFG.exchangeRate || 90000)).toFixed(2);
    return `<span class="price"><bdi dir="ltr">${num.toLocaleString("en-US")}</bdi>&nbsp;<span class="cur">ل.ل.</span></span> <span class="price-usd">(<bdi dir="ltr">$${usd}</bdi>)</span>`;
  }

  function formatDualPricePlain(lbpAmount) {
    const num = Number(lbpAmount) || 0;
    const usd = (num / (CFG.exchangeRate || 90000)).toFixed(2);
    return `${num.toLocaleString("en-US")} ل.ل. ($${usd})`;
  }

  window.formatPrice = formatPrice;
  window.formatPricePlain = formatPricePlain;

  // ==========================================================================
  // مولّد المؤثرات الصوتية عبر Web Audio API (بدون ملفات خارجية)
  // ==========================================================================
  let audioCtx = null;
  function ensureAudioCtx() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  }

  function playSound(type) {
    if (!state.soundEnabled) return;
    try {
      ensureAudioCtx();
      if (!audioCtx) return;
      const now = audioCtx.currentTime;

      if (type === "click" || type === "tick") {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(type === "tick" ? 720 : 520, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.045);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.055);
      } else if (type === "pop") {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(340, now);
        osc.frequency.exponentialRampToValueAtTime(760, now + 0.11);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.14);
      } else if (type === "win") {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.1, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.28);
          osc.connect(gain).connect(audioCtx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.3);
        });
      } else if (type === "sizzle") {
        const bufferSize = audioCtx.sampleRate * 0.35;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        const filter = audioCtx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 3800;
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.045, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
        noise.connect(filter).connect(gain).connect(audioCtx.destination);
        noise.start(now);
      }
    } catch (_) {}
  }

  // ==========================================================================
  // نظام الإشعارات الفورية (Toast Notifications — SVG Icons Only)
  // ==========================================================================
  function showToast(message) {
    const container = document.getElementById("toastContainer");
    if (!container) return;
    const item = document.createElement("div");
    item.className = "toast-item";
    const svgCheck = `<svg class="ui-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    item.innerHTML = `<span class="toast-svg-badge">${svgCheck}</span><span>${message}</span>`;
    container.appendChild(item);

    setTimeout(() => {
      item.style.opacity = "0";
      item.style.transform = "translateX(-20px)";
      item.style.transition = "opacity 0.25s ease, transform 0.25s ease";
      setTimeout(() => item.remove(), 260);
    }, 3400);
  }

  // ==========================================================================
  // لوحة المؤثرات البصرية (Confetti + نجوم احتفالية للمفاجأة السرية)
  // ==========================================================================
  const fxCanvas = document.getElementById("fxCanvas");
  const fxCtx = fxCanvas ? fxCanvas.getContext("2d") : null;
  let fxParticles = [];
  let fxRafId = null;

  function resizeFxCanvas() {
    if (!fxCanvas) return;
    fxCanvas.width = window.innerWidth;
    fxCanvas.height = window.innerHeight;
  }

  function launchConfetti(count = 75) {
    if (prefersReducedMotion || !AGENCY_QUICK_CONFIG.enableConfetti || !fxCtx) return;
    resizeFxCanvas();
    const colors = ["#FF4B2B", "#FFD84D", "#0F9F8F", "#FF9F1C", "#3A1030"];
    for (let i = 0; i < count; i++) {
      fxParticles.push({
        kind: "confetti",
        x: window.innerWidth * (0.2 + Math.random() * 0.6),
        y: window.innerHeight * 0.35,
        vx: (Math.random() - 0.5) * 14,
        vy: -Math.random() * 13 - 4,
        size: 6 + Math.random() * 6,
        color: colors[i % colors.length],
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.25,
        alpha: 1
      });
    }
    startFxLoop();
  }

  function launchFoodEmojiRain() {
    if (prefersReducedMotion || !fxCtx) return;
    resizeFxCanvas();
    const colors = ["#FF4B2B", "#FFD84D", "#0F9F8F", "#FF9F1C"];
    for (let i = 0; i < 60; i++) {
      fxParticles.push({
        kind: "star",
        color: colors[i % colors.length],
        x: Math.random() * window.innerWidth,
        y: -40 - Math.random() * 480,
        vx: (Math.random() - 0.5) * 2.4,
        vy: 3.2 + Math.random() * 4.2,
        size: 8 + Math.random() * 8,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.12,
        alpha: 1
      });
    }
    startFxLoop();
  }

  function startFxLoop() {
    if (fxRafId) return;
    function tick() {
      if (!fxCtx || !fxCanvas) return;
      fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
      fxParticles = fxParticles.filter((p) => p.y < fxCanvas.height + 60 && p.alpha > 0.05);

      for (const p of fxParticles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.kind === "confetti") {
          p.vy += 0.36;
          p.rot += p.vRot;
          p.alpha -= 0.006;
          fxCtx.save();
          fxCtx.globalAlpha = Math.max(0, p.alpha);
          fxCtx.translate(p.x, p.y);
          fxCtx.rotate(p.rot);
          fxCtx.fillStyle = p.color;
          fxCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
          fxCtx.restore();
        } else {
          p.rot += p.vRot || 0.05;
          p.alpha -= 0.004;
          fxCtx.save();
          fxCtx.globalAlpha = Math.max(0, p.alpha);
          fxCtx.translate(p.x, p.y);
          fxCtx.rotate(p.rot);
          fxCtx.fillStyle = p.color || "#FFD84D";
          fxCtx.beginPath();
          fxCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          fxCtx.fill();
          fxCtx.restore();
        }
      }

      if (fxParticles.length > 0) {
        fxRafId = requestAnimationFrame(tick);
      } else {
        fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
        fxRafId = null;
      }
    }
    fxRafId = requestAnimationFrame(tick);
  }

  // ==========================================================================
  // 1. شاشة التحميل السينمائية (Preloader) + أنيميشن الهيرو
  // ==========================================================================
  function initPreloader() {
    const preloader = document.getElementById("preloader");
    const bar = document.getElementById("preloaderBar");
    const pct = document.getElementById("preloaderPercent");
    const txt = document.getElementById("preloaderText");
    if (!preloader) return;

    if (prefersReducedMotion) {
      preloader.classList.add("is-loaded");
      setTimeout(() => preloader.remove(), 50);
      return;
    }

    let progress = 0;
    const timer = setInterval(() => {
      progress = Math.min(100, progress + Math.floor(Math.random() * 25) + 20);
      if (bar) bar.style.width = progress + "%";
      if (pct) pct.textContent = progress + "%";
      if (progress >= 60 && txt) {
        txt.textContent = "خبز الصاج صار محمّص وجاهز…";
      }
      if (progress >= 100) {
        clearInterval(timer);
        finishPreloader();
      }
    }, 45);

    setTimeout(() => {
      clearInterval(timer);
      finishPreloader();
    }, 800);

    let finished = false;
    function finishPreloader() {
      if (finished) return;
      finished = true;
      preloader.classList.add("is-loaded");
      animateHeroEntrance();
      setTimeout(() => {
        preloader.style.display = "none";
      }, 400);
    }
  }

  function animateHeroEntrance() {
    if (prefersReducedMotion) return;
    if (window.gsap) {
      window.gsap.fromTo(
        ".hero-headline .word-reveal",
        { yPercent: 115, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.78, stagger: 0.09, ease: "power3.out" }
      );
      window.gsap.fromTo(
        ".hero-subtitle, .hero-cta-group, .hero-trust-strip, .hero-visual-stage",
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.1, delay: 0.25, ease: "power2.out" }
      );
    } else {
      document.querySelectorAll(".hero-headline .word-reveal").forEach((el) => {
        el.style.transform = "none";
        el.style.opacity = "1";
      });
    }
  }

  // ==========================================================================
  // 2. المؤشر المخصص + الأزرار المغناطيسية + بارالاكس الهيرو (فقط لسطح المكتب الكبير)
  // ==========================================================================
  function initCursorAndParallax() {
    if (isCoarsePointer || prefersReducedMotion || window.innerWidth < 992) return;

    const dot = document.getElementById("cursorDot");
    const ring = document.getElementById("cursorRing");
    const label = document.getElementById("cursorLabel");
    if (!dot || !ring || !label) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;

      const target = e.target.closest("[data-cursor]");
      if (target) {
        ring.classList.add("is-active");
        label.textContent = target.getAttribute("data-cursor") || "شوف";
      } else {
        ring.classList.remove("is-active");
        label.textContent = "";
      }
    }, { passive: true });

    function renderRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      requestAnimationFrame(renderRing);
    }
    requestAnimationFrame(renderRing);

    document.querySelectorAll(".magnetic-btn").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.22;
        const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.22;
        btn.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });

    const stage = document.getElementById("heroParallaxStage");
    if (stage) {
      const layers = stage.querySelectorAll("[data-depth]");
      window.addEventListener("mousemove", (e) => {
        if (window.scrollY > window.innerHeight) return;
        const nx = (e.clientX / window.innerWidth - 0.5) * 2;
        const ny = (e.clientY / window.innerHeight - 0.5) * 2;
        layers.forEach((el) => {
          const depth = parseFloat(el.getAttribute("data-depth")) || 0.2;
          const moveX = nx * 28 * depth;
          const moveY = ny * 24 * depth;
          el.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
        });
      }, { passive: true });
    }
  }

  // ==========================================================================
  // 3. شريط التنقل، السكرول، الساعات المباشرة، الثيم، العملة، والمفاجأة السرية
  // ==========================================================================
  function checkLiveOpenStatus() {
    const now = new Date();
    const day = now.getDay();
    const currentDecimal = now.getHours() + now.getMinutes() / 60;

    const prevDay = (day + 6) % 7;
    const todayRule = CFG.openingHours.find((d) => d.dayIndex === day) || CFG.openingHours[0];
    const prevRule = CFG.openingHours.find((d) => d.dayIndex === prevDay) || CFG.openingHours[0];

    let isOpen = false;
    let closeInHours = 0;

    if (prevRule.close > 24 && currentDecimal < prevRule.close - 24) {
      isOpen = true;
      closeInHours = prevRule.close - 24 - currentDecimal;
    } else if (currentDecimal >= todayRule.open && currentDecimal < Math.min(24, todayRule.close)) {
      isOpen = true;
      closeInHours = todayRule.close - currentDecimal;
    }

    const pill = document.getElementById("heroLiveStatus");
    const text = document.getElementById("heroOpenText");
    const todayBadge = document.getElementById("todayStatusBadge");

    if (isOpen) {
      pill?.classList.remove("is-closed");
      const hrs = Math.floor(closeInHours);
      const mins = Math.max(1, Math.round((closeInHours - hrs) * 60));
      if (text) {
        text.textContent = hrs > 0
          ? `مفتوح الآن • نستقبل طلباتكم (${hrs} س و ${mins} د للإغلاق)`
          : `مفتوح الآن • سارع بالطلب (${mins} دقيقة للإغلاق)`;
      }
      if (todayBadge) todayBadge.textContent = "مفتوح الآن";
    } else {
      pill?.classList.add("is-closed");
      let diff = todayRule.open - currentDecimal;
      if (diff <= 0) diff += 24;
      const hrs = Math.floor(diff);
      const mins = Math.round((diff - hrs) * 60);
      if (text) {
        text.textContent = `مغلق حالياً • يفتح خلال ${hrs} ساعة و ${mins} دقيقة`;
      }
      if (todayBadge) todayBadge.textContent = "مغلق حالياً";
    }
  }

  let isKeyboardFocused = false;
  function syncStickyBarVisibility() {
    const bar = document.getElementById("mobileStickyBar");
    if (!bar) return;
    const heroEl = document.getElementById("hero");
    const heroBottom = heroEl ? heroEl.offsetTop + Math.min(heroEl.offsetHeight * 0.65, 420) : 320;
    const scrolledPastHero = window.scrollY > heroBottom;

    const cartOpen = document.getElementById("cartDrawer")?.classList.contains("is-open");
    const dishModalOpen = !document.getElementById("dishModal")?.hidden;
    const surpriseOpen = !document.getElementById("surpriseModal")?.hidden;
    const mobMenuOpen = document.getElementById("mobileMenu")?.classList.contains("is-open");

    const shouldShow = scrolledPastHero && !cartOpen && !dishModalOpen && !surpriseOpen && !mobMenuOpen && !isKeyboardFocused;
    bar.classList.toggle("is-visible", Boolean(shouldShow));
  }

  function initNavbarAndGlobals() {
    const navbar = document.getElementById("navbar");
    const progressBar = document.getElementById("scrollProgressBar");
    const bttCircle = document.getElementById("bttProgressCircle");
    const navLinks = document.querySelectorAll(".nav-link");
    const sections = Array.from(document.querySelectorAll("main section[id]"));

    let lastScrollY = window.scrollY;

    function onScroll() {
      const y = window.scrollY;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const ratio = Math.min(1, Math.max(0, y / maxScroll));

      if (progressBar) {
        progressBar.style.transform = `scaleX(${ratio})`;
      }
      if (bttCircle) {
        const circumference = 113.1;
        bttCircle.style.strokeDashoffset = String(circumference * (1 - ratio));
      }

      if (navbar) {
        navbar.classList.toggle("is-scrolled", y > 45);
        if (y > 260 && y > lastScrollY + 8) {
          navbar.classList.add("is-hidden");
        } else if (y < lastScrollY - 6 || y <= 120) {
          navbar.classList.remove("is-hidden");
        }
      }
      lastScrollY = y;

      // Scroll-spy للأقسام الرئيسية
      let currentId = "menu";
      for (const sec of sections) {
        if (sec.id === "appQuickHub") continue;
        const top = sec.offsetTop - 160;
        if (y >= top) currentId = sec.id;
      }
      navLinks.forEach((lnk) => {
        lnk.classList.toggle("active", lnk.getAttribute("data-section") === currentId);
      });

      // Scroll-spy لأقسام المنيو الفرعية عند التمرير داخل المنيو
      spyActiveMenuCategorySection(y);

      // إظهار أو إخفاء الشريط السفلي اللاصق للجوال
      syncStickyBarVisibility();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // مراقبة فتح الكيبورد على الجوال لإخفاء الشريط السفلي مؤقتاً
    document.addEventListener("focusin", (e) => {
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT")) {
        if (e.target.type !== "range" && e.target.type !== "checkbox" && e.target.type !== "radio") {
          isKeyboardFocused = true;
          syncStickyBarVisibility();
        }
      }
    });
    document.addEventListener("focusout", () => {
      setTimeout(() => {
        isKeyboardFocused = false;
        syncStickyBarVisibility();
      }, 150);
    });

    // قائمة الجوال بملء الشاشة
    const hamBtn = document.getElementById("hamburgerBtn");
    const mobMenu = document.getElementById("mobileMenu");
    function toggleMobileMenu(force) {
      if (!hamBtn || !mobMenu) return;
      const open = typeof force === "boolean" ? force : !mobMenu.classList.contains("is-open");
      mobMenu.classList.toggle("is-open", open);
      hamBtn.classList.toggle("is-open", open);
      hamBtn.setAttribute("aria-expanded", String(open));
      mobMenu.setAttribute("aria-hidden", String(!open));
      document.body.style.overflow = open ? "hidden" : "";
      syncStickyBarVisibility();
    }

    hamBtn?.addEventListener("click", () => {
      playSound("click");
      toggleMobileMenu();
    });

    mobMenu?.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => toggleMobileMenu(false));
    });

    document.getElementById("mobSoundProxyBtn")?.addEventListener("click", () => {
      document.getElementById("soundToggle")?.click();
    });
    document.getElementById("mobThemeProxyBtn")?.addEventListener("click", () => {
      document.getElementById("themeToggle")?.click();
    });
    document.getElementById("mobLangProxyBtn")?.addEventListener("click", () => {
      document.getElementById("langDemoToggle")?.click();
      toggleMobileMenu(false);
    });

    // تبديل الثيم (ليلي / نهاري)
    applyTheme(state.theme);
    document.getElementById("themeToggle")?.addEventListener("click", () => {
      playSound("click");
      state.theme = state.theme === "dark" ? "light" : "dark";
      safeStore.set(AGENCY_QUICK_CONFIG.storageKeyTheme, state.theme);
      applyTheme(state.theme);
      showToast(state.theme === "light" ? "تم تفعيل المظهر النهاري الكريمي" : "تم تفعيل المظهر الليلي الفاخر");
    });

    // تبديل العملة (ل.ل. / $)
    updateCurrencyToggleUI();
    document.getElementById("currencyToggle")?.addEventListener("click", () => {
      playSound("click");
      state.currency = state.currency === "LBP" ? "USD" : "LBP";
      safeStore.set(AGENCY_QUICK_CONFIG.storageKeyCurrency, state.currency);
      refreshAllPricesOnPage();
      showToast(
        state.currency === "USD"
          ? "تم عرض الأسعار بالدولار الأمريكي ($)"
          : "تم عرض الأسعار بالليرة اللبنانية (ل.ل.)"
      );
    });

    // تبديل الصوت
    document.getElementById("soundToggle")?.addEventListener("click", (e) => {
      state.soundEnabled = !state.soundEnabled;
      const btn = e.currentTarget;
      btn.setAttribute("aria-pressed", String(state.soundEnabled));
      document.getElementById("soundOffIcon")?.classList.toggle("hidden", state.soundEnabled);
      document.getElementById("soundOnIcon")?.classList.toggle("hidden", !state.soundEnabled);
      if (state.soundEnabled) {
        playSound("pop");
        showToast("تم تشغيل المؤثرات الصوتية التفاعلية");
      } else {
        showToast("تم كتم المؤثرات الصوتية");
      }
    });

    // زر العرض التجريبي الإنجليزي EN
    document.getElementById("langDemoToggle")?.addEventListener("click", () => {
      playSound("click");
      toggleEnglishDemo(!state.isEnDemo);
    });
    document.getElementById("resetArabicBtn")?.addEventListener("click", () => {
      toggleEnglishDemo(false);
    });

    // العودة للأعلى
    document.getElementById("backToTopBtn")?.addEventListener("click", () => {
      playSound("click");
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });

    // المفاجأة السرية (Easter Egg): الضغط 5 مرات على الشعار
    let logoClicks = 0;
    let logoTimer = null;
    document.getElementById("brandLogoBtn")?.addEventListener("click", (e) => {
      logoClicks++;
      clearTimeout(logoTimer);
      logoTimer = setTimeout(() => { logoClicks = 0; }, 2400);
      if (logoClicks >= 5) {
        e.preventDefault();
        logoClicks = 0;
        playSound("win");
        launchFoodEmojiRain();
        applyPromoCode("VIPDAY3A", true);
        showToast("يا هلا بالذويق! ربحت معنا كود VIPDAY3A بخصم 25% ع طلبك، تكرم عينك!");
      }
    });

    // زر الطلب السريع في بطاقة الهيرو
    document.getElementById("heroQuickOrderBtn")?.addEventListener("click", () => {
      const shawarma = ITEMS.find((i) => i.id === "sw-shawarma-chicken") || ITEMS[0];
      if (shawarma) quickAddDish(shawarma);
    });

    // انتقال سلس لرابط معاينة 404
    document.getElementById("preview404Link")?.addEventListener("click", (e) => {
      if (prefersReducedMotion) return;
      e.preventDefault();
      const href = e.currentTarget.getAttribute("href");
      document.body.classList.add("page-leaving");
      setTimeout(() => { window.location.href = href; }, 250);
    });

    // روابط التذييل والدوائر السريعة للأقسام
    document.querySelectorAll("[data-quick-cat], [data-jump-cat]").forEach((link) => {
      link.addEventListener("click", (e) => {
        const cat = link.getAttribute("data-quick-cat") || link.getAttribute("data-jump-cat");
        if (cat) {
          e.preventDefault();
          scrollToMenuCategory(cat);
        }
      });
    });

    // أزرار السوشيال ميديا التفاعلية
    document.querySelectorAll("[data-social]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const platform = btn.getAttribute("data-social");
        showToast(`تابعنا على ${platform} عبر الحساب الرسمي @SnackElDay3a.lb`);
      });
    });

    const yearEl = document.getElementById("currentYear");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    document.getElementById("sunIcon")?.classList.toggle("hidden", theme === "light");
    document.getElementById("moonIcon")?.classList.toggle("hidden", theme === "dark");
  }

  function updateCurrencyToggleUI() {
    document.querySelectorAll(".curr-opt").forEach((el) => {
      el.classList.toggle("active", el.getAttribute("data-curr") === state.currency);
    });
  }

  function toggleEnglishDemo(enableEn) {
    state.isEnDemo = enableEn;
    const banner = document.getElementById("enDemoBanner");
    const btn = document.getElementById("langDemoToggle");
    if (banner) banner.hidden = !enableEn;
    if (btn) btn.textContent = enableEn ? "AR" : "EN";

    const dict = {
      brandName: enableEn ? "Snack El Day3a" : "سناك الضيعة — طرابلس",
      brandSub: enableEn ? "Authentic Lebanese Snack & Grill" : "عَ الصاج والنار • منذ 2010",
      navOffers: enableEn ? "Offers" : "العروض",
      navMenu: enableEn ? "Menu" : "المنيو",
      navCombo: enableEn ? "Combo Builder" : "اصنع وجبتك",
      navDelivery: enableEn ? "Delivery" : "التوصيل",
      navGrill: enableEn ? "Watch Grill" : "شاهد التحضير",
      navPartyPlanner: enableEn ? "Feast Planner" : "حاسبة السهرة",
      navAbout: enableEn ? "Story" : "قصتنا",
      navBranches: enableEn ? "Branches" : "الحجز والفروع",
      navContact: enableEn ? "Contact" : "تواصل معنا",
      callAndOrder: enableEn ? "Call & Order" : "اتصل واطلب",
      orderNow: enableEn ? "Order Now" : "اطلب هلّق",
      browseMenu: enableEn ? "Browse Menu (92)" : "شوف المنيو (92 صنف)",
      offersHeading: enableEn ? "Today's Hot Offers" : "عروض اليوم النارية",
      menuHeading: enableEn ? "Interactive Lebanese Menu" : "منيو سناك الضيعة",
      comboHeading: enableEn ? "Build Your Meal (-15%)" : "اصنع وجبتك الكاملة",
      deliveryHeading: enableEn ? "Coverage & Delivery Fees" : "مناطق التغطية ورسوم التوصيل",
      grillHeading: enableEn ? "Watch How We Grill" : "شاهد كيف نحضّر",
      partyPlannerHeading: enableEn ? "Party & Feast Planner" : "حاسبة السهرة والعزومات",
      aboutHeading: enableEn ? "From Village Saj to Tripoli" : "بلّشت الحكاية من صاج صغير… وكبرت بمحبتكن",
      branchesHeading: enableEn ? "Branches & Table Booking" : "فروعنا وحجز الطاولات",
      reviewsHeading: enableEn ? "Customer Reviews" : "شو قالوا عن سناك الضيعة؟",
      contactHeading: enableEn ? "Location, Hours & Contact" : "الموقع، أوقات العمل والتواصل"
    };

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (dict[key]) el.textContent = dict[key];
    });

    showToast(
      enableEn
        ? "تم تفعيل معاينة العناوين الإنجليزية للعرض فقط — اضغط AR للعودة للعربية"
        : "تمت العودة للواجهة العربية الكاملة"
    );
  }

  function refreshAllPricesOnPage() {
    updateCurrencyToggleUI();
    document.querySelectorAll(".price-reactive[data-lbp]").forEach((el) => {
      el.innerHTML = formatPrice(Number(el.getAttribute("data-lbp")));
    });
    renderOffers();
    renderMenuItems(false);
    renderComboStepOptions();
    renderComboTray();
    if (typeof renderDeliveryZones === "function") renderDeliveryZones();
    renderCart();
    if (state.modalDish && !document.getElementById("dishModal")?.hidden) {
      openDishModal(state.modalDish);
    }
    updateSurprisePriceUI();
  }

  // ==========================================================================
  // 4. قسم عروض اليوم + العداد التنازلي + البطاقة القابلة للقلب + لفّ العجلة
  // ==========================================================================
  function renderOffers() {
    const grid = document.getElementById("offersGrid");
    if (!grid) return;

    grid.innerHTML = CFG.offers
      .map(
        (of) => `
      <article class="offer-card">
        <span class="offer-ribbon">${of.badge}</span>
        <div class="offer-img-wrap">
          <img src="${of.image}" alt="${of.title}" width="800" height="600" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${FALLBACK_FOOD_SVG}';" />
          ${
            of.hasCountdown
              ? `<div class="offer-countdown-bar">
                   <span><svg class="ui-svg-icon"><use href="#ico-clock"/></svg> ينتهي خلال:</span>
                   <strong class="live-offer-countdown">--:--:--</strong>
                 </div>`
              : ""
          }
        </div>
        <div class="offer-body">
          <span class="offer-tag-meta"><svg class="ui-svg-icon"><use href="#ico-sparkle"/></svg> ${of.tag}</span>
          <h3>${of.title}</h3>
          <p>${of.subtitle}</p>
          <div class="offer-footer">
            <div class="offer-prices">
              <del>${formatPrice(of.oldPriceLbp)}</del>
              <strong>${formatPrice(of.priceLbp)}</strong>
            </div>
            <button type="button" class="btn btn-primary btn-sm add-offer-btn" data-offer-id="${of.id}" data-cursor="اطلب">
              + أضف العرض
            </button>
          </div>
        </div>
      </article>
    `
      )
      .join("");

    grid.querySelectorAll(".add-offer-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const offer = CFG.offers.find((o) => o.id === btn.getAttribute("data-offer-id"));
        if (!offer) return;
        addItemToCart({
          uid: offer.id,
          id: offer.id,
          name: offer.title,
          image: offer.image,
          unitPriceLbp: offer.priceLbp,
          qty: 1,
          modsSummary: "عرض خاص متكامل"
        });
      });
    });

    updateOfferCountdownTick();
  }

  function updateOfferCountdownTick() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diffSec = Math.max(0, Math.floor((midnight - now) / 1000));
    const h = String(Math.floor(diffSec / 3600)).padStart(2, "0");
    const m = String(Math.floor((diffSec % 3600) / 60)).padStart(2, "0");
    const s = String(diffSec % 60).padStart(2, "0");
    document.querySelectorAll(".live-offer-countdown").forEach((el) => {
      el.textContent = `${h}:${m}:${s}`;
    });
  }

  function initFlipCardsAndWheel() {
    setInterval(updateOfferCountdownTick, 1000);

    ["promoFlipCard", "secretFlipCard"].forEach((id) => {
      const card = document.getElementById(id);
      if (!card) return;
      card.addEventListener("click", (e) => {
        if (e.target.closest("button")) return;
        playSound("click");
        card.classList.toggle("is-flipped");
      });
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          card.classList.toggle("is-flipped");
        }
      });
    });

    document.getElementById("copyDailyPromoBtn")?.addEventListener("click", (e) => {
      e.stopPropagation();
      copyAndApplyCode("DAY3A20");
    });

    document.getElementById("orderWithExtraGarlicBtn")?.addEventListener("click", (e) => {
      e.stopPropagation();
      const shawarma = ITEMS.find((i) => i.id === "sw-shawarma-chicken") || ITEMS[0];
      if (shawarma) {
        openDishModal(shawarma, ["extra-garlic"]);
      }
    });

    // رسم وتشغيل عجلة الحظ الفيزيائية (Spin the Wheel)
    const canvas = document.getElementById("spinWheelCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const segments = CFG.wheelSegments || [];
    let currentAngle = 0;
    let isSpinning = false;

    function drawWheel(angleRad) {
      if (!ctx || segments.length === 0) return;
      const dpr = window.devicePixelRatio || 1;
      const size = 340;
      if (canvas.width !== size * dpr) {
        canvas.width = size * dpr;
        canvas.height = size * dpr;
      }
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;
      const radius = size / 2 - 8;
      const arc = (Math.PI * 2) / segments.length;

      segments.forEach((seg, i) => {
        const start = angleRad + i * arc;
        const end = start + arc;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, start, end);
        ctx.closePath();
        ctx.fillStyle = seg.color;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(255,246,230,0.34)";
        ctx.stroke();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(start + arc / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = seg.textColor || "#FFF6E6";
        ctx.font = "800 13.5px Cairo, sans-serif";
        ctx.fillText(seg.label, radius - 16, 5);
        ctx.restore();
      });

      ctx.restore();
    }

    drawWheel(currentAngle);

    function triggerSpin() {
      if (isSpinning || segments.length === 0) return;
      isSpinning = true;
      playSound("click");

      const spinBtn = document.getElementById("spinWheelBtn");
      if (spinBtn) spinBtn.disabled = true;

      const extraSpins = (5 + Math.random() * 3) * Math.PI * 2;
      const targetAngle = currentAngle + extraSpins;
      const startAngle = currentAngle;
      const duration = prefersReducedMotion ? 150 : 4100;
      const startTime = performance.now();
      const segArc = (Math.PI * 2) / segments.length;
      let lastTickIndex = -1;

      function step(now) {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        const eased = 1 - Math.pow(1 - t, 4);
        currentAngle = startAngle + (targetAngle - startAngle) * eased;
        drawWheel(currentAngle);

        const currentTick = Math.floor((currentAngle % (Math.PI * 2)) / segArc);
        if (currentTick !== lastTickIndex && t < 0.97) {
          lastTickIndex = currentTick;
          playSound("tick");
        }

        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          isSpinning = false;
          if (spinBtn) {
            spinBtn.disabled = false;
            spinBtn.innerHTML = `<svg class="ui-svg-icon"><use href="#ico-wheel"/></svg><span>لفّ العجلة مرة ثانية!</span>`;
          }
          const pointerAngle = (Math.PI * 1.5 - (currentAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          const winIndex = Math.floor(pointerAngle / segArc) % segments.length;
          const winner = segments[winIndex];
          announceWheelWinner(winner);
        }
      }

      requestAnimationFrame(step);
    }

    function announceWheelWinner(winner) {
      playSound("win");
      launchConfetti(85);
      const box = document.getElementById("wheelResultBox");
      const title = document.getElementById("wheelPrizeTitle");
      const desc = document.getElementById("wheelPrizeDesc");
      const code = document.getElementById("wheelWonCode");
      if (box && title && desc && code) {
        box.hidden = false;
        title.textContent = `مبروك! ربحت: ${winner.label}`;
        desc.textContent = winner.desc;
        code.textContent = winner.code;
      }
      showToast(`ربحت ${winner.label}! الكود: ${winner.code}`);
    }

    document.getElementById("spinWheelBtn")?.addEventListener("click", triggerSpin);
    document.getElementById("wheelCenterBtn")?.addEventListener("click", triggerSpin);
    document.getElementById("copyWheelCodeBtn")?.addEventListener("click", () => {
      const code = document.getElementById("wheelWonCode")?.textContent?.trim();
      if (code) copyAndApplyCode(code);
    });
  }

  function copyAndApplyCode(code) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    applyPromoCode(code, true);
    showToast(`تم نسخ الكود (${code}) وتطبيقه مباشرة في سلة طلباتك!`);
  }

  // ==========================================================================
  // 5. المنيو التفاعلي المتتالي (4 أصناف لكل قسم + زر شوف كل أصناف القسم — Part 2)
  // ==========================================================================
  const INITIAL_ITEMS_PER_CATEGORY = Number(window.INITIAL_ITEMS_PER_CATEGORY || CFG.INITIAL_ITEMS_PER_CATEGORY || 4);

  function renderCategoryTabs() {
    const container = document.getElementById("menuCategoryTabs");
    if (!container) return;

    const tabsHtml = CATEGORIES.map((cat) => {
      const count = cat.id === "all"
        ? ITEMS.length
        : ITEMS.filter((item) => item.category === cat.id).length;
      const isActive = state.activeCategory === cat.id;
      return `
        <button
          type="button"
          role="tab"
          aria-selected="${isActive}"
          class="cat-tab-btn ${isActive ? "active" : ""}"
          data-cat-id="${cat.id}"
        >
          <span class="cat-tab-ico">${getCategorySvgIcon(cat.id)}</span>
          <span>${cat.name}</span>
          <span class="cat-tab-count">${count}</span>
        </button>
      `;
    }).join("");

    container.innerHTML = tabsHtml + `<span class="tab-underline-bar" id="tabUnderline"></span>`;

    container.querySelectorAll(".cat-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        playSound("click");
        const catId = btn.getAttribute("data-cat-id") || "all";
        setActiveCategoryChip(catId);
        if (catId === "all") {
          const menuSec = document.getElementById("menu");
          menuSec?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
        } else {
          scrollToMenuCategory(catId);
        }
      });
    });

    requestAnimationFrame(positionTabUnderline);
  }

  function setActiveCategoryChip(catId, scrollChipIntoView = true) {
    state.activeCategory = catId;
    const container = document.getElementById("menuCategoryTabs");
    if (!container) return;
    let activeBtn = null;
    container.querySelectorAll(".cat-tab-btn").forEach((b) => {
      const active = b.getAttribute("data-cat-id") === catId;
      b.classList.toggle("active", active);
      b.setAttribute("aria-selected", String(active));
      if (active) activeBtn = b;
    });
    positionTabUnderline();
    if (scrollChipIntoView && activeBtn) {
      const scrollLeft = activeBtn.offsetLeft - container.clientWidth / 2 + activeBtn.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }

  function scrollToMenuCategory(catId) {
    if (state.searchQuery.trim() !== "" || state.activeFilters.size > 0) {
      resetAllMenuFilters();
    }
    setActiveCategoryChip(catId);
    const sec = document.getElementById(`cat-sec-${catId}`);
    if (sec) {
      const y = sec.getBoundingClientRect().top + window.scrollY - 125;
      window.scrollTo({ top: y, behavior: prefersReducedMotion ? "auto" : "smooth" });
    } else {
      document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
    }
  }

  function spyActiveMenuCategorySection(scrollY) {
    if (state.searchQuery.trim() !== "" || state.activeFilters.size > 0) return;
    const catSections = document.querySelectorAll(".menu-cat-section[data-cat-sec]");
    if (!catSections.length) return;
    let matchedCat = null;
    catSections.forEach((sec) => {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= 185 && rect.bottom >= 140) {
        matchedCat = sec.getAttribute("data-cat-sec");
      }
    });
    if (matchedCat && matchedCat !== state.activeCategory) {
      setActiveCategoryChip(matchedCat, true);
    }
  }

  function positionTabUnderline() {
    const container = document.getElementById("menuCategoryTabs");
    const activeBtn = container?.querySelector(".cat-tab-btn.active");
    const bar = document.getElementById("tabUnderline");
    if (!container || !activeBtn || !bar) return;

    bar.style.width = `${activeBtn.offsetWidth * 0.7}px`;
    bar.style.left = `${activeBtn.offsetLeft + activeBtn.offsetWidth * 0.15}px`;
  }

  function itemMatchesSearchAndFilters(item) {
    const q = state.searchQuery.trim().toLowerCase();
    if (q) {
      const hay = `${item.name} ${item.desc} ${(item.ingredients || []).join(" ")}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (state.activeFilters.has("popular") && !item.popular) return false;
    if (state.activeFilters.has("spicy") && !item.tags?.includes("spicy")) return false;
    if (state.activeFilters.has("veg") && !item.tags?.includes("veg")) return false;
    if (state.activeFilters.has("chicken") && !item.tags?.includes("chicken")) return false;
    if (state.activeFilters.has("meat") && !item.tags?.includes("meat")) return false;
    return true;
  }

  function renderDishCardHtml(item, isEager = false) {
    const isSpicy = item.tags?.includes("spicy");
    const isVeg = item.tags?.includes("veg");
    return `
      <article class="dish-card" data-dish-id="${item.id}" tabindex="0" role="button" aria-label="تخصيص وطلب ${item.name}" data-cursor="شوف">
        <div class="dish-media">
          <img
            src="${item.image}"
            width="800"
            height="600"
            decoding="async"
            alt="${item.name}"
            loading="${isEager ? "eager" : "lazy"}"
            onerror="this.onerror=null;this.src='${FALLBACK_FOOD_SVG}';"
          />
          ${item.popular ? `<span class="dish-popular-ribbon"><svg class="ui-svg-icon"><use href="#ico-flame"/></svg> الأكثر طلباً</span>` : ""}
          <div class="dish-diet-icons">
            ${isSpicy ? `<span class="diet-pill diet-spicy" title="حار"><svg class="ui-svg-icon"><use href="#ico-chili"/></svg></span>` : ""}
            ${isVeg ? `<span class="diet-pill diet-veg" title="نباتي"><svg class="ui-svg-icon"><use href="#ico-leaf"/></svg></span>` : ""}
          </div>
          <span class="dish-prep-tag"><svg class="ui-svg-icon"><use href="#ico-clock"/></svg> ${item.prepTime}</span>
        </div>
        <div class="dish-body">
          <h3 class="dish-title">${item.name}</h3>
          <p class="dish-desc">${item.desc}</p>
          <div class="dish-footer">
            <strong class="dish-price">${formatPrice(item.priceLbp)}</strong>
            <button type="button" class="dish-quick-add" data-quick-id="${item.id}" aria-label="إضافة سريعة لـ ${item.name}" data-cursor="اطلب">
              <span class="qa-plus-sign">+</span>
              <span class="qa-text-desktop">ضيف ع السلة</span>
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function bindDishCardEvents(scopeEl) {
    if (!scopeEl) return;
    scopeEl.querySelectorAll(".dish-card").forEach((card) => {
      if (card.dataset.bound === "1") return;
      card.dataset.bound = "1";
      const dishId = card.getAttribute("data-dish-id");
      const dish = ITEMS.find((d) => d.id === dishId);
      if (!dish) return;

      card.addEventListener("click", (e) => {
        if (e.target.closest(".dish-quick-add")) return;
        playSound("click");
        openDishModal(dish);
      });

      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openDishModal(dish);
        }
      });

      if (!isCoarsePointer && !prefersReducedMotion && window.innerWidth >= 992) {
        card.addEventListener("mousemove", (e) => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          card.style.transform = `perspective(850px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 7).toFixed(2)}deg) translateY(-4px)`;
        });
        card.addEventListener("mouseleave", () => {
          card.style.transform = "";
        });
      }
    });

    scopeEl.querySelectorAll(".dish-quick-add").forEach((btn) => {
      if (btn.dataset.bound === "1") return;
      btn.dataset.bound = "1";
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        btn.classList.remove("is-bouncing");
        void btn.offsetWidth;
        btn.classList.add("is-bouncing");
        const dish = ITEMS.find((d) => d.id === btn.getAttribute("data-quick-id"));
        if (dish) quickAddDish(dish);
      });
    });
  }

  function renderMenuItems(animateCards = false) {
    const grid = document.getElementById("menuGrid");
    const countLabel = document.getElementById("menuCountLabel");
    const resetBtn = document.getElementById("resetFiltersBtn");
    if (!grid) return;

    const isSearchOrFilterActive =
      state.searchQuery.trim() !== "" || state.activeFilters.size > 0;

    if (resetBtn) resetBtn.hidden = !isSearchOrFilterActive;

    const realCategories = CATEGORIES.filter((c) => c.id !== "all");
    let totalMatchedCount = 0;

    const sectionsHtml = realCategories
      .map((cat, catIdx) => {
        const rawCatItems = ITEMS.filter((it) => it.category === cat.id && itemMatchesSearchAndFilters(it));
        if (rawCatItems.length === 0) return "";

        totalMatchedCount += rawCatItems.length;

        // ترتيب الأصناف الأكثر طلباً أولاً في كل قسم
        const sortedItems = [...rawCatItems].sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));

        const isExpanded = isSearchOrFilterActive || state.expandedCategories.has(cat.id);
        const totalInCat = sortedItems.length;
        const canExpand = !isSearchOrFilterActive && totalInCat > INITIAL_ITEMS_PER_CATEGORY;

        let visibleLimit = INITIAL_ITEMS_PER_CATEGORY;
        if (isExpanded) {
          visibleLimit = state.categoryChunkLimits[cat.id] || Math.min(totalInCat, INITIAL_ITEMS_PER_CATEGORY + 8);
          if (isSearchOrFilterActive) visibleLimit = totalInCat;
        }

        const visibleItems = sortedItems.slice(0, visibleLimit);
        const nextCat = realCategories[(catIdx + 1) % realCategories.length];

        return `
          <section class="menu-cat-section ${isExpanded ? "is-expanded" : ""}" id="cat-sec-${cat.id}" data-cat-sec="${cat.id}">
            <header class="menu-cat-header" data-watermark="${cat.name}">
              <div class="mch-title-group">
                <span class="mch-icon">${getCategorySvgIcon(cat.id)}</span>
                <div class="mch-text">
                  <h3 class="mch-title">${cat.name}</h3>
                  <span class="mch-sub">محضّر طازة عند الطلب</span>
                </div>
              </div>
              <div class="mch-meta">
                <span class="mch-count-pill">${totalInCat} صنف</span>
              </div>
              <div class="mch-ornament-line" aria-hidden="true"></div>
            </header>

            <div class="menu-cat-grid" id="cat-grid-${cat.id}">
              ${visibleItems.map((item, i) => renderDishCardHtml(item, catIdx === 0 && i < 2)).join("")}
            </div>

            ${
              isExpanded && visibleLimit < totalInCat
                ? `<div class="cat-chunk-more-wrap">
                     <button type="button" class="btn btn-glass btn-sm btn-cat-chunk" data-cat-chunk="${cat.id}">
                       عرض باقي أصناف ${cat.name} (${totalInCat - visibleLimit}) ↓
                     </button>
                   </div>`
                : ""
            }

            ${
              canExpand
                ? `<div class="menu-cat-footer">
                     <button
                       type="button"
                       class="btn-cat-expand ${isExpanded ? "is-open" : ""}"
                       data-cat-expand="${cat.id}"
                       aria-expanded="${isExpanded}"
                     >
                       <span class="bce-label">${isExpanded ? "أخفي" : `شوف كل أصناف ${cat.name} (${totalInCat})`}</span>
                       <svg class="bce-arrow" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                         <polyline points="6 9 12 15 18 9"/>
                       </svg>
                     </button>
                     ${
                       isExpanded && nextCat && catIdx < realCategories.length - 1
                         ? `<a href="#cat-sec-${nextCat.id}" class="next-cat-flow-link" data-jump-next="${nextCat.id}">
                              <span>كمّل عالقسم التالي: ${nextCat.name}</span>
                              <span>↓</span>
                            </a>`
                         : ""
                     }
                   </div>`
                : ""
            }
          </section>
        `;
      })
      .filter(Boolean)
      .join("");

    if (countLabel) {
      countLabel.textContent = isSearchOrFilterActive
        ? `نتائج البحث والفلترة: ${totalMatchedCount} صنفاً مطابقاً`
        : `تصفّح أقسام المنيو الـ ${realCategories.length} (${ITEMS.length} صنفاً طازجاً)`;
    }

    if (!sectionsHtml) {
      grid.innerHTML = `
        <div class="empty-menu-state">
          <div class="empty-menu-svg"><svg class="ui-svg-icon ico-xl"><use href="#ico-wrap"/></svg></div>
          <h3>ما لقينا صنف يطابق بحثك حالياً</h3>
          <p class="muted-text">جرّب البحث بكلمة تانية متل "شاورما"، "برغر"، "جبنة" أو اضغط رجوع للمنيو.</p>
          <button type="button" class="btn btn-primary" id="emptyResetBtn">رجوع للمنيو ↺</button>
        </div>
      `;
      document.getElementById("emptyResetBtn")?.addEventListener("click", resetAllMenuFilters);
      return;
    }

    grid.innerHTML = sectionsHtml;
    bindDishCardEvents(grid);

    // ربط أزرار توسيع / طي القسم (شوف كل أصناف القسم / أخفي)
    grid.querySelectorAll("[data-cat-expand]").forEach((btn) => {
      btn.addEventListener("click", () => {
        playSound("click");
        const catId = btn.getAttribute("data-cat-expand");
        if (!catId) return;
        const wasExpanded = state.expandedCategories.has(catId);
        if (wasExpanded) {
          state.expandedCategories.delete(catId);
          delete state.categoryChunkLimits[catId];
          renderMenuItems(false);
          const secEl = document.getElementById(`cat-sec-${catId}`);
          if (secEl) {
            const topY = secEl.getBoundingClientRect().top + window.scrollY - 125;
            window.scrollTo({ top: topY, behavior: prefersReducedMotion ? "auto" : "smooth" });
          }
        } else {
          state.expandedCategories.add(catId);
          const totalCatCount = ITEMS.filter((it) => it.category === catId).length;
          state.categoryChunkLimits[catId] = Math.min(totalCatCount, INITIAL_ITEMS_PER_CATEGORY + 8);
          renderMenuItems(false);
        }
      });
    });

    // ربط زر تحميل الدفعة التالية داخل القسم الموسع (Chunking by 8)
    grid.querySelectorAll("[data-cat-chunk]").forEach((btn) => {
      btn.addEventListener("click", () => {
        playSound("click");
        const catId = btn.getAttribute("data-cat-chunk");
        if (!catId) return;
        const currentLim = state.categoryChunkLimits[catId] || INITIAL_ITEMS_PER_CATEGORY + 8;
        state.categoryChunkLimits[catId] = currentLim + 8;
        renderMenuItems(false);
      });
    });

    // ربط رابط الانتقال السلس للقسم التالي
    grid.querySelectorAll("[data-jump-next]").forEach((lnk) => {
      lnk.addEventListener("click", (e) => {
        e.preventDefault();
        const nextId = lnk.getAttribute("data-jump-next");
        if (nextId) scrollToMenuCategory(nextId);
      });
    });

    if (animateCards && !prefersReducedMotion && window.gsap) {
      window.gsap.fromTo(
        "#menuGrid .dish-card",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.32, stagger: 0.02, ease: "power2.out", clearProps: "transform,opacity" }
      );
    }
  }

  function resetAllMenuFilters() {
    state.activeCategory = "all";
    state.searchQuery = "";
    state.activeFilters.clear();
    const searchInput = document.getElementById("menuSearchInput");
    const clearBtn = document.getElementById("clearSearchBtn");
    if (searchInput) searchInput.value = "";
    if (clearBtn) clearBtn.hidden = true;
    document.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
    renderCategoryTabs();
    renderMenuItems(true);
  }

  function initMenuControls() {
    renderCategoryTabs();
    renderMenuItems(false);

    const searchInput = document.getElementById("menuSearchInput");
    const clearBtn = document.getElementById("clearSearchBtn");

    searchInput?.addEventListener("input", () => {
      state.searchQuery = searchInput.value;
      if (clearBtn) clearBtn.hidden = state.searchQuery.length === 0;
      renderMenuItems(false);
    });

    clearBtn?.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      state.searchQuery = "";
      clearBtn.hidden = true;
      renderMenuItems(true);
    });

    document.querySelectorAll(".filter-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        playSound("click");
        const f = chip.getAttribute("data-filter");
        if (!f) return;
        if (state.activeFilters.has(f)) {
          state.activeFilters.delete(f);
          chip.classList.remove("active");
        } else {
          state.activeFilters.add(f);
          chip.classList.add("active");
        }
        renderMenuItems(true);
      });
    });

    document.getElementById("resetFiltersBtn")?.addEventListener("click", resetAllMenuFilters);
    window.addEventListener("resize", positionTabUnderline);
  }

  // نافذة تخصيص الطبق (Dish Customizer Modal)
  function openDishModal(dish, preselectedAddons = []) {
    const modal = document.getElementById("dishModal");
    if (!modal || !dish) return;

    state.modalDish = dish;
    state.modalQty = 1;
    state.modalSizeId = "regular";
    state.modalAddons = new Set(preselectedAddons);
    state.modalSauces = new Set(["toum"]);

    const img = document.getElementById("dmImage");
    if (img) {
      img.src = dish.image;
      img.alt = dish.name;
      img.onerror = () => { img.src = FALLBACK_FOOD_SVG; };
    }

    document.getElementById("dishModalTitle").textContent = dish.name;
    document.getElementById("dmDesc").textContent = dish.desc;
    document.getElementById("dmPrepTime").innerHTML = `<svg class="ui-svg-icon"><use href="#ico-clock"/></svg> التحضير: ${dish.prepTime}`;
    document.getElementById("dmCalories").innerHTML = `<svg class="ui-svg-icon"><use href="#ico-flame"/></svg> ${dish.calories}`;
    document.getElementById("dmQtyVal").textContent = "1";
    document.getElementById("dmSpecialNote").value = "";

    const badges = document.getElementById("dmBadges");
    if (badges) {
      badges.innerHTML = [
        dish.popular ? `<span class="sticker-badge badge-gold"><svg class="ui-svg-icon"><use href="#ico-flame"/></svg> الأكثر طلباً</span>` : "",
        dish.tags?.includes("spicy") ? `<span class="sticker-badge"><svg class="ui-svg-icon"><use href="#ico-chili"/></svg> نكهة حارة</span>` : "",
        dish.tags?.includes("veg") ? `<span class="sticker-badge badge-green"><svg class="ui-svg-icon"><use href="#ico-leaf"/></svg> نباتي</span>` : ""
      ].join("");
    }

    const ingWrap = document.getElementById("dmIngredients");
    if (ingWrap) {
      ingWrap.innerHTML = (dish.ingredients || []).map((i) => `<span>${i}</span>`).join("");
    }

    // تحديد الأحجام المناسبة حسب نوع الصنف
    const isDrink = dish.category === "drinks";
    const isSweetOrSide = dish.category === "desserts" || dish.category === "salads" || dish.category === "appetizers";
    const sizesPool = isDrink ? CUSTOMIZER.drinkSizes : CUSTOMIZER.sizes;

    const sizesList = document.getElementById("dmSizesList");
    const sizesSec = document.getElementById("dmSizesSection");
    if (sizesSec && sizesList) {
      sizesSec.hidden = isSweetOrSide;
      sizesList.innerHTML = sizesPool
        .map(
          (sz, idx) => `
        <label class="dm-opt-row">
          <span class="dm-opt-left">
            <input type="radio" name="dmSize" value="${sz.id}" ${idx === 0 ? "checked" : ""} />
            <span>${sz.label}</span>
          </span>
          <span class="dm-opt-price">${sz.priceAddLbp > 0 ? `+ ${formatPrice(sz.priceAddLbp)}` : "مشمول"}</span>
        </label>
      `
        )
        .join("");

      sizesList.querySelectorAll('input[name="dmSize"]').forEach((r) => {
        r.addEventListener("change", () => {
          state.modalSizeId = r.value;
          updateDishModalPrice();
        });
      });
    }

    // الإضافات والتعديلات
    const addonsSec = document.getElementById("dmAddonsSection");
    const addonsList = document.getElementById("dmAddonsList");
    const hideAddons = isDrink || dish.category === "desserts";
    if (addonsSec && addonsList) {
      addonsSec.hidden = hideAddons;
      addonsList.innerHTML = (CUSTOMIZER.addons || [])
        .map(
          (ad) => `
        <label class="dm-opt-row">
          <span class="dm-opt-left">
            <input type="checkbox" value="${ad.id}" ${state.modalAddons.has(ad.id) ? "checked" : ""} />
            <span>${ad.label}</span>
          </span>
          <span class="dm-opt-price">${ad.priceAddLbp > 0 ? `+ ${formatPrice(ad.priceAddLbp)}` : "مجاناً"}</span>
        </label>
      `
        )
        .join("");

      addonsList.querySelectorAll('input[type="checkbox"]').forEach((chk) => {
        chk.addEventListener("change", () => {
          if (chk.checked) state.modalAddons.add(chk.value);
          else state.modalAddons.delete(chk.value);
          updateDishModalPrice();
        });
      });
    }

    // الصوصات
    const saucesSec = document.getElementById("dmSaucesSection");
    const saucesList = document.getElementById("dmSaucesList");
    if (saucesSec && saucesList) {
      saucesSec.hidden = isDrink || dish.category === "desserts";
      saucesList.innerHTML = (CUSTOMIZER.sauces || [])
        .map(
          (sc) => `
        <button type="button" class="sauce-chip ${state.modalSauces.has(sc.id) ? "selected" : ""}" data-sauce-id="${sc.id}">
          ${sc.label}
        </button>
      `
        )
        .join("");

      saucesList.querySelectorAll(".sauce-chip").forEach((btn) => {
        btn.addEventListener("click", () => {
          const sid = btn.getAttribute("data-sauce-id");
          if (state.modalSauces.has(sid)) {
            state.modalSauces.delete(sid);
            btn.classList.remove("selected");
          } else {
            state.modalSauces.add(sid);
            btn.classList.add("selected");
          }
        });
      });
    }

    updateDishModalPrice();
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    syncStickyBarVisibility();
  }

  function getModalUnitPriceLbp() {
    const dish = state.modalDish;
    if (!dish) return 0;
    let unit = dish.priceLbp;
    const isDrink = dish.category === "drinks";
    const isSweetOrSide = dish.category === "desserts" || dish.category === "salads" || dish.category === "appetizers";

    if (!isSweetOrSide) {
      const sizesPool = isDrink ? CUSTOMIZER.drinkSizes : CUSTOMIZER.sizes;
      const sz = sizesPool.find((s) => s.id === state.modalSizeId);
      if (sz) unit += sz.priceAddLbp;
    }

    if (!isDrink && dish.category !== "desserts") {
      state.modalAddons.forEach((adId) => {
        const ad = CUSTOMIZER.addons.find((a) => a.id === adId);
        if (ad) unit += ad.priceAddLbp;
      });
    }
    return unit;
  }

  function updateDishModalPrice() {
    const total = getModalUnitPriceLbp() * state.modalQty;
    const el = document.getElementById("dmLivePrice");
    if (el) el.innerHTML = formatPrice(total);
  }

  function closeDishModal() {
    const modal = document.getElementById("dishModal");
    if (modal) modal.hidden = true;
    document.body.style.overflow = "";
    syncStickyBarVisibility();
  }

  function initDishModalEvents() {
    document.getElementById("closeDishModalBtn")?.addEventListener("click", closeDishModal);
    document.getElementById("dishModal")?.addEventListener("click", (e) => {
      if (e.target.id === "dishModal") closeDishModal();
    });

    document.getElementById("dmQtyMinus")?.addEventListener("click", () => {
      if (state.modalQty > 1) {
        state.modalQty--;
        document.getElementById("dmQtyVal").textContent = String(state.modalQty);
        updateDishModalPrice();
      }
    });

    document.getElementById("dmQtyPlus")?.addEventListener("click", () => {
      state.modalQty = Math.min(25, state.modalQty + 1);
      document.getElementById("dmQtyVal").textContent = String(state.modalQty);
      updateDishModalPrice();
    });

    document.getElementById("dmAddToCartBtn")?.addEventListener("click", () => {
      const dish = state.modalDish;
      if (!dish) return;
      const unitPrice = getModalUnitPriceLbp();
      const parts = [];

      const isDrink = dish.category === "drinks";
      const isSweetOrSide = dish.category === "desserts" || dish.category === "salads" || dish.category === "appetizers";
      if (!isSweetOrSide) {
        const pool = isDrink ? CUSTOMIZER.drinkSizes : CUSTOMIZER.sizes;
        const sz = pool.find((s) => s.id === state.modalSizeId);
        if (sz && sz.id !== "regular") parts.push(sz.label);
      }
      if (!isDrink && dish.category !== "desserts") {
        state.modalAddons.forEach((id) => {
          const ad = CUSTOMIZER.addons.find((a) => a.id === id);
          if (ad) parts.push(ad.label);
        });
        const saucesNames = Array.from(state.modalSauces)
          .map((id) => CUSTOMIZER.sauces.find((s) => s.id === id)?.label)
          .filter(Boolean);
        if (saucesNames.length > 0) parts.push(`الصوص: ${saucesNames.join("، ")}`);
      }
      const note = document.getElementById("dmSpecialNote")?.value.trim();
      if (note) parts.push(`ملاحظة: ${note}`);

      const modsSummary = parts.join(" | ") || "تحضير كلاسيكي عَ الأصول";
      const uid = `${dish.id}::${modsSummary}`;

      addItemToCart({
        uid,
        id: dish.id,
        name: dish.name,
        image: dish.image,
        unitPriceLbp: unitPrice,
        qty: state.modalQty,
        modsSummary
      });
      closeDishModal();
    });
  }

  // ماكينة الحظ "فاجئني" (Slot Machine Random Combo Picker)
  function initSurpriseSlotMachine() {
    const modal = document.getElementById("surpriseModal");
    const mains = ITEMS.filter((i) => i.comboRole === "main");
    const sides = ITEMS.filter((i) => i.comboRole === "side");
    const drinks = ITEMS.filter((i) => i.comboRole === "drink");

    function runSlotAnimation() {
      playSound("click");
      const rMain = document.getElementById("reelMain");
      const rSide = document.getElementById("reelSide");
      const rDrink = document.getElementById("reelDrink");
      [rMain, rSide, rDrink].forEach((r) => r?.classList.add("spinning"));

      let ticks = 0;
      const interval = setInterval(() => {
        ticks++;
        playSound("tick");
        const m = mains[Math.floor(Math.random() * mains.length)];
        const s = sides[Math.floor(Math.random() * sides.length)];
        const d = drinks[Math.floor(Math.random() * drinks.length)];

        if (ticks <= 10 && rMain) rMain.querySelector(".reel-name").textContent = m.name;
        if (ticks === 10) {
          rMain?.classList.remove("spinning");
          state.surpriseCombo.main = m;
        }

        if (ticks <= 15 && rSide) rSide.querySelector(".reel-name").textContent = s.name;
        if (ticks === 15) {
          rSide?.classList.remove("spinning");
          state.surpriseCombo.side = s;
        }

        if (ticks <= 20 && rDrink) rDrink.querySelector(".reel-name").textContent = d.name;
        if (ticks >= 20) {
          clearInterval(interval);
          rDrink?.classList.remove("spinning");
          state.surpriseCombo.drink = d;
          updateSurprisePriceUI();
          playSound("win");
          launchConfetti(55);
        }
      }, prefersReducedMotion ? 15 : 65);
    }

    function openSurprise() {
      if (!modal) return;
      modal.hidden = false;
      document.body.style.overflow = "hidden";
      syncStickyBarVisibility();
      runSlotAnimation();
    }

    function closeSurprise() {
      if (modal) modal.hidden = true;
      document.body.style.overflow = "";
      syncStickyBarVisibility();
    }

    document.getElementById("openSurpriseModalBtn")?.addEventListener("click", openSurprise);
    document.getElementById("heroSurpriseBtn")?.addEventListener("click", openSurprise);
    document.getElementById("closeSurpriseModalBtn")?.addEventListener("click", closeSurprise);
    modal?.addEventListener("click", (e) => {
      if (e.target === modal) closeSurprise();
    });
    document.getElementById("respinSlotBtn")?.addEventListener("click", runSlotAnimation);

    document.getElementById("addSurpriseComboBtn")?.addEventListener("click", () => {
      const { main, side, drink } = state.surpriseCombo;
      if (!main || !side || !drink) return;
      const rawTotal = main.priceLbp + side.priceLbp + drink.priceLbp;
      const discounted = Math.round(rawTotal * (1 - AGENCY_QUICK_CONFIG.surpriseDiscountRate));
      addItemToCart({
        uid: `surprise-${main.id}-${side.id}-${drink.id}`,
        id: "surprise-combo",
        name: "وجبة فاجئني الذكية (خصم 10%)",
        image: main.image,
        unitPriceLbp: discounted,
        qty: 1,
        modsSummary: `${main.name} + ${side.name} + ${drink.name}`
      });
      closeSurprise();
    });
  }

  function updateSurprisePriceUI() {
    const { main, side, drink } = state.surpriseCombo;
    if (!main || !side || !drink) return;
    const rawTotal = main.priceLbp + side.priceLbp + drink.priceLbp;
    const discounted = Math.round(rawTotal * (1 - AGENCY_QUICK_CONFIG.surpriseDiscountRate));
    const lbl = document.getElementById("surpriseTotalLabel");
    if (lbl) lbl.innerHTML = formatPrice(discounted);
  }

  // ==========================================================================
  // 6. مصمّم الوجبات التفاعلي (BUILD-YOUR-MEAL COMBO BUILDER)
  // ==========================================================================
  const COMBO_ROLES = ["main", "side", "drink", "dessert"];
  const SLOT_PLACEHOLDERS = {
    main: `<svg class="ui-svg-icon"><use href="#ico-wrap"/></svg> اختر الصنف الرئيسي`,
    side: `<svg class="ui-svg-icon"><use href="#ico-fries"/></svg> اختر المقبلات والبطاطا`,
    drink: `<svg class="ui-svg-icon"><use href="#ico-drink"/></svg> اختر المشروب البارد`,
    dessert: `<svg class="ui-svg-icon"><use href="#ico-dessert"/></svg> اختر تحلاية الضيعة`
  };

  function initComboBuilder() {
    state.comboSelection.main = ITEMS.find((i) => i.id === "sw-shawarma-chicken") || null;

    document.querySelectorAll(".combo-step-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        playSound("click");
        state.comboStep = Number(tab.getAttribute("data-step")) || 0;
        renderComboStepOptions();
      });
    });

    document.getElementById("comboPrevStepBtn")?.addEventListener("click", () => {
      if (state.comboStep > 0) {
        playSound("click");
        state.comboStep--;
        renderComboStepOptions();
      }
    });

    document.getElementById("comboNextStepBtn")?.addEventListener("click", () => {
      if (state.comboStep < 3) {
        playSound("click");
        state.comboStep++;
        renderComboStepOptions();
      }
    });

    document.getElementById("addComboToCartBtn")?.addEventListener("click", () => {
      const { main, side, drink, dessert } = state.comboSelection;
      if (!main || !side || !drink || !dessert) return;
      const sum = main.priceLbp + side.priceLbp + drink.priceLbp + dessert.priceLbp;
      const finalPrice = Math.round(sum * (1 - AGENCY_QUICK_CONFIG.comboDiscountRate));

      addItemToCart({
        uid: `combo-${main.id}-${side.id}-${drink.id}-${dessert.id}`,
        id: "custom-combo",
        name: "صينية الضيعة المخصصة (خصم 15%)",
        image: main.image,
        unitPriceLbp: finalPrice,
        qty: 1,
        modsSummary: `${main.name} | ${side.name} | ${drink.name} | ${dessert.name}`
      });
      launchConfetti(50);
    });

    renderComboStepOptions();
    renderComboTray();
  }

  function renderComboStepOptions() {
    const role = COMBO_ROLES[state.comboStep];
    const grid = document.getElementById("comboOptionsGrid");
    if (!grid) return;

    let activeStepTab = null;
    document.querySelectorAll(".combo-step-tab").forEach((tab, idx) => {
      const r = COMBO_ROLES[idx];
      const isAct = idx === state.comboStep;
      tab.classList.toggle("active", isAct);
      tab.classList.toggle("completed", Boolean(state.comboSelection[r]));
      if (isAct) activeStepTab = tab;
    });

    if (activeStepTab && activeStepTab.parentElement) {
      const nav = activeStepTab.parentElement;
      const targetLeft = activeStepTab.offsetLeft - nav.clientWidth / 2 + activeStepTab.offsetWidth / 2;
      nav.scrollTo({ left: targetLeft, behavior: "smooth" });
    }

    const prevBtn = document.getElementById("comboPrevStepBtn");
    const nextBtn = document.getElementById("comboNextStepBtn");
    if (prevBtn) prevBtn.disabled = state.comboStep === 0;
    if (nextBtn) nextBtn.disabled = state.comboStep === 3;

    const pool = ITEMS.filter((i) => i.comboRole === role).slice(0, 12);
    const currentSelected = state.comboSelection[role];

    grid.innerHTML = pool
      .map(
        (item) => `
      <button
        type="button"
        class="combo-pick-card ${currentSelected?.id === item.id ? "selected" : ""}"
        data-combo-item="${item.id}"
      >
        <img src="${item.image}" alt="${item.name}" width="800" height="600" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${FALLBACK_FOOD_SVG}';" />
        <div class="combo-pick-info">
          <strong>${item.name}</strong>
          <span>${formatPrice(item.priceLbp)}</span>
        </div>
      </button>
    `
      )
      .join("");

    grid.querySelectorAll(".combo-pick-card").forEach((btn) => {
      btn.addEventListener("click", () => {
        playSound("pop");
        const picked = ITEMS.find((i) => i.id === btn.getAttribute("data-combo-item"));
        if (!picked) return;
        state.comboSelection[role] = picked;
        renderComboStepOptions();
        renderComboTray();
        if (state.comboStep < 3) {
          setTimeout(() => {
            state.comboStep++;
            renderComboStepOptions();
          }, 220);
        }
      });
    });
  }

  function renderComboTray() {
    const board = document.getElementById("visualTrayBoard");
    if (!board) return;

    let rawSum = 0;
    let filledCount = 0;

    COMBO_ROLES.forEach((role) => {
      const slot = board.querySelector(`[data-slot="${role}"]`);
      const item = state.comboSelection[role];
      if (!slot) return;

      if (item) {
        filledCount++;
        rawSum += item.priceLbp;
        slot.classList.add("filled");
        slot.innerHTML = `
          <img src="${item.image}" alt="${item.name}" width="160" height="120" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${FALLBACK_FOOD_SVG}';" />
          <strong>${item.name}</strong>
        `;
      } else {
        slot.classList.remove("filled");
        slot.innerHTML = `<span class="slot-placeholder">${SLOT_PLACEHOLDERS[role]}</span>`;
      }
    });

    const saved = Math.round(rawSum * AGENCY_QUICK_CONFIG.comboDiscountRate);
    const finalPrice = rawSum - saved;

    const origEl = document.getElementById("comboOriginalPrice");
    const savedEl = document.getElementById("comboSavedPrice");
    const finalEl = document.getElementById("comboFinalPrice");
    if (origEl) origEl.innerHTML = formatPrice(rawSum);
    if (savedEl) savedEl.innerHTML = `- ${formatPrice(saved)}`;
    if (finalEl) finalEl.innerHTML = formatPrice(finalPrice);

    const addBtn = document.getElementById("addComboToCartBtn");
    if (addBtn) {
      const complete = filledCount === 4;
      addBtn.disabled = !complete;
      addBtn.innerHTML = complete
        ? `<svg class="ui-svg-icon"><use href="#ico-bag"/></svg> <span>أضف وجبتك بخصم 15% (${formatPrice(finalPrice)})</span>`
        : `<span>اختر باقي الأصناف (${filledCount}/4) لتفعيل الخصم</span>`;
    }
  }

  // ==========================================================================
  // 7. سلة الطلبات، مناطق التوصيل، الدفع المتعدد الخطوات والواتساب
  // ==========================================================================
  function quickAddDish(dish) {
    addItemToCart({
      uid: `${dish.id}::default`,
      id: dish.id,
      name: dish.name,
      image: dish.image,
      unitPriceLbp: dish.priceLbp,
      qty: 1,
      modsSummary: "تحضير كلاسيكي عَ الأصول"
    });
  }

  function addItemToCart(newItem) {
    playSound("pop");
    const existing = state.cart.find((c) => c.uid === newItem.uid);
    if (existing) {
      existing.qty += newItem.qty;
    } else {
      state.cart.push({ ...newItem });
    }
    saveCart();
    renderCart();

    const badge = document.getElementById("navCartCount");
    if (badge) {
      badge.classList.remove("bump");
      void badge.offsetWidth;
      badge.classList.add("bump");
    }
    showToast(`انضافت "${newItem.name}" ع السلة، صحتين وعافية!`);
  }

  function getSelectedZone() {
    return (
      CFG.deliveryZones.find((z) => z.id === state.selectedZoneId) ||
      CFG.deliveryZones[0]
    );
  }

  function calculateCartTotals() {
    const subtotal = state.cart.reduce((acc, item) => acc + item.unitPriceLbp * item.qty, 0);
    const totalCount = state.cart.reduce((acc, item) => acc + item.qty, 0);

    let discount = 0;
    if (state.appliedPromo && subtotal > 0) {
      const rule = CFG.promoCodes[state.appliedPromo];
      if (rule) {
        discount =
          rule.type === "percent"
            ? Math.round((subtotal * rule.value) / 100)
            : Math.min(subtotal, rule.value);
      }
    }

    const zone = getSelectedZone();
    const deliveryFee = state.orderMode === "delivery" && subtotal > 0 ? zone.feeLbp : 0;
    const tip = state.orderMode === "delivery" && subtotal > 0 ? state.driverTipLbp : 0;
    const grandTotal = Math.max(0, subtotal - discount + deliveryFee + tip);

    return { subtotal, totalCount, discount, deliveryFee, tip, grandTotal, zone };
  }

  function applyPromoCode(rawCode, silentIfInvalid = false) {
    const code = (rawCode || "").trim().toUpperCase();
    const rule = CFG.promoCodes[code];
    const tag = document.getElementById("promoAppliedTag");
    const input = document.getElementById("cartPromoInput");

    if (!rule) {
      if (!silentIfInvalid) {
        showToast("هالكود مش شغال — جرّب DAY3A20 أو لفّ العجلة!");
      }
      return false;
    }

    state.appliedPromo = code;
    if (input) input.value = code;
    if (tag) {
      tag.hidden = false;
      tag.innerHTML = `<svg class="ui-svg-icon"><use href="#ico-check"/></svg> مفعّل: ${rule.label} (${code})`;
    }
    renderCart();
    return true;
  }

  function renderCart() {
    const { subtotal, totalCount, discount, deliveryFee, tip, grandTotal, zone } = calculateCartTotals();

    // مصدر واحد للحقيقة لكافة عدادات السلة والشريط السفلي (Single Source of Truth — Part 1.4)
    const navCount = document.getElementById("navCartCount");
    const floatCount = document.getElementById("floatingCartCount");
    const floatTotal = document.getElementById("floatingCartTotal");
    const mobCount = document.getElementById("mobileBarCount");
    const mobTotal = document.getElementById("mobileBarTotal");

    if (navCount) navCount.textContent = String(totalCount);
    if (floatCount) floatCount.textContent = String(totalCount);
    if (floatTotal) floatTotal.innerHTML = formatPrice(grandTotal);
    if (mobCount) mobCount.textContent = String(totalCount);
    if (mobTotal) {
      mobTotal.innerHTML = formatPrice(grandTotal);
    }

    // تحديث تسميات أزرار الإكرامية حسب العملة
    document.querySelectorAll(".tip-pill[data-tip-label]").forEach((btn) => {
      const amt = Number(btn.getAttribute("data-tip-label"));
      btn.innerHTML = formatPrice(amt);
    });

    // تحديث قائمة المناطق بنظام المستويين
    const mainSelect = document.getElementById("cartMainRegionSelect");
    const subSelect = document.getElementById("cartSubZoneSelect");
    const zoneSelect = document.getElementById("cartZoneSelect");

    const curZone = CFG.deliveryZones.find((z) => z.id === state.selectedZoneId) || CFG.deliveryZones[0];
    const curRegionId = curZone ? curZone.regionId : (CFG.deliveryRegions[0]?.id || "tripoli");

    if (mainSelect) {
      if (mainSelect.children.length === 0) {
        mainSelect.innerHTML = (CFG.deliveryRegions || []).map((r) =>
          `<option value="${r.id}" ${r.id === curRegionId ? "selected" : ""}>${r.name}</option>`
        ).join("");
      } else if (mainSelect.value !== curRegionId) {
        mainSelect.value = curRegionId;
      }
    }

    if (subSelect) {
      const activeReg = (CFG.deliveryRegions || []).find((r) => r.id === (mainSelect ? mainSelect.value : curRegionId)) || CFG.deliveryRegions[0];
      const zonesInReg = activeReg ? (activeReg.subZones || activeReg.zones || []) : [];
      subSelect.innerHTML = zonesInReg
        .map(
          (z) =>
            `<option value="${z.id}" ${z.id === state.selectedZoneId ? "selected" : ""}>${z.name} (+${formatPricePlain(z.feeLbp)})</option>`
        )
        .join("");
    }

    if (zoneSelect) {
      zoneSelect.innerHTML = CFG.deliveryZones
        .map(
          (z) =>
            `<option value="${z.id}" ${z.id === state.selectedZoneId ? "selected" : ""}>${z.name} (+${formatPricePlain(z.feeLbp)})</option>`
        )
        .join("");
      zoneSelect.value = state.selectedZoneId;
    }

    const zoneBox = document.getElementById("cartZoneBox");
    const tipWrap = document.getElementById("tipSelectorWrap");
    const headerEta = document.getElementById("cartHeaderEta");
    if (zoneBox) zoneBox.hidden = state.orderMode !== "delivery";
    if (tipWrap) tipWrap.hidden = state.orderMode !== "delivery";
    if (headerEta) {
      headerEta.textContent =
        state.orderMode === "delivery"
          ? `التوصيل المتوقع: ${zone.eta}`
          : "جاهز للاستلام من الفرع خلال 15 دقيقة";
    }

    // شريط الحد الأدنى للتوصيل
    const minNotice = document.getElementById("minOrderNotice");
    const minFill = document.getElementById("minOrderFill");
    if (minNotice && minFill && zone) {
      const pct = Math.min(100, Math.round((subtotal / zone.minOrderLbp) * 100));
      minFill.style.width = `${pct}%`;
      if (subtotal >= zone.minOrderLbp) {
        minNotice.innerHTML = `<svg class="ui-svg-icon"><use href="#ico-check"/></svg> ممتاز! وصلت للحد الأدنى للتوصيل في منطقتك.`;
      } else {
        const rem = zone.minOrderLbp - subtotal;
        minNotice.innerHTML = `أضف بقيمة ${formatPrice(rem)} للوصول للحد الأدنى (${formatPrice(zone.minOrderLbp)})`;
      }
    }

    // قائمة العناصر بتصميم الشبكة الواضحة من صفين (Part 1.2)
    const listEl = document.getElementById("cartItemsList");
    const extrasBlock = document.getElementById("cartExtrasBlock");
    const sumBox = document.getElementById("cartSummaryBox");
    const footerActions = document.getElementById("cartFooterActions");

    if (listEl) {
      if (state.cart.length === 0) {
        listEl.innerHTML = `
          <div class="cart-empty-msg">
            <div class="empty-cart-svg-wrap">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </div>
            <strong>سلتك بعدها فاضية يا هلا فيك!</strong>
            <p>اختر شاورما، برغر، أو جرب حاسبة السهرة لنحضّرلك أطيب لقمة سخنة فوراً.</p>
          </div>
        `;
        if (extrasBlock) extrasBlock.hidden = true;
        if (sumBox) sumBox.hidden = true;
        if (footerActions) footerActions.hidden = true;
      } else {
        if (extrasBlock) extrasBlock.hidden = false;
        if (sumBox) sumBox.hidden = false;
        if (footerActions) footerActions.hidden = false;

        listEl.innerHTML = state.cart
          .map(
            (item, idx) => `
          <div class="cart-item-card cart-item">
            <img class="ci-thumb" src="${item.image}" alt="${item.name}" width="128" height="96" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${FALLBACK_FOOD_SVG}';" />
            <div class="ci-info">
              <div class="ci-top">
                <strong class="ci-title">${item.name}</strong>
                <button type="button" class="ci-remove" data-rm-idx="${idx}" aria-label="حذف الصنف">✕</button>
              </div>
              <div class="ci-mods">${item.modsSummary || ""}</div>
            </div>
            <div class="ci-bottom">
              <div class="ci-qty">
                <button type="button" data-dec-idx="${idx}" aria-label="تقليل">−</button>
                <span>${item.qty}</span>
                <button type="button" data-inc-idx="${idx}" aria-label="زيادة">+</button>
              </div>
              <span class="ci-price">${formatPrice(item.unitPriceLbp * item.qty)}</span>
            </div>
          </div>
        `
          )
          .join("");

        listEl.querySelectorAll("[data-inc-idx]").forEach((b) => {
          b.addEventListener("click", () => {
            const idx = Number(b.getAttribute("data-inc-idx"));
            state.cart[idx].qty++;
            saveCart();
            renderCart();
          });
        });
        listEl.querySelectorAll("[data-dec-idx]").forEach((b) => {
          b.addEventListener("click", () => {
            const idx = Number(b.getAttribute("data-dec-idx"));
            if (state.cart[idx].qty > 1) state.cart[idx].qty--;
            else state.cart.splice(idx, 1);
            saveCart();
            renderCart();
          });
        });
        listEl.querySelectorAll("[data-rm-idx]").forEach((b) => {
          b.addEventListener("click", () => {
            const idx = Number(b.getAttribute("data-rm-idx"));
            state.cart.splice(idx, 1);
            saveCart();
            renderCart();
          });
        });
      }
    }

    // تحديث ملخص المبالغ
    const subEl = document.getElementById("sumSubtotal");
    if (subEl) subEl.innerHTML = formatPrice(subtotal);
    const discRow = document.getElementById("sumDiscountRow");
    if (discRow) {
      discRow.hidden = discount <= 0;
      const dEl = document.getElementById("sumDiscount");
      if (dEl) dEl.innerHTML = `- ${formatPrice(discount)}`;
    }
    const delRow = document.getElementById("sumDeliveryRow");
    if (delRow) {
      delRow.hidden = state.orderMode !== "delivery";
      const dlEl = document.getElementById("sumDelivery");
      if (dlEl) dlEl.innerHTML = formatPrice(deliveryFee);
    }
    const tipRow = document.getElementById("sumTipRow");
    if (tipRow) {
      tipRow.hidden = tip <= 0;
      const tEl = document.getElementById("sumTip");
      if (tEl) tEl.innerHTML = formatPrice(tip);
    }
    const grandEl = document.getElementById("sumGrandTotal");
    if (grandEl) grandEl.innerHTML = formatPrice(grandTotal);
    const chkFinal = document.getElementById("chkFinalAmount");
    if (chkFinal) chkFinal.innerHTML = formatDualPrice(grandTotal);
  }

  function switchCartView(viewName) {
    document.getElementById("cartBagView").hidden = viewName !== "bag";
    document.getElementById("cartCheckoutView").hidden = viewName !== "checkout";
    document.getElementById("cartSuccessView").hidden = viewName !== "done";
    document.querySelectorAll(".c-step").forEach((s) => {
      s.classList.toggle("active", s.getAttribute("data-cview") === viewName);
    });
    const addrGroup = document.getElementById("chkAddressGroup");
    if (addrGroup) addrGroup.hidden = state.orderMode !== "delivery";
  }

  function openCartDrawer() {
    playSound("click");
    const drawer = document.getElementById("cartDrawer");
    const backdrop = document.getElementById("cartBackdrop");
    if (!drawer || !backdrop) return;
    switchCartView("bag");
    renderCart();
    backdrop.hidden = false;
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    syncStickyBarVisibility();
  }

  function closeCartDrawer() {
    const drawer = document.getElementById("cartDrawer");
    const backdrop = document.getElementById("cartBackdrop");
    if (!drawer || !backdrop) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    setTimeout(() => { backdrop.hidden = true; }, 350);
    document.body.style.overflow = "";
    syncStickyBarVisibility();
  }

  function buildWhatsAppOrderUrl(customerInfo = null) {
    const { subtotal, discount, deliveryFee, tip, grandTotal, zone } = calculateCartTotals();
    const lines = [];

    lines.push(`مرحبا سناك الضيعة، بدي ثبّت طلبيتي لو سمحتوا`);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━`);

    lines.push(`*معلومات الطلب:*`);
    lines.push(`• طريقة الاستلام: ${state.orderMode === "delivery" ? "توصيل لعند البيت (دليفري)" : "استلام من الفرع"}`);
    if (state.orderMode === "delivery" && zone) {
      lines.push(`• المنطقة والحي: ${zone.regionName ? `${zone.regionName} — ` : ""}${zone.shortName || zone.name}`);
    }

    if (customerInfo) {
      if (customerInfo.name) lines.push(`• اسم الزبون: ${customerInfo.name}`);
      if (customerInfo.phone) lines.push(`• رقم التلفون: ${customerInfo.phone}`);
      if (state.orderMode === "delivery" && customerInfo.address) {
        lines.push(`• العنوان التفصيلي: ${customerInfo.address}`);
      }
      if (customerInfo.payMethod) lines.push(`• طريقة الدفع: ${customerInfo.payMethod}`);
      if (customerInfo.notes) lines.push(`• ملاحظات إضافية: ${customerInfo.notes}`);
    }

    lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
    const totalItemsCount = state.cart.reduce((s, it) => s + it.qty, 0);
    lines.push(`*الأصناف المطلوبة (${totalItemsCount}):*`);
    state.cart.forEach((item, i) => {
      const lineTotal = item.unitPriceLbp * item.qty;
      lines.push(`${i + 1}. *${item.qty}× ${item.name}* = ${formatDualPricePlain(lineTotal)}`);
      if (item.modsSummary && item.modsSummary.trim().length > 0) {
        lines.push(`   └ التخصيص: ${item.modsSummary}`);
      }
    });

    lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`*ملخص الفاتورة:*`);
    lines.push(`• المجموع الفرعي: ${formatDualPricePlain(subtotal)}`);
    if (discount > 0) {
      lines.push(`• الخصم المطبق (${state.appliedPromo || "كود خصم"}): -${formatDualPricePlain(discount)}`);
    }
    if (state.orderMode === "delivery" && deliveryFee > 0) {
      lines.push(`• رسم التوصيل (${zone?.shortName || zone?.name || "دليفري"}): ${formatDualPricePlain(deliveryFee)}`);
    }
    if (tip > 0) {
      lines.push(`• إكرامية المندوب: ${formatDualPricePlain(tip)}`);
    }
    lines.push(`★ *الإجمالي النهائي: ${formatDualPricePlain(grandTotal)}*`);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`يسلم دياتكم، ناطركن تنورونا!`);

    return `https://wa.me/${CFG.whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
  }

  function initCartAndCheckout() {
    renderCart();

    document.getElementById("cartNavBtn")?.addEventListener("click", openCartDrawer);
    document.getElementById("floatingCartBtn")?.addEventListener("click", openCartDrawer);
    document.getElementById("mobileStickyCartBtn")?.addEventListener("click", openCartDrawer);

    document.getElementById("closeCartBtn")?.addEventListener("click", closeCartDrawer);
    document.getElementById("cartBackdrop")?.addEventListener("click", closeCartDrawer);

    document.querySelectorAll(".mode-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        playSound("click");
        state.orderMode = btn.getAttribute("data-mode") || "delivery";
        document.querySelectorAll(".mode-btn").forEach((b) => b.classList.toggle("active", b === btn));
        renderCart();
      });
    });

    document.getElementById("cartMainRegionSelect")?.addEventListener("change", (e) => {
      const regId = e.target.value;
      const reg = (CFG.deliveryRegions || []).find((r) => r.id === regId);
      const zones = reg ? (reg.subZones || reg.zones || []) : [];
      if (zones.length > 0) {
        state.selectedZoneId = zones[0].id;
        renderCart();
      }
    });

    document.getElementById("cartSubZoneSelect")?.addEventListener("change", (e) => {
      state.selectedZoneId = e.target.value;
      renderCart();
    });

    document.getElementById("cartZoneSelect")?.addEventListener("change", (e) => {
      state.selectedZoneId = e.target.value;
      renderCart();
    });

    document.getElementById("applyCartPromoBtn")?.addEventListener("click", () => {
      const code = document.getElementById("cartPromoInput")?.value;
      if (applyPromoCode(code, false)) {
        playSound("pop");
        showToast("تكرم عينك! انحسم الخصم من سلتك");
      }
    });

    document.querySelectorAll(".tip-pill").forEach((pill) => {
      pill.addEventListener("click", () => {
        playSound("click");
        state.driverTipLbp = Number(pill.getAttribute("data-tip")) || 0;
        document.querySelectorAll(".tip-pill").forEach((p) => p.classList.toggle("active", p === pill));
        renderCart();
      });
    });

    document.getElementById("proceedCheckoutBtn")?.addEventListener("click", () => {
      const { subtotal, zone } = calculateCartTotals();
      if (state.orderMode === "delivery" && subtotal < zone.minOrderLbp) {
        showToast(`الحد الأدنى للطلب بمنطقتك هو ${formatPricePlain(zone.minOrderLbp)}`);
        return;
      }
      playSound("click");
      switchCartView("checkout");
    });

    document.getElementById("backToBagBtn")?.addEventListener("click", () => switchCartView("bag"));

    document.getElementById("whatsappCheckoutBtn")?.addEventListener("click", () => {
      if (state.cart.length === 0) return;
      window.open(buildWhatsAppOrderUrl(), "_blank", "noopener");
    });

    document.querySelectorAll('input[name="payMethod"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        document.querySelectorAll(".pay-radio-card").forEach((c) => {
          c.classList.toggle("active", c.contains(radio) && radio.checked);
        });
      });
    });

    let lastSnapshotWaUrl = "";
    document.getElementById("checkoutForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("chkName")?.value.trim() || "";
      const phone = document.getElementById("chkPhone")?.value.trim() || "";
      const address = document.getElementById("chkAddress")?.value.trim() || "";
      const notes = document.getElementById("chkNotes")?.value.trim() || "";
      const payMethod = document.querySelector('input[name="payMethod"]:checked')?.value || "نقداً عند الاستلام";

      const nameErr = document.getElementById("chkNameErr");
      const phoneErr = document.getElementById("chkPhoneErr");
      const addrErr = document.getElementById("chkAddressErr");
      if (nameErr) nameErr.textContent = "";
      if (phoneErr) phoneErr.textContent = "";
      if (addrErr) addrErr.textContent = "";

      let valid = true;
      if (name.length < 3) {
        if (nameErr) nameErr.textContent = "رجاءً اكتب اسمك الكريم (3 أحرف ع الأقل).";
        valid = false;
      }
      if (!/^[0-9+\s-]{7,15}$/.test(phone)) {
        if (phoneErr) phoneErr.textContent = "رجاءً عبّي رقم تلفونك اللبناني لنتواصل معك (مثال: 71 074 246).";
        valid = false;
      }
      if (state.orderMode === "delivery" && address.length < 6) {
        if (addrErr) addrErr.textContent = "في شي ناقص، تأكد من العنوان (الحي والبناية) لنعرف نوصلك بسرعة.";
        valid = false;
      }
      if (!valid) return;

      lastSnapshotWaUrl = buildWhatsAppOrderUrl({ name, phone, address, notes, payMethod });
      const newOrderCode = `#DY-${Math.floor(1000 + Math.random() * 9000)}`;
      state.lastConfirmedOrderId = newOrderCode;
      document.getElementById("confirmedOrderCode").textContent = newOrderCode;

      state.cart = [];
      saveCart();
      renderCart();
      switchCartView("done");
      playSound("win");
      launchConfetti(90);
    });

    document.getElementById("sendConfirmedWaBtn")?.addEventListener("click", () => {
      if (lastSnapshotWaUrl) window.open(lastSnapshotWaUrl, "_blank", "noopener");
    });

    document.getElementById("closeSuccessCartBtn")?.addEventListener("click", closeCartDrawer);

    document.getElementById("trackMyNewOrderBtn")?.addEventListener("click", () => {
      closeCartDrawer();
      document.getElementById("delivery")?.scrollIntoView({ behavior: "smooth" });
    });
  }

  // ==========================================================================
  // 8. خريطة مناطق التغطية والرسوم التفاعلية (LEAFLET INTERACTIVE MAP)
  // ==========================================================================
  let deliveryMapInstance = null;
  let activeRouteLine = null;
  let activeScooterMarker = null;
  let selectedZoneData = null;

  function normalizeArabic(str) {
    if (!str) return "";
    return str
      .replace(/[\u064B-\u065F]/g, "")
      .replace(/[أإآ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي")
      .toLowerCase()
      .trim();
  }

  function initCoverageMapLazy() {
    const section = document.getElementById("delivery") || document.getElementById("deliveryMap");
    if (!section) return;

    let loaded = false;
    function loadAndInitLeaflet() {
      if (loaded) return;
      loaded = true;

      // حقن ملف CSS الخاص بالخريطة عند الحاجة فقط
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // حقن مكتبة Leaflet ثم تهيئة الخريطة
      if (typeof L === "undefined") {
        const s = document.createElement("script");
        s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        s.async = true;
        s.onload = () => {
          initLeafletDeliveryMap();
        };
        document.head.appendChild(s);
      } else {
        initLeafletDeliveryMap();
      }
    }

    if ("IntersectionObserver" in window) {
      const obs = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadAndInitLeaflet();
            obs.disconnect();
          }
        },
        { rootMargin: "350px 0px" }
      );
      obs.observe(section);
    } else {
      setTimeout(loadAndInitLeaflet, 2500);
    }
  }

  function initLeafletDeliveryMap() {
    const mapEl = document.getElementById("deliveryMap");
    if (!mapEl) return;

    // مركز مطعم سناك الضيعة في طرابلس (شارع عزمي)
    const RESTAURANT_COORDS = [34.4367, 35.8333];
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 768;

    // تهيئة الخريطة Leaflet
    if (typeof L !== "undefined" && !deliveryMapInstance) {
      try {
        deliveryMapInstance = L.map("deliveryMap", {
          center: RESTAURANT_COORDS,
          zoom: 13,
          scrollWheelZoom: false,
          dragging: !isTouch,
          tap: !isTouch
        });

        if (isTouch) {
          if (!mapEl.querySelector(".map-touch-overlay")) {
            const overlay = document.createElement("div");
            overlay.className = "map-touch-overlay";
            overlay.innerHTML = '<span><svg class="ui-svg-icon"><use href="#ico-map"/></svg> اضغط للتفاعل مع الخريطة</span>';
            overlay.addEventListener("click", () => {
              deliveryMapInstance.dragging.enable();
              overlay.style.display = "none";
            });
            mapEl.appendChild(overlay);
          }
        }

        L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a>, © <a href="https://carto.com/">CARTO</a>',
          maxZoom: 19
        }).addTo(deliveryMapInstance);

        // دوائر نطاقات الرسوم الثلاثة (قريب، وسط، بعيد)
        L.circle(RESTAURANT_COORDS, {
          radius: 2500,
          color: "#0F9F8F",
          fillColor: "#0F9F8F",
          fillOpacity: 0.12,
          weight: 1.5
        }).addTo(deliveryMapInstance);

        L.circle(RESTAURANT_COORDS, {
          radius: 5500,
          color: "#FF9F1C",
          fillColor: "#FF9F1C",
          fillOpacity: 0.08,
          weight: 1.5,
          dashArray: "4, 6"
        }).addTo(deliveryMapInstance);

        L.circle(RESTAURANT_COORDS, {
          radius: 12000,
          color: "#FF4B2B",
          fillColor: "#FF4B2B",
          fillOpacity: 0.04,
          weight: 1.2,
          dashArray: "6, 8"
        }).addTo(deliveryMapInstance);

        // علامة موقع المطعم المميزة
        const restaurantIcon = L.divIcon({
          className: "restaurant-map-pin",
          html: `
            <div class="pin-radar"></div>
            <div class="pin-core">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#FFF6E6">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <div class="pin-badge-lbl">سناك الضيعة — الفرع الرئيسي</div>
          `,
          iconSize: [44, 44],
          iconAnchor: [22, 22]
        });

        L.marker(RESTAURANT_COORDS, { icon: restaurantIcon })
          .addTo(deliveryMapInstance)
          .bindPopup("<b>سناك الضيعة — طرابلس</b><br>شارع عزمي التجاري، قرب ساحة الكورة<br>هاتف: +961 71 074 246");

        // رسم نقاط جميع الأحياء
        const allZones = CFG.deliveryZones || [];
        allZones.forEach((z) => {
          if (!z.lat || !z.lng) return;
          const tierClass = z.tier === 1 ? "tier-1" : z.tier === 2 ? "tier-2" : "tier-3";
          const markerIcon = L.divIcon({
            className: `zone-map-marker ${tierClass}`,
            html: `<div class="marker-dot"></div>`,
            iconSize: [22, 22],
            iconAnchor: [11, 11]
          });

          const m = L.marker([z.lat, z.lng], { icon: markerIcon }).addTo(deliveryMapInstance);
          m.bindTooltip(`<b>${z.name}</b><br>${formatPrice(z.feeLbp)} • ${z.eta}`, {
            direction: "top",
            offset: [0, -8]
          });
          m.on("click", () => {
            selectDeliveryZone(z);
          });
        });
      } catch (err) {
        console.warn("Leaflet map initialization skipped or failed:", err);
      }
    }

    let currentRegion = "tripoli";
    let currentTier = "all";
    let currentSearch = "";

    function renderInteractiveZoneList() {
      const listEl = document.getElementById("deliveryZonesExplorer");
      if (!listEl) return;

      const allZones = CFG.deliveryZones || [];
      const normalizedSearch = normalizeArabic(currentSearch);

      const filtered = allZones.filter((z) => {
        if (currentRegion !== "all" && z.regionId !== currentRegion) return false;
        if (currentTier !== "all" && String(z.tier) !== String(currentTier)) return false;
        if (normalizedSearch) {
          const normName = normalizeArabic(z.name);
          const normShort = normalizeArabic(z.shortName);
          if (!normName.includes(normalizedSearch) && !normShort.includes(normalizedSearch)) return false;
        }
        return true;
      });

      if (filtered.length === 0) {
        listEl.innerHTML = `
          <div class="empty-zones-box">
            <p>ما لقينا منطقة بهالاسم! جرب اكتب اسم الحي بطريقة تانية أو تواصل معنا ع الواتساب.</p>
          </div>
        `;
        return;
      }

      listEl.innerHTML = filtered.map((z) => {
        const isSelected = selectedZoneData?.id === z.id;
        return `
          <button type="button" class="zone-list-card ${isSelected ? "selected" : ""} tier-${z.tier}" data-zone-id="${z.id}">
            <div class="zlc-info">
              <strong><svg class="ui-svg-icon"><use href="#ico-pin"/></svg> ${z.shortName || z.name}</strong>
              <small class="zlc-region">${z.regionName || ""}</small>
            </div>
            <div class="zlc-meta">
              <span class="zlc-eta"><svg class="ui-svg-icon"><use href="#ico-clock"/></svg> ${z.eta}</span>
              <strong class="zlc-fee"><svg class="ui-svg-icon"><use href="#ico-scooter"/></svg> ${formatPrice(z.feeLbp)}</strong>
            </div>
          </button>
        `;
      }).join("");

      listEl.querySelectorAll(".zone-list-card").forEach((card) => {
        card.addEventListener("click", () => {
          const id = card.getAttribute("data-zone-id");
          const target = allZones.find((x) => x.id === id);
          if (target) selectDeliveryZone(target);
        });
      });
    }

    function selectDeliveryZone(zone) {
      selectedZoneData = zone;
      playSound("pop");

      const regionBadge = document.getElementById("azRegionBadge");
      const nameEl = document.getElementById("azZoneName");
      const feeLbpEl = document.getElementById("azFeeLbp");
      const feeUsdEl = document.getElementById("azFeeUsd");
      const etaMinutesEl = document.getElementById("azEtaMinutes");
      const etaCircle = document.getElementById("azEtaCircle");
      const minOrderEl = document.getElementById("azMinOrder");

      if (regionBadge) regionBadge.textContent = zone.regionName || "منطقة طرابلس";
      if (nameEl) nameEl.textContent = zone.shortName || zone.name;
      if (feeLbpEl) feeLbpEl.innerHTML = formatPrice(zone.feeLbp);
      if (feeUsdEl) feeUsdEl.innerHTML = `(<span class="price"><bdi dir="ltr">$${(zone.feeLbp / CFG.exchangeRate).toFixed(2)}</bdi></span>)`;
      if (minOrderEl) minOrderEl.innerHTML = formatPrice(zone.minOrderLbp);

      const numMatch = (zone.eta || "").match(/\d+/g);
      const minutes = numMatch ? Math.max(...numMatch.map(Number)) : 20;
      if (etaMinutesEl) etaMinutesEl.textContent = String(minutes);
      if (etaCircle) {
        const progress = Math.min(1, Math.max(0.15, minutes / 60));
        etaCircle.style.strokeDashoffset = String(157 * (1 - progress));
      }

      if (deliveryMapInstance && zone.lat && zone.lng) {
        deliveryMapInstance.flyTo([zone.lat, zone.lng], 13.5, { duration: 1.2 });

        if (activeRouteLine) deliveryMapInstance.removeLayer(activeRouteLine);
        if (activeScooterMarker) deliveryMapInstance.removeLayer(activeScooterMarker);

        const latlngs = [RESTAURANT_COORDS, [zone.lat, zone.lng]];
        activeRouteLine = L.polyline(latlngs, {
          color: "#FF4B2B",
          weight: 3.5,
          dashArray: "6, 8",
          opacity: 0.85
        }).addTo(deliveryMapInstance);

        const scooterIcon = L.divIcon({
          className: "scooter-route-rider",
          html: `<div class="rider-emoji"><svg class="ui-svg-icon"><use href="#ico-scooter"/></svg></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        activeScooterMarker = L.marker(RESTAURANT_COORDS, { icon: scooterIcon }).addTo(deliveryMapInstance);

        const duration = 1200;
        const startTime = performance.now();
        function animateScooter(now) {
          const elapsed = now - startTime;
          const t = Math.min(1, elapsed / duration);
          const curLat = RESTAURANT_COORDS[0] + (zone.lat - RESTAURANT_COORDS[0]) * t;
          const curLng = RESTAURANT_COORDS[1] + (zone.lng - RESTAURANT_COORDS[1]) * t;
          if (activeScooterMarker) activeScooterMarker.setLatLng([curLat, curLng]);
          if (t < 1) requestAnimationFrame(animateScooter);
        }
        requestAnimationFrame(animateScooter);
      }

      document.querySelectorAll(".zone-list-card").forEach((c) => {
        c.classList.toggle("selected", c.getAttribute("data-zone-id") === zone.id);
      });
    }

    document.querySelectorAll(".del-region-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".del-region-tab").forEach((t) => {
          t.classList.remove("active");
          t.setAttribute("aria-selected", "false");
        });
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");
        currentRegion = tab.getAttribute("data-region");
        renderInteractiveZoneList();
      });
    });

    document.querySelectorAll(".del-tier-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        document.querySelectorAll(".del-tier-chip").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        currentTier = chip.getAttribute("data-tier");
        renderInteractiveZoneList();
      });
    });

    const searchInput = document.getElementById("deliveryZoneSearch");
    const clearSearchBtn = document.getElementById("clearZoneSearch");
    searchInput?.addEventListener("input", () => {
      currentSearch = searchInput.value;
      if (clearSearchBtn) clearSearchBtn.hidden = currentSearch.length === 0;
      renderInteractiveZoneList();
    });
    clearSearchBtn?.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      currentSearch = "";
      clearSearchBtn.hidden = true;
      renderInteractiveZoneList();
    });

    document.getElementById("btnSelectZoneForOrder")?.addEventListener("click", () => {
      if (!selectedZoneData) return;
      state.selectedZoneId = selectedZoneData.id;
      const mainRegSelect = document.getElementById("cartMainRegionSelect");
      const subZoneSelect = document.getElementById("cartSubZoneSelect");
      if (mainRegSelect) {
        mainRegSelect.value = selectedZoneData.regionId;
        mainRegSelect.dispatchEvent(new Event("change"));
      }
      if (subZoneSelect) {
        subZoneSelect.value = selectedZoneData.id;
        subZoneSelect.dispatchEvent(new Event("change"));
      }
      renderCart();
      playSound("win");
      showToast(`يا هلا فيك! اعتمدنا منطقة ${selectedZoneData.shortName || selectedZoneData.name} بطلبيتك. رسم التوصيل: ${formatPricePlain(selectedZoneData.feeLbp)}`, "check");
      openCartDrawer();
    });

    document.querySelectorAll(".dfaq-trigger").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".dfaq-item");
        const isOpen = item.classList.contains("active");
        document.querySelectorAll(".dfaq-item").forEach((it) => {
          it.classList.remove("active");
          it.querySelector(".dfaq-trigger")?.setAttribute("aria-expanded", "false");
        });
        if (!isOpen) {
          item.classList.add("active");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });

    const defaultZone = (CFG.deliveryZones || []).find((z) => z.id === "azmi") || CFG.deliveryZones[0];
    if (defaultZone) selectDeliveryZone(defaultZone);
    renderInteractiveZoneList();
  }

  // تحميل وتشغيل فيديو الهيرو لسطح المكتب فقط بعد اكتمال التحميل مع إيقافه عند الخروج من الشاشة
  function initHeroVideo() {
    const heroVideo = document.getElementById("heroVideo");
    if (!heroVideo) return;

    const isMobile = window.innerWidth <= 900;
    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const isSlowConn = conn && (conn.saveData || conn.effectiveType === "2g" || conn.effectiveType === "3g");

    if (isMobile || isReducedMotion || isSlowConn) {
      return; // على الجوال والشاشات البطيئة: 0 بايت فيديو
    }

    const desktopSrc = heroVideo.dataset.src || "https://videos.pexels.com/video-files/3196094/3196094-hd_1280_720_25fps.mp4";

    function startVideo() {
      if (heroVideo.src) return;
      heroVideo.src = desktopSrc;
      heroVideo.load();
      heroVideo.play().catch(() => {});
    }

    if (document.readyState === "complete") {
      setTimeout(startVideo, 1200);
    } else {
      window.addEventListener("load", () => setTimeout(startVideo, 1200));
    }

    if ("IntersectionObserver" in window) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!heroVideo.src) return;
          if (entry.isIntersecting) {
            heroVideo.play().catch(() => {});
          } else {
            heroVideo.pause();
          }
        });
      }, { threshold: 0.1 });
      obs.observe(heroVideo);
    }
  }

  // تحميل مكتبة GSAP بحذر فقط للشاشات الكبيرة (> 992px)
  function loadGsapIfDesktop() {
    if (window.innerWidth >= 992 && !prefersReducedMotion) {
      if (typeof window.gsap !== "undefined") return;
      const s1 = document.createElement("script");
      s1.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
      s1.onload = () => {
        const s2 = document.createElement("script");
        s2.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js";
        s2.onload = () => {
          if (window.gsap && window.ScrollTrigger) {
            window.gsap.registerPlugin(window.ScrollTrigger);
          }
        };
        document.head.appendChild(s2);
      };
      document.head.appendChild(s1);
    }
  }

  // ==========================================================================
  // 9. قسم شاهد كيف نحضّر: صور وبطاقات الشوي + شريط المقارنة بالسحب
  // ==========================================================================
  function initGrillSection() {
    document.querySelectorAll(".grill-video-card").forEach((card) => {
      card.addEventListener("click", () => {
        playSound("sizzle");
      });
    });

    // مقارن السحب Before / After Slider
    const slider = document.getElementById("beforeAfterSlider");
    const clip = document.getElementById("baBeforeClip");
    const handle = document.getElementById("baHandle");
    if (!slider || !clip || !handle) return;

    let dragging = false;

    function setSliderPercent(pct) {
      const clamped = Math.min(95, Math.max(5, pct));
      clip.style.clipPath = `inset(0 0 0 ${clamped}%)`;
      handle.style.left = `${clamped}%`;
      handle.setAttribute("aria-valuenow", String(Math.round(clamped)));
    }

    function updateFromPointer(clientX) {
      const rect = slider.getBoundingClientRect();
      const pct = ((clientX - rect.left) / rect.width) * 100;
      setSliderPercent(pct);
    }

    slider.addEventListener("pointerdown", (e) => {
      dragging = true;
      slider.setPointerCapture?.(e.pointerId);
      updateFromPointer(e.clientX);
    });
    slider.addEventListener("pointermove", (e) => {
      if (dragging) updateFromPointer(e.clientX);
    });
    window.addEventListener("pointerup", () => { dragging = false; });

    handle.addEventListener("keydown", (e) => {
      const curr = Number(handle.getAttribute("aria-valuenow")) || 50;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSliderPercent(curr - 5);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setSliderPercent(curr + 5);
      }
    });
  }

  // ==========================================================================
  // 10. حاسبة السهرة والعزومات التفاعلية (PARTY & FAMILY ORDER PLANNER)
  // ==========================================================================
  function initPartyPlanner() {
    const planner = {
      guests: 6,
      occasion: "match",
      appetite: 2,
      prefs: new Set(["chicken", "meat", "drinks", "desserts"]),
      tray: []
    };

    const guestsDisplay = document.getElementById("plannerGuestCount");
    const guestsRange = document.getElementById("plannerGuestRange");
    const guestMinus = document.getElementById("plannerGuestMinus");
    const guestPlus = document.getElementById("plannerGuestPlus");
    const appetiteRange = document.getElementById("plannerAppetite");
    const appetiteLabel = document.getElementById("appetiteLabel");
    const trayList = document.getElementById("trayItemsList");
    const trayTitle = document.getElementById("trayFeastTitle");
    const totalLbpEl = document.getElementById("trayTotalLbp");
    const totalUsdEl = document.getElementById("trayTotalUsd");
    const perPersonEl = document.getElementById("trayPerPerson");
    const trayCountBadge = document.getElementById("trayItemCountBadge");

    const appetiteLabels = {
      1: "خفيف ونقنقة (سناكس خفيفة ومشروبات)",
      2: "مضبوط وعادي (لقمة مشبعة ومرتبة)",
      3: "جوعان كتير (سفرة مليانة ومدعومة!)"
    };

    const occasionTitles = {
      match: "صينية سهرة الماتش العائلية",
      family: "سفرة غدا العيلة الكريمة",
      friends: "صينية قعدة الشباب والسهرة",
      party: "بوفيه العيد والمناسبة الحفلاوية",
      office: "بوكسات لمّة الشغل والمكتب"
    };

    function calculateFeast() {
      const g = planner.guests;
      const appFactor = planner.appetite === 1 ? 0.8 : planner.appetite === 2 ? 1.0 : 1.35;
      const items = [];

      const chickenPref = planner.prefs.has("chicken");
      const meatPref = planner.prefs.has("meat");
      const spicyPref = planner.prefs.has("spicy");
      const vegPref = planner.prefs.has("veg");
      const drinksPref = planner.prefs.has("drinks");
      const dessertsPref = planner.prefs.has("desserts");

      if (planner.occasion === "match") {
        if (chickenPref) {
          const qty = Math.max(2, Math.round(g * 0.6 * appFactor));
          items.push({ id: "sw-shawarma-chicken", qty });
        }
        if (meatPref) {
          const qty = Math.max(2, Math.round(g * 0.5 * appFactor));
          items.push({ id: "sw-shawarma-meat", qty });
        }
        if (spicyPref) {
          const qty = Math.max(1, Math.round(g * 0.3 * appFactor));
          items.push({ id: "sw-zinger", qty });
        }
        items.push({ id: "ap-fries-cheese", qty: Math.max(1, Math.ceil(g / 3)) });
        items.push({ id: "ap-kibbeh-plate", qty: Math.max(1, Math.ceil(g / 4)) });
      } else if (planner.occasion === "family") {
        items.push({ id: "ml-mixed-grill", qty: Math.max(1, Math.ceil(g / 3)) });
        if (chickenPref) items.push({ id: "sw-tawook", qty: Math.max(2, Math.round(g * 0.5 * appFactor)) });
        if (meatPref) items.push({ id: "sw-kafta", qty: Math.max(2, Math.round(g * 0.5 * appFactor)) });
        items.push({ id: "sl-fattoush", qty: Math.max(1, Math.ceil(g / 3)) });
        items.push({ id: "sl-hummus", qty: Math.max(1, Math.ceil(g / 4)) });
        items.push({ id: "ap-rkakat", qty: Math.max(1, Math.ceil(g / 3)) });
      } else if (planner.occasion === "friends") {
        if (meatPref) items.push({ id: "bg-double", qty: Math.max(2, Math.round(g * 0.5 * appFactor)) });
        if (chickenPref) items.push({ id: "sw-fajita-chicken", qty: Math.max(2, Math.round(g * 0.5 * appFactor)) });
        items.push({ id: "ap-fries-bacon", qty: Math.max(1, Math.ceil(g / 3)) });
        items.push({ id: "ap-cheese-balls", qty: Math.max(1, Math.ceil(g / 3)) });
      } else if (planner.occasion === "party") {
        items.push({ id: "sw-shawarma-arabi", qty: Math.max(1, Math.ceil(g / 2)) });
        items.push({ id: "ap-nuggets", qty: Math.max(1, Math.ceil(g / 3)) });
        items.push({ id: "ap-sambousek", qty: Math.max(1, Math.ceil(g / 3)) });
        items.push({ id: "cr-waffle", qty: Math.max(1, Math.ceil(g / 3)) });
      } else {
        if (chickenPref) items.push({ id: "sw-crispy", qty: Math.max(2, Math.round(g * 0.5 * appFactor)) });
        if (meatPref) items.push({ id: "bg-classic-lebanese", qty: Math.max(2, Math.round(g * 0.5 * appFactor)) });
        items.push({ id: "ap-wedges", qty: Math.max(1, Math.ceil(g / 3)) });
      }

      if (vegPref) {
        items.push({ id: "sw-falafel", qty: Math.max(1, Math.ceil(g / 3)) });
        items.push({ id: "mn-zaatar", qty: Math.max(1, Math.ceil(g / 4)) });
      }

      if (drinksPref) {
        if (g <= 4) {
          items.push({ id: "dr-soda-small", qty: g });
        } else {
          items.push({ id: "dr-soda-large", qty: Math.ceil(g / 4) });
          items.push({ id: "dr-lemon-mint", qty: Math.ceil(g / 2) });
        }
      }

      if (dessertsPref) {
        items.push({ id: "ds-kunafa", qty: Math.max(1, Math.ceil(g / 3)) });
        if (g >= 6) items.push({ id: "ds-halawet-jibn", qty: Math.max(1, Math.ceil(g / 4)) });
      }

      planner.tray = items.map((it) => {
        const dish = ITEMS.find((d) => d.id === it.id) || ITEMS[0];
        return {
          id: dish.id,
          name: dish.name,
          image: dish.image,
          priceLbp: dish.priceLbp,
          qty: it.qty,
          dishObj: dish
        };
      });

      renderFeastTray();
    }

    function renderFeastTray() {
      if (!trayList) return;

      if (trayTitle) {
        trayTitle.textContent = occasionTitles[planner.occasion] || "صينية سهرة الضيعة";
      }

      let subtotalLbp = 0;
      let totalUnits = 0;

      trayList.innerHTML = planner.tray.map((item, idx) => {
        const linePrice = item.priceLbp * item.qty;
        subtotalLbp += linePrice;
        totalUnits += item.qty;
        return `
          <div class="tray-dish-row" data-tray-idx="${idx}">
            <div class="tdr-img-wrap">
              <img src="${item.image}" alt="${item.name}" width="800" height="600" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${FALLBACK_FOOD_SVG}';" />
            </div>
            <div class="tdr-info">
              <div class="tdr-top">
                <strong class="tdr-name">${item.name}</strong>
                <button type="button" class="btn-remove-tray-item" data-action="remove" title="حذف الصنف" aria-label="حذف الصنف">✕</button>
              </div>
              <span class="tdr-unit-price">${formatPrice(item.priceLbp)} للقطعة</span>
            </div>
            <div class="tdr-bottom">
              <div class="tdr-stepper">
                <button type="button" class="btn-qty-tray" data-action="minus" aria-label="تقليل الكمية">−</button>
                <span class="tdr-qty">${item.qty}</span>
                <button type="button" class="btn-qty-tray" data-action="plus" aria-label="زيادة الكمية">+</button>
              </div>
              <div class="tdr-total">
                <strong>${formatPrice(linePrice)}</strong>
              </div>
            </div>
          </div>
        `;
      }).join("");

      const totalUsd = (subtotalLbp / CFG.exchangeRate).toFixed(2);
      const perPersonLbp = Math.round(subtotalLbp / planner.guests);
      const perPersonUsd = (perPersonLbp / CFG.exchangeRate).toFixed(2);

      if (totalLbpEl) totalLbpEl.innerHTML = formatPrice(subtotalLbp);
      if (totalUsdEl) totalUsdEl.innerHTML = `(<span class="price"><bdi dir="ltr">$${totalUsd}</bdi></span>)`;
      if (perPersonEl) {
        perPersonEl.innerHTML = `حوالي <strong>${formatPrice(perPersonLbp)}</strong> (<span class="price"><bdi dir="ltr">$${perPersonUsd}</bdi></span>) للشخص`;
      }
      if (trayCountBadge) {
        trayCountBadge.textContent = `${totalUnits} صنف`;
      }

      trayList.querySelectorAll(".btn-qty-tray").forEach((btn) => {
        btn.addEventListener("click", () => {
          const row = btn.closest(".tray-dish-row");
          const idx = Number(row?.getAttribute("data-tray-idx"));
          const action = btn.getAttribute("data-action");
          if (action === "plus") {
            planner.tray[idx].qty++;
          } else if (action === "minus") {
            if (planner.tray[idx].qty > 1) planner.tray[idx].qty--;
            else planner.tray.splice(idx, 1);
          }
          playSound("click");
          renderFeastTray();
        });
      });

      trayList.querySelectorAll(".btn-remove-tray-item").forEach((btn) => {
        btn.addEventListener("click", () => {
          const row = btn.closest(".tray-dish-row");
          const idx = Number(row?.getAttribute("data-tray-idx"));
          planner.tray.splice(idx, 1);
          playSound("pop");
          renderFeastTray();
        });
      });
    }

    function setGuests(val) {
      const g = Math.min(30, Math.max(1, Number(val)));
      planner.guests = g;
      if (guestsDisplay) guestsDisplay.textContent = `${g} أشخاص`;
      if (guestsRange) guestsRange.value = String(g);
      document.querySelectorAll(".preset-pill").forEach((p) => {
        p.classList.toggle("active", Number(p.getAttribute("data-guests")) === g);
      });
      calculateFeast();
    }

    guestsRange?.addEventListener("input", (e) => setGuests(e.target.value));
    guestMinus?.addEventListener("click", () => setGuests(planner.guests - 1));
    guestPlus?.addEventListener("click", () => setGuests(planner.guests + 1));

    document.querySelectorAll(".preset-pill").forEach((pill) => {
      pill.addEventListener("click", () => {
        setGuests(pill.getAttribute("data-guests"));
      });
    });

    document.querySelectorAll(".occasion-tile").forEach((tile) => {
      tile.addEventListener("click", () => {
        document.querySelectorAll(".occasion-tile").forEach((t) => t.classList.remove("active"));
        tile.classList.add("active");
        planner.occasion = tile.getAttribute("data-occasion");
        playSound("click");
        calculateFeast();
      });
    });

    appetiteRange?.addEventListener("input", (e) => {
      const val = Number(e.target.value);
      planner.appetite = val;
      if (appetiteLabel) appetiteLabel.textContent = appetiteLabels[val] || "";
      calculateFeast();
    });

    document.querySelectorAll(".pref-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const pref = chip.getAttribute("data-pref");
        if (planner.prefs.has(pref)) {
          planner.prefs.delete(pref);
          chip.classList.remove("active");
        } else {
          planner.prefs.add(pref);
          chip.classList.add("active");
        }
        playSound("click");
        calculateFeast();
      });
    });

    document.getElementById("btnRefreshTray")?.addEventListener("click", () => {
      playSound("sizzle");
      calculateFeast();
      showToast("جهّزنالك تشكيلة تانية بتشهي! تفقّد الأصناف بالصينية", "sparkle");
    });

    document.getElementById("btnAddFeastToCart")?.addEventListener("click", () => {
      if (planner.tray.length === 0) return;
      planner.tray.forEach((item) => {
        const existing = state.cart.find((c) => c.id === item.id && c.selectedSize === "regular");
        if (existing) {
          existing.qty += item.qty;
        } else {
          state.cart.push({
            cartItemId: `feast_${item.id}_${Date.now()}_${Math.random()}`,
            id: item.id,
            name: item.name,
            category: item.dishObj.category,
            image: item.image,
            unitPriceLbp: item.priceLbp,
            qty: item.qty,
            selectedSize: "regular",
            selectedSizeLabel: "حجم عادي",
            selectedSauces: [],
            selectedAddons: [],
            modsSummary: "صينية سهرة الضيعة"
          });
        }
      });
      saveCart();
      renderCart();
      playSound("win");
      launchConfetti(85);
      showToast(`صحتين وعافية! انضافت صينية السهرة كلها ع السلة (${planner.tray.reduce((s, it) => s + it.qty, 0)} صنف)`, "cart");
      setTimeout(() => openCartDrawer(), 600);
    });

    document.getElementById("btnWhatsAppFeast")?.addEventListener("click", () => {
      if (planner.tray.length === 0) return;
      const subtotal = planner.tray.reduce((s, it) => s + it.priceLbp * it.qty, 0);
      const lines = [
        `مرحبا سناك الضيعة! بدي اطلب صينية ${occasionTitles[planner.occasion] || "جمعة الضيعة"} لو سمحتوا`,
        `━━━━━━━━━━━━━━━━━━━━━`,
        `• عدد الأشخاص: ${planner.guests} أشخاص`,
        `• حجم الشهية: ${appetiteLabels[planner.appetite]}`,
        `━━━━━━━━━━━━━━━━━━━━━`,
        `*أصناف الصينية:*`
      ];

      planner.tray.forEach((it, i) => {
        lines.push(`${i + 1}. *${it.name}* (${it.qty} حبة) = ${formatDualPricePlain(it.priceLbp * it.qty)}`);
      });

      lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
      lines.push(`• المجموع التقديري: *${formatDualPricePlain(subtotal)}*`);
      lines.push(`(حوالي ${formatDualPricePlain(Math.round(subtotal / planner.guests))} للشخص)`);
      lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
      lines.push(`العنوان للتوصيل: (اكتب عنوانك هون)`);
      lines.push(`يسلم دياتكم، ناطرينكن!`);

      const waUrl = `https://wa.me/${CFG.whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
      window.open(waUrl, "_blank", "noopener");
    });

    calculateFeast();
  }

  // ==========================================================================
  // شريط الطلب السفلي اللاصق للجوال (STICKY MOBILE ORDER BAR)
  // ==========================================================================
  function updateMobileStickyBar() {
    const bar = document.getElementById("mobileStickyBar");
    const countEl = document.getElementById("mobileBarCount");
    const totalEl = document.getElementById("mobileBarTotal");
    if (!bar) return;

    const count = state.cart.reduce((s, it) => s + it.qty, 0);
    const { grandTotal } = calculateCartTotals();

    if (countEl) countEl.textContent = String(count);
    if (totalEl) {
      totalEl.innerHTML = formatPrice(grandTotal);
    }
    syncStickyBarVisibility();
  }

  function initMobileStickyBar() {
    const btn = document.getElementById("mobileStickyCartBtn");
    btn?.addEventListener("click", () => {
      playSound("pop");
      openCartDrawer();
    });
    updateMobileStickyBar();
  }

  // ==========================================================================
  // 11 & 12. الفروع وحجز الطاولات (.ics + واتساب) + العدادات المتحركة
  // ==========================================================================
  function initBranchesAndReservation() {
    const list = document.getElementById("branchesList");
    const now = new Date();
    const currDec = now.getHours() + now.getMinutes() / 60;

    if (list) {
      list.innerHTML = CFG.branches
        .map((br) => {
          const isOpen =
            (currDec >= br.openHour && currDec < Math.min(24, br.closeHour)) ||
            (br.closeHour > 24 && currDec < br.closeHour - 24);
          return `
          <div class="branch-card">
            <div class="branch-top">
              <h4>${br.name}</h4>
              <span class="branch-status ${isOpen ? "open" : "closed"}">
                <span class="status-dot-inline"></span> ${isOpen ? "مفتوح الآن" : "مغلق حالياً"}
              </span>
            </div>
            <p class="branch-addr"><svg class="ui-svg-icon"><use href="#ico-pin"/></svg> ${br.address} • <svg class="ui-svg-icon"><use href="#ico-clock"/></svg> ${br.hoursLabel}</p>
            <div class="branch-feats">
              ${br.features.map((f) => `<span>✓ ${f}</span>`).join("")}
            </div>
            <div class="branch-actions">
              <a href="tel:${br.phone.replace(/\s+/g, "")}" class="btn btn-sm btn-glass"><svg class="ui-svg-icon"><use href="#ico-phone"/></svg> <bdi dir="ltr">${br.phone}</bdi></a>
              <button type="button" class="btn btn-sm btn-outline-gold show-branch-map-btn" data-map="${br.mapEmbed}" data-bname="${br.name}">
                <svg class="ui-svg-icon"><use href="#ico-map"/></svg> عرض عَ الخريطة
              </button>
            </div>
          </div>
        `;
        })
        .join("");

      list.querySelectorAll(".show-branch-map-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const iframe = document.getElementById("branchMapIframe");
          const label = document.getElementById("mapBranchLabel");
          if (iframe) iframe.src = btn.getAttribute("data-map");
          if (label) label.innerHTML = `<svg class="ui-svg-icon"><use href="#ico-pin"/></svg> ${btn.getAttribute("data-bname")}`;
          document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
        });
      });
    }

    // تاريخ افتراضي للحجز (اليوم)
    const dateInput = document.getElementById("resDate");
    if (dateInput) {
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      dateInput.min = `${yyyy}-${mm}-${dd}`;
      dateInput.value = `${yyyy}-${mm}-${dd}`;
    }

    // عداد الضيوف
    const guestDisplay = document.getElementById("guestCountDisplay");
    function updateGuestsUI() {
      if (guestDisplay) {
        guestDisplay.textContent =
          state.guestCount === 1
            ? "شخص واحد"
            : state.guestCount === 2
            ? "شخصان"
            : state.guestCount <= 10
            ? `${state.guestCount} أشخاص`
            : `${state.guestCount} ضيفاً`;
      }
    }

    document.getElementById("guestMinusBtn")?.addEventListener("click", () => {
      if (state.guestCount > 1) {
        state.guestCount--;
        updateGuestsUI();
      }
    });
    document.getElementById("guestPlusBtn")?.addEventListener("click", () => {
      if (state.guestCount < 25) {
        state.guestCount++;
        updateGuestsUI();
      }
    });

    // إرسال نموذج الحجز
    document.getElementById("reservationForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("resName")?.value.trim() || "";
      const phone = document.getElementById("resPhone")?.value.trim() || "";
      const branch = document.getElementById("resBranch")?.value || "";
      const date = document.getElementById("resDate")?.value || "";
      const time = document.getElementById("resTime")?.value || "20:30";
      const notes = document.getElementById("resNotes")?.value.trim() || "";

      document.getElementById("resNameErr").textContent = "";
      document.getElementById("resPhoneErr").textContent = "";
      document.getElementById("resDateErr").textContent = "";

      let ok = true;
      if (name.length < 3) {
        document.getElementById("resNameErr").textContent = "رجاءً اكتب اسمك الكريم.";
        ok = false;
      }
      if (!/^[0-9+\s-]{7,15}$/.test(phone)) {
        document.getElementById("resPhoneErr").textContent = "رجاءً عبّي رقم تلفونك لنتواصل معك ونأكّد الحجز.";
        ok = false;
      }
      if (!date) {
        document.getElementById("resDateErr").textContent = "رجاءً حدّد تاريخ الحجز.";
        ok = false;
      }
      if (!ok) return;

      state.lastReservation = { name, phone, branch, date, time, guests: state.guestCount, notes };

      document.getElementById("reservationFormWrap").hidden = true;
      document.getElementById("reservationSuccess").hidden = false;
      document.getElementById("resSummaryText").textContent =
        `يا هلا فيكن! ناطرينكن باسم "${name}" لعدد (${state.guestCount}) أشخاص بـ ${branch} بتاريخ ${date} الساعة ${time}. تكرم عينكن!`;

      const waMsg = [
        `*تأكيد حجز طاولة — ${CFG.brandName}*`,
        `• الاسم: ${name}`,
        `• الهاتف: ${phone}`,
        `• الفرع: ${branch}`,
        `• عدد الضيوف: ${state.guestCount}`,
        `• التاريخ والوقت: ${date} الساعة ${time}`,
        notes ? `• ملاحظات: ${notes}` : ""
      ].filter(Boolean).join("\n");

      document.getElementById("shareResWhatsappBtn").href =
        `https://wa.me/${CFG.whatsappNumber}?text=${encodeURIComponent(waMsg)}`;

      playSound("win");
      launchConfetti(60);
    });

    // توليد وتنزيل ملف تقويم .ics حقيقي
    document.getElementById("downloadIcsBtn")?.addEventListener("click", () => {
      const r = state.lastReservation;
      if (!r) return;
      const [yyyy, mm, dd] = r.date.split("-");
      const [hh, min] = r.time.split(":");
      const startStr = `${yyyy}${mm}${dd}T${hh}${min}00`;
      const endHour = String((Number(hh) + 2) % 24).padStart(2, "0");
      const endStr = `${yyyy}${mm}${dd}T${endHour}${min}00`;

      const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Snack El Day3a//Reservation//AR",
        "BEGIN:VEVENT",
        `SUMMARY:حجز طاولة في ${CFG.brandName} (${r.guests} ضيوف)`,
        `DTSTART:${startStr}`,
        `DTEND:${endStr}`,
        `LOCATION:${r.branch}`,
        `DESCRIPTION:حجز باسم ${r.name} - هاتف: ${r.phone}`,
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\r\n");

      const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "snack-el-day3a-reservation.ics";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast("تم تنزيل ملف الموعد (.ics) لإضافته لتقويمك!", "calendar");
    });

    document.getElementById("newReservationBtn")?.addEventListener("click", () => {
      document.getElementById("reservationForm")?.reset();
      document.getElementById("reservationSuccess").hidden = true;
      document.getElementById("reservationFormWrap").hidden = false;
    });
  }

  // ==========================================================================
  // 13 & 14. آراء الزبائن، جدول ساعات العمل، النشرة البريدية، وحركات الظهور
  // ==========================================================================
  function initReviewsAndContact() {
    const track = document.getElementById("reviewsTrack");
    const dotsWrap = document.getElementById("reviewsDots");
    const reviews = CFG.reviews || [];
    let currentRev = 0;
    let autoPlayTimer = null;

    if (track && reviews.length > 0) {
      track.innerHTML = reviews
        .map(
          (r) => `
        <article class="review-card">
          <div>
            <div class="rev-top">
              <div class="rev-avatar" style="background:${r.avatarBg}">${r.name.charAt(0)}</div>
              <div class="rev-meta">
                <strong>${r.name}</strong>
                <span>${r.area} • ${r.date}</span>
              </div>
              <div class="rev-stars" aria-label="تقييم 5 نجوم">★★★★★</div>
            </div>
          </div>
          <p class="rev-text">"${r.text}"</p>
          <span class="rev-dish-pill"><svg class="pill-dish-svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> طلب: ${r.dish}</span>
        </article>
      `
        )
        .join("");

      if (dotsWrap) {
        dotsWrap.innerHTML = reviews
          .map(
            (_, idx) =>
              `<button type="button" class="rev-dot ${idx === 0 ? "active" : ""}" aria-label="الانتقال للتقييم ${idx + 1}" data-rev-dot="${idx}"></button>`
          )
          .join("");

        dotsWrap.querySelectorAll(".rev-dot").forEach((d) => {
          d.addEventListener("click", () => goToReview(Number(d.getAttribute("data-rev-dot"))));
        });
      }

      function goToReview(idx) {
        currentRev = (idx + reviews.length) % reviews.length;
        const card = track.children[currentRev];
        if (card) {
          const deltaX = card.getBoundingClientRect().right - track.getBoundingClientRect().right;
          track.scrollBy({ left: deltaX, behavior: "smooth" });
        }
        dotsWrap?.querySelectorAll(".rev-dot").forEach((d, i) => d.classList.toggle("active", i === currentRev));
      }

      document.getElementById("revPrevBtn")?.addEventListener("click", () => goToReview(currentRev - 1));
      document.getElementById("revNextBtn")?.addEventListener("click", () => goToReview(currentRev + 1));

      function startAuto() {
        if (prefersReducedMotion) return;
        clearInterval(autoPlayTimer);
        autoPlayTimer = setInterval(() => goToReview(currentRev + 1), 4800);
      }
      startAuto();
      track.addEventListener("mouseenter", () => clearInterval(autoPlayTimer));
      track.addEventListener("mouseleave", startAuto);
      track.addEventListener("touchstart", () => clearInterval(autoPlayTimer), { passive: true });
    }

    // جدول ساعات العمل مع تمييز اليوم الحالي
    const tbody = document.getElementById("openingHoursBody");
    if (tbody) {
      const todayIdx = new Date().getDay();
      // ترتيب يبدأ من الإثنين حتى الأحد
      const ordered = [...CFG.openingHours.slice(1), CFG.openingHours[0]];
      tbody.innerHTML = ordered
        .map((row) => {
          const isToday = row.dayIndex === todayIdx;
          return `
          <tr class="${isToday ? "is-today" : ""}">
            <td>${row.dayAr} ${isToday ? "<strong>(اليوم)</strong>" : ""}</td>
            <td>${row.label}</td>
          </tr>
        `;
        })
        .join("");
    }

    // النشرة البريدية
    document.getElementById("newsletterForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("newsletterEmail")?.value.trim() || "";
      const err = document.getElementById("newsletterErr");
      if (err) err.textContent = "";

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (err) err.textContent = "رجاءً اكتب بريد إلكتروني صحيح.";
        return;
      }

      document.getElementById("newsletterFormWrap").hidden = true;
      document.getElementById("newsletterSuccess").hidden = false;
      applyPromoCode("STUDENT15", true);
      playSound("win");
      showToast("نورتنا! تم اشتراكك وتفعيل كود خصم 15% بسلتك!", "gift");
    });
  }

  function initScrollRevealsAndCounters() {
    const revealEls = document.querySelectorAll(".reveal-up");
    const clipBoxes = document.querySelectorAll(".clip-reveal-box");

    if (prefersReducedMotion) {
      revealEls.forEach((el) => el.classList.add("is-visible"));
      document.querySelectorAll(".counter-val").forEach((el) => {
        el.textContent = Number(el.getAttribute("data-target")).toLocaleString("en-US");
      });
      return;
    }

    clipBoxes.forEach((b) => b.classList.add("clip-hidden"));

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            entry.target.classList.remove("clip-hidden");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    revealEls.forEach((el) => io.observe(el));
    clipBoxes.forEach((el) => io.observe(el));

    // العدادات المتحركة في قسم قصتنا
    const countersWrap = document.getElementById("aboutCounters");
    if (countersWrap) {
      let counted = false;
      const counterObserver = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !counted) {
            counted = true;
            countersWrap.querySelectorAll(".counter-val").forEach((el) => {
              const target = parseFloat(el.getAttribute("data-target")) || 0;
              const decimals = Number(el.getAttribute("data-decimals")) || 0;
              const start = performance.now();
              const dur = 1800;
              function updateNum(now) {
                const t = Math.min(1, (now - start) / dur);
                const eased = 1 - Math.pow(1 - t, 3);
                const val = target * eased;
                el.textContent =
                  decimals > 0
                    ? val.toFixed(decimals)
                    : Math.round(val).toLocaleString("en-US");
                if (t < 1) requestAnimationFrame(updateNum);
              }
              requestAnimationFrame(updateNum);
            });
            counterObserver.disconnect();
          }
        },
        { threshold: 0.3 }
      );
      counterObserver.observe(countersWrap);
    }
  }

  // اختصارات لوحة المفاتيح لإغلاق النوافذ واللايت بوكس
  function initGlobalKeyboardShortcuts() {
    window.addEventListener("keydown", (e) => {
      
      if (e.key === "Escape") {
        closeDishModal();
        closeCartDrawer();
        const surp = document.getElementById("surpriseModal");
        if (surp && !surp.hidden) {
          surp.hidden = true;
          document.body.style.overflow = "";
          syncStickyBarVisibility();
        }
        const mob = document.getElementById("mobileMenu");
        if (mob && mob.classList.contains("is-open")) {
          document.getElementById("hamburgerBtn")?.click();
        }
      }
    });
  }

  // ==========================================================================
  // تشغيل جميع الوحدات عند جاهزية DOM بشكل معزول ومحصّن ضد الانهيار (Crash-Proof)
  // ==========================================================================
  function startApplication() {
    // 1. تشغيل شاشة التحميل أولاً دائماً قبل أي وحدة أخرى لتبدأ فوراً
    try {
      initPreloader();
    } catch (err) {
      console.error("[Startup] خطأ في تشغيل شاشة التحميل (initPreloader):", err);
      try {
        const p = document.getElementById("preloader");
        if (p) p.remove();
      } catch (_) {}
    }

    // 2. تشغيل الوحدات الفورية الأساسية لأول إطار مرئي (Critical First-Paint Modules)
    const criticalModules = [
      {
        name: "checkLiveOpenStatus",
        init: () => {
          checkLiveOpenStatus();
          setInterval(checkLiveOpenStatus, 60000);
        }
      },
      { name: "initNavbarAndGlobals", init: initNavbarAndGlobals },
      { name: "renderOffers", init: renderOffers },
      { name: "initMenuControls", init: initMenuControls },
      { name: "initDishModalEvents", init: initDishModalEvents },
      { name: "initCartAndCheckout", init: initCartAndCheckout },
      { name: "initMobileStickyBar", init: initMobileStickyBar }
    ];

    criticalModules.forEach((mod) => {
      try {
        mod.init();
      } catch (err) {
        console.error(`[Startup] فشل تشغيل الوحدة الأساسية (${mod.name}):`, err);
      }
    });

    // 3. تأجيل تشغيل الوحدات الثانوية الواقعة تحت خط الرؤية لما بعد أول رسم (requestIdleCallback)
    function runDeferredModules() {
      const deferredModules = [
        { name: "initFlipCardsAndWheel", init: initFlipCardsAndWheel },
        { name: "initSurpriseSlotMachine", init: initSurpriseSlotMachine },
        { name: "initComboBuilder", init: initComboBuilder },
        { name: "initGrillSection", init: initGrillSection },
        { name: "initHeroVideo", init: initHeroVideo },
        { name: "initCoverageMapLazy", init: initCoverageMapLazy },
        { name: "initPartyPlanner", init: initPartyPlanner },
        { name: "initBranchesAndReservation", init: initBranchesAndReservation },
        { name: "initReviewsAndContact", init: initReviewsAndContact },
        { name: "initScrollRevealsAndCounters", init: initScrollRevealsAndCounters },
        { name: "initGlobalKeyboardShortcuts", init: initGlobalKeyboardShortcuts },
        { name: "initCursorAndParallax", init: initCursorAndParallax },
        { name: "loadGsapIfDesktop", init: loadGsapIfDesktop },
        {
          name: "resizeFxCanvas",
          init: () => {
            window.addEventListener("resize", resizeFxCanvas);
          }
        }
      ];

      deferredModules.forEach((mod) => {
        try {
          mod.init();
        } catch (err) {
          console.error(`[Startup] فشل تشغيل الوحدة المؤجلة (${mod.name}):`, err);
        }
      });
    }

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(runDeferredModules, { timeout: 1200 });
    } else {
      setTimeout(runDeferredModules, 50);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startApplication);
  } else {
    // DOM جاهز مسبقاً (شائع عند فتح الملفات المحلية عبر file://)
    startApplication();
  }
})();
