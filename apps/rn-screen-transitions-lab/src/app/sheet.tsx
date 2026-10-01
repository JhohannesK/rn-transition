import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActionButton } from "@/components/action-button";

const STEPS = [
	{
		title: "Shared boundary id",
		copy: "The gallery card and the detail hero wrap their content in Transition.Boundary with the same id and group.",
	},
	{
		title: "Measured bounds",
		copy: "The library measures both boundaries, then bounds(id).navigation.zoom() interpolates between the two rects during navigation.",
	},
	{
		title: "Gesture-driven dismissal",
		copy: "The detail screen enables bidirectional drag and pinch-in gestures, so the zoom scrubs with your finger.",
	},
	{
		title: "This sheet",
		copy: "You are inside Presets.SlideFromBottom with snap points at 0.6 and 1.0. Drag up for full height, drag down to dismiss.",
	},
];

export default function SheetScreen() {
	const router = useRouter();

	return (
		<SafeAreaView style={styles.sheet} edges={["bottom"]}>
			<View style={styles.inner}>
				<View style={styles.grabber} />
				<Text style={styles.eyebrow}>SNAP SHEET · SLIDEFROMBOTTOM PRESET</Text>
				<Text style={styles.title}>How the zoom works</Text>

				<View style={styles.steps}>
					{STEPS.map((step, index) => (
						<View key={step.title} style={styles.step}>
							<View style={styles.stepBadge}>
								<Text style={styles.stepBadgeText}>{index + 1}</Text>
							</View>
							<View style={styles.stepCopyWrap}>
								<Text style={styles.stepTitle}>{step.title}</Text>
								<Text style={styles.stepCopy}>{step.copy}</Text>
							</View>
						</View>
					))}
				</View>

				<View style={styles.spacer} />
				<ActionButton label="Close sheet" onPress={router.back} secondary />
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	eyebrow: {
		color: "#7958B5",
		fontSize: 11,
		fontWeight: "800",
		letterSpacing: 1.1,
		marginTop: 24,
	},
	grabber: {
		alignSelf: "center",
		backgroundColor: "#C8BFCE",
		borderRadius: 3,
		height: 5,
		marginTop: 10,
		width: 48,
	},
	inner: {
		alignSelf: "center",
		flex: 1,
		maxWidth: 520,
		width: "100%",
	},
	sheet: {
		backgroundColor: "#F4F1FF",
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		flex: 1,
		padding: 24,
		paddingTop: 0,
	},
	spacer: {
		flex: 1,
	},
	step: {
		flexDirection: "row",
		gap: 14,
	},
	stepBadge: {
		alignItems: "center",
		backgroundColor: "#E6DFF6",
		borderRadius: 14,
		height: 28,
		justifyContent: "center",
		width: 28,
	},
	stepBadgeText: {
		color: "#5B3FA8",
		fontSize: 13,
		fontWeight: "800",
	},
	stepCopy: {
		color: "#5F566B",
		fontSize: 14,
		lineHeight: 21,
		marginTop: 3,
	},
	stepCopyWrap: {
		flex: 1,
	},
	stepTitle: {
		color: "#21182B",
		fontSize: 16,
		fontWeight: "700",
	},
	steps: {
		gap: 18,
		marginTop: 20,
	},
	title: {
		color: "#21182B",
		fontSize: 30,
		fontWeight: "800",
		letterSpacing: -0.8,
		marginTop: 8,
	},
});
