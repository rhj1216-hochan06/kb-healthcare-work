import { colorCssVariableDeclaration } from '../utils/colors';

export function ThemeStyle() {
  return <style>{`:root {\n${colorCssVariableDeclaration}\n}`}</style>;
}
