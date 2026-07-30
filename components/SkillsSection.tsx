import { View, Text, StyleSheet } from "react-native";
import { useMemo } from "react";
import { cardShadow, fonts, layout, radius, spacing, useThemeColors } from "@/constants/styles";

// 42's skill levels aren't capped at a documented value, but in practice they
// plateau well under 20 even for advanced students — used here only to turn
// a raw level into a readable percentage bar, not as an official ceiling.
const MAX_SKILL_LEVEL = 20;

type Skill = {
	name: string;
	level: number;
};

type SkillsSectionProps = {
	skills: Skill[];
};

export default function SkillsSection({ skills }: SkillsSectionProps) {
	const colors = useThemeColors();
	const styles = useMemo(() => createStyles(colors), [colors]);

	const sorted = useMemo(() => [...skills].sort((a, b) => b.level - a.level), [skills]);

	if (sorted.length === 0) {
		return (
			<View style={styles.container}>
				<Text style={styles.title}>Skills</Text>
				<Text style={styles.empty}>No skills recorded yet</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Skills</Text>
			<View style={styles.card}>
				{sorted.map((skill) => (
					<SkillBar key={skill.name} name={skill.name} level={skill.level} styles={styles} />
				))}
			</View>
		</View>
	);
}

function SkillBar({
	name,
	level,
	styles,
}: {
	name: string;
	level: number;
	styles: ReturnType<typeof createStyles>;
}) {
	const percent = Math.min(100, (level / MAX_SKILL_LEVEL) * 100);
	return (
		<View style={styles.row}>
			<View style={styles.labelRow}>
				<Text style={styles.name} numberOfLines={1}>
					{name}
				</Text>
				<Text style={styles.percent}>{percent.toFixed(0)}%</Text>
			</View>
			<View style={styles.track}>
				<View style={[styles.fill, { width: `${percent}%` }]} />
			</View>
		</View>
	);
}

function createStyles(colors: ReturnType<typeof useThemeColors>) {
	return StyleSheet.create({
		container: {
			width: "100%",
			maxWidth: layout.maxContentWidth,
			alignSelf: "center",
			paddingHorizontal: spacing.lg,
			marginTop: spacing.lg,
		},
		title: {
			fontFamily: fonts.mono,
			fontSize: 13,
			fontWeight: "700",
			color: colors.textMuted,
			textTransform: "uppercase",
			letterSpacing: 1.5,
			marginBottom: spacing.sm,
		},
		empty: {
			fontSize: 14,
			color: colors.textFaint,
		},
		card: {
			backgroundColor: colors.surface,
			borderWidth: 1,
			borderColor: colors.border,
			borderRadius: radius.lg,
			padding: spacing.lg,
			gap: spacing.lg,
			...cardShadow(colors),
		},
		row: {
			gap: spacing.sm,
		},
		labelRow: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "flex-end",
			gap: spacing.sm,
		},
		name: {
			flexShrink: 1,
			fontSize: 14,
			fontWeight: "500",
			color: colors.textPrimary,
		},
		percent: {
			fontFamily: fonts.mono,
			fontSize: 13,
			fontWeight: "700",
			color: colors.accent,
		},
		track: {
			height: 10,
			borderRadius: radius.pill,
			backgroundColor: colors.surfaceAlt,
			overflow: "hidden",
		},
		fill: {
			height: "100%",
			borderRadius: radius.pill,
			backgroundColor: colors.accent,
		},
	});
}
