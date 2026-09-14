import { Platform, StyleSheet, useColorScheme, useWindowDimensions, ViewStyle } from "react-native";

const palettes = {
	light: {
		background: "#F6F7FB",
		surface: "#FFFFFF",
		surfaceAlt: "#EEF0F6",
		border: "#E2E5EE",
		textPrimary: "#14151A",
		textMuted: "#62667A",
		textFaint: "#9DA1B4",
		accent: "#4C5FE0",
		accentOn: "#FFFFFF",
		accentSoft: "#E7E9FC",
		accentGlow: "rgba(76, 95, 224, 0.28)",
		success: "#189A6C",
		successSoft: "#DFF6EC",
		danger: "#DC4438",
		dangerSoft: "#FCE7E5",
		warning: "#B5791C",
		warningSoft: "#FBEED7",
		shadowColor: "#4C5FE0",
	},
	dark: {
		background: "#0A0B12",
		surface: "#15171F",
		surfaceAlt: "#1D2029",
		border: "#282C3A",
		textPrimary: "#F5F6FA",
		textMuted: "#9498AC",
		textFaint: "#565A70",
		accent: "#7C8CFF",
		accentOn: "#0A0B12",
		accentSoft: "#1E2247",
		accentGlow: "rgba(124, 140, 255, 0.35)",
		success: "#3ED9A0",
		successSoft: "#12301F",
		danger: "#FF7A70",
		dangerSoft: "#341A1B",
		warning: "#FFC369",
		warningSoft: "#332512",
		shadowColor: "#000000",
	},
} as const;

export type ThemeColors = Record<keyof typeof palettes.light, string>;

export function useThemeColors(): ThemeColors {
	const scheme = useColorScheme();
	return palettes[scheme === "dark" ? "dark" : "light"];
}

export const spacing = {
	xs: 4,
	sm: 8,
	md: 16,
	lg: 24,
	xl: 32,
	xxl: 48,
};

export const radius = {
	sm: 14,
	md: 20,
	lg: 28,
	xl: 36,
	pill: 999,
};

// Caps content width on large screens (tablets, split-view) so text/cards
// stay readable instead of stretching edge-to-edge; below this width it's
// simply 100%, so phones are unaffected. maxContentWidthTablet is the wider
// cap used once the screen is actually tablet-sized (see useResponsive).
export const layout = {
	maxContentWidth: 480,
	maxContentWidthTablet: 640,
};

const TABLET_BREAKPOINT = 768;
const TABLET_FONT_SCALE = 1.2;

// Tablets (iPad, split-view >= 768pt wide) get a slightly larger type scale
// and a wider content column — without this, screens are just the phone
// layout stretched into a lot of empty margin with the same small text.
export function useResponsive() {
	const { width } = useWindowDimensions();
	const isTablet = width >= TABLET_BREAKPOINT;
	return {
		isTablet,
		scale: isTablet ? TABLET_FONT_SCALE : 1,
		contentWidth: isTablet ? layout.maxContentWidthTablet : layout.maxContentWidth,
	};
}

export const fonts = {
	mono: Platform.select({ ios: "Menlo", android: "monospace", default: "Courier New" }),
	sans: Platform.select({ ios: "Avenir Next", android: "sans-serif-medium", default: "System" }),
};

// Soft elevation used on every card/panel — kept as a single source so the
// depth language (blur, spread, opacity) stays consistent across screens.
export function cardShadow(colors: ThemeColors): ViewStyle {
	return Platform.select({
		ios: {
			shadowColor: colors.shadowColor,
			shadowOffset: { width: 0, height: 10 },
			shadowOpacity: colors === palettes.dark ? 0.35 : 0.1,
			shadowRadius: 24,
		},
		android: { elevation: 6 },
		default: {},
	}) as ViewStyle;
}

// Tight glow used behind avatars / brand marks to simulate a blurred light
// source without pulling in a blur/gradient dependency.
export function glowShadow(colors: ThemeColors): ViewStyle {
	return Platform.select({
		ios: {
			shadowColor: colors.accent,
			shadowOffset: { width: 0, height: 0 },
			shadowOpacity: 0.55,
			shadowRadius: 20,
		},
		android: { elevation: 8 },
		default: {},
	}) as ViewStyle;
}

export function createSharedStyles(colors: ThemeColors, scale = 1, contentWidth: number = layout.maxContentWidth) {
	return StyleSheet.create({
		screen: {
			flex: 1,
			backgroundColor: colors.background,
		},
		center: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
			paddingHorizontal: spacing.lg,
		},
		contentWidth: {
			width: "100%",
			maxWidth: contentWidth,
			alignSelf: "center",
		},
		title: {
			fontFamily: fonts.sans,
			fontSize: 20 * scale,
			fontWeight: "800",
			color: colors.textPrimary,
			letterSpacing: -0.3,
		},
		subtitle: {
			fontSize: 15 * scale,
			color: colors.textMuted,
		},
		buttonEnabled: {
			backgroundColor: colors.accent,
			paddingVertical: spacing.md * scale,
			paddingHorizontal: spacing.lg * scale,
			borderRadius: radius.pill,
			alignItems: "center",
			justifyContent: "center",
			...cardShadow(colors),
			shadowColor: colors.accent,
			shadowOpacity: 0.4,
		},
		buttonDisabled: {
			backgroundColor: colors.surfaceAlt,
			borderWidth: 1,
			borderColor: colors.border,
			shadowOpacity: 0,
			elevation: 0,
		},
		buttonText: {
			fontFamily: fonts.sans,
			fontSize: 15 * scale,
			fontWeight: "700",
			letterSpacing: 0.4,
			color: colors.accentOn,
		},
		buttonTextDisabled: {
			color: colors.textFaint,
		},
		errorText: {
			color: colors.danger,
			marginTop: spacing.md,
			textAlign: "center",
			fontSize: 14 * scale,
			fontWeight: "500",
		},
	});
}
