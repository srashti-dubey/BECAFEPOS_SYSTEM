// Hygen hook file for `hygen module new`. Plain CommonJS — runs with full require() access,
// unlike the .ejs.t templates (which render inside a sandboxed EJS context with no require()).
// All derivation (case conversion, pluralization, zod snippets, mock-seed expressions) happens
// here so the templates themselves stay close to plain interpolation.

// --- case helpers (no external deps: hygen's own deps like `inflection` live under hygen's
//     nested node_modules on pnpm and are not guaranteed resolvable from project-space code) ---

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

function humanize(str) {
  const words = toWords(str)
  return words.map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w.toLowerCase())).join(' ')
}

function upperSnake(str) {
  return toWords(str)
    .map((w) => w.toUpperCase())
    .join('_')
}

function snakeCase(str) {
  return toWords(str)
    .map((w) => w.toLowerCase())
    .join('_')
}

function guessTone(value) {
  const v = String(value).toLowerCase()
  if (/(active|enabled|approved|published|completed|success|available|paid|confirmed)/.test(v)) return 'success'
  if (/(pending|draft|review|processing|waiting)/.test(v)) return 'warning'
  if (/(inactive|disabled|rejected|cancell?ed|failed|blocked|suspended|archived)/.test(v)) return 'danger'
  return 'neutral'
}

function pluralize(word) {
  if (/(s|x|z|ch|sh)$/i.test(word)) return word + 'es'
  if (/[^aeiou]y$/i.test(word)) return word.slice(0, -1) + 'ies'
  return word + 's'
}

// --- per-field derivation ---

function buildZodExpr(field) {
  switch (field.type) {
    case 'email':
      return `z.string().trim().min(1, '${field.label} is required').email('${field.label} is invalid')`
    case 'phone':
      return `z.string().trim().min(1, '${field.label} is required').regex(REGEX.phone, '${field.label} is invalid')`
    case 'number': {
      // Kept as a string schema (not z.coerce.number()) so the form's field type matches what
      // the DOM input actually holds — z.coerce.number() makes z.input/z.output diverge, which
      // conflicts with useForm's single-generic defaultValues typing. Converted to a real
      // number only at submission time (see <Singular>FormModal's payload construction).
      let expr = 'z.string().trim()'
      if (field.required) {
        expr += `.min(1, '${field.label} is required')`
      }
      expr += `.refine((val) => val === '' || !Number.isNaN(Number(val)), '${field.label} must be a valid number')`
      if (field.min !== undefined) {
        expr += `.refine((val) => val === '' || Number(val) >= ${field.min}, '${field.label} must be at least ${field.min}')`
      }
      if (field.max !== undefined) {
        expr += `.refine((val) => val === '' || Number(val) <= ${field.max}, '${field.label} must be at most ${field.max}')`
      }
      if (!field.required) {
        expr += '.optional()'
      }
      return expr
    }
    case 'boolean':
      return 'z.boolean()'
    case 'enum':
      // No cast needed: z.enum's `const T extends readonly string[]` type parameter infers the
      // literal union directly from an inline array literal (casting to string[] would widen it).
      return `z.enum(${JSON.stringify(field.options)}, '${field.label} is required')`
    case 'date':
      return `z.string().trim().min(1, '${field.label} is required')`
    case 'string':
    default: {
      let expr = 'z.string().trim()'
      const effectiveMin = field.required ? Math.max(1, field.min || 0) : field.min
      if (effectiveMin) {
        const isJustRequired = field.required && (!field.min || field.min <= 1)
        const message = isJustRequired ? `${field.label} is required` : `${field.label} must be at least ${effectiveMin} characters`
        expr += `.min(${effectiveMin}, '${message}')`
      }
      if (field.max !== undefined) expr += `.max(${field.max}, '${field.label} must be at most ${field.max} characters')`
      if (field.pattern) expr += `.regex(/${field.pattern}/, '${field.label} format is invalid')`
      return expr
    }
  }
}

