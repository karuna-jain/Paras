package com.paras.paras_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Data
@Table(name = "purchase_item")
@JsonIgnoreProperties(ignoreUnknown = true)
public class PurchaseItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "purchase_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Purchase purchase;

    private String brand;

    @Column(name = "part_no")
    private String partNo;

    private String description;
    private String model;
    private Double qty = 0.0;

    @Column(name = "purchase_rate")
    private Double purchaseRate = 0.0;

    private Double amount = 0.0;
    private String hsn;

    @Column(name = "gst_percent")
    private Double gstPercent = 0.0;
}
