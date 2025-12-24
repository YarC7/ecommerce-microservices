"use client";

import { BannerCarousel } from "@/components/common/BannerCarousel";

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
    return <BannerCarousel banners={slides} autoplayDelay={20000} />;
}
