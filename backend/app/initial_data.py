import logging
from sqlalchemy.orm import Session

from app import models
from app.auth.jwt import get_password_hash
from app.core.database import SessionLocal, Base, engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db() -> None:
    """
    Initialize database with sample data.
    """
    db = SessionLocal()
    try:
        # Create tables
        Base.metadata.create_all(bind=engine)
        
        # Check if the database is already initialized
        user = db.query(models.User).first()
        if user:
            logger.info("Database already initialized")
            return
        
        # Create sample data
        create_sample_data(db)
        
        logger.info("Database initialized successfully")
    finally:
        db.close()

def create_sample_data(db: Session) -> None:
    """
    Create sample data for the application.
    """
    # Create admin user
    admin_user = models.User(
        email="admin@tradeforge.com",
        username="admin",
        hashed_password=get_password_hash("admin"),
        first_name="Admin",
        last_name="User",
        is_active=True,
        is_superuser=True,
    )
    db.add(admin_user)
    
    # Create subscription plans
    starter_plan = models.Subscription(
        name="Starter",
        description="Basic plan with 1 bot instance",
        price=15.0,
        bot_limit=1,
        is_active=True,
    )
    db.add(starter_plan)
    
    pro_plan = models.Subscription(
        name="Pro",
        description="Professional plan with 5 bot instances",
        price=30.0,
        bot_limit=5,
        is_active=True,
    )
    db.add(pro_plan)
    
    expert_plan = models.Subscription(
        name="Expert",
        description="Expert plan with 10 bot instances",
        price=100.0,
        bot_limit=10,
        is_active=True,
    )
    db.add(expert_plan)
    
    # Create sample indicators
    indicators = [
        models.Indicator(
            name="SMA",
            description="Simple Moving Average",
            parameters={"period": 14},
            is_active=True,
        ),
        models.Indicator(
            name="EMA",
            description="Exponential Moving Average",
            parameters={"period": 14},
            is_active=True,
        ),
        models.Indicator(
            name="RSI",
            description="Relative Strength Index",
            parameters={"period": 14},
            is_active=True,
        ),
        models.Indicator(
            name="MACD",
            description="Moving Average Convergence Divergence",
            parameters={
                "fast_period": 12,
                "slow_period": 26,
                "signal_period": 9
            },
            is_active=True,
        ),
        models.Indicator(
            name="Bollinger Bands",
            description="Bollinger Bands",
            parameters={
                "period": 20,
                "std_dev": 2
            },
            is_active=True,
        ),
        models.Indicator(
            name="Stochastic",
            description="Stochastic Oscillator",
            parameters={
                "k_period": 14,
                "d_period": 3
            },
            is_active=True,
        ),
        models.Indicator(
            name="ATR",
            description="Average True Range",
            parameters={"period": 14},
            is_active=True,
        ),
        models.Indicator(
            name="OBV",
            description="On-Balance Volume",
            parameters={},
            is_active=True,
        ),
        models.Indicator(
            name="ADX",
            description="Average Directional Index",
            parameters={"period": 14},
            is_active=True,
        ),
    ]
    
    for indicator in indicators:
        db.add(indicator)
    
    # Create sample tutorials
    tutorials = [
        models.Tutorial(
            title="Getting Started with TradeForge",
            slug="getting-started",
            summary="Learn how to set up your first trading bot with TradeForge",
            content="""
# Getting Started with TradeForge

Welcome to TradeForge, the powerful platform for creating and automating trading bots. This tutorial will guide you through the process of setting up your first trading bot.

## Step 1: Create an Account

After registering and logging in, you'll have access to the dashboard where you can manage your bots.

## Step 2: Choose a Trading Pair

Select a cryptocurrency pair that you want to trade. For beginners, we recommend starting with major pairs like BTC/USD or ETH/USD.

## Step 3: Select a Timeframe

Choose the timeframe for your bot. This could be minutes, hours, or days depending on your trading strategy.

## Step 4: Configure Indicators

Add technical indicators to your bot. For example, you might want to use a Simple Moving Average (SMA) or Relative Strength Index (RSI).

## Step 5: Define Buy and Sell Conditions

Create mathematical expressions that define when your bot should buy or sell. For example:
- Buy when: `RSI_14 < 30 and close > SMA_50`
- Sell when: `RSI_14 > 70 or close < SMA_50`

## Step 6: Start Your Bot

Once your configuration is complete, start your bot and monitor its performance from the dashboard.

Good luck with your trading!
            """,
            is_published=True,
        ),
        models.Tutorial(
            title="Understanding Technical Indicators",
            slug="technical-indicators",
            summary="Learn about the technical indicators available in TradeForge",
            content="""
# Understanding Technical Indicators

Technical indicators are mathematical calculations based on price, volume, or open interest of a security or contract. This tutorial explains the most common indicators available in TradeForge.

## Moving Averages

### Simple Moving Average (SMA)
SMA calculates the average price over a specific period. It's useful for identifying the direction of the trend.

### Exponential Moving Average (EMA)
Similar to SMA, but gives more weight to recent prices, making it more responsive to new information.

## Oscillators

### Relative Strength Index (RSI)
RSI measures the speed and change of price movements on a scale from 0 to 100. Values below 30 generally indicate oversold conditions, while values above 70 indicate overbought conditions.

### Moving Average Convergence Divergence (MACD)
MACD shows the relationship between two moving averages of a security's price, helping to identify trend direction and momentum.

## Volatility Indicators

### Bollinger Bands
Consists of a middle band (SMA) with upper and lower bands that are standard deviations away from the middle band. They help identify volatility and potential overbought/oversold conditions.

### Average True Range (ATR)
Measures market volatility by decomposing the entire range of an asset price for the period.

## Volume Indicators

### On-Balance Volume (OBV)
Uses volume flow to predict changes in stock price. It adds volume on up days and subtracts volume on down days.

## Creating Effective Trading Strategies

Combining multiple indicators can create powerful trading strategies. For example, you might use RSI to identify overbought/oversold conditions and confirm with a moving average crossover.
            """,
            is_published=True,
        ),
        models.Tutorial(
            title="Backtesting Strategies",
            slug="backtesting",
            summary="Learn how to backtest your trading strategies with TradeForge",
            content="""
# Backtesting Strategies

Backtesting is the process of testing a trading strategy on historical data to assess its viability. This tutorial will show you how to perform backtests with TradeForge.

## Why Backtest?

Backtesting allows you to:
- Evaluate the performance of a strategy without risking real money
- Refine your trading rules based on historical performance
- Gain confidence in your strategy before live trading

## Setting Up a Backtest

1. Navigate to your bot's detail page
2. Click on the "Backtest" button
3. Choose a date range for the backtest
4. Click "Run Backtest"

## Interpreting Results

After the backtest completes, you'll see a report that includes:

### Performance Metrics
- Win Rate: Percentage of profitable trades
- Profit Factor: Ratio of gross profits to gross losses
- Maximum Drawdown: Largest percentage drop from peak to trough
- Sharpe Ratio: Risk-adjusted return measure

### Visual Analysis
- Equity Curve: Shows how your portfolio value changes over time
- Trade Distribution: Shows the frequency and profitability of trades

## Optimizing Your Strategy

Use the backtest results to identify areas for improvement:

1. If win rate is low, adjust your entry conditions
2. If average profit is small, adjust your exit conditions
3. If drawdowns are large, consider adding stop-loss rules

Remember that past performance doesn't guarantee future results, but backtesting is still an essential tool for strategy development.
            """,
            is_published=True,
        ),
    ]
    
    for tutorial in tutorials:
        db.add(tutorial)
    
    # Create sample opinions
    opinions = [
        models.Opinion(
            name="John Smith",
            company="JL Trading",
            position="Professional Trader",
            content="TradeForge has completely transformed how I approach trading. The ability to automate my strategies and backtest them has saved me countless hours and improved my results dramatically. Highly recommended!",
            rating=5,
            is_published=True,
        ),
        models.Opinion(
            name="Sarah Johnson",
            company="Crypto Innovations",
            position="Investment Analyst",
            content="As someone who deals with algorithmic trading professionally, I'm impressed by the simplicity and power of TradeForge. It makes creating complex trading strategies accessible even to those without a technical background.",
            rating=5,
            is_published=True,
        ),
        models.Opinion(
            name="Michael Chen",
            company="Individual Investor",
            position="Retail Trader",
            content="I started using TradeForge three months ago, and it's already paying for itself. The interface is intuitive, and the ability to run multiple bots with different strategies has diversified my portfolio nicely.",
            rating=4,
            is_published=True,
        ),
    ]
    
    for opinion in opinions:
        db.add(opinion)
    
    # Commit all changes
    db.commit()

if __name__ == "__main__":
    logger.info("Creating initial data")
    init_db()
    logger.info("Initial data created") 