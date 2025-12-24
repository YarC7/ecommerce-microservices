"use client";

import { Button } from "@/components/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { ShoppingBag, Sparkles } from "lucide-react";
import Link from "next/link";

interface HeroSlide {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    price?: string;
    offers?: string[];
    image?: string;
    ctaText: string;
    ctaLink: string;
    gradient: string;
}

const heroSlides: HeroSlide[] = [
    {
        id: "1",
        title: "MacBook Pro 14\"",
        subtitle: "SIÊU MẠNH MẼ",
        description: "với M5",
        price: "Chỉ từ 39.999.000₫",
        offers: [
            "Ưu đãi thanh toán tới 2 Triệu",
            "Mua kèm phụ kiện giảm tới 50%",
            "Ưu đãi thu cũ tới 4 Triệu",
        ],
        ctaText: "Mua ngay",
        ctaLink: "/products/macbook-pro",
        gradient: "from-slate-900 via-slate-800 to-slate-900",
    },
    {
        id: "2",
        title: "iPhone 17 Pro Max",
        subtitle: "CÔNG NGHỆ ĐỈNH CAO",
        description: "Camera 48MP Pro",
        price: "Chỉ từ 37.190.000₫",
        offers: [
            "Giảm giá 2%",
            "Tặng kèm ốp lưng cao cấp",
            "Bảo hành 12 tháng",
        ],
        ctaText: "Khám phá ngay",
        ctaLink: "/products/iphone-17-pro-max",
        gradient: "from-blue-900 via-blue-800 to-indigo-900",
    },
    {
        id: "3",
        title: "iPad Pro M5",
        subtitle: "SÁNG TẠO KHÔNG GIỚI HẠN",
        description: "Màn hình Liquid Retina XDR",
        price: "Chỉ từ 24.990.000₫",
        offers: [
            "Tặng Apple Pencil",
            "Giảm 5% khi thanh toán online",
            "Giao hàng miễn phí",
        ],
        ctaText: "Đặt hàng",
        ctaLink: "/products/ipad-pro",
        gradient: "from-purple-900 via-pink-800 to-rose-900",
    },
];

export function HeroSection() {
    return (
        <section className="relative w-full overflow-hidden">
            <Carousel
                opts={{
                    align: "start",
                    loop: true,
                }}
                className="w-full"
            >
                <CarouselContent>
                    {heroSlides.map((slide) => (
                        <CarouselItem key={slide.id}>
                            <div
                                className={`relative flex h-[500px] md:h-[600px] items-center justify-center bg-gradient-to-br ${slide.gradient} text-white overflow-hidden`}
                            >
                                {/* Background Pattern */}
                                <div className="absolute inset-0 opacity-10">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
                                </div>

                                <div className="container mx-auto px-4 relative z-10">
                                    <div className="grid md:grid-cols-2 gap-8 items-center">
                                        {/* Left: Image/Icon */}
                                        <div className="flex justify-center md:justify-start">
                                            <div className="relative">
                                                <div className="w-64 h-64 md:w-80 md:h-80 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                                                    <ShoppingBag className="w-32 h-32 md:w-40 md:h-40 text-white/80" />
                                                </div>
                                                <div className="absolute -top-4 -right-4">
                                                    <Sparkles className="w-16 h-16 text-yellow-400 animate-pulse" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Content */}
                                        <div className="text-center md:text-left space-y-6">
                                            <div className="space-y-2">
                                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                                                    {slide.title}
                                                </h1>
                                                <h2 className="text-3xl md:text-4xl font-extrabold text-yellow-400">
                                                    {slide.subtitle}
                                                </h2>
                                                <p className="text-xl md:text-2xl text-slate-300">
                                                    {slide.description}
                                                </p>
                                            </div>

                                            {slide.price && (
                                                <p className="text-2xl md:text-3xl font-bold text-green-400">
                                                    {slide.price}
                                                </p>
                                            )}

                                            {slide.offers && slide.offers.length > 0 && (
                                                <ul className="space-y-2 text-sm md:text-base text-slate-200">
                                                    {slide.offers.map((offer, idx) => (
                                                        <li key={idx} className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-yellow-400" />
                                                            {offer}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}

                                            <Link href={slide.ctaLink}>
                                                <Button
                                                    size="lg"
                                                    className="bg-white text-slate-900 hover:bg-slate-100 font-semibold px-8 py-6 text-lg"
                                                >
                                                    {slide.ctaText}
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="left-4 bg-white/20 hover:bg-white/30 text-white border-white/30" />
                <CarouselNext className="right-4 bg-white/20 hover:bg-white/30 text-white border-white/30" />
            </Carousel>
        </section>
    );
}

