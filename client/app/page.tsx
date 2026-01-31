"use client";

import { useEffect, useMemo, useState } from "react";
import { TrendingUp, Clock, PoundSterling } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
} from "recharts";
import { API_URL, COLORS } from "@/app/constants";
import ChartCard from "@/app/components/ChartCard";
import MetricCard from "@/app/components/MetricCard";
import { formatCurrency } from "@/app/utils/formatCurrency";
import InputField from "@/app/components/InputField";
import DashboardSection from "@/app/components/DashboardSection";
import Footer from "@/app/components/Footer";
import Loading from "@/app/components/Loading";

export default function Home() {
  const [schoolSize, setSchoolSize] = useState(60);
  const [avgSalary, setAvgSalary] = useState(48892);

  const [avgSickDays, setAvgSickDays] = useState(8);
  const [supplyRate, setSupplyRate] = useState(180);

  const [weeklyHours, setWeeklyHours] = useState(54);
  const [teachingWeeks, setTeachingWeeks] = useState(39);

  const [attritionRate, setAttritionRate] = useState(8.8);
  const [absenceReduction, setAbsenceReduction] = useState(0.1);
  const [retentionImprovement, setRetentionImprovement] = useState(5);
  const [replacementCost, setReplacementCost] = useState(20000);

  const [aiCostPerTeacher, setAiCostPerTeacher] = useState(100);
  const [trainingCost, setTrainingCost] = useState(2000);
  const [setupCost, setSetupCost] = useState(1000);

  const [calculations, setCalculations] = useState<ROICalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateROI = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/calculate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teachers: schoolSize,
          avg_teacher_salary: avgSalary,

          weekly_working_hours: weeklyHours,
          teaching_weeks_per_year: teachingWeeks,

          absence_days_per_teacher: avgSickDays,
          supply_day_rate: supplyRate,
          absence_reduction_pct: absenceReduction,

          attrition_rate: attritionRate / 100,
          retention_improvement: retentionImprovement / 100,
          replacement_cost: replacementCost,

          ai_cost_per_teacher: aiCostPerTeacher,
          training_cost: trainingCost,
          setup_cost: setupCost,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to calculate ROI");
      }

      const data = await response.json();
      console.log(data);
      setCalculations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    if (!calculations?.annual_breakdown) return [];

    let cum = 0;
    return calculations.annual_breakdown.map((r: any) => {
      cum += Number(r.net_benefit ?? 0);
      return {
        ...r,
        year_label: `Year ${r.year}`,
        cumulative_net_benefit: cum,
      };
    });
  }, [calculations]);

  useEffect(() => {
    const t = setTimeout(() => {
      calculateROI();
    }, 300);
    return () => clearTimeout(t);
  }, [
    schoolSize,
    avgSalary,
    attritionRate,
    avgSickDays,
    weeklyHours,
    teachingWeeks,
    absenceReduction,
    retentionImprovement,
    replacementCost,
    aiCostPerTeacher,
    aiCostPerTeacher,
    trainingCost,
    setupCost,
  ]);

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "400px 1fr",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* LEFT PANEL - INPUTS */}
        <div
          style={{
            background: "#f9fafb",
            borderRight: "2px solid #e5e7eb",
            padding: "32px 24px",
            overflowY: "auto",
          }}
        >
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "700",
              marginBottom: "8px",
              color: COLORS.dark,
            }}
          >
            <span style={{ color: COLORS.primary }}>INPUT</span> PANEL
          </h1>

          {/* School Profile */}
          <DashboardSection title="School Profile">
            <InputField
              label="Number of Teachers"
              value={schoolSize}
              onChange={setSchoolSize}
              min={0}
              step={5}
            />
            <InputField
              label="Weekly working hours"
              value={weeklyHours}
              onChange={setWeeklyHours}
              min={0}
              step={0.5}
            />
            <InputField
              label="Teaching weeks"
              value={teachingWeeks}
              onChange={setTeachingWeeks}
              min={0}
              step={1}
            />
            <InputField
              label="Average Teacher Salary (£)"
              value={avgSalary}
              onChange={setAvgSalary}
              min={30000}
              max={90000}
              step={1000}
            />
            <InputField
              label="Annual Attrition Rate (%)"
              value={attritionRate}
              onChange={setAttritionRate}
              min={0}
              max={20}
              step={0.5}
            />
            <InputField
              label="Avg Sick Days per Year"
              value={avgSickDays}
              onChange={setAvgSickDays}
              min={3}
              max={15}
              step={1}
            />
            <InputField
              label="Supply Teacher Daily Cost (£)"
              value={supplyRate}
              onChange={setSupplyRate}
              min={100}
              max={250}
              step={10}
            />
          </DashboardSection>

          {/* AI Tool Assumptions */}
          <DashboardSection title="AI Tool Assumptions">
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: COLORS.dark,
                  marginBottom: "8px",
                }}
              >
                AI subscription (per teacher per year)
              </label>
              <input
                type="range"
                min={50}
                max={150}
                step={50}
                value={aiCostPerTeacher}
                onChange={(e) => setAiCostPerTeacher(Number(e.target.value))}
                style={{ width: "100%" }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "6px",
                  marginBottom: "20px",
                  fontSize: "13px",
                  color: "#374151",
                  fontWeight: "600",
                }}
              >
                <span>£50</span>
                <span>£100</span>
                <span>£150</span>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: COLORS.dark,
                  marginBottom: "12px",
                }}
              >
                Training Cost (One-time, £)
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                {[1000, 2000, 3000].map((cost) => (
                  <button
                    key={cost}
                    onClick={() => setTrainingCost(cost)}
                    style={{
                      flex: 1,
                      padding: "12px 8px",
                      border:
                        trainingCost === cost
                          ? `2px solid ${COLORS.primary}`
                          : "2px solid #e5e7eb",
                      background: trainingCost === cost ? "#ede9fe" : "white",
                      borderRadius: "8px",
                      fontSize: "16px",
                      fontWeight: "700",
                      color:
                        trainingCost === cost ? COLORS.primary : COLORS.dark,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    £ {cost}
                  </button>
                ))}
              </div>
            </div>

            <InputField
              label="Setup Cost (One-time, £)"
              value={setupCost}
              onChange={setSetupCost}
              min={500}
              max={5000}
              step={100}
            />
          </DashboardSection>

          {/* Impact Assumptions */}
          <DashboardSection title="Impact Assumptions">
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: COLORS.dark,
                  marginBottom: "8px",
                }}
              >
                Absence reduction percentage (%)
              </label>
              <input
                type="range"
                min={0.1}
                max={0.3}
                step={0.1}
                value={absenceReduction}
                onChange={(e) => setAbsenceReduction(Number(e.target.value))}
                style={{ width: "100%" }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "6px",
                  marginBottom: "20px",
                  fontSize: "13px",
                  color: "#374151",
                  fontWeight: "600",
                }}
              >
                <span>10%</span>
                <span>20%</span>
                <span>30%</span>
              </div>
            </div>
            <InputField
              label="Retention Improvement (pp)"
              value={retentionImprovement}
              onChange={setRetentionImprovement}
              min={0}
              max={100}
              step={5}
            />
            <InputField
              label="Replacement Cost (£)"
              value={replacementCost}
              onChange={setReplacementCost}
              min={0}
              max={20000}
              step={1000}
            />
          </DashboardSection>

          {/* Calculate Button */}
          <button
            onClick={calculateROI}
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              background: loading ? "#9ca3af" : COLORS.primary,
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "20px",
            }}
          >
            {loading ? "Calculating..." : "Calculate ROI"}
          </button>

          {error && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px",
                background: "#fee2e2",
                border: "1px solid #ef4444",
                borderRadius: "8px",
                color: "#991b1b",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* RIGHT PANEL - CHARTS */}
        <div style={{ padding: "32px", overflowY: "auto" }}>
          {calculations ? (
            <>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  marginBottom: "24px",
                  color: COLORS.dark,
                }}
              >
                KEY METRICS (
                <span style={{ color: COLORS.primary }}>SUMMARY</span> CARDS)
              </h2>

              {/* Summary Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "20px",
                  marginBottom: "40px",
                }}
              >
                <MetricCard
                  label="ROI (%)"
                  value={`${calculations.summary.roi_percent}%`}
                  icon={<TrendingUp size={24} />}
                  color={COLORS.success}
                />
                <MetricCard
                  label="Payback year"
                  value={`${calculations.summary.payback_year} years`}
                  icon={<Clock size={24} />}
                  color={COLORS.primary}
                />
                <MetricCard
                  label="Net Present Value (£)"
                  value={formatCurrency(calculations.summary.npv_total)}
                  icon={<PoundSterling size={24} />}
                  color={COLORS.secondary}
                />
              </div>

              {/* Main Chart */}
              <div
                style={{
                  background: "white",
                  border: "2px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "24px",
                  marginBottom: "32px",
                }}
              >
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    marginBottom: "20px",
                    color: COLORS.dark,
                  }}
                >
                  Cumulative Net Benefit
                </h3>

                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 20, left: 3, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorCumNet"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={COLORS.success}
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor={COLORS.success}
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="year_label"
                      style={{ fontSize: "13px" }}
                      stroke="#6b7280"
                    />
                    <YAxis
                      width={90}
                      style={{ fontSize: "13px" }}
                      stroke="#6b7280"
                      tickFormatter={(v) => formatCurrency(Number(v))}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "white",
                        border: "2px solid " + COLORS.primary,
                        borderRadius: "8px",
                        fontSize: "13px",
                      }}
                      formatter={(v: any, name: any, payload: any) => {
                        const row = payload?.payload;
                        if (!row) return formatCurrency(Number(v));
                        if (name === "cumulative_net_benefit")
                          return formatCurrency(Number(v));
                        return formatCurrency(Number(v));
                      }}
                      labelFormatter={(label) => String(label)}
                    />

                    <Area
                      type="monotone"
                      dataKey="cumulative_net_benefit"
                      stroke={COLORS.success}
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorCumNet)"
                      name="Cumulative Net Benefit"
                    />

                    <ReferenceLine
                      y={0}
                      stroke="#ef4444"
                      strokeDasharray="5 5"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Supporting Charts */}
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  marginBottom: "20px",
                  color: COLORS.dark,
                }}
              >
                SUPPORTING CHARTS
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  marginBottom: "20px",
                }}
              >
                Savings Breakdown / Scenarios
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "24px",
                }}
              >
                {/* Stacked Bar Chart */}
                <ChartCard title="Benefits Breakdown by Year">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={calculations.annual_breakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="year" style={{ fontSize: "12px" }} />
                      <YAxis
                        style={{ fontSize: "12px" }}
                        tickFormatter={(v) => formatCurrency(Number(v))}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "white",
                          border: "2px solid " + COLORS.primary,
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        formatter={(v: any) => formatCurrency(Number(v))}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Bar
                        dataKey="productivity_savings"
                        stackId="a"
                        fill={COLORS.secondary}
                        name="Productivity value"
                      />
                      <Bar
                        dataKey="supply_savings"
                        stackId="a"
                        fill={COLORS.primary}
                        name="Supply savings"
                      />
                      <Bar
                        dataKey="retention_savings"
                        stackId="a"
                        fill={COLORS.success}
                        name="Retention savings"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                {/* Cost vs Benefits */}
                <ChartCard title="Costs vs Benefits Comparison">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={calculations.annual_breakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="year" style={{ fontSize: "12px" }} />
                      <YAxis
                        style={{ fontSize: "12px" }}
                        tickFormatter={(v) => formatCurrency(Number(v))}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "white",
                          border: "2px solid " + COLORS.primary,
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        formatter={(v: any) => formatCurrency(Number(v))}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Bar
                        dataKey="year_costs"
                        fill={COLORS.danger}
                        name="Yearly costs"
                      />
                      <Bar
                        dataKey="year_savings"
                        fill={COLORS.success}
                        name="Yearly benefits"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                {/* Net Benefit Timeline */}
                <ChartCard title="Net Benefit Timeline">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={calculations.annual_breakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="year" style={{ fontSize: "12px" }} />
                      <YAxis
                        style={{ fontSize: "12px" }}
                        tickFormatter={(v) => formatCurrency(Number(v))}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "white",
                          border: "2px solid " + COLORS.primary,
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        formatter={(v: any) => formatCurrency(Number(v))}
                      />
                      <ReferenceLine
                        y={0}
                        stroke="#ef4444"
                        strokeDasharray="5 5"
                      />
                      <Line
                        type="monotone"
                        dataKey="net_benefit"
                        stroke={COLORS.primary}
                        strokeWidth={3}
                        dot={{ fill: COLORS.primary, r: 5 }}
                        name="Net benefit"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>

                {/* Adoption Rate Timeline */}
                <ChartCard title="Adoption Rate Timeline">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={calculations.annual_breakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="year" style={{ fontSize: "12px" }} />
                      <YAxis
                        style={{ fontSize: "12px" }}
                        tickFormatter={(v) => `${Math.round(Number(v) * 100)}%`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "white",
                          border: "2px solid " + COLORS.primary,
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        formatter={(v: any) =>
                          `${(Number(v) * 100).toFixed(0)}%`
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="adoption_rate"
                        stroke={COLORS.secondary}
                        strokeWidth={3}
                        dot={{ fill: COLORS.secondary, r: 5 }}
                        name="Adoption rate"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
              <Footer />
            </>
          ) : (
            <Loading loading={loading} />
          )}
        </div>
      </div>
    </div>
  );
}
