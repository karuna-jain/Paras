package com.paras.paras_backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "purchase_invoice_items")
public class PurchaseInvoiceItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "invoice_id")
    private PurchaseInvoice invoice;

    private Long partId;
    
    private Double qty = 1.0;
    private Double rate = 0.0;
    private Double amount = 0.0;
}
