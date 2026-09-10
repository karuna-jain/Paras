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

    @jakarta.validation.constraints.NotBlank(message = "HSN Code is required")
    @Column(name = "hsn_code", unique = true, nullable = false, length = 15)
    private String hsnCode;

    private String description;

    @jakarta.validation.constraints.NotNull(message = "GST Rate is required")
    private Double gstRate = 0.0;
    private Double cgstRate = 0.0;
    private Double sgstRate = 0.0;
    private Double igstRate = 0.0;
}
