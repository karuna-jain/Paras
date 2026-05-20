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

    private String partyCd;
    private String customerName;
    private String date;

    private Double amount = 0.0;
    private Double paidAmount = 0.0;
    private Long fromOrderId;
    @Column(name = "is_return_bill")
    private boolean isReturn = false;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL)
    private List<SalesInvoiceItem> items;
}
