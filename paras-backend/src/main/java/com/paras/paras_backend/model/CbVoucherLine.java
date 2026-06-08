package com.paras.paras_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Data
@Table(name = "cb_voucher_line")
@JsonIgnoreProperties(ignoreUnknown = true)
public class CbVoucherLine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "voucher_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private CbVoucher voucher;

    @Column(name = "ac_id")
    private Long acId;

    @Column(name = "ac_code")
    private String acCode;

    @Column(name = "ac_name")
    private String acName;

    @Column(name = "dr_cr")
    private String drCr; // DR / CR

    private Double amount = 0.0;
    private String narration;
}
