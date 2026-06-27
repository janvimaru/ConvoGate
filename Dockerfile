FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for mysqlclient
RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev \
    build-essential \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ .

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=7860

# Run Daphne on port 7860 (Hugging Face default)
CMD ["daphne", "backend.asgi:application", "--port", "7860", "--bind", "0.0.0.0"]
