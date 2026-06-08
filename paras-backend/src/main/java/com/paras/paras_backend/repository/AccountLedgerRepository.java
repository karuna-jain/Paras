package com.paras.paras_backend.repository;

import com.paras.paras_backend.model.AccountLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AccountLedgerRepository extends JpaRepository<AccountLedger, Long> {
    List<AccountLedger> findByAcCodeOrderByDateAscIdAsc(String acCode);
    List<AccountLedger> findByAcIdOrderByDateAscIdAsc(Long acId);
}
