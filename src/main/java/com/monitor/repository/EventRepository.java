package com.monitor.repository;

import com.monitor.domain.Event;
import com.monitor.domain.Severity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/**
 * Repository for managing {@link Event} entities.
 * <p>
 * Optimization Note: We use @EntityGraph to solve the N+1 problem.
 * When GraphQL resolves the 'service' field on an Event, it would normally trigger an extra query
 * for each Event if the association was LAZY, or during the initial load if it was EAGER without JOIN.
 * @EntityGraph forces Hibernate to use a LEFT JOIN FETCH to load the Event and its ServiceEntity in a single query.
 * </p>
 */
@Repository
public interface EventRepository extends JpaRepository<Event, UUID> {

    @EntityGraph(attributePaths = {"service"})
    Page<Event> findByServiceId(UUID serviceId, Pageable pageable);

    @EntityGraph(attributePaths = {"service"})
    Page<Event> findByServiceIdAndSeverity(UUID serviceId, Severity severity, Pageable pageable);

    @EntityGraph(attributePaths = {"service"})
    Page<Event> findBySeverity(Severity severity, Pageable pageable);

    @EntityGraph(attributePaths = {"service"})
    Page<Event> findAll(Pageable pageable);
}
