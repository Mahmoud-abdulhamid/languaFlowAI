// Theme utility classnames
export const getThemeClasses = (isDark: boolean = true) => ({
    // Backgrounds
    bg: {
        primary: isDark ? 'bg-[#0a0a0f]' : 'bg-white',
        secondary: isDark ? 'bg-[#08080c]' : 'bg-gray-50',
        tertiary: isDark ? 'bg-[#0f0f16]' : 'bg-gray-100',
        card: isDark ? 'bg-[#0e0e14]' : 'bg-white',
        cardHover: isDark ? 'bg-[#13131f]' : 'bg-gray-50',
    },
    // Text
    text: {
        primary: isDark ? 'text-white' : 'text-gray-900',
        secondary: isDark ? 'text-gray-400' : 'text-gray-600',
        tertiary: isDark ? 'text-gray-500' : 'text-gray-500',
        muted: isDark ? 'text-gray-600' : 'text-gray-400',
    },
    // Borders
    border: {
        light: isDark ? 'border-white/5' : 'border-gray-200',
        medium: isDark ? 'border-white/10' : 'border-gray-300',
        strong: isDark ? 'border-white/20' : 'border-gray-400',
    },
});
