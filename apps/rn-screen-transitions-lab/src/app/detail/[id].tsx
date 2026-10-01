import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Transition from "react-native-screen-transitions";
import { ActionButton } from "@/components/action-button";
import { getSpecimenById, ZOOM_GROUP } from "@/data/colors";

export default function DetailScreen() {
	const router = useRouter();
	const { id } = useLocalSearchParams<{ id: string }>();
	const item = getSpecimenById(id);

	return (
		<View style={[styles.root, { backgroundColor: item.bgColor }]}>
			<SafeAreaView style={styles.screen}>
				<View style={styles.content}>
					<Transition.Boundary
						group={ZOOM_GROUP}
						id={item.id}
						style={[styles.hero, { backgroundColor: item.color }]}
					>
						<Text style={styles.heroHex}>{item.color.toUpperCase()}</Text>
					</Transition.Boundary>

					<Text style={styles.eyebrow}>BOUNDS ZOOM · DRAG OR PINCH TO CLOSE</Text>
					<Text style={styles.title}>{item.title}</Text>
					<Text style={styles.description}>{item.description}</Text>
				</View>

				<View style={styles.actions}>
					<ActionButton
						label="How does this work?"
						onPress={() => router.push("/sheet")}
						tint={item.color}
					/>
					<ActionButton label="Go back" onPress={router.back} secondary />
				</View>
			</SafeAreaView>
		</View>
	);
}

const styles = StyleSheet.create({
	actions: {
		alignSelf: "center",
		gap: 12,
		maxWidth: 520,
		width: "100%",
	},
	content: {
		alignSelf: "center",
		maxWidth: 520,
		width: "100%",
	},
	description: {
		color: "#CBC2D8",
		fontSize: 16,
		lineHeight: 24,
		marginTop: 14,
	},
	eyebrow: {
		color: "rgba(255,255,255,0.55)",
		fontSize: 11,
		fontWeight: "800",
		letterSpacing: 1.1,
		marginTop: 28,
	},
	hero: {
		alignItems: "center",
		borderRadius: 28,
		height: 240,
		justifyContent: "flex-end",
		paddingBottom: 20,
		width: "100%",
	},
	heroHex: {
		color: "rgba(255,255,255,0.9)",
		fontSize: 18,
		fontWeight: "700",
		letterSpacing: 2,
	},
	root: {
		flex: 1,
	},
	screen: {
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
		marginTop: 8,
	},
});
