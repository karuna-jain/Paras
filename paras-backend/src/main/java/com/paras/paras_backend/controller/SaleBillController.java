package com.paras.paras_backend.controller;

import com.paras.paras_backend.model.SaleBill;
import com.paras.paras_backend.model.AccountLedger;
import com.paras.paras_backend.repository.SaleBillRepository;
import com.paras.paras_backend.repository.AccountRepository;
import com.paras.paras_backend.repository.AccountLedgerRepository;
import com.paras.paras_backend.repository.SalesOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/sale-bills")
@CrossOrigin("*")
public class SaleBillController {

    @Autowired
    private SaleBillRepository saleBillRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private AccountLedgerRepository ledgerRepository;

    @Autowired
    private SalesOrderRepository salesOrderRepository;

    @GetMapping
    public List<SaleBill> getAllSaleBills() {
        return saleBillRepository.findAll();
    }

    @GetMapping("/{id}")
    public SaleBill getSaleBillById(@PathVariable Long id) {
        return saleBillRepository.findById(id).orElseThrow();
    }

    @GetMapping("/next-no")
    public String getNextBillNo() {
        String max = saleBillRepository.findMaxBillNoWithSPrefix();
        if (max == null || max.length() < 2) {
            return "S001";
        }
        try {
            int num = Integer.parseInt(max.substring(1));
            return "S" + String.format("%03d", num + 1);
        } catch (NumberFormatException e) {
            return "S001";
        }
    }

    @PostMapping
    public SaleBill createSaleBill(@RequestBody SaleBill saleBill) {
        // Generate bill no if not set
        if (saleBill.getBillNo() == null || saleBill.getBillNo().trim().isEmpty()) {
            saleBill.setBillNo(getNextBillNo());
        }

        // Set back-reference on items
        if (saleBill.getItems() != null) {
            saleBill.getItems().forEach(item -> item.setBill(saleBill));
        }

        SaleBill saved = saleBillRepository.save(saleBill);

        // Post debit to ledger if A/C details are set
        if (saved.getAcNo() != null && !saved.getAcNo().isEmpty()) {
            AccountLedger ledger = new AccountLedger();
            ledger.setAcCode(saved.getAcNo());
            ledger.setAmount(saved.getNetAmt());
            ledger.setDc("D");
            ledger.setDocNo(saved.getBillNo());
            ledger.setSource("SAL[Prt]");
            ledger.setNarration("TO Credit Sale");
            ledger.setDate(saved.getBillDate());
            ledgerRepository.save(ledger);

            // Update Account Balance
            updateAccountBalance(saved.getAcNo(), saved.getNetAmt(), "D");
        }

        // If billed from a Pick Slip / Sales Order, update that Sales Order status
        if (saved.getPickSlipId() != null) {
            salesOrderRepository.findById(saved.getPickSlipId()).ifPresent(order -> {
                order.setBilled(true);
                order.setInvNo(saved.getBillNo());
                salesOrderRepository.save(order);
            });
        }

        return saved;
    }

    @PutMapping("/{id}")
    public SaleBill updateSaleBill(@PathVariable Long id, @RequestBody SaleBill updatedBill) {
        return saleBillRepository.findById(id).map(bill -> {
            bill.setBillDate(updatedBill.getBillDate());
            bill.setDayName(updatedBill.getDayName());
            bill.setType(updatedBill.getType());
            bill.setChangeYn(updatedBill.getChangeYn());
            bill.setAcNo(updatedBill.getAcNo());
            bill.setPartyName(updatedBill.getPartyName());
            bill.setAddress(updatedBill.getAddress());
            bill.setCity(updatedBill.getCity());
            bill.setGstin(updatedBill.getGstin());
            bill.setInState(updatedBill.getInState());
            bill.setState(updatedBill.getState());
            bill.setCode(updatedBill.getCode());
            bill.setRemarks(updatedBill.getRemarks());
            bill.setRateFormat(updatedBill.getRateFormat());
            bill.setPrintCopies(updatedBill.getPrintCopies());
            bill.setPrintDisc(updatedBill.getPrintDisc());
            bill.setTransporter(updatedBill.getTransporter());
            bill.setGrNo(updatedBill.getGrNo());
            bill.setGrDate(updatedBill.getGrDate());
            bill.setCaseNo(updatedBill.getCaseNo());
            bill.setPvtMarka(updatedBill.getPvtMarka());
            bill.setEwayBillNo(updatedBill.getEwayBillNo());
            bill.setSaleAmt(updatedBill.getSaleAmt());
            bill.setCgst(updatedBill.getCgst());
            bill.setSgst(updatedBill.getSgst());
            bill.setIgst(updatedBill.getIgst());
            bill.setPostage(updatedBill.getPostage());
            bill.setFreight(updatedBill.getFreight());
            bill.setHammali(updatedBill.getHammali());
            
            // Adjust ledger if amount changed
            double oldAmt = bill.getNetAmt();
            double newAmt = updatedBill.getNetAmt();
            bill.setNetAmt(newAmt);

            bill.getItems().clear();
            if (updatedBill.getItems() != null) {
                updatedBill.getItems().forEach(item -> {
                    item.setBill(bill);
                    bill.getItems().add(item);
                });
            }

            SaleBill saved = saleBillRepository.save(bill);

            if (bill.getAcNo() != null && !bill.getAcNo().isEmpty() && oldAmt != newAmt) {
                // Find ledger transaction and update it, or add adjustment
                updateAccountBalance(bill.getAcNo(), newAmt - oldAmt, "D");
            }

            return saved;
        }).orElseThrow();
    }

    @DeleteMapping("/{id}")
    public void deleteSaleBill(@PathVariable Long id) {
        saleBillRepository.findById(id).ifPresent(bill -> {
            // Reverse ledger
            if (bill.getAcNo() != null && !bill.getAcNo().isEmpty()) {
                updateAccountBalance(bill.getAcNo(), bill.getNetAmt(), "C");
            }
            // If linked to sales order, restore sales order billed status
            if (bill.getPickSlipId() != null) {
                salesOrderRepository.findById(bill.getPickSlipId()).ifPresent(order -> {
                    order.setBilled(false);
                    order.setInvNo(null);
                    salesOrderRepository.save(order);
                });
            }
            saleBillRepository.delete(bill);
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
            System.err.println("Invalid acNo: " + acNoStr);
        }
    }
}
