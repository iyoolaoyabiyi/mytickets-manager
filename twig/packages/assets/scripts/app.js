// packages/utils/theme.ts
var THEME_KEY = "ticketapp_theme";
var isBrowser = () => typeof window !== "undefined";
var prefersDark = () => {
  if (!isBrowser()) return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
};
var getStoredTheme = () => {
  if (!isBrowser()) return "light";
  try {
    const stored = window.localStorage.getItem(THEME_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
  }
  return prefersDark() ? "dark" : "light";
};
var applyTheme = (theme) => {
  if (!isBrowser()) return;
  document.documentElement.dataset.theme = theme;
};
var persistTheme = (theme) => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
  }
  applyTheme(theme);
};
var toggleTheme = (theme) => theme === "light" ? "dark" : "light";

// packages/utils/toast.ts
var TOAST_PUSH_EVENT = "ticketapp:toast";
var TOAST_DISMISS_EVENT = "ticketapp:toast:dismiss";
var DEFAULT_DURATION = 3200;
var isBrowser2 = () => typeof window !== "undefined";
var createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};
var pushToast = (message, level = "info", duration = DEFAULT_DURATION) => {
  if (!isBrowser2()) return;
  const detail = {
    id: createId(),
    message,
    level,
    duration
  };
  window.dispatchEvent(new CustomEvent(TOAST_PUSH_EVENT, { detail }));
};
var dismissToast = (id) => {
  if (!isBrowser2()) return;
  window.dispatchEvent(new CustomEvent(TOAST_DISMISS_EVENT, { detail: { id } }));
};
var subscribeToasts = (listener) => {
  if (!isBrowser2()) return () => {
  };
  const pushHandler = (event) => {
    const custom = event;
    listener(custom.detail);
  };
  window.addEventListener(TOAST_PUSH_EVENT, pushHandler);
  return () => {
    window.removeEventListener(TOAST_PUSH_EVENT, pushHandler);
  };
};
var subscribeToastDismissals = (listener) => {
  if (!isBrowser2()) return () => {
  };
  const handler = (event) => {
    const custom = event;
    listener(custom.detail.id);
  };
  window.addEventListener(TOAST_DISMISS_EVENT, handler);
  return () => {
    window.removeEventListener(TOAST_DISMISS_EVENT, handler);
  };
};

// packages/utils/auth.ts
var isSessionUser = (value) => {
  if (!value || typeof value !== "object" || value === null) return false;
  const candidate = value;
  return typeof candidate.id === "number" && Number.isFinite(candidate.id) && typeof candidate.name === "string" && candidate.name.length > 0 && typeof candidate.email === "string" && candidate.email.length > 0;
};
var isValidSession = (value) => {
  if (!value || typeof value !== "object" || value === null) return false;
  const candidate = value;
  return typeof candidate.token === "string" && candidate.token.length > 0 && typeof candidate.expiresAt === "number" && Number.isFinite(candidate.expiresAt) && isSessionUser(candidate.user);
};
var USERS_KEY = "ticketapp_users";
var SESSION_KEY = "ticketapp_session";
var SESSION_EVENT = "ticketapp:session";
var SESSION_DURATION = 1e3 * 60 * 60 * 24;
var memoryUsers = null;
var memorySession = null;
var isBrowser3 = () => typeof window !== "undefined";
var now = () => (/* @__PURE__ */ new Date()).toISOString();
var ensureSeedUsers = (users) => {
  if (users.length > 0) return users;
  const timestamp = now();
  return [
    {
      id: 1,
      name: "Demo User",
      email: "demo@mytickets.app",
      password: "demo12345",
      created_at: timestamp,
      updated_at: timestamp
    }
  ];
};
var readUsers = () => {
  if (!isBrowser3()) {
    if (!memoryUsers) {
      memoryUsers = ensureSeedUsers([]);
    }
    return [...memoryUsers];
  }
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    if (!raw) {
      const seeded = ensureSeedUsers([]);
      window.localStorage.setItem(USERS_KEY, JSON.stringify(seeded));
      memoryUsers = [...seeded];
      return seeded;
    }
    const parsed = JSON.parse(raw);
    const result = ensureSeedUsers(Array.isArray(parsed) ? parsed : []);
    memoryUsers = [...result];
    return result;
  } catch {
    const fallback = ensureSeedUsers([]);
    memoryUsers = [...fallback];
    return fallback;
  }
};
var writeUsers = (users) => {
  memoryUsers = [...users];
  if (!isBrowser3()) return;
  try {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
  }
};
var writeSession = (session) => {
  memorySession = session;
  if (!isBrowser3()) return;
  if (!session) {
    window.localStorage.removeItem(SESSION_KEY);
    return;
  }
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};
var createToken = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};
var sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email
});
var readSession = () => {
  if (!isBrowser3()) {
    return memorySession;
  }
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!isValidSession(parsed)) {
      writeSession(null);
      return null;
    }
    memorySession = parsed;
    return parsed;
  } catch {
    return null;
  }
};
var isExpired = (session) => {
  if (!session) return true;
  return Date.now() > session.expiresAt;
};
var broadcastSession = (session) => {
  if (!isBrowser3()) return;
  window.dispatchEvent(new CustomEvent(SESSION_EVENT, { detail: session }));
};
var signup = (payload) => {
  const users = readUsers();
  const exists = users.some((user2) => user2.email.toLowerCase() === payload.email.toLowerCase());
  if (exists) {
    throw new Error("Email already registered.");
  }
  const timestamp = now();
  const user = {
    id: users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1,
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
    created_at: timestamp,
    updated_at: timestamp
  };
  const next = [...users, user];
  writeUsers(next);
  return sanitizeUser(user);
};
var login = (payload) => {
  const users = readUsers();
  const user = users.find((candidate) => candidate.email === payload.email.trim().toLowerCase());
  if (!user || user.password !== payload.password) {
    throw new Error("Invalid email or password.");
  }
  const session = {
    user: sanitizeUser(user),
    token: createToken(),
    expiresAt: Date.now() + SESSION_DURATION
  };
  writeSession(session);
  broadcastSession(session);
  return session;
};
var logout = () => {
  writeSession(null);
  broadcastSession(null);
};
var requireAuth = () => {
  const session = readSession();
  if (!session) return false;
  return !isExpired(session);
};
var peekSession = () => readSession();

