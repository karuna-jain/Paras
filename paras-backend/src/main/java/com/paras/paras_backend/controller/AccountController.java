package com.paras.paras_backend.controller;

import com.paras.paras_backend.model.Account;
import com.paras.paras_backend.repository.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    @Autowired
    private AccountRepository accountRepository;

    @GetMapping
    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    @PostMapping
    public Account createAccount(@RequestBody Account account) {
        return accountRepository.save(account);
    }

    @PutMapping("/{id}")
    public Account updateAccount(@PathVariable Long id, @RequestBody Account accountDetails) {
        return accountRepository.findById(id).map(account -> {
            account.setAcCode(accountDetails.getAcCode());
            account.setHeadCode(accountDetails.getHeadCode());
            account.setName(accountDetails.getName());
            account.setAddressOff(accountDetails.getAddressOff());
            account.setAddressRes(accountDetails.getAddressRes());
            account.setCity(accountDetails.getCity());
            account.setDist(accountDetails.getDist());
            account.setPinCode(accountDetails.getPinCode());
            account.setState(accountDetails.getState());
            account.setInState(accountDetails.getInState());
            account.setStdCode(accountDetails.getStdCode());
            account.setTrackRoute(accountDetails.getTrackRoute());
            account.setTrackType(accountDetails.getTrackType());
            account.setPhO(accountDetails.getPhO());
            account.setPhR(accountDetails.getPhR());
            account.setContactPerson(accountDetails.getContactPerson());
            account.setMobileNo(accountDetails.getMobileNo());
            account.setMobileSms(accountDetails.getMobileSms());
            account.setTransport(accountDetails.getTransport());
            account.setEmailId(accountDetails.getEmailId());
            account.setRateType(accountDetails.getRateType());
            account.setBankName(accountDetails.getBankName());
            account.setBranchName(accountDetails.getBranchName());
            account.setBankAcNo(accountDetails.getBankAcNo());
            account.setIfsc(accountDetails.getIfsc());
            account.setGstin(accountDetails.getGstin());
            account.setCrLimitDays(accountDetails.getCrLimitDays());
            account.setGstCatg(accountDetails.getGstCatg());
            account.setGstEffDate(accountDetails.getGstEffDate());
            account.setCloseDay(accountDetails.getCloseDay());
            account.setSalesPerson(accountDetails.getSalesPerson());
            account.setRemarks(accountDetails.getRemarks());
            account.setAcOpenDate(accountDetails.getAcOpenDate());
            account.setOpeningBalance(accountDetails.getOpeningBalance());
            account.setBalance(accountDetails.getBalance());
            return accountRepository.save(account);
        }).orElseThrow(() -> new RuntimeException("Account not found with id " + id));
    }

    @DeleteMapping("/{id}")
    public void deleteAccount(@PathVariable Long id) {
        accountRepository.deleteById(id);
    }
}
