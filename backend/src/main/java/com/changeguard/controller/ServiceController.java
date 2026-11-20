package com.changeguard.controller;

import com.changeguard.model.ServiceEntity;
import com.changeguard.service.ServiceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@CrossOrigin(origins = "*")
public class ServiceController {

    private final ServiceService serviceService;

    public ServiceController(ServiceService serviceService) {
        this.serviceService = serviceService;
    }

    @GetMapping
    public ResponseEntity<List<ServiceEntity>> getAllServices() {
        return ResponseEntity.ok(serviceService.getAllServices());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceEntity> getServiceById(@PathVariable Long id) {
        return ResponseEntity.ok(serviceService.getServiceById(id));
    }

    @GetMapping("/critical/{criticality}")
    public ResponseEntity<List<ServiceEntity>> getServicesByCriticality(@PathVariable String criticality) {
        return ResponseEntity.ok(serviceService.getServicesByCriticality(criticality));
    }

    @PostMapping
    public ResponseEntity<ServiceEntity> createService(@Valid @RequestBody ServiceEntity service) {
        ServiceEntity created = serviceService.createService(service);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
