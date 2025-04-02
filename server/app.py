# server/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
import os
from datetime import timedelta
import json
from pymongo import MongoClient
import yfinance as yf

# Import CrewAI components
from crewai import Agent, Task, Crew
from crewai.tools import tool
from langchain_community.tools import DuckDuckGoSearchRun
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configure JWT
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-for-development')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)
jwt = JWTManager(app)

# MongoDB setup
mongo_uri = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/')
client = MongoClient(mongo_uri)
db = client.investment_advisor_db
users_collection = db.users
portfolios_collection = db.portfolios
watchlists_collection = db.watchlists

# Current date for context
Now = datetime.now()
Today = Now.strftime("%d-%b-%Y")

# Define tools for CrewAI agents

@tool("DuckDuckGo Search")
def search_tool(search_query: str):
    """Search the internet for information on a given topic"""
    return DuckDuckGoSearchRun().run(search_query)

@tool("Get current stock price")
def get_current_stock_price(symbol: str) -> str:
    """Use this function to get the current stock price for a given symbol.
    
    Args:
        symbol (str): The stock symbol.
        
    Returns:
        str: The current stock price or error message.
    """
    try:
        stock = yf.Ticker(symbol)
        current_price = stock.info.get("regularMarketPrice", stock.info.get("currentPrice"))
        return f"{current_price:.2f}" if current_price else f"Could not fetch current price for {symbol}"
    except Exception as e:
        return f"Error fetching current price for {symbol}: {e}"

@tool
def get_company_info(symbol: str):
    """Use this function to get company information and current financial snapshot for a given stock symbol.
    
    Args:
        symbol (str): The stock symbol.
        
    Returns:
        JSON containing company profile and current financial snapshot.
    """
    try:
        company_info_full = yf.Ticker(symbol).info
        if company_info_full is None:
            return f"Could not fetch company info for {symbol}"
        
        company_info_cleaned = {
            "Name": company_info_full.get("shortName"),
            "Symbol": company_info_full.get("symbol"),
            "Current Stock Price": f"{company_info_full.get('regularMarketPrice', company_info_full.get('currentPrice'))}",
            "Market Cap": f"{company_info_full.get('marketCap', company_info_full.get('enterpriseValue'))} {company_info_full.get('currency', 'USD')}",
            "Sector": company_info_full.get("sector"),
            "Industry": company_info_full.get("industry"),
            "City": company_info_full.get("city"),
            "Country": company_info_full.get("country"),
            "EPS": company_info_full.get("trailingEps"),
            "P/E Ratio": company_info_full.get("trailingPE"),
            "52 Week Low": company_info_full.get("fiftyTwoWeekLow"),
            "52 Week High": company_info_full.get("fiftyTwoWeekHigh"),
            "50 Day Average": company_info_full.get("fiftyDayAverage"),
            "200 Day Average": company_info_full.get("twoHundredDayAverage"),
            "Employees": company_info_full.get("fullTimeEmployees"),
            "Total Cash": company_info_full.get("totalCash"),
            "Free Cash Flow": company_info_full.get("freeCashflow"),
            "Operating Cash Flow": company_info_full.get("operatingCashflow"),
            "EBITDA": company_info_full.get("ebitda"),
            "Revenue Growth": company_info_full.get("revenueGrowth"),
            "Gross Margins": company_info_full.get("grossMargins"),
            "Ebitda Margins": company_info_full.get("ebitdaMargins"),
        }
        return json.dumps(company_info_cleaned)
    except Exception as e:
        return f"Error fetching company profile for {symbol}: {e}"

@tool
def get_income_statements(symbol: str):
    """Use this function to get income statements for a given stock symbol.
    
    Args:
        symbol (str): The stock symbol.
        
    Returns:
        JSON containing income statements or an empty dictionary.
    """
    try:
        stock = yf.Ticker(symbol)
        financials = stock.financials
        return financials.to_json(orient="index")
    except Exception as e:
        return f"Error fetching income statements for {symbol}: {e}"

@tool
def get_balance_sheet(symbol: str):
    """Use this function to get balance sheet data for a given stock symbol.
    
    Args:
        symbol (str): The stock symbol.
        
    Returns:
        JSON containing balance sheet data or an empty dictionary.
    """
    try:
        stock = yf.Ticker(symbol)
        balance_sheet = stock.balance_sheet
        return balance_sheet.to_json(orient="index")
    except Exception as e:
        return f"Error fetching balance sheet for {symbol}: {e}"

