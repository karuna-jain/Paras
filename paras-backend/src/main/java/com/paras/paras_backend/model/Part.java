package com.paras.paras_backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Entity
@Table(name = "part")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Part {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String brand;

    @Column(name = "part_no")
    @JsonProperty("partNo")
    private String partNo;

    private String description;
    private String model;
    private String models;
    private String hsn;

    @Column(name = "hsn_desc")
    @JsonProperty("hsnDesc")
    private String hsnDesc;

    private String gst;
    private BigDecimal mrp;

    @Column(name = "purchase_price")
    @JsonProperty("purchasePrice")
    private BigDecimal purchasePrice;

    @Column(name = "purchase_discount")
    @JsonProperty("purchaseDiscount")
    private BigDecimal purchaseDiscount;

    @Column(name = "purchase_final")
    @JsonProperty("purchaseFinal")
    private BigDecimal purchaseFinal;

    @Column(name = "wholesale_price")
    @JsonProperty("wholesalePrice")
    private BigDecimal wholesalePrice;

    @Column(name = "wholesale_discount")
    @JsonProperty("wholesaleDiscount")
    private BigDecimal wholesaleDiscount;

    @Column(name = "wholesale_final")
    @JsonProperty("wholesaleFinal")
    private BigDecimal wholesaleFinal;

    @Column(name = "retail_price")
    @JsonProperty("retailPrice")
    private BigDecimal retailPrice;

    @Column(name = "retail_discount")
    @JsonProperty("retailDiscount")
    private BigDecimal retailDiscount;

    @Column(name = "retail_final")
    @JsonProperty("retailFinal")
    private BigDecimal retailFinal;

    private Integer opening;
    private Integer reorder;

    @Column(name = "max_lvl")
    @JsonProperty("maxLvl")
    private Integer maxLvl;

    @Column(name = "item_unit")
    @JsonProperty("itemUnit")
    private String itemUnit;

    @Column(name = "pack_of")
    @JsonProperty("packOf")
    private Integer packOf;

    @Column(name = "location_i")
    @JsonProperty("locationI")
    private String locationI;

    private String remarks;
}