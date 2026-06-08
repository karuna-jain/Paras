package com.paras.paras_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Data
@Table(name = "brand_master")
@JsonIgnoreProperties(ignoreUnknown = true)
public class BrandMaster {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "head_code", length = 4, unique = true, nullable = false)
    @JsonProperty("code")
    private String headCode;

    @Column(name = "head_name")
    @JsonProperty("name")
    private String headName;

    @Column(name = "short_name")
    @JsonProperty("shortName")
    private String shortName;
}
