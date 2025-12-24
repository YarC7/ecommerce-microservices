"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar } from "lucide-react";

interface NewsItem {
    id: string;
    title: string;
    date: string;
    image?: string;
    category?: string;
}

const mockNews: NewsItem[] = [
    {
        id: "1",
        title: "Chương trình Ưu đãi CBNV - Tri Ân Sự Đồng Hành",
        date: "22/12/2025",
        category: "Khuyến mãi",
        image: "https://via.placeholder.com/400x250?text=Happy+Birthday",
    },
    {
        id: "2",
        title: "Ký tài liệu trực tiếp trên iPad: 3 mẹo tạo chữ ký điện tử chỉ trong 1 phút",
        date: "15/12/2025",
        category: "Hướng dẫn",
        image: "https://via.placeholder.com/400x250?text=iPad+Tips",
    },
    {
        id: "3",
        title: "Thời gian sử dụng trên iPhone: Tính năng giúp kiểm soát thói quen dùng điện thoại lành mạnh",
        date: "15/12/2025",
        category: "Tin tức",
        image: "https://via.placeholder.com/400x250?text=Screen+Time",
    },
];

export function Newsfeed() {
    return (
        <section className="container mx-auto px-4 py-12 bg-slate-50 dark:bg-slate-900/50">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Newsfeed</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Cập nhật những tin tức mới nhất về sản phẩm, khuyến mãi và hướng dẫn sử dụng
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {mockNews.map((news) => (
                    <Card key={news.id} className="group hover:shadow-lg transition-shadow overflow-hidden">
                        <CardHeader className="p-0">
                            <div className="relative h-48 overflow-hidden">
                                {news.image ? (
                                    <img
                                        src={news.image}
                                        alt={news.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 flex items-center justify-center">
                                        <Calendar className="w-16 h-16 text-purple-400" />
                                    </div>
                                )}
                                {news.category && (
                                    <div className="absolute top-2 right-2">
                                        <span className="px-2 py-1 text-xs font-semibold bg-white/90 dark:bg-slate-900/90 rounded-md">
                                            {news.category}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                                {news.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span>{news.date}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="text-center">
                <Button
                    variant="outline"
                    size="lg"
                    asChild
                    className="bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                >
                    <Link href="/newsfeed">
                        Xem tất cả Tin Tức →
                    </Link>
                </Button>
            </div>
        </section>
    );
}

