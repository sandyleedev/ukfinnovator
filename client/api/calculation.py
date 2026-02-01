ADOPTION_RATE = {1: 0.4, 2: 0.5, 3: 0.6, 4: 0.75, 5: 0.85}
TOTAL_EFFECTIVE_TIME_SAVED_RATE = 0.063

"""
hourly rate
(Average Salary) * ( 1 + Employer on-cost (NI/pension) % ) / (weekly_working_hours * teaching_weeks_per_year)
"""
def get_hourly_rate(avg_teacher_salary, on_cost, weekly_working_hours, teaching_weeks_per_year):
    return avg_teacher_salary * (1 + on_cost) / (weekly_working_hours * teaching_weeks_per_year)

"""
1. Productivity Value
(Year-by-year hours saved per teacher) * (Number of Teachers) * (Hourly Rate)
"""
def calculate_productivity_benefit(weekly_working_hours, teaching_weeks_per_year, teachers, year, hourly_rate):
    hours_saved = weekly_working_hours * teaching_weeks_per_year * TOTAL_EFFECTIVE_TIME_SAVED_RATE * ADOPTION_RATE[year]
    productivity_benefit = hours_saved * teachers * hourly_rate
    return productivity_benefit

"""
2. Supply (Absence) Savings
(Number of Teachers) * (Average Absence days) * (Cover Required Percentage) * (Supply Teacher Daily Rate) * (Absence reduction scenario)
"""
def calculate_supply_benefit(teachers, absence_days_per_teacher, supply_day_rate, absence_reduction_pct):
    return teachers * absence_days_per_teacher * 1.00 * supply_day_rate * absence_reduction_pct

"""
3. Retention Benefits
(Annual attrition rate) * (Retention Improvement) * (Replacement Cost) * (Number of Teachers)
"""
def calculate_retention_benefit(year, attrition_rate, retention_improvement, replacement_cost, teachers):
    # 1 year lag applied
    if year == 1:
        return 0
    return attrition_rate * retention_improvement * replacement_cost * teachers

"""
Cost
- 1st year : ( ai_cost_per_teacher + training_cost + setup_cost ) * (Number of Teachers)
- ai_cost_per_teacher * (Number of Teachers)
"""
def get_year_costs(year, teachers, ai_cost_per_teacher, training_cost, setup_cost):
    if year == 1:
        return (ai_cost_per_teacher + training_cost + setup_cost) * teachers
    return ai_cost_per_teacher * teachers

def calculate_roi(data):
    print(f"data: {data}")
    YEARS = 5
    DISCOUNT_RATE = 0.035

    teachers = data.get("teachers", 60)
    weekly_working_hours = data.get("weekly_working_hours", 54)
    teaching_weeks_per_year = data.get("teaching_weeks_per_year", 39)
    average_salary = data.get("avg_teacher_salary", 48892)
    hourly_rate = get_hourly_rate(average_salary, 0.3, weekly_working_hours, teaching_weeks_per_year)

    # supply teacher benefit
    absence_days_per_teacher = data.get("absence_days_per_teacher", 8)
    supply_day_rate = data.get("supply_day_rate", 180)
    absence_reduction_pct = data.get("absence_reduction_pct", 0.1)

    # retention benefit
    attrition_rate = data.get("attrition_rate", 0.088)
    retention_improvement = data.get("retention_improvement", 0.05)
    replacement_cost = data.get("replacement_cost", 20000)

    # AI cost
    ai_cost_per_teacher = data.get("ai_cost_per_teacher", 100)
    training_cost = data.get("training_cost", 2000)
    setup_cost = data.get("setup_cost", 1000)

    annual_results = []
    total_savings_sum = total_costs_sum = total_npv = cumulative_net_benefit = 0
    payback_year = None

    for year in range(1, YEARS + 1):
        productivity = calculate_productivity_benefit(weekly_working_hours, teaching_weeks_per_year, teachers, year, hourly_rate)
        supply = calculate_supply_benefit(teachers, absence_days_per_teacher, supply_day_rate, absence_reduction_pct)
        retention = calculate_retention_benefit(year, attrition_rate, retention_improvement, replacement_cost, teachers)

        year_savings = productivity + supply + retention
        year_costs = get_year_costs(year, teachers, ai_cost_per_teacher, training_cost, setup_cost)

        net_benefit = year_savings - year_costs
        cumulative_net_benefit += net_benefit

        disc_factor = 1 / ((1 + DISCOUNT_RATE) ** year)
        npv = net_benefit * disc_factor
        total_npv += npv

        if payback_year is None and cumulative_net_benefit >= 0:
            payback_year = year

        annual_results.append({
            "year": year,
            "net_benefit": round(net_benefit),
            "npv": round(npv),
            "productivity_savings": round(productivity),
            "supply_savings": round(supply),
            "retention_savings": round(retention),
            "year_savings": year_savings,
            "year_costs": year_costs,
            "adoption_rate": ADOPTION_RATE[year]
        })

        total_savings_sum += year_savings
        total_costs_sum += year_costs

    roi_percent = ((total_savings_sum - total_costs_sum) / total_costs_sum) * 100

    return {
        "summary": {
            "roi_percent": round(roi_percent, 1),
            "npv_total": round(total_npv),
            "payback_year": payback_year
        },
        "annual_breakdown": annual_results,
    }