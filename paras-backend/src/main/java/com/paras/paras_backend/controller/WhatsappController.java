package com.paras.paras_backend.controller;

import com.paras.paras_backend.model.WhatsappMessage;
import com.paras.paras_backend.repository.WhatsappMessageRepository;
import com.paras.paras_backend.model.Account;
import com.paras.paras_backend.repository.AccountRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;

import com.paras.paras_backend.model.WhatsappSession;
import com.paras.paras_backend.repository.WhatsappSessionRepository;
import java.util.Optional;

@RestController
@RequestMapping("/api/whatsapp")
public class WhatsappController {

    @Autowired
    private WhatsappMessageRepository whatsappMessageRepository;

    @Autowired
    private WhatsappSessionRepository whatsappSessionRepository;

    @Autowired
    private AccountRepository accountRepository;

    @PostMapping(value = "/webhook", produces = MediaType.APPLICATION_XML_VALUE, consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public String handleWebhook(
            @RequestParam("Body") String body,
            @RequestParam("From") String from,
            @RequestParam(value = "ProfileName", required = false) String profileName) {

        System.out.println("Received WhatsApp message from: " + from);
        System.out.println("Body: " + body);

        String lowerBody = body.trim().toLowerCase();

        // Check if it's a balance query
        if (lowerBody.startsWith("balance ") || lowerBody.equals("balance")) {
            String accountName = body.trim().substring(lowerBody.startsWith("balance ") ? 8 : 7).trim();
            if (accountName.isEmpty()) {
                return createTwimlResponse("Please specify the account name. Example: 'balance Karuna Jain'");
            }
            
            List<Account> accounts = accountRepository.findByNameContainingIgnoreCase(accountName);
            if (accounts.isEmpty()) {
                return createTwimlResponse("No account found matching '" + accountName + "'.");
            } else if (accounts.size() == 1) {
                Account acc = accounts.get(0);
                Double bal = acc.getBalance() != null ? acc.getBalance() : 0.0;
                String type = bal >= 0 ? "Dr" : "Cr";
                return createTwimlResponse("Balance for " + acc.getName() + " is ₹" + String.format("%.2f", Math.abs(bal)) + " " + type);
            } else {
                StringBuilder sb = new StringBuilder("Multiple accounts found. Please be more specific:\n");
                for (int i = 0; i < Math.min(accounts.size(), 5); i++) {
                    sb.append("- ").append(accounts.get(i).getName()).append("\n");
                }
                return createTwimlResponse(sb.toString().trim());
            }
        }

        // Strip 'whatsapp:' prefix
        String phone = from.replace("whatsapp:", "").replace("+", "");
        
        Optional<WhatsappSession> optionalSession = whatsappSessionRepository.findByPhoneNumber(phone);
        
        if (optionalSession.isEmpty()) {
            // New order received
            WhatsappSession session = new WhatsappSession();
            session.setPhoneNumber(phone);
            session.setOrderText(body);
            session.setState("AWAITING_ACCOUNT");
            session.setUpdatedAt(LocalDateTime.now());
            whatsappSessionRepository.save(session);
            
            return createTwimlResponse("In which account do you want to make the bill?");
        } else {
            // Existing session, expecting account name
            WhatsappSession session = optionalSession.get();
            String accountName = body.trim();
            
            WhatsappMessage message = new WhatsappMessage();
            message.setFromNumber(phone);
            message.setBody(session.getOrderText());
            message.setRequestedAccountName(accountName);
            message.setStatus("PENDING");
            message.setReceivedAt(LocalDateTime.now());
            
            whatsappMessageRepository.save(message);
            whatsappSessionRepository.delete(session);

            return createTwimlResponse("Your order for " + accountName + " has been received and is pending review.");
        }
    }
    
    @GetMapping("/pending")
    public ResponseEntity<WhatsappMessage> getPendingMessage() {
        List<WhatsappMessage> pendingMessages = whatsappMessageRepository.findByStatusOrderByReceivedAtAsc("PENDING");
        if (!pendingMessages.isEmpty()) {
            return ResponseEntity.ok(pendingMessages.get(0));
        }
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/mark-processed/{id}")
    public ResponseEntity<Void> markProcessed(@PathVariable Long id) {
        whatsappMessageRepository.findById(id).ifPresent(msg -> {
            msg.setStatus("PROCESSED");
            whatsappMessageRepository.save(msg);
        });
        return ResponseEntity.ok().build();
    }

    private String createTwimlResponse(String message) {
        return "<Response><Message>" + escapeXml(message) + "</Message></Response>";
    }

    private String escapeXml(String s) {
        return s.replaceAll("&", "&amp;")
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;")
                .replaceAll("\"", "&quot;")
                .replaceAll("'", "&apos;");
    }
}
