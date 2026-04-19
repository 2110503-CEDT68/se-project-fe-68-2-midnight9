describe('Registration Form Logic', () => {
  const validateForm = (password, confirm, acceptTerms) => {
    if (password !== confirm) return 'Passwords do not match.';
    if (!acceptTerms) return 'You must accept the Terms.';
    return null;
  };

  test('Should return error if passwords mismatch', () => {
    const error = validateForm('123456', '654321', true);
    expect(error).toBe('Passwords do not match.');
  });

  test('Should return error if terms not accepted', () => {
    const error = validateForm('123456', '123456', false);
    expect(error).toBe('You must accept the Terms.');
  });
});