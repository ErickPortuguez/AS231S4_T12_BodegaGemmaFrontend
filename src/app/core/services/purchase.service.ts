import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  purchaseActualizar = new Subject<any[]>();

  constructor(private http: HttpClient) { }
  // Eliminar compra lógicamente por ID
  disablePurchaseById(PurchaseId: number) {
    return this.http.put(`${environment.apiUrl}/api/purchases/delete/${PurchaseId}`, {});
  }
  //Activar compra por ID
  activatePurchaseById(PurchaseId: number) {
    return this.http.put(`${environment.apiUrl}/api/purchases/activate/${PurchaseId}`, {});
  }
  // Editar compra por ID
  updatePurchaseById(PurchaseId: number, updatedPurchase: any) {
    return this.http.put(`${environment.apiUrl}/api/purchases/${PurchaseId}`, updatedPurchase);
  }
  // Insertar compra
  newPurchase(newPurchase: any) {
    return this.http.post(`${environment.apiUrl}/api/purchases`, newPurchase);
  }
  // Listar paginador activos
  listPageable(pag: number, tam: number) {
    return this.http.get(`${environment.apiUrl}/api/purchases/status/A/page?page=${pag}&size=${tam}`);
  }
  // Listar paginador inactivos
  listPageableI(pag: number, tam: number) {
    return this.http.get(`${environment.apiUrl}/api/purchases/status/I/page?page=${pag}&size=${tam}`);
  }
  //Listado de compras activos
  listActivePurchases() {
    return this.http.get(`${environment.apiUrl}/api/purchases/status/A`);
  }
  //Listado de compras inactivos
  listInactivePurchases() {
    return this.http.get(`${environment.apiUrl}/api/purchases/status/I`);
  }

  //REPORTES
  reportActivePDF(purchaseId: number) {
    return this.http.get(`${environment.apiUrl}/api/purchases/report/${purchaseId}`,  { responseType: 'blob' });
  }
  reportActiveExcel(purchaseId: number) {
    return this.http.get(`${environment.apiUrl}/api/purchases/report/excel/${purchaseId}`,  { responseType: 'blob' });
  }

}
