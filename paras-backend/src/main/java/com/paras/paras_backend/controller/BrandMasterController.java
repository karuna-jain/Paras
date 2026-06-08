package com.paras.paras_backend.controller;

import com.paras.paras_backend.model.BrandMaster;
import com.paras.paras_backend.repository.BrandMasterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/brands")
@CrossOrigin("*")
public class BrandMasterController {

    @Autowired
    private BrandMasterRepository repository;

    @GetMapping
    public List<BrandMaster> getAll() {
        return repository.findAll();
    }

    @GetMapping("/{code}")
    public BrandMaster getByCode(@PathVariable String code) {
        return repository.findByHeadCode(code).orElseThrow();
    }

    @PostMapping
    public BrandMaster save(@RequestBody BrandMaster brand) {
        if (brand.getShortName() == null || brand.getShortName().trim().isEmpty()) {
            brand.setShortName(brand.getHeadName());
        }
        
        Optional<BrandMaster> existing = repository.findByHeadCode(brand.getHeadCode());
        if (existing.isPresent()) {
            throw new RuntimeException("Brand code already exists.");
        }

        return repository.save(brand);
    }

    @PutMapping("/{id}")
    public BrandMaster update(@PathVariable Long id, @RequestBody BrandMaster updated) {
        return repository.findById(id)
                .map(b -> {
                    b.setHeadCode(updated.getHeadCode());
                    b.setHeadName(updated.getHeadName());
                    b.setShortName(updated.getShortName() != null ? updated.getShortName() : updated.getHeadName());
                    return repository.save(b);
                })
                .orElseThrow();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
