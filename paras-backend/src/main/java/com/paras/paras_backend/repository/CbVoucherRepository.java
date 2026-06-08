package com.paras.paras_backend.repository;

import com.paras.paras_backend.model.CbVoucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;

public interface CbVoucherRepository extends JpaRepository<CbVoucher, Long> {
    Optional<CbVoucher> findByVoucherNo(String voucherNo);

    @Query("SELECT MAX(v.voucherNo) FROM CbVoucher v WHERE v.voucherNo LIKE 'V%'")
    String findMaxVoucherNo();
}
