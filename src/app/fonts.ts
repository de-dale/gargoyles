import * as royalInferno from '@assets/fonts/royal-inferno.ttf'
import * as burny from '@assets/fonts/Burny.ttf'
import * as keneel from '@assets/fonts/Keneel Messy.ttf'
import * as te from '@assets/fonts/TE-7002.ttf'

const loadFont = (fontFamily: string, fontUrl: string) => {
  const createStyleForFonts = () => {
    const element = document.createElement('style')
    element.setAttribute('id', 'fonts')
    document.head.appendChild(element)
    return element
  }
  const fonts: () => HTMLStyleElement = () => document.querySelector('style#fonts') || createStyleForFonts()

  const styles = `@font-face { font-family: ${fontFamily}; src: url("${fontUrl}"); }`
  fonts().sheet.insertRule(styles, 0)

  // @ts-ignore
  document.fonts.load('16px ' + fontFamily)
}

export const FONTS = {
  ROYAL_INFERNO: 'Royal Inferno',
  BURNY: 'Burny',
  KENEEL_MESSY: 'Keneel Messy',
  TE_7002: 'TE-7002',
}

export const loadFonts = () => {
  loadFont(FONTS.ROYAL_INFERNO, royalInferno)
  loadFont(FONTS.BURNY, burny)
  loadFont(FONTS.KENEEL_MESSY, keneel)
  loadFont(FONTS.TE_7002, te)
}
