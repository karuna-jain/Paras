package com.paras.paras_backend.controller;

import com.paras.paras_backend.model.HSNMaster;
import com.paras.paras_backend.repository.HSNMasterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/hsn-master")
@CrossOrigin("*")
public class HSNController {
    @Autowired
    private HSNMasterRepository hsnMasterRepository;

    @GetMapping
    public List<HSNMaster> getAllHSN() {
        return hsnMasterRepository.findAll();
    }

    @PostMapping
    public HSNMaster createHSN(@RequestBody HSNMaster hsn) {
        return hsnMasterRepository.save(hsn);
    }

    @DeleteMapping("/{id}")
    public void deleteHSN(@PathVariable Long id) {
        hsnMasterRepository.deleteById(id);
    }
}
