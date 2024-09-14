import { Component, OnInit, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { ClientService } from '../../core/services/client.service';
import { MatDialog } from '@angular/material/dialog';
import { ClientModalComponent } from './client-modal/client-modal.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss']
})
export class ClientComponent implements OnInit {
  public displayedColumns: string[] = ['typeDocument', 'numberDocument', 'names', 'lastName', 'email', 'cellPhone', 'birthdate', 'editar-eliminar'];
  public dataSourceC: MatTableDataSource<any>;
  public clients: any[] = [];
  //Paginador
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  cant: number = 0;
  //ORDENACION(SORT)
  @ViewChild(MatSort) sort!: MatSort;
  //Botones de activos e inacti
  public showInactiveButton: boolean = true;
  public showActiveButton: boolean = false;
  public showingInactiveClients: boolean = false;

  constructor(private clientService: ClientService, private dialog: MatDialog) {
    this.dataSourceC = new MatTableDataSource<any>([]); // Inicialización en el constructor
  }

  ngOnInit(): void {
    console.log('OnInit');
    this.clientService.clientActualizar.subscribe(() => {
      this.getClients();
      this.dataSourceC.sort = this.sort;
    });
    this.getClients();
  }

  //Lista de clientes activos con paginador
  getClients() {
    this.clientService.listPageable(0, 10).subscribe(
      (res: any) => {
        console.log(res);
        this.cant = res.totalElements;
        this.clients = res.content;
        this.dataSourceC.data = this.clients;
        this.dataSourceC.sort = this.sort;
      }
    );
  }

  //Lista de clientes inactivos con paginador
  getClientsInactive() {
    this.clientService.listPageableI(0, 10).subscribe(
      (res: any) => {
        console.log(res);
        this.cant = res.totalElements;
        this.clients = res.content;
        this.dataSourceC.data = this.clients;
      }
    );
  }
  //PAGINADOR
  Paginator(e: any) {
    // Verificar si se están mostrando clientes activos o inactivos
    if (this.showingInactiveClients) {
      // Si se están mostrando clientes inactivos, llamar a la función para obtener clientes inactivos paginados
      this.clientService.listPageableI(e.pageIndex, e.pageSize).subscribe(
        (res: any) => {
          console.log(res);
          this.cant = res.totalElements;
          this.clients = res.content;
          this.dataSourceC.data = this.clients;
        }
      );
    } else {
      // Si se están mostrando clientes activos, llamar a la función para obtener clientes activos paginados
      this.clientService.listPageable(e.pageIndex, e.pageSize).subscribe(
        (res: any) => {
          console.log(res);
          this.cant = res.totalElements;
          this.clients = res.content;
          this.dataSourceC.data = this.clients;
        }
      );
    }
  }

  // Cambiar botones y listar clientes activos e inactivos
  toggleButtons() {
    this.showingInactiveClients = !this.showingInactiveClients;
    if (this.showingInactiveClients) {
      this.getClientsInactive();
    } else {
      this.getClients();
    }
    this.showInactiveButton = !this.showInactiveButton;
    this.showActiveButton = !this.showActiveButton;
  }

