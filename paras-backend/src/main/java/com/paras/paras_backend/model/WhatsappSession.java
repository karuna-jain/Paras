package com.paras.paras_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "whatsapp_sessions")
public class WhatsappSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String phoneNumber;
    
    @Column(length = 2000)
    private String orderText;
    
    private String state; // AWAITING_ACCOUNT
    
    private LocalDateTime updatedAt;
}
