export const InvoiceStatusEnum = {
  PAID: 'PAID',
  PENDING: 'PENDING',
};

export type InvoiceStatusEnumType = keyof typeof InvoiceStatusEnum;
