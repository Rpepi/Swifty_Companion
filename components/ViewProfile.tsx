import { Pressable, Text } from "react-native";
import { useMemo } from "react";
import { router } from "expo-router";
import { createSharedStyles, useThemeColors } from "@/constants/styles";
import { user42Schema } from "@/types/user42";
import { z } from "zod";

type ViewProfileProps = {
	exist: boolean;
	user42: z.infer<typeof user42Schema> | null;
};

export default function ViewProfile({ exist, user42 }: ViewProfileProps) {
	const colors = useThemeColors();
	const shared = useMemo(() => createSharedStyles(colors), [colors]);

	return (
		<Pressable
			disabled={!exist}
			style={({ pressed }) => [shared.buttonEnabled, (!exist || pressed) && shared.buttonDisabled]}
			onPress={() => {
				if (!user42) return;
				router.push(`/profile/${user42.login}`);
			}}
		>
			<Text style={[shared.buttonText, !exist && shared.buttonTextDisabled]}>View profile</Text>
		</Pressable>
	);
}
