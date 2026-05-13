package com.paras.paras_backend.repository;

import com.paras.paras_backend.model.HSNMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HSNMasterRepository extends JpaRepository<HSNMaster, Long> {
}
