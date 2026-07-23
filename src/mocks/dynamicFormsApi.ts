import type { DynamicFieldOption, DynamicFormSchema, DynamicOptionsSource } from '@/forms/dynamicFormTypes'

const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))

type MockProduct = {
  id: string
  productName: string
  category: 'Hot' | 'Cold'
  variants: Array<{ size: string; price: number }>
  description: string
  isOrganic: boolean
  roastLevel: string
  dietaryTags: string[]
  sweetness: number
  sku: string
}

const DEFAULT_PRODUCT_EXTRAS = {
  description: 'A fine blend',
  isOrganic: true,
  roastLevel: 'Medium',
  dietaryTags: ['vegan'] as string[],
  sweetness: 50,
  sku: 'SKU-1001',
}

const PRODUCTS_COOKIE_KEY = 'products-poc-cache'

function normalizeMockProduct(product: Partial<MockProduct> & { id: string }): MockProduct {
  return {
    id: product.id,
    productName: String(product.productName ?? ''),
    category: product.category === 'Cold' ? 'Cold' : 'Hot',
    variants: Array.isArray(product.variants) ? product.variants : [],
    description: String(product.description ?? DEFAULT_PRODUCT_EXTRAS.description),
    isOrganic: Boolean(product.isOrganic ?? DEFAULT_PRODUCT_EXTRAS.isOrganic),
    roastLevel: String(product.roastLevel ?? DEFAULT_PRODUCT_EXTRAS.roastLevel),
    dietaryTags: Array.isArray(product.dietaryTags) ? product.dietaryTags.map(String) : [...DEFAULT_PRODUCT_EXTRAS.dietaryTags],
    sweetness: Number(product.sweetness ?? DEFAULT_PRODUCT_EXTRAS.sweetness),
    sku: String(product.sku ?? DEFAULT_PRODUCT_EXTRAS.sku),
  }
}

