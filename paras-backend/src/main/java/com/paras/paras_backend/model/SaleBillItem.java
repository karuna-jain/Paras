package com.paras.paras_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;

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
    private BigDecimal listPrice = BigDecimal.ZERO;

    private BigDecimal discount = BigDecimal.ZERO;
    private BigDecimal rate = BigDecimal.ZERO;
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(name = "n_pur")
    private BigDecimal nPur = BigDecimal.ZERO;

    private String hsn;

    @Column(name = "gst_percent")
    private BigDecimal gstPercent = BigDecimal.ZERO;
}
