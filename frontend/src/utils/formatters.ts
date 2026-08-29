export function formatINR(amount: number): string {
  if (isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactINR(amount: number): string {
  if (isNaN(amount) || amount === 0) return "₹0";
  const absAmount = Math.abs(amount);

  if (absAmount >= 10000000) {
    // Crores
    const cr = (amount / 10000000).toFixed(2);
    return `₹${cr.endsWith(".00") ? cr.slice(0, -3) : cr} Cr`;
  } else if (absAmount >= 100000) {
    // Lakhs
    const lk = (amount / 100000).toFixed(1);
    return `₹${lk.endsWith(".0") ? lk.slice(0, -2) : lk}L`;
  } else if (absAmount >= 1000) {
    // Thousands
    return `₹${(amount / 1000).toFixed(1)}k`;
  }
  return formatINR(amount);
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  } catch {
    return isoString;
  }
}

export function formatTimeOnly(isoString: string): string {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  } catch {
    return isoString;
  }
}
