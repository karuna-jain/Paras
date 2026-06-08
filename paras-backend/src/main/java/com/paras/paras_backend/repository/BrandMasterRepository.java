package com.paras.paras_backend.repository;

import com.paras.paras_backend.model.BrandMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BrandMasterRepository extends JpaRepository<BrandMaster, Long> {
    Optional<BrandMaster> findByHeadCode(String headCode);
}
