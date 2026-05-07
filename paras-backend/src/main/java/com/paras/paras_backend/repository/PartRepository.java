package com.paras.paras_backend.repository;

import com.paras.paras_backend.model.Part;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PartRepository extends JpaRepository<Part, Long> {
}