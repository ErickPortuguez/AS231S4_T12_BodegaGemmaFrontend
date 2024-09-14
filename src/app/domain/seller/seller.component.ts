import { Component, OnInit, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { SellerService } from './../../core/services/seller.service';
import { MatDialog } from '@angular/material/dialog';
import { SellerModalComponent } from './seller-modal/seller-modal.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-seller',
  templateUrl: './seller.component.html',
  styleUrl: './seller.component.scss'
})
export class SellerComponent implements OnInit {
  public displayedColumns: string[] = ['typeDocument', 'numberDocument', 'names', 'lastName', 'email', 'cellPhone', 'salary', 'rol', 'user', 'password', 'editar-eliminar'];
  public dataSourceV: MatTableDataSource<any>;
  public sellers: any[] = [];
  //Paginador
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  cant: number = 0;
  //ORDENACION(SORT)
  @ViewChild(MatSort) sort!: MatSort;
  //Botones de activos e inacti
  public showInactiveButton: boolean = true;
  public showActiveButton: boolean = false;
  public showingInactiveSellers: boolean = false;

  constructor(private sellerService: SellerService, private dialog: MatDialog) {
    this.dataSourceV = new MatTableDataSource<any>([]); // Inicialización en el constructor
  }

  ngOnInit(): void {
    console.log('OnInit');
    this.sellerService.sellerActualizar.subscribe(() => {
      this.getSellers();
      this.dataSourceV.sort = this.sort;
    });
    this.getSellers();
  }
  //Lista de vendedores activos con paginador
  getSellers() {
    this.sellerService.listPageable(0, 10).subscribe(
      (res: any) => {
        console.log(res);
        this.cant = res.totalElements;
        this.sellers = res.content;
        this.dataSourceV.data = this.sellers;
        this.dataSourceV.sort = this.sort;
      }
    );
  }
  //Lista de vendedores inactivos con paginador
  getSellersInactive() {
    this.sellerService.listPageableI(0, 10).subscribe(
      (res: any) => {
        console.log(res);
        this.cant = res.totalElements;
        this.sellers = res.content;
        this.dataSourceV.data = this.sellers;
      }
    );
  }
  //PAGINADOR
  Paginator(e: any) {
    // Verificar si se están mostrando vendedores activos o inactivos
    if (this.showingInactiveSellers) {
      // Si se están mostrando vendedores inactivos, llamar a la función para obtener vendedores inactivos paginados
      this.sellerService.listPageableI(e.pageIndex, e.pageSize).subscribe(
        (res: any) => {
          console.log(res);
          this.cant = res.totalElements;
          this.sellers = res.content;
          this.dataSourceV.data = this.sellers;
        }
      );
    } else {
      // Si se están mostrando vendedores activos, llamar a la función para obtener vendedores activos paginados
      this.sellerService.listPageable(e.pageIndex, e.pageSize).subscribe(
        (res: any) => {
          console.log(res);
          this.cant = res.totalElements;
          this.sellers = res.content;
          this.dataSourceV.data = this.sellers;
        }
      );
    }
  }
  // Cambiar botones y listar vendedores activos e inactivos
  toggleButtons() {
    this.showingInactiveSellers = !this.showingInactiveSellers;
    if (this.showingInactiveSellers) {
      this.getSellersInactive();
    } else {
      this.getSellers();
    }
    this.showInactiveButton = !this.showInactiveButton;
    this.showActiveButton = !this.showActiveButton;
  }

  // Eliminado lógico de un vendedor
  eliminar(Id: number) {
    Swal.fire({
      title: "¿Estás seguro de eliminar a este vendedor?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, elimínalo!"
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "¡Eliminado!",
          text: "Su vendedor ha sido eliminado.",
          icon: "success"
        });
        this.fnEliminar(Id); //Funcion al eliminar un vendedor
      }
    });
  }
  //Funcion Eliminar
  fnEliminar(Id: number) {
    // Obtener el estado actual de la paginación
    const pageIndex = this.paginator.pageIndex;
    const pageSize = this.paginator.pageSize;
    // Eliminar al vendedor
    this.sellerService.disableSellerById(Id).subscribe(() => {
      // Volver a cargar solo los vendedor activos en la misma página
      this.sellerService.listPageable(pageIndex, pageSize).subscribe((res: any) => {
        this.cant = res.totalElements;
        this.sellers = res.content;
        this.dataSourceV.data = this.sellers;
        // Si la página actual está vacía, regresa a la página anterior si es posible
        if (this.sellers.length === 0 && pageIndex > 0) {
          this.paginator.previousPage();
        }
      });
    });
  }

  // Activar vendedor
  activar(Id: number) {
    Swal.fire({
      title: "¿Estás seguro de restaurar a este vendedor?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, restauralo!"
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "¡Restaurado!",
          text: "Su vendedor ha sido restaurado.",
          icon: "success"
        });
        this.fnActivar(Id); //La funcion de activar un vendedor
      }
    });
  }
  //Funcion Activar vendedor
  fnActivar(Id: number) {
    // Obtener el estado actual de la paginación
    const pageIndex = this.paginator.pageIndex;
    const pageSize = this.paginator.pageSize;
    // Activar al vendedor
    this.sellerService.activateSellerById(Id).subscribe(() => {
      // Volver a cargar solo los vendedores inactivos en la misma página
      this.sellerService.listPageableI(pageIndex, pageSize).subscribe((res: any) => {
        this.cant = res.totalElements;
        this.sellers = res.content;
        this.dataSourceV.data = this.sellers;
        // Si la página actual está vacía, regresa a la página anterior si es posible
        if (this.sellers.length === 0 && pageIndex > 0) {
          this.paginator.previousPage();
        }
      });
    });
  }
  //Abrir formulario al editar
  openmodal(vendedor?: any) {
    this.dialog.open(SellerModalComponent, {
      disableClose: true,
      width: '40rem',
      height: 'auto',
      data: vendedor,
    });
  }

  //FILTRADO
  filtrar(event: any) {
    const valor = event.target.value; // Obtener el valor del input
    this.dataSourceV.filter = valor.trim().toLowerCase();
  }

  //Reportes
  exportActivePDF() {
    this.sellerService.reportActivePDF().subscribe(
      (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lista_vendedores.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      },
      (error: any) => {
        console.error('Error exporting active vendedores to PDF:', error);
      }
    );
  }

  exportInactivePDF() {
    this.sellerService.reportInactivePDF().subscribe(
      (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lista_vendedores_inactivas.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      },
      (error: any) => {
        console.error('Error exporting inactive vendedores to PDF:', error);
      }
    );
  }

  filename = "Vendedores.xlsx";

  exportExcel() {
    // Crear una copia de los datos actuales y mapear a los nombres de columnas en español
    const filteredData = this.dataSourceV.data.map(({ typeDocument, numberDocument, names, lastName, email, cellPhone, salary, rol, user, password }) => ({
      'Tipo de Documento': typeDocument,
      'Número de Documento': numberDocument,
      'Nombres': names,
      'Apellidos': lastName,
      'Correo Electrónico': email,
      'Teléfono Celular': cellPhone,
      'Salario': salary,
      'Rol': rol,
      'Usuario': user,
      'Contraseña': password
    }));

    // Crear una hoja de trabajo con los datos filtrados
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);

    // Crear un nuevo libro de trabajo
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vendedores');

    // Escribir el libro de trabajo a un archivo
    XLSX.writeFile(wb, this.filename);
  }
}
