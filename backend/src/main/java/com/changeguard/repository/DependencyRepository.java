package com.changeguard.repository;

import com.changeguard.model.Dependency;
import com.changeguard.model.ServiceEntity;
import com.changeguard.model.enums.Criticality;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DependencyRepository extends JpaRepository<Dependency, Long> {
    List<Dependency> findBySourceService(ServiceEntity sourceService);
    List<Dependency> findByTargetService(ServiceEntity targetService);
    List<Dependency> findByCriticality(Criticality criticality);
    Optional<Dependency> findBySourceServiceAndTargetService(ServiceEntity source, ServiceEntity target);
    boolean existsBySourceServiceAndTargetService(ServiceEntity source, ServiceEntity target);
}
