import Sortable from "sortablejs";
import type {
  Forecast,
  HourlyPoint,
  Location,
  Units,
} from "../domain/weather.ts";
import {
  selectForecastForSelectedLocation,
  selectSavedLocations,
  selectSearchResults,
  selectSelectedLocation,
  selectUnits,
} from "../store/selectors.ts";
import type { AppState, ModalType } from "../store/state.ts";
import { forecastKey } from "../store/state.ts";
import {
  createAreaChart,
  createBarChart,
  createDualLineChart,
  createLineChart,
  destroyAllCharts,
} from "./charts.ts";
import { icons } from "./icons.ts";
import { weatherDescription, weatherIcon } from "./weatherIcons.ts";

/* ── Public types ─────────────────────────────────────── */

export type AppActions = {
  onQuery: (q: string) => void;
  onPickLocation: (id: number) => void;
  onSaveLocation: (id: number) => void;
  onToggleSaved: (id: number) => void;
  onRemoveLocation: (id: number) => void;
  onReorderLocations: (orderedIds: number[]) => void;
  onSetUnits: (units: Units) => void;
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  onOpenModal: (type: ModalType) => void;
  onCloseModal: () => void;
};

export type AppView = { update: (state: AppState) => void };

/* ── Helpers ──────────────────────────────────────────── */

