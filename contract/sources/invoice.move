module invoice_rwa::invoice_engine_v2 {
    use std::string;
    use std::string::String;
    use std::signer;
    use std::vector;

    // Error codes
    const E_DUPLICATE_INVOICE_ID: u64 = 1;
    const E_INVOICE_NOT_FOUND: u64 = 2;
    const E_NOT_INVOICE_ISSUER: u64 = 3;

    // 1. Define the Invoice Structure
    struct Invoice has store, copy, drop {
        id: String,
        amount: u64,
        issuer: address,
        status: String
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

    // Helper function to check if an invoice ID already exists
    fun invoice_exists(store: &InvoiceStore, id: &String): bool {
        let len = vector::length(&store.invoices);
        let i = 0;
        while (i < len) {
            let invoice = vector::borrow(&store.invoices, i);
            if (&invoice.id == id) {
                return true
            };
            i = i + 1;
        };
        false
    }

    // Helper function to locate invoice index by ID
    fun invoice_index(store: &InvoiceStore, id: &String): u64 {
        let len = vector::length(&store.invoices);
        let i = 0;
        while (i < len) {
            let invoice = vector::borrow(&store.invoices, i);
            if (&invoice.id == id) {
                return i
            };
            i = i + 1;
        };
        abort E_INVOICE_NOT_FOUND
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
        
        // Check if invoice with this ID already exists
        assert!(!invoice_exists(store, &id), E_DUPLICATE_INVOICE_ID);
        
        let new_invoice = Invoice {
            id,
            amount,
            issuer: issuer_address,
            status: string::utf8(b"Open")
        };

        vector::push_back(&mut store.invoices, new_invoice);
    }

    // 5. Mark an existing invoice as paid (issuer-only)
    public entry fun mark_as_paid(
        account: &signer,
        id: String
    ) acquires InvoiceStore {
        let caller = signer::address_of(account);
        assert!(exists<InvoiceStore>(caller), E_INVOICE_NOT_FOUND);

        let store = borrow_global_mut<InvoiceStore>(caller);
        let idx = invoice_index(store, &id);
        let invoice = vector::borrow_mut(&mut store.invoices, idx);
        assert!(invoice.issuer == caller, E_NOT_INVOICE_ISSUER);
        invoice.status = string::utf8(b"Paid");
    }
}
