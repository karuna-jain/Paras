package com.paras.paras_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Data
@Table(name = "sales_order")
@JsonIgnoreProperties(ignoreUnknown = true)
public class SalesOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ac_code")
    private String partyCd;

    @Column(name = "ac_name", nullable = false)
    private String customerName;

    private String address;
    private String city;
    private String contact;

    @Column(name = "phone_std")
    private String phoneStd;

    @Column(name = "phone_o")
    private String phoneO;

    @Column(name = "phone_r")
    private String phoneR;

    @Column(name = "cell_no")
    private String cellNo;

    private String transport;
    private String remarks;

    @Column(name = "order_date")
    private String orderDate;

    @Column(name = "rate_type")
    private String rateType; // W / R

    @Column(name = "total_amount")
    private Double amount = 0.0;

    @Column(name = "inv_no")
    private String invNo;

    @Column(name = "pick_slip_saved")
    private boolean pickSlipSaved = false;

    @Column(name = "gp_percent")
    private Double gpPercent = 0.0;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    private boolean billed = false;

    @Column(name = "is_return_bill")
    private boolean isReturn = false;

    @OneToMany(
            mappedBy = "order",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<SalesOrderItem> items;
}
