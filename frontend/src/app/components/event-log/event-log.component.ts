import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GraphqlService, EventItem } from '../../services/graphql.service';
import { ApiService, ServiceItem } from '../../services/api.service';

/**
 * Event log view component.
 * <p>
 * Architecture Note:
 * This component demonstrates the dual-API approach by fetching its data via GraphQL.
 * Unlike the REST-based dashboard, this component requests exactly the fields it needs
 * (including nested `service` data) in a single query. It also uses Signals for state
 * and `computed` for client-side filtering.
 * </p>
 */
@Component({
  selector: 'app-event-log',
  templateUrl: './event-log.component.html',
  styleUrl: './event-log.component.css',
})
export class EventLogComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly graphqlService = inject(GraphqlService);
  private readonly apiService = inject(ApiService);
  private refreshInterval: ReturnType<typeof setInterval> | null = null;

  readonly service = signal<ServiceItem | null>(null);
  readonly events = signal<EventItem[]>([]);
  readonly loading = signal(true);
  readonly severityFilter = signal('ALL');

  // Pagination state
  readonly currentPage = signal(0);
  readonly pageSize = signal(20);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);

  readonly filteredEvents = computed(() => {
    return this.events();
  });

  readonly severityCounts = computed((): Record<string, number> => {
    // Note: With server-side pagination, these counts should ideally come from the server 
    // for the entire dataset, but for now we'll just show the count for the current page 
    // or keep it simple as it was if we want to avoid extra backend calls.
    // The previous implementation used client-side filtering on a full list.
    // Since we now paginate on the server, this component only sees one page at a time.
    const evts = this.events();
    return {
      ALL: this.totalElements(),
      INFO: evts.filter(e => e.severity === 'INFO').length,
      WARN: evts.filter(e => e.severity === 'WARN').length,
      ERROR: evts.filter(e => e.severity === 'ERROR').length,
      CRITICAL: evts.filter(e => e.severity === 'CRITICAL').length,
    };
  });

  private serviceId = '';

  ngOnInit() {
    this.serviceId = this.route.snapshot.paramMap.get('serviceId') || '';
    this.loadService();
    this.loadEvents();
    this.refreshInterval = setInterval(() => this.loadEvents(), 10000);
  }

  ngOnDestroy() {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  loadService() {
    this.apiService.getService(this.serviceId).subscribe({
      next: (s) => this.service.set(s),
      error: () => {},
    });
  }

  loadEvents() {
    this.graphqlService.getEventsByServiceId(
      this.serviceId, 
      this.severityFilter(),
      this.currentPage(),
      this.pageSize()
    ).subscribe({
      next: (page) => {
        this.events.set(page.content);
        this.totalPages.set(page.totalPages);
        this.totalElements.set(page.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  setSeverityFilter(severity: string) {
    this.severityFilter.set(severity);
    this.currentPage.set(0); // Reset to first page on filter change
    this.loadEvents();
  }

  nextPage() {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update(p => p + 1);
      this.loadEvents();
    }
  }

  prevPage() {
    if (this.currentPage() > 0) {
      this.currentPage.update(p => p - 1);
      this.loadEvents();
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }

  formatTimestamp(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  }

  badgeClass(severity: string): string {
    return 'badge badge-' + severity.toLowerCase();
  }
}
