import { View, Text, Image, StyleSheet } from "react-native";
import { useMemo } from "react";
import { cardShadow, fonts, glowShadow, radius, spacing, useResponsive, useThemeColors } from "@/constants/styles";

type ProfileHeaderProps = {
	login: string;
	email: string;
	/** Null when the user has no avatar, or hid it for privacy. */
	image: string | null;
	/** Null when the user hid their phone number for privacy. */
	phone: string | null;
	/** Undefined when the account has no cursus at all. */
	level?: number;
	location: string | null;
	wallet: number;
	correction_point: number;
};

export default function ProfileHeader({
	login,
	email,
	image,
	phone,
	level,
	location,
	wallet,
	correction_point,
}: ProfileHeaderProps) {
	const colors = useThemeColors();
	const { scale, contentWidth } = useResponsive();
	const styles = useMemo(() => createStyles(colors, scale, contentWidth), [colors, scale, contentWidth]);

	return (
		<View style={styles.container}>
			<View style={styles.avatarRing}>
				{image ? (
					<Image source={{ uri: image }} style={styles.avatar} resizeMode="cover" />
				) : (
					<View style={[styles.avatar, styles.avatarFallback]}>
						<Text style={styles.avatarFallbackText}>{login.slice(0, 2).toUpperCase()}</Text>
					</View>
				)}
			</View>

			<Text style={styles.login}>{login}</Text>
			<View style={styles.levelPill}>
				<Text style={styles.levelText}>
					{level === undefined ? "No cursus" : `Level ${level.toFixed(2)}`}
				</Text>
			</View>

			<View style={styles.card}>
				<InfoItem styles={styles} label="Email" value={email} />
				<Divider style={styles.divider} />
				<InfoItem styles={styles} label="Phone" value={phone ?? "Hidden"} />
				<Divider style={styles.divider} />
				<InfoItem styles={styles} label="Location" value={location ?? "Unknown"} />
				<Divider style={styles.divider} />
				<InfoItem styles={styles} label="Wallet" value={`${wallet} ₳`} />
				<Divider style={styles.divider} />
				<InfoItem styles={styles} label="Evaluations" value={`${correction_point} pts`} />
			</View>
		</View>
	);
}

function InfoItem({
	label,
	value,
	styles,
}: {
	label: string;
	value: string;
	styles: ReturnType<typeof createStyles>;
}) {
	return (
		<View style={styles.infoRow}>
			<Text style={styles.infoLabel}>{label}</Text>
			<Text style={styles.infoValue}>{value}</Text>
		</View>
	);
}

function Divider({ style }: { style: object }) {
	return <View style={style} />;
}

function createStyles(colors: ReturnType<typeof useThemeColors>, scale: number, contentWidth: number) {
	return StyleSheet.create({
		container: {
			alignItems: "center",
			paddingTop: spacing.xxl,
			paddingBottom: spacing.lg,
			paddingHorizontal: spacing.lg,
			width: "100%",
			maxWidth: contentWidth,
			alignSelf: "center",
		},
		avatarRing: {
			width: 116 * scale,
			height: 116 * scale,
			borderRadius: radius.pill,
			borderWidth: 3,
			borderColor: colors.accent,
			padding: 4,
			marginBottom: spacing.md,
			backgroundColor: colors.surface,
			...glowShadow(colors),
		},
		avatar: {
			width: "100%",
			height: "100%",
			borderRadius: radius.pill,
		},
		avatarFallback: {
			alignItems: "center",
			justifyContent: "center",
			backgroundColor: colors.surfaceAlt,
		},
		avatarFallbackText: {
			fontFamily: fonts.sans,
			fontSize: 34 * scale,
			fontWeight: "800",
			color: colors.textMuted,
		},
		login: {
			fontFamily: fonts.sans,
			fontSize: 24 * scale,
			fontWeight: "800",
			color: colors.textPrimary,
			letterSpacing: -0.3,
		},
		levelPill: {
			backgroundColor: colors.accentSoft,
			borderRadius: radius.pill,
			paddingHorizontal: spacing.md,
			paddingVertical: 6,
			marginTop: spacing.sm,
			marginBottom: spacing.xl,
		},
		levelText: {
			fontFamily: fonts.mono,
			fontSize: 12 * scale,
			fontWeight: "700",
			color: colors.accent,
			letterSpacing: 0.3,
		},
		card: {
			width: "100%",
			backgroundColor: colors.surface,
			borderWidth: 1,
			borderColor: colors.border,
			borderRadius: radius.lg,
			paddingHorizontal: spacing.lg,
			...cardShadow(colors),
		},
		infoRow: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			paddingVertical: spacing.md,
		},
		divider: {
			height: StyleSheet.hairlineWidth,
			backgroundColor: colors.border,
		},
		infoLabel: {
			fontSize: 13 * scale,
			color: colors.textMuted,
		},
		infoValue: {
			fontFamily: fonts.mono,
			fontSize: 14 * scale,
			fontWeight: "600",
			color: colors.textPrimary,
		},
	});
}
