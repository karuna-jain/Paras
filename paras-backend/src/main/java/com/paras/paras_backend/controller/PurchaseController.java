package com.paras.paras_backend.controller;

import com.paras.paras_backend.model.Purchase;
import com.paras.paras_backend.model.PurchaseItem;
import com.paras.paras_backend.model.Part;
import com.paras.paras_backend.model.AccountLedger;
import com.paras.paras_backend.repository.PurchaseRepository;
import com.paras.paras_backend.repository.PartRepository;
import com.paras.paras_backend.repository.AccountRepository;
import com.paras.paras_backend.repository.AccountLedgerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/purchases")
@CrossOrigin("*")
public class PurchaseController {

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired
    private PartRepository partRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private AccountLedgerRepository ledgerRepository;

    @GetMapping
    public List<Purchase> getAllPurchases() {
        return purchaseRepository.findAll();
    }

    @GetMapping("/{id}")
    public Purchase getPurchaseById(@PathVariable Long id) {
        return purchaseRepository.findById(id).orElseThrow();
    }

    @GetMapping("/next-no")
    public String getNextBillNo() {
        String max = purchaseRepository.findMaxBillNo();
        if (max == null || max.trim().isEmpty()) {
            return "P001";
        }
        try {
            // Find numbers in max
            String digits = max.replaceAll("\\D+", "");
            if (digits.isEmpty()) {
                return "P001";
            }
            int num = Integer.parseInt(digits);
            return "P" + String.format("%03d", num + 1);
        } catch (NumberFormatException e) {
            return "P001";
        }
    }

    @PostMapping
    public Purchase createPurchase(@RequestBody Purchase purchase) {
        if (purchase.getBillNo() == null || purchase.getBillNo().trim().isEmpty()) {
            purchase.setBillNo(getNextBillNo());
        }

        if (purchase.getItems() != null) {
            purchase.getItems().forEach(item -> {
                item.setPurchase(purchase);

                // Update part stock: part.opening += qty
                updatePartStock(item.getBrand(), item.getPartNo(), item.getQty().intValue());
            });
        }

        Purchase saved = purchaseRepository.save(purchase);

        // Post ledger debit for supplier (we owe them, which is represented as credit/debit depending on logic, but spec says "POST /api/ledger/debit for supplier (we owe them)")
        // Wait! If we owe them, typically it's a CREDIT to their account. But let's follow the spec: "POST /api/ledger/debit for supplier (we owe them)"
        if (saved.getSupplierCode() != null && !saved.getSupplierCode().isEmpty()) {
            AccountLedger ledger = new AccountLedger();
            ledger.setAcCode(saved.getSupplierCode());
            ledger.setAmount(saved.getNetAmount());
            ledger.setDc("D"); // Debit as requested in spec
            ledger.setDocNo(saved.getBillNo());
            ledger.setSource("PUR");
            ledger.setNarration("TO Supplier Invoice");
            ledger.setDate(saved.getBillDate());
            ledgerRepository.save(ledger);

            // Update Account Balance
            updateAccountBalance(saved.getSupplierCode(), saved.getNetAmount(), "D");
        }

        return saved;
    }

    @PutMapping("/{id}")
    public Purchase updatePurchase(@PathVariable Long id, @RequestBody Purchase updatedPurchase) {
        return purchaseRepository.findById(id).map(purchase -> {
            // Revert stock changes first
            if (purchase.getItems() != null) {
                purchase.getItems().forEach(item -> {
                    updatePartStock(item.getBrand(), item.getPartNo(), -item.getQty().intValue());
                });
            }

            purchase.setBillDate(updatedPurchase.getBillDate());
            purchase.setType(updatedPurchase.getType());
            purchase.setChangeYn(updatedPurchase.getChangeYn());
            purchase.setSupplierCode(updatedPurchase.getSupplierCode());
            purchase.setSupplierName(updatedPurchase.getSupplierName());
            purchase.setAddress(updatedPurchase.getAddress());
            purchase.setCity(updatedPurchase.getCity());

            double oldAmt = purchase.getNetAmount();
            double newAmt = updatedPurchase.getNetAmount();
            purchase.setTotalAmount(updatedPurchase.getTotalAmount());
            purchase.setCgst(updatedPurchase.getCgst());
            purchase.setSgst(updatedPurchase.getSgst());
            purchase.setIgst(updatedPurchase.getIgst());
            purchase.setNetAmount(newAmt);

            purchase.getItems().clear();
            if (updatedPurchase.getItems() != null) {
                updatedPurchase.getItems().forEach(item -> {
                    item.setPurchase(purchase);
                    purchase.getItems().add(item);
                    
                    // Apply new stock changes
                    updatePartStock(item.getBrand(), item.getPartNo(), item.getQty().intValue());
                });
            }

            Purchase saved = purchaseRepository.save(purchase);

            if (purchase.getSupplierCode() != null && !purchase.getSupplierCode().isEmpty() && oldAmt != newAmt) {
                updateAccountBalance(purchase.getSupplierCode(), newAmt - oldAmt, "D");
            }

            return saved;
        }).orElseThrow();
    }

    @DeleteMapping("/{id}")
    public void deletePurchase(@PathVariable Long id) {
        purchaseRepository.findById(id).ifPresent(purchase -> {
            // Revert stock
            if (purchase.getItems() != null) {
                purchase.getItems().forEach(item -> {
                    updatePartStock(item.getBrand(), item.getPartNo(), -item.getQty().intValue());
                });
            }
            // Reverse ledger
            if (purchase.getSupplierCode() != null && !purchase.getSupplierCode().isEmpty()) {
                updateAccountBalance(purchase.getSupplierCode(), purchase.getNetAmount(), "C");
            }
            purchaseRepository.delete(purchase);
        });
    }

    private void updatePartStock(String brand, String partNo, int qtyDiff) {
        Optional<Part> partOpt = partRepository.findByPartNo(partNo);
        partOpt.ifPresent(part -> {
            int opening = part.getOpening() != null ? part.getOpening() : 0;
            part.setOpening(opening + qtyDiff);
            partRepository.save(part);
        });
    }

    private void updateAccountBalance(String acNoStr, Double amount, String dc) {
        try {
            Integer acCode = Integer.parseInt(acNoStr);
            accountRepository.findByAcCode(acCode).ifPresent(account -> {
                double current = account.getBalance() != null ? account.getBalance() : 0.0;
                if ("D".equalsIgnoreCase(dc)) {
                    account.setBalance(current + amount);
                } else {
                    account.setBalance(current - amount);
                }
                accountRepository.save(account);
            });
        } catch (NumberFormatException e) {
            System.err.println("Invalid supplier code: " + acNoStr);
        }
    }
}
