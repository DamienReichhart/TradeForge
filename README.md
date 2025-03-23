# TradeForge Trading Bot System

TradeForge is a comprehensive trading bot platform that enables users to create, configure, and monitor automated trading strategies.

## Features

- **One thread per user per bot**: Each bot runs in its own thread, ensuring isolation and stability
- **Control over bot configuration, shutdown, and reboot**: Full control over the bot lifecycle
- **Direct connection to market data**: Uses InfluxDB for market data storage and retrieval
- **Support for multiple bot types**:
  - **Standard Bots**: Opens a trade when conditions are met, closes when conditions change
  - **Advanced Bots**: Opens a trade with TP/SL levels calculated from conditions
- **Telegram integration**: Sends trade signals to users via Telegram

## Bot Types

### Standard Bots
- Open a buy trade when the buy condition is true, only one buy order at a time
- Open a sell trade when the sell condition is true, only one sell order at a time
- Close trades when the respective condition becomes false

Message format:
```
BUY {pair_name} NOW
```
or
```
SELL {pair_name} NOW
```

For closing:
```
CLOSE {pair_name} NOW
```

### Advanced Bots
- Open a buy order when the buy condition is true, only one open trade at a time
- Open a sell order when the sell condition is true, only one open trade at a time
- Calculate TP and SL based on parameters
- Trades are closed when TP/SL is hit (no need to close if the condition changes)

Message format:
```
BUY {pair_name} NOW
ENTRY: {trade_entry}
TP: {tp}
SL: {sl}
```
or
```
SELL {pair_name} NOW
ENTRY: {trade_entry}
TP: {tp}
SL: {sl}
```

## API Endpoints

### Bot Management
- `GET /api/v1/bots`: Get all user's bots
- `POST /api/v1/bots`: Create a new bot
- `GET /api/v1/bots/{bot_id}`: Get a specific bot
- `POST /api/v1/bots/{bot_id}/update`: Update a bot
- `POST /api/v1/bots/{bot_id}/delete`: Delete a bot
- `POST /api/v1/bots/{bot_id}/start`: Start a bot
- `POST /api/v1/bots/{bot_id}/stop`: Stop a bot
- `POST /api/v1/bots/{bot_id}/restart`: Restart a bot
- `POST /api/v1/bots/{bot_id}/update_config`: Update a bot's configuration
- `GET /api/v1/bots/status`: Get the status of all bots
- `GET /api/v1/bots/performance`: Get global performance statistics
- `GET /api/v1/bots/{bot_id}/performance`: Get bot performance statistics

## Architecture

- **Bot Controller**: Manages all bot instances, one thread per user per bot
- **Trading Bot**: Implements the trading logic for a specific bot
- **Telegram Integration**: Sends trade signals to users via Telegram
- **Market Data**: Direct connection to InfluxDB for market data

## Safety Features

- Bots are stopped cleanly on system shutdown
- All open trades are closed when a bot is stopped or restarted
- Proper error handling and logging

## Usage

1. Create a bot with your desired configuration
2. Start the bot
3. Monitor the bot's performance and trades
4. Update the bot's configuration or stop it as needed

## Configuration

The bot system uses the following configuration options:
- InfluxDB connection for market data
- Telegram bot token for notifications
- PostgreSQL database for bot configuration and trade storage

# TradeForge

