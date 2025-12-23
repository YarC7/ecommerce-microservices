export default function VendorDashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Vendor Dashboard
                </h1>
                <p className="text-muted-foreground mt-2">
                    Manage your products, orders, and sales
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats Cards */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                        Active Products
                    </h3>
                    <p className="text-3xl font-bold text-emerald-600">42</p>
                </div>
                <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-6 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                        Pending Orders
                    </h3>
                    <p className="text-3xl font-bold text-teal-600">18</p>
                </div>
                <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-6 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                        Total Revenue
                    </h3>
                    <p className="text-3xl font-bold text-cyan-600">$12,345</p>
                </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-6 bg-white dark:bg-slate-900">
                <h2 className="text-xl font-semibold mb-4">Vendor Portal</h2>
                <p className="text-muted-foreground">
                    Welcome to the vendor dashboard. This area is for merchants and sellers.
                </p>
                <div className="mt-4 space-y-2">
                    <p className="text-sm text-muted-foreground">• Manage product listings</p>
                    <p className="text-sm text-muted-foreground">• Process customer orders</p>
                    <p className="text-sm text-muted-foreground">• View sales analytics</p>
                    <p className="text-sm text-muted-foreground">• Update inventory</p>
                </div>
                <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                        <strong>Note:</strong> Vendor functionality is under development. Backend vendor role support coming soon.
                    </p>
                </div>
            </div>
        </div>
    );
}
