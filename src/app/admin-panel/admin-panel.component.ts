import { Component, OnInit } from '@angular/core';
import { DataService } from '../servisi/data.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Automobil } from '../automobil.model';
import { Reservation } from '../reservartion.model';
import { ReservationService } from '../servisi/reservation.service';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit {
  automobili: any[] = [];
  users: any[] = [];
  selectedCarId: string | null = null;
  showUpdateButton: boolean = false;
  rezervacije: Reservation[] = [];

  noviAutomobil: any = {
    marka: '',
    model: '',
    godiste: null,
    cena_po_danu: null
  };

  constructor(private dataService: DataService , private reservationService: ReservationService) {}

  popuniFormuZaAzuriranje(automobil: Automobil): void {
    this.noviAutomobil = { ...automobil };
    this.showUpdateButton = true;
    this.selectedCarId = automobil.id;
  }
  azurirajAutomobil(): void {
    if (this.selectedCarId) {
      this.dataService.azurirajAutomobil(this.selectedCarId, this.noviAutomobil).subscribe(
        (response) => {
          console.log('Uspesno', response);
        },
        (error) => {
          console.error('Greška', error);
        }
      );
    } else {
      console.error('ID nije validan');
    }
  }
  

  loadAutomobili(): void {
    this.dataService.getAutomobili().subscribe(
      data => {
        console.log('Automobili:', data);
        this.automobili = data;
      },
      error => {
        console.error('Greška', error);
      }
    );
  }

  dodajNoviAutomobil(): void {
    this.dataService.dodajAutomobil(this.noviAutomobil).subscribe(
      (response) => {
        console.log('Uspesno', response);
      },
      (error) => {
        console.error('Greška', error);
      }
    );
  }

  obrisiAutomobil(automobilId: string): void {
    this.dataService.obrisiAutomobil(automobilId).subscribe(
      () => {
        console.log('Uspesno');
        this.loadAutomobili();
      },
      error => {
        console.error('Greška', error);
      }
    );
  }

  ngOnInit(): void {
    console.log('Admin Panel Component Loaded');
    this.loadAutomobili();
    this.loadReservations();
    this.loadUseri();
  }

  loadReservations(): void {
    this.reservationService.getAllReservations().subscribe(
      (reservations) => {
        this.rezervacije = reservations;
      },
      (error) => {
        console.error('Greška prilikom dobijanja rezervacija:', error);
      }
    );
  }

  deleteReservation(reservationId: string): void {
    if (confirm('Da li ste sigurni da želite obrisati ovu rezervaciju?')) {
      this.reservationService.deleteReservation(reservationId).subscribe(
        () => {
          console.log('Rezervacija uspešno obrisana.');
          this.loadReservations();
        },
        (error) => {
          console.error('Greška prilikom brisanja rezervacije:', error);
        }
      );
    }
  }



  loadUseri(): void {
    this.dataService.getUseri().subscribe(
      data => {
        console.log('Useri:', data);
        this.users = data;
      },
      error => {
        console.error('Greška', error);

      }
    );
  }
}
