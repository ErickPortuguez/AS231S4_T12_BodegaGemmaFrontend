import { Component, OnInit, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { CategoryService } from '../../core/services/category.service';
import { MatDialog } from '@angular/material/dialog';
import { CategoryModalComponent } from './category-modal/category-modal.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss',
})
export class CategoryComponent implements OnInit {

  public displayedColumns: string[] = ['name', 'description', 'editar-eliminar'];
  public dataSource: MatTableDataSource<any>;
  public categories: any[] = [];
  //Paginador
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  cant: number = 0;
  //ORDENACION(SORT)
  @ViewChild(MatSort) sort!: MatSort;
  //Botones de activos e inacti
  public showInactiveButton: boolean = true;
  public showActiveButton: boolean = false;
  public showingInactiveCategories: boolean = false;
  constructor(private categoryService: CategoryService, private dialog: MatDialog) {
    this.dataSource = new MatTableDataSource<any>([]);
  }

  ngOnInit(): void {
    console.log('OnInit');
    this.categoryService.categoryActualizar.subscribe(() => {
      this.getCategories();
      this.dataSource.sort = this.sort;
    });
    this.getCategories();
  }
  //Lista de categorias activos con paginador
  getCategories() {
    this.categoryService.listPageable(0, 10).subscribe(
      (res: any) => {
        console.log(res);
        this.cant = res.totalElements;
        this.categories = res.content;
        this.dataSource.data = this.categories;
        this.dataSource.sort = this.sort;
      }
    );
  }
  //Lista de categories inactivos con paginador
  getCategoriesInactive() {
    this.categoryService.listPageableI(0, 10).subscribe(
      (res: any) => {
        console.log(res);
        this.cant = res.totalElements;
        this.categories = res.content;
        this.dataSource.data = this.categories;
      }
    );
  }

  //PAGINADOR
  Paginator(e: any) {
    // Verificar si se están mostrando clientes activos o inactivos
    if (this.showingInactiveCategories) {
      // Si se están mostrando clientes inactivos, llamar a la función para obtener clientes inactivos paginados
      this.categoryService.listPageableI(e.pageIndex, e.pageSize).subscribe(
        (res: any) => {
          console.log(res);
          this.cant = res.totalElements;
          this.categories = res.content;
          this.dataSource.data = this.categories;
        }
      );
    } else {
      // Si se están mostrando clientes activos, llamar a la función para obtener clientes activos paginados
      this.categoryService.listPageable(e.pageIndex, e.pageSize).subscribe(
        (res: any) => {
          console.log(res);
          this.cant = res.totalElements;
          this.categories = res.content;
          this.dataSource.data = this.categories;
        }
      );
    }
  }
  // Cambiar botones y listar clientes activos e inactivos
  toggleButtons() {
    this.showingInactiveCategories = !this.showingInactiveCategories;
    if (this.showingInactiveCategories) {
      this.getCategoriesInactive();
    } else {
      this.getCategories();
    }
    this.showInactiveButton = !this.showInactiveButton;
    this.showActiveButton = !this.showActiveButton;
  }

  // Eliminado lógico de un cliente
  eliminar(Id: number) {
    Swal.fire({
      title: "¿Estás seguro de eliminar a esta categoria?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, elimínalo!"
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "¡Eliminado!",
          text: "Su categoria ha sido eliminado.",
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
    // Eliminar el categoria
    this.categoryService.disableCategoryById(Id).subscribe(() => {
      // Volver a cargar solo los categoria activos en la misma página
      this.categoryService.listPageable(pageIndex, pageSize).subscribe((res: any) => {
        this.cant = res.totalElements;
        this.categories = res.content;
        this.dataSource.data = this.categories;
        // Si la página actual está vacía, regresa a la página anterior si es posible
        if (this.categories.length === 0 && pageIndex > 0) {
          this.paginator.previousPage();
        }
      });
    });
  }
  // Activar categoria
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
        this.fnActivar(Id); //La funcion de activar un categoria
      }
    });
  }
  //Funcion Activar categoria
  fnActivar(Id: number) {
    // Obtener el estado actual de la paginación
    const pageIndex = this.paginator.pageIndex;
    const pageSize = this.paginator.pageSize;
    // Activar el categoria
    this.categoryService.activateCategorytById(Id).subscribe(() => {
      // Volver a cargar solo los categoria inactivos en la misma página
      this.categoryService.listPageableI(pageIndex, pageSize).subscribe((res: any) => {
        this.cant = res.totalElements;
        this.categories = res.content;
        this.dataSource.data = this.categories;
        // Si la página actual está vacía, regresa a la página anterior si es posible
        if (this.categories.length === 0 && pageIndex > 0) {
          this.paginator.previousPage();
        }
      });
    });
  }
  //Abrir formulario al editar
  openmodal(categoria?: any) {
    this.dialog.open(CategoryModalComponent, {
      disableClose: true,
      width: '40rem',
      height: 'auto',
      data: categoria,
    });
  }
  //FILTRADO
  filtrar(event: any) {
    const valor = event.target.value; // Obtener el valor del input
    this.dataSource.filter = valor.trim().toLowerCase();
  }
  //REPORTES
  // Método para exportar categorías activas a PDF
  exportActivePDF() {
    this.categoryService.reportActivePDF().subscribe(
      (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lista_categorias.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      },
      (error: any) => {
        console.error('Error exporting active categories to PDF:', error);
      }
    );
  }
  // Método para exportar categorías inactivas a PDF
  exportInactivePDF() {
    this.categoryService.reportInactivePDF().subscribe(
      (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lista_categorias_inactivas.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      },
      (error: any) => {
        console.error('Error exporting inactive categories to PDF:', error);
      }
    );
  }

  filename = "Categorias.xlsx";

  exportExcel() {
    // Crear una copia de los datos actuales y mapear a los nombres de columnas en español
    const filteredData = this.dataSource.data.map(({ name, description }) => ({
      'Nombre': name,
      'Descripcion': description,
    }));

    // Crear una hoja de trabajo con los datos filtrados
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);

    // Crear un nuevo libro de trabajo
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Categorias');

    // Escribir el libro de trabajo a un archivo
    XLSX.writeFile(wb, this.filename);
  }

}