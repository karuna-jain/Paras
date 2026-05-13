package com.paras.paras_backend.controller;

import com.paras.paras_backend.model.ModelMaster;
import com.paras.paras_backend.repository.ModelRepos;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/models")
@CrossOrigin("*")
public class ModelController {

    @Autowired
    private ModelRepos repository;

    @GetMapping
    public List<ModelMaster> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public ModelMaster save(
            @RequestBody ModelMaster model) {
        return repository.save(model);
    }

    @PutMapping("/{id}")
    public ModelMaster update(
            @PathVariable Long id,
            @RequestBody ModelMaster updated) {

        return repository.findById(id)
                .map(m -> {

                    m.setCode(updated.getCode());
                    m.setName(updated.getName());

                    return repository.save(m);

                })
                .orElseThrow();
    }

    @DeleteMapping("/{id}")
    public void delete(
            @PathVariable Long id) {
        repository.deleteById(id);
    }
}