function esc(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function fmtTemp(t: number): string {
  return `${Math.round(t)}°`;
}

function fmtTimeShort(iso: string): string {
  return iso.slice(11, 16);
}

function getDayName(dateISO: string, index: number): string {
  if (index === 0) return "Today";
  const [y, m, d] = dateISO.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en", { weekday: "short" });
}

function locationSubtitle(loc: Location): string {
  return [loc.admin1, loc.country].filter(Boolean).join(", ");
}

function windCompass(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

function uvLabel(uv: number): string {
  if (uv <= 2) return "Low";
  if (uv <= 5) return "Moderate";
  if (uv <= 7) return "High";
  if (uv <= 10) return "Very High";
  return "Extreme";
}

function uvDescription(uv: number): string {
  if (uv <= 2) return "No protection needed. You can safely stay outside.";
  if (uv <= 5) return "Wear sunscreen. Seek shade during midday hours.";
  if (uv <= 7) return "Protection essential. Reduce time in direct sun.";
  if (uv <= 10) return "Extra protection needed. Avoid being outside.";
  return "Take all precautions. Stay indoors if possible.";
}

function humidityDesc(h: number): string {
  if (h < 30) return "Very dry. Consider using a humidifier.";
  if (h < 60) return "Comfortable humidity level.";
  if (h < 80) return "It may feel muggy and sticky.";
  return "Very high humidity. Uncomfortable conditions.";
}

function visibilityDesc(v: number): string {
  const km = v / 1000;
  if (km < 1) return "Dense fog. Very poor visibility.";
  if (km < 2) return "Foggy conditions. Reduced visibility.";
  if (km < 5) return "Haze or mist. Slightly reduced.";
  if (km < 10) return "Good visibility conditions.";
  return "Perfectly clear. Excellent visibility.";
}

/* ── Mount ────────────────────────────────────────────── */

export function mountApp(root: HTMLElement, actions: AppActions): AppView {
  root.innerHTML = `
<div class="app-layout">
  <!-- Sidebar toggle -->
  <button class="sidebar-toggle" title="Toggle sidebar">${icons.menu}</button>

  <!-- Add location button (hidden by default) -->
  <button class="add-location-btn" title="Save location">${icons.plus}</button>

  <!-- Theme toggle -->
  <button class="theme-toggle" title="Toggle theme">${icons.sun}</button>

  <!-- Sidebar -->
  <aside class="sidebar">
    <div class="sidebar__search">
      ${icons.search.replace('class="lucide', 'class="sidebar__search-icon lucide')}
      <input class="sidebar__search-input" type="text"
             placeholder="Search" autocomplete="off" spellcheck="false" />
    </div>
    <div class="sidebar__list"></div>
  </aside>

  <!-- Main -->
  <main class="main">
    <div class="main__empty">Search for a city to get started</div>

    <div class="main__content" style="display:none">
      <header class="header">
        <div class="header__label"></div>
        <div class="header__city"></div>
        <div class="header__temp"></div>
        <div class="header__condition"></div>
        <div class="header__feels-like"></div>
        <div class="header__hilo"></div>
      </header>

      <section class="hourly-card" data-modal="hourly">
        <div class="hourly-card__summary"></div>
        <div class="hourly-card__scroll"></div>
      </section>

      <div class="cards-grid">
        <!-- 10-Day Forecast (large) -->
        <section class="weather-card weather-card--large" data-modal="forecast">
          <div class="weather-card__header">
            <span class="weather-card__header-icon">${icons.calendar}</span>
            <span class="weather-card__header-label">10-Day Forecast</span>
          </div>
          <div class="daily-card__rows"></div>
        </section>

        <!-- UV Index -->
        <section class="weather-card" data-modal="uv">
          <div class="weather-card__header">
            <span class="weather-card__header-icon">${icons.sun}</span>
            <span class="weather-card__header-label">UV Index</span>
          </div>
          <div class="card-body" data-card="uv">
            <div class="card-value uv-value">—</div>
            <div class="card-label uv-label-text"></div>
            <div class="uv-bar"><div class="uv-bar__marker" style="left:0%"></div></div>
            <div class="card-description uv-desc"></div>
          </div>
        </section>

        <!-- Sunrise -->
        <section class="weather-card" data-modal="sun">
          <div class="weather-card__header">
            <span class="weather-card__header-icon">${icons.sunrise}</span>
            <span class="weather-card__header-label">Sunrise</span>
          </div>
          <div class="card-body" data-card="sunrise">
            <div class="card-value sunrise-value">—</div>
            <div class="sun-arc">
              <svg viewBox="0 0 120 50" width="100%" height="100%">
                <path d="M 10 45 Q 60 5, 110 45" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
                <circle class="sun-arc__dot" cx="60" cy="25" r="3" fill="currentColor" opacity="0.8"/>
              </svg>
            </div>
            <div class="card-description sunrise-desc"></div>
          </div>
        </section>

        <!-- Wind -->
        <section class="weather-card" data-modal="wind">
          <div class="weather-card__header">
            <span class="weather-card__header-icon">${icons.wind}</span>
            <span class="weather-card__header-label">Wind</span>
          </div>
          <div class="card-body" data-card="wind">
            <div class="wind-compass">
              <div class="wind-compass__circle"></div>
              <span class="wind-compass__label wind-compass__label--n">N</span>
              <span class="wind-compass__label wind-compass__label--e">E</span>
              <span class="wind-compass__label wind-compass__label--s">S</span>
              <span class="wind-compass__label wind-compass__label--w">W</span>
              <svg class="wind-compass__arrow" viewBox="0 0 24 56" style="position:absolute;inset:0;margin:auto;width:20px;height:48px;transition:transform .3s">
                <path d="M 12 0 L 16 10 L 13 10 L 13 18 L 11 18 L 11 10 L 8 10 Z" fill="#3b82f6"/>
                <rect x="11" y="38" width="2" height="12" fill="#3b82f6" opacity="0.5"/>
                <circle cx="12" cy="53" r="3" fill="#3b82f6" opacity="0.5"/>
              </svg>
              <div class="wind-compass__speed wind-speed-val">—</div>
            </div>
            <div class="card-description wind-desc"></div>
          </div>
        </section>

        <!-- Humidity -->
        <section class="weather-card" data-modal="humidity">
          <div class="weather-card__header">
            <span class="weather-card__header-icon">${icons.droplets}</span>
            <span class="weather-card__header-label">Humidity</span>
          </div>
          <div class="card-body" data-card="humidity">
            <div class="card-value humidity-value">—</div>
            <div class="card-description humidity-desc"></div>
          </div>
        </section>

        <!-- Visibility -->
        <section class="weather-card" data-modal="visibility">
          <div class="weather-card__header">
            <span class="weather-card__header-icon">${icons.eye}</span>
            <span class="weather-card__header-label">Visibility</span>
          </div>
          <div class="card-body" data-card="visibility">
            <div class="card-value visibility-value">—</div>
            <div class="card-description visibility-desc"></div>
          </div>
        </section>

        <!-- Pressure -->
        <section class="weather-card" data-modal="pressure">
          <div class="weather-card__header">
            <span class="weather-card__header-icon">${icons.gauge}</span>
            <span class="weather-card__header-label">Pressure</span>
          </div>
          <div class="card-body" data-card="pressure">
            <div class="pressure-gauge">
              <svg viewBox="0 0 200 100" width="100%" height="100%"></svg>
              <div class="pressure-gauge__value">
                <div class="pressure-gauge__number pressure-val">—</div>
                <div class="pressure-gauge__unit">hPa</div>
              </div>
            </div>
            <div class="pressure-gauge__labels"><span>Low</span><span>High</span></div>
          </div>
        </section>

        <!-- Precipitation -->
        <section class="weather-card" data-modal="precipitation">
          <div class="weather-card__header">
            <span class="weather-card__header-icon">${icons.cloudDrizzle}</span>
            <span class="weather-card__header-label">Precipitation</span>
          </div>
          <div class="card-body" data-card="precipitation">
            <div class="card-value precip-value">—</div>
            <div class="card-description precip-desc"></div>
          </div>
        </section>

        <!-- Feels Like -->
        <section class="weather-card" data-modal="feelslike">
          <div class="weather-card__header">
            <span class="weather-card__header-icon">${icons.thermometer}</span>
            <span class="weather-card__header-label">Feels Like</span>
          </div>
          <div class="card-body" data-card="feels">
            <div class="card-value feels-value">—</div>
            <div class="feels-bar"><div class="feels-bar__marker" style="left:50%"></div></div>
            <div class="card-description feels-desc"></div>
          </div>
        </section>
      </div>
    </div>
  </main>
</div>

<!-- Modal -->
<div class="modal-backdrop"></div>
<div class="modal-panel">
  <div class="modal__header">
    <span class="modal__title"></span>
    <button class="modal__close">${icons.x}</button>
  </div>
  <div class="modal__body"></div>
</div>`;

  /* ── Element references ─────────────────────────────── */
  const $ = <T extends HTMLElement>(sel: string) => {
    const el = root.querySelector<T>(sel);
    if (!el) throw new Error(`Missing element: ${sel}`);
    return el;
  };

  const appLayout = $(".app-layout");
  const sidebarToggle = $<HTMLButtonElement>(".sidebar-toggle");
  const addLocationBtn = $<HTMLButtonElement>(".add-location-btn");
  const themeToggle = $<HTMLButtonElement>(".theme-toggle");
  const input = $<HTMLInputElement>(".sidebar__search-input");
  const sidebarList = $(".sidebar__list");
  const mainEmpty = $(".main__empty");
  const mainContent = $(".main__content");

  const headerLabel = $(".header__label");
  const headerCity = $(".header__city");
  const headerTemp = $(".header__temp");
  const headerCondition = $(".header__condition");
  const headerFeelsLike = $(".header__feels-like");
  const headerHiLo = $(".header__hilo");

  const hourlySummary = $(".hourly-card__summary");
  const hourlyScroll = $(".hourly-card__scroll");
  const dailyRows = $(".daily-card__rows");

  /* Card value elements */
  const uvValueEl = $(".uv-value");
  const uvLabelEl = $(".uv-label-text");
  const uvBarMarker = $(".uv-bar__marker");
  const uvDescEl = $(".uv-desc");

  const sunriseValueEl = $(".sunrise-value");
  const sunriseDescEl = $(".sunrise-desc");

  const windSpeedEl = $(".wind-speed-val");
  const windArrow = root.querySelector<SVGElement>(".wind-compass__arrow")!;
  const windDescEl = $(".wind-desc");

  const humidityValueEl = $(".humidity-value");
  const humidityDescEl = $(".humidity-desc");

  const visibilityValueEl = $(".visibility-value");
  const visibilityDescEl = $(".visibility-desc");

  const pressureValEl = $(".pressure-val");
  const pressureSvg = root.querySelector<SVGElement>(
    "[data-card='pressure'] svg",
  )!;

  const precipValueEl = $(".precip-value");
  const precipDescEl = $(".precip-desc");

  const feelsValueEl = $(".feels-value");
  const feelsBarMarker = $(".feels-bar__marker");
  const feelsDescEl = $(".feels-desc");

  /* Modal */
  const modalBackdrop =
    root.querySelector<HTMLElement>(".modal-backdrop") ??
    document.querySelector<HTMLElement>(".modal-backdrop")!;
  const modalPanel =
    root.querySelector<HTMLElement>(".modal-panel") ??
    document.querySelector<HTMLElement>(".modal-panel")!;
  const modalTitle = modalPanel.querySelector<HTMLElement>(".modal__title")!;
  const modalClose = modalPanel.querySelector<HTMLElement>(".modal__close")!;
  const modalBody = modalPanel.querySelector<HTMLElement>(".modal__body")!;

  /* ── Wire events ────────────────────────────────────── */

  sidebarToggle.addEventListener("click", () => actions.onToggleSidebar());
  addLocationBtn.addEventListener("click", () => {
    const state = lastState;
    if (state?.prefs.selectedLocationId != null) {
      actions.onSaveLocation(state.prefs.selectedLocationId);
    }
  });
  themeToggle.addEventListener("click", () => actions.onToggleTheme());
  input.addEventListener("input", () => actions.onQuery(input.value));

  sidebarList.addEventListener("click", (e) => {
    const deleteBtn = (e.target as HTMLElement).closest<HTMLElement>(
      "[data-delete-id]",
    );
    if (deleteBtn) {
      e.stopPropagation();
      actions.onRemoveLocation(Number(deleteBtn.dataset.deleteId));
      return;
    }
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-loc-id]");
    if (el) actions.onPickLocation(Number(el.dataset.locId));
  });

  /* Card click → open modal */
  for (const card of root.querySelectorAll<HTMLElement>("[data-modal]")) {
    card.addEventListener("click", () => {
      const type = card.dataset.modal as ModalType;
      if (type) actions.onOpenModal(type);
    });
  }

  modalBackdrop.addEventListener("click", () => actions.onCloseModal());
  modalClose.addEventListener("click", () => actions.onCloseModal());
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lastState?.ui.activeModal) actions.onCloseModal();
  });

  /* ── State tracking ─────────────────────────────────── */
  let lastState: AppState | null = null;
  let lastSidebarHtml = "";
  let sortableInstance: Sortable | null = null;

  /* ── Render helpers ─────────────────────────────────── */

  function renderSidebarItems(
    locations: (Location | undefined)[],
    state: AppState,
    selectedLoc: Location | undefined,
    units: Units,
    showDelete = false,
  ): string {
    return locations
      .filter((l): l is Location => l != null)
      .map((loc) => {
        const selected = selectedLoc?.id === loc.id;
        const key = forecastKey(loc.id, units);
        const fc = state.entities.forecastsByKey[key];
        const cls = selected
          ? "sidebar-item sidebar-item--selected"
          : "sidebar-item";

        const tempHtml = fc
          ? `<span class="sidebar-item__temp">${fmtTemp(fc.current.temp)}</span>`
          : "";
        const condHtml = fc
          ? `<span class="sidebar-item__condition">${esc(weatherDescription(fc.current.weatherCode))}</span>`
          : "";
        const hiloHtml = fc?.daily[0]
          ? `<div class="sidebar-item__hilo">H:${fmtTemp(fc.daily[0].tempMax)}  L:${fmtTemp(fc.daily[0].tempMin)}</div>`
          : "";
        const deleteHtml = showDelete
          ? `<button class="sidebar-item__delete" data-delete-id="${loc.id}" aria-label="Remove ${esc(loc.name)}">${icons.x}</button>`
          : "";

        return `
      <div class="${cls}" data-loc-id="${loc.id}">
        ${deleteHtml}
        <div class="sidebar-item__row">
          <span class="sidebar-item__city">${esc(loc.name)}</span>
          ${tempHtml}
        </div>
        <div class="sidebar-item__row">
          <span class="sidebar-item__subtitle">${esc(locationSubtitle(loc))}</span>
          ${condHtml}
        </div>
        ${hiloHtml}
      </div>`;
      })
      .join("");
  }

  function renderHourly(fc: Forecast): void {
    hourlySummary.textContent = `${weatherDescription(fc.current.weatherCode)} conditions expected.`;

    const currentTs = fc.current.timeISO.slice(0, 13);
    let startIdx = fc.hourly.findIndex(
      (h) => h.timeISO.slice(0, 13) === currentTs,
    );
    if (startIdx < 0) startIdx = 0;

    const hours = fc.hourly.slice(startIdx, startIdx + 25);
    hourlyScroll.innerHTML = hours
      .map((h, i) => {
        const label = i === 0 ? "Now" : h.timeISO.slice(11, 13);
        const precipHtml =
          h.precipitationProbability > 0
            ? `<span class="hourly-item__precip">${Math.round(h.precipitationProbability)}%</span>`
            : "";
        return `
      <div class="hourly-item">
        <span class="hourly-item__time">${label}</span>
        <span class="hourly-item__icon">${weatherIcon(h.weatherCode)}</span>
        ${precipHtml}
        <span class="hourly-item__temp">${fmtTemp(h.temp)}</span>
      </div>`;
      })
      .join("");
  }

  function renderDaily(fc: Forecast): void {
    const days = fc.daily.slice(0, 10);
    if (days.length === 0) {
      dailyRows.innerHTML = "";
      return;
    }

    const allTemps = days.flatMap((d) => [d.tempMin, d.tempMax]);
    const globalMin = Math.min(...allTemps);
    const globalMax = Math.max(...allTemps);
    const range = globalMax - globalMin || 1;

    dailyRows.innerHTML = days
      .map((d, i) => {
        const leftPct = ((d.tempMin - globalMin) / range) * 100;
        const widthPct = ((d.tempMax - d.tempMin) / range) * 100;
        const precipHtml =
          d.precipitationProbabilityMax > 0
            ? `<span class="daily-row__precip">${Math.round(d.precipitationProbabilityMax)}%</span>`
            : `<span class="daily-row__precip"></span>`;

        return `
      <div class="daily-row">
        <span class="daily-row__day">${esc(getDayName(d.dateISO, i))}</span>
        <span class="daily-row__icon">${weatherIcon(d.weatherCode)}</span>
        ${precipHtml}
        <span class="daily-row__lo">${fmtTemp(d.tempMin)}</span>
        <div class="daily-row__bar">
          <div class="daily-row__bar-fill"
               style="left:${leftPct.toFixed(1)}%;width:${Math.max(widthPct, 4).toFixed(1)}%"></div>
        </div>
        <span class="daily-row__hi">${fmtTemp(d.tempMax)}</span>
      </div>`;
      })
      .join("");
  }

  function renderCards(fc: Forecast): void {
    /* UV Index */
    const currentHour = getCurrentHourData(fc);
    const uv = currentHour?.uvIndex ?? fc.daily[0]?.uvIndexMax ?? 0;
    uvValueEl.textContent = String(Math.round(uv));
    uvLabelEl.textContent = uvLabel(uv);
    uvDescEl.textContent = uvDescription(uv);
    uvBarMarker.style.left = `${Math.min((uv / 11) * 100, 100)}%`;

    /* Sunrise */
    const today = fc.daily[0];
    if (today) {
      sunriseValueEl.textContent = fmtTimeShort(today.sunriseISO);
      sunriseDescEl.textContent = `Sunset: ${fmtTimeShort(today.sunsetISO)}`;
    }

    /* Wind */
    windSpeedEl.textContent = String(Math.round(fc.current.windSpeed));
    windArrow.style.transform = `rotate(${fc.current.windDirection}deg)`;
    windDescEl.textContent = `Gusts: ${Math.round(fc.current.windGusts)} km/h ${windCompass(fc.current.windDirection)}`;

    /* Humidity */
    humidityValueEl.textContent = `${Math.round(fc.current.humidity)}%`;
    humidityDescEl.textContent = humidityDesc(fc.current.humidity);

    /* Visibility */
    const visKm = (currentHour?.visibility ?? 10000) / 1000;
    visibilityValueEl.textContent = `${visKm.toFixed(1)} km`;
    visibilityDescEl.textContent = visibilityDesc(
      currentHour?.visibility ?? 10000,
    );

    /* Pressure */
    pressureValEl.textContent = String(Math.round(fc.current.pressure));
    renderPressureGauge(fc.current.pressure);

    /* Precipitation */
    precipValueEl.textContent = `${fc.current.precipitation.toFixed(1)} mm`;
    const todayPrecip = today?.precipitationSum ?? 0;
    precipDescEl.textContent =
      todayPrecip > 0
        ? `${todayPrecip.toFixed(1)} mm expected today.`
        : "No precipitation expected today.";

    /* Feels Like */
    feelsValueEl.textContent = fmtTemp(fc.current.feelsLike);
    const diff = Math.round(fc.current.feelsLike - fc.current.temp);
    if (Math.abs(diff) <= 2) {
      feelsDescEl.textContent = "Similar to the actual temperature.";
    } else if (diff < 0) {
      feelsDescEl.textContent = "Wind is making it feel cooler.";
    } else {
      feelsDescEl.textContent = "Humidity is making it feel warmer.";
    }
    // Position marker: map feelsLike relative to temp range
    const feelsRatio = Math.max(0, Math.min(1, 0.5 + diff / 20));
    feelsBarMarker.style.left = `${feelsRatio * 100}%`;
  }

  function getCurrentHourData(fc: Forecast): HourlyPoint | undefined {
    const currentTs = fc.current.timeISO.slice(0, 13);
    return fc.hourly.find((h) => h.timeISO.slice(0, 13) === currentTs);
  }

  function renderPressureGauge(pressure: number) {
    // Map pressure 980..1040 to 0..49 tick index
    const normalized = Math.max(
      0,
      Math.min(49, Math.round(((pressure - 980) / 60) * 49)),
    );
    const ticks: string[] = [];
    for (let i = 0; i < 50; i++) {
      const angle = -180 + (i * 180) / 49;
      const isValue = i === normalized;
      const isAdj = Math.abs(i - normalized) === 1;
      const rad = (angle * Math.PI) / 180;
      const r = 75;
      const cx = 100;
      const cy = 90;
      const x1 = cx + r * Math.cos(rad);
      const y1 = cy + r * Math.sin(rad);
      let len = 5;
      let w = 1.5;
      let op = 0.2;
      if (isValue) {
        len = 12;
        w = 3;
        op = 1;
      } else if (isAdj) {
        len = 8;
        w = 2;
        op = 0.5;
      }
      const x2 = cx + (r - len) * Math.cos(rad);
      const y2 = cy + (r - len) * Math.sin(rad);
      const color = isValue ? "var(--color-accent)" : "currentColor";
      ticks.push(
        `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${w}" stroke-linecap="round" opacity="${op}"/>`,
      );
    }
    pressureSvg.innerHTML = ticks.join("");
  }

  /* ── Modal content renderer ─────────────────────────── */

  function renderModalContent(type: ModalType, fc: Forecast): void {
    destroyAllCharts();

    const titles: Record<ModalType, string> = {
      hourly: "48-Hour Forecast",
      forecast: "10-Day Forecast",
      uv: "UV Index",
      sun: "Sunrise & Sunset",
      wind: "Wind",
      humidity: "Humidity",
      visibility: "Visibility",
      pressure: "Pressure",
      precipitation: "Precipitation",
      feelslike: "Feels Like",
    };

    modalTitle.textContent = titles[type] || type;

    // Get next 24 hours of data
    const currentTs = fc.current.timeISO.slice(0, 13);
    let startIdx = fc.hourly.findIndex(
      (h) => h.timeISO.slice(0, 13) === currentTs,
    );
    if (startIdx < 0) startIdx = 0;
    const next24 = fc.hourly.slice(startIdx, startIdx + 24);
    const labels24 = next24.map((h) => h.timeISO.slice(11, 16));

    switch (type) {
      case "hourly": {
        const next48 = fc.hourly.slice(startIdx, startIdx + 48);
        const labelsH = next48.map((h) => h.timeISO.slice(11, 16));
        modalBody.innerHTML = `
          <div class="modal__subtitle">Hourly temperature and precipitation for the next 2 days.</div>
          <div class="modal__section-title">Temperature Trend</div>
          <div class="modal__chart"><canvas id="modal-chart-hourly"></canvas></div>
          <div class="modal__section-title">Hourly Details</div>
          ${next48
            .map(
              (h, i) => `
            <div class="modal__row">
              <span class="modal__row-label">${i === 0 ? "Now" : h.timeISO.slice(11, 16)}</span>
              <span>${weatherIcon(h.weatherCode)}</span>
              <span class="modal__row-value">${fmtTemp(h.temp)}</span>
            </div>
          `,
            )
            .join("")}
        `;
        requestAnimationFrame(() => {
          const c = modalBody.querySelector<HTMLCanvasElement>(
            "#modal-chart-hourly",
          );
          if (c)
            createLineChart(
              c,
              "hourly",
              labelsH,
              next48.map((h) => h.temp),
              { label: "Temperature" },
            );
        });
        break;
      }

      case "forecast": {
        const days = fc.daily.slice(0, 10);
        const labelsD = days.map((d, i) => getDayName(d.dateISO, i));
        modalBody.innerHTML = `
          <div class="modal__subtitle">High and low temperatures for the next 10 days.</div>
          <div class="modal__section-title">Temperature Trend</div>
          <div class="modal__chart"><canvas id="modal-chart-forecast"></canvas></div>
          <div class="modal__legend">
            <span class="modal__legend-item"><span class="modal__legend-line" style="background:#ef4444"></span>High</span>
            <span class="modal__legend-item"><span class="modal__legend-line" style="background:#3b82f6"></span>Low</span>
          </div>
          <div class="modal__section-title">Daily Breakdown</div>
          ${days
            .map(
              (d, i) => `
            <div class="modal__row">
              <span class="modal__row-label">${esc(getDayName(d.dateISO, i))}</span>
              <span>${weatherIcon(d.weatherCode)}</span>
              <span class="modal__row-value"><span style="color:#ef4444">${fmtTemp(d.tempMax)}</span> / <span style="color:#3b82f6">${fmtTemp(d.tempMin)}</span></span>
            </div>
          `,
            )
            .join("")}
        `;
        requestAnimationFrame(() => {
          const c = modalBody.querySelector<HTMLCanvasElement>(
            "#modal-chart-forecast",
          );
          if (c)
            createDualLineChart(
              c,
              "forecast",
              labelsD,
              days.map((d) => d.tempMax),
              days.map((d) => d.tempMin),
              {
                color1: "#ef4444",
                color2: "#3b82f6",
                label1: "High",
                label2: "Low",
              },
            );
        });
        break;
      }

      case "uv": {
        modalBody.innerHTML = `
          <div class="modal__subtitle">Protection recommended during peak hours (10 AM – 4 PM).</div>
          <div class="modal__section-title">UV Index Forecast</div>
          <div class="modal__chart"><canvas id="modal-chart-uv"></canvas></div>
          <div class="modal__section-title">UV Index Scale</div>
          ${[
            {
              range: "0–2",
              level: "Low",
              color: "#22c55e",
              desc: "No protection needed",
            },
            {
              range: "3–5",
              level: "Moderate",
              color: "#eab308",
              desc: "Seek shade during midday",
            },
            {
              range: "6–7",
              level: "High",
              color: "#f97316",
              desc: "Protection essential",
            },
            {
              range: "8–10",
              level: "Very High",
              color: "#ef4444",
              desc: "Extra protection needed",
            },
            {
              range: "11+",
              level: "Extreme",
              color: "#a855f7",
              desc: "Stay indoors if possible",
            },
          ]
            .map(
              (it) => `
            <div class="modal__scale-item">
              <div class="modal__scale-color" style="background:${it.color}"></div>
              <div><div class="modal__scale-label">${it.range} – ${it.level}</div><div class="modal__scale-desc">${it.desc}</div></div>
            </div>
          `,
            )
            .join("")}
        `;
        requestAnimationFrame(() => {
          const c =
            modalBody.querySelector<HTMLCanvasElement>("#modal-chart-uv");
          if (c)
            createBarChart(
              c,
              "uv",
              labels24,
              next24.map((h) => h.uvIndex),
              { color: "#f59e0b", label: "UV Index" },
            );
        });
        break;
      }

      case "sun": {
        const today = fc.daily[0];
        if (!today) break;
        const sunrise = fmtTimeShort(today.sunriseISO);
        const sunset = fmtTimeShort(today.sunsetISO);
        // Approximate daylight
        const sRise =
          Number.parseFloat(today.sunriseISO.slice(11, 13)) +
          Number.parseFloat(today.sunriseISO.slice(14, 16)) / 60;
        const sSet =
          Number.parseFloat(today.sunsetISO.slice(11, 13)) +
          Number.parseFloat(today.sunsetISO.slice(14, 16)) / 60;
        const daylight = sSet - sRise;
        const hours = Math.floor(daylight);
        const mins = Math.round((daylight - hours) * 60);
        modalBody.innerHTML = `
          <div class="modal__subtitle">Daylight duration: ${hours}h ${mins}m</div>
          <div class="modal__stats">
            <div class="modal__stat-card">
              <div class="modal__stat-label">Sunrise</div>
              <div class="modal__stat-value">${sunrise}</div>
            </div>
            <div class="modal__stat-card">
              <div class="modal__stat-label">Sunset</div>
              <div class="modal__stat-value">${sunset}</div>
            </div>
          </div>
          <div style="margin-bottom:16px;padding:16px;border-radius:12px;background:linear-gradient(to bottom,rgba(147,197,253,0.15),rgba(147,197,253,0.05))">
            <svg viewBox="0 0 300 120" width="100%" height="100">
              <line x1="20" y1="100" x2="280" y2="100" stroke="currentColor" stroke-width="0.5" opacity="0.2"/>
              <path d="M 40 100 Q 150 20, 260 100" fill="none" stroke="currentColor" stroke-width="2.5" opacity="0.6"/>
              <circle cx="40" cy="100" r="5" fill="#fb923c"/>
              <circle cx="260" cy="100" r="5" fill="#f97316"/>
              <text x="35" y="115" font-size="10" fill="currentColor" opacity="0.6">${sunrise}</text>
              <text x="245" y="115" font-size="10" fill="currentColor" opacity="0.6">${sunset}</text>
            </svg>
          </div>
          ${fc.daily
            .slice(0, 5)
            .map(
              (d, i) => `
            <div class="modal__row">
              <span class="modal__row-label">${getDayName(d.dateISO, i)}</span>
              <span class="modal__row-value">${fmtTimeShort(d.sunriseISO)} – ${fmtTimeShort(d.sunsetISO)}</span>
            </div>
          `,
            )
            .join("")}
        `;
        break;
      }

      case "wind": {
        modalBody.innerHTML = `
          <div class="modal__subtitle">Wind speed and direction throughout the day.</div>
          <div class="modal__section-title">Wind Speed (km/h)</div>
          <div class="modal__chart"><canvas id="modal-chart-wind"></canvas></div>
          <div class="modal__section-title">Hourly Details</div>
          ${next24
            .map(
              (h, i) => `
            <div class="modal__row">
              <span class="modal__row-label">${i === 0 ? "Now" : h.timeISO.slice(11, 16)}</span>
              <span>${windCompass(h.windDirection)}</span>
              <span class="modal__row-value">${Math.round(h.windSpeed)} km/h</span>
            </div>
          `,
            )
            .join("")}
        `;
        requestAnimationFrame(() => {
          const c =
            modalBody.querySelector<HTMLCanvasElement>("#modal-chart-wind");
          if (c)
            createAreaChart(
              c,
              "wind",
              labels24,
              next24.map((h) => h.windSpeed),
              { color: "#3b82f6", label: "Wind Speed" },
            );
        });
        break;
      }

      case "humidity": {
        modalBody.innerHTML = `
          <div class="modal__subtitle">Relative humidity throughout the day.</div>
          <div class="modal__chart"><canvas id="modal-chart-humidity"></canvas></div>
          <div class="modal__section-title">Comfort Zones</div>
          ${[
            {
              color: "#22c55e",
              label: "Comfortable (30–60%)",
              desc: "Ideal indoor humidity range",
            },
            {
              color: "#eab308",
              label: "Moderate (60–80%)",
              desc: "May feel sticky or muggy",
            },
            {
              color: "#3b82f6",
              label: "High (80%+)",
              desc: "Uncomfortable, potential for mold",
            },
          ]
            .map(
              (it) => `
            <div class="modal__scale-item">
              <div class="modal__scale-color" style="background:${it.color};width:16px;height:16px;border-radius:50%"></div>
              <div><div class="modal__scale-label">${it.label}</div><div class="modal__scale-desc">${it.desc}</div></div>
            </div>
          `,
            )
            .join("")}
          <div class="modal__info-card" style="margin-top:12px">
            <div class="modal__info-card-title">About Dew Point</div>
            <div class="modal__info-card-desc">The dew point is the temperature at which air becomes saturated and dew forms. Higher dew points indicate more moisture in the air.</div>
          </div>
        `;
        requestAnimationFrame(() => {
          const c = modalBody.querySelector<HTMLCanvasElement>(
            "#modal-chart-humidity",
          );
          if (c)
            createLineChart(
              c,
              "humidity",
              labels24,
              next24.map((h) => h.humidity),
              { color: "#3b82f6", label: "Humidity %" },
            );
        });
        break;
      }

      case "visibility": {
        modalBody.innerHTML = `
          <div class="modal__subtitle">How far you can see throughout the day.</div>
          <div class="modal__chart"><canvas id="modal-chart-visibility"></canvas></div>
          <div class="modal__section-title">Visibility Categories</div>
          ${[
            {
              range: "0–1 km",
              level: "Dense Fog",
              desc: "Very hazardous driving conditions",
            },
            {
              range: "1–2 km",
              level: "Fog",
              desc: "Reduced visibility, caution advised",
            },
            {
              range: "2–5 km",
              level: "Mist/Haze",
              desc: "Slightly reduced visibility",
            },
            { range: "5–10 km", level: "Clear", desc: "Good visibility" },
            { range: "10+ km", level: "Excellent", desc: "Perfect visibility" },
          ]
            .map(
              (it) => `
            <div class="modal__info-card">
              <div class="modal__info-card-title">${it.range} – ${it.level}</div>
              <div class="modal__info-card-desc">${it.desc}</div>
            </div>
          `,
            )
            .join("")}
        `;
        requestAnimationFrame(() => {
          const c = modalBody.querySelector<HTMLCanvasElement>(
            "#modal-chart-visibility",
          );
          if (c)
            createAreaChart(
              c,
              "visibility",
              labels24,
              next24.map((h) => h.visibility / 1000),
              { color: "#60a5fa", label: "Visibility (km)" },
            );
        });
        break;
      }

      case "pressure": {
        modalBody.innerHTML = `
          <div class="modal__subtitle">Atmospheric pressure trends and weather prediction.</div>
          <div class="modal__chart"><canvas id="modal-chart-pressure"></canvas></div>
          <div class="modal__section-title">What pressure means</div>
          <div class="modal__info-card">
            <div class="modal__info-card-title">Rising Pressure</div>
            <div class="modal__info-card-desc">Usually indicates improving weather conditions.</div>
          </div>
          <div class="modal__info-card">
            <div class="modal__info-card-title">Falling Pressure</div>
            <div class="modal__info-card-desc">Often signals approaching storms or precipitation.</div>
          </div>
          <div class="modal__info-card">
            <div class="modal__info-card-title">Steady Pressure</div>
            <div class="modal__info-card-desc">Indicates stable weather conditions.</div>
          </div>
        `;
        requestAnimationFrame(() => {
          const c = modalBody.querySelector<HTMLCanvasElement>(
            "#modal-chart-pressure",
          );
          if (c)
            createAreaChart(
              c,
              "pressure",
              labels24,
              next24.map((h) => h.pressure),
              { label: "Pressure (hPa)" },
            );
        });
        break;
      }

      case "precipitation": {
        modalBody.innerHTML = `
          <div class="modal__subtitle">Expected rainfall and probability throughout the day.</div>
          <div class="modal__section-title">Precipitation Amount (mm)</div>
          <div class="modal__chart"><canvas id="modal-chart-precip-amt"></canvas></div>
          <div class="modal__section-title">Chance of Precipitation (%)</div>
          <div class="modal__chart"><canvas id="modal-chart-precip-pct"></canvas></div>
          <div class="modal__stats">
            <div class="modal__stat-card">
              <div class="modal__stat-label">Total Expected</div>
              <div class="modal__stat-value">${(fc.daily[0]?.precipitationSum ?? 0).toFixed(1)} mm</div>
            </div>
            <div class="modal__stat-card">
              <div class="modal__stat-label">Max Probability</div>
              <div class="modal__stat-value">${Math.round(fc.daily[0]?.precipitationProbabilityMax ?? 0)}%</div>
            </div>
          </div>
        `;
        requestAnimationFrame(() => {
          const c1 = modalBody.querySelector<HTMLCanvasElement>(
            "#modal-chart-precip-amt",
          );
          const c2 = modalBody.querySelector<HTMLCanvasElement>(
            "#modal-chart-precip-pct",
          );
          if (c1)
            createBarChart(
              c1,
              "precip-amt",
              labels24,
              next24.map((h) => h.precipitation),
              { color: "#60a5fa", label: "Precipitation (mm)" },
            );
          if (c2)
            createAreaChart(
              c2,
              "precip-pct",
              labels24,
              next24.map((h) => h.precipitationProbability),
              { color: "#3b82f6", label: "Chance (%)" },
            );
        });
        break;
      }

      case "feelslike": {
        const actual = Math.round(fc.current.temp);
        const feels = Math.round(fc.current.feelsLike);
        const diff2 = feels - actual;
        modalBody.innerHTML = `
          <div class="modal__subtitle">How the temperature actually feels, accounting for wind chill and humidity.</div>
          <div class="modal__stats">
            <div class="modal__stat-card">
              <div class="modal__stat-label">Actual</div>
              <div class="modal__stat-value">${actual}°</div>
            </div>
            <div class="modal__stat-card" style="background:rgba(59,130,246,0.15)">
              <div class="modal__stat-label">Feels Like</div>
              <div class="modal__stat-value">${feels}°</div>
            </div>
          </div>
          <div class="modal__info-card">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px">
              <span>Difference</span>
              <span style="font-weight:500;font-size:18px">${diff2 > 0 ? "+" : ""}${diff2}°</span>
            </div>
            <div class="feels-bar"><div class="feels-bar__marker" style="left:${Math.max(0, Math.min(100, 50 + diff2 * 5))}%"></div></div>
            <div style="display:flex;justify-content:space-between;font-size:11px;opacity:.6;margin-top:4px">
              <span>Colder</span><span>Same</span><span>Warmer</span>
            </div>
          </div>
          <div class="modal__section-title" style="margin-top:16px">Temperature Throughout Day</div>
          <div class="modal__chart"><canvas id="modal-chart-feels"></canvas></div>
          <div class="modal__info-card">
            <div class="modal__info-card-title">Wind Chill</div>
            <div class="modal__info-card-desc">Wind makes it feel colder than the actual temperature.</div>
          </div>
          <div class="modal__info-card">
            <div class="modal__info-card-title">Humidity Impact</div>
            <div class="modal__info-card-desc">High humidity increases thermal discomfort in warm conditions.</div>
          </div>
        `;
        requestAnimationFrame(() => {
          const c =
            modalBody.querySelector<HTMLCanvasElement>("#modal-chart-feels");
          if (c)
            createDualLineChart(
              c,
              "feels",
              labels24,
              next24.map((h) => h.temp),
              next24.map((h) => h.feelsLike),
              {
                color1: "#ef4444",
                color2: "#3b82f6",
                label1: "Actual",
                label2: "Feels Like",
              },
            );
        });
        break;
      }
    }
  }

  /* ── Main update ────────────────────────────────────── */

  function update(state: AppState) {
    lastState = state;
    const units = selectUnits(state);
    const savedLocs = selectSavedLocations(state);
    const selectedLoc = selectSelectedLocation(state);
    const forecast = selectForecastForSelectedLocation(state);
    const searchResults = selectSearchResults(state);
    const isSearchMode =
      state.search.query.trim().length >= 2 || state.search.loading;

    /* Theme */
    document.documentElement.setAttribute("data-theme", state.prefs.theme);
    themeToggle.innerHTML =
      state.prefs.theme === "dark" ? icons.sun : icons.moon;

    /* Sidebar collapse */
    appLayout.classList.toggle("sidebar-collapsed", state.ui.sidebarCollapsed);
    sidebarToggle.innerHTML = state.ui.sidebarCollapsed
      ? icons.menu
      : icons.chevronLeft;

    /* Add location button: show if a location is selected but NOT saved */
    const showAdd =
      selectedLoc != null &&
      !state.prefs.savedLocationIds.includes(selectedLoc.id);
    addLocationBtn.classList.toggle("visible", showAdd);

    /* Input focus preservation */
    if (
      document.activeElement !== input &&
      input.value !== state.search.query
    ) {
      input.value = state.search.query;
    }

    /* ── Sidebar ────────────────────────────────────── */
    let nextSidebarHtml: string;
    if (isSearchMode) {
      if (state.search.loading) {
        nextSidebarHtml = `<div class="sidebar__hint">Searching…</div>`;
      } else if (searchResults.length === 0) {
        nextSidebarHtml = `<div class="sidebar__hint">No results found</div>`;
      } else {
        nextSidebarHtml = renderSidebarItems(
          searchResults,
          state,
          selectedLoc,
          units,
        );
      }
    } else if (savedLocs.length === 0) {
      nextSidebarHtml = `<div class="sidebar__hint">Search for a city to add it</div>`;
    } else {
      nextSidebarHtml = renderSidebarItems(
        savedLocs,
        state,
        selectedLoc,
        units,
        true,
      );
    }

    if (nextSidebarHtml !== lastSidebarHtml) {
      sidebarList.innerHTML = nextSidebarHtml;
      lastSidebarHtml = nextSidebarHtml;

      // (Re)initialize Sortable for saved-locations mode
      if (sortableInstance) {
        sortableInstance.destroy();
        sortableInstance = null;
      }
      if (!isSearchMode && savedLocs.length > 1) {
        sortableInstance = Sortable.create(sidebarList, {
          animation: 150,
          delay: 150,
          delayOnTouchOnly: true,
          draggable: ".sidebar-item",
          ghostClass: "sidebar-item--ghost",
          chosenClass: "sidebar-item--chosen",
          dragClass: "sidebar-item--drag",
          filter: ".sidebar-item__delete",
          preventOnFilter: false,
          onEnd(evt) {
            if (
              evt.oldIndex == null ||
              evt.newIndex == null ||
              evt.oldIndex === evt.newIndex
            )
              return;
            const items =
              sidebarList.querySelectorAll<HTMLElement>("[data-loc-id]");
            const orderedIds = Array.from(items).map((el) =>
              Number(el.dataset.locId),
            );
            actions.onReorderLocations(orderedIds);
          },
        });
      }
    }

    /* ── Main content ───────────────────────────────── */
    if (!selectedLoc) {
      mainEmpty.style.display = "flex";
      mainContent.style.display = "none";
    } else {
      mainEmpty.style.display = "none";
      mainContent.style.display = "flex";

      headerLabel.textContent = locationSubtitle(selectedLoc);
      headerCity.textContent = selectedLoc.name;

      if (forecast) {
        headerTemp.textContent = fmtTemp(forecast.current.temp);
        headerCondition.textContent = weatherDescription(
          forecast.current.weatherCode,
        );
        headerFeelsLike.textContent = `Feels Like: ${fmtTemp(forecast.current.feelsLike)}`;
        const today = forecast.daily[0];
        if (today) {
          headerHiLo.textContent = `H:${fmtTemp(today.tempMax)}  L:${fmtTemp(today.tempMin)}`;
        }

        renderHourly(forecast);
        renderDaily(forecast);
        renderCards(forecast);
      } else if (state.ui.loadingForecast) {
        headerTemp.textContent = "—";
        headerCondition.textContent = "Loading…";
        headerFeelsLike.textContent = "";
        headerHiLo.textContent = "";
        hourlySummary.textContent = "";
        hourlyScroll.innerHTML = "";
        dailyRows.innerHTML = `<div class="loading-placeholder">Loading forecast…</div>`;
      } else {
        headerTemp.textContent = "—";
        headerCondition.textContent = "";
        headerFeelsLike.textContent = "";
        headerHiLo.textContent = "";
      }
    }

    /* ── Modal ────────────────────────────────────────── */
    const modalOpen = state.ui.activeModal != null;
    modalBackdrop.classList.toggle("open", modalOpen);
    modalPanel.classList.toggle("open", modalOpen);

    if (modalOpen && forecast && state.ui.activeModal) {
      renderModalContent(state.ui.activeModal, forecast);
    } else if (!modalOpen) {
      destroyAllCharts();
    }
  }

  return { update };
}