@tool
def get_news(symbol: str):
    """Use this function to get recent news about a given stock symbol.
    
    Args:
        symbol (str): The stock symbol.
        
    Returns:
        JSON containing news articles or an empty array.
    """
    try:
        stock = yf.Ticker(symbol)
        news = stock.news
        simplified_news = []
        for article in news[:10]:  # Limit to 10 most recent articles
            simplified_news.append({
                "title": article.get("title"),
                "publisher": article.get("publisher"),
                "link": article.get("link"),
                "publishedDate": datetime.fromtimestamp(article.get("providerPublishTime", 0)).strftime("%Y-%m-%d %H:%M:%S"),
                "type": article.get("type"),
                "relatedTickers": article.get("relatedTickers", []),
            })
        return json.dumps(simplified_news)
    except Exception as e:
        return f"Error fetching news for {symbol}: {e}"

# Define CrewAI Agents
def create_agents():
    data_collector = Agent(
        role="Financial Data Collector",
        goal="Collect comprehensive and accurate financial data for the target company.",
        backstory="""You are an expert at gathering financial data from various sources.
        You know how to retrieve and organize financial statements, stock prices, market data,
        and company information efficiently and accurately.""",
        tools=[search_tool, get_current_stock_price, get_company_info, get_income_statements, get_balance_sheet, get_news]
    )
    
    financial_analyst = Agent(
        role="Financial Analyst",
        goal="Analyze financial data and identify key insights, trends, and risks.",
        backstory="""You are a seasoned financial analyst with decades of experience in
        evaluating companies across multiple sectors. You have a keen eye for identifying
        financial strengths and weaknesses from balance sheets and income statements.""",
        tools=[search_tool]
    )
    
    investment_advisor = Agent(
        role="Investment Advisor",
        goal="Provide actionable investment recommendations based on financial analysis.",
        backstory="""You have advised numerous clients on investment decisions and portfolio
        management. You understand risk profiles, time horizons, and how to translate complex
        financial analysis into clear investment recommendations with solid reasoning.""",
        tools=[search_tool]
    )
    
    return data_collector, financial_analyst, investment_advisor

# Define CrewAI Tasks
def create_tasks(data_collector, financial_analyst, investment_advisor, company_symbol):
    data_collection_task = Task(
        description=f"""
        Collect all relevant financial information for {company_symbol}.
        This should include:
        1. Current stock price and recent price movements
        2. Company profile and basic information
        3. Key financial metrics from income statements and balance sheets
        4. Recent news and significant events
        
        Organize this information in a clear, structured format.
        """,
        agent=data_collector
    )
    
    financial_analysis_task = Task(
        description=f"""
        Analyze the financial data collected for {company_symbol}.
        Your analysis should include:
        1. Assessment of financial health and stability
        2. Evaluation of growth trends and profitability
        3. Comparison to industry benchmarks
        4. Identification of key risks and strengths
        5. Valuation assessment (e.g., P/E ratio analysis)
        
        Provide a comprehensive analysis with clear insights.
        """,
        agent=financial_analyst,
        dependencies=[data_collection_task]
    )
    
    investment_recommendation_task = Task(
        description=f"""
        Based on the financial analysis of {company_symbol}, provide:
        1. A clear investment recommendation (Buy, Hold, or Sell)
        2. Target price range
        3. Recommended time horizon
        4. Risk assessment
        5. Key factors supporting your recommendation
        6. Potential catalysts and risks to monitor
        
        Your recommendation should be well-reasoned and actionable.
        """,
        agent=investment_advisor,
        dependencies=[financial_analysis_task]
    )
    
    return data_collection_task, financial_analysis_task, investment_recommendation_task

