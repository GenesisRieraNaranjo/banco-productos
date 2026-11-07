import { HttpClient } from '@angular/common/http';
import { Injectable,inject } from '@angular/core';
import { Observable } from 'rxjs';
import { FinancialProduct, MessageResponse, ProductResponse, ProductsResponse, UpdateProductResponse } from '../models/financial-product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
   
  private readonly http= inject(HttpClient);
  private readonly apiUrl= '/bp/products';

  getProducts(): Observable<ProductsResponse>{
    return this.http.get<ProductsResponse>(
      this.apiUrl
    );
  }

  createProduct(product: FinancialProduct): Observable<ProductResponse>{
    return this.http.post<ProductResponse>(
      this.apiUrl,product
    );
  }


  updateProduct(id: string, product:UpdateProductResponse): Observable<ProductResponse>{
    return this.http.put<ProductResponse>(
      `${this.apiUrl}/${encodeURIComponent(id)}`,product
    );
  }


  deleteProduct(id: string): Observable<MessageResponse>{
    return this.http.delete<MessageResponse>(
      `${this.apiUrl}/${encodeURIComponent(id)}`
    );
  }


  verifyProductId(id: string): Observable<boolean>{
    return this.http.get<boolean>(
      `${this.apiUrl}/verification/${encodeURIComponent(id)}`
    );
  }

}
