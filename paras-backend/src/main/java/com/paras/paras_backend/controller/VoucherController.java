package com.paras.paras_backend.controller;

import com.paras.paras_backend.model.Voucher;
import com.paras.paras_backend.repository.AccountRepository;
import com.paras.paras_backend.repository.VoucherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vouchers")
@CrossOrigin("*")
public class VoucherController {

    @Autowired
    private VoucherRepository voucherRepository;

    @Autowired
    private AccountRepository accountRepository;

    @GetMapping
    public List<Voucher> getAllVouchers() {
        return voucherRepository.findAll();
    }

    @PostMapping
    public Voucher createVoucher(@RequestBody Voucher voucher) {
        Voucher savedVoucher = voucherRepository.save(voucher);
        
        // Update account balance
        updateAccountBalance(savedVoucher.getPartyCd(), savedVoucher.getAmount());
        
        return savedVoucher;
    }

    @DeleteMapping("/{id}")
    public void deleteVoucher(@PathVariable Long id) {
        voucherRepository.findById(id).ifPresent(voucher -> {
            updateAccountBalance(voucher.getPartyCd(), -(voucher.getAmount() != null ? voucher.getAmount() : 0.0));
            voucherRepository.delete(voucher);
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
