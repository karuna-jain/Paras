package com.paras.paras_backend.controller;

import com.paras.paras_backend.model.CbVoucher;
import com.paras.paras_backend.model.CbVoucherLine;
import com.paras.paras_backend.model.AccountLedger;
import com.paras.paras_backend.repository.CbVoucherRepository;
import com.paras.paras_backend.repository.AccountRepository;
import com.paras.paras_backend.repository.AccountLedgerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/cb-vouchers")
@CrossOrigin("*")
public class CbVoucherController {

    @Autowired
    private CbVoucherRepository voucherRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private AccountLedgerRepository ledgerRepository;

    @GetMapping
    public List<CbVoucher> getAllVouchers() {
        return voucherRepository.findAll();
    }

    @GetMapping("/{id}")
    public CbVoucher getVoucherById(@PathVariable Long id) {
        return voucherRepository.findById(id).orElseThrow();
    }

    @GetMapping("/next-no")
    public String getNextVoucherNo() {
        String max = voucherRepository.findMaxVoucherNo();
        if (max == null || max.length() < 2) {
            return "V0001";
        }
        try {
            int num = Integer.parseInt(max.substring(1));
            return "V" + String.format("%04d", num + 1);
        } catch (NumberFormatException e) {
            return "V0001";
        }
    }

    @PostMapping
    public CbVoucher createVoucher(@RequestBody CbVoucher voucher) {
        if (voucher.getVoucherNo() == null || voucher.getVoucherNo().trim().isEmpty()) {
            voucher.setVoucherNo(getNextVoucherNo());
        }

        if (voucher.getLines() != null) {
            voucher.getLines().forEach(line -> line.setVoucher(voucher));
        }

        CbVoucher saved = voucherRepository.save(voucher);

        // Update ledger for each line
        if (saved.getLines() != null) {
            for (CbVoucherLine line : saved.getLines()) {
                AccountLedger ledger = new AccountLedger();
                ledger.setAcId(line.getAcId());
                ledger.setAcCode(line.getAcCode());
                ledger.setAmount(line.getAmount());
                ledger.setDc(line.getDrCr());
                ledger.setDocNo(saved.getVoucherNo());
                
                // Narrative: BY source/narration or TO source/narration
                // "BY PHONE PAY" or "TO CASH", etc.
                String prefix = "C".equalsIgnoreCase(line.getDrCr()) ? "BY " : "TO ";
                ledger.setNarration(prefix + (line.getNarration() != null ? line.getNarration() : "Voucher"));
                ledger.setSource("CASH"); // Or PHONE PAY/BANK
                ledger.setDate(saved.getVoucherDate());
                ledgerRepository.save(ledger);

                // Update Account Balance
                updateAccountBalance(line.getAcCode(), line.getAmount(), line.getDrCr());
            }
        }

        return saved;
    }

    @DeleteMapping("/{id}")
    public void deleteVoucher(@PathVariable Long id) {
        voucherRepository.findById(id).ifPresent(voucher -> {
            // Reverse account balances
            if (voucher.getLines() != null) {
                for (CbVoucherLine line : voucher.getLines()) {
                    String reverseDc = "D".equalsIgnoreCase(line.getDrCr()) ? "C" : "D";
                    updateAccountBalance(line.getAcCode(), line.getAmount(), reverseDc);
                }
            }
            // Ledger deletion: find by docNo
            // Simple deletion for simplicity (or let Jpa cascade/handle it)
            voucherRepository.delete(voucher);
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
            System.err.println("Invalid acCode for voucher: " + acNoStr);
        }
    }
}
