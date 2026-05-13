package com.paras.paras_backend.controller;

import com.paras.paras_backend.model.Quotation;
import com.paras.paras_backend.repository.QuotationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/quotations")
@CrossOrigin("*")
public class QuotationController {
    @Autowired
    private QuotationRepository quotationRepository;

    @GetMapping
    public List<Quotation> getAllQuotations() {
        return quotationRepository.findAll();
    }

    @PostMapping
    public Quotation createQuotation(@RequestBody Quotation quotation) {
        if (quotation.getItems() != null) {
            quotation.getItems().forEach(item -> item.setQuotation(quotation));
        }
        return quotationRepository.save(quotation);
    }

    @DeleteMapping("/{id}")
    public void deleteQuotation(@PathVariable Long id) {
        quotationRepository.deleteById(id);
    }
}
