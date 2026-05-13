package com.paras.paras_backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "hsn_master")
public class HSNMaster {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String hsnCode;
    private String description;
    private Double gstRate = 0.0;
    private Double cgstRate = 0.0;
    private Double sgstRate = 0.0;
    private Double igstRate = 0.0;
}
