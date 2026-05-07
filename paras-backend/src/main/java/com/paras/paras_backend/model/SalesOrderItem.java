package com.paras.paras_backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "sales_order_items")
public class SalesOrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private SalesOrder order;

    private String brand;
    private String partNo;
    private String description;
    private String model;

    private Double qty = 1.0;
    private Double rate = 0.0;
    private Double discountPercent = 0.0;
    private Double amount = 0.0;

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }
}
