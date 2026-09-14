import { Stack, useLocalSearchParams, router } from "expo-router";
import { ActivityIndicator, ScrollView, Text } from "react-native";
import { user42Schema } from "@/types/user42";
import { useEffect, useMemo, useState } from "react";
import { tokenStillValid} from "@/lib/auth";
import { z } from "zod";
import ProfileHeader from "@/components/ProfileHeader";
import SkillsSection from "@/components/SkillsSection";
import ProjectsSection from "@/components/ProjectsSection";
import { createSharedStyles, spacing, useThemeColors } from "@/constants/styles";

export default function UserProfile() {
	const colors = useThemeColors();
	const shared = useMemo(() => createSharedStyles(colors), [colors]);

	const { login } = useLocalSearchParams<{ login: string }>();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [user42, setUser42] = useState<z.infer<typeof user42Schema> | null>(null);

	useEffect(() => {
		const loadData = async () => {
			setError(null);
			setUser42(null);
			setLoading(true);
			try {
				const token = await tokenStillValid();
				if (!token) {
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
		};
		loadData();
	}, [login]);

	// Prefer the main 42 cursus, but fall back to whatever cursus the user has
	// (piscine-only accounts have no "42cursus" entry). Accounts with no cursus
	// at all get an explicit message below rather than a blank screen.
	const monCursus =
		user42?.cursus_users.find((c) => c.cursus.slug === "42cursus") ?? user42?.cursus_users[0];

	return (
		<ScrollView
			style={shared.screen}
			contentContainerStyle={!user42 ? shared.center : { paddingBottom: spacing.xxl }}
		>
			<Stack.Screen options={{ headerShown: true, title: login }} />

			{loading && <ActivityIndicator color={colors.accent} />}
			{error && <Text style={shared.errorText}>{error}</Text>}

			{user42 && (
				<>
					<ProfileHeader
						login={user42.login}
						email={user42.email}
						image={user42.image?.link ?? null}
						phone={user42.phone}
						level={monCursus?.level}
						location={user42.location}
						wallet={user42.wallet}
						correction_point={user42.correction_point}
					/>
					<SkillsSection skills={monCursus?.skills ?? []} />
					<ProjectsSection projects={user42.projects_users} />
				</>
			)}
		</ScrollView>
	);
}