<div align="center">
  <img src="./logo/original.png" alt="TradeForge Logo" width="300"/>
  <p><strong>Advanced Trading Platform by ApexTradeLogic</strong></p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)
  [![Built with FastAPI](https://img.shields.io/badge/Built%20with-FastAPI-009688)](https://fastapi.tiangolo.com/)
  [![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB)](https://reactjs.org/)
  [![Powered by MetaTrader 5](https://img.shields.io/badge/Powered%20by-MetaTrader%205-8A2BE2)](https://www.metatrader5.com/)
</div>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#features">Features</a> •
  <a href="#system-architecture">Architecture</a> •
  <a href="#prerequisites">Prerequisites</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#usage">Usage</a> •
  <a href="#development">Development</a> •
  <a href="#security">Security</a> •
  <a href="#performance">Performance</a> •
  <a href="#roadmap">Roadmap</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a> •
  <a href="#support">Support</a>
</p>

---

## Overview

TradeForge is an enterprise-grade trading platform designed to provide professional traders with real-time market data, advanced analytics, and automated trading capabilities. Built on a microservices architecture, TradeForge combines the power of MetaTrader 5 with modern web technologies to deliver a seamless trading experience.

Designed for both individual traders and financial institutions, TradeForge enables sophisticated market analysis, strategy development, and automated execution with institutional-grade reliability and security.

<details>
<summary><strong>Why TradeForge?</strong></summary>

- **Unified Platform**: Combines market data access, strategy development, and execution in one platform
- **Institutional-Grade Infrastructure**: Built on reliable, scalable technologies used by financial institutions
- **Extensible Architecture**: Easily integrate with custom modules or third-party services
- **Open Development**: Transparent, customizable codebase that adapts to your specific trading requirements
- **Modern Tech Stack**: Utilizes the latest technologies for performance and reliability

</details>

## Features

- **Real-time Market Data**
  - Access live forex and financial market data through MetaTrader 5 integration
  - Time-series database for historical analysis and backtesting
  - Multi-timeframe support from tick data to daily charts

- **Advanced Analytics**
  - Comprehensive charting with customizable indicators and overlays
  - Technical analysis tools with pattern recognition
  - Market sentiment analysis and correlation metrics

- **Automated Trading**
  - Implement and deploy trading strategies with minimal latency
  - Strategy backtesting and optimization engine
  - Risk management and position sizing controls

- **Performance Monitoring**
  - Track system health and strategy performance via Grafana dashboards
  - Real-time profit/loss tracking and portfolio analysis
  - Custom alerts and notifications for critical events

- **Enterprise-Grade Infrastructure**
  - End-to-end encryption with NGINX reverse proxy and SSL
  - High-availability configuration with failover capabilities
  - Comprehensive logging and audit trails

- **Cloud-Ready Deployment**
  - Containerized with Docker for consistent deployment
  - Compatible with major cloud providers (AWS, Azure, GCP)
  - Horizontal scaling capabilities for increased load

## System Architecture

TradeForge implements a modern microservices architecture designed for reliability, scalability, and maintainability.

<div align="center">
  <img src="./logo/trans_bg.png" alt="TradeForge Architecture Diagram" width="800"/>
</div>

### Core Components

- **Frontend Layer**
  - **Frontend**: React/TypeScript progressive web application
  - **UI Components**: Modular design with reusable trading-specific components
  - **State Management**: Redux with middleware for real-time data handling

- **API Layer**
  - **Backend API**: FastAPI-based Python service for business logic
  - **Rates API**: High-performance service optimized for market data processing
  - **WebSocket Server**: Real-time data streaming to clients

- **Integration Layer**
  - **MT5 Integration**: MetaTrader 5 running in a Linux container
  - **Rates API Inserter**: Bridge between MT5 and internal data systems
  - **External Data Connectors**: Optional integrations with additional data sources

- **Data Layer**
  - **PostgreSQL**: Persistent storage for user profiles, configurations, and business data
  - **InfluxDB**: Time-series database optimized for market data storage
  - **Redis Cache**: High-speed in-memory data store for performance-critical operations

- **Infrastructure Layer**
  - **Prometheus**: Metrics collection and alerting
  - **Grafana**: Visualization dashboards for system and trading performance
  - **NGINX**: Reverse proxy, load balancing, and SSL termination
  - **Cloudflare**: Edge security, CDN, and DDoS protection

### Network Architecture

The internal network is segmented to enhance security and performance:

```
TradeForge Network (10.10.0.0/24)
├── Database Segment (10.10.0.2-10)
│   ├── PostgreSQL (10.10.0.2)
│   └── InfluxDB (10.10.0.6)
├── Application Segment (10.10.0.11-50)
│   ├── Backend (10.10.0.3)
│   ├── Frontend (10.10.0.4)
│   ├── Rates API (10.10.0.7)
│   └── MT5 Linux (10.10.0.11)
├── Monitoring Segment (10.10.0.51-99)
│   ├── Prometheus (10.10.0.8)
│   └── Grafana (10.10.0.9)
└── External Access (10.10.0.100-254)
    ├── NGINX (10.10.0.5)
    └── Cloudflared (10.10.0.100)
```

## Prerequisites

Before deploying TradeForge, ensure your environment meets the following requirements:

### System Requirements

- **Hardware**:
  - CPU: 4+ cores recommended (2 cores minimum)
  - RAM: 8GB minimum (16GB recommended for production)
  - Storage: 50GB SSD storage (100GB+ recommended for production)
  - Network: Stable internet connection with low latency

- **Software**:
  - Docker Engine 20.10.x or higher
  - Docker Compose 2.0.x or higher (supporting Compose file format 3.8)
  - Git client

- **Operating System**:
  - Linux (Ubuntu 20.04/22.04 LTS recommended)
  - macOS 11+ (Big Sur or newer)
  - Windows 10/11 with WSL2

- **Network**:
  - Open outbound connections to MT5 servers
  - Ports 80, 443, 3000 available for web interfaces
  - No conflicts on the 10.10.0.0/24 subnet

### Skills Required

- Basic understanding of Docker and containerization
- Familiarity with command-line interfaces
- Basic knowledge of trading platforms and financial markets

## Deployment

TradeForge offers flexible deployment options for both development and production environments.

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/apextradelogic/tradeforge.git
   cd tradeforge
   ```

2. **Set up environment variables**:
   ```bash
   # Copy example env files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   cp env/db_rates.env.example env/db_rates.env
   cp env/grafana.env.example env/grafana.env
   cp rates_api_inserter/.env.example rates_api_inserter/.env
   
   # Edit the .env files with your configuration
   # At minimum, you should update the following:
   # - Database credentials
   # - API keys
   # - JWT secrets
   ```

3. **Generate SSL certificates for NGINX**:
   ```bash
   cd nginx
   ./generate-certs.bat  # On Windows
   # OR
   ./generate-certs.sh   # On Linux/macOS
   cd ..
   ```

4. **Start the application stack**:
   ```bash
   # Start all services
   docker-compose up -d
   
   # Verify all services are running
   docker-compose ps
   ```

5. **Access TradeForge**:
   - Web Interface: https://localhost
   - Grafana Dashboard: http://localhost:3000 (default credentials: admin/admin)
   - Backend API Docs: https://localhost/api/docs
   - Rates API Docs: https://localhost/rates/docs

### Production Deployment

For production environments, follow these additional steps:

1. **Set up proper SSL certificates**:
   ```bash
   # Replace self-signed certificates with proper ones
   cp your-ssl-cert.pem nginx/certs/server.crt
   cp your-ssl-key.pem nginx/certs/server.key
   ```

2. **Configure stronger security**:
   - Use long, complex passwords for all database services
   - Implement IP-based access restrictions in your network
   - Enable two-factor authentication for admin accounts

3. **Set up data persistence**:
   - Configure external volume mounts for databases
   - Implement automated backup procedures
   ```bash
   # Example backup script for PostgreSQL
   docker-compose exec postgres pg_dump -U postgres -d tradeforge > backup_$(date +%Y%m%d).sql
   ```

4. **Configure monitoring and alerting**:
   - Set up Grafana alert channels (email, Slack, PagerDuty)
   - Configure critical system alerts for database, API, and trading engine status

5. **Enable log rotation**:
   - Configure proper log rotation for container logs
   ```bash
   # Example log rotation configuration
   docker-compose logs --tail=1000 -f > rotating_logs.log
   ```

### Cloud Deployment

TradeForge is compatible with major cloud providers. For cloud deployment:

1. Set up a VM with sufficient resources (e.g., AWS EC2 m5.large or equivalent)
2. Install Docker and Docker Compose
3. Follow the standard deployment procedure above
4. Configure cloud-provider security groups to restrict access
5. Set up cloud-native monitoring solutions where appropriate

<details>
<summary><strong>Kubernetes Deployment (Advanced)</strong></summary>

For large-scale deployments, Kubernetes manifests are available in the `k8s/` directory. Basic deployment steps:

```bash
# Apply Kubernetes configurations
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/configmaps.yaml
kubectl apply -f k8s/storage.yaml
kubectl apply -f k8s/deployments.yaml
kubectl apply -f k8s/services.yaml
kubectl apply -f k8s/ingress.yaml

# Verify deployment
kubectl get pods -n tradeforge
```
</details>

## Usage

### Getting Started

1. **Initial Setup**:
   - Log in to the TradeForge web interface using default admin credentials
   - Change the default password immediately
   - Configure MT5 connection settings in the admin panel

2. **User Management**:
   - Create user accounts with appropriate permission levels
   - Set up team structures for collaborative trading
   - Configure API access tokens for programmatic access

### Data Management

<div align="center">
  <img src="./logo/black_on_white.png" alt="TradeForge Data Dashboard" width="800"/>
</div>

1. **Market Data**:
   - Data is automatically fetched from MetaTrader 5 and stored in InfluxDB
   - Configure instruments of interest in the settings panel
   - Set data retention policies based on your needs
   - Export data in various formats (CSV, JSON) for external analysis

2. **Historical Data**:
   - Access historical data through the web interface or API
   - Import external historical data through the upload interface
   - Run data quality checks to ensure integrity

### Trading Operations

1. **Strategy Development**:
   - Use the strategy builder to create algorithmic trading strategies
   - Implement custom strategies using Python or MQL5
   - Connect via the REST API for integration with external systems

2. **Trading Execution**:
   - Deploy strategies to live trading environment
   - Monitor open positions and orders in real-time
   - Set risk management parameters to control exposure

3. **Risk Management**:
   - Configure account-wide risk limits
   - Set per-strategy risk controls
   - Implement emergency stop procedures

### Performance Analysis

Monitor system and trading performance through comprehensive dashboards:

1. **System Metrics Dashboard**:
   - Container performance and resource utilization
   - Database performance and query statistics
   - API response times and error rates

2. **Trading Performance Dashboard**:
   - Strategy performance metrics (PnL, win rate, drawdown)
   - Instrument performance comparison
   - Portfolio allocation and exposure analysis

3. **Market Data Quality Dashboard**:
   - Data integrity and completeness checks
   - Price anomaly detection
   - Latency monitoring

## Development

TradeForge is designed to be extensible and customizable. This section outlines how to set up a development environment and extend the platform.

### Local Development Environment

1. **Prerequisites**:
   - Node.js 18+ for frontend development
   - Python 3.10+ for backend development
   - Docker and Docker Compose for local services

2. **Frontend Development**:
   ```bash
   cd frontend
   npm install
   npm run dev
   
   # Run tests
   npm test
   
   # Lint code
   npm run lint
   ```

3. **Backend Development**:
   ```bash
   cd backend
   pip install -r requirements.txt
   python main.py
   
   # Run tests
   pytest
   
   # Check code style
   flake8
   ```

### API Documentation

Comprehensive API documentation is available at:

- **Backend API**: https://localhost/api/docs
  - User management endpoints
  - Trading operation endpoints
  - System configuration endpoints

- **Rates API**: https://localhost/rates/docs
  - Market data retrieval endpoints
  - Historical data analysis endpoints
  - Data management endpoints

### Extension Points

TradeForge provides several extension points for customization:

1. **Custom Indicators**:
   - Implement new technical indicators in the `indicators` module
   - Register indicators for use in the strategy builder

2. **Data Connectors**:
   - Add new data sources in the `connectors` module
   - Implement the standardized connector interface

3. **Strategy Templates**:
   - Create reusable strategy templates in the `strategies` module
   - Share templates with the community

## Security

TradeForge implements multiple layers of security to protect user data and trading operations.

### Authentication and Authorization

- JWT-based authentication with refresh token rotation
- Role-based access control (RBAC) for granular permissions
- IP-based access restrictions for sensitive operations
- Optional two-factor authentication (2FA)

### Data Protection

- All data encrypted at rest and in transit
- Database access restricted to internal network
- Sensitive configuration stored in secure environment variables
- Regular automated security scanning

### Network Security

- NGINX reverse proxy with SSL termination
- Internal network segmentation
- WAF (Web Application Firewall) rules
- Rate limiting to prevent abuse

### Security Recommendations

- Rotate all credentials regularly
- Enable 2FA for all admin accounts
- Implement IP allowlisting for administrative access
- Keep all containers updated with security patches

## Performance

TradeForge is designed for high-performance trading operations with minimal latency.

### Benchmarks

| Operation                  | Average Latency | 99th Percentile |
|----------------------------|-----------------|-----------------|
| Market data retrieval      | 5-10ms          | 25ms            |
| Strategy signal generation | 15-30ms         | 50ms            |
| Order execution            | 20-40ms         | 75ms            |
| Dashboard rendering        | 200-300ms       | 500ms           |

### Optimization Tips

- Enable Redis caching for frequently accessed data
- Increase container resources for high-frequency trading
- Use dedicated hardware for production deployments
- Optimize database indices for specific query patterns

## Roadmap

TradeForge is under active development. Here's what's coming next:

### Short-term (Q2 2023)

- Mobile-responsive UI for trading on the go
- Enhanced backtesting engine with Monte Carlo simulation
- Integration with additional data providers
- Advanced portfolio optimization tools

### Mid-term (Q3-Q4 2023)

- Machine learning framework for strategy development
- Social trading features for strategy sharing
- Multi-account management capabilities
- Enhanced risk management suite

### Long-term (2024+)

- Institutional-grade reporting and compliance tools
- Integration with blockchain for settlement
- Advanced options trading capabilities
- Global market coverage expansion

## Troubleshooting

### Common Issues

1. **Container startup failures**:
   - Check logs: `docker-compose logs -f [service_name]`
   - Verify environment variables in .env files
   - Ensure all required ports are available

2. **Database connection issues**:
   - Ensure PostgreSQL and InfluxDB are healthy
   - Check network connectivity between services
   - Verify credentials in environment files

3. **Market data not appearing**:
   - Verify MT5 container is running: `docker-compose logs -f mt5linux`
   - Check rates_api_inserter logs: `docker-compose logs -f rates_api_inserter`
   - Confirm MT5 is properly configured and connected to brokers

4. **Performance degradation**:
   - Check resource utilization with `docker stats`
   - Look for memory leaks or CPU spikes
   - Verify database query performance with explain plans

### Support Resources

- **Logs**: Most issues can be diagnosed from container logs
  ```bash
  # View all logs
  docker-compose logs
  
  # Follow specific service logs
  docker-compose logs -f service_name
  ```

- **Health Checks**: Verify service health
  ```bash
  # Check service status
  docker-compose ps
  
  # Check service health
  curl http://localhost/health
  ```

## Contributing

We welcome contributions to TradeForge! Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to get involved.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- Backend (Python): PEP 8 style guide, pytest for testing
- Frontend (TypeScript): ESLint, Prettier, Jest for testing
- Documentation: Clear, concise, and comprehensive

## License

TradeForge is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## About ApexTradeLogic

<div align="center">
  <img src="./logo/white_on_black.png" alt="ApexTradeLogic Logo" width="150"/>
</div>

ApexTradeLogic is a fintech company specializing in algorithmic trading systems and market data infrastructure. With expertise spanning financial markets, software development, and quantitative analysis, we build technologies that empower traders and financial institutions.

### Our Team

Our team consists of experienced traders, quantitative analysts, and software engineers with backgrounds from leading financial institutions and technology companies.

## Support

For commercial support and custom development, contact ApexTradeLogic:

- **Website**: [apextradelogic.com](https://apextradelogic.com)
- **Email**: support@apextradelogic.com
- **Documentation**: [docs.apextradelogic.com](https://docs.apextradelogic.com)
- **GitHub**: [github.com/apextradelogic](https://github.com/apextradelogic)

### Enterprise Support

Enterprise support plans are available with:

- Priority issue resolution
- Custom feature development
- On-site deployment assistance
- Training and workshops
- 24/7 emergency support

---

<div align="center">
  <p>© 2023 ApexTradeLogic. All Rights Reserved.</p>
</div> 