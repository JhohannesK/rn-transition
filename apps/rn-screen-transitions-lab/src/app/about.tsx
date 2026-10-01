import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActionButton } from "@/components/action-button";

const CREDITS = [
	"react-native-screen-transitions v4 by eds2002 (@trpfsu) · MIT",
	"BlankStack adapter for Expo Router",
	"Reanimated 4 · Gesture Handler 2 · Worklets",
];

export default function AboutScreen() {
	const router = useRouter();

	return (
		<SafeAreaView style={styles.screen}>
			<View style={styles.content}>
				<Text style={styles.eyebrow}>ZOOMIN PRESET</Text>
				<Text style={styles.title}>A tiny transitions lab.</Text>
				<Text style={styles.description}>
					This demo exercises three motion patterns: a bounds-driven
					shared-element zoom (gallery → detail), a snap-point sheet
					(SlideFromBottom), and this screen's ZoomIn preset.
				</Text>

				<View style={styles.card}>
					<Text style={styles.cardTitle}>Built with</Text>
					{CREDITS.map((line) => (
						<Text key={line} style={styles.cardCopy}>
							{line}
						</Text>
					))}
				</View>
			</View>

			<View style={styles.actions}>
				<ActionButton label="Back to gallery" onPress={router.back} secondary />
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	actions: {
		alignSelf: "center",
		maxWidth: 520,
		width: "100%",
	},
	card: {
		backgroundColor: "#211C2A",
		borderColor: "#342D40",
		borderRadius: 24,
		borderWidth: 1,
		gap: 9,
		marginTop: 28,
		padding: 22,
	},
	cardCopy: {
		color: "#BDB3CB",
		fontSize: 14,
		lineHeight: 20,
	},
	cardTitle: {
		color: "#F4F1FF",
		fontSize: 17,
		fontWeight: "700",
		marginBottom: 4,
	},
	content: {
		alignSelf: "center",
		maxWidth: 520,
		width: "100%",
	},
	description: {
		color: "#BDB3CB",
		fontSize: 16,
		lineHeight: 24,
		marginTop: 14,
	},
	eyebrow: {
		color: "#A78BFA",
		fontSize: 12,
		fontWeight: "800",
		letterSpacing: 1.1,
	},
	screen: {
		backgroundColor: "#0D0B12",
		flex: 1,
		justifyContent: "space-between",
		padding: 24,
	},
	title: {
		color: "#F4F1FF",
		fontSize: 38,
		fontWeight: "800",
		letterSpacing: -1.2,
		lineHeight: 42,
		marginTop: 12,
	},
});