function readProductsFromCookie(): Record<string, MockProduct> {
  if (typeof document === 'undefined') {
    return {}
  }

  const cookieValue = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${PRODUCTS_COOKIE_KEY}=`))

  if (!cookieValue) {
    return {}
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(cookieValue.split('=').slice(1).join('='))) as Record<string, Partial<MockProduct>>
    return Object.fromEntries(
      Object.entries(parsed).map(([id, product]) => [id, normalizeMockProduct({ ...product, id: product.id ?? id })]),
    )
  } catch {
    return {}
  }
}

function writeProductsToCookie(products: Record<string, MockProduct>) {
  if (typeof document === 'undefined') {
    return
  }

  document.cookie = `${PRODUCTS_COOKIE_KEY}=${encodeURIComponent(JSON.stringify(products))}; path=/; max-age=${60 * 60 * 24 * 7}`
}

const mockProducts: Record<string, MockProduct> = {
  'prod-1': {
    id: 'prod-1',
    productName: 'Signature Roast',
    category: 'Hot',
    variants: [{ size: 'M', price: 200 }],
    ...DEFAULT_PRODUCT_EXTRAS,
  },
  'prod-2': {
    id: 'prod-2',
    productName: 'Classic Latte',
    category: 'Hot',
    variants: [{ size: 'S', price: 100 }],
    ...DEFAULT_PRODUCT_EXTRAS,
  },
  'prod-3': {
    id: 'prod-3',
    productName: 'Iced Matcha',
    category: 'Cold',
    variants: [{ size: 'L', price: 300 }],
    ...DEFAULT_PRODUCT_EXTRAS,
  },
}

export function getMockProducts(): MockProduct[] {
  return Object.values(mockProducts)
}

function buildProductFormSchema(product?: MockProduct | null): DynamicFormSchema {
  return {
    formId: 'product-form',
    title: 'Product details',
    submitUrl: '/forms/products',
    className: 'form-product',
    fields: [
      {
        name: 'productName',
        id: 'product-form-product-name',
        className: 'field-product-name',
        inputClassName: 'input-product-name',
        label: 'Product name',
        type: 'text',
        placeholder: 'Signature Roast',
        value: product?.productName ?? '',
        validations: {
          required: true,
          minLength: 2,
          customErrorMessage: 'Product name is required',
        },
      },
      {
        name: 'description',
        id: 'product-form-description',
        className: 'field-description',
        inputClassName: 'input-description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Describe this product',
        value: product?.description ?? DEFAULT_PRODUCT_EXTRAS.description,
        validations: {
          required: true,
          minLength: 10,
          customErrorMessage: 'Description must be at least 10 characters',
        },
      },
      {
        name: 'category',
        id: 'product-form-category',
        className: 'field-category',
        inputClassName: 'input-category',
        label: 'Category',
        type: 'select',
        defaultValue: 'Hot',
        value: product?.category ?? 'Hot',
        options: [
          { label: 'Hot', value: 'Hot' },
          { label: 'Cold', value: 'Cold' },
        ],
        validations: {
          required: true,
          customErrorMessage: 'Please choose a category',
        },
      },
      {
        name: 'isOrganic',
        id: 'product-form-is-organic',
        className: 'field-is-organic',
        inputClassName: 'input-is-organic',
        label: 'Organic product',
        type: 'checkbox',
        value: product?.isOrganic ?? DEFAULT_PRODUCT_EXTRAS.isOrganic,
        validations: {
          required: true,
          customErrorMessage: 'Organic confirmation is required',
        },
      },
      {
        name: 'roastLevel',
        id: 'product-form-roast-level',
        className: 'field-roast-level',
        inputClassName: 'input-roast-level',
        label: 'Roast level',
        type: 'radio',
        value: product?.roastLevel ?? DEFAULT_PRODUCT_EXTRAS.roastLevel,
        options: [
          { label: 'Light', value: 'Light' },
          { label: 'Medium', value: 'Medium' },
          { label: 'Dark', value: 'Dark' },
        ],
        validations: {
          required: true,
          customErrorMessage: 'Please select a roast level',
        },
      },
      {
        name: 'dietaryTags',
        id: 'product-form-dietary-tags',
        className: 'field-dietary-tags',
        inputClassName: 'input-dietary-tags',
        label: 'Dietary tags',
        type: 'multi-select',
        value: product?.dietaryTags ?? [...DEFAULT_PRODUCT_EXTRAS.dietaryTags],
        options: [
          { label: 'Vegan', value: 'vegan' },
          { label: 'Gluten-Free', value: 'gluten-free' },
          { label: 'Nut-Free', value: 'nut-free' },
        ],
        validations: {
          required: true,
          customErrorMessage: 'Select at least one dietary tag',
        },
      },
      {
        name: 'sweetness',
        id: 'product-form-sweetness',
        className: 'field-sweetness',
        inputClassName: 'input-sweetness',
        label: 'Sweetness',
        type: 'range',
        value: product?.sweetness ?? DEFAULT_PRODUCT_EXTRAS.sweetness,
        validations: {
          required: true,
          min: 0,
          max: 100,
          customErrorMessage: 'Sweetness must be between 0 and 100',
        },
      },
      {
        name: 'sku',
        id: 'product-form-sku',
        className: 'field-sku',
        inputClassName: 'input-sku',
        label: 'SKU',
        type: 'text',
        placeholder: 'SKU-1234',
        value: product?.sku ?? DEFAULT_PRODUCT_EXTRAS.sku,
        validations: {
          required: true,
          patternKey: 'sku',
          messageKey: 'skuFormat',
        },
      },
      {
        name: 'variants',
        id: 'product-form-variants',
        className: 'field-variants',
        label: 'Variants',
        type: 'field-array',
        value: product?.variants ?? [],
        validations: {
          required: true,
          customErrorMessage: 'Add at least one variant',
        },
        subFields: [
          {
            name: 'size',
            id: 'product-form-variant-size',
            className: 'field-variant-size',
            inputClassName: 'input-variant-size',
            label: 'Size',
            type: 'text',
            placeholder: 'M',
            value: '',
            validations: {
              required: true,
              customErrorMessage: 'Size is required',
            },
          },
          {
            name: 'price',
            id: 'product-form-variant-price',
            className: 'field-variant-price',
            inputClassName: 'input-variant-price',
            label: 'Price',
            type: 'number',
            placeholder: '',
            value: 0,
            validations: {
              required: true,
              min: 0,
              customErrorMessage: 'Price is required',
            },
          },
        ],
      },
    ],
  }
}

const mockFormSchemas: Record<string, DynamicFormSchema> = {
  login: {
    formId: 'login',
    submitUrl: '/auth/login',
    className: 'form-login',
    fields: [
      {
        name: 'email',
        id: 'login-email',
        className: 'field-email',
        inputClassName: 'input-email',
        label: 'Email from dynamic form',
        type: 'text',
        placeholder: 'you@example.com',
        validations: {
          required: true,
          patternKey: 'email',
          messageKey: 'emailFormat',
        },
      },
      {
        name: 'password',
        id: 'login-password',
        className: 'field-password',
        inputClassName: 'input-password',
        label: 'Password',
        type: 'password',
        placeholder: '********',
        validations: {
          required: true,
          minLength: 6,
          customErrorMessage: 'Password is required',
        },
      },
    ],
  },
  profile: {
    formId: 'profile',
    title: 'Profile details',
    submitUrl: '/forms/profile',
    className: 'form-profile',
    fields: [
      {
        name: 'fullName',
        id: 'profile-full-name',
        className: 'field-full-name',
        inputClassName: 'input-full-name',
        label: 'Full name',
        type: 'text',
        placeholder: 'Jane Doe',
        validations: {
          required: true,
          minLength: 2,
          customErrorMessage: 'Full name is required',
        },
      },
      {
        name: 'age',
        id: 'profile-age',
        className: 'field-age',
        inputClassName: 'input-age',
        label: 'Age',
        type: 'number',
        placeholder: '30',
        defaultValue: 30,
        validations: {
          required: true,
          integer: true,
          min: 18,
          customErrorMessage: 'Please enter a valid age',
        },
      },
      {
        name: 'role',
        id: 'profile-role',
        className: 'field-role',
        inputClassName: 'input-role',
        label: 'Role',
        type: 'select',
        placeholder: 'Select a role',
        defaultValue: 'staff',
        options: [
          { label: 'Staff', value: 'staff' },
          { label: 'Manager', value: 'manager' },
          { label: 'Admin', value: 'admin' },
        ],
        validations: {
          required: true,
          customErrorMessage: 'Please choose a role',
        },
      },
    ],
  },
  'user-form': {
    formId: 'user-form',
    className: 'form-user',
    fields: [
      {
        name: 'name',
        id: 'user-form-name',
        className: 'field-name',
        inputClassName: 'input-name',
        label: 'Full name',
        type: 'text',
        placeholder: 'Jane Doe',
        validations: { required: true, minLength: 2, customErrorMessage: 'Name is required' },
      },
      {
        name: 'email',
        id: 'user-form-email',
        className: 'field-email',
        inputClassName: 'input-email',
        label: 'Email',
        type: 'text',
        placeholder: 'jane@example.com',
        validations: {
          required: true,
          patternKey: 'email',
          messageKey: 'emailFormat',
        },
      },
      {
        name: 'mobile',
        id: 'user-form-mobile',
        className: 'field-mobile',
        inputClassName: 'input-mobile',
        label: 'Mobile',
        type: 'text',
        placeholder: 'Enter mobile number',
        validations: {
          required: true,
          patternKey: 'mobile',
          messageKey: 'mobileFormat',
        },
      },
      {
        name: 'role_id',
        id: 'user-form-role',
        className: 'field-role',
        inputClassName: 'input-role',
        label: 'Role',
        type: 'select',
        defaultValue: '',
        options: [
          { label: 'Select a role', value: '' },
          { label: 'Admin', value: '1' },
          { label: 'Manager', value: '2' },
          { label: 'Staff', value: '3' },
        ],
        validations: { required: true, customErrorMessage: 'Please select a role' },
      },
      {
        name: 'status',
        id: 'user-form-status',
        className: 'field-status',
        inputClassName: 'input-status',
        label: 'Status',
        type: 'select',
        defaultValue: 'active',
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
        ],
        validations: { required: true },
      },
    ],
  },
  // Real module (src/features/branches), not a POC/demo form. Country/state/city are plain
  // selects with placeholder options for now — there's no location-data API yet, so these
  // can't cascade (state depends on country, city depends on state). Replace the options lists
  // below once that API exists; parent_id is the same story until a "list branches" lookup for
  // the dropdown is wired in.
  'branch-form': {
    formId: 'branch-form',
    title: 'Branch details',
    submitUrl: '/forms/branches',
    className: 'form-branch',
    fields: [

      {
        name: 'branch_name',
        id: 'branch-form-branch-name',
        className: 'field-branch-name',
        inputClassName: 'input-branch-name',
        label: 'Branch name',
        type: 'text',
        placeholder: 'Andheri East',
        validations: {
          required: true,
          minLength: 3,
          maxLength: 40
        },
      },
      {
        name: 'branch_code',
        id: 'branch-form-branch-code',
        className: 'field-branch-code',
        inputClassName: 'input-branch-code',
        label: 'Branch code',
        type: 'text',
        placeholder: 'BR-001',
        validations: {
          required: true
        },
      },
      {
        name: 'country',
        id: 'branch-form-country',
        className: 'field-country',
        inputClassName: 'input-country',
        label: 'Country',
        type: 'select',
        defaultValue: '',
        placeholder: 'Type to search countries…',
        // Searchable typeahead — options re-fetched with ?search= as the user types (debounced).
        optionsSource: { url: '/locations/countries', searchable: true, searchParam: 'search' },
        validations: {
          required: true
        },
      },
      {
        name: 'state',
        id: 'branch-form-state',
        className: 'field-state',
        inputClassName: 'input-state',
        label: 'State',
        type: 'select',
        defaultValue: '',
        // Options depend on `country` — re-fetched (and this field reset) whenever it changes.
        // See fetchFieldOptions()/MOCK_STATES_BY_COUNTRY below for the placeholder data.
        optionsSource: { url: '/locations/states', dependsOn: 'country' },
        validations: {
          required: true
        },
      },
      {
        name: 'city',
        id: 'branch-form-city',
        className: 'field-city',
        inputClassName: 'input-city',
        label: 'City',
        type: 'select',
        defaultValue: '',
        optionsSource: { url: '/locations/cities', dependsOn: 'state' },
        validations: {
          required: true
        },
      },
      {
        name: 'locality',
        id: 'branch-form-locality',
        className: 'field-locality',
        inputClassName: 'input-locality',
        label: 'Locality',
        type: 'text',
        placeholder: 'Andheri East',
        validations: {
          maxLength: 100,
        },
      },
      {
        name: 'address',
        id: 'branch-form-address',
        className: 'field-address',
        inputClassName: 'input-address',
        label: 'Address',
        type: 'textarea',
        placeholder: '123 Coffee Street',
        validations: {
          required: true,
          minLength: 1
        },
      },
      {
        name: 'contact_no',
        id: 'branch-form-contact-no',
        className: 'field-contact-no',
        inputClassName: 'input-contact-no',
        label: 'Contact number',
        type: 'text',
        placeholder: '9876543210',
        validations: {
          required: true,
          patternKey: 'phone',
          messageKey: 'phoneFormat',
        },
      },
      {
        name: 'status',
        id: 'branch-form-status',
        className: 'field-status',
        inputClassName: 'input-status',
        label: 'Status',
        type: 'select',
        defaultValue: 'active',
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
        ],
        validations: {
          required: true
        },
      },
    ],
  },
  'state-form': {
    "formId": "manage-state-form",
    "title": "State details",
    "submitUrl": "/forms/manage-states",
    "className": "form-manage-state",
    "fields": [
      {
        "name": "state_name",
        "id": "manage-state-form-state-name",
        "label": "State name",
        "type": "text",
        "placeholder": "Maharashtra",
        "validations": {
          "required": true,
          "minLength": 2,
          "maxLength": 100,
          "customErrorMessage": "State name is required"
        }
      },
      {
        "name": "state_code",
        "id": "manage-state-form-state-code",
        "label": "State code",
        "type": "text",
        "placeholder": "MH",
        "validations": {
          "required": true,
          "pattern": "^[A-Z]{2,3}$",
          "customErrorMessage": "State code must be 2-3 uppercase letters"
        }
      },
      {
        "name": "gst_state_code",
        "id": "manage-state-form-gst-state-code",
        "label": "GST state code",
        "type": "text",
        "placeholder": "27",
        "validations": {
          "required": true,
          "pattern": "^[0-9]{2}$",
          "customErrorMessage": "GST state code must be exactly 2 digits"
        }
      },
      {
        "name": "status",
        "id": "manage-state-form-status",
        "label": "Status",
        "type": "select",
        "defaultValue": "active",
        "options": [
          { "label": "Active", "value": "active" },
          { "label": "Inactive", "value": "inactive" }
        ],
        "validations": {
          "required": true,
          "customErrorMessage": "Please select a status"
        }
      }
    ]
  },

  'district-form': {
    "formId": "manage-district-form",
    "title": "District details",
    "submitUrl": "/forms/manage-districts",
    "className": "form-manage-district",
    "fields": [
      {
        "name": "district_name",
        "id": "manage-district-form-district-name",
        "label": "District name",
        "type": "text",
        "placeholder": "Indore",
        "validations": {
          "required": true,
          "minLength": 2,
          "maxLength": 100,
          "customErrorMessage": "State name is required"
        }
      },
      {
        name: 'state_id',
        id: 'district-form-state',
        className: 'field-state',
        inputClassName: 'input-state',
        label: 'State',
        type: 'select',
        defaultValue: '',
        showInList: false,
        // Real endpoint (not in dynamicFieldOptionsService.ts's MOCK_ONLY_URLS), so this hits
        // the actual /states/active/list API. labelKey/valueKey are required here because a
        // State record comes back as { id, state_name, ... }, not { value, label }.
        optionsSource: { url: '/states/active/list', labelKey: 'state_name', valueKey: 'id' },
        validations: {
          required: true
        },
      },

      {
        "name": "status",
        "id": "manage-district-form-status",
        "label": "Status",
        "type": "select",
        "defaultValue": "active",
        "options": [
          { "label": "Active", "value": "active" },
          { "label": "Inactive", "value": "inactive" }
        ],
        "validations": {
          "required": true,
          "customErrorMessage": "Please select a status"
        }
      }
    ]
  },

  'city-form': {
    "formId": "manage-city-form",
    "title": "City details",
    "submitUrl": "/forms/manage-cities",
    "className": "form-manage-city",
    "fields": [
      {
        "name": "name",
        "id": "manage-city-form-city-name",
        "label": "City name",
        "type": "text",
        "placeholder": "Indore",
        "validations": {
          "required": true,
          "minLength": 2,
          "maxLength": 100,
          "customErrorMessage": "City name is required"
        }
      },
      {
        name: 'district_id',
        id: 'district-form-district',
        className: 'field-district',
        inputClassName: 'input-district',
        label: 'District',
        type: 'select',
        defaultValue: '',
        showInList: false,
        // Real endpoint (not in dynamicFieldOptionsService.ts's MOCK_ONLY_URLS), so this hits
        // the actual /states/active/list API. labelKey/valueKey are required here because a
        // State record comes back as { id, state_name, ... }, not { value, label }.
        optionsSource: { url: '/districts/active/list', labelKey: 'district_name', valueKey: 'id' },
        validations: {
          required: true
        },
      },

      {
        "name": "status",
        "id": "manage-city-form-status",
        "label": "Status",
        "type": "select",
        "defaultValue": "active",
        "options": [
          { "label": "Active", "value": "active" },
          { "label": "Inactive", "value": "inactive" }
        ],
        "validations": {
          "required": true,
          "customErrorMessage": "Please select a status"
        }
      }
    ]
  },



  'product-form': buildProductFormSchema(),
  'feedback-form': {
    formId: 'feedback-form',
    title: 'Customer feedback',
    submitUrl: '/forms/feedback',
    className: 'form-feedback',
    fields: [
      {
        name: 'customerName',
        id: 'feedback-customer-name',
        className: 'field-customer-name',
        inputClassName: 'input-customer-name',
        label: 'Customer name 1',
        type: 'text',
        placeholder: 'RWS',
        validations: {
          required: true,
          minLength: 2,
          customErrorMessage: 'Name is required',
        },
      },
      {
        name: 'email',
        id: 'feedback-email',
        className: 'field-email',
        inputClassName: 'input-email',
        label: 'Email',
        type: 'text',
        placeholder: 'alex@example.com',
        validations: {
          required: true,
          patternKey: 'email',
          messageKey: 'emailFormat',
        },
      },
      {
        name: 'visitType',
        id: 'feedback-visit-type',
        className: 'field-visit-type',
        inputClassName: 'input-visit-type',
        label: 'Visit type',
        type: 'radio',
        value: 'dine-in',
        options: [
          { label: 'Dine-in', value: 'dine-in' },
          { label: 'Takeaway', value: 'takeaway' },
          { label: 'Delivery', value: 'delivery' },
        ],
        validations: {
          required: true,
          customErrorMessage: 'Please select a visit type',
        },
      },
      {
        name: 'rating',
        id: 'feedback-rating',
        className: 'field-rating',
        inputClassName: 'input-rating',
        label: 'Overall rating',
        type: 'range',
        value: 8,
        validations: {
          required: true,
          min: 1,
          max: 10,
          customErrorMessage: 'Rating must be between 1 and 10',
        },
      },
      {
        name: 'comments',
        id: 'feedback-comments',
        className: 'field-comments',
        inputClassName: 'input-comments',
        label: 'Comments',
        type: 'textarea',
        placeholder: 'Tell us more about your visit',
        validations: {
          required: true,
          minLength: 10,
          customErrorMessage: 'Please share at least 10 characters of feedback',
        },
      },
      {
        name: 'allowFollowUp',
        id: 'feedback-allow-follow-up',
        className: 'field-allow-follow-up',
        inputClassName: 'input-allow-follow-up',
        label: 'Happy to be contacted for follow-up',
        type: 'checkbox',
        value: false,
      },
      {
        name: 'isOpen247',
        id: 'branch-form-is-open-247',
        className: 'field-is-open-247',
        inputClassName: 'input-is-open-247',
        label: 'Is Open 24/7',
        type: 'switch',
        defaultValue: false,
      },
      {
        name: 'capacity',
        id: 'branch-form-capacity',
        className: 'field-capacity',
        inputClassName: 'input-capacity',
        label: 'Number of Tables',
        type: 'stepper',
        placeholder: '1',
        validations: {
          min: 1,
          max: 100,
        },
      },
      {
        name: 'storeLogo',
        id: 'branch-form-store-logo',
        className: 'field-store-logo',
        inputClassName: 'input-store-logo',
        label: 'Upload Store Logo',
        type: 'file',
        placeholder: 'Drag & drop a logo here, or click to browse',
      },
      {
        name: 'amenities',
        id: 'branch-form-amenities',
        className: 'field-amenities',
        inputClassName: 'input-amenities',
        label: 'Amenities',
        type: 'multi-select',
        options: [
          { label: 'WiFi', value: 'wifi' },
          { label: 'Parking', value: 'parking' },
          { label: 'Wheelchair Access', value: 'wheelchair_access' },
        ],
      },
      {
        name: 'foodQuality',
        id: 'feedback-food-quality',
        className: 'field-food-quality',
        inputClassName: 'input-food-quality',
        label: 'How would you rate your meal today?',
        type: 'rating',
        validations: {
          required: true,
        },
      },
    ],
  },
  'supplier-form': {
    formId: 'supplier-form',
    title: 'Supplier onboarding',
    submitUrl: '/forms/suppliers',
    className: 'form-supplier',
    fields: [
      {
        name: 'companyName',
        id: 'supplier-company-name',
        className: 'field-company-name',
        inputClassName: 'input-company-name',
        label: 'Company name',
        type: 'text',
        placeholder: 'Bean Co.',
        validations: {
          required: true,
          minLength: 2,
          customErrorMessage: 'Company name is required',
        },
      },
      {
        name: 'gstin',
        id: 'supplier-gstin',
        className: 'field-gstin',
        inputClassName: 'input-gstin',
        label: 'GSTIN',
        type: 'text',
        placeholder: '22AAAAA0000A1Z5',
        validations: {
          required: true,
          patternKey: 'gstin',
          messageKey: 'gstinFormat',
        },
      },
      {
        name: 'category',
        id: 'supplier-category',
        className: 'field-category',
        inputClassName: 'input-category',
        label: 'Supply category',
        type: 'select',
        defaultValue: 'coffee',
        value: 'coffee',
        options: [
          { label: 'Coffee beans', value: 'coffee' },
          { label: 'Dairy', value: 'dairy' },
          { label: 'Bakery', value: 'bakery' },
          { label: 'Packaging', value: 'packaging' },
        ],
        validations: {
          required: true,
          customErrorMessage: 'Please choose a category',
        },
      },
      {
        name: 'leadTimeDays',
        id: 'supplier-lead-time',
        className: 'field-lead-time',
        inputClassName: 'input-lead-time',
        label: 'Lead time (days)',
        type: 'number',
        placeholder: '7',
        value: 7,
        validations: {
          required: true,
          integer: true,
          min: 1,
          max: 90,
          customErrorMessage: 'Lead time must be between 1 and 90 days',
        },
      },
      {
        name: 'isPreferred',
        id: 'supplier-is-preferred',
        className: 'field-is-preferred',
        inputClassName: 'input-is-preferred',
        label: 'Preferred supplier',
        type: 'checkbox',
        value: false,
      },
      {
        name: 'contacts',
        id: 'supplier-contacts',
        className: 'field-contacts',
        label: 'Contacts',
        type: 'field-array',
        value: [],
        validations: {
          required: true,
          customErrorMessage: 'Add at least one contact',
        },
        subFields: [
          {
            name: 'name',
            id: 'supplier-contact-name',
            className: 'field-contact-name',
            inputClassName: 'input-contact-name',
            label: 'Name',
            type: 'text',
            placeholder: 'Priya Shah',
            value: '',
            validations: {
              required: true,
              customErrorMessage: 'Contact name is required',
            },
          },
          {
            name: 'phone',
            id: 'supplier-contact-phone',
            className: 'field-contact-phone',
            inputClassName: 'input-contact-phone',
            label: 'Phone',
            type: 'text',
            placeholder: '9876543210',
            value: '',
            validations: {
              required: true,
              patternKey: 'phone',
              messageKey: 'phoneFormat',
            },
          },
        ],
      },
    ],
  },
  'event-booking-form': {
    formId: 'event-booking-form',
    title: 'Cafe event booking',
    submitUrl: '/forms/events',
    className: 'form-event-booking',
    fields: [
      {
        name: 'eventName',
        id: 'event-booking-name',
        className: 'field-event-name',
        inputClassName: 'input-event-name',
        label: 'Event name',
        type: 'text',
        placeholder: 'Team offsite brunch',
        validations: {
          required: true,
          minLength: 3
        },
      },
      {
        name: 'organizerEmail',
        id: 'event-booking-organizer-email',
        className: 'field-organizer-email',
        inputClassName: 'input-organizer-email',
        label: 'Organizer email',
        type: 'text',
        placeholder: 'team@company.com',
        validations: {
          required: true,
          patternKey: 'email',
          messageKey: 'emailFormat',
        },
      },
      {
        name: 'slot',
        id: 'event-booking-slot',
        className: 'field-slot',
        inputClassName: 'input-slot',
        label: 'Preferred slot',
        type: 'radio',
        value: 'morning',
        options: [
          { label: 'Morning', value: 'morning' },
          { label: 'Afternoon', value: 'afternoon' },
          { label: 'Evening', value: 'evening' },
        ],
        validations: {
          required: true,
          customErrorMessage: 'Please choose a slot',
        },
      },
      {
        name: 'guestCount',
        id: 'event-booking-guest-count',
        className: 'field-guest-count',
        inputClassName: 'input-guest-count',
        label: 'Guest count',
        type: 'number',
        placeholder: '20',
        value: 10,
        validations: {
          required: true,
          integer: true,
          min: 5,
          max: 100,
          customErrorMessage: 'Guest count must be between 5 and 100',
        },
      },
      {
        name: 'packageType',
        id: 'event-booking-package',
        className: 'field-package',
        inputClassName: 'input-package',
        label: 'Package',
        type: 'select',
        defaultValue: 'standard',
        value: 'standard',
        options: [
          { label: 'Standard', value: 'standard' },
          { label: 'Premium', value: 'premium' },
          { label: 'Custom', value: 'custom' },
        ],
        validations: {
          required: true,
          customErrorMessage: 'Please choose a package',
        },
      },
      {
        name: 'addOns',
        id: 'event-booking-add-ons',
        className: 'field-add-ons',
        inputClassName: 'input-add-ons',
        label: 'Add-ons',
        type: 'multi-select',
        value: [],
        options: [
          { label: 'Live barista', value: 'barista' },
          { label: 'Dessert bar', value: 'dessert' },
          { label: 'AV setup', value: 'av' },
        ],
      },
      {
        name: 'budgetFlexibility',
        id: 'event-booking-budget',
        className: 'field-budget',
        inputClassName: 'input-budget',
        label: 'Budget flexibility',
        type: 'range',
        value: 50,
        validations: {
          min: 0,
          max: 100,
        },
      },
      {
        name: 'notes',
        id: 'event-booking-notes',
        className: 'field-notes',
        inputClassName: 'input-notes',
        label: 'Special requests',
        type: 'textarea',
        placeholder: 'Dietary notes, setup preferencesΓÇª',
        validations: {
          maxLength: 500,
        },
      },
      {
        name: 'agreeTerms',
        id: 'event-booking-agree-terms',
        className: 'field-agree-terms',
        inputClassName: 'input-agree-terms',
        label: 'I agree to the booking terms',
        type: 'checkbox',
        value: false,
        validations: {
          required: true,
          customErrorMessage: 'You must agree to the booking terms',
        },
      },
    ],
  },
}

const productStore = readProductsFromCookie()
Object.assign(mockProducts, productStore)

export async function fetchFormSchema(formId: string, entityId?: string): Promise<DynamicFormSchema> {
  await delay(250)

  if (formId === 'product-form') {
    return buildProductFormSchema(entityId ? mockProducts[entityId] : null)
  }

  const schema = mockFormSchemas[formId]
  if (!schema) {
    throw new Error(`Form schema not found for ${formId}`)
  }

  return schema
}

// Placeholder reference data for optionsSource-backed fields (see 'branch-form' above) — there's
// no real location-data API yet. Keyed by the parent's *value*, mirroring how the real endpoint
// would be called: GET /locations/states?country=India.
const MOCK_COUNTRIES: DynamicFieldOption[] = [
  { label: 'India', value: 'India' },
  { label: 'United States', value: 'United States' },
  { label: 'United Kingdom', value: 'United Kingdom' },
  { label: 'Australia', value: 'Australia' },
  { label: 'Canada', value: 'Canada' },
  { label: 'Germany', value: 'Germany' },
  { label: 'France', value: 'France' },
  { label: 'Japan', value: 'Japan' },
  { label: 'Singapore', value: 'Singapore' },
  { label: 'United Arab Emirates', value: 'United Arab Emirates' },
]

const MOCK_STATES_BY_COUNTRY: Record<string, DynamicFieldOption[]> = {
  India: [
    { label: 'Maharashtra', value: 'Maharashtra' },
    { label: 'Karnataka', value: 'Karnataka' },
    { label: 'Delhi', value: 'Delhi' },
  ],
  'United States': [
    { label: 'California', value: 'California' },
    { label: 'New York', value: 'New York' },
  ],
  'United Kingdom': [{ label: 'England', value: 'England' }],
  Australia: [{ label: 'New South Wales', value: 'New South Wales' }],
  Canada: [{ label: 'Ontario', value: 'Ontario' }],
  Germany: [{ label: 'Bavaria', value: 'Bavaria' }],
  France: [{ label: 'Île-de-France', value: 'Île-de-France' }],
  Japan: [{ label: 'Tokyo', value: 'Tokyo' }],
  Singapore: [{ label: 'Central Region', value: 'Central Region' }],
  'United Arab Emirates': [{ label: 'Dubai', value: 'Dubai' }],
}

const MOCK_CITIES_BY_STATE: Record<string, DynamicFieldOption[]> = {
  Maharashtra: [
    { label: 'Mumbai', value: 'Mumbai' },
    { label: 'Pune', value: 'Pune' },
  ],
  Karnataka: [{ label: 'Bengaluru', value: 'Bengaluru' }],
  Delhi: [{ label: 'New Delhi', value: 'New Delhi' }],
  California: [{ label: 'San Francisco', value: 'San Francisco' }],
  'New York': [{ label: 'New York City', value: 'New York City' }],
  England: [{ label: 'London', value: 'London' }],
  'New South Wales': [{ label: 'Sydney', value: 'Sydney' }],
  Ontario: [{ label: 'Toronto', value: 'Toronto' }],
  Bavaria: [{ label: 'Munich', value: 'Munich' }],
  'Île-de-France': [{ label: 'Paris', value: 'Paris' }],
  Tokyo: [{ label: 'Tokyo', value: 'Tokyo' }],
  'Central Region': [{ label: 'Singapore', value: 'Singapore' }],
  Dubai: [{ label: 'Dubai', value: 'Dubai' }],
}

/** Mock counterpart of services/dynamicFieldOptionsService.ts's `fetchFieldOptions`. */
export async function fetchFieldOptions(
  source: DynamicOptionsSource,
  dependsOnValue?: unknown,
  searchQuery?: string,
): Promise<DynamicFieldOption[]> {
  await delay(250)

  const search = searchQuery?.trim().toLowerCase() ?? ''

  if (source.url === '/locations/countries') {
    if (!search) {
      return MOCK_COUNTRIES
    }
    return MOCK_COUNTRIES.filter(
      (option) => option.label.toLowerCase().includes(search) || option.value.toLowerCase().includes(search),
    )
  }
  if (source.url === '/locations/states') {
    return dependsOnValue ? (MOCK_STATES_BY_COUNTRY[String(dependsOnValue)] ?? []) : []
  }
  if (source.url === '/locations/cities') {
    return dependsOnValue ? (MOCK_CITIES_BY_STATE[String(dependsOnValue)] ?? []) : []
  }

  return []
}

export async function submitProductForm(payload: Record<string, unknown> & { id?: string }) {
  await delay(250)

  const values = (payload.values as Record<string, unknown> | undefined) ?? {}
  const productId = typeof payload.id === 'string' && payload.id ? payload.id : `prod-${Date.now()}`

  const dietaryTags = Array.isArray(values.dietaryTags)
    ? values.dietaryTags.map((tag) => String(tag))
    : typeof values.dietaryTags === 'string' && values.dietaryTags
      ? [String(values.dietaryTags)]
      : []

  const product: MockProduct = {
    id: productId,
    productName: String(values.productName ?? ''),
    category: (values.category as MockProduct['category']) ?? 'Hot',
    description: String(values.description ?? ''),
    isOrganic: Boolean(values.isOrganic),
    roastLevel: String(values.roastLevel ?? DEFAULT_PRODUCT_EXTRAS.roastLevel),
    dietaryTags,
    sweetness: Number(values.sweetness ?? DEFAULT_PRODUCT_EXTRAS.sweetness),
    sku: String(values.sku ?? ''),
    variants: Array.isArray(values.variants)
      ? values.variants.map((variant) => ({
        size: String((variant as Record<string, unknown>).size ?? ''),
        price: Number((variant as Record<string, unknown>).price ?? 0),
      }))
      : [],
  }

  mockProducts[product.id] = product
  writeProductsToCookie(mockProducts)

  return { success: true, product }
}

export type DemoFormMeta = {
  formId: string
  title: string
  description: string
}

const DEMO_FORM_CATALOG: DemoFormMeta[] = [
  {
    formId: 'feedback-form',
    title: 'Customer feedback',
    description: 'Radio, range, multi-select, textarea, and optional checkbox follow-up.',
  },
  {
    formId: 'supplier-form',
    title: 'Supplier onboarding',
    description: 'GSTIN regex, select, number bounds, and a contacts field-array.',
  },
  {
    formId: 'event-booking-form',
    title: 'Cafe event booking',
    description: 'Required checkbox terms, packages, add-ons, and budget range.',
  },
  {
    formId: 'branch-form',
    title: 'Branch details',
    description: 'Searchable country typeahead plus dependent state/city API selects.',
  },
]

const FORM_SUBMISSIONS_COOKIE_KEY = 'dynamic-forms-poc-cache'

type FormSubmission = Record<string, unknown> & { id: string }

function readFormSubmissionsFromCookie(): Record<string, FormSubmission[]> {
  if (typeof document === 'undefined') {
    return {}
  }

  const cookieValue = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${FORM_SUBMISSIONS_COOKIE_KEY}=`))

  if (!cookieValue) {
    return {}
  }

  try {
    return JSON.parse(decodeURIComponent(cookieValue.split('=').slice(1).join('='))) as Record<string, FormSubmission[]>
  } catch {
    return {}
  }
}

