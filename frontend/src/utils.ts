export const HOME_STATE = 'Telangana';
export const STATES = ['Telangana', 'Andhra Pradesh', 'Karnataka', 'Maharashtra', 'Tamil Nadu', 'Delhi'];

export const fmt = (n: number): string =>
  '₹' + (Math.round(n * 100) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmtInt = (n: number): string => Math.round(n).toLocaleString('en-IN');

export const fmtDate = (d: Date | string): string =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export const fmtDateTime = (d: Date | string): string =>
  new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export const isToday = (d: Date | string): boolean => new Date().toDateString() === new Date(d).toDateString();

export interface GstSplitInput {
  qty: number;
  rate: number;
  discAmt: number;
  gst: number;
  cess: number;
}

export interface GstSplitResult {
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  total: number;
}

/** Splits tax into CGST+SGST (intra-state) or IGST (inter-state) based on the buyer's state. */
export function gstSplit(item: GstSplitInput, partyState: string | undefined): GstSplitResult {
  const rate = item.gst / 100;
  const base = item.qty * item.rate;
  const taxable = base - item.discAmt;
  const inter = !!partyState && partyState !== HOME_STATE;
  let cgst = 0,
    sgst = 0,
    igst = 0;
  if (inter) {
    igst = taxable * rate;
  } else {
    cgst = (taxable * rate) / 2;
    sgst = (taxable * rate) / 2;
  }
  const cessAmt = taxable * (item.cess / 100);
  return { taxable, cgst, sgst, igst, cess: cessAmt, total: taxable + cgst + sgst + igst + cessAmt };
}

/** Temporarily applies a specific @page size and margin before printing to help browser/printer detection. */
export function printWithPageSize(sizeStr: string) {
  const style = document.createElement('style');
  style.innerHTML = `@media print { @page { ${sizeStr} } }`;
  document.head.appendChild(style);
  window.print();
  // Remove the style right after the print dialog resolves
  setTimeout(() => {
    document.head.removeChild(style);
  }, 1000);
}

export function numberToWords(num: number): string {
  if (num === 0) return 'Zero';

  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n: number) => {
    let str = '';
    if (n > 99) {
      str += a[Math.floor(n / 100)] + 'Hundred ';
      n %= 100;
    }
    if (n > 19) {
      str += b[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      str += a[n];
    }
    return str;
  };

  let word = '';
  if (num > 9999999) {
    word += inWords(Math.floor(num / 10000000)) + 'Crore ';
    num %= 10000000;
  }
  if (num > 99999) {
    word += inWords(Math.floor(num / 100000)) + 'Lakh ';
    num %= 100000;
  }
  if (num > 999) {
    word += inWords(Math.floor(num / 1000)) + 'Thousand ';
    num %= 1000;
  }
  word += inWords(num);

  return word.trim();
}

export function amountToWords(amount: number): string {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  let res = 'INR ' + numberToWords(rupees);
  if (paise > 0) {
    res += ' and ' + numberToWords(paise) + ' paise';
  }
  res += ' Only';
  return res;
}
