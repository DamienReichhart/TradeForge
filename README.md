# TradeForge

A web application for creating and automating trading bots. TradeForge makes it easy to define, test, and deploy algorithmic trading strategies without writing code.

## Features

- Create trading bots with a user-friendly interface
- Define buy/sell conditions using mathematical expressions
- Configure technical indicators with custom parameters
- Backtest strategies against historical data
- Receive trade notifications via Telegram
- Monitor performance metrics and statistics
- Multiple subscription plans with different features

## Project Structure

The application consists of two main parts:

- **Backend**: FastAPI application that manages bots, performs backtests, and interacts with market data
- **Frontend**: React application that provides the user interface

## Setup Instructions

### Prerequisites

- Python 3.9+ for backend
- Node.js 14+ for frontend
- PostgreSQL database
- Market data API (available at the specified endpoint)

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd tradeforge/backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   ```
   # On Windows
   venv\Scripts\activate
   
   # On Unix or MacOS
   source venv/bin/activate
   ```

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Configure environment variables:
   - Review the `.env` file and update settings if necessary

6. Initialize the database:
   ```
   python -m app.initial_data
   ```

7. Start the backend server:
   ```
   uvicorn main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd tradeforge/frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## Usage

Once both the backend and frontend are running:

1. Access the application at `http://localhost:3000`
2. Register a new account or login with the default admin credentials:
   - Username: `admin`
   - Password: `admin`
3. Navigate to the dashboard to create your first trading bot
4. Configure the indicators and trading parameters
5. Run backtests to validate your strategy
6. Deploy your bot to start trading

## API Documentation

The backend API documentation is available at `http://localhost:8000/api/docs` when the server is running.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Telegram Integration

TradeForge now supports Telegram integration for receiving notifications and alerts about your trading activities. Here's how to set it up:

1. Go to your account Settings page in the dashboard
2. Navigate to the Telegram tab
3. Enter your Telegram username (without the @ symbol)
4. Save your settings
5. Send the `/start` command to the TradeForge bot
6. The bot will confirm that your account is connected

### Running the Migration

To add the Telegram username field to the database, run the following commands:

```bash
# From the project root
cd backend
python -m migrations.add_telegram_username
```

### Telegram Bot Configuration

The Telegram bot uses the token specified in the `.env` file. The current token is:

```
TELEGRAM_BOT_TOKEN=7917273636:AAE7PLpkV52jtvMLCzc84-pKo1q90JrPLpA
```

## Running the Application

To run the application:

```bash
# Start all services using Docker Compose
docker-compose up
```

This will start the backend API, frontend application, and PostgreSQL database. 