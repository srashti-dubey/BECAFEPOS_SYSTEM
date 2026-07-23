import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'
import { PageHeader } from '@/components/shared/PageHeader'
import { TestDynamicProductModal } from '@/features/demo-forms/components/TestDynamicProductModal'
import { useProductsQuery } from '@/features/products/hooks'
import type { Product } from '@/features/products/types'
import { ROUTES } from '@/constants/routes'

const HIDDEN_PRODUCT_KEYS = new Set(['id', 'productName'])

function formatFieldLabel(key: string): string {
  const withSpaces = key.replace(/([A-Z])/g, ' $1').trim()
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).toLowerCase()
}

function isVariantLike(item: unknown): item is { size: unknown; price: unknown } {
  return typeof item === 'object' && item !== null && 'size' in item && 'price' in item
}

function renderStringChips(values: string[]): ReactNode {
  return (
    <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.35rem' }}>
      {values.map((tag) => (
        <span
          key={tag}
          style={{
            display: 'inline-block',
            padding: '0.15rem 0.55rem',
            borderRadius: '999px',
            background: '#f3f4f6',
            border: '1px solid #e5e7eb',
            fontSize: '0.8rem',
          }}
        >
          {tag}
        </span>
      ))}
    </span>
  )
}

function renderDynamicValue(value: unknown): ReactNode {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return value
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '—'
    }

    if (value.every((item) => typeof item === 'string')) {
      return renderStringChips(value)
    }

    if (value.every(isVariantLike)) {
      return value.map((variant) => `${String(variant.size)} (₹${Number(variant.price)})`).join(', ')
    }

    return JSON.stringify(value)
  }

  if (value == null) {
    return '—'
  }

  return String(value)
}

function ProductFieldRows({ product }: { product: Product }) {
  const entries = Object.entries(product).filter(([key]) => !HIDDEN_PRODUCT_KEYS.has(key))

  return (
    <>
      {entries.map(([key, value]) => (
        <p key={key} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'baseline' }}>
          <span>{formatFieldLabel(key)}:</span>
          <span>{renderDynamicValue(value)}</span>
        </p>
      ))}
    </>
  )
}

export default function TestDynamicProductsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const { data: products = [] } = useProductsQuery()

  const productCards = useMemo(() => products, [products])

  return (
    <div>
      <PageHeader
        title="Test Dynamic Products"
        description="Dynamic form engine PoC: product schema with field-array variants and SDUI-style display rendering."
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to={ROUTES.testDynamicForms}>
              <Button variant="secondary" type="button">
                Test Dynamic Forms
              </Button>
            </Link>
            <Button
              onClick={() => {
                setSelectedProduct(null)
                setIsModalOpen(true)
              }}
            >
              Add Product
            </Button>
          </div>
        }
      />

      <Card>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {productCards.map((product) => (
            <div key={product.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem' }}>
              <h3 style={{ margin: 0 }}>{product.productName}</h3>
              <ProductFieldRows product={product} />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSelectedProduct(product)
                  setIsModalOpen(true)
                }}
              >
                Edit
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <TestDynamicProductModal
        open={isModalOpen}
        product={selectedProduct}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedProduct(null)
        }}
      />
    </div>
  )
}
