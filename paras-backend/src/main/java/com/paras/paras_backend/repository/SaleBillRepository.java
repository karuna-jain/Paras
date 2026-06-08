package com.paras.paras_backend.repository;

import com.paras.paras_backend.model.SaleBill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;

public interface SaleBillRepository extends JpaRepository<SaleBill, Long> {
    Optional<SaleBill> findByBillNo(String billNo);

    @Query("SELECT MAX(s.billNo) FROM SaleBill s WHERE s.billNo LIKE 'S%'")
    String findMaxBillNoWithSPrefix();
}
