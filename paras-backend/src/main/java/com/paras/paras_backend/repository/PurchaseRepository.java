package com.paras.paras_backend.repository;

import com.paras.paras_backend.model.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;

public interface PurchaseRepository extends JpaRepository<Purchase, Long> {
    Optional<Purchase> findByBillNo(String billNo);

    @Query("SELECT MAX(p.billNo) FROM Purchase p")
    String findMaxBillNo();
}
