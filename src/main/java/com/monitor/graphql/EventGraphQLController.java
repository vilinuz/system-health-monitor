package com.monitor.graphql;

import com.monitor.domain.Event;
import com.monitor.domain.ServiceEntity;
import com.monitor.domain.Severity;
import com.monitor.repository.EventRepository;
import com.monitor.repository.ServiceRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

import java.util.UUID;

/**
 * GraphQL Controller for querying events.
 * <p>
 * Architecture Note:
 * We use a dual-API approach. While REST is used for simple CRUD operations on Services,
 * GraphQL is used for querying Events. This is because Events have nested relationships (e.g., Service)
 * and clients might want to query events based on complex filters (severity, serviceId) while
 * retrieving varied nested data shapes (e.g., just the service name vs the entire service object).
 * GraphQL solves the over-fetching/under-fetching problem perfectly here.
 * </p>
 */
@Controller
public class EventGraphQLController {

    private final EventRepository eventRepository;
    private final ServiceRepository serviceRepository;

    public EventGraphQLController(EventRepository eventRepository,
                                  ServiceRepository serviceRepository) {
        this.eventRepository = eventRepository;
        this.serviceRepository = serviceRepository;
    }

    @QueryMapping
    public Page<Event> events(@Argument String serviceId, 
                              @Argument String severity,
                              @Argument Integer page,
                              @Argument Integer size) {
        
        int pageNum = (page != null) ? page : 0;
        int pageSize = (size != null) ? size : 20;
        var pageable = PageRequest.of(pageNum, pageSize, Sort.by("timestamp").descending());

        // Both filters provided
        if (serviceId != null && severity != null) {
            return eventRepository.findByServiceIdAndSeverity(
                    UUID.fromString(serviceId),
                    Severity.valueOf(severity.toUpperCase()),
                    pageable
            );
        }

        // Filter by service only
        if (serviceId != null) {
            return eventRepository.findByServiceId(
                    UUID.fromString(serviceId),
                    pageable
            );
        }

        // Filter by severity only
        if (severity != null) {
            return eventRepository.findBySeverity(
                    Severity.valueOf(severity.toUpperCase()),
                    pageable
            );
        }

        // No filters — return all
        return eventRepository.findAll(pageable);
    }

    @QueryMapping
    public Page<Event> eventsByService(@Argument String serviceName,
                                       @Argument Integer page,
                                       @Argument Integer size) {
        int pageNum = (page != null) ? page : 0;
        int pageSize = (size != null) ? size : 20;
        var pageable = PageRequest.of(pageNum, pageSize, Sort.by("timestamp").descending());

        var service = serviceRepository.findByName(serviceName)
                .orElseThrow(() -> new IllegalArgumentException("Service not found: " + serviceName));
        return eventRepository.findByServiceId(service.getId(), pageable);
    }

    @SchemaMapping(typeName = "Event", field = "service")
    public ServiceEntity service(Event event) {
        return event.getService();
    }
}
