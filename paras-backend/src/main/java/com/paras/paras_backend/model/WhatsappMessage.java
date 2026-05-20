package com.paras.paras_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "whatsapp_messages")
public class WhatsappMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fromNumber;
    
    @Column(length = 2000)
    private String body;
    
    private String status; // PENDING, PROCESSED
    
    private String requestedAccountName;
    
    private LocalDateTime receivedAt;
}
