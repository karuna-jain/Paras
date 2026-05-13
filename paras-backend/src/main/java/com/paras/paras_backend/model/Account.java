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
    private String addressOff;
    private String addressRes;
    private String city;
    private String dist;
    private String pinCode;
    private String state;
    private String inState; // Y/N
    private String stdCode;
    private String trackRoute;
    private String trackType;
    private String phO;
    private String phR;
    private String contactPerson;
    private String mobileNo;
    private String mobileSms;
    private String transport;
    private String emailId;
    private String rateType = "R"; // R / W
    private String bankName;
    private String branchName;
    private String bankAcNo;
    private String ifsc;
    private String gstin;
    private Integer crLimitDays = 0;
    private String gstCatg;
    private String gstEffDate;
    private String closeDay;
    private String salesPerson;
    private String remarks;
    private String acOpenDate;
    private Double openingBalance = 0.0;
    private Double balance = 0.0;
}
