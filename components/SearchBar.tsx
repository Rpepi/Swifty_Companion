import { Pressable, StyleSheet, Text, TextInput } from "react-native";
import { useMemo } from "react";
import { createSharedStyles, radius, spacing, useThemeColors } from "@/constants/styles";

type SearchBarProps = {
	loading: boolean;
	login: string;
	setLogin: (value: string) => void;
	find_info: () => Promise<void>;
};

export default function SearchBar({ loading, login, setLogin, find_info }: SearchBarProps) {
	const colors = useThemeColors();
	const shared = useMemo(() => createSharedStyles(colors), [colors]);
	const local = useMemo(() => createLocalStyles(colors), [colors]);

	const isDisabled = loading || login === "";
	return (
		<>
			<TextInput
				placeholder="Find a user..."
				placeholderTextColor={colors.textFaint}
				autoCapitalize="none"
				autoCorrect={false}
				value={login}
				onChangeText={(text) => setLogin(text)}
				style={local.input}
			/>
			<Pressable
				disabled={isDisabled}
				style={({ pressed }) => [
					shared.buttonEnabled,
					(isDisabled || pressed) && shared.buttonDisabled,
				]}
				onPress={find_info}
			>
				<Text style={[shared.buttonText, isDisabled && shared.buttonTextDisabled]}>Search</Text>
			</Pressable>
		</>
	);
}

function createLocalStyles(colors: ReturnType<typeof useThemeColors>) {
	return StyleSheet.create({
		input: {
			backgroundColor: colors.surface,
			borderWidth: 1,
			borderColor: colors.border,
			borderRadius: radius.pill,
			paddingHorizontal: spacing.lg,
			paddingVertical: spacing.md,
			fontSize: 16,
			color: colors.textPrimary,
		},
	});
}
