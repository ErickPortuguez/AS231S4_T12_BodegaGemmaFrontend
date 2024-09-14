import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class SaleService {
  saleActualizar = new Subject<any[]>();

  constructor(private http: HttpClient) { }
  // Eliminar venta lógicamente por ID
  disableSaleById(saleId: number) {
    return this.http.put(`${environment.apiUrl}/api/sales/delete/${saleId}`, {});
  }
  //Activar venta por ID
  activateSaleById(saleId: number) {
    return this.http.put(`${environment.apiUrl}/api/sales/activate/${saleId}`, {});
  }
  // Editar venta por ID
  updateSaleById(saleId: number, updatedSale: any) {
    return this.http.put(`${environment.apiUrl}/api/sales/${saleId}`, updatedSale);
  }
  // Insertar venta
  newSale(newSale: any) {
    return this.http.post(`${environment.apiUrl}/api/sales`, newSale);
  }
  // Listar paginador activos
  listPageable(pag: number, tam: number) {
    return this.http.get(`${environment.apiUrl}/api/sales/status/A/page?page=${pag}&size=${tam}`);
  }
  // Listar paginador inactivos
  listPageableI(pag: number, tam: number) {
    return this.http.get(`${environment.apiUrl}/api/sales/status/I/page?page=${pag}&size=${tam}`);
  }
  //Listado de ventas activos
  listActiveSales() {
    return this.http.get(`${environment.apiUrl}/api/sales/status/A`);
  }
  //Listado de ventas inactivos
  listInactiveSales() {
    return this.http.get(`${environment.apiUrl}/api/sales/status/I`);
  }

  //REPORTES
  reportActivePDF(saleId: number) {
    return this.http.get(`${environment.apiUrl}/api/sales/report/${saleId}`,  { responseType: 'blob' });
  }
  reportActiveExcel(saleId: number) {
    return this.http.get(`${environment.apiUrl}/api/sales/report/excel/${saleId}`,  { responseType: 'blob' });
  }
}
