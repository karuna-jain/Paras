package com.paras.paras_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Data
@Table(name = "quotation_items")
public class QuotationItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "quotation_id")
    @JsonIgnore
    private Quotation quotation;

    private String brand;
    private String partNo;
    private String description;
    private Double qty = 0.0;
    private Double rate = 0.0;
    private Double amount = 0.0;
}
