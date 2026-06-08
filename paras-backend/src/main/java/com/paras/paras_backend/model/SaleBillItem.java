package com.paras.paras_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Data
@Table(name = "sale_bill_item")
@JsonIgnoreProperties(ignoreUnknown = true)
public class SaleBillItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "bill_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private SaleBill bill;

    private String brand;

    @Column(name = "part_no")
    private String partNo;

    private String description;
    private Integer stock = 0;
    private String model;
    private Double qty = 0.0;

    @Column(name = "list_price")
    private Double listPrice = 0.0;

    private Double discount = 0.0;
    private Double rate = 0.0;
    private Double amount = 0.0;

    @Column(name = "n_pur")
    private Double nPur = 0.0;

    private String hsn;

    @Column(name = "gst_percent")
    private Double gstPercent = 0.0;
}
