import { Component, OnInit, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { ProductService } from '../../core/services/product.service';
import { MatDialog } from '@angular/material/dialog';
import { ProductModalComponent } from './product-modal/product-modal.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {
  public displayedColumns: string[] = ['code', 'name', 'description', 'categoryProduct', 'priceUnit', 'unitSale', 'dateExpiryFormatted', 'stock', 'editar-eliminar'];
  public dataSourceP: MatTableDataSource<any>;
  public products: any[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  cant: number = 0;
  @ViewChild(MatSort) sort!: MatSort;
  public showInactiveButton: boolean = true;
  public showActiveButton: boolean = false;
  public showingInactiveProducts: boolean = false;

  constructor(private productService: ProductService, private dialog: MatDialog) {
    this.dataSourceP = new MatTableDataSource<any>([]);
  }

  ngOnInit(): void {
    console.log('OnInit');
    this.dataSourceP.filterPredicate = (data, filter: string) => {
      const transformedFilter = filter.trim().toLowerCase();
      const matchesCode = data.code.toLowerCase().includes(transformedFilter);
      const matchesName = data.name.toLowerCase().includes(transformedFilter);
      const matchesPrice = data.priceUnit.toString().toLowerCase().includes(transformedFilter);
      const matchesUnidadSale = data.unitSale.toLowerCase().includes(transformedFilter);
      const matchesStock = data.stock.toString().toLowerCase().includes(transformedFilter);
      const matchesCategory = data.categoryProduct.name.toLowerCase().includes(transformedFilter);
      return matchesCode || matchesName || matchesPrice || matchesUnidadSale || matchesStock || matchesCategory;
    };


    this.productService.productActualizar.subscribe(() => {
      this.getProducts();
      this.dataSourceP.sort = this.sort;
    });
    this.getProducts();
  }

  getProducts() {
    this.productService.listPageable(0, 10).subscribe(
      (res: any) => {
        console.log(res);
        this.cant = res.totalElements;
        this.products = res.content;
        this.dataSourceP.data = this.products;
        this.dataSourceP.sort = this.sort;
        this.showingInactiveProducts = false; // Establece showingInactiveProducts a false
      }
    );
  }

  getProductsInactive() {
    this.productService.listPageableI(0, 10).subscribe(
      (res: any) => {
        console.log(res);
        this.cant = res.totalElements;
        this.products = res.content;
        this.dataSourceP.data = this.products;
        this.showingInactiveProducts = true; // Establece showingInactiveProducts a true
      }
    );
  }

  Paginator(e: any) {
    if (this.showingInactiveProducts) {
      this.productService.listPageableI(e.pageIndex, e.pageSize).subscribe(
        (res: any) => {
          console.log(res);
          this.cant = res.totalElements;
          this.products = res.content;
          this.dataSourceP.data = this.products;
        }
      );
    } else {
      this.productService.listPageable(e.pageIndex, e.pageSize).subscribe(
        (res: any) => {
          console.log(res);
          this.cant = res.totalElements;
          this.products = res.content;
          this.dataSourceP.data = this.products;
        }
      );
    }
  }

  toggleButtons() {
    this.showingInactiveProducts = !this.showingInactiveProducts;
    if (this.showingInactiveProducts) {
      this.getProductsInactive();
    } else {
      this.getProducts();
    }
    this.showInactiveButton = !this.showInactiveButton;
    this.showActiveButton = !this.showActiveButton;
  }

  eliminar(Id: number) {
    Swal.fire({
      title: "¿Estás seguro de eliminar el producto?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, elimínalo!"
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "¡Eliminado!",
          text: "Su producto ha sido eliminado.",
          icon: "success"
        });
        this.fnEliminar(Id);
      }
    });
  }

  fnEliminar(Id: number) {
    const pageIndex = this.paginator.pageIndex;
    const pageSize = this.paginator.pageSize;

    this.productService.disableProductById(Id).subscribe(() => {
      this.productService.listPageable(pageIndex, pageSize).subscribe((res: any) => {
        this.cant = res.totalElements;
        this.products = res.content;
        this.dataSourceP.data = this.products;

        if (this.products.length === 0 && pageIndex > 0) {
          this.paginator.previousPage();
        }
      });
    });
  }

  activar(Id: number) {
    Swal.fire({
      title: "¿Estás seguro de restaurar al producto?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, restauralo!"
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "¡Restaurado!",
          text: "Su producto ha sido restaurado.",
          icon: "success"
        });
        this.fnActivar(Id);
      }
    });
  }

  fnActivar(Id: number) {
    const pageIndex = this.paginator.pageIndex;
    const pageSize = this.paginator.pageSize;

    this.productService.activateProductById(Id).subscribe(() => {
      this.productService.listPageableI(pageIndex, pageSize).subscribe((res: any) => {
        this.cant = res.totalElements;
        this.products = res.content;
        this.dataSourceP.data = this.products;

        if (this.products.length === 0 && pageIndex > 0) {
          this.paginator.previousPage();
        }
      });
    });
  }

  openmodal(producto?: any) {
    this.dialog.open(ProductModalComponent, {
      disableClose: true,
      width: '40rem',
      height: 'auto',
      data: producto,
    });
  }

  filtrar(event: any) {
    const valor = event.target.value;
    this.dataSourceP.filter = valor.trim().toLowerCase();
  }
  //Reportes
  exportActivePDF() {
    this.productService.reportActivePDF().subscribe(
      (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lista_productos.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      },
      (error: any) => {
        console.error('Error exporting active productos to PDF:', error);
      }
    );
  }

  exportInactivePDF() {
    this.productService.reportInactivePDF().subscribe(
      (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lista_productos_inactivas.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      },
      (error: any) => {
        console.error('Error exporting inactive productos to PDF:', error);
      }
    );
  }

  XLSX = "Productos.xlsx";

  exportXLSX() {
    // Crear una copia de los datos actuales y mapear a los nombres de columnas en español
    const filteredData = this.dataSourceP.data.map(({ code, name, description, categoryProduct, priceUnit, unitSale, dateExpiryFormatted, stock }) => ({
      'Codigo': code,
      'Nombre': name,
      'descripcion': description,
      'Categoría': categoryProduct.name,
      'Precio Unitario': priceUnit,
      'Unidad de Venta': unitSale,
      'Fecha de Expiración': dateExpiryFormatted,
      'Stock': stock
    }));

    // Crear una hoja de trabajo con los datos filtrados
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);

    // Crear un nuevo libro de trabajo
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Productos');

    // Escribir el libro de trabajo a un archivo
    XLSX.writeFile(wb, this.XLSX);
  }

  CSV = "Productos.csv";

  exportCSV() {
    // Crear una copia de los datos actuales y mapear a los nombres de columnas en español
    const filteredData = this.dataSourceP.data.map(({ code, name, description, categoryProduct, priceUnit, unitSale, dateExpiryFormatted, stock }) => ({
      'Codigo': code,
      'Nombre': name,
      'descripcion': description,
      'Categoría': categoryProduct.name,
      'Precio Unitario': priceUnit,
      'Unidad de Venta': unitSale,
      'Fecha de Expiración': dateExpiryFormatted,
      'Stock': stock
    }));

    // Crear una hoja de trabajo con los datos filtrados
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(filteredData);

    // Crear un nuevo libro de trabajo
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Productos');

    // Escribir el libro de trabajo a un archivo
    XLSX.writeFile(wb, this.CSV);
  }


  listStock() {
    this.productService.listStock().subscribe(
      (res: any) => {
        this.products = res;
        this.dataSourceP.data = this.products;
        this.showingInactiveProducts = false;
      },
      (error: any) => {
        console.error('Error listing products by stock:', error);
      }
    );
  }

  listExpiracion() {
    this.productService.listExpiracion().subscribe(
      (res: any) => {
        this.products = res;
        this.dataSourceP.data = this.products;
        this.showingInactiveProducts = false;
      },
      (error: any) => {
        console.error('Error listing products by expiracion:', error);
      }
    );
  }
}
