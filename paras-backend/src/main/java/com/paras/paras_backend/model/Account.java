package com.paras.paras_backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "accounts")
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private Integer acCode;

    private Integer headCode; // 1 = Debtors, 2 = Creditors

    @Column(nullable = false)
    private String name;

    private String address;
    private String city;
    private String phone;

    private String rateType = "R"; // R / W

    private Double openingBalance = 0.0;
    private Double balance = 0.0;
}
