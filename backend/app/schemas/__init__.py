from app.schemas.user import User, UserCreate, UserUpdate
from app.schemas.auth import Token, TokenPayload, Login
from app.schemas.subscription import Subscription, SubscriptionCreate, SubscriptionUpdate
from app.schemas.indicator import Indicator, IndicatorCreate, IndicatorUpdate, BotIndicator, BotIndicatorCreate, BotIndicatorWithDetails
from app.schemas.bot import Bot, BotCreate, BotUpdate, BotStatusUpdate, BotWithIndicators
from app.schemas.backtest import Backtest, BacktestCreate, BacktestUpdate
from app.schemas.performance import Trade, TradeCreate, TradeUpdate, PerformanceSummary
from app.schemas.marketing import Tutorial, TutorialCreate, TutorialUpdate, Opinion, OpinionCreate, OpinionUpdate 