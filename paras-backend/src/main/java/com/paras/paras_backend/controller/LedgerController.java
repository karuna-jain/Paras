package com.paras.paras_backend.controller;

import com.paras.paras_backend.model.Account;
import com.paras.paras_backend.model.AccountLedger;
import com.paras.paras_backend.model.AccountBalance;
import com.paras.paras_backend.repository.AccountRepository;
import com.paras.paras_backend.repository.AccountLedgerRepository;
import com.paras.paras_backend.repository.AccountBalanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/ledger")
@CrossOrigin("*")
public class LedgerController {

    @Autowired
    private AccountLedgerRepository ledgerRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private AccountBalanceRepository balanceRepository;

    @PostMapping("/debit")
    public AccountLedger postDebit(@RequestBody AccountLedger ledger) {
        ledger.setDc("D");
        AccountLedger saved = ledgerRepository.save(ledger);

        // Update Account Balance
        updateBalance(ledger.getAcCode(), ledger.getAmount(), "D");

        return saved;
    }

    @PostMapping("/credit")
    public AccountLedger postCredit(@RequestBody AccountLedger ledger) {
        ledger.setDc("C");
        AccountLedger saved = ledgerRepository.save(ledger);

        // Update Account Balance
        updateBalance(ledger.getAcCode(), ledger.getAmount(), "C");

        return saved;
    }

    @PostMapping("/opening")
    public AccountBalance postOpening(@RequestBody AccountBalance opening) {
        // Remove old opening record if exists
        Optional<AccountBalance> existing = balanceRepository.findByAcCode(opening.getAcCode());
        existing.ifPresent(record -> balanceRepository.delete(record));

        AccountBalance saved = balanceRepository.save(opening);

        // Update Account opening balance and balance
        try {
            Integer acCodeInt = Integer.parseInt(opening.getAcCode());
            accountRepository.findByAcCode(acCodeInt).ifPresent(account -> {
                account.setOpeningBalance(opening.getAmount());
                
                // Recalculate balance: opening + sum(debits) - sum(credits)
                double currentBal = opening.getAmount();
                if ("C".equalsIgnoreCase(opening.getDc())) {
                    currentBal = -opening.getAmount();
                }
                
                List<AccountLedger> txs = ledgerRepository.findByAcCodeOrderByDateAscIdAsc(opening.getAcCode());
                for (AccountLedger tx : txs) {
                    if ("D".equalsIgnoreCase(tx.getDc())) {
                        currentBal += tx.getAmount();
                    } else {
                        currentBal -= tx.getAmount();
                    }
                }
                account.setBalance(currentBal);
                accountRepository.save(account);
            });
        } catch (NumberFormatException e) {
            System.err.println("Error parsing acCode: " + opening.getAcCode());
        }

        return saved;
    }

    @GetMapping("/query/{acCode}")
    public List<AccountLedger> queryLedger(@PathVariable String acCode) {
        return ledgerRepository.findByAcCodeOrderByDateAscIdAsc(acCode);
    }

    @GetMapping("/opening/{acCode}")
    public AccountBalance getOpening(@PathVariable String acCode) {
        return balanceRepository.findByAcCode(acCode).orElse(new AccountBalance());
    }

    private void updateBalance(String acCodeStr, Double amount, String dc) {
        try {
            Integer acCode = Integer.parseInt(acCodeStr);
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
            System.err.println("Invalid acCode for updating balance: " + acCodeStr);
        }
    }
}
