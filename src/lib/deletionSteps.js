/**
 * Runs each deletion step in order, even when an earlier one fails, and reports what did not finish.
 * steps: [{ label, run }]. Resolves to the labels of failed steps, in order. Never throws.
 */
export async function runSteps(steps) {
  const failed = [];
  for (const step of steps) {
    try {
      await step.run();
    } catch (error) {
      console.error(`Deletion step failed: ${step.label}`, error);
      failed.push(step.label);
    }
  }
  return failed;
}
