package com.changeguard.repository;

import com.changeguard.model.Change;
import com.changeguard.model.ServiceEntity;
import com.changeguard.model.enums.ChangeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChangeRepository extends JpaRepository<Change, Long> {
    List<Change> findByService(ServiceEntity service);
    List<Change> findByChangeType(ChangeType changeType);
    List<Change> findByComplexityGreaterThanEqual(Integer minComplexity);
}
