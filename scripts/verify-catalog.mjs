import { readFileSync } from 'node:fs'

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
const catalog = html.match(/<section id="catalog"[\s\S]*?<\/section>/)?.[0]

if (!catalog) throw new Error('Full Catalog section is missing.')
if (html.includes('id="component-lab"')) throw new Error('Component Lab must not be present.')

const grids = [...catalog.matchAll(/<div class="catalog-grid">([\s\S]*?)<\/div>/g)].map((match) => match[1])
const items = grids.flatMap((grid) => [...grid.matchAll(/<span([^>]*)>([^<]+)<\/span>/g)])
const incomplete = items.filter(([, attributes]) => !attributes.includes('data-cheese="true"'))

const requiredSections = ['form-selection', 'date-time', 'navigation-disclosure', 'overlay-feedback', 'data-layout']
const missingSections = requiredSections.filter((id) => !html.includes(`id="${id}"`))

if (items.length !== 63) throw new Error(`Expected 63 catalog items, found ${items.length}.`)
if (incomplete.length) throw new Error(`Incomplete catalog items: ${incomplete.map((match) => match[2]).join(', ')}`)
if (missingSections.length) throw new Error(`Missing demo sections: ${missingSections.join(', ')}`)

console.log(`Catalog verified: ${items.length}/63 implemented across ${requiredSections.length} interactive sections.`)
