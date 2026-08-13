import { describe, expect, it } from 'vitest';

describe('ScolaOS unit-test harness', () => {
  it('executes TypeScript tests', () => {
    expect({ project: 'ScolaOS', milestone: 'M0' }).toMatchObject({ project: 'ScolaOS' });
  });
});
