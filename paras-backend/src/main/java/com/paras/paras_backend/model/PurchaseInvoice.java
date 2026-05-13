package com.paras.paras_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Data
@Table(name = "purchase_invoices")
public class PurchaseInvoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String invoiceNo;

    private String partyCd;
    private String supplierName;
    private String date;

    private Double amount = 0.0;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL)
    private List<PurchaseInvoiceItem> items;
}
