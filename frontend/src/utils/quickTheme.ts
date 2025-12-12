// Quick theme prop wrapper - adds isDark?: boolean prop to all components
// Usage: Add this at the top of each component export

// For components that need theme support, add: { isDark = true }: { isDark?: boolean }
// Then use isDark ? 'dark-class' : 'light-class' pattern

export const quickTheme = (isDark: boolean) => ({
    bg: isDark ? 'bg-[#0a0a0f]' : 'bg-white',
    bgSec: isDark ? 'bg-[#08080c]' : 'bg-gray-50',
    text: isDark ? 'text-white' : 'text-gray-900',
    textSec: isDark ? 'text-gray-400' : 'text-gray-600',
    border: isDark ? 'border-white/5' : 'border-gray-200',
    card: isDark ? 'bg-[#0e0e14]' : 'bg-white',
});
