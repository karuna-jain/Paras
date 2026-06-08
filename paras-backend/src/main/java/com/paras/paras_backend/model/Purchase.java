package com.paras.paras_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Data
@Table(name = "purchase")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Purchase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bill_no")
    private String billNo;

    @Column(name = "bill_date")
    private String billDate;

    private String type; // CASH / CREDIT

    @Column(name = "change_yn")
    private String changeYn;

    @Column(name = "supplier_code")
    private String supplierCode;

    @Column(name = "supplier_name")
    private String supplierName;

    private String address;
    private String city;

    @Column(name = "total_amount")
    private Double totalAmount = 0.0;

    private Double cgst = 0.0;
    private Double sgst = 0.0;
    private Double igst = 0.0;

    @Column(name = "net_amount")
    private Double netAmount = 0.0;

    @OneToMany(mappedBy = "purchase", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurchaseItem> items;
}
