export const colors = {
  primary: '#FFCC00',
  primaryHover: '#F2BE00',
  primarySoft: '#FFF7CC',
  primaryBorder: '#F6D84D',
  black: '#111111',
  text: '#191F28',
  subText: '#6B7280',
  mutedText: '#8B95A1',
  background: '#F7F8FA',
  sidebar: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceMuted: '#FAFBFC',
  border: '#E5E8EB',
  borderStrong: '#D1D6DB',
  disabled: '#E5E8EB',
  disabledText: '#8B95A1',
  danger: '#E5484D',
  dangerSoft: '#FFF1F2',
  success: '#16A34A',
  successSoft: '#DCFCE7',
  warning: '#F59E0B',
  warningSoft: '#FEF3C7',
  focus: '#2563EB',
  overlay: 'rgba(25, 31, 40, 0.42)',
} as const;

const toKebabCase = (value: string) =>
  value.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);

export const colorCssVariableDeclaration = Object.entries(colors)
  .map(([name, value]) => `--color-${toKebabCase(name)}: ${value};`)
  .join('\n');
