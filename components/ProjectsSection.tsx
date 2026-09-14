import { View, Text, StyleSheet } from "react-native";
import { useMemo } from "react";
import { cardShadow, fonts, radius, spacing, useResponsive, useThemeColors, ThemeColors } from "@/constants/styles";
import { z } from "zod";
import { user42Schema } from "@/types/user42";

type Project = z.infer<typeof user42Schema>["projects_users"][number];

type ProjectsSectionProps = {
	projects: Project[];
};

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
	const colors = useThemeColors();
	const { scale, contentWidth } = useResponsive();
	const styles = useMemo(() => createStyles(colors, scale, contentWidth), [colors, scale, contentWidth]);

	// Finished projects (validated or failed) first; in-progress ones last,
	// since they don't have a final outcome to show yet.
	const sorted = useMemo(() => {
		const rank = (p: Project) => (p["validated?"] === null ? 1 : 0);
		return [...projects].sort((a, b) => rank(a) - rank(b));
	}, [projects]);

	if (sorted.length === 0) {
		return (
			<View style={styles.container}>
				<Text style={styles.title}>Projects</Text>
				<Text style={styles.empty}>No projects yet</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Projects</Text>
			<View style={styles.card}>
				{sorted.map((p, index) => (
					<ProjectRow
						key={`${p.project.name}-${index}`}
						name={p.project.name}
						status={p.status}
						validated={p["validated?"]}
						finalMark={p.final_mark}
						colors={colors}
						styles={styles}
						last={index === sorted.length - 1}
					/>
				))}
			</View>
		</View>
	);
}

function ProjectRow({
	name,
	status,
	validated,
	finalMark,
	colors,
	styles,
	last,
}: {
	name: string;
	status: string;
	validated: boolean | null;
	finalMark: number | null;
	colors: ThemeColors;
	styles: ReturnType<typeof createStyles>;
	last: boolean;
}) {
	const badge = getBadge(status, validated, colors);
	return (
		<View style={[styles.row, !last && styles.rowDivider]}>
			<View style={styles.rowLeft}>
				<Text style={styles.name} numberOfLines={1}>
					{name}
				</Text>
				<View style={[styles.badge, { backgroundColor: badge.soft }]}>
					<View style={[styles.badgeDot, { backgroundColor: badge.solid }]} />
					<Text style={[styles.badgeText, { color: badge.solid }]}>{badge.label}</Text>
				</View>
			</View>
			{finalMark !== null && <Text style={[styles.mark, { color: badge.solid }]}>{finalMark}</Text>}
		</View>
	);
}

function getBadge(status: string, validated: boolean | null, colors: ThemeColors) {
	if (validated === true) {
		return { label: "Success", solid: colors.success, soft: colors.successSoft };
	}
	if (validated === false) {
		return { label: "Failed", solid: colors.danger, soft: colors.dangerSoft };
	}
	// validated is null: not graded yet (in progress, waiting for correction, searching a group, ...)
	const label = status === "in_progress" ? "In progress" : "Pending";
	return { label, solid: colors.warning, soft: colors.warningSoft };
}

function createStyles(colors: ThemeColors, scale: number, contentWidth: number) {
	return StyleSheet.create({
		container: {
			width: "100%",
			maxWidth: contentWidth,
			alignSelf: "center",
			paddingHorizontal: spacing.lg,
			marginTop: spacing.lg,
			marginBottom: spacing.xl,
		},
		title: {
			fontFamily: fonts.mono,
			fontSize: 13 * scale,
			fontWeight: "700",
			color: colors.textMuted,
			textTransform: "uppercase",
			letterSpacing: 1.5,
			marginBottom: spacing.sm,
		},
		empty: {
			fontSize: 14 * scale,
			color: colors.textFaint,
		},
		card: {
			backgroundColor: colors.surface,
			borderWidth: 1,
			borderColor: colors.border,
			borderRadius: radius.lg,
			paddingHorizontal: spacing.lg,
			...cardShadow(colors),
		},
		row: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			paddingVertical: spacing.md,
			gap: spacing.sm,
		},
		rowDivider: {
			borderBottomWidth: StyleSheet.hairlineWidth,
			borderBottomColor: colors.border,
		},
		rowLeft: {
			flex: 1,
			gap: spacing.xs,
		},
		name: {
			fontSize: 14 * scale,
			fontWeight: "600",
			color: colors.textPrimary,
		},
		badge: {
			flexDirection: "row",
			alignItems: "center",
			alignSelf: "flex-start",
			borderRadius: radius.pill,
			paddingHorizontal: spacing.sm,
			paddingVertical: 3,
			gap: 5,
		},
		badgeDot: {
			width: 6,
			height: 6,
			borderRadius: radius.pill,
		},
		badgeText: {
			fontSize: 11 * scale,
			fontWeight: "700",
			letterSpacing: 0.2,
		},
		mark: {
			fontFamily: fonts.mono,
			fontSize: 17 * scale,
			fontWeight: "700",
		},
	});
}
