package com.paras.paras_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Data
@Table(name = "sales_order_item")
@JsonIgnoreProperties(ignoreUnknown = true)
public class SalesOrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private SalesOrder order;

    private String brand;

    @Column(name = "part_no")
    private String partNo;

    private String description;
    private String model;
    private Integer stock = 0;

    @Column(name = "ord_qty")
    private Double qty = 1.0;

    @Column(name = "pick_qty")
    private Double pickQty = 0.0;

    @Column(name = "list_price")
    @JsonProperty("rate")
    private Double rate = 0.0;

    @JsonProperty("discount")
    private Double discountPercent = 0.0;

    @Column(name = "net_sale")
    private Double netSale = 0.0;

    private Double amount = 0.0;

    @Column(name = "net_pur")
    private Double netPur = 0.0;

    @Column(name = "locn_i")
    private String locnI;

    @Column(name = "locn_ii")
    private String locnII;
}
