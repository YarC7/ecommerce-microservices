export default function AdminDashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                    Admin Dashboard
                </h1>
                <p className="text-muted-foreground mt-2">
                    System administration and management portal
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats Cards */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-6 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                        Total Users
                    </h3>
                    <p className="text-3xl font-bold text-indigo-600">1,234</p>
                </div>
                <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-6 bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-950/20 dark:to-teal-950/20">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                        Active Vendors
                    </h3>
                    <p className="text-3xl font-bold text-cyan-600">56</p>
                </div>
                <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                        Total Orders
                    </h3>
                    <p className="text-3xl font-bold text-blue-600">8,901</p>
                </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-6 bg-white dark:bg-slate-900">
                <h2 className="text-xl font-semibold mb-4">Admin Functions</h2>
                <p className="text-muted-foreground">
                    Only users with the <strong>admin</strong> role can access this dashboard.
                </p>
                <div className="mt-4 space-y-2">
                    <p className="text-sm text-muted-foreground">• Manage users and permissions</p>
                    <p className="text-sm text-muted-foreground">• View system analytics</p>
                    <p className="text-sm text-muted-foreground">• Configure platform settings</p>
                    <p className="text-sm text-muted-foreground">• Monitor vendor activities</p>
                </div>
            </div>
        </div>
    );
}
