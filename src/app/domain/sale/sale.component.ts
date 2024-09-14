import { SaleModalComponent } from './sale-modal/sale-modal.component';
import { SaleService } from './../../core/services/sale.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-sale',
  templateUrl: './sale.component.html',
  styleUrl: './sale.component.scss'
})
export class SaleComponent implements OnInit {
  public displayedColumns: string[] = ['id', 'client', 'seller', 'paymentMethod', 'date', 'total', 'editar-eliminar'];
  public dataSourceS: MatTableDataSource<any>;
  public sales: any[] = [];
  //Paginador
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  cant: number = 0;
  //ORDENACION(SORT)
  @ViewChild(MatSort) sort!: MatSort;
  //Botones de activos e inacti
  public showInactiveButton: boolean = true;
  public showActiveButton: boolean = false;
  public showingInactiveSales: boolean = false;

  constructor(private saleService: SaleService, private dialog: MatDialog) {
    this.dataSourceS = new MatTableDataSource<any>([]); // Inicialización en el constructor
  }
  ngOnInit(): void {
    console.log('OnInit');
    this.saleService.saleActualizar.subscribe(() => {
      this.getSales();
      this.dataSourceS.sort = this.sort;
    });
    this.getSales();
  }
  //Lista de proveedores activos con paginador
  getSales() {
    this.saleService.listPageable(0, 10).subscribe(
      (res: any) => {
        console.log(res);
        this.cant = res.totalElements;
        this.sales = res.content;
        this.dataSourceS.data = this.sales;
        this.dataSourceS.sort = this.sort;
      }
    );
  }
  //Lista de proveedores inactivos con paginador
  getSalesInactive() {
    this.saleService.listPageableI(0, 10).subscribe(
      (res: any) => {
        console.log(res);
        this.cant = res.totalElements;
        this.sales = res.content;
        this.dataSourceS.data = this.sales;
      }
    );
  }
  //PAGINADOR
  Paginator(e: any) {
    // Verificar si se están mostrando proveedores activos o inactivos
    if (this.showingInactiveSales) {
      // Si se están mostrando proveedores inactivos, llamar a la función para obtener proveedores inactivos paginados
      this.saleService.listPageableI(e.pageIndex, e.pageSize).subscribe(
        (res: any) => {
          console.log(res);
          this.cant = res.totalElements;
          this.sales = res.content;
          this.dataSourceS.data = this.sales;
        }
      );
    } else {
      // Si se están mostrando proveedores activos, llamar a la función para obtener proveedores activos paginados
      this.saleService.listPageable(e.pageIndex, e.pageSize).subscribe(
        (res: any) => {
          console.log(res);
          this.cant = res.totalElements;
          this.sales = res.content;
          this.dataSourceS.data = this.sales;
        }
      );
    }
  }
  // Cambiar botones y listar suppliers activos e inactivos
  toggleButtons() {
    this.showingInactiveSales = !this.showingInactiveSales;
    if (this.showingInactiveSales) {
      this.getSalesInactive();
    } else {
      this.getSales();
    }
    this.showInactiveButton = !this.showInactiveButton;
    this.showActiveButton = !this.showActiveButton;
  }

  // Eliminado lógico de un proveedor
  eliminar(Id: number) {
    Swal.fire({
      title: "¿Estás seguro de eliminar a esta venta?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, elimínalo!"
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "¡Eliminado!",
          text: "Su venta ha sido eliminado.",
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
    this.saleService.disableSaleById(Id).subscribe(() => {
      // Volver a cargar solo los proveedor activos en la misma página
      this.saleService.listPageable(pageIndex, pageSize).subscribe((res: any) => {
        this.cant = res.totalElements;
        this.sales = res.content;
        this.dataSourceS.data = this.sales;
        // Si la página actual está vacía, regresa a la página anterior si es posible
        if (this.sales.length === 0 && pageIndex > 0) {
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
    this.saleService.activateSaleById(Id).subscribe(() => {
      // Volver a cargar solo los proveedores inactivos en la misma página
      this.saleService.listPageableI(pageIndex, pageSize).subscribe((res: any) => {
        this.cant = res.totalElements;
        this.sales = res.content;
        this.dataSourceS.data = this.sales;
        // Si la página actual está vacía, regresa a la página anterior si es posible
        if (this.sales.length === 0 && pageIndex > 0) {
          this.paginator.previousPage();
        }
      });
    });
  }
  //Abrir formulario al editar
  openmodal(proveedor?: any) {
    this.dialog.open(SaleModalComponent, {
      disableClose: true,
      width: '1200px',
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
  exportActivePDF(Id: number) {
    this.saleService.reportActivePDF(Id).subscribe(
      (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'boleta_venta.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      },
      (error: any) => {
        console.error('Error exporting active ventas to PDF:', error);
      }
    );
  }


  exportActiveExcel(Id: number) {
    this.saleService.reportActiveExcel(Id).subscribe(
      (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'boleta_venta.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      },
      (error: any) => {
        console.error('Error exporting active ventas to Excel:', error);
      }
    );
  }
}
