"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Star, Filter, ChevronDown, Grid3x3, LayoutGrid, Home } from "lucide-react";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

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

interface CategoryHeroData {
    title: string;
    description: string;
    image: string;
    productsCount: number;
}

export default function CategoryPage() {
    const params = useParams();
    const router = useRouter();
    const category = params.category as string;

    const [sortBy, setSortBy] = useState("popular");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);

    // Carousel tracking
    useEffect(() => {
        if (!api) {
            return;
        }

        setCurrent(api.selectedScrollSnap());

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap());
        });
    }, [api]);

    // Fetch products by category
    const { data, loading, error } = useApi(
        () => apiClient.products.list({ category, limit: 50 }),
        { immediate: true }
    );

    // Mock category data
    const categoryHeroData: Record<string, CategoryHeroData> = {
        "iphone": {
            title: "iPhone",
            description: "Khám phá dòng iPhone mới nhất với công nghệ tiên tiến và thiết kế đột phá",
            image: "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=1200&h=400&fit=crop",
            productsCount: 24,
        },
        "macbook": {
            title: "MacBook",
            description: "Hiệu suất vượt trội với chip Apple Silicon, thiết kế mỏng nhẹ đẳng cấp",
            image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&h=400&fit=crop",
            productsCount: 12,
        },
        "ipad": {
            title: "iPad",
            description: "Sức mạnh tablet hàng đầu cho công việc và giải trí",
            image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=1200&h=400&fit=crop",
            productsCount: 16,
        },
        "watch": {
            title: "Apple Watch",
            description: "Đồng hồ thông minh với tính năng sức khỏe và fitness toàn diện",
            image: "https://images.unsplash.com/photo-1434493907317-a46b5bbe7834?w=1200&h=400&fit=crop",
            productsCount: 8,
        },
        "airpods": {
            title: "AirPods",
            description: "Trải nghiệm âm thanh không dây tuyệt vời với chất lượng cao cấp",
            image: "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=1200&h=400&fit=crop",
            productsCount: 6,
        },
    };

    const currentCategory = categoryHeroData[category] || {
        title: category.charAt(0).toUpperCase() + category.slice(1),
        description: "Khám phá các sản phẩm tuyệt vời trong danh mục này",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&h=400&fit=crop",
        productsCount: 0,
    };

    // Series data - Update this based on category
    const seriesFilters: Record<string, string[]> = {
        "iphone": [
            "iPhone 17 series",
            "iPhone Air",
            "iPhone 16 series",
            "iPhone 15 series",
            "iPhone 14 series",
            "iPhone 13 series",
            "iPhone 11 series"
        ],
        "macbook": [
            "MacBook Pro M4",
            "MacBook Air M3",
            "MacBook Pro M3",
            "MacBook Air M2"
        ],
        "ipad": [
            "iPad Pro",
            "iPad Air",
            "iPad",
            "iPad Mini"
        ],
    };

    const availableSeries = seriesFilters[category] || [];

    // Category Banner Images - Multiple banners per category for carousel
    const categoryBanners: Record<string, string[]> = {
        "iphone": [
            "https://shopdunk.com//images/uploaded/banner/Banner%202025/Thang_12/home%20page/kv-T12_PC.png",
            "https://shopdunk.com/images/uploaded/banner/Banner%202025/Thang_12/home%20page/banner%20iP17pro_PC%20(3).png",
            "https://shopdunk.com/images/uploaded/banner/Banner%202025/Thang_12/home%20page/banner%20iP17_PC%20(2).png",
            "https://shopdunk.com/images/uploaded/banner/Banner%202025/Thang_12/home%20page/banner%20iP17%20air_PC%20(2).png",
        ],
        "macbook": [
            "https://shopdunk.com/images/uploaded/banner/Banner%202025/Thang_12/home%20page/banner%20MacBook%20Pro%20M5_PC.png",
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&h=400&fit=crop",
        ],
        "ipad": [
            "https://shopdunk.com/images/uploaded/banner/Banner%202025/Thang_12/home%20page/banner%20iPad%20Pro%20M5_PC.png",
            "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=1200&h=400&fit=crop",
        ],
        "watch": [
            "https://shopdunk.com/images/uploaded/banner/Banner%202025/Thang_12/home%20page/banner%20WatchUltra_PC.png",
            "https://images.unsplash.com/photo-1434493907317-a46b5bbe7834?w=1200&h=400&fit=crop",
        ],
        "airpods": [
            "https://shopdunk.com/images/uploaded/banner/Banner%202025/Thang_12/hone_2/banner%20%C3%82m%20thanh_PC.png",
            "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=1200&h=400&fit=crop",
        ],
    };

    const currentBanners = categoryBanners[category] || [
        currentCategory.image,
    ];

    // Mock products data for demonstration
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
            image: "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=500&h=500&fit=crop",
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
            image: "https://images.unsplash.com/photo-1678911820864-e2c567c655d7?w=500&h=500&fit=crop",
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
            image: "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=500&h=500&fit=crop",
        },
        {
            id: "4",
            name: "iPhone Air 256GB",
            description: "Lightweight and powerful",
            price: 29990000,
            originalPrice: 31999000,
            discount: 6,
            rating: 4.5,
            image: "https://images.unsplash.com/photo-1678911820864-e2c567c655d7?w=500&h=500&fit=crop",
        },
        {
            id: "5",
            name: "iPhone 16 Pro Max 512GB",
            description: "Previous generation flagship",
            price: 34990000,
            originalPrice: 36999000,
            discount: 5,
            rating: 4.7,
            image: "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=500&h=500&fit=crop",
        },
        {
            id: "6",
            name: "iPhone 16 Pro 256GB",
            description: "Pro performance at great value",
            price: 30990000,
            originalPrice: 32999000,
            discount: 6,
            rating: 4.6,
            image: "https://images.unsplash.com/photo-1678911820864-e2c567c655d7?w=500&h=500&fit=crop",
        },
        {
            id: "7",
            name: "iPhone 16 128GB",
            description: "Best value for everyday use",
            price: 22990000,
            originalPrice: 23999000,
            discount: 4,
            rating: 4.5,
            image: "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=500&h=500&fit=crop",
        },
        {
            id: "8",
            name: "iPhone 15 Pro Max 256GB",
            description: "Still powerful and reliable",
            price: 28990000,
            originalPrice: 31999000,
            discount: 9,
            rating: 4.6,
            image: "https://images.unsplash.com/photo-1678911820864-e2c567c655d7?w=500&h=500&fit=crop",
        },
    ];

    // Use real data or fallback to mock
    let products: Product[] = mockProducts;
    if (data) {
        if (Array.isArray(data)) {
            products = data as Product[];
        } else if ((data as any).products && Array.isArray((data as any).products)) {
            products = (data as any).products;
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    const sortProducts = (products: Product[]) => {
        switch (sortBy) {
            case "price-low":
                return [...products].sort((a, b) => a.price - b.price);
            case "price-high":
                return [...products].sort((a, b) => b.price - a.price);
            case "newest":
                return [...products].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
            case "discount":
                return [...products].sort((a, b) => (b.discount || 0) - (a.discount || 0));
            default:
                return products;
        }
    };

    // Filter products by series
    const filterBySeries = (products: Product[]) => {
        if (!selectedSeries) return products;

        return products.filter(product => {
            // Simple matching - you can make this more sophisticated
            return product.name.toLowerCase().includes(selectedSeries.toLowerCase().replace(' series', ''));
        });
    };

    const filteredProducts = filterBySeries(products);
    const sortedProducts = sortProducts(filteredProducts);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
            {/* Breadcrumb Navigation */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="container mx-auto px-4 py-4">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href="/" className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                        <span>Trang chủ</span>
                                    </Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="font-semibold">
                                    {currentCategory.title}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </div>

            {/* Hero Section - Carousel */}
            <section className="relative w-full overflow-hidden bg-white dark:bg-slate-950">
                <Carousel
                    setApi={setApi}
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    plugins={[
                        Autoplay({
                            delay: 5000,
                        }),
                    ]}
                    className="w-full"
                >
                    <CarouselContent>
                        {currentBanners.map((bannerUrl, index) => (
                            <CarouselItem key={index}>
                                <div className="relative w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                                    <img
                                        src={bannerUrl}
                                        alt={`${currentCategory.title} Banner ${index + 1}`}
                                        className="w-full h-full object-cover object-center"
                                        loading={index === 0 ? "eager" : "lazy"}
                                    />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-2 md:left-4 bg-gray-200/80 hover:bg-white text-slate-900 border-0 shadow-lg" />
                    <CarouselNext className="right-2 md:right-4 bg-gray-200/80 hover:bg-white text-slate-900 border-0 shadow-lg" />
                </Carousel>

                {/* Dots Indicator */}
                {currentBanners.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                        {currentBanners.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => api?.scrollTo(index)}
                                className={`h-2 rounded-full transition-all duration-300 ${index === current
                                        ? "w-8 bg-white"
                                        : "w-2 bg-white/50 hover:bg-white/80"
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Series Filter Tabs */}
            {availableSeries.length > 0 && (
                <section className="container mx-auto px-4 py-6">
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-4">
                        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2">

                            {/* Series Buttons */}
                            {availableSeries.map((series) => (
                                <button
                                    key={series}
                                    onClick={() => setSelectedSeries(series)}
                                    className={`px-4 py-2 rounded-lg font-normal text-sm whitespace-nowrap transition-all duration-200 ${selectedSeries === series
                                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                                        }`}
                                >
                                    {series}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Products Section */}
            <section className="container mx-auto px-4 py-12">
                {/* Product Grid */}
                {loading ? (
                    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`}>
                        {[...Array(8)].map((_, i) => (
                            <Card key={i} className="overflow-hidden">
                                <CardHeader className="p-0">
                                    <Skeleton className="h-64 w-full rounded-t-lg" />
                                </CardHeader>
                                <CardContent className="p-4 space-y-3">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-6 w-2/3" />
                                </CardContent>
                                <CardFooter className="p-4 pt-0">
                                    <Skeleton className="h-10 w-full" />
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : sortedProducts.length > 0 ? (
                    <div
                        className={`grid gap-6 ${viewMode === "grid"
                            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                            : "grid-cols-1"
                            }`}
                    >
                        {sortedProducts.map((product, index) => (
                            <Card
                                key={product.id}
                                className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 animate-in fade-in slide-in-from-bottom-4"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <CardHeader className="relative p-0 overflow-hidden">
                                    <Link href={`/products/${product.id}`}>
                                        <div className="relative h-64 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 overflow-hidden">
                                            {product.image ? (
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ShoppingCart className="w-20 h-20 text-slate-300 dark:text-slate-700" />
                                                </div>
                                            )}

                                            {/* Badges */}
                                            <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                                                <div className="flex flex-col gap-2">
                                                    {product.discount && (
                                                        <Badge className="bg-gradient-to-r from-red-500 to-pink-600 text-white border-0 shadow-lg">
                                                            <span className="text-xs font-bold">-{product.discount}%</span>
                                                        </Badge>
                                                    )}
                                                    {product.isNew && (
                                                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg">
                                                            <span className="text-xs font-bold">✨ MỚI</span>
                                                        </Badge>
                                                    )}
                                                </div>
                                                {product.rating && (
                                                    <Badge className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-0 shadow-lg">
                                                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                                                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                                                            {product.rating}
                                                        </span>
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </div>
                                    </Link>
                                </CardHeader>

                                <CardContent className="p-5 space-y-3">
                                    <Link href={`/products/${product.id}`}>
                                        <CardTitle className="text-base font-semibold line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {product.name}
                                        </CardTitle>
                                    </Link>

                                    {product.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {product.description}
                                        </p>
                                    )}

                                    <div className="space-y-1">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                                {formatPrice(product.price)}
                                            </span>
                                        </div>
                                        {product.originalPrice && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground line-through">
                                                    {formatPrice(product.originalPrice)}
                                                </span>
                                                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                                    Tiết kiệm {formatPrice(product.originalPrice - product.price)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>

                                <CardFooter className="p-5 pt-0 flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1 group/btn hover:border-slate-400 dark:hover:border-slate-600"
                                        asChild
                                    >
                                        <Link href={`/products/${product.id}`}>
                                            Xem chi tiết
                                        </Link>
                                    </Button>
                                    <Button
                                        className="flex-1 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 dark:from-white dark:to-slate-100 dark:hover:from-slate-100 dark:hover:to-white dark:text-slate-900 shadow-lg hover:shadow-xl transition-all"
                                    >
                                        <ShoppingCart className="w-4 h-4 mr-2" />
                                        Thêm vào giỏ
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                            <ShoppingCart className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Không tìm thấy sản phẩm</h3>
                        <p className="text-muted-foreground mb-6">
                            Danh mục này hiện chưa có sản phẩm nào
                        </p>
                        <Button asChild>
                            <Link href="/">Về trang chủ</Link>
                        </Button>
                    </div>
                )}
            </section>
        </div>
    );
}
