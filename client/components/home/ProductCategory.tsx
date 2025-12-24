"use client";

import { useApi } from "@/hooks/use-api";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    image?: string;
    category?: string;
    rating?: number;
    isNew?: boolean;
}

interface ProductCategoryProps {
    category: string;
    title: string;
    limit?: number;
}

export function ProductCategory({ category, title, limit = 4 }: ProductCategoryProps) {
    const { data, loading, error } = useApi(
        () => apiClient.products.list({ category, limit }),
        { immediate: true }
    );

    // Mock data for demonstration if API doesn't return data
    const mockProducts: Product[] = [
        {
            id: "1",
            name: "iPhone 17 Pro Max 256GB",
            description: "Latest iPhone with advanced features",
            price: 37190000,
            originalPrice: 37999000,
            discount: 2,
            rating: 4.8,
            isNew: true,
        },
        {
            id: "2",
            name: "iPhone 17 Pro 256GB",
            description: "Professional grade smartphone",
            price: 33990000,
            originalPrice: 34999000,
            discount: 2,
            rating: 4.7,
            isNew: true,
        },
        {
            id: "3",
            name: "iPhone 17 256GB",
            description: "Powerful and elegant",
            price: 24690000,
            originalPrice: 24999000,
            discount: 1,
            rating: 4.6,
            isNew: true,
        },
        {
            id: "4",
            name: "iPhone Air 256GB",
            description: "Lightweight and powerful",
            price: 29990000,
            originalPrice: 31999000,
            discount: 6,
            rating: 4.5,
        },
    ];

    // Fallback to mock data if API fails or returns no data
    // Handle both array response and object response with products property
    let products: Product[] = mockProducts;
    if (data) {
        if (Array.isArray(data)) {
            products = data as Product[];
        } else if ((data as any).products && Array.isArray((data as any).products)) {
            products = (data as any).products;
        }
    }

    // Log for debugging
    if (error) {
        console.warn(`[ProductCategory] API error, using mock data:`, error.message);
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    return (
        <section className="container mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">{title}</h2>
                <Link href={`/products?category=${category}`}>
                    <Button variant="ghost" className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
                        Xem tất cả →
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(limit)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-48 w-full" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardContent>
                            <CardFooter>
                                <Skeleton className="h-10 w-full" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.slice(0, limit).map((product) => (
                        <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                            <CardHeader className="relative p-0">
                                <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-t-lg overflow-hidden">
                                    {product.image ? (
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ShoppingCart className="w-16 h-16 text-slate-400" />
                                        </div>
                                    )}
                                    {product.discount && (
                                        <Badge
                                            variant="destructive"
                                            className="absolute top-2 left-2"
                                        >
                                            Giảm {product.discount}%
                                        </Badge>
                                    )}
                                    {product.isNew && (
                                        <Badge
                                            className="absolute top-2 right-2 bg-green-500 hover:bg-green-600"
                                        >
                                            Mới
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <CardTitle className="mb-2 line-clamp-2">{product.name}</CardTitle>
                                {/* {product.description && (
                                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                        {product.description}
                                    </p>
                                )}
                                {product.rating && (
                                    <div className="flex items-center gap-1 mb-2">
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        <span className="text-sm font-medium">{product.rating}</span>
                                    </div>
                                )} */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-bold text-slate-900 dark:text-white">
                                        {formatPrice(product.price)}
                                    </span>
                                    {product.originalPrice && (
                                        <span className="text-sm text-muted-foreground line-through">
                                            {formatPrice(product.originalPrice)}
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    asChild
                                >
                                    <Link href={`/products/${product.id}`}>Chi tiết</Link>
                                </Button>
                                <Button
                                    className="flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900"
                                >
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    Thêm
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </section>
    );
}

