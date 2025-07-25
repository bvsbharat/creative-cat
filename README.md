# Snowcone API

A FastAPI application with MCP integration.

## Installation

1. Install dependencies:
```
pip install -r requirements.txt
```

2. Run the application:
```
uvicorn app.main:app --reload
```

## Features

- FastAPI with MCP integration
- Authentication via MCP
- API documentation at `/docs` or `/redoc`

## API Endpoints

- `/`: Root endpoint with welcome message
- `/status`: Returns operational status (requires authentication) 