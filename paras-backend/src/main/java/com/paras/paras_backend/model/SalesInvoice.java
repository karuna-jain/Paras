package com.paras.paras_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Data
@Table(name = "sales_invoices")
public class SalesInvoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String billType; // RETAIL / WHOLESALE
    private String invoiceNo;

    private Integer acCode;
    private String customerName;
    private String date;

    private Double totalAmount = 0.0;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL)
    private List<SalesInvoiceItem> items;
}
