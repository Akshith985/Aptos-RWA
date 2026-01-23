#[test_only]
module message_board_addr::test_end_to_end {
    use std::string;
    use std::signer;
    // IMPORT YOUR ACTUAL MODULE HERE
    use invoice_rwa::invoice_rwa; 

    #[test(sender = @message_board_addr)]
    fun test_invoice_creation(sender: &signer) {
        // Use your real function names!
        // If your contract has init_store, call that:
        invoice_rwa::init_store(sender);
        
        let id = string::utf8(b"INV-001");
        invoice_rwa::create_invoice(sender, id, 1000);
    }
}