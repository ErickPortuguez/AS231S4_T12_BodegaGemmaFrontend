import { PurchaseModalComponent } from './purchase-modal/purchase-modal.component';
import { PurchaseService } from '../../core/services/purchase.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-purchase',
  templateUrl: './purchase.component.html',
  styleUrl: './purchase.component.scss'
})
export class PurchaseComponent implements OnInit {
  public displayedColumns: string[] = ['id', 'supplier', 'seller', 'paymentMethod', 'date', 'total', 'editar-eliminar'];
  public dataSourceP: MatTableDataSource<any>;
  public purchases: any[] = [];
  //Paginador
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  cant: number = 0;
  //ORDENACION(SORT)
  @ViewChild(MatSort) sort!: MatSort;
  //Botones de activos e inacti
  public showInactiveButton: boolean = true;
  public showActiveButton: boolean = false;
  public showingInactivePurchases: boolean = false;

  constructor(private purchaseService: PurchaseService, private dialog: MatDialog) {
    this.dataSourceP = new MatTableDataSource<any>([]); // Inicialización en el constructor
  }
  ngOnInit(): void {
    console.log('OnInit');
    this.purchaseService.purchaseActualizar.subscribe(() => {
      this.getPurchases();
      this.dataSourceP.sort = this.sort;
    });
    this.getPurchases();
  }
  //Lista de proveedores activos con paginador
  getPurchases() {
    this.purchaseService.listPageable(0, 10).subscribe(
      (res: any) => {
        console.log(res);
        this.cant = res.totalElements;
        this.purchases = res.content;
        this.dataSourceP.data = this.purchases;
        this.dataSourceP.sort = this.sort;
      }
    );
  }
  //Lista de proveedores inactivos con paginador
  getPurchasesInactive() {
    this.purchaseService.listPageableI(0, 10).subscribe(
      (res: any) => {
        console.log(res);
        this.cant = res.totalElements;
        this.purchases = res.content;
        this.dataSourceP.data = this.purchases;
      }
    );
  }
  //PAGINADOR
  Paginator(e: any) {
    // Verificar si se están mostrando proveedores activos o inactivos
    if (this.showingInactivePurchases) {
      // Si se están mostrando proveedores inactivos, llamar a la función para obtener proveedores inactivos paginados
      this.purchaseService.listPageableI(e.pageIndex, e.pageSize).subscribe(
        (res: any) => {
          console.log(res);
          this.cant = res.totalElements;
          this.purchases = res.content;
          this.dataSourceP.data = this.purchases;
        }
      );
    } else {
      // Si se están mostrando proveedores activos, llamar a la función para obtener proveedores activos paginados
      this.purchaseService.listPageable(e.pageIndex, e.pageSize).subscribe(
        (res: any) => {
          console.log(res);
          this.cant = res.totalElements;
          this.purchases = res.content;
          this.dataSourceP.data = this.purchases;
        }
      );
    }
  }
  // Cambiar botones y listar suppliers activos e inactivos
  toggleButtons() {
    this.showingInactivePurchases = !this.showingInactivePurchases;
    if (this.showingInactivePurchases) {
      this.getPurchasesInactive();
    } else {
      this.getPurchases();
    }
    this.showInactiveButton = !this.showInactiveButton;
    this.showActiveButton = !this.showActiveButton;
  }

  // Eliminado lógico de un proveedor
  eliminar(Id: number) {
    Swal.fire({
      title: "¿Estás seguro de eliminar a esta compra?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, elimínalo!"
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "¡Eliminado!",
          text: "Su compra ha sido eliminado.",
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
    this.purchaseService.disablePurchaseById(Id).subscribe(() => {
      // Volver a cargar solo los proveedor activos en la misma página
      this.purchaseService.listPageable(pageIndex, pageSize).subscribe((res: any) => {
        this.cant = res.totalElements;
        this.purchases = res.content;
        this.dataSourceP.data = this.purchases;
        // Si la página actual está vacía, regresa a la página anterior si es posible
        if (this.purchases.length === 0 && pageIndex > 0) {
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
    this.purchaseService.activatePurchaseById(Id).subscribe(() => {
      // Volver a cargar solo los proveedores inactivos en la misma página
      this.purchaseService.listPageableI(pageIndex, pageSize).subscribe((res: any) => {
        this.cant = res.totalElements;
        this.purchases = res.content;
        this.dataSourceP.data = this.purchases;
        // Si la página actual está vacía, regresa a la página anterior si es posible
        if (this.purchases.length === 0 && pageIndex > 0) {
          this.paginator.previousPage();
        }
      });
    });
  }
  //Abrir formulario al editar
  openmodal(proveedor?: any) {
    this.dialog.open(PurchaseModalComponent, {
      disableClose: true,
      width: '1200px',
      height: 'auto',
      data: proveedor,
    });
  }

  //FILTRADO
  filtrar(event: any) {
    const valor = event.target.value; // Obtener el valor del input
    this.dataSourceP.filter = valor.trim().toLowerCase();
  }

  //Reportes
  exportActivePDF(Id: number) {
    this.purchaseService.reportActivePDF(Id).subscribe(
      (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'boleta_compra.pdf';
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
    this.purchaseService.reportActiveExcel(Id).subscribe(
      (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'boleta_compra.xlsx';
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





