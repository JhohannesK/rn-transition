import { StatusBar } from "expo-status-bar";
import { interpolate } from "react-native-reanimated";
import Transition, {
	type ScreenTransitionConfig,
} from "react-native-screen-transitions";
import { BlankStack } from "react-native-screen-transitions/expo-router";
import { ZOOM_GROUP } from "@/data/colors";

const getRouteParam = (route: { params?: object } | undefined, key: string) => {
	"worklet";
	const params = route?.params as Record<string, unknown> | undefined;
	const value = params?.[key];
	return typeof value === "string" ? value : "";
};

/**
 * Bounds shared-element zoom: the gallery card and the detail hero swatch
 * share a boundary id, and this interpolator connects their measured bounds.
 */
const detailZoomOptions: ScreenTransitionConfig = {
	gestureEnabled: true,
	gestureDirection: ["bidirectional", "pinch-in"],
	navigationMaskEnabled: true,
	backdropBehavior: "dismiss",
	transitionSpec: Transition.Specs.Zoom,
	screenStyleInterpolator: ({ active, bounds, current, next }) => {
		"worklet";
		const id =
			getRouteParam(active.route, "id") ||
			getRouteParam(next?.route, "id") ||
			getRouteParam(current.route, "id");

		if (!id) return {};

		return {
			...bounds({ id, group: ZOOM_GROUP }).navigation.zoom({
				target: "bound",
			}),
			backdrop: {
				backgroundColor: "black",
				opacity: interpolate(active.transitionProgress, [0, 1, 2], [0, 0.5, 0]),
			},
		};
	},
};

const sheetOptions = Transition.Presets.SlideFromBottom({
	initialSnapIndex: 0,
	snapPoints: [0.6, 1],
});

const aboutOptions = Transition.Presets.ZoomIn();

export default function RootLayout() {
	return (
		<>
			<StatusBar style="light" />
			<BlankStack>
				<BlankStack.Screen name="index" />
				<BlankStack.Screen name="detail/[id]" options={detailZoomOptions} />
				<BlankStack.Screen name="sheet" options={sheetOptions} />
				<BlankStack.Screen name="about" options={aboutOptions} />
			</BlankStack>
		</>
	);
}
