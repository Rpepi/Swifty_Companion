import { useEffect, useMemo, useState } from "react";
import { makeRedirectUri, ResponseType, useAuthRequest } from "expo-auth-session";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { createSharedStyles, fonts, radius, spacing, useThemeColors } from "@/constants/styles";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { discovery, tokenStillValid  } from "@/lib/auth";

export default function Login() {
	const colors = useThemeColors();
	const shared = useMemo(() => createSharedStyles(colors), [colors]);
	const local = useMemo(() => createLocalStyles(colors), [colors]);

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const scheme = "swiftycompanion";
	const path = "callback";

	const redirect_uri = useMemo(() => makeRedirectUri({ scheme, path }), [scheme, path]);

	const [request, response, promptAsync] = useAuthRequest(
		{
			clientId: process.env.EXPO_PUBLIC_API42_UID,
			redirectUri: redirect_uri,
			scopes: ["public"],
			responseType: ResponseType.Code,
			usePKCE: false,
		},
		discovery
	);

	useEffect(() => {
		const oauthExchange = async () => {
			async function exchangeToken(code: string) {
				const params = new URLSearchParams({
					grant_type: "authorization_code",
					client_id: process.env.EXPO_PUBLIC_API42_UID,
					client_secret: process.env.EXPO_PUBLIC_API42_SECRET,
					code: code,
					redirect_uri: redirect_uri,
				});
				try {
					const response_exchange = await fetch(discovery.tokenEndpoint, {
						method: "POST",
						headers: {
							"Content-Type": "application/x-www-form-urlencoded",
						},
						body: params.toString(),
					});
					if (response_exchange.ok) {
						const token = await response_exchange.json();
						await SecureStore.setItemAsync("token_oauth", JSON.stringify(token));
						return true;
					} else {
						console.log(response_exchange.status, response_exchange.json());
						setError("Login failed, please try again.");
						return false;
					}
				} catch (e) {
					console.log(e);
					setError("Network error, please try again.");
					return false;
				}
			}

			if (response?.type === "success") {
				const success = await exchangeToken(response.params.code);
				if (success) {
					router.replace("/search");
				}
			} else if (response?.type === "error") {
				setError("Login failed, please try again.");
			} else {
				setError(null); // clean error so that nothing appears and the user can retry in case of cancel or dismiss.
			}
		};
		oauthExchange();
	}, [response, redirect_uri]);

	useEffect(() => {
		async function skip_login() {
			if (await tokenStillValid()) router.replace("/search");
		}
		skip_login();
	}, []);

	return (
		<View style={[shared.screen, shared.center]}>
			<View style={local.mark}>
				<View style={local.wordmarkRow}>
					<Text style={local.wordmark}>42</Text>
					<View style={local.cursor} />
				</View>
				<Text style={local.appName}>Swifty Companion</Text>
				<Text style={local.tagline}>Look up any intra profile</Text>
			</View>

			<Pressable
				disabled={loading || !request}
				style={({ pressed }) => [
					local.button,
					shared.buttonEnabled,
					(pressed || loading || !request) && shared.buttonDisabled,
				]}
				onPress={async () => {
					try {
						setLoading(true);
						await promptAsync({ preferEphemeralSession: true });
					} catch {
						setError("Error while opening browser");
					} finally {
						setLoading(false);
					}
				}}
			>
				{loading ? (
					<ActivityIndicator color={colors.accentOn} />
				) : (
					<Text style={shared.buttonText}>Login with 42</Text>
				)}
			</Pressable>

			{error && <Text style={shared.errorText}>{error}</Text>}
		</View>
	);
}

function createLocalStyles(colors: ReturnType<typeof useThemeColors>) {
	return StyleSheet.create({
		mark: {
			alignItems: "center",
			marginBottom: spacing.xxl,
		},
		wordmarkRow: {
			position: "relative",
			alignItems: "center",
			marginBottom: spacing.sm,
		},
		wordmark: {
			fontFamily: fonts.mono,
			fontSize: 60,
			fontWeight: "700",
			color: colors.textPrimary,
			letterSpacing: -1.5,
		},
		cursor: {
			position: "absolute",
			right: -spacing.md,
			bottom: 10,
			width: 10,
			height: 36,
			backgroundColor: colors.accent,
			borderRadius: 3,
		},
		appName: {
			fontFamily: fonts.sans,
			fontSize: 17,
			fontWeight: "700",
			color: colors.textPrimary,
			marginBottom: spacing.xs,
			letterSpacing: -0.2,
		},
		tagline: {
			fontSize: 14,
			color: colors.textFaint,
		},
		button: {
			minWidth: 240,
			borderRadius: radius.pill,
		},
	});
}
