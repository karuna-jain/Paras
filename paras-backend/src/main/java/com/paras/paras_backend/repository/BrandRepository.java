package com.paras.paras_backend.repository;

import com.paras.paras_backend.model.brand;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BrandRepository
                extends JpaRepository<brand, Long> {
        boolean existsByCode(String code);
}