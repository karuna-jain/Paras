package com.paras.paras_backend.repository;

import com.paras.paras_backend.model.Part;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PartRepository extends JpaRepository<Part, Long> {

    // Search by brand
    List<Part> findByBrandIgnoreCase(String brand);

    // Search by part number
    java.util.Optional<Part> findByPartNo(String partNo);
    List<Part> findByPartNoContainingIgnoreCase(String partNo);

    // Search by description
    List<Part> findByDescriptionContainingIgnoreCase(String description);

    // Search by model
    List<Part> findByModelIgnoreCase(String model);
}