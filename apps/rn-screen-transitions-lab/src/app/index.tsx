import { useRouter } from "expo-router";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Transition from "react-native-screen-transitions";
import { type ColorSpecimen, COLOR_SPECIMENS, ZOOM_GROUP } from "@/data/colors";

const GAP = 12;
const PADDING = 20;

function SpecimenCard({
	item,
	colWidth,
}: {
	item: ColorSpecimen;
	colWidth: number;
}) {
	const router = useRouter();

	return (
		<Transition.Boundary
			group={ZOOM_GROUP}
			id={item.id}
			escapeClipping
			style={[
				styles.card,
				{
					backgroundColor: item.color,
					width: colWidth,
					height: item.height,
				},
			]}
			onPress={() => router.push(`/detail/${item.id}`)}
		>
			<Text style={styles.cardTitle}>{item.title}</Text>
			<Text style={styles.cardSubtitle}>{item.subtitle}</Text>
		</Transition.Boundary>
	);
}

export default function GalleryScreen() {
	const router = useRouter();
	const { width } = useWindowDimensions();
	const colWidth = (Math.min(width, 520) - PADDING * 2 - GAP) / 2;

	const left = COLOR_SPECIMENS.filter((_, i) => i % 2 === 0);
	const right = COLOR_SPECIMENS.filter((_, i) => i % 2 === 1);

	return (
		<SafeAreaView style={styles.screen} edges={["top"]}>
			<Transition.ScrollView contentContainerStyle={styles.scrollContent}>
				<Transition.Boundary.Host />
				<View style={styles.header}>
					<View style={styles.headerCopy}>
						<Text style={styles.eyebrow}>SCREEN TRANSITIONS LAB</Text>
						<Text style={styles.title}>Pick a specimen.</Text>
						<Text style={styles.description}>
							Tap a card for a bounds-driven shared-element zoom. Drag or
							pinch the detail screen to dismiss it.
						</Text>
					</View>
					<Text style={styles.aboutLink} onPress={() => router.push("/about")}>
						About ↗
					</Text>
				</View>

				<View style={styles.columns}>
					<View style={styles.column}>
						{left.map((item) => (
							<SpecimenCard key={item.id} item={item} colWidth={colWidth} />
						))}
					</View>
					<View style={styles.column}>
						{right.map((item) => (
							<SpecimenCard key={item.id} item={item} colWidth={colWidth} />
						))}
					</View>
				</View>
			</Transition.ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	aboutLink: {
		color: "#A78BFA",
		fontSize: 14,
		fontWeight: "700",
		paddingLeft: 12,
		paddingTop: 2,
	},
	card: {
		borderRadius: 22,
		justifyContent: "flex-end",
		overflow: "hidden",
		padding: 16,
	},
	cardSubtitle: {
		color: "rgba(255,255,255,0.75)",
		fontSize: 11,
		fontWeight: "500",
		marginTop: 2,
	},
	cardTitle: {
		color: "#fff",
		fontSize: 17,
		fontWeight: "700",
	},
	column: {
		flex: 1,
		gap: GAP,
	},
	columns: {
		alignSelf: "center",
		flexDirection: "row",
		gap: GAP,
		maxWidth: 520,
		overflow: "visible",
		width: "100%",
	},
	description: {
		color: "#BDB3CB",
		fontSize: 15,
		lineHeight: 22,
		marginTop: 12,
	},
	eyebrow: {
		color: "#A78BFA",
		fontSize: 12,
		fontWeight: "800",
		letterSpacing: 1.1,
	},
	header: {
		alignSelf: "center",
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 24,
		maxWidth: 520,
		width: "100%",
	},
	headerCopy: {
		flex: 1,
	},
	screen: {
		backgroundColor: "#0D0B12",
		flex: 1,
	},
	scrollContent: {
		overflow: "visible",
		padding: PADDING,
		paddingBottom: 48,
	},
	title: {
		color: "#F4F1FF",
		fontSize: 36,
		fontWeight: "800",
		letterSpacing: -1.2,
		lineHeight: 40,
		marginTop: 10,
	},
});
