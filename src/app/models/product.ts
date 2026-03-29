import { UserReview } from "./user-review";

export type Product = {
    id: string;
    name: string;
    description: string;
    richDescription: string;
    price: number;
    image: string;
    category: string;
    countInStock: number;
    rating?: number;
    numReviews?: number;
}