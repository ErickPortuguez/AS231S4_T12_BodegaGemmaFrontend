import { Component, OnInit, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { SupplierService } from './../../core/services/supplier.service';
import { MatDialog } from '@angular/material/dialog';
import { SupplierModalComponent } from './supplier-modal/supplier-modal.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-supplier',
  templateUrl: './supplier.component.html',
  styleUrl: './supplier.component.scss'
})
export class SupplierComponent implements OnInit {
  public displayedColumns: string[] = ['ruc', 'nameCompany', 'typeDocument', 'numberDocument', 'names', 'lastName', 'email', 'cellPhone', 'editar-eliminar'];
  public dataSourceS: MatTableDataSource<any>;
  public suppliers: any[] = [];
  //Paginador
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  cant: number = 0;
  //ORDENACION(SORT)
  @ViewChild(MatSort) sort!: MatSort;
  //Botones de activos e inacti
  public showInactiveButton: boolean = true;
  public showActiveButton: boolean = false;
  public showingInactiveSuppliers: boolean = false;

  constructor(private supplierService: SupplierService, private dialog: MatDialog) {
    this.dataSourceS = new MatTableDataSource<any>([]); // Inicialización en el constructor
  }

  ngOnInit(): void {
    console.log('OnInit');
    this.supplierService.supplierActualizar.subscribe(() => {
      this.getSuppliers();
      this.dataSourceS.sort = this.sort;
    });
    this.getSuppliers();
  }
  //Lista de proveedores activos con paginador
  getSuppliers() {
    this.supplierService.listPageable(0, 10).subscribe(
      (res: any) => {
        console.log(res);
        this.cant = res.totalElements;
        this.suppliers = res.content;
        this.dataSourceS.data = this.suppliers;
        this.dataSourceS.sort = this.sort;
      }
    );
  }
  //Lista de proveedores inactivos con paginador
  getSuppliersInactive() {
    this.supplierService.listPageableI(0, 10).subscribe(
      (res: any) => {
        console.log(res);
        this.cant = res.totalElements;
        this.suppliers = res.content;
        this.dataSourceS.data = this.suppliers;
      }
    );
  }
  //PAGINADOR
  Paginator(e: any) {
    // Verificar si se están mostrando proveedores activos o inactivos
    if (this.showingInactiveSuppliers) {
      // Si se están mostrando proveedores inactivos, llamar a la función para obtener proveedores inactivos paginados
      this.supplierService.listPageableI(e.pageIndex, e.pageSize).subscribe(
        (res: any) => {
          console.log(res);
          this.cant = res.totalElements;
          this.suppliers = res.content;
          this.dataSourceS.data = this.suppliers;
        }
      );
    } else {
      // Si se están mostrando proveedores activos, llamar a la función para obtener proveedores activos paginados
      this.supplierService.listPageable(e.pageIndex, e.pageSize).subscribe(
        (res: any) => {
          console.log(res);
          this.cant = res.totalElements;
          this.suppliers = res.content;
          this.dataSourceS.data = this.suppliers;
        }
      );
    }
  }
  // Cambiar botones y listar suppliers activos e inactivos
  toggleButtons() {
    this.showingInactiveSuppliers = !this.showingInactiveSuppliers;
    if (this.showingInactiveSuppliers) {
      this.getSuppliersInactive();
    } else {
      this.getSuppliers();
    }
    this.showInactiveButton = !this.showInactiveButton;
    this.showActiveButton = !this.showActiveButton;
  }

