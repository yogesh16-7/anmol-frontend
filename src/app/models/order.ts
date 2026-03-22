export type Order = {
    id: string;
    user: string;
    orderItems: OrderItem[];
    shippingAddress: {
        street: string;
        apartment: string;
        zip: string;
        city: string;
        country: string;
    };
    phone: string;
    status: string;
    totalPrice: number;
    dateOrdered: string;
}

export type OrderItem = {
    product: string;
    quantity: number;
}