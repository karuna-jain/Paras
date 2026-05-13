package com.paras.paras_backend.controller;

import com.paras.paras_backend.model.SalesInvoice;
import com.paras.paras_backend.repository.AccountRepository;
import com.paras.paras_backend.repository.SalesInvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales-invoices")
@CrossOrigin("*")
public class SalesInvoiceController {

    @Autowired
    private SalesInvoiceRepository salesInvoiceRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private com.paras.paras_backend.repository.SalesOrderRepository salesOrderRepository;

    @GetMapping
    public List<SalesInvoice> getAllSalesInvoices() {
        return salesInvoiceRepository.findAll();
    }

    @PostMapping
    public SalesInvoice createSalesInvoice(@RequestBody SalesInvoice salesInvoice) {
        if (salesInvoice.getItems() != null) {
            salesInvoice.getItems().forEach(item -> item.setInvoice(salesInvoice));
        }
        SalesInvoice savedInvoice = salesInvoiceRepository.save(salesInvoice);
        
        // Update account balance with remaining amount (Total - Paid)
        Double total = savedInvoice.getAmount() != null ? savedInvoice.getAmount() : 0.0;
        Double paid = savedInvoice.getPaidAmount() != null ? savedInvoice.getPaidAmount() : 0.0;
        updateAccountBalance(savedInvoice.getPartyCd(), total - paid);

        // If created from a sales order, mark the order as billed
        if (savedInvoice.getFromOrderId() != null) {
            salesOrderRepository.findById(savedInvoice.getFromOrderId()).ifPresent(order -> {
                order.setBilled(true);
                order.setBillNo(savedInvoice.getInvoiceNo());
                salesOrderRepository.save(order);
            });
        }
        
        return savedInvoice;
    }

    @DeleteMapping("/{id}")
    public void deleteSalesInvoice(@PathVariable Long id) {
        salesInvoiceRepository.findById(id).ifPresent(invoice -> {
            Double total = invoice.getAmount() != null ? invoice.getAmount() : 0.0;
            Double paid = invoice.getPaidAmount() != null ? invoice.getPaidAmount() : 0.0;
            updateAccountBalance(invoice.getPartyCd(), -(total - paid));
            salesInvoiceRepository.delete(invoice);
        });
    }

    private void updateAccountBalance(String partyCd, Double amount) {
        try {
            if (partyCd != null && !partyCd.isEmpty()) {
                Integer acCode = Integer.parseInt(partyCd);
                accountRepository.findByAcCode(acCode).ifPresent(account -> {
                    account.setBalance((account.getBalance() != null ? account.getBalance() : 0.0) + (amount != null ? amount : 0.0));
                    accountRepository.save(account);
                });
            }
        } catch (NumberFormatException e) {
            System.out.println("Invalid account code: " + partyCd);
        }
    }
}
