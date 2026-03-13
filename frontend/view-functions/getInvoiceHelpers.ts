import { Aptos } from "@aptos-labs/ts-sdk";

const MODULE_ADDRESS = "0x0c78e01d2569757cfcdfda3ace5e81227c77145c254f12f21da825a243638f2b";

export async function getInvoiceCount(aptos: Aptos, owner: string) {
  return aptos.view({
    payload: {
      function: `${MODULE_ADDRESS}::invoice_rwa::get_invoice_count`,
      functionArguments: [owner],
    },
  });
}

export async function invoiceExists(aptos: Aptos, owner: string, id: string) {
  return aptos.view({
    payload: {
      function: `${MODULE_ADDRESS}::invoice_rwa::invoice_exists`,
      functionArguments: [owner, id],
    },
  });
}

export async function getInvoiceById(aptos: Aptos, owner: string, id: string) {
  return aptos.view({
    payload: {
      function: `${MODULE_ADDRESS}::invoice_rwa::get_invoice_by_id`,
      functionArguments: [owner, id],
    },
  });
}

export async function getInvoicesByAmountRange(aptos: Aptos, owner: string, min: number, max: number) {
  return aptos.view({
    payload: {
      function: `${MODULE_ADDRESS}::invoice_rwa::get_invoices_by_amount_range`,
      functionArguments: [owner, min, max],
    },
  });
}
