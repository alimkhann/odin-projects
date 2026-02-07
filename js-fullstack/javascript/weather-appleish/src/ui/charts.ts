/**
 * Modal chart rendering using Chart.js.
 * Creates and manages chart instances for weather detail modals.
 */
import {
  Chart,
  LineController,
  BarController,
  LineElement,
  BarElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
} from "chart.js";

Chart.register(
  LineController,
  BarController,
  LineElement,
  BarElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
);

/** Track chart instances so we can destroy them before re-creating */
const charts = new Map<string, Chart>();

function destroyChart(id: string) {
  charts.get(id)?.destroy();
  charts.delete(id);
}

export function destroyAllCharts() {
  for (const [id] of charts) destroyChart(id);
}

const tooltipStyle = {
  backgroundColor: "rgba(255,255,255,0.15)",
  titleColor: "#fff",
  bodyColor: "#fff",
  borderColor: "rgba(255,255,255,0.2)",
  borderWidth: 1,
  cornerRadius: 8,
  padding: 8,
  displayColors: false,
};

function getTextColor(): string {
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue("--color-text")
      .trim() || "#1d1d1f"
  );
}

function getAccent(): string {
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue("--color-accent")
      .trim() || "#007aff"
  );
}

export function createLineChart(
  canvas: HTMLCanvasElement,
  id: string,
  labels: string[],
  data: number[],
  opts?: { color?: string; fill?: boolean; label?: string },
) {
  destroyChart(id);
  const color = opts?.color ?? getAccent();
  const textColor = getTextColor();

  const chart = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: opts?.label ?? "",
          data,
          borderColor: color,
          backgroundColor: opts?.fill ? `${color}22` : "transparent",
          borderWidth: 2.5,
          pointRadius: 0,
          pointHitRadius: 8,
          fill: opts?.fill ?? false,
          tension: 0.35,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { tooltip: tooltipStyle },
      scales: {
        x: {
          ticks: {
            color: `${textColor}66`,
            font: { size: 10 },
            maxRotation: 0,
            maxTicksLimit: 8,
          },
          grid: { display: false },
          border: { display: false },
        },
        y: {
          ticks: {
            color: `${textColor}66`,
            font: { size: 10 },
            maxTicksLimit: 5,
          },
          grid: { color: `${textColor}0d` },
          border: { display: false },
        },
      },
    },
  });
  charts.set(id, chart);
  return chart;
}

export function createDualLineChart(
  canvas: HTMLCanvasElement,
  id: string,
  labels: string[],
  data1: number[],
  data2: number[],
  opts: { color1: string; color2: string; label1: string; label2: string },
) {
  destroyChart(id);
  const textColor = getTextColor();

  const chart = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: opts.label1,
          data: data1,
          borderColor: opts.color1,
          borderWidth: 2.5,
          pointRadius: 3,
          pointBackgroundColor: opts.color1,
          tension: 0.35,
        },
        {
          label: opts.label2,
          data: data2,
          borderColor: opts.color2,
          borderWidth: 2.5,
          pointRadius: 3,
          pointBackgroundColor: opts.color2,
          tension: 0.35,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { tooltip: tooltipStyle },
      scales: {
        x: {
          ticks: {
            color: `${textColor}66`,
            font: { size: 10 },
            maxRotation: 0,
            maxTicksLimit: 8,
          },
          grid: { display: false },
          border: { display: false },
        },
        y: {
          ticks: {
            color: `${textColor}66`,
            font: { size: 10 },
            maxTicksLimit: 5,
          },
          grid: { color: `${textColor}0d` },
          border: { display: false },
        },
      },
    },
  });
  charts.set(id, chart);
  return chart;
}

export function createBarChart(
  canvas: HTMLCanvasElement,
  id: string,
  labels: string[],
  data: number[],
  opts?: { color?: string; label?: string },
) {
  destroyChart(id);
  const color = opts?.color ?? getAccent();
  const textColor = getTextColor();

  const chart = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: opts?.label ?? "",
          data,
          backgroundColor: `${color}99`,
          borderColor: color,
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { tooltip: tooltipStyle },
      scales: {
        x: {
          ticks: {
            color: `${textColor}66`,
            font: { size: 10 },
            maxRotation: 0,
            maxTicksLimit: 8,
          },
          grid: { display: false },
          border: { display: false },
        },
        y: {
          ticks: {
            color: `${textColor}66`,
            font: { size: 10 },
            maxTicksLimit: 5,
          },
          grid: { color: `${textColor}0d` },
          border: { display: false },
          beginAtZero: true,
        },
      },
    },
  });
  charts.set(id, chart);
  return chart;
}

export function createAreaChart(
  canvas: HTMLCanvasElement,
  id: string,
  labels: string[],
  data: number[],
  opts?: { color?: string; label?: string },
) {
  return createLineChart(canvas, id, labels, data, {
    color: opts?.color,
    fill: true,
    label: opts?.label,
  });
}