function buildDefaultValue(field) {
  if (field.type === 'boolean') return 'false'
  if (field.type === 'enum') return field.options && field.options[0] ? `'${field.options[0]}'` : "''"
  return "''"
}

function tsTypeOf(field) {
  if (field.type === 'boolean') return 'boolean'
  if (field.type === 'number') return 'number'
  if (field.type === 'enum') return field.options.map((o) => `'${o}'`).join(' | ')
  return 'string'
}

function controlOf(field) {
  if (field.type === 'boolean') return 'checkbox'
  if (field.type === 'enum') return 'select'
  return 'input'
}

function htmlInputType(field) {
  if (field.type === 'email') return 'email'
  if (field.type === 'date') return 'date'
  return 'text'
}

function buildMockSeedExpr(field, index) {
  switch (field.type) {
    case 'email':
      return `\`${field.name}-\${${index} + 1}@example.com\``
    case 'phone':
      return `\`9\${String(100000000 + ${index} * 137).padStart(9, '0').slice(0, 9)}\``
    case 'number':
      return `(${index} % 100) + 1`
    case 'boolean':
      return `${index} % 2 === 0`
    case 'date':
      return `new Date(2025, ${index} % 12, (${index} % 27) + 1).toISOString()`
    case 'enum':
      return `${upperSnake(field.name)}_VALUES[${index} % ${upperSnake(field.name)}_VALUES.length]`
    default:
      return `\`${field.label} \${${index} + 1}\``
  }
}

// A single fixed valid/invalid literal per field, for the generated *Schema.test.ts to feed into
// zod's per-field `.shape.<field>.safeParse(...)` — not the whole-object schema, so one field
// having no safely-synthesizable case (an arbitrary custom `pattern`) can't break the others.
// `null` means "can't safely generate one" — the template emits a TODO instead of guessing.
function buildTestValidValue(field) {
  switch (field.type) {
    case 'email':
      return `${field.name}@example.com`
    case 'phone':
      return '9876543210'
    case 'number':
      if (field.min !== undefined) return String(field.min)
      if (field.max !== undefined) return String(field.max)
      return '10'
    case 'boolean':
      return true
    case 'enum':
      return field.options[0]
    case 'date':
      return '2025-01-15'
    case 'string':
    default: {
      if (field.pattern) return null
      const minLen = field.required ? Math.max(1, field.min || 1) : field.min || 0
      let base = 'Sample'
      while (base.length < minLen) base += 'X'
      if (field.max !== undefined && base.length > field.max) base = base.slice(0, Math.max(1, field.max))
      return base
    }
  }
}

function buildTestInvalidValue(field) {
  switch (field.type) {
    case 'email':
      return 'not-an-email'
    case 'phone':
      return '12345'
    case 'number':
      return 'not-a-number'
    case 'boolean':
      return 'not-a-boolean'
    case 'enum':
      return 'not-a-real-option'
    case 'date':
      // buildZodExpr always requires a non-empty date string regardless of field.required.
      return ''
    case 'string':
    default: {
      if (field.required) return ''
      if (field.min) return 'x'.repeat(Math.max(0, field.min - 1))
      return null
    }
  }
}

// A single well-typed literal per field for domain-level tests (mock API, list-page rendering)
// where zod's form-validation rules (required/min/max/pattern) simply don't apply — mock
// functions do no validation of their own, so any value matching the field's TS type will do.
function buildTestSampleValue(field) {
  switch (field.type) {
    case 'email':
      return `${field.name}@example.com`
    case 'phone':
      return '9876543210'
    case 'number':
      return 42
    case 'boolean':
      return true
    case 'enum':
      return field.options[0]
    case 'date':
      return '2025-06-15T00:00:00.000Z'
    case 'string':
    default:
      return `Test ${field.label}`
  }
}