  // Eliminado lógico de un cliente
  eliminar(Id: number) {
    Swal.fire({
      title: "¿Estás seguro de eliminar a este cliente?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, elimínalo!"
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "¡Eliminado!",
          text: "Su cliente ha sido eliminado.",
          icon: "success"
        });
        this.fnEliminar(Id); //Funcion al eliminar un cliente
      }
    });
  }
  //Funcion Eliminar
  fnEliminar(Id: number) {
    // Obtener el estado actual de la paginación
    const pageIndex = this.paginator.pageIndex;
    const pageSize = this.paginator.pageSize;
    // Eliminar el cliente
    this.clientService.disableClientById(Id).subscribe(() => {
      // Volver a cargar solo los clientes activos en la misma página
      this.clientService.listPageable(pageIndex, pageSize).subscribe((res: any) => {
        this.cant = res.totalElements;
        this.clients = res.content;
        this.dataSourceC.data = this.clients;
        // Si la página actual está vacía, regresa a la página anterior si es posible
        if (this.clients.length === 0 && pageIndex > 0) {
          this.paginator.previousPage();
        }
      });
    });
  }

  // Activar cliente
  activar(Id: number) {
    Swal.fire({
      title: "¿Estás seguro de restaurar a este cliente?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, restauralo!"
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "¡Restaurado!",
          text: "Su cliente ha sido restaurado.",
          icon: "success"
        });
        this.fnActivar(Id); //La funcion de activar un cliente
      }
    });
  }
  //Funcion Activar cliente
  fnActivar(Id: number) {
    // Obtener el estado actual de la paginación
    const pageIndex = this.paginator.pageIndex;
    const pageSize = this.paginator.pageSize;
    // Activar el cliente
    this.clientService.activateClientById(Id).subscribe(() => {
      // Volver a cargar solo los clientes inactivos en la misma página
      this.clientService.listPageableI(pageIndex, pageSize).subscribe((res: any) => {
        this.cant = res.totalElements;
        this.clients = res.content;
        this.dataSourceC.data = this.clients;
        // Si la página actual está vacía, regresa a la página anterior si es posible
        if (this.clients.length === 0 && pageIndex > 0) {
          this.paginator.previousPage();
        }
      });
    });
  }

  //Abrir formulario al editar
  openmodal(cliente?: any) {
    this.dialog.open(ClientModalComponent, {
      disableClose: true,
      width: '40rem',
      height: 'auto',
      data: cliente,
    });
  }

  //FILTRADO
  filtrar(event: any) {
    const valor = event.target.value; // Obtener el valor del input
    this.dataSourceC.filter = valor.trim().toLowerCase();
  }
  //Reportes
  exportActivePDF() {
    this.clientService.reportActivePDF().subscribe(
      (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lista_clientes.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      },
      (error: any) => {
        console.error('Error exporting active clientes to PDF:', error);
      }
    );
  }

  exportInactivePDF() {
    this.clientService.reportInactivePDF().subscribe(
      (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lista_clientes_inactivas.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      },
      (error: any) => {
        console.error('Error exporting inactive clientes to PDF:', error);
      }
    );
  }


  xlsx = "Clientes.xlsx";

  exportXLSX() {
    // Crear una copia de los datos actuales y mapear a los nombres de columnas en español
    const filteredData = this.dataSourceC.data.map(({ typeDocument, numberDocument, names, lastName, email, cellPhone, birthdateFormatted }) => ({
      'Tipo de Documento': typeDocument,
      'Número de Documento': numberDocument,
      'Nombres': names,
      'Apellidos': lastName,
      'Correo Electrónico': email,
      'Teléfono Celular': cellPhone,
      'Fecha de Nacimiento': birthdateFormatted
    }));

    // Crear una hoja de trabajo con los datos filtrados
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);

    // Crear un nuevo libro de trabajo
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clientes');

    // Escribir el libro de trabajo a un archivo
    XLSX.writeFile(wb, this.xlsx);
  }

  csv = "Clientes.csv";

  exportCSV() {
    // Crear una copia de los datos actuales y mapear a los nombres de columnas en español
    const filteredData = this.dataSourceC.data.map(({ typeDocument, numberDocument, names, lastName, email, cellPhone, birthdateFormatted }) => ({
      'Tipo de Documento': typeDocument,
      'Número de Documento': numberDocument,
      'Nombres': names,
      'Apellidos': lastName,
      'Correo Electrónico': email,
      'Teléfono Celular': cellPhone,
      'Fecha de Nacimiento': birthdateFormatted
    }));

    // Crear una hoja de trabajo con los datos filtrados
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);

    // Crear un nuevo libro de trabajo
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clientes');

    // Escribir el libro de trabajo a un archivo
    XLSX.writeFile(wb, this.csv);
  }

}
