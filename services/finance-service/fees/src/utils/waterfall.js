/**
 * Pure waterfall distribution function.
 * No database access. Takes structure lines and a net payment amount,
 * returns how much to apply to each votehead in priority order.
 *
 * @param {Array} lines - fee_structure_lines sorted by priorityOrder ASC
 *   Each: { voteheadId, amount: number, priorityOrder: number }
 * @param {number} netPaid - total net amount paid (after reversals)
 * @returns {Array} distributions
 *   Each: { voteheadId, amountApplied: number }
 */
const computeWaterfall = (lines, netPaid) => {
  if (!lines || lines.length === 0) return [];
  if (netPaid <= 0) return [];

  // Sort defensively — caller should pre-sort but we enforce it
  const sorted = [...lines].sort((a, b) => a.priorityOrder - b.priorityOrder);

  let remaining = Number(netPaid);
  const result = [];

  for (const line of sorted) {
    if (remaining <= 0) break;

    const due = Number(line.amount);
    const fill = Math.min(due, remaining);

    if (fill > 0) {
      result.push({
        voteheadId: line.voteheadId,
        amountApplied: parseFloat(fill.toFixed(2)),
      });
      remaining = parseFloat((remaining - fill).toFixed(2));
    }
  }

  // If there's still remaining amount (overpayment), attach it to the last votehead
  if (remaining > 0 && result.length > 0) {
    const lastItem = result[result.length - 1];
    lastItem.amountApplied = parseFloat((lastItem.amountApplied + remaining).toFixed(2));
  }

  return result;
};

/**
 * Derive votehead status from amounts.
 * @param {number} amountDue
 * @param {number} amountPaid
 * @returns {'unpaid'|'partial'|'cleared'}
 */
const voteheadStatus = (amountDue, amountPaid) => {
  const paid = Number(amountPaid);
  const due = Number(amountDue);
  if (paid <= 0) return 'unpaid';
  if (paid >= due) return 'cleared';
  return 'partial';
};

/**
 * Calculate obligation status from total amount and paid amount
 * @param {number} totalAmount
 * @param {number} totalPaid
 * @returns {'unpaid'|'partial'|'cleared'|'overpaid'}
 */
const obligationStatus = (totalAmount, totalPaid) => {
  const paid = Number(totalPaid);
  const due = Number(totalAmount);
  if (paid <= 0) return 'unpaid';
  if (paid > due) return 'overpaid';
  if (paid >= due) return 'cleared';
  return 'partial';
};

module.exports = {
  computeWaterfall,
  voteheadStatus,
  obligationStatus,
};