import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculationOutcome, describeFailure } from '../src/lib/calculation-diagnostics.ts';
import { eventSchema } from '../src/lib/event-schema.ts';
test('precise calculator codes survive ingestion without accepting provider text', () => {
  for (const code of ['cochem_only','forbidden','geocoding_start','geocoding_end','geocoding_both']) {
    assert.equal(calculationOutcome(code), code);
    assert.equal(eventSchema.shape.outcome.parse(calculationOutcome(code)), code);
  }
  for (const code of [undefined,null,'success','Private address / provider exception']) assert.equal(calculationOutcome(code),'request_failed');
  assert.match(describeFailure('request_failed').explanation,/cannot be reconstructed/);
  assert.match(describeFailure('cochem_only').action,/intentional restriction/);
});
