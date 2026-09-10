package com.paras.paras_backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "models")
public class ModelMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @jakarta.validation.constraints.NotBlank(message = "Model code cannot be blank")
    @Column(unique = true, nullable = false, length = 20)
    private String code;

    @jakarta.validation.constraints.NotBlank(message = "Model name cannot be blank")
    @Column(nullable = false)
    private String name;
}