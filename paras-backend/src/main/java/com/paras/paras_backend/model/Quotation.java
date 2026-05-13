package com.paras.paras_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Data
@Table(name = "quotations")
public class Quotation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String partyCd;
    private String customerName;
    private String address;
    private String city;
    private String remarks;
    private String quotationDate;
    private String contact;
    private String phone;
    private String cellNo;

    private Double amount = 0.0;

    @OneToMany(mappedBy = "quotation", cascade = CascadeType.ALL)
    private List<QuotationItem> items;
}
