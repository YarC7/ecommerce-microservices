import { HeroSection } from "@/components/home/HeroSection";
import { ProductCategory } from "@/components/home/ProductCategory";
import { Newsfeed } from "@/components/home/Newsfeed";

export default function HomePage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section with Carousel */}
            <HeroSection />

            {/* Featured Products */}
            <ProductCategory
                category="featured"
                title="Sản phẩm nổi bật"
                limit={4}
            />

            {/* iPhone Category */}
            <ProductCategory
                category="iphone"
                title="iPhone"
                limit={4}
            />

            {/* MacBook Category */}
            <ProductCategory
                category="macbook"
                title="MacBook"
                limit={4}
            />

            {/* Newsfeed Section */}
            <Newsfeed />

            {/* Benefits Section
            <section className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center p-6">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center">
                            <span className="text-2xl">🚚</span>
                        </div>
                        <h3 className="font-semibold mb-2">Miễn phí vận chuyển</h3>
                        <p className="text-sm text-muted-foreground">
                            Cho đơn hàng trên 1.000.000₫
                        </p>
                    </div>
                    <div className="text-center p-6">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center">
                            <span className="text-2xl">✨</span>
                        </div>
                        <h3 className="font-semibold mb-2">Sản phẩm chất lượng</h3>
                        <p className="text-sm text-muted-foreground">
                            Được chọn lọc kỹ càng
                        </p>
                    </div>
                    <div className="text-center p-6">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center">
                            <span className="text-2xl">🔒</span>
                        </div>
                        <h3 className="font-semibold mb-2">Thanh toán an toàn</h3>
                        <p className="text-sm text-muted-foreground">
                            Bảo mật và mã hóa
                        </p>
                    </div>
                </div>
            </section> */}
        </div>
    );
}