  // Eliminado lógico de un proveedor
  eliminar(Id: number) {
    Swal.fire({
      title: "¿Estás seguro de eliminar a este proveedor?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, elimínalo!"
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "¡Eliminado!",
          text: "Su proveedor ha sido eliminado.",
          icon: "success"
        });
        this.fnEliminar(Id); //Funcion al eliminar un proveedor
      }
    });
  }
  //Funcion Eliminar
  fnEliminar(Id: number) {
    // Obtener el estado actual de la paginación
    const pageIndex = this.paginator.pageIndex;
    const pageSize = this.paginator.pageSize;
    // Eliminar al proveedor
    this.supplierService.disableSupplierById(Id).subscribe(() => {
      // Volver a cargar solo los proveedor activos en la misma página
      this.supplierService.listPageable(pageIndex, pageSize).subscribe((res: any) => {
        this.cant = res.totalElements;
        this.suppliers = res.content;
        this.dataSourceS.data = this.suppliers;
        // Si la página actual está vacía, regresa a la página anterior si es posible
        if (this.suppliers.length === 0 && pageIndex > 0) {
          this.paginator.previousPage();
        }
      });
    });
  }

  // Activar proveedor
  activar(Id: number) {
    Swal.fire({
      title: "¿Estás seguro de restaurar a este proveedor?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, restauralo!"
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "¡Restaurado!",
          text: "Su proveedor ha sido restaurado.",
          icon: "success"
        });
        this.fnActivar(Id); //La funcion de activar un proveedor
      }
    });
  }
  //Funcion Activar proveedor
  fnActivar(Id: number) {
    // Obtener el estado actual de la paginación
    const pageIndex = this.paginator.pageIndex;
    const pageSize = this.paginator.pageSize;
    // Activar al proveedor
    this.supplierService.activateSupplierById(Id).subscribe(() => {
      // Volver a cargar solo los proveedores inactivos en la misma página
      this.supplierService.listPageableI(pageIndex, pageSize).subscribe((res: any) => {
        this.cant = res.totalElements;
        this.suppliers = res.content;
        this.dataSourceS.data = this.suppliers;
        // Si la página actual está vacía, regresa a la página anterior si es posible
        if (this.suppliers.length === 0 && pageIndex > 0) {
          this.paginator.previousPage();
        }
      });
    });
  }
  //Abrir formulario al editar
  openmodal(proveedor?: any) {
    this.dialog.open(SupplierModalComponent, {
      disableClose: true,
      width: '40rem',
      height: 'auto',
      data: proveedor,
    });
  }

  //FILTRADO
  filtrar(event: any) {
    const valor = event.target.value; // Obtener el valor del input
    this.dataSourceS.filter = valor.trim().toLowerCase();
  }

  //Reportes
  exportActivePDF() {
    this.supplierService.reportActivePDF().subscribe(
      (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lista_proveeedores.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      },
      (error: any) => {
        console.error('Error exporting active proveeedores to PDF:', error);
      }
    );
  }

  exportInactivePDF() {
    this.supplierService.reportInactivePDF().subscribe(
      (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lista_proveeedores_inactivas.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      },
      (error: any) => {
        console.error('Error exporting inactive proveeedores to PDF:', error);
      }
    );
  }
  XLSX = "Proveedores.xlsx";

  exportXLSX() {
    // Crear una copia de los datos actuales y mapear a los nombres de columnas en español
    const filteredData = this.dataSourceS.data.map(({ ruc, nameCompany, typeDocument, numberDocument, names, lastName, email, cellPhone }) => ({
      'Nombre de Empresa': nameCompany,
      'RUC': ruc,
      'Tipo de Documento': typeDocument,
      'Número de Documento': numberDocument,
      'Nombres': names,
      'Apellidos': lastName,
      'Correo Electrónico': email,
      'Teléfono Celular': cellPhone,
    }));

    // Crear una hoja de trabajo con los datos filtrados
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);

    // Crear un nuevo libro de trabajo
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Proveedores');

    // Escribir el libro de trabajo a un archivo
    XLSX.writeFile(wb, this.XLSX);
  }

  CSV = "Proveedores.csv";

  exportCSV() {
    // Crear una copia de los datos actuales y mapear a los nombres de columnas en español
    const filteredData = this.dataSourceS.data.map(({ ruc, nameCompany, typeDocument, numberDocument, names, lastName, email, cellPhone }) => ({
      'Nombre de Empresa': nameCompany,
      'RUC': ruc,
      'Tipo de Documento': typeDocument,
      'Número de Documento': numberDocument,
      'Nombres': names,
      'Apellidos': lastName,
      'Correo Electrónico': email,
      'Teléfono Celular': cellPhone,
    }));

    // Crear una hoja de trabajo con los datos filtrados
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);

    // Crear un nuevo libro de trabajo
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Proveedores');

    // Escribir el libro de trabajo a un archivo
    XLSX.writeFile(wb, this.CSV);
  }
}
