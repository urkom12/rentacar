import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, switchMap, tap, of, catchError, throwError , first, map, forkJoin } from 'rxjs';
import { Automobil } from '../automobil.model';
import { CarService } from '../servisi/car.service';
import { Router } from '@angular/router';
import { Reservation } from '../reservartion.model';
import { ReservationService } from '../servisi/reservation.service';
import { UserService } from '../servisi/user.service';

@Component({
  selector: 'app-user-panel',
  templateUrl: './user-panel.component.html',
  styleUrls: ['./user-panel.component.scss']
})
export class UserPanelComponent implements OnInit {
  availableAutomobili$: Observable<Automobil[]>;
  reservationForm: FormGroup;
  selectedCar: Automobil | null = null;
  reservationError: string | null = null;
  selectedCarId: string | null;
  userReservations$: Observable<Reservation[]> | null = null;
  notReservedAutomobili$!: Observable<Automobil[]>;
  reservationsForUser$: Observable<Reservation[]> | undefined;


  constructor(
    private carService: CarService,
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    this.availableAutomobili$ = this.carService.getCars();
    this.reservationForm = this.fb.group({
      selectedCarId: [null, Validators.required],
      brojDana: [1, Validators.min(1)], 
    });
    this.selectedCarId = null;
  }

  refreshData() {
    const userId = this.userService.getCurrentUserId();
  
    if (userId) {
      const notReservedAutomobili$ = this.carService.getCars().pipe(
        map(automobili => automobili.filter(car => !car.rezervisano))
      );
  
      const reservationsForUser$ = this.carService.getReservationsForUser(userId);
  
      forkJoin([notReservedAutomobili$, reservationsForUser$]).subscribe(
        ([notReservedAutomobili, reservations]) => {
          this.notReservedAutomobili$ = of(notReservedAutomobili);
  
          this.userReservations$ = of(reservations);
        },
        error => {
          console.error('Greška pri osvežavanju podataka:', error);
        }
      );
    } else {
      console.error('No user');
    }
  }
  
  

  ngOnInit() {
    this.refreshData();
    const userId: string | null = this.userService.getCurrentUserId();
    this.availableAutomobili$ = this.carService.getCars();
    console.log('Current User ID:', userId);
  
    if (userId) {
      this.notReservedAutomobili$ = this.carService.getCars().pipe(
        map(automobili => automobili.filter(car => !car.rezervisano))
      );
      this.userReservations$ = this.carService.getUserReservations(userId).pipe(
        tap(reservations => console.log(`Rezervacije za korisnika ${userId}:`, reservations)),
        catchError(error => {
          console.error('Greška', error);
          return of([]);
        })
      );
    }
  }
  

  onSelectCar(car: Automobil): void {
    this.selectedCar = car;
    this.selectedCarId = car.id;
  }

  
  reserveCar(): void {
    if (this.selectedCarId) {
      const userId = this.userService.getCurrentUserId();
      function generateUniqueId(): string {
        return '_' + Math.random().toString(36).substr(2, 9);
      }
      if (userId) {
        this.availableAutomobili$.pipe(
          first(),
          switchMap((automobili: Automobil[]) => {
            const selectedCar = automobili.find((car: Automobil) => car.id === this.selectedCarId);
            return selectedCar ? of(selectedCar) : throwError('Not found');
          })
        ).subscribe(
          selectedCar => {
            selectedCar.rezervisano = true;
  
            const novaRezervacija: Reservation = {
              id: generateUniqueId(),
              automobilId: this.selectedCarId!,
              userId: userId,
              datum: new Date(),
              brojDana: this.reservationForm.value.brojDana
            };
  
            this.carService.reserveCar(this.selectedCarId!, userId, new Date(), this.reservationForm.value.brojDana).subscribe(
              () => {
                console.log('Uspesno');
              },
              (error) => {
                console.error('Greška', error);
              }
            );
          },
          error => {
            console.error('Greška', error);
          }
        );
      } else {
        console.error('No user');
      }
    } else {
      this.reservationError = 'Morate izabrati automobil pre rezervacije.';
    }
  }
  
  
  getReservationsForUser(userId: string): void {
    this.carService.getReservationsForUser(userId).subscribe(
      (reservations) => {
        console.log('Rezervacije za korisnika:', reservations);
      },
      (error) => {
        console.error('Greška', error);
      }
    );
  }
  

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
