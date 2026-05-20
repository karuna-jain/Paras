package com.paras.paras_backend.repository;

import com.paras.paras_backend.model.WhatsappSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WhatsappSessionRepository extends JpaRepository<WhatsappSession, Long> {
    Optional<WhatsappSession> findByPhoneNumber(String phoneNumber);
}