function writeFormSubmissionsToCookie(submissions: Record<string, FormSubmission[]>) {
  if (typeof document === 'undefined') {
    return
  }

  document.cookie = `${FORM_SUBMISSIONS_COOKIE_KEY}=${encodeURIComponent(JSON.stringify(submissions))}; path=/; max-age=${60 * 60 * 24 * 7}`
}

const formSubmissionStore = readFormSubmissionsFromCookie()

export function getDemoFormCatalog(): DemoFormMeta[] {
  return DEMO_FORM_CATALOG
}

export function getFormSubmissions(formId: string): FormSubmission[] {
  return formSubmissionStore[formId] ?? []
}

export async function submitDynamicForm(payload: Record<string, unknown> & { formId: string; id?: string }) {
  await delay(250)

  const formId = payload.formId
  const values = (payload.values as Record<string, unknown> | undefined) ?? {}
  const submissionId = typeof payload.id === 'string' && payload.id ? payload.id : `${formId}-${Date.now()}`

  const submission: FormSubmission = {
    id: submissionId,
    ...values,
  }

  const existing = formSubmissionStore[formId] ?? []
  const index = existing.findIndex((item) => item.id === submissionId)
  if (index >= 0) {
    existing[index] = submission
  } else {
    existing.unshift(submission)
  }

  formSubmissionStore[formId] = existing
  writeFormSubmissionsToCookie(formSubmissionStore)

  return { success: true, submission }
}

