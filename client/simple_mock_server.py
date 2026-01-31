"""
Simple Mock API Server for AI ROI Calculator
Minimal dependencies version
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import logging

# Suppress default HTTP logging
logging.getLogger('http.server').setLevel(logging.WARNING)


class MockAPIHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Suppress default request logging
        pass

    def _set_headers(self, status_code=200):
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers()

    def do_GET(self):
        if self.path == '/api/health':
            self._set_headers()
            response = {'status': 'healthy'}
            self.wfile.write(json.dumps(response).encode())
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({'error': 'Not found'}).encode())

    def do_POST(self):
        if self.path == '/api/calculate':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                if content_length == 0:
                    self._set_headers(400)
                    self.wfile.write(json.dumps({'error': 'Missing Content-Length'}).encode())
                    return

                post_data = self.rfile.read(content_length)
                input_data = json.loads(post_data.decode())

                # ROI 계산
                result = calculate_roi(input_data)

                self._set_headers()
                self.wfile.write(json.dumps(result).encode())
            except json.JSONDecodeError as e:
                self._set_headers(400)
                self.wfile.write(json.dumps({'error': f'Invalid JSON: {str(e)}'}).encode())
            except Exception as e:
                self._set_headers(500)
                self.wfile.write(json.dumps({'error': f'Server error: {str(e)}'}).encode())
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({'error': 'Not found'}).encode())


def calculate_roi(data):
    """
    5-year ROI calculation aligned to MySmartTeach_AI_ROI_Model(in).csv
    """

    YEARS = 5

    # ==================================================
    # USER INPUTS (from spreadsheet)
    # ==================================================
    teachers = data.get("teachers", 60)

    avg_salary = data.get("avg_teacher_salary", 48892)
    on_cost_pct = data.get("employer_on_cost_pct", 0.30)

    weekly_hours = data.get("weekly_working_hours", 54)
    teaching_weeks = data.get("teaching_weeks_per_year", 39)

    # Explicit adoption by year (spreadsheet)
    adoption_by_year = data.get("adoption_by_year", {
        1: 0.40,
        2: 0.50,
        3: 0.60,
        4: 0.75,
        5: 0.85
    })

    # ==================================================
    # DERIVED PAY RATES
    # ==================================================
    fully_loaded_salary = avg_salary * (1 + on_cost_pct)

    annual_hours = weekly_hours * teaching_weeks
    hourly_rate = fully_loaded_salary / annual_hours
    daily_rate = hourly_rate * (weekly_hours / 5)

    # ==================================================
    # ABSENCE & SUPPLY COVER
    # ==================================================
    absence_days = data.get("absence_days_per_teacher", 8)
    supply_cover_pct = data.get("supply_cover_pct", 1.0)  # 100%
    supply_day_rate = data.get("supply_day_rate", 180)
    absence_reduction_pct = data.get("absence_reduction_pct", 0.10)

    total_supply_days = teachers * absence_days * supply_cover_pct
    baseline_supply_cost = total_supply_days * supply_day_rate

    # ==================================================
    # RETENTION / ATTRITION
    # ==================================================
    attrition_rate = data.get("attrition_rate", 0.088)
    retention_improvement = data.get("retention_improvement", 0.05)
    replacement_cost = data.get("replacement_cost", 20000)
    retention_lag = data.get("lag_retention_benefits", 1)  # 0 or 1

    # ==================================================
    # PRICING
    # ==================================================
    pricing_mode = data.get("pricing_mode", "Per Teacher")

    ai_cost_per_teacher = data.get("ai_cost_per_teacher", 100)
    ai_cost_per_school = data.get("ai_cost_per_school", 10000)
    scale_school_cost = data.get("scale_school_cost", 0)

    training_cost = data.get("training_cost", 2000)
    setup_cost = data.get("setup_cost", 1000)

    # PRODUCTIVITY ASSUMPTIONS
    effective_time_saved_rate = data.get("effective_time_saved_rate", 0.05) 
    hours_saved_per_week = data.get("hours_saved_per_week", 1)
    
    # YEAR-BY-YEAR CALCULATION
    # ==================================================
    annual_results = []
    total_benefits = 0.0
    total_costs = 0.0

    cumulative_net_benefit = 0.0
    payback_year = None

    for year in range(1, YEARS + 1):
        adoption = adoption_by_year.get(year, 0)

        # ------------------------------
        # Absence savings
        # ------------------------------
        absence_savings = (
                baseline_supply_cost
                * absence_reduction_pct
        )

        # Retention savings (lag applied)
        # ------------------------------
        if retention_lag == 1 and year == 1:
            retention_savings = 0.0
        else:
            retention_savings = teachers * attrition_rate * retention_improvement * replacement_cost
        
        # Productivity value
        hours_saved = effective_time_saved_rate * hours_saved_per_week * teaching_weeks * adoption
        productivity_value = hours_saved * hourly_rate * teachers

        # Total benefits = absence + retention + productivity
        year_benefits = absence_savings + retention_savings + productivity_value
        
        # Costs
        if pricing_mode == "Per Teacher":
            ai_subscription = adoption * ai_cost_per_teacher
        else:
            base_cost = (
                ai_cost_per_school * adoption
                if scale_school_cost
                else ai_cost_per_school
            )
            ai_subscription = base_cost

        year_costs = ai_subscription

        if year == 1:
            one_off_cost = (training_cost + setup_cost) * teachers
            year_costs += one_off_cost

        # ------------------------------
        # Net & cumulative
        # ------------------------------
        net_benefit = year_benefits - year_costs
        cumulative_net_benefit += net_benefit

        if payback_year is None and cumulative_net_benefit >= 0:
            payback_year = year

        annual_results.append({
            "year": year,
            "adoption_rate": round(adoption, 2),
            "absence_savings": round(absence_savings, 2),
            "retention_savings": round(retention_savings, 2),
            "total_benefits": round(year_benefits, 2),
            "total_costs": round(year_costs, 2),
            "net_benefit": round(net_benefit, 2),
            "cumulative_net_benefit": round(cumulative_net_benefit, 2)
        })

        total_benefits += year_benefits
        total_costs += year_costs

    roi_pct = (
        (total_benefits - total_costs) / total_costs * 100
        if total_costs else 0
    )

    # OUTPUT
    return {
        "inputs_used": {
            "teachers": teachers,
            "weekly_hours": weekly_hours,
            "teaching_weeks": teaching_weeks,
            "hourly_rate": round(hourly_rate, 2),
            "daily_rate": round(daily_rate, 2),
            "retention_lag": retention_lag,
            "pricing_mode": pricing_mode
        },
        "summary": {
            "total_benefits": round(total_benefits, 2),
            "total_costs": round(total_costs, 2),
            "net_benefit": round(total_benefits - total_costs, 2),
            "roi_percent": round(roi_pct, 1),
            "payback_year": payback_year  # ✅ 추가
        },
        "annual_breakdown": annual_results
    }


def run_server(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, MockAPIHandler)
    print(f'🚀 Mock API Server running on http://localhost:{port}')
    print(f'📊 Health Check: GET http://localhost:{port}/api/health')
    print(f'🧮 Calculate ROI: POST http://localhost:{port}/api/calculate')
    print('\nPress Ctrl+C to stop the server\n')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\n✅ Server stopped')
        httpd.server_close()


if __name__ == '__main__':
    run_server()
