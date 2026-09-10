package com.paras.paras_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;

@Entity
@Data
@Table(name = "account_ledger",
  indexes = {
    @Index(name = "idx_ledger_ac_code", columnList = "ac_code"),
    @Index(name = "idx_ledger_ac_date", columnList = "ac_code,date")
  }
)
@JsonIgnoreProperties(ignoreUnknown = true)
public class AccountLedger {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ac_id")
    private Long acId;

    @Column(name = "ac_code")
    private String acCode;

    private BigDecimal amount = BigDecimal.ZERO;

    private String dc; // D / C

    private String narration;

    @Column(name = "doc_no")
    private String docNo;

    private String source; // e.g. SAL[Prt], CASH, PHONE PAY, BANK, PICK

    private String date; // DD-MM-YYYY format or similar
}
