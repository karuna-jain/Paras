package com.paras.paras_backend.controller;

import com.paras.paras_backend.model.Part;
import com.paras.paras_backend.repository.PartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@RestController
@RequestMapping("/api/parts")
@CrossOrigin(origins = "http://localhost:5173")
public class PartsController {

    @Autowired
    private PartRepository partRepository;

    // ── GET all ───────────────────────────────────────────────────────
    @GetMapping
    public List<Part> getAllParts() {
        return partRepository.findAll();
    }

    // ── GET by ID ─────────────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<Part> getById(@PathVariable Long id) {
        return partRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ── GET Price List ────────────────────────────────────────────────
    @GetMapping("/price-list")
    public List<Part> getPriceList(
            @RequestParam(defaultValue = "ALL") String brand,
            @RequestParam(defaultValue = "ALL") String model) {
        
        List<Part> allParts = partRepository.findAll();
        return allParts.stream()
                .filter(p -> "ALL".equalsIgnoreCase(brand) || (p.getBrand() != null && p.getBrand().equalsIgnoreCase(brand)))
                .filter(p -> "ALL".equalsIgnoreCase(model) || (p.getModel() != null && p.getModel().toLowerCase().contains(model.toLowerCase())))
                .toList();
    }

    // ── POST — add new part ───────────────────────────────────────────
    @PostMapping
    public ResponseEntity<Part> addPart(@RequestBody Part part) {
        calculateFinalPrices(part);
        Part saved = partRepository.save(part);
        return ResponseEntity.ok(saved);
    }

    // ── PUT — update existing part ────────────────────────────────────

    @PutMapping("/{id}")
    public ResponseEntity<Part> updatePart(
            @PathVariable Long id,
            @RequestBody Part updatedPart) {

        // If ID doesn't exist in DB (e.g. local temp ID), return 404 clearly
        if (!partRepository.existsById(id)) {
            return ResponseEntity.status(404).build();
        }

        return partRepository.findById(id).map(existing -> {
            existing.setBrand(updatedPart.getBrand());
            existing.setPartNo(updatedPart.getPartNo());
            existing.setDescription(updatedPart.getDescription());
            existing.setModel(updatedPart.getModel());
            existing.setModels(updatedPart.getModels());
            existing.setHsn(updatedPart.getHsn());
            existing.setHsnDesc(updatedPart.getHsnDesc());
            existing.setGst(updatedPart.getGst());
            existing.setPurchasePrice(updatedPart.getPurchasePrice());
            existing.setPurchaseDiscount(updatedPart.getPurchaseDiscount());
            existing.setWholesalePrice(updatedPart.getWholesalePrice());
            existing.setWholesaleDiscount(updatedPart.getWholesaleDiscount());
            existing.setRetailPrice(updatedPart.getRetailPrice());
            existing.setRetailDiscount(updatedPart.getRetailDiscount());
            existing.setMrp(updatedPart.getMrp());
            existing.setOpening(updatedPart.getOpening());
            existing.setReorder(updatedPart.getReorder());
            existing.setMaxLvl(updatedPart.getMaxLvl());
            existing.setItemUnit(updatedPart.getItemUnit());
            existing.setPackOf(updatedPart.getPackOf());
            existing.setLocationI(updatedPart.getLocationI());
            existing.setRemarks(updatedPart.getRemarks());
            calculateFinalPrices(existing);
            return ResponseEntity.ok(partRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── DELETE ────────────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePart(@PathVariable Long id) {
        if (!partRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        partRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ── Final price calculation ───────────────────────────────────────
    private void calculateFinalPrices(Part part) {
        part.setPurchaseFinal(calcFinal(part.getPurchasePrice(), part.getPurchaseDiscount()));
        part.setWholesaleFinal(calcFinal(part.getWholesalePrice(), part.getWholesaleDiscount()));
        part.setRetailFinal(calcFinal(part.getRetailPrice(), part.getRetailDiscount()));
    }

    private BigDecimal calcFinal(BigDecimal price, BigDecimal discount) {
        if (price == null)
            return BigDecimal.ZERO;
        if (discount == null || discount.compareTo(BigDecimal.ZERO) == 0)
            return price;
        BigDecimal discountAmount = price
                .multiply(discount)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        return price.subtract(discountAmount).setScale(2, RoundingMode.HALF_UP);
    }
}