function decorateField(raw) {
  // Field keys are kept exactly as typed (snake_case, matching the real API's wire field
  // names) rather than forced through camelCase — only the derived PascalCase/UPPER_SNAKE
  // names below need conversion, and toWords() already splits on underscores correctly.
  const name = String(raw.name).trim()
  const label = raw.label || humanize(name)
  const field = { ...raw, name, label }
  field.tsType = tsTypeOf(field)
  field.zod = buildZodExpr(field)
  field.defaultValue = buildDefaultValue(field)
  field.control = controlOf(field)
  field.inputType = htmlInputType(field)
  field.upperSnake = upperSnake(name)
  field.pascal = pascalCase(name)
  field.mockSeedExpr = buildMockSeedExpr(field, 'index')
  field.testValidValue = buildTestValidValue(field)
  field.testInvalidValue = buildTestInvalidValue(field)
  field.testSampleValue = buildTestSampleValue(field)
  if (field.type === 'enum') {
    field.optionPairs = field.options.map((value) => ({ value, label: humanize(value), tone: guessTone(value) }))
  }
  return field
}

// Dynamic-mode default field set. The real fields live in the API-fetched form schema, not in
// Hygen (see buildModuleContext below) — Hygen isn't asked for the full field list in this mode.
// But the supportive files (domain type, columns' default sort, delete-confirmation text,
// list/view pages) still need *something* to shape themselves around, so this stands in for a
// per-field prompt with a single question instead: what is this record's real display-name
// field actually called on the backend? (e.g. `state_name`, `branch_name`). Getting that one
// name right up front matters — every real dynamic module built so far uses `<thing>_name`, not
// a bare `name`, and a wrong guess here silently breaks `sort_by` (the backend 400s on an unknown
// column) and shows blank text in delete dialogs/the view page until someone notices and
// hand-fixes it (see features/states and features/districts, which shipped with the wrong
// default and had to be corrected after the fact). `status` is still assumed unprompted — every
// module in this codebase has one, so that guess has never been wrong.
function buildDefaultDynamicFields(displayFieldName) {
  return [
    decorateField({ name: displayFieldName, type: 'string', required: true, min: 1 }),
    decorateField({ name: 'status', type: 'enum', required: true, options: ['active', 'inactive'] }),
  ]
}

async function promptField(prompter, index) {
  const { rawName } = await prompter.prompt({
    type: 'input',
    name: 'rawName',
    message: `Field #${index + 1} name (snake_case, matching the API's field name, e.g. unit_price)`,
    validate: (value) =>
      /^[a-z][a-z0-9_]*$/.test(value.trim()) ? true : 'Use lowercase letters/digits/underscores, starting with a letter',
  })

  const { type } = await prompter.prompt({
    type: 'select',
    name: 'type',
    message: `Field type for "${rawName.trim()}"`,
    choices: ['string', 'email', 'phone', 'number', 'boolean', 'enum', 'date'],
  })

  const field = { name: rawName, type }

  if (type !== 'boolean') {
    const { required } = await prompter.prompt({
      type: 'confirm',
      name: 'required',
      message: 'Is this field required?',
      initial: true,
    })
    field.required = required
  } else {
    field.required = false
  }

  if (type === 'string') {
    const { min } = await prompter.prompt({ type: 'input', name: 'min', message: 'Minimum length (blank = none)' })
    const { max } = await prompter.prompt({ type: 'input', name: 'max', message: 'Maximum length (blank = none)' })
    const { pattern } = await prompter.prompt({
      type: 'input',
      name: 'pattern',
      message: 'Custom regex pattern, no slashes (blank = none)',
    })
    if (min.trim()) field.min = Number(min.trim())
    if (max.trim()) field.max = Number(max.trim())
    if (pattern.trim()) field.pattern = pattern.trim()
  }

  if (type === 'number') {
    const { min } = await prompter.prompt({ type: 'input', name: 'min', message: 'Minimum value (blank = none)' })
    const { max } = await prompter.prompt({ type: 'input', name: 'max', message: 'Maximum value (blank = none)' })
    if (min.trim()) field.min = Number(min.trim())
    if (max.trim()) field.max = Number(max.trim())
  }

  if (type === 'enum') {
    const { optionsRaw } = await prompter.prompt({
      type: 'input',
      name: 'optionsRaw',
      message: 'Enum options, comma-separated (e.g. active,inactive,pending)',
      validate: (value) => (value.trim().length > 0 ? true : 'At least one option is required'),
    })
    field.options = optionsRaw
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean)
  }

  return decorateField(field)
}

