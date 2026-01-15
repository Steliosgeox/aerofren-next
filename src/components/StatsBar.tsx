"use client";

import { Calendar, Package, Users, Truck } from "lucide-react";

const stats = [
  {
    icon: <Calendar className="w-6 h-6" />,
    value: "35+",
    label: "Χρόνια Εμπειρίας",
    description: "Από το 1990",
  },
  {
    icon: <Package className="w-6 h-6" />,
    value: "10.000+",
    label: "Προϊόντα σε Stock",
    description: "Άμεσα διαθέσιμα",
  },
  {
    icon: <Users className="w-6 h-6" />,
    value: "500+",
    label: "Ενεργοί Συνεργάτες",
    description: "Πανελλαδικά",
  },
  {
    icon: <Truck className="w-6 h-6" />,
    value: "24ωρη",
    label: "Αποστολή",
    description: "Για παραγγελίες έως 14:00",
  },
];

interface StatsBarProps {
  variant?: "default" | "dark" | "gradient";
}

export function StatsBar({ variant = "default" }: StatsBarProps) {
  const bgClass = {
    default: "bg-white border-y border-slate-200",
    dark: "bg-slate-900 text-white",
    gradient: "bg-gradient-to-r from-[#0066cc] to-blue-700 text-white",
  };

  const textClass = {
    default: {
      value: "text-slate-900",
      label: "text-slate-600",
      description: "text-slate-400",
      icon: "bg-[#0066cc]/10 text-[#0066cc]",
    },
    dark: {
      value: "text-white",
      label: "text-slate-300",
      description: "text-slate-500",
      icon: "bg-white/10 text-white",
    },
    gradient: {
      value: "text-white",
      label: "text-white/90",
      description: "text-white/60",
      icon: "bg-white/20 text-white",
    },
  };

  const colors = textClass[variant];

  return (
    <section className={`py-12 ${bgClass[variant]}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex items-center gap-4 group"
            >
              <div
                className={`w-14 h-14 rounded-xl ${colors.icon} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}
              >
                {stat.icon}
              </div>
              <div>
                <div className={`text-3xl font-extrabold ${colors.value}`}>
                  {stat.value}
                </div>
                <div className={`font-semibold ${colors.label}`}>
                  {stat.label}
                </div>
                <div className={`text-xs ${colors.description}`}>
                  {stat.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
