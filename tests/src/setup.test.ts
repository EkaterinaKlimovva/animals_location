describe('Test Setup', () => {
  it('should run a simple test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have test environment configured', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
});
