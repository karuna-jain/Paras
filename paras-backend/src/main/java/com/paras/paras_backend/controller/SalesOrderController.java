package com.paras.paras_backend.controller;

import com.paras.paras_backend.model.SalesOrder;
import com.paras.paras_backend.repository.AccountRepository;
import com.paras.paras_backend.repository.SalesOrderRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales-orders")
@CrossOrigin("*")
public class SalesOrderController {

    @Autowired
    private SalesOrderRepository salesOrderRepository;

    @Autowired
    private AccountRepository accountRepository;

    @GetMapping
    public List<SalesOrder> getAllSalesOrders() {
        return salesOrderRepository.findAll();
    }

    @PostMapping
    public SalesOrder createSalesOrder(@RequestBody SalesOrder salesOrder) {

        if (salesOrder.getItems() != null) {
            salesOrder.getItems().forEach(item -> item.setOrder(salesOrder));
        }

        SalesOrder savedOrder = salesOrderRepository.save(salesOrder);

        updateAccountBalance(
                savedOrder.getPartyCd(),
                savedOrder.getAmount());

        return savedOrder;
    }

    @PutMapping("/{id}")
    public SalesOrder updateSalesOrder(
            @PathVariable Long id,
            @RequestBody SalesOrder updatedOrder) {

        return salesOrderRepository.findById(id)
                .map(order -> {

                    order.setPartyCd(updatedOrder.getPartyCd());
                    order.setCustomerName(updatedOrder.getCustomerName());
                    order.setAddress(updatedOrder.getAddress());
                    order.setCity(updatedOrder.getCity());
                    order.setRemarks(updatedOrder.getRemarks());
                    order.setOrderDate(updatedOrder.getOrderDate());
                    order.setAmount(updatedOrder.getAmount());

                    order.getItems().clear();

                    if (updatedOrder.getItems() != null) {

                        updatedOrder.getItems().forEach(item -> {
                            item.setOrder(order);
                            order.getItems().add(item);
                        });
                    }

                    return salesOrderRepository.save(order);
                })
                .orElseThrow();
    }

    @DeleteMapping("/{id}")
    public void deleteSalesOrder(@PathVariable Long id) {

        salesOrderRepository.findById(id).ifPresent(order -> {

            updateAccountBalance(
                    order.getPartyCd(),
                    -(order.getAmount() != null ? order.getAmount() : 0.0));

            salesOrderRepository.delete(order);
        });
    }

    private void updateAccountBalance(String partyCd, Double amount) {

        try {

            if (partyCd != null && !partyCd.isEmpty()) {

                Integer acCode = Integer.parseInt(partyCd);

                accountRepository.findByAcCode(acCode)
                        .ifPresent(account -> {

                            account.setBalance(
                                    (account.getBalance() != null
                                            ? account.getBalance()
                                            : 0.0)
                                            + (amount != null ? amount : 0.0));

                            accountRepository.save(account);
                        });
            }

        } catch (NumberFormatException e) {

            System.out.println("Invalid account code");

        }
    }
}