// Non-interactive escape hatch for CLI/CI use and for testing this generator itself:
//   hygen module new --name Product --fields "name:string:required,min=2,max=80;price:number:required,min=0;status:enum:required,options=active|inactive"
// Each field is `name:type:rule,rule,...`, fields separated by `;`, rules comma-separated,
// `options=a|b|c` for enum. Falls back to full interactive prompting when --fields is absent.
function parseFieldsDsl(dsl) {
  return dsl
    .split(';')
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [name, type, rulesRaw = ''] = chunk.split(':').map((part) => part.trim())
      const field = { name, type: type || 'string', required: true }

      rulesRaw
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean)
        .forEach((rule) => {
          if (rule === 'optional') field.required = false
          else if (rule === 'required') field.required = true
          else if (rule.startsWith('min=')) field.min = Number(rule.slice(4))
          else if (rule.startsWith('max=')) field.max = Number(rule.slice(4))
          else if (rule.startsWith('pattern=')) field.pattern = rule.slice(8)
          else if (rule.startsWith('options=')) field.options = rule.slice(8).split('|').filter(Boolean)
        })

      return decorateField(field)
    })
}

function buildModuleContext(rawModuleName, fields, formMode) {
  const singular = pascalCase(rawModuleName)
  const plural = pascalCase(pluralize(singular))
  const singularCamel = camelCase(singular)
  const pluralCamel = camelCase(plural)
  const folder = kebabCase(plural)
  // 'dynamic' modules render Add/Edit via the existing server-driven form engine (src/forms/)
  // instead of anything generated here — `fields` is buildDefaultDynamicFields()'s placeholder
  // name+status pair in this mode, only there to give the domain type/columns/list/view
  // pages/search/sort a starting shape (see _templates/module/new/README.md). formId is the key
  // the form-schema endpoint is looked up by; matches the naming convention the existing demo
  // schemas already use (product-form, user-form).
  const isDynamicForm = formMode === 'dynamic'
  const formId = `${kebabCase(singular)}-form`
  const enumFields = fields.filter((f) => f.type === 'enum')
  // A StatusBadge only makes sense for an enum "status" field — one typed as string/boolean/etc.
  // wouldn't have the optionPairs a badge needs, so it's rendered as a plain field instead.
  const hasStatusField = fields.some((f) => f.name === 'status' && f.type === 'enum')
  const hasPhoneField = fields.some((f) => f.type === 'phone')
  const searchableFieldsList = fields.map((f) => `String(record.${f.name}).toLowerCase().includes(term)`).join(' || ')
  const idPrefix = singularCamel.slice(0, 3)
  const displayField = (fields.find((f) => f.type === 'string') || fields.find((f) => f.type === 'email') || fields[0] || { name: 'id' })
    .name
  const numberFields = fields.filter((f) => f.type === 'number')
  const singularUpper = upperSnake(singular)

  // Prefix each enum field's options-constant name with the module's own name (matching
  // features/users/constants.ts's USER_ROLE_OPTIONS/USER_STATUS_OPTIONS pattern) — a bare
  // STATUS_OPTIONS collides the moment a second module also has a "status" field.
  enumFields.forEach((field) => {
    field.optionsConstName = `${singularUpper}_${field.upperSnake}_OPTIONS`
  })

  return {
    displayField,
    singular,
    singularUpper,
    plural,
    singularCamel,
    pluralCamel,
    folder,
    isDynamicForm,
    formId,
    fields,
    enumFields,
    hasEnumFields: enumFields.length > 0,
    hasStatusField,
    hasPhoneField,
    hasNumberFields: numberFields.length > 0,
    hasBooleanFields: fields.some((f) => f.control === 'checkbox'),
    hasPlainInputFields: fields.some((f) => f.control === 'input'),
    numberFields,
    idPrefix,
    searchableFieldsList,
    displayFieldObj: fields.find((f) => f.name === displayField),
    hasDateFields: fields.some((f) => f.type === 'date'),
    // Gates the FormModal test's submit-flow assertion: a field with a custom regex `pattern`
    // has no safely-synthesizable valid value (see buildTestValidValue), so a guaranteed-valid
    // fill-and-submit test can't be generated for the whole form.
    hasUnsynthesizableField: fields.some((f) => f.testValidValue === null),
    // Gates the "shows a validation error on empty submit" test: enum fields default to their
    // first option and booleans are always valid, so if no string/email/phone/number field is
    // required, submitting the untouched form would actually succeed — nothing to assert.
    hasEnforcedRequiredField: fields.some((f) => f.required && ['string', 'email', 'phone', 'number'].includes(f.type)),
  }
}

