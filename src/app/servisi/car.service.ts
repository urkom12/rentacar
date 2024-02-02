import { Injectable } from '@angular/core';
import { Observable, of , map, switchMap, throwError} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, tap} from 'rxjs/operators';
import { Automobil } from '../automobil.model';
import { Reservation } from '../reservartion.model';

@Injectable({
  providedIn: 'root'
})
export class CarService {
  private apiUrl = 'http://localhost:3000/automobili';

  loadCars(): Observable<Automobil[]> {
    return this.http.get<Automobil[]>(this.apiUrl).pipe(
      tap(cars => console.log('Učitani automobili:', cars)),
      catchError(this.handleError)
    );
  }

  reserveCar(carId: string, userId: string, datum: Date, brojDana: number): Observable<any> {
    const reservationData = { automobilId: carId, userId, datum, brojDana };
  
    return this.http.get<Automobil>(`http://localhost:3000/automobili/${carId}`).pipe(
      switchMap(automobil => {
        if (!automobil) {
          return throwError('Automobil nije pronađen.');
        }
  
        automobil.rezervisano = true;
  
        return this.http.put<any>(`http://localhost:3000/automobili/${carId}`, automobil).pipe(
          switchMap(() => this.http.post<any>(`http://localhost:3000/rezervacije`, reservationData)),
          tap(response => console.log('Rezervacija uspešna:', response))
        );
      }),
      catchError(error => {
        console.error('Greška', error);
        return of(null);
      })
    );
  }
  
  
  

  getUserReservations(userId: string): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`http://localhost:3000/rezervacije?userId=${userId}`).pipe(
      tap(reservations => console.log(`Rezervacije za korisnika ${userId}:`, reservations)),
      catchError(this.handleError)
    );
  }

  getReservationsForUser(userId: string): Observable<Reservation[]> {
    const url = `http://localhost:3000/rezervacije?userId=${userId}`;
    return this.http.get<Reservation[]>(url);
  }
  
  getCars(): Observable<Automobil[]> {
    return this.http.get<Automobil[]>(`${this.apiUrl}`).pipe(
      map(automobili => automobili.filter(car => !car.rezervisano)),
      catchError(this.handleError)
    );
  }

  addCar(car: Automobil): Observable<Automobil> {
    return this.http.post<Automobil>(this.apiUrl, car).pipe(
      tap(newCar => console.log('Dodat novi automobil:', newCar)),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<any> {
    console.error('Greška:', error);
    return of(null);
  }

  constructor(private http: HttpClient) {}
}
