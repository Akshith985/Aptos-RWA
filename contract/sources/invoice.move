module invoice_rwa::invoice_rwa {
    use std::string::{String};
    use std::signer;
    use std::vector;

    // 1. Define the Invoice Structure
    struct Invoice has store, copy, drop {
        id: String,
        amount: u64,
        issuer: address
    }

    // 2. Define the Storage (A list of invoices)
    struct InvoiceStore has key {
        invoices: vector<Invoice>
    }

    // 3. Initialize the Store (Run this once per user)
    public entry fun init_store(account: &signer) {
        let store = InvoiceStore {
            invoices: vector::empty<Invoice>()
        };
        move_to(account, store);
    }

    // 4. Create Invoice Function
    public entry fun create_invoice(
        account: &signer, 
        id: String, 
        amount: u64
    ) acquires InvoiceStore {
        let issuer_address = signer::address_of(account);
        
        // Ensure the user has a store, if not, create one
        if (!exists<InvoiceStore>(issuer_address)) {
            init_store(account);
        };

        let store = borrow_global_mut<InvoiceStore>(issuer_address);
        
        let new_invoice = Invoice {
            id,
            amount,
            issuer: issuer_address
        };

        vector::push_back(&mut store.invoices, new_invoice);
    }
}