export default function HomePage() {
    return (
        <div className="container mx-auto px-4 py-12">
            {/* Hero Section */}
            <section className="mb-16 text-center">
                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Welcome to Go Store
                </h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Discover amazing products at unbeatable prices. Shop with confidence and enjoy fast, free shipping.
                </p>
                <div className="flex gap-4 justify-center">
                    <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all">
                        Shop Now
                    </button>
                    <button className="px-6 py-3 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                        Learn More
                    </button>
                </div>
            </section>

            {/* Featured Section */}
            <section className="mb-16">
                <h2 className="text-3xl font-bold mb-8">Featured Products</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="border border-slate-200 dark:border-slate-800 rounded-lg p-6 hover:shadow-lg transition-shadow bg-white dark:bg-slate-900"
                        >
                            <div className="h-48 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg mb-4" />
                            <h3 className="font-semibold text-lg mb-2">Product {i}</h3>
                            <p className="text-muted-foreground text-sm mb-4">
                                Amazing product description here
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold text-purple-600">$99.99</span>
                                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors">
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Benefits Section */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="text-center p-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-2xl">🚚</span>
                    </div>
                    <h3 className="font-semibold mb-2">Free Shipping</h3>
                    <p className="text-sm text-muted-foreground">
                        On orders over $50
                    </p>
                </div>
                <div className="text-center p-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-2xl">✨</span>
                    </div>
                    <h3 className="font-semibold mb-2">Quality Products</h3>
                    <p className="text-sm text-muted-foreground">
                        Hand-picked selection
                    </p>
                </div>
                <div className="text-center p-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-2xl">🔒</span>
                    </div>
                    <h3 className="font-semibold mb-2">Secure Checkout</h3>
                    <p className="text-sm text-muted-foreground">
                        Safe and encrypted
                    </p>
                </div>
            </section>
        </div>
    );
}
