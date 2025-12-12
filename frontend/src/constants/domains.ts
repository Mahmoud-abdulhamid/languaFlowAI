export const PROJECT_DOMAINS = [
    'General',
    'Legal',
    'Medical',
    'Technical',
    'Financial',
    'Marketing',
    'Literary',
    'Scientific'
] as const;

export type ProjectDomain = typeof PROJECT_DOMAINS[number];
