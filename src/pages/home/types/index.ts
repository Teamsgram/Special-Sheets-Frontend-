export type SaleItem = {
  payment_amount: number;
  payment_schedualed_pay_day: string;
  payment_paid_amount: number;
  payment_status: "full-paid" | "partly-paid" | "not-paid";
  payment_completed_date: string;
  _id: string;
};

export type ClientType = {
  _id?: string;
  client_name: string;
  client_surname: string;
  client_phone_number: string;
  client_prefered_language: string;
};

export type OrderType = {
  _id: string;
  order_generated_id: string;
  order_created_date: string;
  order_assigned_client: ClientType;
  order_number: number;
  order_products: {
    product_name: string;
    product_added_date: string;
    product_full_amount: number;
    product_profit_amount: number;
    product_pre_paid_amount: number;
    product_payment_period_start_date: string;
    product_payment_period_end_date: string;
    payment_graphics: SaleItem[];
    _id: string;
    length?: number;
  }[];
  order_status: "process" | "finished" | "canceled";
  data: {
    product_name: string;
    product_added_date: string;
    product_full_amount: number;
    product_pre_paid_amount: number;
    product_payment_period_start_date: string;
    product_payment_period_end_date: string;
    payment_graphics: SaleItem[];
    _id: string;
  }[];
};

export interface AssignClientDto {
  client_id: string;
}

export interface AddProductDto {
  product_name: string;
  product_full_amount: number;
  product_pre_paid_amount?: number;
  product_payment_period_start_date: string; // ISO format
  product_payment_period_end_date: string; // ISO format
}

export interface AddPaymentDto {
  amount: number;
}
