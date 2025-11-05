import { _healthProbe } from '../src/routes/health';

describe('health route probe', () => {
  it('returns ok', () => {
    expect(_healthProbe()).toBe('ok');
  });
});
