#[test_only]
module invoice_rwa::repro_bug {
    use std::string;
    use std::signer;
    use invoice_rwa::invoice_engine_v2;

    #[test(sender = @0x123)]
    #[expected_failure(abort_code = 3001, location = invoice_rwa::invoice_engine_v2)]
    fun test_duplicate_invoice_id(sender: &signer) {
        invoice_engine_v2::init_store(sender);
        let id = string::utf8(b"INV-001");
        let amount1 = 100u64;
        let amount2 = 200u64;
        let due_date = 1234567890u64;
        let created_at = 1234560000u64;

        // First creation - should succeed
        invoice_engine_v2::create_invoice(sender, id, amount1, due_date, created_at);
        
        // Second creation with same ID - should fail with 3001 if check exists
        invoice_engine_v2::create_invoice(sender, id, amount2, due_date, created_at);
    }
}
