import values from './tokens.json' with { type: 'json' }

export const tokens = values
export type CheeseTokens = typeof tokens

export const fontFamily = tokens.font.family
export const colors = tokens.color
export const spacing = tokens.space
export const radii = tokens.radius