# Auth routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validate input
    if not data or not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({"error": "Missing required fields"}), 400
    
    # Check if user already exists
    if users_collection.find_one({"email": data['email']}):
        return jsonify({"error": "User already exists"}), 409
    
    # Create new user
    user = {
        "name": data['name'],
        "email": data['email'],
        "password": generate_password_hash(data['password']),
        "created_at": datetime.now()
    }
    
    users_collection.insert_one(user)
    
    # Create empty portfolio and watchlist for the user
    portfolios_collection.insert_one({
        "user_email": data['email'],
        "stocks": [],
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    })
    
    watchlists_collection.insert_one({
        "user_email": data['email'],
        "stocks": [],
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    })
    
    # Generate token
    access_token = create_access_token(identity=data['email'])
    
    return jsonify({
        "message": "User registered successfully",
        "token": access_token,
        "user": {
            "name": user["name"],
            "email": user["email"]
        }
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Validate input
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Missing email or password"}), 400
    
    # Find user
    user = users_collection.find_one({"email": data['email']})
    
    if not user or not check_password_hash(user['password'], data['password']):
        return jsonify({"error": "Invalid credentials"}), 401
    
    # Generate token
    access_token = create_access_token(identity=data['email'])
    
    return jsonify({
        "message": "Login successful",
        "token": access_token,
        "user": {
            "name": user["name"],
            "email": user["email"]
        }
    }), 200

# Portfolio routes
@app.route('/api/portfolio', methods=['GET'])
@jwt_required()
def get_portfolio():
    user_email = get_jwt_identity()
    
    portfolio = portfolios_collection.find_one({"user_email": user_email})
    if not portfolio:
        return jsonify({"error": "Portfolio not found"}), 404
    
    # Get current price data for portfolio stocks
    portfolio_with_data = []
    for stock in portfolio['stocks']:
        try:
            ticker_data = yf.Ticker(stock['symbol'])
            current_price = ticker_data.info.get('regularMarketPrice', ticker_data.info.get('currentPrice', 0))
            
            stock_with_data = {
                **stock,
                "current_price": current_price,
                "current_value": current_price * stock['shares'],
                "gain_loss": (current_price - stock['purchase_price']) * stock['shares'],
                "gain_loss_percentage": ((current_price / stock['purchase_price']) - 1) * 100 if stock['purchase_price'] > 0 else 0
            }
            portfolio_with_data.append(stock_with_data)
        except Exception as e:
            # If there's an error fetching data, just add the stock without current data
            portfolio_with_data.append(stock)
    
    return jsonify({
        "portfolio": portfolio_with_data,
        "total_value": sum(stock.get('current_value', 0) for stock in portfolio_with_data),
        "total_invested": sum(stock['purchase_price'] * stock['shares'] for stock in portfolio['stocks']),
        "total_gain_loss": sum(stock.get('gain_loss', 0) for stock in portfolio_with_data)
    }), 200

@app.route('/api/portfolio/add', methods=['POST'])
@jwt_required()
def add_to_portfolio():
    user_email = get_jwt_identity()
    data = request.get_json()
    
    # Validate input
    if not data or not data.get('symbol') or not data.get('shares') or not data.get('purchase_price'):
        return jsonify({"error": "Missing required fields"}), 400
    
    new_stock = {
        "symbol": data['symbol'].upper(),
        "shares": float(data['shares']),
        "purchase_price": float(data['purchase_price']),
        "purchase_date": data.get('purchase_date', datetime.now().isoformat()),
        "notes": data.get('notes', '')
    }
    
    # Check if stock already exists in portfolio and update instead
    portfolio = portfolios_collection.find_one({"user_email": user_email})
    if not portfolio:
        return jsonify({"error": "Portfolio not found"}), 404
    
    existing_stock_index = next((i for i, stock in enumerate(portfolio['stocks']) 
                              if stock['symbol'] == new_stock['symbol']), None)
    
    if existing_stock_index is not None:
        # Update existing stock
        portfolio['stocks'][existing_stock_index]['shares'] += new_stock['shares']
        # Recalculate average purchase price
        total_shares = portfolio['stocks'][existing_stock_index]['shares']
        old_value = (total_shares - new_stock['shares']) * portfolio['stocks'][existing_stock_index]['purchase_price']
        new_value = new_stock['shares'] * new_stock['purchase_price']
        portfolio['stocks'][existing_stock_index]['purchase_price'] = (old_value + new_value) / total_shares
        
        portfolios_collection.update_one(
            {"user_email": user_email},
            {
                "$set": {
                    "stocks": portfolio['stocks'],
                    "updated_at": datetime.now()
                }
            }
        )
    else:
        # Add new stock
        portfolios_collection.update_one(
            {"user_email": user_email},
            {
                "$push": {"stocks": new_stock},
                "$set": {"updated_at": datetime.now()}
            }
        )
    
    return jsonify({"message": "Stock added to portfolio"}), 200

@app.route('/api/portfolio/remove', methods=['POST'])
@jwt_required()
def remove_from_portfolio():
    user_email = get_jwt_identity()
    data = request.get_json()
    
    # Validate input
    if not data or not data.get('symbol'):
        return jsonify({"error": "Stock symbol is required"}), 400
    
    symbol = data['symbol'].upper()
    shares_to_remove = float(data.get('shares', 0))
    
    portfolio = portfolios_collection.find_one({"user_email": user_email})
    if not portfolio:
        return jsonify({"error": "Portfolio not found"}), 404
    
    existing_stock_index = next((i for i, stock in enumerate(portfolio['stocks']) 
                              if stock['symbol'] == symbol), None)
    
    if existing_stock_index is None:
        return jsonify({"error": f"Stock {symbol} not found in portfolio"}), 404
    
    if shares_to_remove <= 0 or shares_to_remove >= portfolio['stocks'][existing_stock_index]['shares']:
        # Remove the entire position
        portfolio['stocks'].pop(existing_stock_index)
    else:
        # Partially reduce position
        portfolio['stocks'][existing_stock_index]['shares'] -= shares_to_remove
    
    portfolios_collection.update_one(
        {"user_email": user_email},
        {
            "$set": {
                "stocks": portfolio['stocks'],
                "updated_at": datetime.now()
            }
        }
    )
    
    return jsonify({"message": f"Stock {symbol} updated in portfolio"}), 200

# Watchlist routes
@app.route('/api/watchlist', methods=['GET'])
@jwt_required()
def get_watchlist():
    user_email = get_jwt_identity()
    
    watchlist = watchlists_collection.find_one({"user_email": user_email})
    if not watchlist:
        return jsonify({"error": "Watchlist not found"}), 404
    
    # Get current data for watchlist stocks
    watchlist_with_data = []
    for symbol in watchlist['stocks']:
        try:
            ticker_data = yf.Ticker(symbol)
            current_price = ticker_data.info.get('regularMarketPrice', ticker_data.info.get('currentPrice', 0))
            price_change = ticker_data.info.get('regularMarketChange', 0)
            price_change_percent = ticker_data.info.get('regularMarketChangePercent', 0)
            
            stock_with_data = {
                "symbol": symbol,
                "name": ticker_data.info.get('shortName', symbol),
                "current_price": current_price,
                "price_change": price_change,
                "price_change_percent": price_change_percent,
                "sector": ticker_data.info.get('sector', ''),
                "pe_ratio": ticker_data.info.get('trailingPE', 0)
            }
            watchlist_with_data.append(stock_with_data)
        except Exception as e:
            # If there's an error fetching data, just add the symbol
            watchlist_with_data.append({"symbol": symbol, "error": str(e)})
    
    return jsonify({"watchlist": watchlist_with_data}), 200

@app.route('/api/watchlist/add', methods=['POST'])
@jwt_required()
def add_to_watchlist():
    user_email = get_jwt_identity()
    data = request.get_json()
    
    # Validate input
    if not data or not data.get('symbol'):
        return jsonify({"error": "Stock symbol is required"}), 400
    
    symbol = data['symbol'].upper()
    
    # Check if symbol is valid
    try:
        ticker = yf.Ticker(symbol)
        if not ticker.info or 'symbol' not in ticker.info:
            return jsonify({"error": f"Invalid stock symbol: {symbol}"}), 400
    except Exception as e:
        return jsonify({"error": f"Error validating symbol: {str(e)}"}), 400
    
    # Add to watchlist if not already there
    result = watchlists_collection.update_one(
        {"user_email": user_email, "stocks": {"$ne": symbol}},
        {
            "$push": {"stocks": symbol},
            "$set": {"updated_at": datetime.now()}
        }
    )
    
    if result.modified_count == 0:
        return jsonify({"message": f"Stock {symbol} already in watchlist"}), 200
    
    return jsonify({"message": f"Stock {symbol} added to watchlist"}), 200

@app.route('/api/watchlist/remove', methods=['POST'])
@jwt_required()
def remove_from_watchlist():
    user_email = get_jwt_identity()
    data = request.get_json()
    
    # Validate input
    if not data or not data.get('symbol'):
        return jsonify({"error": "Stock symbol is required"}), 400
    
    symbol = data['symbol'].upper()
    
    watchlists_collection.update_one(
        {"user_email": user_email},
        {
            "$pull": {"stocks": symbol},
            "$set": {"updated_at": datetime.now()}
        }
    )
    
    return jsonify({"message": f"Stock {symbol} removed from watchlist"}), 200

# Analysis routes
@app.route('/api/analyze/<symbol>', methods=['GET'])
def analyze_stock(symbol):
    try:
        # Create agents
        data_collector, financial_analyst, investment_advisor = create_agents()
        
        # Create tasks
        data_task, analysis_task, recommendation_task = create_tasks(
            data_collector, financial_analyst, investment_advisor, symbol.upper()
        )
        
        # Create and run crew
        crew = Crew(
            agents=[data_collector, financial_analyst, investment_advisor],
            tasks=[data_task, analysis_task, recommendation_task],
            verbose=True
        )
        
        result = crew.kickoff()
        
        # Parse and structure the results
        # This is a simplified version - in production you'd want more robust parsing
        structured_result = {
            "symbol": symbol.upper(),
            "analysis_date": Today,
            "data": {},
            "analysis": {},
            "recommendation": {}
        }
        
        # Get basic stock data directly
        try:
            ticker = yf.Ticker(symbol.upper())
            info = ticker.info
            
            structured_result["data"] = {
                "company_name": info.get("shortName", ""),
                "symbol": info.get("symbol", symbol.upper()),
                "current_price": info.get("regularMarketPrice", info.get("currentPrice", 0)),
                "price_change": info.get("regularMarketChange", 0),
                "price_change_percent": info.get("regularMarketChangePercent", 0),
                "market_cap": info.get("marketCap", 0),
                "sector": info.get("sector", ""),
                "industry": info.get("industry", ""),
                "pe_ratio": info.get("trailingPE", 0),
                "dividend_yield": info.get("dividendYield", 0),
                "52_week_low": info.get("fiftyTwoWeekLow", 0),
                "52_week_high": info.get("fiftyTwoWeekHigh", 0)
            }
            
            # Get news
            news = ticker.news[:5]  # Limit to 5 most recent articles
            structured_result["data"]["news"] = []
            for article in news:
                structured_result["data"]["news"].append({
                    "title": article.get("title"),
                    "publisher": article.get("publisher"),
                    "link": article.get("link"),
                    "published_date": datetime.fromtimestamp(article.get("providerPublishTime", 0)).strftime("%Y-%m-%d")
                })
        except Exception as e:
            print(f"Error fetching direct stock data: {e}")
        
        # Extract recommendation from agent result
        # This is a simple approach - in production you'd want a more robust parser
        result_lines = result.split('\n')
        section = None
        
        for line in result_lines:
            if "RECOMMENDATION" in line.upper() or "BUY" in line.upper() or "SELL" in line.upper() or "HOLD" in line.upper():
                section = "recommendation"
                if "BUY" in line.upper():
                    structured_result["recommendation"]["action"] = "Buy"
                elif "SELL" in line.upper():
                    structured_result["recommendation"]["action"] = "Sell"
                elif "HOLD" in line.upper():
                    structured_result["recommendation"]["action"] = "Hold"
                
            if "TARGET PRICE" in line.upper() and section == "recommendation":
                parts = line.split(":")
                if len(parts) > 1:
                    price_text = parts[1].strip()
                    # Extract just the number from text like "$150.00"
                    import re
                    price_match = re.search(r'\$?(\d+(?:\.\d+)?)', price_text)
                    if price_match:
                        structured_result["recommendation"]["target_price"] = float(price_match.group(1))
            
            if "TIMEFRAME" in line.upper() or "TIME HORIZON" in line.upper() and section == "recommendation":
                if "SHORT" in line.upper():
                    structured_result["recommendation"]["time_horizon"] = "Short-term"
                elif "MEDIUM" in line.upper() or "MID" in line.upper():
                    structured_result["recommendation"]["time_horizon"] = "Medium-term"
                elif "LONG" in line.upper():
                    structured_result["recommendation"]["time_horizon"] = "Long-term"
        
        # Return both the structured result and the full text analysis
        return jsonify({
            "structured_data": structured_result,
            "full_analysis": result
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))