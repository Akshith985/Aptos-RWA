#[test_only]
module message_board_addr::test_end_to_end {
    use std::string;
    use std::signer;
    use invoice_rwa::invoice_engine_v2;

    #[test(sender = @message_board_addr)]
    fun test_invoice_status_lifecycle(sender: &signer) {
        invoice_engine_v2::init_store(sender);
        let id = string::utf8(b"INV-001");
        let amount = 1000u64;
        let due_date = 1234567890u64;
        let created_at = 1234560000u64;
        invoice_engine_v2::create_invoice(sender, id.clone(), amount, due_date, created_at);

        // Check initial status (should be DRAFT = 0)
        let invoices = invoice_engine_v2::get_invoices_by_status(signer::address_of(sender), 0);
        assert!(std::vector::length(&invoices) == 1, 100);

        // Mark as paid
        invoice_engine_v2::mark_as_paid(sender, id.clone(), 1234569999u64);

        // Check status is now PAID = 2
        let paid_invoices = invoice_engine_v2::get_invoices_by_status(signer::address_of(sender), 2);
        assert!(std::vector::length(&paid_invoices) == 1, 101);
    }
}