"use client";

import { useState, useEffect } from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const slides = [
    "https://shopdunk.com//images/uploaded/banner/Banner%202025/Thang_12/home%20page/kv-T12_PC.png",
    "https://shopdunk.com/images/uploaded/banner/Banner%202025/Thang_12/home%20page/banner%20iPad%20Pro%20M5_PC.png",
    "https://shopdunk.com/images/uploaded/banner/Banner%202025/Thang_12/home%20page/banner%20MacBook%20Pro%20M5_PC.png",
    "https://shopdunk.com/images/uploaded/banner/Banner%202025/Thang_12/home%20page/banner%20iP17%20air_PC%20(2).png",
    "https://shopdunk.com/images/uploaded/banner/Banner%202025/Thang_12/home%20page/banner%20iP17pro_PC%20(3).png",
    "https://shopdunk.com/images/uploaded/banner/Banner%202025/Thang_12/home%20page/banner%20iP17_PC%20(2).png",
    "https://shopdunk.com/images/uploaded/banner/Banner%202025/Thang_12/home%20page/banner%20WatchUltra_PC.png",
    "https://shopdunk.com/images/uploaded/banner/Banner%202025/Thang_12/hone_2/banner%20PK%20apple_PC.png",
    "https://shopdunk.com/images/uploaded/banner/Banner%202025/Thang_12/hone_2/banner%20%C3%82m%20thanh_PC.png",
    "https://shopdunk.com/images/uploaded/banner/Banner%202025/Thang_12/hone_2/banner%20Camera_PC.png",
    "https://imagedelivery.net/pcfIh3eYwfdNQBLIm8PT-Q/8d9779cd-c32d-4b9e-0397-02279b3ae500/sddesktop"
];

export function HeroSection() {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (!api) {
            return;
        }

        setCurrent(api.selectedScrollSnap());

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap());
        });
    }, [api]);

    return (
        <section className="relative w-full overflow-hidden bg-white dark:bg-slate-950">
            <Carousel
                setApi={setApi}
                opts={{
                    align: "start",
                    loop: true,
                }}
                plugins={[
                    Autoplay({
                        delay: 20000,
                    }),
                ]}
                className="w-full"
            >
                <CarouselContent>
                    {slides.map((slideUrl, index) => (
                        <CarouselItem key={index}>
                            <div className="relative w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                                <img
                                    src={slideUrl}
                                    alt={`Banner ${index + 1}`}
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
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                {slides.map((_, index) => (
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
        </section>
    );
}
