package com.paras.paras_backend.repository;

import com.paras.paras_backend.model.SalesInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SalesInvoiceRepository extends JpaRepository<SalesInvoice, Long> {
}
