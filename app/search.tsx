import { ActivityIndicator, Appearance, Image, Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";
import { useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { user42Schema } from "@/types/user42";
import SearchBar from "@/components/SearchBar";
import { z } from "zod";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { tokenStillValid } from "@/lib/auth";
import { cardShadow, createSharedStyles, fonts, radius, spacing, useResponsive, useThemeColors } from "@/constants/styles";

export default function Index() {
	const colors = useThemeColors();
	const scheme = useColorScheme();
	const insets = useSafeAreaInsets();
	const { scale, contentWidth } = useResponsive();
	const shared = useMemo(() => createSharedStyles(colors, scale, contentWidth), [colors, scale, contentWidth]);
	const local = useMemo(() => createLocalStyles(colors, insets.top, scale), [colors, insets.top, scale]);

	function toggleTheme() {
		Appearance.setColorScheme(scheme === "dark" ? "light" : "dark");
	}

	async function handleLogout() {
		await SecureStore.deleteItemAsync("token_oauth");
		router.replace("/");
	}

	const [login, setLogin] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [user42, setUser42] = useState<z.infer<typeof user42Schema> | null>(null);

	async function find_info() {
		setUser42(null);
		setError(null);
		setLoading(true);
		try {
			const token = await tokenStillValid();
			if (token === null) {
				setError("login expired");
				router.replace("/");
				return;
			}
			const response = await fetch(`https://api.intra.42.fr/v2/users/${login}`, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});
			const status = response.status;
			if (response.ok) {
				const data = user42Schema.parse(await response.json());
				setUser42(data);
			} else {
				if (status === 404) setError("User doesn't exist");
				else {
					console.log(response.status, await response.json());
					setError("server error");
				}
			}
		} catch (e) {
			console.log(e);
			setError("Network error, please try again.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<View style={[shared.screen, local.outer]}>
			<View style={local.topBar}>
				<Pressable onPress={toggleTheme} style={local.iconButton}>
					<Feather name={scheme === "dark" ? "sun" : "moon"} size={19} color={colors.textPrimary} />
				</Pressable>
				<Pressable onPress={handleLogout} style={local.iconButton}>
					<Feather name="log-out" size={19} color={colors.textPrimary} />
				</Pressable>
			</View>

			<View style={local.centerArea}>
				<View style={[local.container, shared.contentWidth]}>
					<Text style={local.heading}>Find a fellow student</Text>
					<Text style={local.subheading}>Search by their intra login</Text>

					<View style={local.searchRow}>
						<SearchBar loading={loading} login={login} setLogin={setLogin} find_info={find_info} />
					</View>

					{loading && <ActivityIndicator color={colors.accent} style={local.spinner} />}
					{error && <Text style={shared.errorText}>{error}</Text>}

					{user42 && (
						<Pressable
							style={({ pressed }) => [local.resultCard, pressed && local.resultCardPressed]}
							onPress={() => router.push(`/profile/${user42.login}`)}
						>
							{user42.image?.link && (
								<Image source={{ uri: user42.image.link }} style={local.avatar} />
							)}
							<View style={local.resultInfo}>
								<Text style={local.resultLogin}>{user42.login}</Text>
								<Text style={local.resultName}>
									{user42.first_name} {user42.last_name}
								</Text>
							</View>
							<Text style={local.chevron}>›</Text>
						</Pressable>
					)}
				</View>
			</View>
		</View>
	);
}

function createLocalStyles(colors: ReturnType<typeof useThemeColors>, topInset: number, scale: number) {
	return StyleSheet.create({
		outer: {
			flex: 1,
			paddingHorizontal: spacing.lg,
		},
		topBar: {
			flexDirection: "row",
			justifyContent: "flex-end",
			gap: spacing.sm,
			paddingTop: topInset + spacing.sm,
		},
		iconButton: {
			width: 40 * scale,
			height: 40 * scale,
			borderRadius: radius.pill,
			alignItems: "center",
			justifyContent: "center",
			backgroundColor: colors.surfaceAlt,
			borderWidth: 1,
			borderColor: colors.border,
		},
		centerArea: {
			flex: 1,
			justifyContent: "center",
		},
		container: {
			alignItems: "stretch",
			gap: spacing.md,
		},
		heading: {
			fontFamily: fonts.sans,
			fontSize: 26 * scale,
			fontWeight: "800",
			color: colors.textPrimary,
			textAlign: "center",
			letterSpacing: -0.4,
		},
		subheading: {
			fontSize: 15 * scale,
			color: colors.textMuted,
			textAlign: "center",
			marginBottom: spacing.md,
		},
		searchRow: {
			gap: spacing.sm,
		},
		spinner: {
			marginVertical: spacing.sm,
		},
		resultCard: {
			flexDirection: "row",
			alignItems: "center",
			backgroundColor: colors.surface,
			borderWidth: 1,
			borderColor: colors.border,
			borderRadius: radius.lg,
			padding: spacing.md,
			gap: spacing.md,
			...cardShadow(colors),
		},
		resultCardPressed: {
			opacity: 0.7,
		},
		avatar: {
			width: 60 * scale,
			height: 60 * scale,
			borderRadius: radius.pill,
			borderWidth: 2,
			borderColor: colors.accent,
		},
		resultInfo: {
			flex: 1,
			gap: 2,
		},
		resultLogin: {
			fontFamily: fonts.mono,
			fontSize: 16 * scale,
			fontWeight: "700",
			color: colors.textPrimary,
		},
		resultName: {
			fontSize: 13 * scale,
			color: colors.textMuted,
		},
		chevron: {
			fontSize: 24 * scale,
			fontWeight: "700",
			color: colors.textFaint,
		},
	});
}