module.exports = {
  prompt: async ({ prompter, args }) => {
    if (args && args.name) {
      const formModeArg = args['form-mode'] || args.formMode
      const formMode = formModeArg === 'dynamic' ? 'dynamic' : 'static'

      if (args.fields) {
        return buildModuleContext(args.name, parseFieldsDsl(args.fields), formMode)
      }

      // Dynamic mode doesn't need --fields at all (see buildDefaultDynamicFields) — only static
      // mode requires it on the non-interactive path. A static `--name` with no `--fields` falls
      // through to interactive field prompting below.
      if (formMode === 'dynamic') {
        const displayField = (args['display-field'] || args.displayField || `${snakeCase(args.name)}_name`).trim()
        return buildModuleContext(args.name, buildDefaultDynamicFields(displayField), formMode)
      }
    }

    const { rawModuleName } = (args && args.name) ? { rawModuleName: args.name } : await prompter.prompt({
      type: 'input',
      name: 'rawModuleName',
      message: 'Module name, singular (e.g. Product)',
      validate: (value) => (/^[a-zA-Z][a-zA-Z0-9\s_-]*$/.test(value.trim()) ? true : 'Use a plain word, e.g. Product'),
    })

    const { formMode } = await prompter.prompt({
      type: 'select',
      name: 'formMode',
      message: 'Form mode — static (fields hand-coded now) or dynamic (form fetched from the API at runtime)?',
      choices: ['static', 'dynamic'],
    })

    if (formMode === 'dynamic') {
      // Dynamic modules don't need Hygen to know the full field list — Add/Edit fetches its
      // schema from the API at runtime instead of being scaffolded here (see
      // _templates/module/new/README.md). But the supportive files still need to know the real
      // name of the field that represents this record in lists/dialogs, so ask for just that one
      // (defaulting to the "<module>_name" convention every real dynamic module so far follows)
      // rather than silently guessing a bare "name" that may not exist on the backend.
      const defaultDisplayField = `${snakeCase(rawModuleName)}_name`
      const { displayFieldName } = await prompter.prompt({
        type: 'input',
        name: 'displayFieldName',
        message: `Field name used as this record's display name in lists/dialogs (matches the real API field name, e.g. ${defaultDisplayField})`,
        initial: defaultDisplayField,
      })
      return buildModuleContext(rawModuleName, buildDefaultDynamicFields((displayFieldName || defaultDisplayField).trim()), formMode)
    }

    const fields = []
    let addAnother = true
    while (addAnother) {
      const field = await promptField(prompter, fields.length)
      fields.push(field)
      const { more } = await prompter.prompt({
        type: 'confirm',
        name: 'more',
        message: 'Add another field?',
        initial: fields.length < 2,
      })
      addAnother = more
    }

    return buildModuleContext(rawModuleName, fields, formMode)
  },
}
