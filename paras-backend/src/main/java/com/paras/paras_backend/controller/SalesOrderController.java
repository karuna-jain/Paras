package com.paras.paras_backend.controller;

import com.paras.paras_backend.model.SalesOrder;
import com.paras.paras_backend.model.SalesOrderItem;
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
    public List<SalesOrder> getAllSalesOrders(@RequestParam(required = false) Boolean billed) {
        if (billed != null) {
            return salesOrderRepository.findByBilled(billed);
        }
        return salesOrderRepository.findAll();
    }

    @GetMapping("/{id}")
    public SalesOrder getSalesOrderById(@PathVariable Long id) {
        return salesOrderRepository.findById(id).orElseThrow();
    }

    @PatchMapping("/{id}/mark-billed")
    public SalesOrder markAsBilled(
            @PathVariable Long id,
            @RequestParam String billNo) {
        return salesOrderRepository.findById(id)
                .map(order -> {
                    order.setBilled(true);
                    order.setInvNo(billNo);
                    return salesOrderRepository.save(order);
                })
                .orElseThrow();
    }

    @PostMapping
    public SalesOrder createSalesOrder(@RequestBody SalesOrder salesOrder) {
        if (salesOrder.getItems() != null) {
            salesOrder.getItems().forEach(item -> {
                item.setOrder(salesOrder);
                if (item.getPickQty() == null || item.getPickQty() == 0.0) {
                    item.setPickQty(item.getQty());
                }
            });
        }
        return salesOrderRepository.save(salesOrder);
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
                    order.setContact(updatedOrder.getContact());
                    order.setPhoneStd(updatedOrder.getPhoneStd());
                    order.setPhoneO(updatedOrder.getPhoneO());
                    order.setPhoneR(updatedOrder.getPhoneR());
                    order.setCellNo(updatedOrder.getCellNo());
                    order.setTransport(updatedOrder.getTransport());
                    order.setRemarks(updatedOrder.getRemarks());
                    order.setOrderDate(updatedOrder.getOrderDate());
                    order.setRateType(updatedOrder.getRateType());
                    order.setAmount(updatedOrder.getAmount());
                    order.setGpPercent(updatedOrder.getGpPercent());
                    order.setPickSlipSaved(updatedOrder.isPickSlipSaved());
                    order.setInvNo(updatedOrder.getInvNo());

                    order.getItems().clear();

                    if (updatedOrder.getItems() != null) {
                        updatedOrder.getItems().forEach(item -> {
                            item.setOrder(order);
                            if (item.getPickQty() == null || item.getPickQty() == 0.0) {
                                item.setPickQty(item.getQty());
                            }
                            order.getItems().add(item);
                        });
                    }

                    return salesOrderRepository.save(order);
                })
                .orElseThrow();
    }

    @PutMapping("/{id}/pick-slip")
    public SalesOrder savePickSlip(
            @PathVariable Long id,
            @RequestBody SalesOrder updatedOrder) {
        return salesOrderRepository.findById(id)
                .map(order -> {
                    order.setPickSlipSaved(true);
                    
                    // Update pick quantities on items
                    if (updatedOrder.getItems() != null) {
                        for (SalesOrderItem updatedItem : updatedOrder.getItems()) {
                            for (SalesOrderItem item : order.getItems()) {
                                if (item.getPartNo().equals(updatedItem.getPartNo())) {
                                    item.setPickQty(updatedItem.getPickQty());
                                    break;
                                }
                            }
                        }
                    }
                    return salesOrderRepository.save(order);
                })
                .orElseThrow();
    }

    @DeleteMapping("/{id}")
    public void deleteSalesOrder(@PathVariable Long id) {
        salesOrderRepository.findById(id).ifPresent(order -> {
            salesOrderRepository.delete(order);
        });
    }

    // ── PICK SLIPS LIST ENDPOINTS ──

    @GetMapping("/pick-slips")
    public List<SalesOrder> getPickSlips(
            @RequestParam(defaultValue = "ALL") String filter,
            @RequestParam(defaultValue = "ALL") String partyCode) {
        
        // Find orders where pickSlipSaved = true
        List<SalesOrder> all = salesOrderRepository.findAll();
        String today = new java.text.SimpleDateFormat("yyyy-MM-dd").format(new java.util.Date());
        
        return all.stream()
                .filter(SalesOrder::isPickSlipSaved)
                .filter(o -> "ALL".equalsIgnoreCase(partyCode) || (o.getPartyCd() != null && o.getPartyCd().equals(partyCode)))
                .filter(o -> {
                    if ("TODAY".equalsIgnoreCase(filter)) {
                        return today.equals(o.getOrderDate());
                    } else if ("YESTERDAY".equalsIgnoreCase(filter)) {
                        // yesterday calculation
                        java.util.Calendar cal = java.util.Calendar.getInstance();
                        cal.add(java.util.Calendar.DATE, -1);
                        String yesterday = new java.text.SimpleDateFormat("yyyy-MM-dd").format(cal.getTime());
                        return yesterday.equals(o.getOrderDate());
                    }
                    return true;
                })
                .toList();
    }

    @PutMapping("/pick-slips/{orderId}/inv-no")
    public SalesOrder updatePickSlipInvNo(
            @PathVariable Long orderId,
            @RequestParam String invNo) {
        return salesOrderRepository.findById(orderId)
                .map(order -> {
                    order.setInvNo(invNo);
                    order.setBilled(true);
                    return salesOrderRepository.save(order);
                })
                .orElseThrow();
    }
}