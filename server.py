#!/usr/bin/env python3
"""
Simple HTTP server for single-page applications.
Serves index.html for all routes to enable client-side routing.
"""

import http.server
import socketserver
import os
from pathlib import Path

PORT = 8000

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Get the file path
        path = self.translate_path(self.path)

        # If the path is a file that exists, serve it normally
        if os.path.isfile(path):
            return http.server.SimpleHTTPRequestHandler.do_GET(self)

        # For routes like /about, /projects, etc., serve index.html
        # but keep the URL in the browser
        self.path = '/index.html'
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

if __name__ == '__main__':
    with socketserver.TCPServer(("", PORT), SPAHandler) as httpd:
        print(f"Serving at http://localhost:{PORT}")
        print("Press Ctrl+C to stop")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")
