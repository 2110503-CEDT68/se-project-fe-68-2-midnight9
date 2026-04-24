export type CampgroundFormValues = {
  name: string
  price: string
  picture: string
  address: string
  district: string
  province: string
  region: string
  tel: string
  postalcode: string
}

export function createEmptyCampgroundForm(): CampgroundFormValues {
  return {
    name: '',
    price: '',
    picture: '',
    address: '',
    district: '',
    province: '',
    region: '',
    tel: '',
    postalcode: '',
  }
}

export function campgroundToForm(campground: any): CampgroundFormValues {
  return {
    name: campground?.name ?? '',
    price: campground?.price !== undefined && campground?.price !== null ? String(campground.price) : '',
    picture: campground?.picture ?? '',
    address: campground?.address ?? '',
    district: campground?.district ?? '',
    province: campground?.province ?? '',
    region: campground?.region ?? '',
    tel: campground?.tel ?? '',
    postalcode: campground?.postalcode ?? '',
  }
}

export function trimCampgroundForm(form: CampgroundFormValues): CampgroundFormValues {
  return {
    name: form.name.trim(),
    price: form.price.trim(),
    picture: form.picture.trim(),
    address: form.address.trim(),
    district: form.district.trim(),
    province: form.province.trim(),
    region: form.region.trim(),
    tel: form.tel.trim(),
    postalcode: form.postalcode.trim(),
  }
}

export function validateCampgroundForm(form: CampgroundFormValues): string | null {
  const trimmedForm = trimCampgroundForm(form)
  const isFormIncomplete = Object.values(trimmedForm).some((value) => value === '')

  if (isFormIncomplete) {
    return 'Please fill in all fields.'
  }

  if (trimmedForm.name.length > 50) {
    return 'Campground name cannot be more than 50 characters.'
  }

  const priceValue = Number(trimmedForm.price)
  if (!Number.isFinite(priceValue) || priceValue < 0) {
    return 'Please enter a valid price (0 or more).'
  }

  try {
    const url = new URL(trimmedForm.picture)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return 'Please enter a valid picture URL.'
    }
  } catch {
    return 'Please enter a valid picture URL.'
  }

  const thaiPhoneRegex = /^0\d{9}$/
  if (!thaiPhoneRegex.test(trimmedForm.tel)) {
    return 'Please enter a valid Thai phone number.'
  }

  const postalCodeRegex = /^\d{5}$/
  if (!postalCodeRegex.test(trimmedForm.postalcode)) {
    return 'Please enter a valid postal code.'
  }

  return null
}

export function toCampgroundPayload(form: CampgroundFormValues) {
  const trimmedForm = trimCampgroundForm(form)

  return {
    ...trimmedForm,
    price: Number(trimmedForm.price),
  }
}
