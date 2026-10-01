import { StyleSheet, Text } from "react-native";
import { RectButton } from "react-native-gesture-handler";

type ActionButtonProps = {
	label: string;
	onPress: () => void;
	secondary?: boolean;
	tint?: string;
};

export function ActionButton({
	label,
	onPress,
	secondary = false,
	tint,
}: ActionButtonProps) {
	return (
		<RectButton
			onPress={onPress}
			style={[
				styles.button,
				secondary && styles.secondaryButton,
				!secondary && tint ? { backgroundColor: tint } : null,
			]}
		>
			<Text style={[styles.label, secondary && styles.secondaryLabel]}>
				{label}
			</Text>
		</RectButton>
	);
}

const styles = StyleSheet.create({
	button: {
		alignItems: "center",
		backgroundColor: "#F4F1FF",
		borderRadius: 16,
		justifyContent: "center",
		minHeight: 54,
		paddingHorizontal: 20,
	},
	label: {
		color: "#17121F",
		fontSize: 16,
		fontWeight: "700",
	},
	secondaryButton: {
		backgroundColor: "#2A2533",
	},
	secondaryLabel: {
		color: "#F4F1FF",
	},
});
