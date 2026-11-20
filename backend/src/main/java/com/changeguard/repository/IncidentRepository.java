package com.changeguard.repository;

import com.changeguard.model.Change;
import com.changeguard.model.Incident;
import com.changeguard.model.enums.Severity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {
    List<Incident> findBySeverity(Severity severity);
    List<Incident> findByFailure(Boolean failure);
    List<Incident> findByChange(Change change);
}
