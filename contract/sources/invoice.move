            struct InvoiceTransferredEvent has drop, store {
                from: address,
                to: address,
                invoice_id: String,
            }

            struct InvoiceEvents has key {
                transfer_events: vector<InvoiceTransferredEvent>,
            }

            public entry fun transfer_invoice(sender: &signer, recipient: address, invoice_id: String) acquires InvoiceStore, InvoiceEvents {
                let sender_addr = signer::address_of(sender);
                assert!(exists<InvoiceStore>(sender_addr), 2001);
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
                assert!(found, 2002); // Invoice not found

                // Ensure recipient has a store
                if (!exists<InvoiceStore>(recipient)) {
                    let store = InvoiceStore { invoices: vector::empty<Invoice>() };
                    move_to(&create_signer(recipient), store);
                }
                let recipient_store = borrow_global_mut<InvoiceStore>(recipient);
                let inv = option::extract(invoice);
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
        /// Returns the number of invoices for an owner.
        public fun get_invoice_count(owner: address): u64 acquires InvoiceStore {
            if (!exists<InvoiceStore>(owner)) return 0;
            let store = borrow_global<InvoiceStore>(owner);
            vector::length(&store.invoices)
        }

        /// Returns true if an invoice with the given id exists for the owner.
        public fun invoice_exists(owner: address, id: String): bool acquires InvoiceStore {
            if (!exists<InvoiceStore>(owner)) return false;
            let store = borrow_global<InvoiceStore>(owner);
            let len = vector::length(&store.invoices);
            let mut i = 0u64;
            while (i < len) {
                let inv = vector::borrow(&store.invoices, i);
                if (inv.id == id) return true;
                i = i + 1;
            };
            false
        }

        /// Returns the invoice with the given id for the owner, or aborts if not found.
        public fun get_invoice_by_id(owner: address, id: String): Invoice acquires InvoiceStore {
            assert!(exists<InvoiceStore>(owner), 1004);
            let store = borrow_global<InvoiceStore>(owner);
            let len = vector::length(&store.invoices);
            let mut i = 0u64;
            while (i < len) {
                let inv = vector::borrow(&store.invoices, i);
                if (inv.id == id) return *inv;
                i = i + 1;
            };
            abort 1005;
        }

        /// Returns all invoices for the owner with amount in [min, max].
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
    // View function: get invoices by status
    public fun get_invoices_by_status(account: address, status: u8): vector<Invoice> acquires InvoiceStore {
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
module invoice_rwa::invoice_engine_v2 {
    use std::string::{String};
    use std::signer;
    use std::vector;

    // 1. Define the Invoice Structure
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

    // 2. Define the Storage (A list of invoices)
    /// InvoiceStore holds all invoices for a given account.
    ///
    /// # Fields
    /// - invoices: vector<Invoice> - The list of invoices created by the account.
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

    /// Creates a new invoice and adds it to the sender's InvoiceStore.
    ///
    /// # Parameters
    /// - account: &signer - The signer creating the invoice (issuer).
    /// - id: String - Unique identifier for the invoice.
    /// - amount: u64 - Amount due for the invoice.
    /// - due_date: u64 - Timestamp when the invoice is due.
    /// - created_at: u64 - Timestamp when the invoice is created.
    ///
    /// Initializes the store if it does not exist.
    public entry fun create_invoice(
        account: &signer, 
        id: String, 
        amount: u64,
        due_date: u64,
        created_at: u64
    ) acquires InvoiceStore {
        let issuer_address = signer::address_of(account);
        // Ensure the user has a store, if not, create one
        if (!exists<InvoiceStore>(issuer_address)) {
            init_store(account);
        };

        let store = borrow_global_mut<InvoiceStore>(issuer_address);
        // Uniqueness check: abort if invoice with same id exists
        let len = vector::length(&store.invoices);
        let mut i = 0u64;
        while (i < len) {
            let inv = vector::borrow(&store.invoices, i);
            if (inv.id == id) {
                abort 3001; // Duplicate invoice ID
            }
            i = i + 1;
        }

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

    // Find invoice index by id helper
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
        abort 1001; // Not found
    }

    // Mark invoice as paid
    public entry fun mark_as_paid(account: &signer, invoice_id: String, paid_at: u64) acquires InvoiceStore {
        let addr = signer::address_of(account);
        let store = borrow_global_mut<InvoiceStore>(addr);
        let idx = find_invoice_idx(&store.invoices, &invoice_id);
        let inv_ref = vector::borrow_mut(&mut store.invoices, idx);
        // Only allow if not already paid/cancelled
        if (inv_ref.status == STATUS_PAID || inv_ref.status == STATUS_CANCELLED) {
            abort 1002;
        };
        inv_ref.status = STATUS_PAID;
        inv_ref.paid_at = paid_at;
    }

    // Update invoice status (with validation)
    public entry fun update_status(account: &signer, invoice_id: String, new_status: u8) acquires InvoiceStore {
        let addr = signer::address_of(account);
        let store = borrow_global_mut<InvoiceStore>(addr);
        let idx = find_invoice_idx(&store.invoices, &invoice_id);
        let inv_ref = vector::borrow_mut(&mut store.invoices, idx);
        // Only allow valid transitions
        if (inv_ref.status == STATUS_PAID || inv_ref.status == STATUS_CANCELLED) {
            abort 1003;
        };
        inv_ref.status = new_status;
    }
}