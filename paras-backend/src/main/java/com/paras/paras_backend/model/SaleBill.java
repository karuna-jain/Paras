package com.paras.paras_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Data
@Table(name = "sale_bill")
@JsonIgnoreProperties(ignoreUnknown = true)
public class SaleBill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bill_no")
    private String billNo;

    @Column(name = "bill_date")
    private String billDate;

    @Column(name = "day_name")
    private String dayName;

    private String type; // CASH / CREDIT

    @Column(name = "change_yn")
    private String changeYn;

    @Column(name = "ac_no")
    private String acNo;

    @Column(name = "party_name")
    private String partyName;

    private String address;
    private String city;
    private String gstin;

    @Column(name = "in_state")
    private String inState; // Y / N

    private String state;
    private String code;
    private String remarks;

    @Column(name = "rate_format")
    private String rateFormat; // Wholesale / Retail (W/R)

    @Column(name = "print_copies")
    private Integer printCopies = 1;

    @Column(name = "print_disc")
    private String printDisc = "Y";

    private String transporter;

    @Column(name = "gr_no")
    private String grNo;

    @Column(name = "gr_date")
    private String grDate;

    @Column(name = "case_no")
    private String caseNo;

    @Column(name = "pvt_marka")
    private String pvtMarka;

    @Column(name = "eway_bill_no")
    private String ewayBillNo;

    @Column(name = "sale_amt")
    private Double saleAmt = 0.0;

    private Double cgst = 0.0;
    private Double sgst = 0.0;
    private Double igst = 0.0;
    private Double postage = 0.0;
    private Double freight = 0.0;
    private Double hammali = 0.0;

    @Column(name = "net_amt")
    private Double netAmt = 0.0;

    @Column(name = "pick_slip_id")
    private Long pickSlipId;

    @OneToMany(mappedBy = "bill", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SaleBillItem> items;
}
