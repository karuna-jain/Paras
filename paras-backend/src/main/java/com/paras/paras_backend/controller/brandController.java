package com.paras.paras_backend.controller;

import com.paras.paras_backend.model.brand;
import com.paras.paras_backend.repository.BrandRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/brands")
@CrossOrigin("*")
public class brandController {

    @Autowired
    private BrandRepository repository;

    @GetMapping
    public List<brand> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public brand save(
            @RequestBody brand brand) {

        if (repository.existsByCode(
                brand.getCode())) {

            throw new RuntimeException(
                    "Brand code already exists.");
        }

        return repository.save(brand);
    }

    @PutMapping("/{id}")
    public brand update(
            @PathVariable Long id,
            @RequestBody brand updated) {

        return repository.findById(id)
                .map(b -> {

                    b.setCode(updated.getCode());
                    b.setName(updated.getName());

                    return repository.save(b);

                })
                .orElseThrow();
    }

    @DeleteMapping("/{id}")
    public void delete(
            @PathVariable Long id) {
        repository.deleteById(id);
    }
}