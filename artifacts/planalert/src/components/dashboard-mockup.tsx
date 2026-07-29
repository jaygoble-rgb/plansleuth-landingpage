import {
  LayoutGrid,
  FileText,
  BellRing,
  Clock,
  Settings,
  Wifi,
  ChevronRight,
} from "lucide-react";
import { BellLogo } from "@/components/bell-logo";

const savingsTrend = [
  18, 22, 20, 28, 26, 34, 30, 38, 42, 40, 48, 52, 50, 58, 64, 62, 70, 74, 80,
];

function TrendChart() {
  const width = 180;
  const height = 64;
  const max = Math.max(...savingsTrend);
  const min = Math.min(...savingsTrend);
  const step = width / (savingsTrend.length - 1);
  const points = savingsTrend.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / (max - min)) * (height - 8) - 4;
    return [x, y] as const;
  });
  const line = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} ${width},${height} 0,${height}`;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-16"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="savings-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#16a34a" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#savings-fill)" />
      <polyline
        points={line}
        fill="none"
        stroke="#16a34a"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const navItems = [
  { label: "Dashboard", icon: LayoutGrid, active: true },
  { label: "Plans", icon: FileText },
  { label: "Alerts", icon: BellRing },
  { label: "History", icon: Clock },
  { label: "Settings", icon: Settings },
];

function ServiceRow({
  icon,
  iconBg,
  name,
  provider,
  cost,
  savings,
}: {
  icon: React.ReactNode;
  iconBg: string;
  name: string;
  provider: string;
  cost: string;
  savings: string;
}) {
  return (
    <div className="flex items-stretch rounded-xl border border-primary/8 overflow-hidden bg-white">
      <div className="flex items-center gap-3 p-3 flex-1 min-w-0">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 ${iconBg}`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold text-primary leading-tight truncate">{name}</div>
          <div className="text-[11px] text-muted-foreground leading-tight truncate">
            {provider}
          </div>
          <div className="text-sm font-bold text-primary mt-1">
            {cost}
            <span className="text-[10px] font-medium text-muted-foreground"> /mo</span>
          </div>
          <div className="text-[10px] text-muted-foreground">Current cost</div>
        </div>
      </div>
      <div className="bg-green-50 p-3 flex flex-col justify-between w-[38%] shrink-0">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-green-700/70">
            Potential Savings
          </div>
          <div className="text-base font-bold text-green-700">
            {savings}
            <span className="text-[10px] font-medium text-green-700/70"> /mo</span>
          </div>
        </div>
        <button
          type="button"
          className="mt-2 flex items-center justify-between gap-1 rounded-md bg-white border border-green-200 px-2 py-1 text-[11px] font-semibold text-primary"
          tabIndex={-1}
        >
          View Options
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export function DashboardMockup() {
  return (
    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl shadow-primary/10 border border-primary/8 overflow-hidden">
      <div className="grid grid-cols-[120px_1fr]">
        {/* Sidebar */}
        <div className="border-r border-primary/8 p-4">
          <div className="flex items-center gap-1.5 font-serif text-sm font-bold text-primary mb-5">
            <BellLogo className="h-4 w-auto" />
            PlanAlert
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium ${
                  item.active
                    ? "bg-blue-50 text-blue-700"
                    : "text-muted-foreground"
                }`}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </div>
            ))}
          </nav>
        </div>

        {/* Main */}
        <div className="p-4 min-w-0">
          <h3 className="text-sm font-bold text-primary mb-3">Dashboard</h3>

          <div className="rounded-xl border border-primary/8 p-3 mb-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[11px] text-muted-foreground">
                  Potential Annual Savings
                </div>
                <div className="text-2xl font-bold text-green-600 leading-tight">
                  $480
                  <span className="text-xs font-medium text-muted-foreground"> /year</span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  That's <span className="font-semibold text-primary">$40</span> /month
                </div>
              </div>
              <div className="w-28 self-end">
                <TrendChart />
              </div>
            </div>
          </div>

          <div className="text-xs font-bold text-primary mb-2">Your Services</div>
          <div className="space-y-2">
            <ServiceRow
              icon={<span className="text-sm font-bold">T</span>}
              iconBg="bg-pink-500"
              name="Wireless"
              provider="Northwind Unlimited MAX"
              cost="$145"
              savings="$32"
            />
            <ServiceRow
              icon={<Wifi className="w-5 h-5" />}
              iconBg="bg-blue-500"
              name="Internet"
              provider="Brightwave Performance"
              cost="$80"
              savings="$18"
            />
          </div>

          <div className="flex items-end justify-between mt-4 pt-3 border-t border-primary/8">
            <div>
              <div className="text-[10px] text-muted-foreground">Next check-in</div>
              <div className="text-xs font-bold text-primary">May 20, 2026</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-muted-foreground">
                Monitoring 1,200+ plans
              </div>
              <div className="flex items-center justify-end gap-1 text-xs font-bold text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Active
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardMockup;
