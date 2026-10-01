export const ZOOM_GROUP = "lab-zoom";

export type ColorSpecimen = {
	id: string;
	title: string;
	subtitle: string;
	color: string;
	bgColor: string;
	description: string;
	height: number;
};

export const COLOR_SPECIMENS: ColorSpecimen[] = [
	{
		id: "violet",
		title: "Electric Violet",
		subtitle: "Bold purple energy",
		color: "#7C3AED",
		bgColor: "#160B2E",
		description:
			"A punchy, saturated violet that demands attention. Use it for primary actions and hero moments that need to pop with confidence.",
		height: 190,
	},
	{
		id: "coral",
		title: "Hot Coral",
		subtitle: "Fiery pink-red",
		color: "#FF5757",
		bgColor: "#2E0E0E",
		description:
			"An unapologetically bold coral-red that radiates warmth and urgency. Perfect for badges and notifications that can't be ignored.",
		height: 150,
	},
	{
		id: "cyan",
		title: "Cyber Cyan",
		subtitle: "Neon-tinted blue",
		color: "#22D3EE",
		bgColor: "#082A30",
		description:
			"A vivid cyan pulled straight from a neon sign. It electrifies dark UIs and pairs beautifully with deep navy or charcoal.",
		height: 150,
	},
	{
		id: "emerald",
		title: "Emerald Rush",
		subtitle: "Rich saturated green",
		color: "#10B981",
		bgColor: "#052E20",
		description:
			"A lush, jewel-toned green that feels alive. Ideal for success states, progress bars, and anything that should feel like growth.",
		height: 210,
	},
	{
		id: "tangerine",
		title: "Tangerine Pop",
		subtitle: "Juicy warm orange",
		color: "#FF8C00",
		bgColor: "#2E1A00",
		description:
			"Bright, juicy, and impossible to miss. Tangerine brings instant energy to warnings, onboarding highlights, and playful UI moments.",
		height: 170,
	},
	{
		id: "fuchsia",
		title: "Fuchsia Burst",
		subtitle: "Vivid magenta pink",
		color: "#E534AB",
		bgColor: "#2E0A22",
		description:
			"An electrifying magenta-pink that refuses to blend in. Maximum visual impact with a playful edge.",
		height: 150,
	},
];

export const getSpecimenById = (id: string | undefined): ColorSpecimen =>
	COLOR_SPECIMENS.find((item) => item.id === id) ?? COLOR_SPECIMENS[0];
