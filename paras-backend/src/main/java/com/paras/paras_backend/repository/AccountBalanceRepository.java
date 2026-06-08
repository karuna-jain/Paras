package com.paras.paras_backend.repository;

import com.paras.paras_backend.model.AccountBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AccountBalanceRepository extends JpaRepository<AccountBalance, Long> {
    Optional<AccountBalance> findByAcCode(String acCode);
}
