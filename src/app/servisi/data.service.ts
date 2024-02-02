import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getAutomobili(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/automobili`);
  }
  dodajAutomobil(noviAutomobil: any): Observable<any> {
    const noviAutomobilSaStatusom = { ...noviAutomobil, rezervisano: false };
    return this.http.post(`${this.apiUrl}/automobili`, noviAutomobilSaStatusom);
  }  
  obrisiAutomobil(automobilId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/automobili/${automobilId}`);
  }
  azurirajAutomobil(id: string, noviPodaci: any): Observable<any> {
    const url = `${this.apiUrl}/automobili/${id}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.put(url, noviPodaci, { headers }).pipe(
      catchError((error) => {
        console.error('Greška', error);
        throw error;
      })
    );
  }

  getRezervacije(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/rezervacije`);
  }

  getUseri(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

}
