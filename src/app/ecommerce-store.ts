import { computed, inject } from "@angular/core";
import { Product, } from "./models/product";
import { patchState, signalMethod, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { produce } from 'immer';
import { Toaster } from "./services/toaster";
import { CartItem } from "./models/cart";
import { MatDialog } from "@angular/material/dialog";
import { SignInDialog } from "./components/sign-in-dialog/sign-in-dialog";
import { SignInParams, SignUpParams, User } from "./models/user";
import { Router } from "@angular/router";
import { Order } from "./models/order";
import { withStorageSync } from "@angular-architects/ngrx-toolkit"
import { ApiService } from "./services/api";

export type EcommerceState = {
    products: Product[];
    category: String;
    wishlistItems: Product[];
    cartItems: CartItem[];
    user: User | undefined;

    loading: boolean;
    selectedProductId: string | undefined;
    shippingAddress: {
        address: string;
        address2: string;
        city: string;
        zip: string;
        country: string;
        phone: string;
    } | undefined;
}

export const EcommerceStore = signalStore(
    {
        providedIn: 'root'
    },
    withState({
        products: [],
        category: 'all',
        wishlistItems: [],
        cartItems: [],
        user: undefined,
        loading: false,
        selectedProductId: undefined,
        shippingAddress: undefined,
    } as EcommerceState),
    withStorageSync({ key: 'modern-store', select: ({ wishlistItems, cartItems, user }) => ({ wishlistItems, cartItems, user }) }),
    withComputed(({ category, products, wishlistItems, cartItems, selectedProductId }) => ({
        filteredProducts: computed(() => {
            if (category() === 'all') return products();
    
            return products().filter(p => p.category.toLowerCase() === category().toLowerCase())
        }),
        wishlistCount: computed(() => wishlistItems().length),
        cartCount: computed(() => cartItems().reduce((acc, item) => acc + item.quantity, 0)),
        selectedProduct: computed(() => products().find((p) => p.id === selectedProductId()))
    })),
    withMethods((store, toaster = inject(Toaster), matDialog = inject(MatDialog), router = inject(Router), api = inject(ApiService)) => ({
        loadProducts: () => {
            console.log('Loading products from backend...');
            patchState(store, { loading: true });
            api.getProducts().subscribe({
                next: (products) => {
                    console.log('Products loaded:', products);
                    patchState(store, { products, loading: false });
                },
                error: (error) => {
                    console.error('Failed to load products:', error);
                    toaster.error('Failed to load products: ' + (error.error?.message || 'Unknown error'));
                    patchState(store, { loading: false });
                }
            });
        },
        setCategory: signalMethod<string>((category: string) => {
            patchState(store, { category });
        }),
        setProductId: signalMethod<string>((productId: string) => {
            patchState(store, { selectedProductId: productId });
        }),
        updateShippingAddress: (address: { address: string; address2: string; city: string; zip: string; country: string; phone: string }) => {
            patchState(store, { shippingAddress: address });
        },
        addToWishlist: (product: Product) => {
            if (!store.user()) {
                toaster.error('Please log in to add items to your wishlist');
                return;
            }

            const updatedWishlistItems = produce(store.wishlistItems(), (draft) => {
                if(!draft.find(p => p.id === product.id)) {
                    draft.push(product);
                }
            });

            patchState(store, { wishlistItems: updatedWishlistItems });
            toaster.success("Product added to wishlist")
        },

        removeFromWishlist: (product: Product) => {
            patchState(store, {
                wishlistItems: store.wishlistItems().filter(p => p.id !== product.id),
            });
            toaster.success('Product removed from the wishlist');
        },

        clearWishlist: () => {
            patchState(store, { wishlistItems: [] })
        },

        addToCart: (product: Product, quantity = 1) => {
            if (!store.user()) {
                toaster.error('Please log in to add items to your cart');
                return;
            }

            const existingItemIndex = store.cartItems().findIndex(i => i.product.id === product.id);

            const updatedCartItems = produce(store.cartItems(), (draft) => {
                if(existingItemIndex !== -1) {
                    draft[existingItemIndex].quantity += quantity;
                    return;
                }

                draft.push({
                    product, quantity
                })
            });

            patchState(store, { cartItems: updatedCartItems })
            toaster.success(existingItemIndex !== -1 ? 'Product added again' : 'Product added to the cart')
        },
        setItemQuantity(params: { productId: string, quantity: number }) {
            const index = store.cartItems().findIndex(c => c.product.id === params.productId);
            const updated = produce(store.cartItems(), (draft) => {
                draft[index].quantity = params.quantity
            });

            patchState(store, { cartItems: updated });
        },
        addAllWishlistToCart: () => {
            const updatedCartItems = produce(store.cartItems(), (draft) => {
                store.wishlistItems().forEach(p => {
                    if(!draft.find(c => c.product.id === p.id)) {
                        draft.push({ product: p, quantity: 1});
                    }
                })
            })

            patchState(store, { cartItems: updatedCartItems, wishlistItems: [] })
        },
        moveToWishlist: (product: Product) => {
            const updatedCartItems = store.cartItems().filter((p => p.product.id !== product.id));
            const updatedWishlistItems = produce(store.wishlistItems(), (draft) => {
                if(!draft.find(p => p.id === product.id)) {
                    draft.push(product)
                }
            })

            patchState(store, { cartItems: updatedCartItems, wishlistItems: updatedWishlistItems });
        },
        removeFromCart: (product: Product) => {
            patchState(store, { cartItems: store.cartItems().filter(c => c.product.id !== product.id)})
        },
        proceedToCheckout: () => {
            if(!store.user()) {
            matDialog.open(SignInDialog, {
                disableClose: true,
                data: {
                    checkout: true
                }
            });
            return;
            }
            router.navigate(['/checkout']);
        },
        placeOrder: async () => {
            patchState(store, { loading: true });

            const orderItems = store.cartItems().map(item => ({
                product: item.product.id,
                quantity: item.quantity,
                price: item.product.price
            }));

            const total = store.cartItems().reduce((acc, item) => acc + item.quantity * item.product.price, 0);

            const shippingAddress = store.shippingAddress();

            const orderData = {
                orderItems,
                shippingAddress1: shippingAddress?.address || '',
                shippingAddress2: shippingAddress?.address2 || '',
                city: shippingAddress?.city || '',
                zip: shippingAddress?.zip || '',
                country: shippingAddress?.country || 'US',
                phone: shippingAddress?.phone || '123-456-7890',
                totalPrice: Math.round(total),
                user: store.user()?.id
            };

            // Store order in database asynchronously
            api.createOrder(orderData).subscribe({
                next: (order) => {
                    console.log('Order stored successfully:', order);
                },
                error: (error) => {
                    console.error('Failed to store order:', error);
                }
            });

            // Immediate user feedback
            patchState(store, { cartItems: [] });
            router.navigate(['order-success']);
            toaster.success('Order placed successfully');
            patchState(store, { loading: false });
        },
        signIn: ({ email, password, checkout, dialogId }: SignInParams) => {
            api.login(email, password).subscribe({
                next: (response) => {
                    patchState(store, { 
                        user : {
                            id: response.userId,
                            email: response.user,
                            name: 'John Doe', // TODO: get from response
                            token: response.token,
                        },
                    });
                    localStorage.setItem('token', response.token);
                    matDialog.getDialogById(dialogId)?.close();
                    toaster.success('Signed in successfully');
                    if(checkout) {
                        router.navigate(['/checkout']);
                    }
                },
                error: (error) => {
                    toaster.error('Sign in failed: ' + (error.error?.message || 'Unknown error'));
                }
            });
        },
        signOut: () => {
            patchState(store, { user: undefined });
            localStorage.removeItem('token');
            toaster.success('Signed out successfully');
        },
        signUp: ({ email, password, name, phone, street, apartment, zip, city, country, checkout, dialogId }: SignUpParams) => {
            api.register({ name, email, password, phone, street, apartment, zip, city, country }).subscribe({
                next: (response) => {
                    patchState(store, { 
                        user : {
                            id: response.id,
                            email: response.email,
                            name: response.name,
                        },
                    });
                    matDialog.getDialogById(dialogId)?.close();
                    toaster.success('Account created successfully');
                    if(checkout) {
                        router.navigate(['/checkout']);
                    }
                },
                error: (error) => {
                    toaster.error('Sign up failed: ' + (error.error?.message || 'Unknown error'));
                }
            });
        },

    }))
)