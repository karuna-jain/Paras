package com.paras.paras_backend.controller;

import com.paras.paras_backend.model.Part;
import com.paras.paras_backend.repository.PartRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parts")
@CrossOrigin("*")
public class PartController {

    @Autowired
    private PartRepository partRepository;

    @GetMapping
    public List<Part> getAllParts() {
        return partRepository.findAll();
    }

    @PostMapping
    public Part createPart(@RequestBody Part part) {
        return partRepository.save(part);
    }

    @PutMapping("/{id}")
    public Part updatePart(
            @PathVariable Long id,
            @RequestBody Part updatedPart) {

        return partRepository.findById(id)
                .map(part -> {

                    part.setBrand(updatedPart.getBrand());
                    part.setPartNo(updatedPart.getPartNo());
                    part.setDescription(updatedPart.getDescription());
                    part.setModel(updatedPart.getModel());
                    // part.setHsn(updatedPart.getHsn());
                    // part.setGst(updatedPart.getGst());

                    return partRepository.save(part);
                })
                .orElseThrow();
    }

    @DeleteMapping("/{id}")
    public void deletePart(@PathVariable Long id) {
        partRepository.deleteById(id);
    }
}