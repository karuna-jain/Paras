package com.paras.paras_backend.controller;

import com.paras.paras_backend.model.PurchaseInvoice;
import com.paras.paras_backend.repository.AccountRepository;
import com.paras.paras_backend.repository.PurchaseInvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchase-invoices")
@CrossOrigin("*")
public class PurchaseInvoiceController {

    @Autowired
    private PurchaseInvoiceRepository purchaseInvoiceRepository;

    @Autowired
    private AccountRepository accountRepository;

    @GetMapping
    public List<PurchaseInvoice> getAllPurchaseInvoices() {
        return purchaseInvoiceRepository.findAll();
    }

    @PostMapping
    public PurchaseInvoice createPurchaseInvoice(@RequestBody PurchaseInvoice purchaseInvoice) {
        if (purchaseInvoice.getItems() != null) {
            purchaseInvoice.getItems().forEach(item -> item.setInvoice(purchaseInvoice));
        }
        PurchaseInvoice savedInvoice = purchaseInvoiceRepository.save(purchaseInvoice);
        
        // Update account balance (Purchase increases liability, so subtract from balance if balance is positive assets, 
        // or add if it's credit. Here we'll just follow the same pattern for simplicity)
        updateAccountBalance(savedInvoice.getPartyCd(), savedInvoice.getAmount());
        
        return savedInvoice;
    }

    @DeleteMapping("/{id}")
    public void deletePurchaseInvoice(@PathVariable Long id) {
        purchaseInvoiceRepository.findById(id).ifPresent(invoice -> {
            updateAccountBalance(invoice.getPartyCd(), -(invoice.getAmount() != null ? invoice.getAmount() : 0.0));
            purchaseInvoiceRepository.delete(invoice);
        });
    }

    private void updateAccountBalance(String partyCd, Double amount) {
        try {
            if (partyCd != null && !partyCd.isEmpty()) {
                Integer acCode = Integer.parseInt(partyCd);
                accountRepository.findByAcCode(acCode).ifPresent(account -> {
                    // For purchases, typically balance decreases (if balance represents net asset) 
                    // But we will stick to addition for now as per SalesOrder pattern
                    account.setBalance((account.getBalance() != null ? account.getBalance() : 0.0) + (amount != null ? amount : 0.0));
                    accountRepository.save(account);
                });
            }
        } catch (NumberFormatException e) {
            System.out.println("Invalid account code: " + partyCd);
        }
    }
}
