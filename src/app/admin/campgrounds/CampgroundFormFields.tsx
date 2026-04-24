'use client'

import Link from 'next/link'
import type { ChangeEvent } from 'react'
import type { CampgroundFormValues } from './campgroundFormValidation'

type Props = {
  form: CampgroundFormValues
  loading: boolean
  cancelHref: string
  submitLabel: string
  loadingLabel: string
  onChange: (field: keyof CampgroundFormValues, value: string) => void
}

export default function CampgroundFormFields({
  form,
  loading,
  cancelHref,
  submitLabel,
  loadingLabel,
  onChange,
}: Props) {
  const update =
    (field: keyof CampgroundFormValues) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      onChange(field, e.target.value)
    }

  return (
    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
      <div className="sm:col-span-2">
        <label htmlFor="name" className="form-label">Campground Name</label>
        <input
          id="name"
          name="name"
          className="form-input"
          value={form.name}
          onChange={update('name')}
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="price" className="form-label">Price per Night (฿)</label>
        <input
          id="price"
          name="price"
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          className="form-input"
          value={form.price}
          onChange={update('price')}
          placeholder="e.g. 500"
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="picture" className="form-label">Picture URL</label>
        <input
          id="picture"
          name="picture"
          type="url"
          className="form-input"
          value={form.picture}
          onChange={update('picture')}
          placeholder="https://"
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="address" className="form-label">Address</label>
        <input
          id="address"
          name="address"
          className="form-input"
          value={form.address}
          onChange={update('address')}
        />
      </div>

      <div>
        <label htmlFor="district" className="form-label">District</label>
        <input
          id="district"
          name="district"
          className="form-input"
          value={form.district}
          onChange={update('district')}
        />
      </div>

      <div>
        <label htmlFor="province" className="form-label">Province</label>
        <input
          id="province"
          name="province"
          className="form-input"
          value={form.province}
          onChange={update('province')}
        />
      </div>

      <div>
        <label htmlFor="region" className="form-label">Region</label>
        <input
          id="region"
          name="region"
          className="form-input"
          value={form.region}
          onChange={update('region')}
        />
      </div>

      <div>
        <label htmlFor="postalcode" className="form-label">Postal Code</label>
        <input
          id="postalcode"
          name="postalcode"
          inputMode="numeric"
          className="form-input"
          value={form.postalcode}
          onChange={update('postalcode')}
        />
      </div>

      <div>
        <label htmlFor="tel" className="form-label">Phone Number</label>
        <input
          id="tel"
          name="tel"
          type="tel"
          inputMode="tel"
          className="form-input"
          value={form.tel}
          onChange={update('tel')}
          placeholder="0812345678"
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:items-end mt-2 sm:mt-0">
        <Link
          href={cancelHref}
          className="btn-secondary h-[42px] px-6 flex items-center justify-center shrink-0"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary h-[42px] px-8 flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? loadingLabel : submitLabel}
        </button>
      </div>
    </div>
  )
}
