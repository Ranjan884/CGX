package com.changeguard.repository;

import com.changeguard.model.ServiceEntity;
import com.changeguard.model.enums.Criticality;
import com.changeguard.model.enums.ServiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceRepository extends JpaRepository<ServiceEntity, Long> {
    Optional<ServiceEntity> findByName(String name);
    List<ServiceEntity> findByCriticality(Criticality criticality);
    List<ServiceEntity> findByStatus(ServiceStatus status);
    boolean existsByName(String name);
}
