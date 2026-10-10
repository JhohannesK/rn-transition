import { weatherLabel, type Weather } from "../scene/uniforms";

export type HudHandlers = {
	onTime: (value: number) => void;
	onWeather: (weather: Weather) => void;
	onReplay: () => void;
};

export type Hud = {
	root: HTMLElement;
	setStatus: (text: string) => void;
	setBladeCount: (count: number, context: string) => void;
	setWeather: (weather: Weather) => void;
	setTime: (value: number) => void;
};

const WEATHERS: Weather[] = ["clear", "rain", "fog"];

export function mountHud(host: HTMLElement, initial: { time: number; weather: Weather }, handlers: HudHandlers): Hud {
	const root = document.createElement("div");
	root.className = "hud";
	root.innerHTML = `
		<header class="mark">
			<p class="kicker">Station 07 · survey pulse</p>
			<h1>Holm</h1>
			<p class="latin">Bryophyta · floating specimen</p>
		</header>
		<div class="rack">
			<label class="slider">
				<span class="meta">Photoperiod</span>
				<input id="tod" type="range" min="0" max="1" step="0.001" value="${initial.time}" aria-label="Time of day" />
				<span class="ticks"><i>Night</i><i>Dawn</i><i>Noon</i><i>Dusk</i></span>
			</label>
			<fieldset class="wx">
				<legend class="meta">Atmosphere</legend>
				<div class="wx-row" role="radiogroup" aria-label="Atmosphere">
					${WEATHERS.map(
						(w) =>
							`<button type="button" role="radio" data-wx="${w}" aria-checked="${
								w === initial.weather ? "true" : "false"
							}">${weatherLabel(w)}</button>`,
					).join("")}
				</div>
			</fieldset>
			<button type="button" class="replay" id="replay">Replay survey</button>
			<p class="stat" id="stat" aria-live="polite">Booting WebGL…</p>
			<p class="hint">Drag to orbit · scroll to dolly</p>
		</div>
	`;
	host.appendChild(root);

	const slider = root.querySelector<HTMLInputElement>("#tod")!;
	const stat = root.querySelector<HTMLParagraphElement>("#stat")!;
	const replay = root.querySelector<HTMLButtonElement>("#replay")!;

	slider.addEventListener("input", () => {
		handlers.onTime(Number(slider.value));
	});
	replay.addEventListener("click", () => handlers.onReplay());

	root.querySelectorAll<HTMLButtonElement>("[data-wx]").forEach((btn) => {
		btn.addEventListener("click", () => {
			const weather = btn.dataset.wx as Weather;
			handlers.onWeather(weather);
		});
	});

	return {
		root,
		setStatus(text) {
			stat.dataset.phase = text;
			stat.textContent = text;
		},
		setBladeCount(count, context) {
			stat.textContent = `${count.toLocaleString("en-GB")} blades · ${context}`;
		},
		setWeather(weather) {
			root.querySelectorAll<HTMLButtonElement>("[data-wx]").forEach((btn) => {
				btn.setAttribute("aria-checked", btn.dataset.wx === weather ? "true" : "false");
			});
		},
		setTime(value) {
			slider.value = String(value);
		},
	};
}
