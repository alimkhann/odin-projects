import type { Forecast, Location, Units } from "../domain/weather.ts";
import {
  selectForecastForSelectedLocation,
  selectSavedLocations,
  selectSearchResults,
  selectSelectedLocation,
  selectUnits,
} from "../store/selectors.ts";
import type { AppState } from "../store/state.ts";
import { forecastKey } from "../store/state.ts";
import { weatherDescription, weatherIcon } from "./weatherIcons.ts";

/* ── Public types ─────────────────────────────────────── */

export type AppActions = {
  onQuery: (q: string) => void;
  onPickLocation: (id: number) => void;
  onToggleSaved: (id: number) => void;
  onSetUnits: (units: Units) => void;
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

/* ── Search icon SVG ──────────────────────────────────── */

const SEARCH_SVG = `<svg class="sidebar__search-icon" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
  <circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/>
</svg>`;

/* ── Mount ────────────────────────────────────────────── */

export function mountApp(root: HTMLElement, actions: AppActions): AppView {
  /* Build DOM once */
  root.innerHTML = `
<div class="app-layout">
  <!-- Sidebar -->
  <aside class="sidebar">
    <div class="sidebar__search">
      ${SEARCH_SVG}
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

      <section class="hourly-card">
        <div class="hourly-card__summary"></div>
        <div class="hourly-card__scroll"></div>
      </section>

      <div class="cards-grid">
        <!-- 10-Day Forecast (large) -->
        <section class="weather-card weather-card--large">
          <div class="weather-card__header">
            <span class="weather-card__header-icon">📅</span>
            <span class="weather-card__header-label">10-Day Forecast</span>
          </div>
          <div class="daily-card__rows"></div>
        </section>

        <!-- UV Index -->
        <section class="weather-card" data-card="uv">
          <div class="weather-card__header">
            <span class="weather-card__header-icon">☀️</span>
            <span class="weather-card__header-label">UV Index</span>
          </div>
          <div class="card-body">
            <div class="card-value">—</div>
            <div class="card-description">Data not available yet.</div>
          </div>
        </section>

        <!-- Feels Like -->
        <section class="weather-card" data-card="feels">
          <div class="weather-card__header">
            <span class="weather-card__header-icon">🌡️</span>
            <span class="weather-card__header-label">Feels Like</span>
          </div>
          <div class="card-body">
            <div class="card-value feels-value">—</div>
            <div class="card-description feels-desc"></div>
          </div>
        </section>

        <!-- Humidity -->
        <section class="weather-card" data-card="humidity">
          <div class="weather-card__header">
            <span class="weather-card__header-icon">💧</span>
            <span class="weather-card__header-label">Humidity</span>
          </div>
          <div class="card-body">
            <div class="card-value">—</div>
            <div class="card-description">Data not available yet.</div>
          </div>
        </section>

        <!-- Visibility -->
        <section class="weather-card" data-card="visibility">
          <div class="weather-card__header">
            <span class="weather-card__header-icon">👁️</span>
            <span class="weather-card__header-label">Visibility</span>
          </div>
          <div class="card-body">
            <div class="card-value">—</div>
            <div class="card-description">Data not available yet.</div>
          </div>
        </section>

        <!-- Sunrise -->
        <section class="weather-card" data-card="sunrise">
          <div class="weather-card__header">
            <span class="weather-card__header-icon">🌅</span>
            <span class="weather-card__header-label">Sunrise</span>
          </div>
          <div class="card-body">
            <div class="card-value sunrise-value">—</div>
            <div class="card-description sunrise-desc"></div>
          </div>
        </section>
      </div>
    </div>
  </main>
</div>`;

  /* ── Element references ─────────────────────────────── */
  const $ = <T extends HTMLElement>(sel: string) => {
    const el = root.querySelector<T>(sel);
    if (!el) throw new Error(`Missing element: ${sel}`);
    return el;
  };

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

  const feelsValue = $(".feels-value");
  const feelsDesc = $(".feels-desc");
  const sunriseValue = $(".sunrise-value");
  const sunriseDesc = $(".sunrise-desc");

  /* ── Wire events ────────────────────────────────────── */

  input.addEventListener("input", () => actions.onQuery(input.value));

  sidebarList.addEventListener("click", (e) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-loc-id]");
    if (el) actions.onPickLocation(Number(el.dataset.locId));
  });

  /* ── Render helpers ─────────────────────────────────── */

  function renderSidebarItems(
    locations: (Location | undefined)[],
    state: AppState,
    selectedLoc: Location | undefined,
    units: Units,
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

        return `
      <div class="${cls}" data-loc-id="${loc.id}">
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
        return `
      <div class="hourly-item">
        <span class="hourly-item__time">${label}</span>
        <span class="hourly-item__icon">${weatherIcon(h.weatherCode)}</span>
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

        return `
      <div class="daily-row">
        <span class="daily-row__day">${esc(getDayName(d.dateISO, i))}</span>
        <span class="daily-row__icon">${weatherIcon(d.weatherCode)}</span>
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
    /* Feels Like */
    feelsValue.textContent = fmtTemp(fc.current.feelsLike);
    const diff = Math.round(fc.current.feelsLike - fc.current.temp);
    if (Math.abs(diff) <= 2) {
      feelsDesc.textContent = "Similar to the actual temperature.";
    } else if (diff < 0) {
      feelsDesc.textContent = "Wind is making it feel cooler.";
    } else {
      feelsDesc.textContent = "Humidity is making it feel warmer.";
    }

    /* Sunrise */
    const today = fc.daily[0];
    if (today) {
      sunriseValue.textContent = fmtTimeShort(today.sunriseISO);
      sunriseDesc.textContent = `Sunset: ${fmtTimeShort(today.sunsetISO)}`;
    }
  }

  /* ── Main update ────────────────────────────────────── */

  function update(state: AppState) {
    const units = selectUnits(state);
    const savedLocs = selectSavedLocations(state);
    const selectedLoc = selectSelectedLocation(state);
    const forecast = selectForecastForSelectedLocation(state);
    const searchResults = selectSearchResults(state);
    const isSearchMode =
      state.search.query.trim().length >= 2 || state.search.loading;

    /* Input focus preservation */
    if (
      document.activeElement !== input &&
      input.value !== state.search.query
    ) {
      input.value = state.search.query;
    }

    /* ── Sidebar ────────────────────────────────────── */
    if (isSearchMode) {
      if (state.search.loading) {
        sidebarList.innerHTML = `<div class="sidebar__hint">Searching…</div>`;
      } else if (searchResults.length === 0) {
        sidebarList.innerHTML = `<div class="sidebar__hint">No results found</div>`;
      } else {
        sidebarList.innerHTML = renderSidebarItems(
          searchResults,
          state,
          selectedLoc,
          units,
        );
      }
    } else if (savedLocs.length === 0) {
      sidebarList.innerHTML = `<div class="sidebar__hint">Search for a city to add it</div>`;
    } else {
      sidebarList.innerHTML = renderSidebarItems(
        savedLocs,
        state,
        selectedLoc,
        units,
      );
    }

    /* ── Main content ───────────────────────────────── */
    if (!selectedLoc) {
      mainEmpty.style.display = "flex";
      mainContent.style.display = "none";
      return;
    }

    mainEmpty.style.display = "none";
    mainContent.style.display = "flex";

    /* Header */
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

  return { update };
}
