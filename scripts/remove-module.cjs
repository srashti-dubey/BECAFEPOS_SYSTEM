#!/usr/bin/env node
// Reverts a module created by `hygen module new`: deletes src/features/<module>/ and strips
// its entries back out of the 6 shared files the generator injects into. Run:
//   node scripts/remove-module.cjs --name Product [--yes]
'use strict'

const fs = require('fs')
const path = require('path')
const readline = require('readline')

const ROOT = path.resolve(__dirname, '..')

function toWords(str) {
  return String(str)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
}

function pascalCase(str) {
  return toWords(str)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('')
}

function camelCase(str) {
  const p = pascalCase(str)
  return p.charAt(0).toLowerCase() + p.slice(1)
}

function kebabCase(str) {
  return toWords(str)
    .map((w) => w.toLowerCase())
    .join('-')
}

function pluralize(word) {
  if (/(s|x|z|ch|sh)$/i.test(word)) return word + 'es'
  if (/[^aeiou]y$/i.test(word)) return word.slice(0, -1) + 'ies'
  return word + 's'
}

function parseArgs(argv) {
  const nameIndex = argv.indexOf('--name')
  const name = nameIndex !== -1 ? argv[nameIndex + 1] : undefined
  const yes = argv.includes('--yes') || argv.includes('-y')
  return { name, yes }
}

function confirm(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(/^y(es)?$/i.test(answer.trim()))
    })
  })
}

// Block strings below are built with plain '\n', but on a Windows checkout these shared files
// are usually '\r\n' — and hygen doesn't reliably normalize freshly *injected* lines to match
// the rest of the file, so a repeatedly-injected file (apiEndpoints.ts, routes.ts, ...) can end
// up with some lines '\r\n' and others plain '\n' in the same file. Rather than guess one
// convention, normalize both sides to '\n' for the search/replace, then convert the whole
// result back to whatever convention dominates the file (which also has the side effect of
// cleaning up any mixed line endings hygen left behind).
function removeBlock(content, blockText, label) {
  const normalizedContent = content.replace(/\r\n/g, '\n')
  const normalizedBlock = blockText.replace(/\r\n/g, '\n')
  if (!normalizedContent.includes(normalizedBlock)) {
    console.warn(`  ! could not find the expected ${label} block — check that file by hand`)
    return content
  }
  const eol = content.includes('\r\n') ? '\r\n' : '\n'
  const updated = normalizedContent.replace(normalizedBlock, '').replace(/\n{3,}/g, '\n\n')
  return eol === '\r\n' ? updated.replace(/\n/g, '\r\n') : updated
}

function patchFile(relativePath, transform) {
  const absolute = path.join(ROOT, relativePath)
  if (!fs.existsSync(absolute)) {
    console.warn(`  ! ${relativePath} not found, skipping`)
    return
  }
  const original = fs.readFileSync(absolute, 'utf8')
  const updated = transform(original)
  if (updated !== original) {
    fs.writeFileSync(absolute, updated)
    console.log(`  patched: ${relativePath}`)
  } else {
    console.log(`  unchanged: ${relativePath}`)
  }
}

async function main() {
  const { name, yes } = parseArgs(process.argv.slice(2))

  if (!name) {
    console.error('Usage: node scripts/remove-module.cjs --name <ModuleName> [--yes]')
    process.exit(1)
  }

  const singular = pascalCase(name)
  const plural = pascalCase(pluralize(singular))
  const singularCamel = camelCase(singular)
  const pluralCamel = camelCase(plural)
  const folder = kebabCase(plural)

  const featureDir = path.join(ROOT, 'src', 'features', folder)

  if (!fs.existsSync(featureDir)) {
    console.error(`No module found at src/features/${folder} — nothing to remove.`)
    process.exit(1)
  }

  console.log(`This will delete src/features/${folder}/ and remove its entries from:`)
  console.log('  src/constants/apiEndpoints.ts, routes.ts')
  console.log('  src/features/index.ts, src/app/routes.tsx')

  if (!yes) {
    const ok = await confirm(`Remove the "${singular}" module? (y/N): `)
    if (!ok) {
      console.log('Aborted.')
      return
    }
  }

  fs.rmSync(featureDir, { recursive: true, force: true })
  console.log(`removed: src/features/${folder}`)

  patchFile('src/constants/apiEndpoints.ts', (content) => {
    const block =
      `  ${pluralCamel}: '/${folder}',\n` +
      `  ${singularCamel}: (id: string) => \`/${folder}/\${id}\`,\n` +
      `  ${pluralCamel}ActiveList: '/${folder}/active/list',\n` +
      `  ${pluralCamel}ExportExcel: '/${folder}/export/excel',\n` +
      `  ${pluralCamel}ApprovalApprove: (requestId: number | string) => \`/${folder}/approvals/\${requestId}/approve\`,\n` +
      `  ${pluralCamel}ApprovalReject: (requestId: number | string) => \`/${folder}/approvals/\${requestId}/reject\`,\n`
    return removeBlock(content, block, 'apiEndpoints.ts')
  })

  patchFile('src/constants/routes.ts', (content) => {
    const block = `  ${pluralCamel}: '/admin/${folder}',\n` + `  ${singularCamel}Detail: (id: string) => \`/admin/${folder}/\${id}\`,\n`
    return removeBlock(content, block, 'routes.ts')
  })

  patchFile('src/features/index.ts', (content) => {
    const block = `export * from './${folder}'\n`
    return removeBlock(content, block, 'features/index.ts')
  })

  patchFile('src/app/routes.tsx', (content) => {
    const importsBlock =
      `const ${singular}ListPage = lazy(() => import('@/features/${folder}/pages/${singular}ListPage'))\n` +
      `const ${singular}ViewPage = lazy(() => import('@/features/${folder}/pages/${singular}ViewPage'))\n`
    let next = removeBlock(content, importsBlock, 'routes.tsx lazy imports')

    const routeBlock =
      `          {\n` +
      `            path: '${folder}',\n` +
      `            children: [\n` +
      `              {\n` +
      `                index: true,\n` +
      `                element: withSuspense(\n` +
      `                  <RoutePermissionGuard route={ROUTES.${pluralCamel}} action="view">\n` +
      `                    <${singular}ListPage />\n` +
      `                  </RoutePermissionGuard>,\n` +
      `                ),\n` +
      `              },\n` +
      `              {\n` +
      `                path: ':id',\n` +
      `                element: withSuspense(\n` +
      `                  <RoutePermissionGuard route={ROUTES.${pluralCamel}} action="view">\n` +
      `                    <${singular}ViewPage />\n` +
      `                  </RoutePermissionGuard>,\n` +
      `                ),\n` +
      `              },\n` +
      `            ],\n` +
      `          },\n`
    next = removeBlock(next, routeBlock, 'routes.tsx route block')

    return next
  })

  console.log(`\nDone. Run "npx tsc -b --noEmit" to confirm nothing else references ${singular}.`)
}

main()
