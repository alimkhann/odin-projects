import {
  selectForecastForSelectedLocation,
  selectSearchResults,
  selectSelectedLocation,
} from "../store/selectors.ts";
import type { AppState } from "../store/state.ts";

export type AppActions = {
  onQuery: (q: string) => void;
  onPickLocation: (id: number) => void;
};

export type AppView = {
  update: (state: AppState) => void;
};

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function mountApp(root: HTMLElement, actions: AppActions): AppView {
  // Build DOM ONCE
  root.innerHTML = `
    <div style="display:grid; gap:12px; max-width:720px; margin:24px auto; font-family: system-ui;">
      <div>
        <input id="q" placeholder="Search city…"
          style="width:100%; padding:10px 12px; border-radius:10px; border:1px solid #333; background:#111; color:#eee;" />
        <div id="status" style="margin-top:8px; color:#aaa; font-size:12px;"></div>
      </div>

      <div>
        <div style="font-weight:600; margin-bottom:8px;">Results</div>
        <ul id="results" style="list-style:none; padding:0; margin:0; display:grid; gap:6px;"></ul>
      </div>

      <div>
        <div style="font-weight:600; margin-bottom:8px;">Selected</div>
        <div id="selectedCard" style="padding:12px; border-radius:12px; border:1px solid #333; background:#161616; color:#eee;"></div>
      </div>
    </div>
  `;

  const input = root.querySelector<HTMLInputElement>("#q");
  const status = root.querySelector<HTMLDivElement>("#status");
  const resultsUl = root.querySelector<HTMLUListElement>("#results");
  const selectedCard = root.querySelector<HTMLDivElement>("#selectedCard");

  if (!input || !status || !resultsUl || !selectedCard) {
    throw new Error("Missing expected DOM elements");
  }

  input.addEventListener("input", (e) =>
    actions.onQuery((e.target as HTMLInputElement).value),
  );

  function update(state: AppState) {
    // 1) Keep input stable — don't clobber while user types
    if (
      document.activeElement !== input &&
      input.value !== state.search.query
    ) {
      input.value = state.search.query;
    }

    // 2) Status line
    status.textContent = state.search.loading
      ? "Searching…"
      : state.search.error
        ? state.search.error
        : "";

    // 3) Results list (only the list gets innerHTML)
    const results = selectSearchResults(state);
    resultsUl.innerHTML = results
      .map(
        (l) => `
        <li>
          <button data-id="${l.id}"
            style="width:100%; text-align:left; padding:10px 12px; border-radius:10px; border:1px solid #333; background:#161616; color:#eee;">
            ${escapeHtml(l.name)}${l.country ? `, ${escapeHtml(l.country)}` : ""}${l.admin1 ? ` (${escapeHtml(l.admin1)})` : ""}
          </button>
        </li>`,
      )
      .join("");

    resultsUl.addEventListener("click", (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(
        "button[data-id]",
      );
      if (!btn) return;
      actions.onPickLocation(Number(btn.dataset.id));
    });

    // 4) Selected card
    const selectedLoc = selectSelectedLocation(state);
    const selectedFc = selectForecastForSelectedLocation(state);

    if (!selectedLoc) {
      selectedCard.innerHTML = `<div style="color:#aaa;">No location selected</div>`;
      return;
    }

    const title = `${escapeHtml(selectedLoc.name)}${selectedLoc.country ? `, ${escapeHtml(selectedLoc.country)}` : ""}`;

    if (!selectedFc) {
      selectedCard.innerHTML = `
        <div>${title}</div>
        <div style="color:#aaa; margin-top:6px;">Loading forecast…</div>
      `;
      return;
    }

    selectedCard.innerHTML = `
      <div>${title}</div>
      <div style="font-size:28px; font-weight:700; margin-top:6px;">${selectedFc.current.temp}°</div>
    `;
  }

  return { update };
}
