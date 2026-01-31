from http.server import HTTPServer, BaseHTTPRequestHandler
import json
from calculation import calculate_roi

class MockAPIHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status_code=200):
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers()

    def do_POST(self):
        if self.path == '/api/calculate':
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                post_data = self.rfile.read(content_length)
                input_data = json.loads(post_data.decode())

                result = calculate_roi(input_data)

                self._set_headers()
                self.wfile.write(json.dumps(result).encode())
            except Exception as e:
                self._set_headers(500)
                self.wfile.write(json.dumps({'error': str(e)}).encode())
        else:
            self._set_headers(404)

def run_server(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, MockAPIHandler)
    print(f'🚀 ROI Calculator API running on http://localhost:{port}')
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()