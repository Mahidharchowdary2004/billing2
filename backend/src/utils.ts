export const HOME_STATE = 'Telangana';
export const STATES = ['Telangana', 'Andhra Pradesh', 'Karnataka', 'Maharashtra', 'Tamil Nadu', 'Delhi'];

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

export const isToday = (d: string | Date): boolean => new Date().toDateString() === new Date(d).toDateString();
