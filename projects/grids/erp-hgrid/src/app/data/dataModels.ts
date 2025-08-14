/* eslint-disable id-blacklist */
/* eslint-disable @typescript-eslint/naming-convention */

interface DeliveryDetails {
  dateOrdered: string | null;
  dateShipped: string | null;
  dateDelivered: string | null;
}

export interface OrderDetails {
  country: string;
  city: string;
  zipCode: number;
  streetName: string;
  streetNumber: string;
}

interface Order {
  orderId: number;
  status: OrderStatus;
  delivery: DeliveryDetails;
  orderInformation: OrderDetails;
}

export interface DataPoint {
  unitsSold: number;
  month: string;
}

export interface TemplateDataModel {
  sku: string;
  imageUrl: string;
  productName: string;
  category: string;
  rating: number;
  unitsSold?: number;
  grossPrice: number;
  netPrice: number;
  totalNetProfit?: number;
  salesTrendData: DataPoint[];
  orders: Order[];
}

export enum OrderStatus  {
  PACKED = "Packed",
  IN_TRANSIT = "In Transit",
  CUSTOMS = "Customs",
  DELIVERED = "Delivered"
}

export type BadgeVariant = "primary" | "info" | "success" | "warning" | "error";