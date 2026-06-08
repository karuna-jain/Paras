package com.paras.paras_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Data
@Table(name = "account_ledger")
@JsonIgnoreProperties(ignoreUnknown = true)
public class AccountLedger {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ac_id")
    private Long acId;

    @Column(name = "ac_code")
    private String acCode;

    private Double amount = 0.0;

    private String dc; // D / C

    private String narration;

    @Column(name = "doc_no")
    private String docNo;

    private String source; // e.g. SAL[Prt], CASH, PHONE PAY, BANK, PICK

    private String date; // DD-MM-YYYY format or similar
}
