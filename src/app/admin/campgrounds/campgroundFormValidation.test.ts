import {
  toCampgroundPayload,
  validateCampgroundForm,
  type CampgroundFormValues,
} from './campgroundFormValidation'

const validForm: CampgroundFormValues = {
  name: 'Forest Camp',
  price: '500',
  picture: 'https://example.com/camp.jpg',
  address: '99 Test Road',
  district: 'Pathum Wan',
  province: 'Bangkok',
  region: 'Central',
  tel: '0812345678',
  postalcode: '10330',
}

describe('campground form validation', () => {
  test('requires every field before submitting', () => {
    expect(validateCampgroundForm({ ...validForm, address: '' })).toBe('Please fill in all fields.')
  })

  test('rejects invalid price, picture URL, phone, and postal code', () => {
    expect(validateCampgroundForm({ ...validForm, price: '-1' })).toMatch(/valid price/i)
    expect(validateCampgroundForm({ ...validForm, picture: 'ftp://example.com/camp.jpg' })).toMatch(/valid picture url/i)
    expect(validateCampgroundForm({ ...validForm, tel: '12345' })).toMatch(/valid thai phone number/i)
    expect(validateCampgroundForm({ ...validForm, postalcode: 'abcde' })).toMatch(/valid postal code/i)
  })

  test('normalizes valid form data for API submission', () => {
    const payload = toCampgroundPayload({
      ...validForm,
      name: '  Forest Camp  ',
      price: '750',
    })

    expect(validateCampgroundForm(validForm)).toBeNull()
    expect(payload).toMatchObject({
      name: 'Forest Camp',
      price: 750,
    })
  })
})
