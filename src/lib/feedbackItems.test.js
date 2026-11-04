import test from 'node:test';
import assert from 'node:assert/strict';
import { feedbackItems } from '../components/feedback/feedbackItems.js';

test('saved feedback with no questions has nothing to render', () => {
  assert.deepEqual(feedbackItems([]), []);
  assert.deepEqual(feedbackItems(null), []);
  assert.deepEqual(feedbackItems(['', '  ', null]), []);
  assert.deepEqual(feedbackItems(['  One question?  ']), ['One question?']);
});
