package com.paras.paras_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;

@Entity
@Data
@Table(name = "cb_voucher")
@JsonIgnoreProperties(ignoreUnknown = true)
public class CbVoucher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "voucher_no")
    private String voucherNo;

    @Column(name = "voucher_date")
    private String voucherDate;

    @Column(name = "total_dr")
    private BigDecimal totalDr = BigDecimal.ZERO;

    @Column(name = "total_cr")
    private BigDecimal totalCr = BigDecimal.ZERO;

    private String type; // Cash/Bank or Journal

    @OneToMany(mappedBy = "voucher", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CbVoucherLine> lines;
}
