import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface EventItem {
  id: string;
  severity: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  message: string;
  timestamp: string;
  service: {
    id: string;
    name: string;
    environment: string;
    owner: string;
    status: string;
  };
}

export interface EventPage {
  content: EventItem[];
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
}

interface GraphQLResponse<T> {
  data: T;
}

@Injectable({ providedIn: 'root' })
export class GraphqlService {
  private readonly http = inject(HttpClient);
  private readonly graphqlUrl = 'http://localhost:8081/graphql';

  getEventsByServiceId(serviceId: string, severity?: string, page = 0, size = 20): Observable<EventPage> {
    const query = `
      query GetEvents($serviceId: ID, $severity: String, $page: Int, $size: Int) {
        events(serviceId: $serviceId, severity: $severity, page: $page, size: $size) {
          content {
            id
            severity
            message
            timestamp
            service {
              id
              name
              environment
              owner
              status
            }
          }
          totalPages
          totalElements
          last
          first
        }
      }
    `;

    const variables: any = { serviceId, page, size };
    if (severity && severity !== 'ALL') {
      variables['severity'] = severity;
    }

    return this.http
      .post<GraphQLResponse<{ events: EventPage }>>(this.graphqlUrl, { query, variables })
      .pipe(map(res => res.data.events));
  }

  getEventsByServiceName(serviceName: string, page = 0, size = 20): Observable<EventPage> {
    const query = `
      query GetEventsByService($serviceName: String!, $page: Int, $size: Int) {
        eventsByService(serviceName: $serviceName, page: $page, size: $size) {
          content {
            id
            severity
            message
            timestamp
            service {
              id
              name
              environment
              owner
              status
            }
          }
          totalPages
          totalElements
          last
          first
        }
      }
    `;

    return this.http
      .post<GraphQLResponse<{ eventsByService: EventPage }>>(this.graphqlUrl, {
        query,
        variables: { serviceName, page, size },
      })
      .pipe(map(res => res.data.eventsByService));
  }
}
