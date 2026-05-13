package com.paras.paras_backend.repository;

import com.paras.paras_backend.model.ModelMaster;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ModelRepos
                extends JpaRepository<ModelMaster, Long> {
}