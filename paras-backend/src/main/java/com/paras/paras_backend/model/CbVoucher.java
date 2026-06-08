package com.paras.paras_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

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
    private Double totalDr = 0.0;

    @Column(name = "total_cr")
    private Double totalCr = 0.0;

    @OneToMany(mappedBy = "voucher", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CbVoucherLine> lines;
}
