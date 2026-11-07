export interface FinancialProduct {
  id: string;
  name: string;
  description: string;
  logo: string;
  date_release: string;
  date_revision: string;
}

export interface ProductsResponse {
  data: FinancialProduct[];
}

export interface ProductResponse {
  message: string;
  data: FinancialProduct;
}

export interface MessageResponse {
  message: string;
}

export type UpdateProductResponse = Omit<FinancialProduct, 'id'>;