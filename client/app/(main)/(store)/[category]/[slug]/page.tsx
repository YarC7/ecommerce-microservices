"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import { apiClient } from "@/lib/api-client";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ShoppingCart,
    Star,
    Heart,
    Share2,
    Check,
    Minus,
    Plus,
    Truck,
    Shield,
    RefreshCw,
} from "lucide-react";
import Link from "next/link";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Product {
    id: string;
    name: string;
    slug: string;
    description?: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    images?: string[];
    category?: string;
    rating?: number;
    reviewCount?: number;
    isNew?: boolean;
    inStock?: boolean;
    specifications?: Record<string, string>;
    features?: string[];
}

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const category = params.category as string;
    const slug = params.slug as string;

    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);

    // Fetch product by slug
    const { data, loading, error } = useApi(
        () => apiClient.products.getBySlug(slug),
        { immediate: true }
    );

    // Mock product data
    const mockProduct: Product = {
        id: "1",
        name: "iPhone 17 Pro Max 256GB",
        slug: "iphone-17-pro-max-256gb",
        description:
            "iPhone 17 Pro Max mang đến trải nghiệm đỉnh cao với chip A19 Pro mạnh mẽ, camera tiên tiến và thiết kế titan cao cấp. Màn hình Super Retina XDR 6.9 inch với ProMotion 120Hz mang lại hình ảnh sống động như thật.",
        price: 37190000,
        originalPrice: 37999000,
        discount: 2,
        rating: 4.8,
        reviewCount: 256,
        isNew: true,
        inStock: true,
        category: "iphone",
        images: [
            "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1678911820864-e2c567c655d7?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1696446702094-89a854fo89ab?w=800&h=800&fit=crop",
            "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=800&h=800&fit=crop",
        ],
        specifications: {
            Màn_hình: "6.9 inch, Super Retina XDR, ProMotion 120Hz",
            Chip: "Apple A19 Pro",
            Camera_sau: "48MP Main + 12MP Ultra Wide + 12MP Telephoto",
            Camera_trước: "12MP TrueDepth",
            RAM: "8GB",
            Bộ_nhớ: "256GB",
            Pin: "4500mAh, sạc nhanh 30W",
            Hệ_điều_hành: "iOS 19",
            Kết_nối: "5G, WiFi 7, Bluetooth 5.4",
            Chống_nước: "IP68",
        },
        features: [
            "Dynamic Island với tương tác thông minh",
            "Camera 48MP với Photonic Engine",
            "Quay video ProRes 4K 60fps",
            "Màn hình Always-On",
            "Face ID thế hệ mới",
            "Sạc MagSafe 15W",
            "Chế độ Action Mode ổn định video",
            "Crash Detection - Phát hiện va chạm",
        ],
    };

    const product = (data as Product) || mockProduct;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    const handleQuantityChange = (delta: number) => {
        const newQuantity = quantity + delta;
        if (newQuantity >= 1 && newQuantity <= 10) {
            setQuantity(newQuantity);
        }
    };

    // Related products mock
    const relatedProducts: Product[] = [
        {
            ...mockProduct,
            id: "2",
            name: "iPhone 17 Pro 256GB",
            price: 33990000,
            originalPrice: 34999000,
        },
        {
            ...mockProduct,
            id: "3",
            name: "iPhone 17 256GB",
            price: 24690000,
            originalPrice: 24999000,
        },
        {
            ...mockProduct,
            id: "4",
            name: "iPhone Air 256GB",
            price: 29990000,
            originalPrice: 31999000,
        },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
                <div className="container mx-auto px-4 py-8">
                    <Skeleton className="h-8 w-96 mb-8" />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Skeleton className="h-[600px] w-full" />
                        <div className="space-y-6">
                            <Skeleton className="h-12 w-3/4" />
                            <Skeleton className="h-8 w-1/2" />
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
            {/* Breadcrumb */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="container mx-auto px-4 py-4">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href="/">Trang chủ</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href={`/${category}`}>
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="font-semibold">
                                    {product.name}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Product Main Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="relative aspect-square bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden group">
                            <img
                                src={product.images?.[selectedImage] || product.images?.[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                            {product.discount && (
                                <Badge className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-600 text-white border-0 shadow-lg">
                                    <span className="text-sm font-bold">-{product.discount}%</span>
                                </Badge>
                            )}
                        </div>

                        {/* Thumbnail Images */}
                        <div className="grid grid-cols-4 gap-4">
                            {product.images?.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index
                                        ? "border-slate-900 dark:border-white shadow-lg"
                                        : "border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500"
                                        }`}
                                >
                                    <img
                                        src={image}
                                        alt={`${product.name} ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        {/* Title & Rating */}
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold mb-3">
                                {product.name}
                            </h1>
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                            <div className="flex items-baseline gap-4">
                                <span className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                    {formatPrice(product.price)}
                                </span>
                                {product.originalPrice && (
                                    <span className="text-xl text-muted-foreground line-through">
                                        {formatPrice(product.originalPrice)}
                                    </span>
                                )}
                            </div>
                            {product.originalPrice && (
                                <p className="text-green-600 dark:text-green-400 font-medium">
                                    Tiết kiệm{" "}
                                    {formatPrice(product.originalPrice - product.price)}
                                </p>
                            )}
                        </div>

                        {/* Stock Status */}
                        <div className="flex items-center gap-2">
                            {product.inStock ? (
                                <>
                                    <Check className="w-5 h-5 text-green-600" />
                                    <span className="text-green-600 dark:text-green-400 font-medium">
                                        Còn hàng
                                    </span>
                                </>
                            ) : (
                                <span className="text-red-600 dark:text-red-400 font-medium">
                                    Hết hàng
                                </span>
                            )}
                        </div>

                        {/* Description */}
                        <p className="text-base text-muted-foreground leading-relaxed">
                            {product.description}
                        </p>

                        {/* Quantity Selector */}
                        <div className="space-y-3">
                            <label className="text-sm font-semibold">Số lượng:</label>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleQuantityChange(-1)}
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="w-4 h-4" />
                                    </Button>
                                    <span className="w-12 text-center font-semibold">
                                        {quantity}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleQuantityChange(1)}
                                        disabled={quantity >= 10}
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button
                                size="lg"
                                className="flex-1 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 dark:from-white dark:to-slate-100 dark:hover:from-slate-100 dark:hover:to-white dark:text-slate-900 shadow-lg hover:shadow-xl"
                                disabled={!product.inStock}
                            >
                                <ShoppingCart className="w-5 h-5 mr-2" />
                                Thêm vào giỏ hàng
                            </Button>
                            <Button size="lg" variant="outline">
                                <Heart className="w-5 h-5" />
                            </Button>
                            <Button size="lg" variant="outline">
                                <Share2 className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Benefits */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                            <div className="flex items-start gap-3">
                                <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-sm">Miễn phí vận chuyển</p>
                                    <p className="text-xs text-muted-foreground">
                                        Toàn quốc
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-sm">Bảo hành chính hãng</p>
                                    <p className="text-xs text-muted-foreground">12 tháng</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <RefreshCw className="w-5 h-5 text-purple-600 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-sm">Đổi trả miễn phí</p>
                                    <p className="text-xs text-muted-foreground">Trong 7 ngày</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Details Tabs */}
                <Card className="border-0 shadow-none mb-16">
                    <CardContent className="p-0">
                        <Tabs defaultValue="description" className="w-full">
                            <TabsList className="w-full justify-center rounded-none bg-transparent h-auto p-0 gap-4 border-0">
                                <TabsTrigger
                                    value="description"
                                    className="px-8 py-3 rounded-lg border border-slate-300 dark:border-slate-700 data-[state=active]:border-blue-600 data-[state=active]:border-2 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 bg-white dark:bg-slate-900"
                                >
                                    Mô tả sản phẩm
                                </TabsTrigger>
                                <TabsTrigger
                                    value="specs"
                                    className="px-8 py-3 rounded-lg border border-slate-300 dark:border-slate-700 data-[state=active]:border-blue-600 data-[state=active]:border-2 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 bg-white dark:bg-slate-900"
                                >
                                    Thông số kỹ thuật
                                </TabsTrigger>
                                <TabsTrigger
                                    value="details"
                                    className="px-8 py-3 rounded-lg border border-slate-300 dark:border-slate-700 data-[state=active]:border-blue-600 data-[state=active]:border-2 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 bg-white dark:bg-slate-900"
                                >
                                    Chi tiết sản phẩm
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="description" className="p-6">
                                <div className="prose dark:prose-invert max-w-none">
                                    <p className="text-base leading-relaxed text-muted-foreground">
                                        {product.description}
                                    </p>
                                    <div className="mt-6 space-y-4">
                                        <h3 className="text-xl font-semibold">Giới thiệu</h3>
                                        <p className="text-base leading-relaxed text-muted-foreground">
                                            {product.name} là sản phẩm cao cấp nhất trong dòng sản phẩm của Apple,
                                            mang đến trải nghiệm tuyệt vời với hiệu năng mạnh mẽ, camera tiên tiến
                                            và thiết kế sang trọng. Đây là lựa chọn hoàn hảo cho những ai đang tìm
                                            kiếm một chiếc điện thoại cao cấp với đầy đủ tính năng.
                                        </p>
                                        <h3 className="text-xl font-semibold mt-6">Điểm nổi bật</h3>
                                        <ul className="space-y-2 text-base text-muted-foreground">
                                            <li className="flex items-start gap-2">
                                                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span>Hiệu năng vượt trội với chip xử lý mới nhất</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span>Camera chuyên nghiệp, chụp ảnh sắc nét trong mọi điều kiện ánh sáng</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span>Màn hình lớn, hiển thị sống động với công nghệ tiên tiến</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                <span>Pin sử dụng cả ngày dài, sạc nhanh tiện lợi</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="specs" className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {product.specifications &&
                                        Object.entries(product.specifications).map(
                                            ([key, value]) => (
                                                <div
                                                    key={key}
                                                    className="flex justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg"
                                                >
                                                    <span className="font-semibold">
                                                        {key.replace(/_/g, " ")}:
                                                    </span>
                                                    <span className="text-muted-foreground">{value}</span>
                                                </div>
                                            )
                                        )}
                                </div>
                            </TabsContent>

                            <TabsContent value="details" className="p-6">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-semibold mb-4">Tính năng nổi bật</h3>
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {product.features?.map((feature, index) => (
                                                <li key={index} className="flex items-start gap-3">
                                                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                                        <h3 className="text-xl font-semibold mb-4">Thông tin bổ sung</h3>
                                        <div className="space-y-3 text-muted-foreground">
                                            <p><strong>Xuất xứ:</strong> Trung Quốc (Assembled by Apple)</p>
                                            <p><strong>Thời gian bảo hành:</strong> 12 tháng chính hãng</p>
                                            <p><strong>Hộp bao gồm:</strong> Máy, Cáp sạc USB-C, Tài liệu hướng dẫn</p>
                                            <p><strong>Trọng lượng:</strong> 240g</p>
                                            <p><strong>Kích thước:</strong> 160.8 x 78.1 x 8.25 mm</p>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Related Products */}
                <section>
                    <h2 className="text-2xl font-bold mb-6">Sản phẩm liên quan</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {relatedProducts.map((relatedProduct) => (
                            <Card
                                key={relatedProduct.id}
                                className="group hover:shadow-xl transition-all duration-300"
                            >
                                <CardHeader className="p-0">
                                    <div className="relative aspect-square bg-slate-100 dark:bg-slate-900 rounded-t-lg overflow-hidden">
                                        <img
                                            src={relatedProduct.images?.[0]}
                                            alt={relatedProduct.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <CardTitle className="text-base mb-3 line-clamp-2">
                                        {relatedProduct.name}
                                    </CardTitle>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xl font-bold">
                                            {formatPrice(relatedProduct.price)}
                                        </span>
                                        {relatedProduct.originalPrice && (
                                            <span className="text-sm text-muted-foreground line-through">
                                                {formatPrice(relatedProduct.originalPrice)}
                                            </span>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter className="p-4 pt-0">
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link href={`/${category}/${relatedProduct.slug}`}>
                                            Xem chi tiết
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
