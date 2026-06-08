package com.paras.paras_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Data
@Table(name = "account_balance")
@JsonIgnoreProperties(ignoreUnknown = true)
public class AccountBalance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ac_id")
    private Long acId;

    @Column(name = "ac_code")
    private String acCode;

    private Double amount = 0.0;

    private String dc; // D / C

    private String date;
}
