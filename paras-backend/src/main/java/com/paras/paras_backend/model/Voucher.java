package com.paras.paras_backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "vouchers")
public class Voucher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String vType; 
    private String date;
    
    private String partyCd;
    
    private Double amount = 0.0;
    private String crDr; // CR or DR
    private String remarks;
}