// packages/utils/tickets.ts
var STORAGE_KEY = "ticketapp_tickets";
var TICKETS_CHANGED_EVENT = "tickets:changed";
var DEFAULT_FILTERS = {
  q: "",
  status: "all",
  priority: "all"
};
var DEFAULT_LATENCY = 120;
var memoryStore = null;
var createSeedTickets = () => {
  const now2 = Date.now();
  const makeTimestamp = (offsetMinutes) => new Date(now2 - offsetMinutes * 60 * 1e3).toISOString();
  return [
    {
      id: 1,
      title: "Welcome to myTickets Manager",
      description: "Start by creating a ticket to track work items and assign statuses.",
      status: "open",
      priority: "high",
      created_at: makeTimestamp(720),
      updated_at: makeTimestamp(45)
    },
    {
      id: 2,
      title: "Review onboarding flow copy",
      description: "Ensure login and signup microcopy matches the latest deck.",
      status: "in_progress",
      priority: "medium",
      created_at: makeTimestamp(1440),
      updated_at: makeTimestamp(120)
    },
    {
      id: 3,
      title: "Archive resolved tickets weekly",
      description: "Closed tickets should be exported and archived every Friday.",
      status: "closed",
      priority: "low",
      created_at: makeTimestamp(4320),
      updated_at: makeTimestamp(1440)
    }
  ];
};
var getStorage = () => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};
var readTickets = () => {
  const storage = getStorage();
  if (!storage) {
    if (memoryStore === null) {
      memoryStore = createSeedTickets();
    }
    return [...memoryStore];
  }
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeds = createSeedTickets();
    storage.setItem(STORAGE_KEY, JSON.stringify(seeds));
    memoryStore = [...seeds];
    return seeds;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("Invalid tickets data");
    memoryStore = [...parsed];
    return parsed;
  } catch {
    const seeds = createSeedTickets();
    storage.setItem(STORAGE_KEY, JSON.stringify(seeds));
    memoryStore = [...seeds];
    return seeds;
  }
};
var writeTickets = (tickets) => {
  const storage = getStorage();
  memoryStore = [...tickets];
  if (storage) {
    storage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(TICKETS_CHANGED_EVENT));
  }
};
var withLatency = async (value, latency = DEFAULT_LATENCY) => {
  await new Promise((resolve) => setTimeout(resolve, latency));
  return value;
};
var generateId = (tickets) => {
  const ids = tickets.map((ticket) => ticket.id);
  return ids.length ? Math.max(...ids) + 1 : 1;
};
var applyFilters = (tickets, filters) => {
  const query = filters.q.trim().toLowerCase();
  return tickets.filter((ticket) => {
    const description = (ticket.description ?? "").toLowerCase();
    const matchesQuery = query ? ticket.title.toLowerCase().includes(query) || description.includes(query) : true;
    const matchesStatus = filters.status === "all" ? true : ticket.status === filters.status;
    const matchesPriority = filters.priority === "all" ? true : ticket.priority === filters.priority;
    return matchesQuery && matchesStatus && matchesPriority;
  }).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
};
var listTickets = async (rawFilters) => {
  const filters = { ...DEFAULT_FILTERS, ...rawFilters };
  const tickets = readTickets();
  return withLatency(applyFilters(tickets, filters));
};
var createTicket = async (draft) => {
  const tickets = readTickets();
  const id = generateId(tickets);
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const ticket = {
    id,
    title: draft.title.trim(),
    description: draft.description?.trim() ?? "",
    status: draft.status,
    priority: draft.priority,
    created_at: timestamp,
    updated_at: timestamp
  };
  const next = [...tickets, ticket];
  writeTickets(next);
  return withLatency(ticket);
};
var updateTicket = async (id, draft) => {
  const tickets = readTickets();
  const index = tickets.findIndex((ticket) => ticket.id === id);
  if (index === -1) {
    throw await withLatency(new Error("Ticket not found"));
  }
  const updated = {
    ...tickets[index],
    title: draft.title.trim(),
    description: draft.description?.trim() ?? "",
    status: draft.status,
    priority: draft.priority,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  const next = [...tickets];
  next.splice(index, 1, updated);
  writeTickets(next);
  return withLatency(updated);
};
var deleteTicket = async (id) => {
  const tickets = readTickets();
  const next = tickets.filter((ticket) => ticket.id !== id);
  writeTickets(next);
  await withLatency(void 0);
};
var getTicketStats = async () => {
  const tickets = readTickets();
  const stats = tickets.reduce(
    (acc, ticket) => {
      acc.total += 1;
      if (ticket.status === "open") acc.open += 1;
      if (ticket.status === "in_progress") acc.inProgress += 1;
      if (ticket.status === "closed") acc.closed += 1;
      return acc;
    },
    { total: 0, open: 0, inProgress: 0, closed: 0 }
  );
  return withLatency(stats);
};
var defaultFilters = () => ({ ...DEFAULT_FILTERS });

// packages/utils/time.ts
var minute = 60 * 1e3;
var hour = 60 * minute;
var day = 24 * hour;
var week = 7 * day;
var formatRelativeTime = (isoDate, now2 = Date.now()) => {
  if (!isoDate) return "";
  const targetTime = new Date(isoDate).getTime();
  if (Number.isNaN(targetTime)) return "";
  const diff = now2 - targetTime;
  if (diff < 0) return "just now";
  if (diff < minute) return "just now";
  if (diff < hour) {
    const minutes = Math.floor(diff / minute);
    return `${minutes}m ago`;
  }
  if (diff < day) {
    const hours = Math.floor(diff / hour);
    return `${hours}h ago`;
  }
  if (diff < week) {
    const days = Math.floor(diff / day);
    return `${days}d ago`;
  }
  const weeks = Math.floor(diff / week);
  return `${weeks}w ago`;
};

// packages/assets/scripts/app.ts
var configEl = document.getElementById("ticket-app-config");
var appConfig = configEl ? JSON.parse(configEl.textContent || "{}") : {};
var copyGlobal = appConfig.copyGlobal || {};
var pageConfig = appConfig.page || { id: document.body.dataset.page, props: {} };
var pageId = pageConfig.id || document.body.dataset.page || "";
var pageProps = pageConfig.props || {};
var normalizeBasePath = (value) => {
  if (typeof value !== "string") return "";
  if (!value) return "";
  return value.endsWith("/") ? value.slice(0, -1) : value;
};
var pathBase = normalizeBasePath(appConfig.pathBase ?? "");
var buildPath = (input) => {
  if (!input) {
    return pathBase || "/";
  }
  if (/^[a-z]+:\/\//i.test(input)) {
    return input;
  }
  let pathPart = input;
  let queryPart = "";
  let hashPart = "";
  const hashIndex = pathPart.indexOf("#");
  if (hashIndex >= 0) {
    hashPart = pathPart.slice(hashIndex);
    pathPart = pathPart.slice(0, hashIndex);
  }
  const queryIndex = pathPart.indexOf("?");
  if (queryIndex >= 0) {
    queryPart = pathPart.slice(queryIndex);
    pathPart = pathPart.slice(0, queryIndex);
  }
  let normalizedPath = pathPart;
  if (!normalizedPath) {
    normalizedPath = "/";
  } else if (!normalizedPath.startsWith("/")) {
    normalizedPath = `/${normalizedPath}`;
  }
  if (pathBase) {
    if (normalizedPath === pathBase || normalizedPath.startsWith(`${pathBase}/`)) {
      return `${normalizedPath}${queryPart}${hashPart}`;
    }
    normalizedPath = `${pathBase}${normalizedPath}`;
  }
  return `${normalizedPath}${queryPart}${hashPart}`;
};
var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var SESSION_EVENT2 = "ticketapp:session";
var applyAuthVisibility = () => {
  const state = requireAuth() ? "auth" : "guest";
  document.documentElement.setAttribute("data-auth-state", state);
  document.querySelectorAll("[data-auth-state]").forEach((node) => {
    node.dataset.authState = state;
  });
  document.querySelectorAll("[data-auth-group]").forEach((group) => {
    const target = group.getAttribute("data-auth-group");
    if (!target) return;
    group.toggleAttribute("hidden", target !== state);
  });
};
var initAuthState = () => {
  applyAuthVisibility();
  if (typeof window === "undefined") return;
  window.addEventListener(SESSION_EVENT2, () => applyAuthVisibility());
};
var initTheme = () => {
  const stored = getStoredTheme();
  persistTheme(stored);
  const themeButtons = document.querySelectorAll('[data-action="toggle-theme"]');
  themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const next = toggleTheme(getStoredTheme());
      persistTheme(next);
      updateThemeButtonLabels(next);
    });
  });
  updateThemeButtonLabels(stored);
};
var updateThemeButtonLabels = (theme) => {
  const nextLabel = copyGlobal?.theme?.toggle?.replace?.("{app.theme}", theme === "light" ? "Dark" : "Light");
  document.querySelectorAll('[data-action="toggle-theme"]').forEach((btn) => {
    if (nextLabel) btn.textContent = nextLabel;
  });
};
var initHeader = () => {
  const header = document.querySelector('[data-component="header"]');
  if (!header) return;
  const nav = header.querySelector("[data-nav]");
  const toggle = header.querySelector('[data-action="toggle-nav"]');
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      toggle.setAttribute("aria-label", expanded ? copyGlobal.nav.toggle.open : copyGlobal.nav.toggle.close);
      const nextState = expanded ? "closed" : "open";
      toggle.dataset.state = nextState;
      nav.dataset.state = nextState;
    });
  }
  header.querySelectorAll("[data-nav-link]").forEach((link) => {
    link.addEventListener("click", () => {
      if (toggle && nav) {
        toggle.setAttribute("aria-expanded", "false");
        toggle.dataset.state = "closed";
        nav.dataset.state = "closed";
      }
    });
  });
  header.querySelectorAll('[data-action="logout"]').forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      logout();
      pushToast(copyGlobal.toasts?.authEnd || "Session ended, please login again to continue.", "info");
      window.location.href = buildPath("/auth/login");
    });
  });
};
var toastStackSelector = "[data-toast-stack]";
var initToasts = () => {
  let stack = document.querySelector(toastStackSelector);
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "c-toast-stack";
    stack.setAttribute("data-toast-stack", "");
    document.body.appendChild(stack);
  }
  const toasts = [];
  const lifetimes = /* @__PURE__ */ new Map();
  const exitTimers = /* @__PURE__ */ new Map();
  const render = () => {
    if (!stack) return;
    stack.innerHTML = "";
    toasts.forEach((toast) => {
      const article = document.createElement("article");
      article.className = "c-toast";
      article.dataset.level = toast.level;
      article.dataset.leaving = String(toast.leaving);
      article.setAttribute("role", toast.level === "error" ? "alert" : "status");
      const message = document.createElement("div");
      message.className = "c-toast__message";
      message.textContent = toast.message;
      article.appendChild(message);
      const close = document.createElement("button");
      close.type = "button";
      close.className = "c-toast__close";
      close.setAttribute("aria-label", "Dismiss notification");
      close.innerHTML = "&times;";
      close.addEventListener("click", () => dismissToast(toast.id));
      article.appendChild(close);
      stack.appendChild(article);
    });
  };
  const scheduleExit = (id, delay = 220) => {
    if (exitTimers.has(id)) return;
    const timer = window.setTimeout(() => {
      const index = toasts.findIndex((t) => t.id === id);
      if (index >= 0) {
        toasts.splice(index, 1);
        render();
      }
      lifetimes.delete(id);
      exitTimers.delete(id);
    }, delay);
    exitTimers.set(id, timer);
  };
  const handlePush = (toast) => {
    toasts.push({ ...toast, leaving: false });
    render();
    const timer = window.setTimeout(() => dismissToast(toast.id), toast.duration);
    lifetimes.set(toast.id, timer);
  };
  const handleDismiss = (id) => {
    const toast = toasts.find((t) => t.id === id);
    if (!toast) return;
    toast.leaving = true;
    render();
    scheduleExit(id);
  };
  const unsubscribePush = subscribeToasts(handlePush);
  const unsubscribeDismiss = subscribeToastDismissals(handleDismiss);
  window.addEventListener("beforeunload", () => {
    unsubscribePush?.();
    unsubscribeDismiss?.();
    lifetimes.forEach((timer) => window.clearTimeout(timer));
    exitTimers.forEach((timer) => window.clearTimeout(timer));
  });
};
var setFieldError = (field, message) => {
  if (!field) return;
  if (!message) {
    field.textContent = "";
    field.setAttribute("hidden", "true");
  } else {
    field.textContent = message;
    field.removeAttribute("hidden");
  }
};
var initLoginForm = () => {
  const form = document.querySelector('[data-auth-form="login"]');
  if (!form) return;
  const copy = pageProps.copy;
  const emailInput = form.querySelector("#login-email");
  const passwordInput = form.querySelector("#login-password");
  const emailError = form.querySelector("#login-email-error");
  const passwordError = form.querySelector("#login-password-error");
  const formError = form.querySelector("#login-form-error");
  const submitButton = form.querySelector('[data-button="submit"]');
  const redirect = form.dataset.redirect;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = emailInput?.value.trim() || "";
    const password = passwordInput?.value || "";
    let valid = true;
    if (!email) {
      setFieldError(emailError, copyGlobal.validation?.required || "This field is required.");
      valid = false;
    } else if (!emailPattern.test(email)) {
      setFieldError(emailError, copyGlobal.validation?.email || "Enter a valid email address.");
      valid = false;
    } else {
      setFieldError(emailError, "");
    }
    if (!password) {
      setFieldError(passwordError, copyGlobal.validation?.required || "This field is required.");
      valid = false;
    } else {
      setFieldError(passwordError, "");
    }
    if (!valid) return;
    setFieldError(formError, "");
    submitButton?.setAttribute("disabled", "true");
    submitButton && (submitButton.textContent = "\u2026");
    try {
      const session = await login({ email: email.toLowerCase(), password });
      const message = (copyGlobal.toasts?.authSuccess || "Welcome back {name}.").replace("{name}", session.user.name || "there");
      pushToast(message, "success");
      const target = redirect ? buildPath(redirect) : buildPath("/dashboard");
      window.location.href = target;
    } catch (error) {
      const message = error instanceof Error ? error.message : copyGlobal.toasts?.authError || "Invalid email or password.";
      setFieldError(formError, message);
      pushToast(message, "error");
      submitButton?.removeAttribute("disabled");
      submitButton && (submitButton.textContent = copy.form.submit);
    }
  });
};
var initSignupForm = () => {
  const form = document.querySelector('[data-auth-form="signup"]');
  if (!form) return;
  const copy = pageProps.copy;
  const nameInput = form.querySelector("#signup-name");
  const emailInput = form.querySelector("#signup-email");
  const passwordInput = form.querySelector("#signup-password");
  const confirmInput = form.querySelector("#signup-confirm");
  const nameError = form.querySelector("#signup-name-error");
  const emailError = form.querySelector("#signup-email-error");
  const passwordError = form.querySelector("#signup-password-error");
  const confirmError = form.querySelector("#signup-confirm-error");
  const formError = form.querySelector("#signup-form-error");
  const submitButton = form.querySelector('[data-button="submit"]');
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = nameInput?.value.trim() || "";
    const email = emailInput?.value.trim() || "";
    const password = passwordInput?.value || "";
    const confirm = confirmInput?.value || "";
    let valid = true;
    if (!name) {
      setFieldError(nameError, copyGlobal.validation?.required || "This field is required.");
      valid = false;
    } else {
      setFieldError(nameError, "");
    }
    if (!email) {
      setFieldError(emailError, copyGlobal.validation?.required || "This field is required.");
      valid = false;
    } else if (!emailPattern.test(email)) {
      setFieldError(emailError, copyGlobal.validation?.email || "Enter a valid email address.");
      valid = false;
    } else {
      setFieldError(emailError, "");
    }
    if (!password) {
      setFieldError(passwordError, copyGlobal.validation?.required || "This field is required.");
      valid = false;
    } else if (password.length < 8) {
      setFieldError(passwordError, copyGlobal.validation?.passwordLength || "Use at least 8 characters.");
      valid = false;
    } else {
      setFieldError(passwordError, "");
    }
    if (!confirm) {
      setFieldError(confirmError, copyGlobal.validation?.required || "This field is required.");
      valid = false;
    } else if (password !== confirm) {
      setFieldError(confirmError, copyGlobal.validation?.passwordMatch || "Passwords do not match.");
      valid = false;
    } else {
      setFieldError(confirmError, "");
    }
    if (!valid) return;
    setFieldError(formError, "");
    submitButton?.setAttribute("disabled", "true");
    submitButton && (submitButton.textContent = "\u2026");
    try {
      await signup({ name, email: email.toLowerCase(), password });
      pushToast(copyGlobal.toasts?.postSignup || "Account created. Please login.", "success");
      window.location.href = buildPath("/auth/login");
    } catch (error) {
      const message = error instanceof Error ? error.message : copyGlobal.toasts?.validation || "Please fix the errors and try again.";
      setFieldError(formError, message);
      pushToast(message, "error");
      submitButton?.removeAttribute("disabled");
      submitButton && (submitButton.textContent = copy.form.submit);
    }
  });
};
var guardRoutes = () => {
  const protectedPages = ["dashboard", "tickets", "ticket-edit"];
  const authPages = ["login", "signup"];
  if (protectedPages.includes(pageId)) {
    if (!requireAuth()) {
      const message = peekSession() ? copyGlobal.toasts?.sessionExpired || "Your session has expired, please log in again." : copyGlobal.toasts?.sessionInvalid || "Invalid session, please login to access resource.";
      pushToast(message, "error");
      const redirect = encodeURIComponent(window.location.pathname + window.location.search);
      const loginUrl = buildPath("/auth/login");
      window.location.replace(`${loginUrl}?redirect=${redirect}`);
      return false;
    }
  }
  if (authPages.includes(pageId) && requireAuth()) {
    window.location.replace(buildPath("/dashboard"));
    return false;
  }
  return true;
};
var initDashboard = async () => {
  if (pageId !== "dashboard") return;
  const statsContainer = document.querySelector("[data-dashboard-stats]");
  const statElements = {
    total: document.querySelector('[data-stat="total"]'),
    open: document.querySelector('[data-stat="open"]'),
    inProgress: document.querySelector('[data-stat="inProgress"]'),
    closed: document.querySelector('[data-stat="closed"]')
  };
  const empty = document.querySelector("[data-dashboard-empty]");
  try {
    const stats = await getTicketStats();
    Object.entries(statElements).forEach(([key, el]) => {
      if (el) el.textContent = String(stats[key] ?? 0);
    });
    if (statsContainer) statsContainer.setAttribute("aria-busy", "false");
    if (empty) {
      if ((stats.total ?? 0) === 0) {
        empty.hidden = false;
      } else {
        empty.hidden = true;
      }
    }
  } catch (error) {
    console.error(error);
    if (statsContainer) statsContainer.setAttribute("aria-busy", "false");
  }
};
var renderTicketCard = (template, ticket, copy) => {
  const fragment = template.content.cloneNode(true);
  const article = fragment.querySelector("article");
  article.dataset.ticketId = String(ticket.id);
  const title = fragment.querySelector("[data-ticket-title]");
  const meta = fragment.querySelector("[data-ticket-meta]");
  const description = fragment.querySelector("[data-ticket-description]");
  const status = fragment.querySelector("[data-ticket-status]");
  const priority = fragment.querySelector("[data-ticket-priority]");
  if (title) title.textContent = ticket.title;
  if (meta) meta.textContent = copy.card.metaPattern.replace("#{id}", `#${ticket.id}`).replace("{relativeTime}", formatRelativeTime(ticket.updated_at) || "just now");
  if (description) {
    if (ticket.description) {
      description.textContent = ticket.description;
      description.hidden = false;
    } else {
      description.hidden = true;
    }
  }
  const statusClass = (status2) => {
    switch (status2) {
      case "in_progress":
        return "c-tag--in-progress";
      case "closed":
        return "c-tag--closed";
      default:
        return "c-tag--open";
    }
  };
  if (status) {
    status.textContent = ticket.status.replace("_", " ");
    status.className = `c-tag ${statusClass(ticket.status)}`;
  }
  if (priority) {
    priority.textContent = ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1);
    priority.className = "c-tag";
  }
  return article;
};
var renderEmptyState = (template, state, copy, onPrimary) => {
  const fragment = template.content.cloneNode(true);
  const container = fragment.querySelector(".c-empty");
  const title = container.querySelector("[data-empty-title]");
  const button = container.querySelector('[data-action="primary"]');
  const emptyCopy = state === "filtered" ? copy.empty.filtered : copy.empty.primary;
  if (title) title.textContent = emptyCopy.title;
  if (button) {
    button.textContent = emptyCopy.action;
    button.onclick = onPrimary;
    button.className = `c-button ${state === "filtered" ? "c-button--secondary" : "c-button--primary"}`;
  }
  return container;
};
var initTicketsPage = () => {
  if (pageId !== "tickets") return;
  const copy = pageProps.copy;
  const filtersForm = document.querySelector("[data-ticket-filters]");
  const alert = document.querySelector("[data-alert]");
  const feed = document.querySelector("[data-tickets-feed]");
  const template = document.getElementById("ticket-card-template");
  const emptyTemplate = document.getElementById("ticket-empty-template");
  const createButton = document.querySelector('[data-action="open-create"]');
  if (!filtersForm || !feed || !template || !emptyTemplate) return;
  let filters = { ...defaultFilters() };
  let tickets = [];
  let modal = null;
  let searchTimeout;
  let escListener = null;
  const setAlert = (message) => {
    if (!alert) return;
    if (!message) {
      alert.hidden = true;
      alert.textContent = "";
    } else {
      alert.hidden = false;
      alert.textContent = message;
    }
  };
  const resetFilters = () => {
    filters = { ...defaultFilters() };
    const searchInput = filtersForm.querySelector("#tickets-search");
    if (searchInput) searchInput.value = "";
    const statusSelect = filtersForm.querySelector("#tickets-status");
    if (statusSelect) statusSelect.value = "all";
    const prioritySelect = filtersForm.querySelector("#tickets-priority");
    if (prioritySelect) prioritySelect.value = "all";
    setAlert("");
  };
  const closeModal = () => {
    if (modal) {
      modal.remove();
      modal = null;
    }
    if (escListener) {
      document.removeEventListener("keydown", escListener);
      escListener = null;
    }
  };
  const openModal = (mode, ticket) => {
    closeModal();
    modal = document.createElement("div");
    modal.className = "c-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    const panel = document.createElement("div");
    panel.className = "c-modal__panel";
    modal.appendChild(panel);
    const heading = document.createElement("h2");
    heading.className = "c-modal__title";
    heading.textContent = mode === "edit" ? copy.form.actions.update : copy.actions.new;
    panel.appendChild(heading);
    const form = document.createElement("form");
    form.className = "l-stack";
    panel.appendChild(form);
    const makeField = (labelText, id, element, value = "", options) => {
      const wrapper = document.createElement("div");
      wrapper.className = "c-field";
      const label = document.createElement("label");
      label.className = "c-field__label";
      label.setAttribute("for", id);
      label.textContent = labelText;
      wrapper.appendChild(label);
      const control = document.createElement(element);
      control.className = "c-field__control";
      control.id = id;
      if (element === "textarea" && options?.rows) {
        control.rows = options.rows;
      }
      if (options?.type) control.setAttribute("type", options.type);
      if (options?.placeholder) control.setAttribute("placeholder", options.placeholder);
      if ("value" in control) control.value = value;
      wrapper.appendChild(control);
      return { wrapper, control };
    };
    const titleField = makeField(copy.form.labels.title, "ticket-title", "input", ticket?.title || "", {
      placeholder: copy.form.placeholders?.title || "Enter ticket title"
    });
    form.appendChild(titleField.wrapper);
    const descriptionField = makeField(copy.form.labels.description, "ticket-description", "textarea", ticket?.description || "", {
      rows: 5,
      placeholder: copy.form.placeholders?.description || "Enter ticket description"
    });
    form.appendChild(descriptionField.wrapper);
    const statusField = document.createElement("div");
    statusField.className = "c-field";
    const statusLabel = document.createElement("label");
    statusLabel.className = "c-field__label";
    statusLabel.setAttribute("for", "ticket-status");
    statusLabel.textContent = copy.form.labels.status;
    statusField.appendChild(statusLabel);
    const statusSelect = document.createElement("select");
    statusSelect.className = "c-field__control";
    statusSelect.id = "ticket-status";
    copy.card.statusTags.forEach((status) => {
      const option = document.createElement("option");
      option.value = status;
      option.textContent = status.replace("_", " ");
      if (ticket && ticket.status === status) option.selected = true;
      statusSelect.appendChild(option);
    });
    statusField.appendChild(statusSelect);
    form.appendChild(statusField);
    const priorityField = document.createElement("div");
    priorityField.className = "c-field";
    const priorityLabel = document.createElement("label");
    priorityLabel.className = "c-field__label";
    priorityLabel.setAttribute("for", "ticket-priority");
    priorityLabel.textContent = copy.form.labels.priority;
    priorityField.appendChild(priorityLabel);
    const prioritySelect = document.createElement("select");
    prioritySelect.className = "c-field__control";
    prioritySelect.id = "ticket-priority";
    copy.card.priorityTags.forEach((priority) => {
      const option = document.createElement("option");
      option.value = priority;
      option.textContent = priority.charAt(0).toUpperCase() + priority.slice(1);
      if (ticket && ticket.priority === priority) option.selected = true;
      prioritySelect.appendChild(option);
    });
    priorityField.appendChild(prioritySelect);
    form.appendChild(priorityField);
    const actions = document.createElement("div");
    actions.className = "c-modal__actions";
    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "c-button c-button--secondary";
    cancel.textContent = copy.form.actions.cancel;
    cancel.addEventListener("click", closeModal);
    actions.appendChild(cancel);
    const submit = document.createElement("button");
    submit.type = "submit";
    submit.className = "c-button c-button--primary";
    submit.textContent = mode === "edit" ? copy.form.actions.update : copy.form.actions.save;
    actions.appendChild(submit);
    form.appendChild(actions);
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const draft = {
        title: titleField.control.value.trim(),
        description: descriptionField.control.value.trim(),
        status: statusSelect.value,
        priority: prioritySelect.value
      };
      if (!draft.title) {
        pushToast(copyGlobal.validation?.titleRequired || "Enter a ticket title.", "error");
        return;
      }
      try {
        if (mode === "edit" && ticket) {
          await updateTicket(ticket.id, draft);
          pushToast(copyGlobal.toasts?.updateSuccess || "Ticket updated successfully.", "success");
        } else {
          await createTicket(draft);
          pushToast(copyGlobal.toasts?.createSuccess || "Ticket created successfully.", "success");
        }
        closeModal();
        await loadTickets(filters);
      } catch (error) {
        console.error(error);
        pushToast(copyGlobal.toasts?.validation || "Please fix the errors and try again.", "error");
      }
    });
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });
    escListener = (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };
    document.addEventListener("keydown", escListener);
    document.body.appendChild(modal);
    const firstInput = modal.querySelector("#ticket-title");
    firstInput?.focus();
  };
  const renderTickets = () => {
    feed.innerHTML = "";
    if (tickets.length === 0) {
      const filtered = filters.q.trim() !== "" || filters.status !== "all" || filters.priority !== "all";
      const state = filtered ? "filtered" : "primary";
      const empty = renderEmptyState(emptyTemplate, state, copy, () => {
        if (state === "filtered") {
          resetFilters();
          void loadTickets(filters);
        } else {
          openModal("create");
        }
      });
      feed.appendChild(empty);
      return;
    }
    tickets.forEach((ticket) => {
      const card = renderTicketCard(template, ticket, copy);
      const editButton = card.querySelector('[data-action="edit-ticket"]');
      editButton?.addEventListener("click", () => openModal("edit", ticket));
      const deleteButton = card.querySelector('[data-action="delete-ticket"]');
      if (deleteButton) {
        deleteButton.addEventListener("click", async () => {
          if (!window.confirm(`${copyGlobal.confirm?.delete?.title || "Delete ticket?"}
${copyGlobal.confirm?.delete?.body || "This action cannot be undone."}`)) {
            return;
          }
          setAlert("");
          try {
            await deleteTicket(ticket.id);
            pushToast(copyGlobal.toasts?.deleteSuccess || "Ticket deleted.", "success");
            await loadTickets(filters);
          } catch (error) {
            console.error(error);
            setAlert(copyGlobal.toasts?.loadError || "Failed to load tickets. Please retry.");
            pushToast(copyGlobal.toasts?.loadError || "Failed to load tickets. Please retry.", "error");
          }
        });
      }
      feed.appendChild(card);
    });
  };
  const loadTickets = async (criteria) => {
    filters = { ...criteria };
    feed.setAttribute("aria-busy", "true");
    setAlert("");
    try {
      tickets = await listTickets(criteria);
      feed.setAttribute("aria-busy", "false");
      renderTickets();
    } catch (error) {
      console.error(error);
      feed.innerHTML = `<div class="c-card c-card--error">${copyGlobal.toasts?.loadError || "Failed to load tickets. Please retry."}</div>`;
      feed.setAttribute("aria-busy", "false");
    }
  };
  filtersForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (typeof searchTimeout === "number") window.clearTimeout(searchTimeout);
    void loadTickets(filters);
  });
  filtersForm.addEventListener("input", (event) => {
    const target = event.target;
    if (!target.name) return;
    filters = { ...filters, [target.name]: target.value };
    if (target.name === "q") {
      if (typeof searchTimeout === "number") window.clearTimeout(searchTimeout);
      searchTimeout = window.setTimeout(() => {
        void loadTickets(filters);
      }, 240);
    } else {
      void loadTickets(filters);
    }
  }, true);
  createButton?.addEventListener("click", () => openModal("create"));
  window.addEventListener(TICKETS_CHANGED_EVENT, () => {
    void loadTickets(filters);
  });
  void loadTickets(filters);
};
var bootstrap = () => {
  initTheme();
  initAuthState();
  initHeader();
  initToasts();
  if (!guardRoutes()) return;
  switch (pageId) {
    case "login":
      initLoginForm();
      break;
    case "signup":
      initSignupForm();
      break;
    case "dashboard":
      void initDashboard();
      break;
    case "tickets":
      initTicketsPage();
      break;
    default:
      break;
  }
};
document.addEventListener("DOMContentLoaded", bootstrap);
