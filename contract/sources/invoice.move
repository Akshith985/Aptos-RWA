module invoice_rwa::invoice_engine_v2 {
    use std::string::{String};
    use std::signer;
    use std::vector;
    use std::option::{Self, Option};

    // Error constants
    const E_INVALID_AMOUNT: u64 = 1;
    const E_NOT_FOUND: u64 = 1001;
    const E_ALREADY_PAID_OR_CANCELLED: u64 = 1002;
    const E_INVALID_STATUS_TRANSITION: u64 = 1003;
    const E_STORE_NOT_FOUND: u64 = 1004;
    const E_INVOICE_NOT_FOUND: u64 = 1005;
    const E_INVOICE_NOT_FOUND_FOR_TRANSFER: u64 = 2002;
    const E_DUPLICATE_INVOICE_ID: u64 = 3001;

    // Status constants
    const STATUS_DRAFT: u8 = 0;
    const STATUS_PENDING: u8 = 1;
    const STATUS_PAID: u8 = 2;
    const STATUS_OVERDUE: u8 = 3;
    const STATUS_CANCELLED: u8 = 4;

    struct Invoice has store, copy, drop {
        id: String,
        amount: u64,
        issuer: address,
        status: u8,
        due_date: u64,
        created_at: u64,
        paid_at: u64
    }

    struct InvoiceStore has key {
        invoices: vector<Invoice>
    }

    struct InvoiceTransferredEvent has drop, store {
        from: address,
        to: address,
        invoice_id: String,
    }

    struct InvoiceEvents has key {
        transfer_events: vector<InvoiceTransferredEvent>,
    }

    // --- Core Functions ---

    public entry fun init_store(account: &signer) {
        if (!exists<InvoiceStore>(signer::address_of(account))) {
            let store = InvoiceStore {
                invoices: vector::empty<Invoice>()
            };
            move_to(account, store);
        }
    }

    public entry fun create_invoice(
        account: &signer, 
        id: String, 
        amount: u64,
        due_date: u64,
        created_at: u64
    ) acquires InvoiceStore {
        assert!(amount > 0, E_INVALID_AMOUNT);
        
        let issuer_address = signer::address_of(account);
        if (!exists<InvoiceStore>(issuer_address)) {
            init_store(account);
        };

        let store = borrow_global_mut<InvoiceStore>(issuer_address);
        
        // Uniqueness check: abort if invoice with same id exists
        assert!(!invoice_exists_in_store(store, &id), E_DUPLICATE_INVOICE_ID);

        let new_invoice = Invoice {
            id,
            amount,
            issuer: issuer_address,
            status: STATUS_DRAFT,
            due_date,
            created_at,
            paid_at: 0
        };
        vector::push_back(&mut store.invoices, new_invoice);
    }

    public entry fun transfer_invoice(sender: &signer, recipient: address, invoice_id: String) acquires InvoiceStore, InvoiceEvents {
        let sender_addr = signer::address_of(sender);
        assert!(exists<InvoiceStore>(sender_addr), E_STORE_NOT_FOUND);
        let sender_store = borrow_global_mut<InvoiceStore>(sender_addr);
        let len = vector::length(&sender_store.invoices);
        let mut i = 0u64;
        let mut found = false;
        let mut invoice: Option<Invoice> = option::none<Invoice>();
        while (i < len) {
            let inv = vector::borrow(&sender_store.invoices, i);
            if (inv.id == invoice_id) {
                invoice = option::some(*inv);
                vector::remove(&mut sender_store.invoices, i);
                found = true;
                break;
            };
            i = i + 1;
        };
        assert!(found, E_INVOICE_NOT_FOUND_FOR_TRANSFER);

        // Ensure recipient has a store
        if (!exists<InvoiceStore>(recipient)) {
            // Note: In a real scenario, we might need a way to create a signer or use a different mechanism
            // For now, we assume recipient initialization happens elsewhere or we use Move's create_signer for tests
            // However, create_signer is only for tests. On-chain, the recipient must have initialized their store.
            // If this is meant to be production code, this part needs careful consideration.
            // Assuming for now it follows the original logic (which might be flawed on-chain but okay for this task)
        };
        
        // This is a placeholder for recipient store access - in production this would likely fail if store doesn't exist
        // unless the module has permission to create one or some other mechanism is used.
        assert!(exists<InvoiceStore>(recipient), E_STORE_NOT_FOUND);
        let recipient_store = borrow_global_mut<InvoiceStore>(recipient);
        let inv = option::extract(&mut invoice);
        vector::push_back(&mut recipient_store.invoices, inv);

        // Emit event
        if (!exists<InvoiceEvents>(sender_addr)) {
            let events = InvoiceEvents { transfer_events: vector::empty<InvoiceTransferredEvent>() };
            move_to(sender, events);
        }
        let events = borrow_global_mut<InvoiceEvents>(sender_addr);
        let event = InvoiceTransferredEvent { from: sender_addr, to: recipient, invoice_id };
        vector::push_back(&mut events.transfer_events, event);
    }

    public entry fun mark_as_paid(account: &signer, invoice_id: String, paid_at: u64) acquires InvoiceStore {
        let addr = signer::address_of(account);
        let store = borrow_global_mut<InvoiceStore>(addr);
        let idx = find_invoice_idx(&store.invoices, &invoice_id);
        let inv_ref = vector::borrow_mut(&mut store.invoices, idx);
        
        if (inv_ref.status == STATUS_PAID || inv_ref.status == STATUS_CANCELLED) {
            abort E_ALREADY_PAID_OR_CANCELLED;
        };
        inv_ref.status = STATUS_PAID;
        inv_ref.paid_at = paid_at;
    }

    public entry fun update_status(account: &signer, invoice_id: String, new_status: u8) acquires InvoiceStore {
        let addr = signer::address_of(account);
        let store = borrow_global_mut<InvoiceStore>(addr);
        let idx = find_invoice_idx(&store.invoices, &invoice_id);
        let inv_ref = vector::borrow_mut(&mut store.invoices, idx);
        
        if (inv_ref.status == STATUS_PAID || inv_ref.status == STATUS_CANCELLED) {
            abort E_INVALID_STATUS_TRANSITION;
        };
        inv_ref.status = new_status;
    }

    // --- View Functions ---

    public fun get_invoice_count(owner: address): u64 acquires InvoiceStore {
        if (!exists<InvoiceStore>(owner)) return 0;
        let store = borrow_global<InvoiceStore>(owner);
        vector::length(&store.invoices)
    }

    public fun invoice_exists(owner: address, id: String): bool acquires InvoiceStore {
        if (!exists<InvoiceStore>(owner)) return false;
        let store = borrow_global<InvoiceStore>(owner);
        invoice_exists_in_store(store, &id)
    }

    public fun get_invoice_by_id(owner: address, id: String): Invoice acquires InvoiceStore {
        assert!(exists<InvoiceStore>(owner), E_STORE_NOT_FOUND);
        let store = borrow_global<InvoiceStore>(owner);
        let len = vector::length(&store.invoices);
        let mut i = 0u64;
        while (i < len) {
            let inv = vector::borrow(&store.invoices, i);
            if (inv.id == id) return *inv;
            i = i + 1;
        };
        abort E_INVOICE_NOT_FOUND;
    }

    public fun get_invoices_by_amount_range(owner: address, min: u64, max: u64): vector<Invoice> acquires InvoiceStore {
        let mut result = vector::empty<Invoice>();
        if (!exists<InvoiceStore>(owner)) return result;
        let store = borrow_global<InvoiceStore>(owner);
        let len = vector::length(&store.invoices);
        let mut i = 0u64;
        while (i < len) {
            let inv = vector::borrow(&store.invoices, i);
            if (inv.amount >= min && inv.amount <= max) {
                vector::push_back(&mut result, *inv);
            }
            i = i + 1;
        };
        result
    }

    public fun get_invoices_by_status(account: address, status: u8): vector<Invoice> acquires InvoiceStore {
        if (!exists<InvoiceStore>(account)) return vector::empty<Invoice>();
        let store = borrow_global<InvoiceStore>(account);
        let mut result = vector::empty<Invoice>();
        let len = vector::length(&store.invoices);
        let mut i = 0u64;
        while (i < len) {
            let inv = vector::borrow(&store.invoices, i);
            if (inv.status == status) {
                vector::push_back(&mut result, *inv);
            };
            i = i + 1;
        };
        result
    }

    // --- Helpers ---

    fun find_invoice_idx(invoices: &vector<Invoice>, invoice_id: &String): u64 {
        let len = vector::length(invoices);
        let mut i = 0u64;
        while (i < len) {
            let inv = vector::borrow(invoices, i);
            if (&inv.id == invoice_id) {
                return i;
            };
            i = i + 1;
        };
        abort E_NOT_FOUND;
    }

    fun invoice_exists_in_store(store: &InvoiceStore, id: &String): bool {
        let len = vector::length(&store.invoices);
        let mut i = 0u64;
        while (i < len) {
            let inv = vector::borrow(&store.invoices, i);
            if (&inv.id == id) return true;
            i = i + 1;
        };
        false
    }
}