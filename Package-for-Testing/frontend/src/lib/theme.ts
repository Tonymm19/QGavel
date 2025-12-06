/**
 * Theme Configuration
 * 
 * Extracted from Bolt.new frontend for vibrant, modern UI
 * Colors, spacing, and styling patterns for consistent design
 */

export const theme = {
  // Color Palette
  colors: {
    // Primary - Dark slate for headers, buttons
    primary: {
      50: 'slate-50',
      100: 'slate-100',
      200: 'slate-200',
      600: 'slate-600',
      700: 'slate-700',
      800: 'slate-800',
      900: 'slate-900',
    },
    
    // Success - Emerald for positive actions
    success: {
      100: 'emerald-100',
      600: 'emerald-600',
      700: 'emerald-700',
    },
    
    // Warning - Amber for alerts
    warning: {
      100: 'amber-100',
      600: 'amber-600',
      700: 'amber-700',
    },
    
    // Danger - Red for errors, deletions
    danger: {
      100: 'red-100',
      600: 'red-600',
      700: 'red-700',
    },
    
    // Info - Blue for informational
    info: {
      100: 'blue-100',
      600: 'blue-600',
      700: 'blue-700',
    },
    
    // Revenue/Money - Green
    revenue: {
      600: 'green-600',
    },
  },

  // Border Radius
  borderRadius: {
    sm: 'rounded-lg',      // 8px - inputs, badges
    md: 'rounded-xl',      // 12px - buttons
    lg: 'rounded-2xl',     // 16px - cards
  },

  // Shadows
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
  },

  // Transitions
  transitions: {
    all: 'transition-all',
    colors: 'transition-colors',
    shadow: 'transition-shadow',
  },

  // Spacing (for consistent padding/margins)
  spacing: {
    card: 'p-6',           // Card padding
    section: 'space-y-6',  // Section spacing
    gap: 'gap-6',          // Grid/flex gaps
  },
};

/**
 * Component Classes
 * Pre-built class combinations for common components
 */
export const componentClasses = {
  // Cards
  card: {
    base: 'bg-white rounded-2xl p-6 border border-slate-200',
    hover: 'hover:shadow-lg transition-all',
    interactive: 'hover:border-slate-900 transition-all cursor-pointer',
  },

  // Buttons
  button: {
    primary: 'flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-lg font-medium',
    secondary: 'flex items-center gap-2 px-4 py-3 rounded-xl bg-white text-slate-900 border border-slate-300 hover:bg-slate-50 transition-colors font-medium',
    danger: 'flex items-center gap-2 px-4 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg font-medium',
    success: 'flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-lg font-medium',
  },

  // Icon Containers
  iconContainer: {
    emerald: 'w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-600 text-white',
    amber: 'w-12 h-12 rounded-xl flex items-center justify-center bg-amber-600 text-white',
    blue: 'w-12 h-12 rounded-xl flex items-center justify-center bg-blue-600 text-white',
    red: 'w-12 h-12 rounded-xl flex items-center justify-center bg-red-600 text-white',
    slate: 'w-12 h-12 rounded-xl flex items-center justify-center bg-slate-600 text-white',
  },

  // Stat Cards
  statCard: {
    base: 'bg-white rounded-2xl p-6 border border-slate-200 hover:border-slate-900 transition-all cursor-pointer',
    number: 'text-3xl font-light text-slate-900',
    label: 'text-sm text-slate-600 mt-1',
  },

  // Badges
  badge: {
    success: 'px-3 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-sm font-medium',
    warning: 'px-3 py-1 rounded-lg bg-amber-100 text-amber-700 text-sm font-medium',
    danger: 'px-3 py-1 rounded-lg bg-red-100 text-red-700 text-sm font-medium',
    info: 'px-3 py-1 rounded-lg bg-blue-100 text-blue-700 text-sm font-medium',
    neutral: 'px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium',
  },

  // Inputs
  input: {
    base: 'w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all',
    error: 'w-full px-4 py-3 rounded-lg border border-red-300 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all',
  },

  // Modals
  modal: {
    backdrop: 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50',
    container: 'fixed inset-0 flex items-center justify-center p-4 z-50',
    content: 'bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto',
    header: 'px-6 py-4 border-b border-slate-200',
    body: 'p-6',
    footer: 'px-6 py-4 border-t border-slate-200 flex justify-end gap-3',
  },

  // Tables/Lists
  table: {
    row: 'border-b border-slate-200 hover:bg-slate-50 transition-colors',
    cell: 'px-4 py-3',
    header: 'px-4 py-3 text-left text-sm font-semibold text-slate-900 bg-slate-50',
  },
};

/**
 * Status Colors
 * Map status values to color classes
 */
export const statusColors = {
  // Deadline Status
  deadline: {
    pending: 'amber',
    completed: 'emerald',
    overdue: 'red',
  },

  // Priority
  priority: {
    low: 'slate',
    medium: 'blue',
    high: 'amber',
    critical: 'red',
  },

  // Case Status
  case: {
    active: 'emerald',
    pending: 'amber',
    closed: 'slate',
  },
};

/**
 * Helper function to get badge class by status
 */
export function getStatusBadgeClass(status: string, type: 'deadline' | 'priority' | 'case' = 'deadline'): string {
  const colorMap = statusColors[type];
  const color = colorMap[status as keyof typeof colorMap] || 'slate';
  
  const colorClasses: Record<string, string> = {
    emerald: componentClasses.badge.success,
    amber: componentClasses.badge.warning,
    red: componentClasses.badge.danger,
    blue: componentClasses.badge.info,
    slate: componentClasses.badge.neutral,
  };

  return colorClasses[color] || componentClasses.badge.neutral;
}

/**
 * Helper function to get icon container class by color
 */
export function getIconContainerClass(color: 'emerald' | 'amber' | 'blue' | 'red' | 'slate'): string {
  return componentClasses.iconContainer[color];
}

export default theme;

