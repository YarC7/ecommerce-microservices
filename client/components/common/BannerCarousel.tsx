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

interface BannerCarouselProps {
    banners: string[];
    autoplayDelay?: number;
    showControls?: boolean;
    showDots?: boolean;
    altPrefix?: string;
    className?: string;
}

export function BannerCarousel({
    banners,
    autoplayDelay = 5000,
    showControls = true,
    showDots = true,
    altPrefix = "Banner",
    className = "",
}: BannerCarouselProps) {
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
        <section
            className={`relative w-full overflow-hidden bg-white dark:bg-slate-950 ${className}`}
        >
            <Carousel
                setApi={setApi}
                opts={{
                    align: "start",
                    loop: true,
                }}
                plugins={[
                    Autoplay({
                        delay: autoplayDelay,
                    }),
                ]}
                className="w-full"
            >
                <CarouselContent>
                    {banners.map((bannerUrl, index) => (
                        <CarouselItem key={index}>
                            <div className="relative w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                                <img
                                    src={bannerUrl}
                                    alt={`${altPrefix} ${index + 1}`}
                                    className="w-full h-full object-cover object-center"
                                    loading={index === 0 ? "eager" : "lazy"}
                                />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>

                {/* Navigation Controls */}
                {showControls && (
                    <>
                        <CarouselPrevious className="left-2 md:left-4 bg-gray-200/80 hover:bg-white text-slate-900 border-0 shadow-lg" />
                        <CarouselNext className="right-2 md:right-4 bg-gray-200/80 hover:bg-white text-slate-900 border-0 shadow-lg" />
                    </>
                )}
            </Carousel>

            {/* Dots Indicator */}
            {showDots && banners.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                    {banners.map((_, index) => (
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
    );
}
